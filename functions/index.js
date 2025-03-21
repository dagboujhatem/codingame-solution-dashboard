import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import Stripe from 'stripe';

admin.initializeApp();
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2023-10-16',
});

const app = express();
app.use(cors({ origin: true }));

// Endpoint to create a payment session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId, // This must be a Stripe Price ID
          quantity: 1,
        },
      ],
      success_url: 'https://your-app.com/success',
      cancel_url: 'https://your-app.com/cancel',
    });

    res.json({ sessionId: session.id });
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

exports.api = functions.https.onRequest(app);
