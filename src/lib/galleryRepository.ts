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
const optionalStringArray = (input: unknown): string[] | undefined => {
  if (!Array.isArray(input)) {
    return undefined;
  }

  const cleaned = input
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);

  return cleaned.length ? cleaned : undefined;
};

export const galleryCategories = ['commercial', 'collection', 'studio'] as const;

export type GalleryCategory = (typeof galleryCategories)[number];

export const galleryCategoryLabels: Record<GalleryCategory, string> = {
  commercial: 'Commissioned work',
  collection: 'Collection',
  studio: 'Small works',
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
  galleryShots?: string[];
  postedAt?: string;
  tags?: string[];
  imageStoragePath?: string;
  galleryShotStoragePaths?: string[];
  displayOrder?: number;
  createdAt?: number;
  updatedAt?: number;
};

export type GalleryItemInput = {
  title: string;
  description: string;
  modelPath: string;
  category: GalleryCategory;
  imageUrl?: string | null;
  galleryShots?: string[] | null;
  postedAt?: string | null;
  tags?: string[] | null;
  imageStoragePath?: string | null;
  galleryShotStoragePaths?: string[] | null;
  displayOrder?: number | null;
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
    galleryShots: optionalStringArray(candidate.galleryShots),
    postedAt: optionalString(candidate.postedAt),
    tags: optionalStringArray(candidate.tags),
    imageStoragePath: optionalString(candidate.imageStoragePath),
    galleryShotStoragePaths: optionalStringArray(candidate.galleryShotStoragePaths),
    displayOrder:
      typeof candidate.displayOrder === 'number' && !Number.isNaN(candidate.displayOrder)
        ? candidate.displayOrder
        : undefined,
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
      new Error('Firebase is not configured. Add the environment variables to use the admin dashboard.');
    onError?.(error);
    return () => undefined;
  }

  return onSnapshot(
    getCollection(db),
    (snapshot) => {
      const items = snapshot.docs.map((docSnapshot) => mapDocument(docSnapshot.id, docSnapshot.data()));
      items.sort((a, b) => {
        const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : Number.POSITIVE_INFINITY;
        const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : Number.POSITIVE_INFINITY;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      });
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
  galleryShots: data.galleryShots?.map((entry) => entry.trim()).filter(Boolean) ?? null,
  postedAt: data.postedAt?.trim() ?? null,
  tags: data.tags?.map((entry) => entry.trim()).filter(Boolean) ?? null,
  imageStoragePath: data.imageStoragePath ? data.imageStoragePath.trim() : null,
  galleryShotStoragePaths: data.galleryShotStoragePaths?.map((entry) => entry.trim()).filter(Boolean) ?? null,
  displayOrder:
    typeof data.displayOrder === 'number' && !Number.isNaN(data.displayOrder) ? data.displayOrder : null,
});

export const createGalleryItem = async (data: GalleryItemInput) => {
  const db = getFirestoreInstance();
  if (!db) {
    throw getFirebaseInitializationError() ?? new Error('Firebase is not configured.');
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
    throw getFirebaseInitializationError() ?? new Error('Firebase is not configured.');
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
    throw getFirebaseInitializationError() ?? new Error('Firebase is not configured.');
  }

  const reference = doc(db, COLLECTION_NAME, id);
  await deleteDoc(reference);
};
