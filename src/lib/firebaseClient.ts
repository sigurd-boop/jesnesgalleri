import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBXCOS2Jtj9mwf4jayfCXgqM0y4Z6YPoNM',
  authDomain: 'jesnegallery.firebaseapp.com',
  projectId: 'jesnegallery',
  storageBucket: 'jesnegallery.firebasestorage.app',
  messagingSenderId: '649290240903',
  appId: '1:649290240903:web:3d854066e63719afecb922',
  measurementId: 'G-BJPVRD2LGB',
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
