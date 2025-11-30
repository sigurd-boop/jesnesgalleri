export type CollectionShowcaseItem = {
  id: string;
  title: string;
  description: string;
  modelPath?: string;
  mood: string;
  year: string;
  galleryShots: string[];
};

const shots = [
  'https://images.unsplash.com/photo-1513351105278-7ee57bb372a7?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1080&q=80',
];

export const collectionShowcase: CollectionShowcaseItem[] = [
  {
    id: 'collection-orbit',
    title: 'Orbit Study',
    description: 'High-polish sculpture that floats on a magnetic axis and reflects its environment like liquid chrome.',
    
    mood: 'Silver dusk',
    year: '2024',
    galleryShots: shots,
  },
  {
    id: 'collection-halo',
    title: 'Halo Array',
    description: 'Layered halos with etched glass and brushed steel accents inspired by brutalist skylights.',
    
    mood: 'Studio frost',
    year: '2023',
    galleryShots: shots.slice(0, 2),
  },
  {
    id: 'collection-flux',
    title: 'Flux Bloom',
    description: 'Organic bloom rendered in molten chrome — a study in flowing reflections and negative space.',
    
    mood: 'Nocturne',
    year: '2022',
    galleryShots: shots,
  },
];
