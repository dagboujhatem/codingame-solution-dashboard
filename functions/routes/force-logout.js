import express from 'express';
const router = express.Router();
import passport from 'passport';

router.put('/save-logout',
  passport.authenticate('bearer', { session: false }),
  async (req, res) => {
    try {
      const uid  = req.user.uid;
      const db = req.app.get('db');

      // Optional: Check if req.user.uid === uid or if user is admin
      if (req.user.uid !== uid) {
        // Optionally reject if user tries to logout another user
        return res.status(403).json({ message: 'Not authorized to logout this user' });
      }

      // Update the user's "isLoggedOut" status in Firestore
      await db.collection('users').doc(uid).update({
        mustLoginAgain: false,
        isLoggedOut: true,
        lastLogoutAt: new Date().toISOString(),
      });

      res.json({ message: 'User logout status saved' });
    } catch (error) {
      console.error('Error saving logout status:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
