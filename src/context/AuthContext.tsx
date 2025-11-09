import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  getFirebaseAuth,
  getFirebaseInitializationError,
  isFirebaseReady,
} from '../lib/firebase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
  initializationError: Error | null;
  isAdmin: boolean;
  adminEmailsConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const extractAdminEmails = (): string[] =>
  (import.meta.env.VITE_FIREBASE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((value) => value.length > 0);

type ProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: ProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState<boolean>(isFirebaseReady());
  const [initializationError, setInitializationError] = useState<Error | null>(
    getFirebaseInitializationError(),
  );

  const adminEmails = useMemo(extractAdminEmails, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const error = getFirebaseInitializationError();
    if (error) {
      setInitializationError(error);
    }

    if (!auth) {
      setFirebaseReady(false);
      setLoading(false);
      return;
    }

    setFirebaseReady(true);

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
      (authError) => {
        console.error('Feil ved Firebase-autentisering', authError);
        setInitializationError(authError);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw getFirebaseInitializationError() ?? new Error('Firebase er ikke konfigurert riktig ennå.');
    }

    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }
    await signOut(auth);
  }, []);

  const isAdmin = useMemo(() => {
    if (!user?.email) {
      return false;
    }

    return adminEmails.includes(user.email.toLowerCase());
  }, [adminEmails, user?.email]);

  const value: AuthContextValue = {
    user,
    loading,
    firebaseReady,
    initializationError,
    isAdmin,
    adminEmailsConfigured: adminEmails.length > 0,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth må brukes sammen med AuthProvider');
  }
  return context;
};
