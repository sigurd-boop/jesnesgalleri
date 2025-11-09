import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  getFirebaseInitializationError,
  getFirestoreInstance,
} from './firebase';

const COLLECTION_NAME = 'galleryItems';

type TimestampLike = {
  seconds: number;
  nanoseconds: number;
};

const toMillis = (value: unknown): number | undefined => {
  if (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    'nanoseconds' in value
  ) {
    const casted = value as TimestampLike;
    if (typeof casted.seconds === 'number' && typeof casted.nanoseconds === 'number') {
      return casted.seconds * 1000 + Math.floor(casted.nanoseconds / 1_000_000);
    }
  }

  return undefined;
};

const sanitizeString = (input: unknown): string => (typeof input === 'string' ? input : '');
const optionalString = (input: unknown): string | undefined =>
  typeof input === 'string' && input.trim().length > 0 ? input : undefined;

export const galleryCategories = ['commercial', 'collection'] as const;

export type GalleryCategory = (typeof galleryCategories)[number];

export const galleryCategoryLabels: Record<GalleryCategory, string> = {
  commercial: 'Kommersielle jobber',
  collection: 'Kolleksjon',
};

const isGalleryCategory = (value: unknown): value is GalleryCategory =>
  typeof value === 'string' && (galleryCategories as readonly string[]).includes(value);

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  modelPath: string;
  category: GalleryCategory;
  imageUrl?: string;
  createdAt?: number;
  updatedAt?: number;
};

export type GalleryItemInput = {
  title: string;
  description: string;
  modelPath: string;
  category: GalleryCategory;
  imageUrl?: string | null;
};

type GalleryItemDocument = Omit<GalleryItemInput, 'category'> & {
  category?: string;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

const mapDocument = (snapshotId: string, data: DocumentData): GalleryItem => {
  const candidate = data as GalleryItemDocument;
  const category = isGalleryCategory(candidate.category) ? candidate.category : 'collection';
  return {
    id: snapshotId,
    title: sanitizeString(candidate.title).trim(),
    description: sanitizeString(candidate.description).trim(),
    modelPath: sanitizeString(candidate.modelPath).trim(),
    category,
    imageUrl: optionalString(candidate.imageUrl),
    createdAt: toMillis(candidate.createdAt),
    updatedAt: toMillis(candidate.updatedAt),
  };
};

const getCollection = (db: Firestore) => collection(db, COLLECTION_NAME);

export const subscribeToGalleryItems = (
  onItems: (items: GalleryItem[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  const db = getFirestoreInstance();
  const initializationError = getFirebaseInitializationError();

  if (!db) {
    const error =
      initializationError ??
      new Error('Firebase er ikke konfigurert. Legg inn miljøvariabler for å bruke admin-panelet.');
    onError?.(error);
    return () => undefined;
  }

  return onSnapshot(
    getCollection(db),
    (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => mapDocument(docSnapshot.id, docSnapshot.data()));
      items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      onItems(items);
    },
    (error) => {
      onError?.(error);
    },
  );
};

const normalizeInput = (data: GalleryItemInput): GalleryItemInput => ({
  title: data.title.trim(),
  description: data.description.trim(),
  modelPath: data.modelPath.trim(),
  category: isGalleryCategory(data.category) ? data.category : 'collection',
  imageUrl: data.imageUrl ? data.imageUrl.trim() : null,
});

export const createGalleryItem = async (data: GalleryItemInput) => {
  const db = getFirestoreInstance();
  if (!db) {
    throw getFirebaseInitializationError() ?? new Error('Firebase er ikke konfigurert.');
  }

  const payload = normalizeInput(data);

  await addDoc(getCollection(db), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateGalleryItem = async (id: string, data: GalleryItemInput) => {
  const db = getFirestoreInstance();
  if (!db) {
    throw getFirebaseInitializationError() ?? new Error('Firebase er ikke konfigurert.');
  }

  const payload = normalizeInput(data);
  const reference = doc(db, COLLECTION_NAME, id);

  await updateDoc(reference, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
};

export const deleteGalleryItem = async (id: string) => {
  const db = getFirestoreInstance();
  if (!db) {
    throw getFirebaseInitializationError() ?? new Error('Firebase er ikke konfigurert.');
  }

  const reference = doc(db, COLLECTION_NAME, id);
  await deleteDoc(reference);
};
