import { setGlobalOptions } from 'firebase-functions/v2'
import { defineSecret } from 'firebase-functions/params';

const REGION = process.env.REGION || defineSecret('REGION') || 'us-central1'; // Default region

setGlobalOptions({ region: REGION })

