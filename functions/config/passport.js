import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';

passport.use(
  new BearerStrategy(async (token, done) => {
    try {
      const auth = req.app.get('auth');
      const decodedToken = await auth.verifyIdToken(token);
      return done(null, decodedToken);
    } catch (error) {
      console.error('Invalid token:', error.message);
      return done(null, false);
    }
  })
);

export default passport;
