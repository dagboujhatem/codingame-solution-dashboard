import express from 'express';
import passport from 'passport';

const router = express.Router();

// Get authenticated user info
router.get('/get-auth-user',
  passport.authenticate('bearer', { session: false }),
  async (req, res) => {
    const auth = req.app.get('auth');
    const db = req.app.get('db');

    try {
      const user = await auth.getUser(req.user.uid);
      const userData = await db.collection('users').doc(req.user.uid).get();
      res.json({ ...userData.data(), ...user.customClaims });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update authenticated user info
router.put('/update-auth-user',
  passport.authenticate('bearer', { session: false }),
  async (req, res) => {
    const auth = req.app.get('auth');
    const db = req.app.get('db');

    try {
      const { uid } = req.user;
      const { email, username } = req.body;
      const isEmailChanged = email !== req.user.email;
      const isUsernameChanged = username !== req.user.name;

      await auth.updateUser(uid, { email, displayName: username });

      if (isEmailChanged) req.user.email = email;
      if (isUsernameChanged) req.user.name = username;

      await db.collection('users').doc(uid).update({ email, username });

      res.json({ message: 'User info updated successfully', mustLoginAgain: isEmailChanged });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update authenticated user password
router.put('/update-auth-user-password',
  passport.authenticate('bearer', { session: false }),
  async (req, res) => {
    const auth = req.app.get('auth');

    const { uid } = req.user;
    const { oldPassword, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
      const user = await auth.getUser(uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // ⚠️ Cannot validate old password via Admin SDK
      await auth.updateUser(uid, { password });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
