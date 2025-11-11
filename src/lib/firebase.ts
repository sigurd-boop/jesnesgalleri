import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const FALLBACK_CONFIG: FirebaseOptions = {
  apiKey: 'REDACTED_FIREBASE_API_KEY',
  authDomain: 'jesnegallery.firebaseapp.com',
  projectId: 'jesnegallery',
  storageBucket: 'jesnegallery.firebasestorage.app',
  messagingSenderId: 'REDACTED_SENDER_ID',
  appId: 'REDACTED_APP_ID',
};

export class FirebaseConfigError extends Error {
  constructor(missingKeys: string[]) {
    super(`Firebase-konfigurasjon mangler følgende miljøvariabler: ${missingKeys.join(', ')}`);
    this.name = 'FirebaseConfigError';
  }
}

let appInstance: FirebaseApp | null = null;
let initializationAttempted = false;
let initializationError: Error | null = null;

const firebaseOptionFromEnv = (): FirebaseOptions | null => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  } as const;

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    initializationError = new FirebaseConfigError(missing);
    console.warn(`${initializationError.message}. Bruker fallback-konfigurasjon for lokal testing.`);
    return FALLBACK_CONFIG;
  }

  return config as FirebaseOptions;
};

const ensureApp = (): FirebaseApp | null => {
  if (appInstance) {
    return appInstance;
  }

  if (initializationAttempted) {
    return null;
  }

  initializationAttempted = true;

  const options = firebaseOptionFromEnv();
  if (!options) {
    return null;
  }

  try {
    appInstance = initializeApp(options);
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error('Ukjent feil ved initialisering av Firebase');
    console.error('Klarte ikke å initialisere Firebase', initializationError);
    return null;
  }

  return appInstance;
};

export const getFirebaseAuth = (): Auth | null => {
  const app = ensureApp();
  if (!app) {
    return null;
  }
  return getAuth(app);
};

export const getFirestoreInstance = (): Firestore | null => {
  const app = ensureApp();
  if (!app) {
    return null;
  }
  return getFirestore(app);
};

export const getFirebaseInitializationError = () => initializationError;
export const isFirebaseReady = () => ensureApp() !== null;
