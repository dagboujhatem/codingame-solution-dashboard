import express from 'express';
import passport from 'passport';
import { isAdmin } from '../middlewares/isAdmin.js'; 
import checkReauth from '../middlewares/checkReauth.js';

const router = express.Router();

// Create a new product and price
router.post("/create-product",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  checkReauth,
  async (req, res) => {
    try {
      const stripe = req.app.get('stripe');
      const { name, description, price, interval } = req.body;

      const product = await stripe.products.create({ name, description });

      const priceInCents = Math.round(parseFloat(price) * 100);
      const priceData = {
        product: product.id,
        unit_amount: priceInCents,
        currency: "eur",
      };
      if (interval) {
        priceData.recurring = { interval };
      }

      const productPrice = await stripe.prices.create(priceData);

      res.json({ product, price: productPrice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update a product and its price
router.put("/update-product/:productId",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  checkReauth,
  async (req, res) => {
    try {
      const stripe = req.app.get('stripe');
      const { productId } = req.params;
      const { name, description, price, interval } = req.body;

      const updatedProduct = await stripe.products.update(productId, {
        name,
        description,
      });

      if (price) {
        const prices = await stripe.prices.list({ product: productId });
        for (const priceItem of prices.data) {
          await stripe.prices.update(priceItem.id, { active: false });
        }

        const priceInCents = Math.round(parseFloat(price) * 100);

        await stripe.prices.create({
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
  }
);

// Delete a product by deactivating its prices and product itself
router.delete("/delete-product/:productId",
  passport.authenticate("bearer", { session: false }),
  isAdmin,
  checkReauth,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const stripe = req.app.get('stripe');

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
  }
);

export default router;
