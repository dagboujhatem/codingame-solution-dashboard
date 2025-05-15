import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET || defineSecret('STRIPE_SECRET');
const stripe = new Stripe(stripeSecret, {
    apiVersion: '2023-10-16',
  });

export { stripe };
