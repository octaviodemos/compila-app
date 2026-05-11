import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth as getAuthWeb } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

function obterOuCriarApp(): FirebaseApp | null {
  if (!isConfigured) return null;
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  return initializeApp(firebaseConfig);
}

function criarAuth(app: FirebaseApp): Auth {
  if (Platform.OS === 'web') {
    return getAuthWeb(app);
  }
  type ModuloRn = {
    initializeAuth: (
      appArg: FirebaseApp,
      deps: { persistence: unknown }
    ) => Auth;
    getAuth: (appArg: FirebaseApp) => Auth;
    getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
  };
  const nativo = require('@firebase/auth') as ModuloRn;
  try {
    return nativo.initializeAuth(app, {
      persistence: nativo.getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return nativo.getAuth(app);
  }
}

const appInstance = obterOuCriarApp();

export const app: FirebaseApp | null = appInstance;
export const auth: Auth | null = appInstance ? criarAuth(appInstance) : null;
export const db: Firestore | null = appInstance ? getFirestore(appInstance) : null;
