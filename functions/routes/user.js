import express from 'express';
import passport from 'passport';
import { isAdmin } from '../middlewares/isAdmin.js';
import checkReauth from '../middlewares/checkReauth.js';


const router = express.Router();

// GET all users
router.get('/get-users',
  passport.authenticate('bearer', { session: false }),
  isAdmin,
  checkReauth,
  async (req, res) => {
    const auth = req.app.get('auth');
    const db = req.app.get('db');
    try {
      const users = [];
      let nextPageToken;

      do {
        const result = await auth.listUsers(1000, nextPageToken);
        const fetches = result.users.map(async (userRecord) => {
          const uid = userRecord.uid;
          const role = userRecord.customClaims?.role || null;
          const userDoc = await db.collection('users').doc(uid).get();
          const firestoreData = userDoc.exists ? userDoc.data() : {};
          return {
            uid,
            email: userRecord.email,
            displayName: userRecord.displayName || '',
            role,
            ...firestoreData
          };
        });

        const usersPage = await Promise.all(fetches);
        users.push(...usersPage);
        nextPageToken = result.pageToken;
      } while (nextPageToken);

      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST add user
router.post('/add-user',
  passport.authenticate('bearer', { session: false }),
  isAdmin,
  checkReauth,
  async (req, res) => {
    const auth = req.app.get('auth');
    const db = req.app.get('db');
    try {
      const { username, email, password, role, tokens, unlimited } = req.body;
      const user = await auth.createUser({ email, password, displayName: username });
      await auth.setCustomUserClaims(user.uid, { role });
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        username,
        email,
        tokens: unlimited ? 0 : tokens,
        unlimited,
      });
      res.json({ message: 'User added successfully', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET user by UID
router.get('/get-user/:uid',
  passport.authenticate('bearer', { session: false }),
  isAdmin,
  checkReauth,
  async (req, res) => {
    const auth = req.app.get('auth');
    const db = req.app.get('db');
    try {
      const { uid } = req.params;
      const user = await auth.getUser(uid);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const userClaims = user.customClaims;
      const userData = await db.collection('users').doc(uid).get();
      res.json({ ...userData.data(), ...userClaims });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT update user by UID
router.put('/update-user/:uid',
  passport.authenticate('bearer', { session: false }),
  isAdmin,
  checkReauth,
  async (req, res) => {
    const auth = req.app.get('auth');
    const db = req.app.get('db');
    try {
      const { username, email, password, role, tokens, unlimited } = req.body;
      const uid = req.params.uid;
      const user = await auth.getUser(uid);
      // check if the user exist in auth 
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isSameUser = uid === req.user.uid;

      const updateData = { displayName: username, email };
      if (password) updateData.password = password;

      const updatedUser = await auth.updateUser(uid, updateData);

      const oldUser = await db.collection('users').doc(uid).get();
      const oldTokens = oldUser.data().tokens;

      await db.collection('users').doc(uid).update({
        username,
        email,
        tokens: unlimited ? oldTokens : tokens,
        unlimited,
      });

      const isRoleChanged = updatedUser.customClaims?.role !== role;
      if (isRoleChanged) {
        await auth.setCustomUserClaims(uid, { role });
        if (isSameUser) req.user.role = role;
      }
      // check if the user has changed the email or username 
      // if the user has changed the email or username, we need to update the user in the session 
      const isEmailChanged = email !== req.user.email;
      const isUsernameChanged = username !== req.user.name;
      if (isSameUser) {
        if (isEmailChanged) {
          req.user.email = email;
        }
        if (isUsernameChanged){ 
          req.user.name = username;
        }
      }
      
      // detect if the user has changed the password or role
      let mustLoginAgain = false;
      if (password || isRoleChanged || isEmailChanged) {
        mustLoginAgain = true;
      }
      if (mustLoginAgain) { 
        // save the user in the database
        await db.collection('users').doc(uid).update({
          mustLoginAgain,
          isLoggedOut: false,
          lastLogoutAt: null,
        });
      }
      // send the response
      if(mustLoginAgain && isSameUser){
        res.status(403).json({ message: 'User infos updated successfully', mustLoginAgain: true });
      }else{
        res.status(200).json({ message: 'User infos updated successfully' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE user by UID
router.delete('/delete-user/:uid',
  passport.authenticate('bearer', { session: false }),
  isAdmin,  
  checkReauth,
  async (req, res) => {
    const auth = req.app.get('auth');
    const db = req.app.get('db');
    try {
      const uid = req.params.uid;
      if (uid === req.user.uid) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
      }
      await auth.deleteUser(uid);
      await db.collection('users').doc(uid).delete();
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
