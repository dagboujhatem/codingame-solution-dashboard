import express from 'express';

const router = express.Router();

router.get('/welcome', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

export default router;
