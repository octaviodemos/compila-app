import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  ...(measurementId ? { measurementId } : {}),
};

const isConfigured =
  Boolean(firebaseConfig.apiKey) && Boolean(firebaseConfig.projectId);

const appInstance: FirebaseApp | null = isConfigured
  ? getApps().length > 0
    ? getApps()[0]!
    : initializeApp(firebaseConfig)
  : null;

export const app: FirebaseApp | null = appInstance;
export const auth: Auth | null = appInstance ? getAuth(appInstance) : null;
export const db: Firestore | null = appInstance ? getFirestore(appInstance) : null;
