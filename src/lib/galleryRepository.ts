import { apiRequest } from './apiClient';

const DEFAULT_MODEL_PATH = '/models/textured.glb';
const toMillis = (value?: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const sanitizeString = (input: unknown): string => (typeof input === 'string' ? input.trim() : '');
const optionalString = (input: unknown): string | undefined => {
  if (typeof input !== 'string') {
    return undefined;
  }
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
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

type ArtworkResponseDto = {
  id: number;
  title: string;
  description: string;
  modelPath?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  imageStoragePath?: string | null;
  galleryShots?: string[] | null;
  galleryShotStoragePaths?: string[] | null;
  postedAt?: string | null;
  tags?: string[] | null;
  displayOrder?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ArtworkRequestDto = {
  title: string;
  description: string;
  modelPath: string;
  category: GalleryCategory;
  imageUrl?: string | null;
  imageStoragePath?: string | null;
  galleryShots?: string[] | null;
  galleryShotStoragePaths?: string[] | null;
  postedAt?: string | null;
  tags?: string[] | null;
  displayOrder?: number | null;
};

const mapDtoToItem = (dto: ArtworkResponseDto): GalleryItem => {
  const category = isGalleryCategory(dto.category) ? dto.category : 'collection';
  return {
    id: dto.id?.toString() ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    title: sanitizeString(dto.title),
    description: sanitizeString(dto.description),
    modelPath: optionalString(dto.modelPath) ?? DEFAULT_MODEL_PATH,
    category,
    imageUrl: optionalString(dto.imageUrl),
    imageStoragePath: optionalString(dto.imageStoragePath),
    galleryShots: optionalStringArray(dto.galleryShots),
    galleryShotStoragePaths: optionalStringArray(dto.galleryShotStoragePaths),
    postedAt: optionalString(dto.postedAt),
    tags: optionalStringArray(dto.tags),
    displayOrder:
      typeof dto.displayOrder === 'number' && !Number.isNaN(dto.displayOrder)
        ? dto.displayOrder
        : undefined,
    createdAt: toMillis(dto.createdAt),
    updatedAt: toMillis(dto.updatedAt),
  };
};

export type Unsubscribe = () => void;

export const subscribeToGalleryItems = (
  onItems: (items: GalleryItem[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  let active = true;
  let controller: AbortController | null = null;

  const fetchItems = async () => {
    if (!active) {
      return;
    }

    controller?.abort();
    controller = new AbortController();

    try {
      const response = await apiRequest<ArtworkResponseDto[]>({
        path: '/api/artworks',
        signal: controller.signal,
      });

      if (!active) {
        return;
      }

      const items = response.map(mapDtoToItem);
      items.sort((a, b) => {
        const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : Number.POSITIVE_INFINITY;
        const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : Number.POSITIVE_INFINITY;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      });

      onItems(items);
    } catch (error) {
      if (!active) {
        return;
      }
      onError?.(error as Error);
    }
  };

  void fetchItems();
  const intervalId = window.setInterval(fetchItems, 60_000);

  return () => {
    active = false;
    controller?.abort();
    window.clearInterval(intervalId);
  };
};

const normalizeInput = (data: GalleryItemInput): ArtworkRequestDto => {
  const toArray = (value?: string[] | null) =>
    value?.map((entry) => entry.trim()).filter((entry) => entry.length > 0) ?? null;

  return {
    title: data.title.trim(),
    description: data.description.trim(),
    modelPath: data.modelPath?.trim() || DEFAULT_MODEL_PATH,
    category: isGalleryCategory(data.category) ? data.category : 'collection',
    imageUrl: data.imageUrl?.trim() ?? null,
    galleryShots: toArray(data.galleryShots),
    postedAt: data.postedAt?.trim() ?? null,
    tags: toArray(data.tags),
    imageStoragePath: data.imageStoragePath?.trim() ?? null,
    galleryShotStoragePaths: toArray(data.galleryShotStoragePaths),
    displayOrder:
      typeof data.displayOrder === 'number' && !Number.isNaN(data.displayOrder) ? data.displayOrder : null,
  };
};

export const createGalleryItem = async (data: GalleryItemInput) => {
  const payload = normalizeInput(data);
  await apiRequest({
    path: '/api/artworks',
    method: 'POST',
    body: payload,
    auth: true,
  });
};

export const updateGalleryItem = async (id: string, data: GalleryItemInput) => {
  const payload = normalizeInput(data);
  await apiRequest({
    path: `/api/artworks/${id}`,
    method: 'PUT',
    body: payload,
    auth: true,
  });
};

export const deleteGalleryItem = async (id: string) => {
  await apiRequest({
    path: `/api/artworks/${id}`,
    method: 'DELETE',
    auth: true,
  });
};
