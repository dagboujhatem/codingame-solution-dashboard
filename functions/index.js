import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import passport from "passport";
// Import config
import dotenvConfig from './config/dotenv.js';
import { auth, db } from './config/firebase.js';
import passportConfig from './config/passport.js';
import  * as functionsConfig from './config/function.js';
import { stripe } from './config/stripe.js';
// Import routers
import welcomeRouter from './routes/welcome.js';
import releaseNotesRouter from './routes/releaseNotes.js'; 
import registerRoute from './routes/register.js';
import mcoRouter from './routes/mco.js';
import profileRouter from './routes/profile.js';
import userRouter from './routes/user.js';
import subscriptionRouter from './routes/subscription.js';
import paymentRouter from './routes/payment.js';
import hookRouter from './routes/hook.js';
import forceLogoutRouter from './routes/force-logout.js';
// Initialize Express app
const app = express();
app.set('db', db);
app.set('auth', auth);
app.set('stripe', stripe);
app.use(cors());
app.use(morgan('dev'));
app.use(compression());
app.use(passport.initialize());

// Mount routers
app.use('', welcomeRouter);
app.use('/release-notes', releaseNotesRouter(app));
app.use('/register', registerRoute);
app.use('/mco', mcoRouter);
app.use('', profileRouter);
app.use('', userRouter);
app.use('', subscriptionRouter);
app.use('', paymentRouter);
app.use('', hookRouter);
app.use('', forceLogoutRouter);

export const condingameSolutionsApi = functions.https.onRequest(app);
