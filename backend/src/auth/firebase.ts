import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccount = require(
  path.resolve(__dirname, '../../firebase-service-account.json'),
);

console.log('Firebase project ID:', serviceAccount.project_id);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const firebaseAdmin = admin;
