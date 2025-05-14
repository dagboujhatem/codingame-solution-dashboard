import express from 'express';
import passport from 'passport';
import { DateTime } from 'luxon';
import { isAdmin } from '../middlewares/isAdmin.js';

const releaseNotesCollection = 'release_notes';

export default function releaseNotesRouter(app) {
  const router = express.Router();
  const db = app.get('db');

  // Middleware global : authentification + admin
  router.use(passport.authenticate('bearer', { session: false }), isAdmin);

  // Créer une release note
  router.post('/', async (req, res) => {
    try {
      const { version, force_update, features, bug_fixes, release_date  } = req.body;

      if (!version) {
        return res.status(400).json({ message: 'Version is required' });
      }

      const now = new Date();
      const newReleaseNote = {
        version,
        force_update: force_update || false,
        features: features || [],
        bug_fixes: bug_fixes || [],
        release_date: release_date ? new Date(release_date) : now,
        createdAt: now,
        updatedAt: now
      };

      await db.collection(releaseNotesCollection).doc(version).set(newReleaseNote);
      res.status(201).json({ message: 'Release note created successfully', releaseNote: newReleaseNote });
    } catch (error) {
      console.error('Error creating release note:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

  // Récupérer toutes les release notes
  router.get('/', async (req, res) => {
    try {
      const snapshot = await db.collection(releaseNotesCollection).orderBy('release_date', 'desc').get();
      const releaseNotes = snapshot.docs.map(doc => {
        // Convert Firestore Timestamps to JS Date
        const formatDate = (timestamp) => {
          if (!timestamp?.toDate) return null;
          return DateTime.fromJSDate(timestamp.toDate())
            .setZone('Europe/Paris')
            .toISO(); // or .toLocaleString(DateTime.DATETIME_MED)
        };
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          release_date: formatDate(data.release_date),
          createdAt: formatDate(data.createdAt),
          updatedAt: formatDate(data.updatedAt)
        };
      });
      res.status(200).json(releaseNotes);
    } catch (error) {
      console.error('Error fetching release notes:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

  // Récupérer une release note par version
  router.get('/:version', async (req, res) => {
    try {
      const version = req.params.version;
      const doc = await db.collection(releaseNotesCollection).doc(version).get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Release note not found' });
      }

      res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error fetching release note:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

  // Mettre à jour une release note
  router.put('/:version', async (req, res) => {
    try {
      const versionId = req.params.version;
      const { force_update, features, bug_fixes, release_date } = req.body;

      const docRef = db.collection(releaseNotesCollection).doc(versionId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Release note not found' });
      }

      const now = new Date();
      const updatedData = {
        force_update,
        features,
        bug_fixes,
        release_date: release_date ? new Date(release_date) : now,
        updatedAt: now
      };

      // Supprimer les champs undefined
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined) {
          delete updatedData[key];
        }
      });

      await docRef.update(updatedData);
      const updatedDoc = await docRef.get();

      res.status(200).json({ message: 'Release note updated successfully', releaseNote: { id: updatedDoc.id, ...updatedDoc.data() } });
    } catch (error) {
      console.error('Error updating release note:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

  // Supprimer une release note
  router.delete('/:version', async (req, res) => {
    try {
      const version = req.params.version;
      const docRef = db.collection(releaseNotesCollection).doc(version);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Release note not found' });
      }

      await docRef.delete();
      res.status(200).json({ message: 'Release note deleted successfully' });
    } catch (error) {
      console.error('Error deleting release note:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

  return router;
}
