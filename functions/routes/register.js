import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  const auth = req.app.get('auth');
  const db = req.app.get('db');

  try {
    const { email, password, username } = req.body;

    const user = await auth.createUser({
      email,
      password,
      displayName: username,
    });

    await auth.setCustomUserClaims(user.uid, { role: 'User' });

    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email,
      username,
      tokens: 2,
      unlimited: false,
    });

    res.json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
