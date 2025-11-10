export type StudioFeedPost = {
  id: string;
  title: string;
  caption: string;
  postedAt: string;
  images: string[];
  location?: string;
};

export const studioFeedPosts: StudioFeedPost[] = [
  {
    id: 'feed-01',
    title: 'Inking chrome splines',
    caption: 'Testing micro-surface scratches before final HDR export.',
    postedAt: '2h ago',
    location: 'Oslo',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1080&q=80',
    ],
  },
  {
    id: 'feed-02',
    title: 'Studio reflections',
    caption: 'Lighting test for the September drop — keeping the chrome liquid.',
    postedAt: '1d ago',
    images: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1513351105278-7ee57bb372a7?auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1080&q=80',
    ],
  },
  {
    id: 'feed-03',
    title: 'Material swatches',
    caption: 'Preparing brushed aluminum variants for the sculpture set.',
    postedAt: '3d ago',
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1080&q=80',
    ],
  },
];
