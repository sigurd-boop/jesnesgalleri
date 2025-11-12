import { useEffect, useMemo, useState } from 'react';
import { ButtonLink, Eyebrow, Muted, PageDescription, Surface } from '../components/Bits';
import TiltedCard from '../components/TiltedCard';
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
const MAX_MASONRY_SHOTS = 24;
const galleryFilterOptions = [
  { key: 'commercial', label: 'Commercial work' },
  { key: 'collection', label: 'Artworks' },
  { key: 'studio', label: 'Small works' },
] as const;

type GalleryFilterKey = (typeof galleryFilterOptions)[number]['key'];

const shuffleItems = <T,>(list: T[]): T[] => {
  const clone = [...list];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
};

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>(fallbackGalleryItems);
  const [presentation, setPresentation] = useState<ImagePresentation | null>(null);
  const [masonryPreviewImage, setMasonryPreviewImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<GalleryFilterKey>('commercial');
  const [masonryVisible, setMasonryVisible] = useState(MASONRY_BATCH);
  const [projectVisible, setProjectVisible] = useState(PROJECT_BATCH);
  const [masonryPreview, setMasonryPreview] = useState<MasonryItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems(
      (nextItems) => {
        if (nextItems.length === 0) {
          setItems(fallbackGalleryItems);
        } else {
          setItems(nextItems);
        }
      },
      (subscribeError) => {
        if (!(subscribeError instanceof FirebaseConfigError)) {
          console.error('Unable to fetch gallery items from Firestore', subscribeError);
        }
        setItems(fallbackGalleryItems);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMasonryVisible(MASONRY_BATCH);
  }, [masonryPreview]);

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

  useEffect(() => {
    const prioritized = items.filter((item) => item.category === 'commercial' || item.category === 'collection');
    const derived = prioritized.flatMap((item, itemIndex) => {
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
      setMasonryPreview(shuffleItems(derived).slice(0, MAX_MASONRY_SHOTS));
      return;
    }

    const fallbackShots = Array.from({ length: 12 }, (_, index) => ({
      id: `fallback-${index}`,
      img: fallbackImage,
      height: 360 + index * 40,
      title: 'Jesné study',
      meta: ['Placeholder'],
      images: [fallbackImage],
    }));

    setMasonryPreview(fallbackShots);
  }, [items]);

  const visibleMasonryItems = useMemo(
    () => masonryPreview.slice(0, masonryVisible),
    [masonryPreview, masonryVisible],
  );

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
  }, [activeFilter, commercialPosts]);

  const hasMoreShots = masonryVisible < masonryPreview.length;
  const visibleCards = filteredCards.slice(0, projectVisible);
  const hasMoreCards = projectVisible < filteredCards.length;

  return (
    <div className="space-y-16">
      <section className="grid gap-10 animate-fade-in-up lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div className="space-y-6">
          <Eyebrow>digital exhibition</Eyebrow>
          <ScrollFloat textClassName="text-4xl font-bold tracking-[-0.02em] text-slate-900 sm:text-5xl lg:text-6xl">
            Chrome-crafted sculptures for web and retail
          </ScrollFloat>
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

      <section className="space-y-10 pt-12 pb-32 lg:pt-16 lg:pb-48">
        <div className="space-y-6">
          <ScrollFloat
            containerClassName="mx-auto text-center max-w-[34rem] sm:max-w-[38rem] lg:max-w-[46rem]"
            textClassName="text-6xl font-bold text-slate-900 sm:text-7xl lg:text-8xl"
          >
            Chrome-crafted stories float through this gallery
          </ScrollFloat>
          <ScrollFloat
            containerClassName="mx-auto text-center max-w-[34rem] sm:max-w-[38rem] lg:max-w-[46rem]"
            textClassName="text-5xl font-semibold text-slate-500 sm:text-6xl lg:text-7xl"
          >
            Scroll to reveal live shots streaming from Firebase
          </ScrollFloat>
        </div>
        <div className="mt-6 space-y-6 hidden sm:block">
          <Masonry
            items={visibleMasonryItems}
            animateFrom="bottom"
            onSelect={(item) => {
              const previewImage = item.images?.[0] ?? item.img;
              setMasonryPreviewImage(previewImage);
            }}
          />
          {masonryPreview.length ? (
            <div className="flex justify-center">
              {hasMoreShots ? (
                <button
                  type="button"
                  onClick={() => setMasonryVisible((prev) => Math.min(prev + MASONRY_BATCH, masonryPreview.length))}
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

      <section id="projects" className="space-y-8 pt-10 animate-fade-in-up">
        <header className="space-y-6 text-center">
          <ScrollFloat
            containerClassName="mx-auto text-center max-w-[34rem] sm:max-w-[38rem] lg:max-w-[46rem]"
            textClassName="text-6xl font-bold text-slate-900 sm:text-7xl lg:text-8xl"
          >
            Gallery feed
          </ScrollFloat>
          <ScrollFloat
            containerClassName="mx-auto text-center max-w-[34rem] sm:max-w-[38rem] lg:max-w-[46rem]"
            textClassName="text-5xl font-semibold text-slate-500 sm:text-6xl lg:text-7xl"
          >
            Choose a lane: high-polish commercial drops, personal artworks, or the smaller studio experiments.
          </ScrollFloat>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {galleryFilterOptions.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={cn(
                  'rounded-full px-4 py-2 text-[0.65rem] uppercase tracking-[0.35em] transition',
                  activeFilter === key ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-500 hover:text-slate-900',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {visibleCards.length ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {visibleCards.map((card) => (
              <TiltedCard
                key={card.id}
                imageSrc={card.image}
                altText={card.title}
                captionText={card.meta?.join(' • ') || card.title}
                containerHeight="360px"
                imageHeight="360px"
                rotateAmplitude={11}
                scaleOnHover={1.12}
                displayOverlayContent
                overlayContent={
                  <div className="space-y-1 rounded-[1.5rem] bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent p-4">
                    {card.meta?.[0] ? (
                      <p className="text-[0.6rem] uppercase tracking-[0.35em] text-slate-200">{card.meta[0]}</p>
                    ) : null}
                    <p className="text-lg font-semibold text-white">{card.title}</p>
                    {card.description ? <p className="text-sm text-slate-200/90">{card.description}</p> : null}
                  </div>
                }
                onClick={() =>
                  setPresentation({
                    title: card.title,
                    description: card.description,
                    meta: card.meta,
                    images: card.images,
                  })
                }
              />
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

      {masonryPreviewImage ? (
        <MasonryPreviewDialog image={masonryPreviewImage} onClose={() => setMasonryPreviewImage(null)} />
      ) : null}
      {presentation ? <ImagePresentationDialog payload={presentation} onClose={() => setPresentation(null)} /> : null}
    </div>
  );
};

const MasonryPreviewDialog = ({ image, onClose }: { image: string; onClose: () => void }) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/80 p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-600 transition hover:border-slate-400 hover:bg-white"
        >
          Close
        </button>
        <img src={image} alt="Jesné masonry preview" className="h-full w-full object-contain" loading="lazy" />
      </div>
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
