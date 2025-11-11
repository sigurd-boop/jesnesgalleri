import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'REDACTED_FIREBASE_API_KEY',
  authDomain: 'jesnegallery.firebaseapp.com',
  projectId: 'jesnegallery',
  storageBucket: 'jesnegallery.firebasestorage.app',
  messagingSenderId: 'REDACTED_SENDER_ID',
  appId: 'REDACTED_APP_ID',
  measurementId: 'REDACTED_MEASUREMENT_ID',
};

let app: FirebaseApp | undefined;
let analytics: Analytics | null = null;

const getFirebaseApp = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      });
    }
  }
  return app;
};

export { getFirebaseApp, analytics };
