// middlewares/isAdmin.js
export function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Accès refusé : réservé aux Admins' });
    }
    next();
  };
  