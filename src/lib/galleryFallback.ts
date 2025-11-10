import type { GalleryItem } from './galleryRepository';

export const fallbackGalleryItems: GalleryItem[] = [
  {
    id: 'placeholder-commercial-1',
    title: 'Brand Echo',
    description: 'En polert 3D-identitet designet for en digital lansering.',
    modelPath: '/models/brand-echo.glb',
    category: 'commercial',
  },
  {
    id: 'placeholder-commercial-2',
    title: 'Samarbeid X',
    description: 'Konseptobjekt for en limited edition-kampanje.',
    modelPath: '/models/collab-x.glb',
    category: 'commercial',
  },
  {
    id: 'placeholder-collection-1',
    title: 'Lysvev I',
    description:
      'Organisk struktur i gjennomskinnelig glass – roterer sakte for å fremheve teksturen og lyset.',
    modelPath: '/models/artifact-01.glb',
    category: 'collection',
  },
  {
    id: 'placeholder-collection-2',
    title: 'Lysvev II',
    description: 'Intrikat komposisjon i metalliske materialer med et flytende uttrykk.',
    modelPath: '/models/artifact-02.glb',
    category: 'collection',
  },
  {
    id: 'placeholder-collection-3',
    title: 'Lysvev III',
    description: 'Minimalistisk skulptur med skarpe kanter og varme refleksjoner.',
    modelPath: '/models/artifact-03.glb',
    category: 'collection',
  },
];
