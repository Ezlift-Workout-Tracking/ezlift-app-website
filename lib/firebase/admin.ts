// This module is server-only. Do not import it from client components.
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';

const hasServiceAccount =
  !!process.env.FIREBASE_PROJECT_ID &&
  !!process.env.FIREBASE_CLIENT_EMAIL &&
  !!process.env.FIREBASE_PRIVATE_KEY;

let app: App | undefined;

if (!getApps().length && hasServiceAccount) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

export { app as firebaseAdminApp };


