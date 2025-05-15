import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// Stripe Webhook route
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // Important for Stripe signature verification
  async (req, res) => {
    try {
      const db = req.app.get('db');
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
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

export default router;
