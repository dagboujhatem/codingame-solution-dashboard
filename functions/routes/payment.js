import express from 'express';
import passport from 'passport';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

// Create Payment Intent
router.post('/create-payment-intent',
  passport.authenticate('bearer', { session: false }),
  isAdmin,
  async (req, res) => {
    try {
      const stripe = req.app.get('stripe');
      const { productId, username, email } = req.body;

      // Step 0: Get or create customer
      let customer;
      const customers = await stripe.customers.list({ email, limit: 1 });
      customer = customers.data.length > 0
        ? customers.data[0]
        : await stripe.customers.create({ email, name: username });

      // Step 1: Retrieve price for the product
      const product = await stripe.products.retrieve(productId);
      let priceId = product.default_price;

      if (!priceId) {
        const prices = await stripe.prices.list({ product: productId });
        const activePrice = prices.data.find(p => p.active);
        if (!activePrice) return res.status(404).json({ error: 'No active price found for this product' });
        priceId = activePrice.id;
      }

      const price = await stripe.prices.retrieve(priceId);
      const priceAmount = price.unit_amount;

      // Step 2: Create Payment Intent
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

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error('Payment Intent error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
