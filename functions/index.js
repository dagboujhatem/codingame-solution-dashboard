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
// Import config
import passportConfig from './config/passport.js';
// Import routers
import welcomeRouter from './routes/welcome.js';
import releaseNotesRouter from './routes/releaseNotes.js'; 
import registerRoute from './routes/register.js';
import mcoRouter from './routes/mco.js';
import profileRouter from './routes/profile.js';
import userRouter from './routes/user.js';
import subscriptionRouter from './routes/subscription.js';
import paymentRouter from './routes/payment.js';
import hookRouter from './routes/hook.js';

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET || defineSecret('STRIPE_SECRET');
const REGION = process.env.REGION || defineSecret('REGION') || 'us-central1'; // Default region

// Initialize Firebase Admin
const firebaseApp = initializeApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

setGlobalOptions({ region: REGION })

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16',
});

// Initialize Express app
const app = express();
app.set('db', db);
app.set('auth', auth);
app.set('stripe', stripe);
app.use(cors());
app.use(morgan('dev'));
app.use(compression());
app.use(passport.initialize());

// Mount routers
app.use('', welcomeRouter);
app.use('/release-notes', releaseNotesRouter(app));
app.use('/register', registerRoute);
app.use('/mco', mcoRouter);
app.use('', profileRouter);
app.use('', userRouter);
app.use('', subscriptionRouter);
app.use('', paymentRouter);
app.use('', hookRouter);

export const condingameSolutionsApi = functions.https.onRequest(app);
