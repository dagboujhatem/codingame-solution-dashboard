import express from 'express';

const router = express.Router();

// Make user an admin
router.put('/make-user-admin/:uid', async (req, res) => {
  const auth = req.app.get('auth');

  try {
    const { uid } = req.params;
    const user = await auth.getUser(uid);

    await auth.setCustomUserClaims(user.uid, { role: 'Admin' });

    res.json({ message: 'User added as admin successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
