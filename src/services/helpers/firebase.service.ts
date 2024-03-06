import * as admin from 'firebase-admin';
import { sa_cred } from '../../config/firebase.config';

admin.initializeApp({
    credential: admin.credential.cert(sa_cred),
});

export const firebaseAdmin = admin;