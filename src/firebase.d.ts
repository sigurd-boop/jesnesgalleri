declare module 'firebase/app' {
  export interface FirebaseOptions {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  }

  export interface FirebaseApp {}

  export function initializeApp(options: FirebaseOptions): FirebaseApp;
}

declare module 'firebase/auth' {
  import type { FirebaseApp } from 'firebase/app';

  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
  }

  export interface Auth {
    currentUser: User | null;
  }

  export type Unsubscribe = () => void;

  export function getAuth(app?: FirebaseApp): Auth;
  export function onAuthStateChanged(
    auth: Auth,
    nextOrObserver: (user: User | null) => void,
    error?: (error: Error) => void,
  ): Unsubscribe;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<{ user: User }>;
  export function signOut(auth: Auth): Promise<void>;
}

declare module 'firebase/firestore' {
  import type { FirebaseApp } from 'firebase/app';

  export interface Firestore {}

  export interface DocumentData {
    [field: string]: unknown;
  }

  export interface QueryDocumentSnapshot<T = DocumentData> {
    id: string;
    data(): T;
  }

  export interface QuerySnapshot<T = DocumentData> {
    docs: Array<QueryDocumentSnapshot<T>>;
  }

  export type Unsubscribe = () => void;

  export interface CollectionReference<T = DocumentData> {}

  export interface DocumentReference<T = DocumentData> {
    id: string;
  }

  export function getFirestore(app?: FirebaseApp): Firestore;
  export function collection<T = DocumentData>(db: Firestore, path: string): CollectionReference<T>;
  export function addDoc<T = DocumentData>(ref: CollectionReference<T>, data: T): Promise<DocumentReference<T>>;
  export function updateDoc<T = DocumentData>(ref: DocumentReference<T>, data: Partial<T>): Promise<void>;
  export function deleteDoc(ref: DocumentReference): Promise<void>;
  export function doc<T = DocumentData>(db: Firestore, path: string, id: string): DocumentReference<T>;
  export function onSnapshot<T = DocumentData>(
    ref: CollectionReference<T>,
    onNext: (snapshot: QuerySnapshot<T>) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe;
  export function serverTimestamp(): unknown;
}
