import * as functions from 'firebase-functions';
import { setGlobalOptions } from 'firebase-functions/v2'
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import { initializeApp } from "firebase-admin/app";
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
dotenv.config();
const stripeSecret = process.env.STRIPE_SECRET || defineSecret('STRIPE_SECRET');
const REGION = process.env.REGION || defineSecret('REGION') || 'us-central1'; // Default region
initializeApp();
setGlobalOptions({ region: REGION })

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16',
});

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(compression())

app.post("/create-product", async (req, res) => {
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

app.put("/update-product/:productId", async (req, res) => {
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

app.delete("/delete-product/:productId", async (req, res) => {
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
app.post("/create-payment-intent", async (req, res) => {
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
    await admin.firestore().collection('payments').doc(session.id).set({
      userId: session.metadata.userId,
      amount: session.amount_total,
      status: 'paid',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  res.status(200).json({ received: true });
});

export const condingameSolutionsApi = functions.https.onRequest(app);
