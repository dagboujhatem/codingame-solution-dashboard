import * as functions from 'firebase-functions';
import { setGlobalOptions } from 'firebase-functions/v2'
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from "firebase-admin/app";
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import passport from "passport";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import { isAdmin } from './middlewares/isAdmin.js';

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET || defineSecret('STRIPE_SECRET');
const REGION = process.env.REGION || defineSecret('REGION') || 'us-central1'; // Default region

// Initialize Firebase Admin
const firebaseApp = initializeApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

setGlobalOptions({ region: REGION })
passport.use(
  new BearerStrategy(async (token, done) => {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      return done(null, decodedToken);
    } catch (error) {
      console.log('error', error);
      return done(null, false);
    }
  })
);

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16',
});

// Initialize Express app
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(compression());
app.use(passport.initialize());

// register user
app.post("/register",
  async (req, res) => {

  try {
    const { email, password, username } = req.body;
    const user = await auth.createUser({
      email: email,
      password: password,
      displayName: username,
    });
    await auth.setCustomUserClaims(user.uid, { role: 'User' });
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: email,
      username: username,
      tokens: 2,
      unlimited: false, 
    });
    res.json({ message: "User created successfully", user: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// get auth user info
app.get("/get-auth-user",
  passport.authenticate("bearer", { session: false }),
  async (req, res) => {
    try { 
      const user = await auth.getUser(req.user.uid);
      const userData = await db.collection('users').doc(req.user.uid).get();
      res.json({ ...userData.data(), ...user.customClaims });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
// update auth user info
app.put("/update-auth-user",
  passport.authenticate("bearer", { session: false }),
  async (req, res) => {
    try {
      const { uid } = req.user;
      const { email, username } = req.body;
      const isEmailChanged = email !== req.user.email;
      const isUsernameChanged = username !== req.user.name;
      await auth.updateUser(uid, { email: email, displayName: username });
      // Update session details
      if (isEmailChanged) {
        req.user.email = email;
      }
      if (isUsernameChanged) {
        req.user.name = username;
      }
      // save user to firestore
      await db.collection('users').doc(uid).update({ email: email, username: username });
      res.json({ message: "User info updated successfully", mustLoginAgain: isEmailChanged });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// update auth user password
app.put("/update-auth-user-password",
  passport.authenticate("bearer", { session: false }),
  async (req, res) => {
    const { uid } = req.user;
    const { oldPassword, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await auth.getUser(uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log('user', user);
    // if (user.password !== oldPassword) {
    //   return res.status(400).json({ message: "Old password is incorrect" });
    // }
    await auth.updateUser(uid, { password: password });
    res.json({ message: "Password updated successfully" });
  });
// get all users
app.get("/get-users",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  async (req, res) => {
    const users = await db.collection('users').get();
    res.json(users.docs.map(doc => doc.data()));
  }
);

// add user
app.post("/add-user",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const { username, email, password, role, tokens, unlimited } = req.body;
      const user = await auth.createUser({
        email: email,
        password: password,
        displayName: username,
      });
      // Update user claims
      await auth.setCustomUserClaims(user.uid, {
        role: role,
      });
      // add user to firestore
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        username: username,
        email: email,
        tokens: unlimited ? 0 : tokens,
        unlimited: unlimited,
      });
      res.json({ message: "User added successfully", user: user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// get user by id
app.get("/get-user/:uid",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const { uid } = req.params;
      // get user from auth 
      const user = await auth.getUser(uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // get user claims
      const userClaims = user.customClaims;
      // get user from firestore
      const userData = await db.collection('users').doc(uid).get();
      res.json({ ...userData.data(), ...userClaims });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// update user 
app.put("/update-user/:uid",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const { username, email, password, role, tokens, unlimited } = req.body;
      const user = await auth.getUser(req.params.uid);

      // Detect if the user is the current user
      const isSameUser = user.uid === req.user.uid;

      // Prepare update data
      const updateData = {
        displayName: username,
        email: email,
      };

      // Only update password if it's provided
      if (password) {
        updateData.password = password;
      }

      const updatedUser = await auth.updateUser(user.uid, updateData);

      // Update user in firestore
      await db.collection('users').doc(user.uid).update({
        username: username,
        email: email,
        tokens: unlimited ? 0 : tokens,
        unlimited: unlimited,
      });

      // Update user claims
      const isRoleChanged = updatedUser.customClaims.role !== role;
      if (isRoleChanged) {
        await auth.setCustomUserClaims(user.uid, {
          role: role,
        });
        // Update the user in the session details
        if (isSameUser) {
          req.user.role = role;
        }
      }

      // Update the user in the session
      let mustLoginAgain = false;
      const isEmailChanged = email !== req.user.email;
      const isUsernameChanged = username !== req.user.name;
      if (isSameUser) {
        if (isEmailChanged) {
          req.user.email = email;
          mustLoginAgain = true;
        }
        if (isUsernameChanged) {
          req.user.name = username;
        }
      }
      if (password || isRoleChanged || isEmailChanged) {
        mustLoginAgain = true;
      }
      //  send response to the frontend
      res.json({ message: "User infos updated successfully", mustLoginAgain: mustLoginAgain });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.delete("/delete-user/:uid",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const user = await auth.getUser(req.params.uid);
      // Detect if the user is the current user
      const isSameUser = user.uid === req.user.uid;
      if (isSameUser) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      await auth.deleteUser(user.uid);
      await db.collection('users').doc(user.uid).delete();
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.post("/create-product",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      // Step 1: Create the product in Stripe
      const { name, description, price, interval } = req.body;
      const product = await stripe.products.create({
        name,
        description,
      });
      // Step 2: Create a price for the product
      const priceInCents = Math.round(parseFloat(price) * 100); // Amount in cents (e.g., 1000 = €10.00)
      const priceData = {
        product: product.id,
        unit_amount: priceInCents,
        currency: "eur",
      };
      if (interval) {
        priceData.recurring = { interval }; // "day", "week", "month", "year"
      }
      const productPrice = await stripe.prices.create(priceData);

      res.json({ product, price: productPrice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.put("/update-product/:productId",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { name, description, price, interval } = req.body;
      // Step 1: Update the product in Stripe
      const updatedProduct = await stripe.products.update(productId, {
        name,
        description,
      });
      // Step 2: Update a price for the product
      if (price) {
        // Disable previous price
        const prices = await stripe.prices.list({ product: productId });
        for (const price of prices.data) {
          await stripe.prices.update(price.id, { active: false });
        }
        // Define the new price
        const priceInCents = Math.round(parseFloat(price) * 100);

        const updatedPrice = await stripe.prices.create({
          product: productId,
          unit_amount: priceInCents,
          currency: "eur",
          recurring: interval ? { interval } : undefined,
        });
      }
      res.json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.delete("/delete-product/:productId",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const prices = await stripe.prices.list({ product: productId });
      for (const price of prices.data) {
        await stripe.prices.update(price.id, { active: false });
      }
      const deletedProduct = await stripe.products.update(productId, {
        active: false
      });
      res.json({ message: "Product deleted successfully", product: deletedProduct });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Create a Payment Intent based on the price.
app.post("/create-payment-intent",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const { productId, username, email } = req.body;
      // Step 0: Create a new customer if the customer does not exist
      let customer;
      const customers = await stripe.customers.list({ email: email, limit: 1 });
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: email,
          name: username,
        });
      }
      // Step 1: Retrieve the price associated with the product in Stripe
      const product = await stripe.products.retrieve(productId);
      let priceId = product.default_price;
      if (!priceId) {
        const prices = await stripe.prices.list({ product: productId });
        // Step 4: Find the first active price
        const activePrice = prices.data.find(price => price.active);
        if (activePrice) {
          priceId = activePrice.id;
        } else {
          return res.status(404).json({ error: 'No active price found for this product' });
        }
      }
      const price = await stripe.prices.retrieve(priceId);
      const priceAmount = price.unit_amount;
      // Step 2: Create a Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceAmount,
        currency: price.currency,
        customer: customer.id,
        receipt_email: email,
        capture_method: 'automatic',
        description: `Payment for ${product.name}`,
        payment_method_types: ['card'],
        metadata: {
          product_id: productId,
          quantity: 1,
        },
      });

      // Step 3: Send the client secret to the frontend for payment confirmation
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const event = req.body;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await db.collection('payments').doc(session.id).set({
      userId: session.metadata.userId,
      amount: session.amount_total,
      status: 'paid',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  res.status(200).json({ received: true });
});

export const condingameSolutionsApi = functions.https.onRequest(app);
