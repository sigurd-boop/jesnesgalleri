import { useEffect, useMemo, useState } from 'react';
import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';
import TiltedCard from '../components/TiltedCard';
import GradualBlur from '../components/GradualBlur';
import DomeGallery from '../components/DomeGallery';
import ScrollFloat from '../components/ScrollFloat';
import Masonry, { type MasonryItem } from '../components/Masonry';
import { cn } from '../lib/cn';
import {
  galleryCategories,
  subscribeToGalleryItems,
  type GalleryCategory,
  type GalleryItem,
} from '../lib/galleryRepository';
import { FirebaseConfigError } from '../lib/firebase';
import { fallbackGalleryItems } from '../lib/galleryFallback';
import { collectionShowcase } from '../data/collectionShowcase';
import { studioFeedPosts } from '../data/studioFeed';
import useBigCartelProducts from '../hooks/useBigCartelProducts';

const formatDisplayDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
};

type ItemsByCategory = Record<GalleryCategory, GalleryItem[]>;

type ImagePresentation = {
  title: string;
  description?: string;
  meta?: string[];
  images: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

const fallbackImage =
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1080&q=80';

const MASONRY_BATCH = 9;
const PROJECT_BATCH = 6;

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>(fallbackGalleryItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(true);
  const [presentation, setPresentation] = useState<ImagePresentation | null>(null);
  const [activeFilter, setActiveFilter] = useState<'commercial' | 'collection' | 'studio'>('commercial');
  const [masonryVisible, setMasonryVisible] = useState(MASONRY_BATCH);
  const [projectVisible, setProjectVisible] = useState(PROJECT_BATCH);

  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems(
      (nextItems) => {
        if (nextItems.length === 0) {
          setItems(fallbackGalleryItems);
          setUsingFallback(true);
        } else {
          setItems(nextItems);
          setUsingFallback(false);
        }
        setError(null);
        setLoading(false);
      },
      (subscribeError) => {
        if (!(subscribeError instanceof FirebaseConfigError)) {
          console.error('Unable to fetch gallery items from Firestore', subscribeError);
        }
        setError(
          subscribeError instanceof FirebaseConfigError
            ? 'Firebase is not configured yet. Showing placeholder projects.'
            : subscribeError.message || 'Unable to reach Firestore. Showing placeholder projects instead.',
        );
        setItems(fallbackGalleryItems);
        setUsingFallback(true);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMasonryVisible(MASONRY_BATCH);
  }, [items]);

  useEffect(() => {
    setProjectVisible(PROJECT_BATCH);
  }, [activeFilter]);

  const itemsByCategory = useMemo<ItemsByCategory>(
    () =>
      galleryCategories.reduce<ItemsByCategory>(
        (accumulator, category) => {
          accumulator[category] = items.filter((item) => item.category === category);
          return accumulator;
        },
        { commercial: [], collection: [] },
      ),
    [items],
  );

  const commercialPosts = itemsByCategory.commercial;

  const masonryItems = useMemo<MasonryItem[]>(() => {
    const derived = items.flatMap((item, itemIndex) => {
      const shots = item.galleryShots?.length ? item.galleryShots : [fallbackImage];
      return shots.map((shot, shotIndex) => ({
        id: `${item.id ?? item.title}-${shotIndex}`,
        img: shot,
        height: 320 + ((itemIndex + shotIndex) % 3) * 120,
        title: item.title,
        description: item.description,
        meta: [formatDisplayDate(item.postedAt) ?? 'Draft', item.tags?.length ? item.tags.join(', ') : null].filter(Boolean) as string[],
        images: shots,
      }));
    });

    if (derived.length) {
      return derived;
    }

    return Array.from({ length: 6 }, (_, index) => ({
      id: `fallback-${index}`,
      img: fallbackImage,
      height: 360 + index * 40,
      title: 'Jesné study',
      meta: ['Placeholder'],
      images: [fallbackImage],
    }));
  }, [items]);

  const visibleMasonryItems = masonryItems.slice(0, masonryVisible);

  const filteredCards = useMemo(() => {
    if (activeFilter === 'commercial') {
      return commercialPosts.map((item) => {
        const shots = item.galleryShots?.length ? item.galleryShots : [fallbackImage];
        return {
          id: item.id ?? item.title,
          title: item.title,
          description: item.description,
          meta: [formatDisplayDate(item.postedAt) ?? 'Draft', item.tags?.length ? item.tags.join(', ') : null].filter(Boolean) as string[],
          image: shots[0],
          images: shots,
        };
      });
    }

    if (activeFilter === 'collection') {
      return collectionShowcase.map((item) => {
        const shots = item.galleryShots?.length ? item.galleryShots : [fallbackImage];
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          meta: [`Year ${item.year}`, `Mood ${item.mood}`],
          image: shots[0],
          images: shots,
        };
      });
    }

    return studioFeedPosts.map((post) => {
      const shots = post.images.length ? post.images : [fallbackImage];
      return {
        id: post.id,
        title: post.title,
        description: post.caption,
        meta: [post.postedAt, post.location ? `Location ${post.location}` : null].filter(Boolean) as string[],
        image: shots[0],
        images: shots,
      };
    });
  }, [activeFilter, collectionShowcase, commercialPosts, studioFeedPosts]);

  const hasMoreShots = masonryVisible < masonryItems.length;
  const visibleCards = filteredCards.slice(0, projectVisible);
  const hasMoreCards = projectVisible < filteredCards.length;

  return (
    <div className="space-y-16">
      <section className="grid gap-10 animate-fade-in-up lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div className="space-y-6">
          <Eyebrow>digital exhibition</Eyebrow>
          <PageTitle>Chrome-crafted sculptures for web and retail</PageTitle>
          <PageDescription>
            The chrome GLB in the header keeps the brand alive in real time, while the rest of the gallery focuses on
            editorial content that loads instantly on every device. Scroll through commissioned pieces, the Jesnes
            collection, and a preview of the BigCartel shop pipeline.
          </PageDescription>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="#projects" tone="neutral">
              Browse projects
            </ButtonLink>
            <ButtonLink href="/shop">
              Visit shop
            </ButtonLink>
          </div>
        </div>
        <ShopSpotlight />
      </section>

      <section className="space-y-10">
        <div className="space-y-6">
          <ScrollFloat textClassName="text-slate-900">
            Chrome-crafted stories float through this gallery
          </ScrollFloat>
          <ScrollFloat textClassName="text-slate-500">
            Scroll to reveal live shots streaming from Firebase
          </ScrollFloat>
        </div>
        <div className="mt-6 space-y-6">
          <Masonry
            items={visibleMasonryItems}
            animateFrom="bottom"
            onSelect={(item) =>
              setPresentation({
                title: item.title ?? 'Jesné gallery piece',
                description: item.description,
                meta: item.meta,
                images: item.images ?? [item.img],
              })
            }
          />
          {masonryItems.length ? (
            <div className="flex justify-center">
              {hasMoreShots ? (
                <button
                  type="button"
                  onClick={() => setMasonryVisible((prev) => Math.min(prev + MASONRY_BATCH, masonryItems.length))}
                  className="rounded-full border border-slate-300 px-6 py-2 text-xs uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-500 hover:text-slate-900"
                >
                  Load more shots
                </button>
              ) : (
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">No more shots in this batch</p>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section id="projects" className="space-y-8 animate-fade-in-up">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-slate-900">Curated projects</h2>
            <Muted>Tap a category to filter the commissions, collection stories, or studio feed drops.</Muted>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['commercial', 'collection', 'studio'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setActiveFilter(option)}
                className={cn(
                  'rounded-full px-4 py-2 text-[0.65rem] uppercase tracking-[0.35em] transition',
                  activeFilter === option ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-500 hover:text-slate-900',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </header>

        {visibleCards.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleCards.map((card) => (
              <Surface
                key={card.id}
                className={cn('flex h-full flex-col gap-4 p-0 transition duration-300 hover:-translate-y-1.5', 'animate-fade-in-up')}
                onClick={() =>
                  setPresentation({
                    title: card.title,
                    description: card.description,
                    meta: card.meta,
                    images: card.images,
                  })
                }
              >
                <div className="overflow-hidden rounded-[1.75rem]">
                  <img src={card.image} alt={card.title} className="h-72 w-full object-cover" loading="lazy" />
                </div>
                <div className="space-y-2 px-6 pb-6">
                  {card.meta?.[0] ? (
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{card.meta[0]}</p>
                  ) : null}
                  <h3 className="text-xl font-semibold text-slate-900">{card.title}</h3>
                  {card.description ? <Muted>{card.description}</Muted> : null}
                  {card.meta?.length ? (
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      {card.meta.slice(1).join(' • ')}
                    </div>
                  ) : null}
                </div>
              </Surface>
            ))}
          </div>
        ) : (
          <Surface variant="subtle" className="border-dashed text-sm text-slate-500">
            No entries in this category yet.
          </Surface>
        )}

        {filteredCards.length ? (
          <div className="flex justify-center">
            {hasMoreCards ? (
              <button
                type="button"
                onClick={() => setProjectVisible((prev) => Math.min(prev + PROJECT_BATCH, filteredCards.length))}
                className="rounded-full border border-slate-300 px-6 py-2 text-xs uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-500 hover:text-slate-900"
              >
                Load more projects
              </button>
            ) : (
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">You reached the end</p>
            )}
          </div>
        ) : null}
      </section>

      {presentation ? <ImagePresentationDialog payload={presentation} onClose={() => setPresentation(null)} /> : null}
    </div>
  );
};

const ImagePresentationDialog = ({
  payload,
  onClose,
}: {
  payload: ImagePresentation;
  onClose: () => void;
}) => {
  const images = payload.images.length ? payload.images : [fallbackImage];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [payload]);

  const handleStep = (direction: number) => {
    setIndex((previous) => (previous + direction + images.length) % images.length);
  };

  const activeImage = images[index];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm sm:items-center">
      <Surface className="relative w-full max-w-4xl space-y-5 overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-500 hover:border-slate-300 hover:text-slate-900"
        >
          Close
        </button>
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-black/80">
          <img src={activeImage} alt={payload.title} className="max-h-[70vh] w-full object-cover" loading="lazy" />
          {images.length > 1 ? (
            <div className="absolute inset-0 flex items-center justify-between px-4 text-white">
              <button
                type="button"
                onClick={() => handleStep(-1)}
                className="rounded-full bg-black/40 px-3 py-2 text-lg backdrop-blur"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => handleStep(1)}
                className="rounded-full bg-black/40 px-3 py-2 text-lg backdrop-blur"
              >
                ›
              </button>
            </div>
          ) : null}
          {images.length > 1 ? (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, dotIndex) => (
                <span
                  key={dotIndex}
                  className={cn(
                    'h-1.5 w-6 rounded-full bg-white/40 transition-opacity',
                    dotIndex === index ? 'bg-white/90' : 'opacity-60',
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-slate-900">{payload.title}</h3>
          {payload.description ? <Muted>{payload.description}</Muted> : null}
          {payload.meta?.length ? (
            <ul className="space-y-1 text-sm text-slate-600">
              {payload.meta.map((metaItem) => (
                <li key={metaItem} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  {metaItem}
                </li>
              ))}
            </ul>
          ) : null}
          {payload.ctaHref ? (
            <ButtonLink href={payload.ctaHref} target="_blank" rel="noreferrer">
              {payload.ctaLabel ?? 'Open link'}
            </ButtonLink>
          ) : null}
        </div>
      </Surface>
    </div>
  );
};

const ShopSpotlight = () => {
  const { products, loading, error } = useBigCartelProducts();
  const formatPrice = (price: string) => {
    const value = Number(price);
    if (Number.isNaN(value)) {
      return price;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const cards = products.length ? products.slice(0, 4) : [];

  return (
    <Surface className="space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">BigCartel preview</p>
          <h3 className="text-lg font-semibold text-slate-900">Shop highlight</h3>
        </div>
        {loading ? <span className="text-xs text-slate-500">Syncing…</span> : null}
      </div>

      {cards.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((product) => (
            <Surface key={product.id} className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/80">
                <img
                  src={product.images?.[0]?.secure_url ?? fallbackImage}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{formatPrice(product.price)}</p>
                <h4 className="text-lg font-semibold text-slate-900">{product.name}</h4>
              </div>
              <ButtonLink href={`https://jesne.bigcartel.com${product.url}`} target="_blank" rel="noreferrer" className="w-full">
                View product
              </ButtonLink>
            </Surface>
          ))}
        </div>
      ) : (
        <Surface variant="subtle" className="border-dashed text-sm text-slate-500">
          {error ? 'No products available right now.' : 'Add items to your BigCartel store to surface them here.'}
        </Surface>
      )}

      {error && !loading ? <Muted className="text-xs text-amber-600">{error}</Muted> : null}
    </Surface>
  );
};

export default GalleryPage;
