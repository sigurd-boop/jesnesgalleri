import { useEffect, useMemo, useState, useRef } from 'react';
import { Surface } from '../components/Bits';
import { Floating3DCard } from '../components/Floating3DCard';
import { cn } from '../lib/cn';
import {
  galleryCategories,
  subscribeToGalleryItems,
  type GalleryCategory,
  type GalleryItem,
} from '../lib/galleryRepository';
import TypingAnimation from '../components/ui/typing-animation';
import ZoomParallax, { type ZoomParallaxImage } from '../components/ui/ZoomParallax';



type ItemsByCategory = Record<GalleryCategory, GalleryItem[]>;

const PROJECT_BATCH = 6;
const MAX_PARALLAX_SHOTS = 7;
const galleryFilterOptions = [
  { key: 'commercial', label: 'Commission' },
  { key: 'collection', label: 'Collection' },
  { key: 'studio', label: 'Studio' },
] as const;

type GalleryFilterKey = (typeof galleryFilterOptions)[number]['key'];

type ParallaxImage = ZoomParallaxImage & { id: string };

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<GalleryFilterKey>('commercial');
  const [projectVisible, setProjectVisible] = useState(PROJECT_BATCH);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems(
      (nextItems) => {
        setItems(nextItems);
      },
      (subscribeError) => {
        console.error('Unable to fetch gallery items from backend', subscribeError);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setProjectVisible(PROJECT_BATCH);
  }, [activeFilter]);

  const itemsByCategory = useMemo<ItemsByCategory>(() => {
    const base: ItemsByCategory = {
      commercial: [],
      collection: [],
      studio: [],
    };

    galleryCategories.forEach((category) => {
      base[category] = items.filter((item) => item.category === category);
    });

    return base;
  }, [items]);

  const commercialPosts = itemsByCategory.commercial;
  const collectionPosts = itemsByCategory.collection;
  const studioPosts = itemsByCategory.studio;

  const buildCardsFromItems = (source: GalleryItem[]) =>
    source.map((item) => {
      const shots = item.galleryShots?.length ? item.galleryShots : (item.imageUrl ? [item.imageUrl] : []);
      return {
        id: item.id ?? item.title,
        title: item.title,
        description: item.description,
        image: shots[0],
        images: shots,
      };
    });

  const filteredCards = useMemo(() => {
    if (activeFilter === 'commercial') {
      return buildCardsFromItems(commercialPosts);
    }

    if (activeFilter === 'collection') {
      return buildCardsFromItems(collectionPosts);
    }

    if (activeFilter === 'studio') {
      return buildCardsFromItems(studioPosts);
    }

    return buildCardsFromItems(commercialPosts);
  }, [activeFilter, commercialPosts, collectionPosts, studioPosts]);

  const parallaxImages = useMemo<ParallaxImage[]>(() => {
    const prioritized = items.filter((item) => galleryCategories.includes(item.category));
    const derived = prioritized.flatMap((item) => {
      const shots = item.galleryShots?.length ? item.galleryShots : (item.imageUrl ? [item.imageUrl] : []);
      return shots.map((shot, shotIndex) => ({
        id: `${item.id ?? item.title}-${shotIndex}`,
        src: shot,
        alt: item.title ? `${item.title} shot ${shotIndex + 1}` : 'Jesné gallery piece',
        // Add high quality version for first image - add quality params if it's a URL
        highQualitySrc: shotIndex === 0 && shot ? `${shot}${shot.includes('?') ? '&' : '?'}w=1600&q=95` : undefined,
      }));
    });

    return derived.slice(0, MAX_PARALLAX_SHOTS);
  }, [items]);

  // Intersection Observer for infinite scroll - set up after filteredCards is defined
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // When the observer target comes into view, load more items
        if (entry.isIntersecting && projectVisible < filteredCards.length) {
          setProjectVisible((prev) => Math.min(prev + PROJECT_BATCH, filteredCards.length));
        }
      },
      { threshold: 0.2 }, // Trigger when 20% of the element is visible
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [projectVisible, filteredCards.length]);

  const visibleCards = filteredCards.slice(0, projectVisible);

  return (
    <div className="space-y-16">
      <section className="space-y-8 pt-6 pb-2 sm:pt-10 sm:pb-4 animate-fade-in-up">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <TypingAnimation
            text="More than a hundred projects delivered, each documented in 4k film, from the first blast to the last line."
            duration={65}
            className="text-[0.78rem] leading-relaxed tracking-[0.12em] text-slate-600 sm:text-sm md:text-base md:tracking-[0.16em]"
          />
        </div>
      </section>

      <section className="space-y-8 pt-5 pb-6 sm:pt-8 lg:pt-11 lg:pb-12">
        <div className="hidden sm:block">
          <div className="relative left-1/2 w-screen -translate-x-1/2 transform">
            <ZoomParallax images={parallaxImages} height={160} />
          </div>
        </div>
        <div className="sm:hidden">
          <div className="relative left-1/2 w-screen -translate-x-1/2 transform">
            <ZoomParallax images={parallaxImages} height={140} />
          </div>
        </div>
      </section>

      <section id="projects" className="space-y-8 pt-0 animate-fade-in-up">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 px-4 sm:gap-4">
            {galleryFilterOptions.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={cn(
                  'rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] transition sm:text-sm',
                  activeFilter === key
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'border border-slate-300 text-slate-600 hover:border-slate-600 hover:text-slate-900',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {visibleCards.length ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {visibleCards.map((card) => (
              <Floating3DCard
                key={card.id}
                title={card.title}
                description={card.description}
                images={card.images}
                actionLabel={
                  activeFilter === 'commercial'
                    ? 'Preview commission'
                    : activeFilter === 'studio'
                      ? 'Preview study'
                      : 'Preview shots'
                }
              />
            ))}
          </div>
        ) : (
          <Surface variant="subtle" className="border-dashed text-sm text-slate-500">
            No entries in this category yet.
          </Surface>
        )}

        {/* Infinite scroll observer target */}
        <div ref={observerTargetRef} className="h-4" aria-hidden="true" />
      </section>
    </div>
  );
};

export default GalleryPage;
