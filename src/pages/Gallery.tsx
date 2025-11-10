import { useEffect, useMemo, useState } from 'react';
import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';
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
import { studioFeedPosts, type StudioFeedPost } from '../data/studioFeed';
import useShopHighlights, { type ShopHighlightState } from '../hooks/useShopHighlights';

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

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>(fallbackGalleryItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(true);
  const [presentation, setPresentation] = useState<ImagePresentation | null>(null);
  const shopHighlights = useShopHighlights();

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
            <ButtonLink href="#commissioned" tone="neutral">
              Commissioned feed
            </ButtonLink>
            <ButtonLink href="https://jesnesgalleri.bigcartel.com" target="_blank" rel="noreferrer">
              Visit shop
            </ButtonLink>
          </div>
        </div>
        <ShopSpotlight {...shopHighlights} />
      </section>

      <section id="commissioned" className="space-y-8 animate-fade-in-up">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-slate-900">Commissioned work</h2>
            <Muted>
              Posts are editable from the admin dashboard. Tap a card to read the story, dates, and attachable campaign
              imagery. Animations are paused for a calm, editorial look.
            </Muted>
          </div>
          <ButtonLink tone="neutral" href={error ? '#guide' : '#collection'}>
            {error ? 'See setup guide' : 'Jump to collection'}
          </ButtonLink>
        </header>

        {commercialPosts.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {commercialPosts.map((item) => (
            <Surface
              key={item.id ?? item.title}
              className={cn(
                'flex h-full flex-col gap-4 p-0 transition duration-300 hover:-translate-y-1.5',
                'animate-fade-in-up',
              )}
              onClick={() =>
                setPresentation({
                  title: item.title,
                  description: item.description,
                  meta: [
                    formatDisplayDate(item.postedAt) ?? 'Draft',
                    item.tags?.length ? `Tags: ${item.tags.join(', ')}` : null,
                    `Model: ${item.modelPath}`,
                  ].filter(Boolean) as string[],
                  images: item.galleryShots?.length ? item.galleryShots : [fallbackImage],
                })
              }
            >
              <div className="overflow-hidden rounded-[1.75rem]">
                <img
                  src={item.galleryShots?.[0] ?? fallbackImage}
                  alt={item.title}
                  className="h-72 w-full object-cover"
                  loading="lazy"
                />
              </div>
                <div className="space-y-2 px-6 pb-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                    {formatDisplayDate(item.postedAt) ?? 'Draft'}
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <Muted>{item.description}</Muted>
                  {item.tags?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Surface>
            ))}
          </div>
        ) : (
          <Surface variant="subtle" className="border-dashed text-sm text-slate-500">
            No commissioned posts yet. Use the admin dashboard to publish the first entry.
          </Surface>
        )}
      </section>

      <section id="collection" className="space-y-10 animate-fade-in-up">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-slate-900">Collection — fixed set</h2>
          <Muted>
            This section preserves the Jesnes signature pieces as static stories. Admins can update captions and imagery, but
            the GLB itself lives solely in the hero logo for performance.
          </Muted>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {collectionShowcase.map((item) => (
            <Surface
              key={item.id}
              className={cn(
                'flex h-full flex-col gap-4 p-0 transition duration-300 hover:-translate-y-1.5',
                'animate-fade-in-up',
              )}
              onClick={() =>
                setPresentation({
                  title: item.title,
                  description: item.description,
                  meta: [`Year: ${item.year}`, `Mood: ${item.mood}`],
                  images: item.galleryShots?.length ? item.galleryShots : [fallbackImage],
                })
              }
            >
              <div className="overflow-hidden rounded-[1.75rem] bg-white/70">
                <img
                  src={item.galleryShots?.[0] ?? fallbackImage}
                  alt={item.title}
                  className="h-72 w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="space-y-3 px-6 pb-6">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{item.year}</p>
                <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                <Muted>{item.description}</Muted>
                <p className="text-sm font-medium text-slate-600">Mood: {item.mood}</p>
              </div>
            </Surface>
          ))}
        </div>

        <StudioFeed
          onOpen={(post) =>
            setPresentation({
              title: post.title,
              description: post.caption,
              meta: [post.postedAt, post.location ? `Location: ${post.location}` : null].filter(Boolean) as string[],
              images: post.images.length ? post.images : [fallbackImage],
            })
          }
        />
      </section>

      <Surface id="guide" variant="subtle" className="space-y-4 border-dashed">
        <h3 className="text-lg font-semibold text-slate-900">How to update the chrome logo GLB</h3>
        <ol className="space-y-3 text-sm text-slate-600">
          <li>1. Drop the new GLB inside <code className="font-mono text-xs">public/models</code> and update the header path.</li>
          <li>2. Commissioned posts and collection entries use static imagery for speed; update those via Firestore or the admin view.</li>
          <li>3. Keep feed images under 2MB each so the experience stays silky on mobile.</li>
        </ol>
        {error ? <Muted className="text-xs text-rose-600">{error}</Muted> : null}
        {loading && !error ? <Muted className="text-xs">Loading data from Firestore…</Muted> : null}
        {!loading && usingFallback && !error ? (
          <Muted className="text-xs">Showing placeholder content until Firestore is connected.</Muted>
        ) : null}
      </Surface>

      {presentation ? <ImagePresentationDialog payload={presentation} onClose={() => setPresentation(null)} /> : null}
    </div>
  );
};

type ShopSpotlightProps = ShopHighlightState;

const ShopSpotlight = ({ loading, products, error }: ShopSpotlightProps) => {
  const featured = products[0];

  return (
    <Surface className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">BigCartel preview</p>
          <h3 className="text-lg font-semibold text-slate-900">Shop highlight</h3>
        </div>
        {loading ? <span className="text-xs text-slate-500">Syncing…</span> : null}
      </div>
      {featured ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/60">
            <img
              src={featured.imageUrl}
              alt={featured.title}
              className="h-48 w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{featured.status === 'sold' ? 'Sold out' : 'Available'}</p>
            <p className="text-xl font-semibold text-slate-900">{featured.title}</p>
            <p className="text-sm text-slate-600">{featured.price}</p>
          </div>
          <ButtonLink href={featured.url} target="_blank" rel="noreferrer">
            Shop highlight
          </ButtonLink>
        </div>
      ) : (
        <Muted>No products yet. Connect the BigCartel API to surface featured items.</Muted>
      )}
      {error ? <Muted className="text-xs text-amber-600">{error}</Muted> : null}
    </Surface>
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

const StudioFeed = ({ onOpen }: { onOpen: (post: StudioFeedPost) => void }) => {
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});

  const handleStep = (postId: string, direction: number, total: number) => {
    setActiveImageIndex((previous) => {
      const nextIndex = ((previous[postId] ?? 0) + direction + total) % total;
      return { ...previous, [postId]: nextIndex };
    });
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Studio feed</p>
          <h3 className="text-xl font-semibold text-slate-900">Instagram-ready stories</h3>
        </div>
        <Muted className="text-sm">
          Swipe horizontally on mobile. Admins can keep this feed fresh without touching the collection.
        </Muted>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {studioFeedPosts.map((post) => {
          const images = post.images.length ? post.images : ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1080&q=80'];
          const index = activeImageIndex[post.id] ?? 0;
          const activeImage = images[index];
          return (
            <article
              key={post.id}
              className="min-w-[260px] max-w-[260px] flex-shrink-0 rounded-[2rem] border border-slate-200/60 bg-white/80 p-4 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.75)]"
              onClick={() => onOpen(post)}
            >
              <div className="relative overflow-hidden rounded-2xl">
                <img src={activeImage} alt={post.title} className="h-56 w-full object-cover" loading="lazy" />
                {images.length > 1 ? (
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-white">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStep(post.id, -1, images.length);
                      }}
                      className="rounded-full bg-black/40 px-2 py-1 text-xs backdrop-blur"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStep(post.id, 1, images.length);
                      }}
                      className="rounded-full bg-black/40 px-2 py-1 text-xs backdrop-blur"
                    >
                      ›
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{post.postedAt}</p>
                <h4 className="text-base font-semibold text-slate-900">{post.title}</h4>
                <p className="text-sm text-slate-600">{post.caption}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default GalleryPage;
