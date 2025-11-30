import type { GalleryItem } from './galleryRepository';

// No backend-stored default model path; fallback items omit modelPath and frontend uses its own placeholder if needed.
const defaultShots = [
  'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1080&q=80',
];

export const fallbackGalleryItems: GalleryItem[] = [
  {
    id: 'placeholder-commercial-1',
    title: 'Brand Echo',
    description: 'Polished 3D identity work created for a digital product launch.',
    
    category: 'commercial',
    tags: ['identity', 'launch', 'chrome'],
    galleryShots: defaultShots,
  },
  {
    id: 'placeholder-commercial-2',
    title: 'Collab X',
    description: 'Limited edition collaboration object designed for a capsule drop.',
    
    category: 'commercial',
    tags: ['collaboration', 'capsule'],
    galleryShots: defaultShots.slice(0, 2),
  },
  {
    id: 'placeholder-collection-1',
    title: 'Lightweave I',
    description: 'Translucent glass sculpture that catches soft studio reflections.',
    
    category: 'collection',
    tags: ['glass', 'weave'],
    galleryShots: defaultShots,
  },
  {
    id: 'placeholder-collection-2',
    title: 'Lightweave II',
    description: 'Metallic composition with flowing, ribbon-like edges.',
    category: 'collection',
    tags: ['metal', 'motion'],
    galleryShots: defaultShots,
  },
  {
    id: 'placeholder-collection-3',
    title: 'Lightweave III',
    description: 'Minimal sculpture with sharp silhouettes and warm reflections.',
    category: 'collection',
    tags: ['minimal', 'sculpture'],
    galleryShots: defaultShots,
  },
];
