import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

type Floating3DCardProps = {
  title: string;
  description?: string;
  images: string[];
  actionLabel?: string;
};

export const Floating3DCard = ({
  title,
  description,
  images,
  actionLabel = 'View gallery',
}: Floating3DCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const requestRef = useRef<number | null>(null);

  const normalizedImages = useMemo(() => {
    return images.map((image) => image.trim()).filter(Boolean);
  }, [images]);

  const galleryImages = useMemo(() => {
    return normalizedImages.length
      ? normalizedImages
      : ['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1080&q=80'];
  }, [normalizedImages]);

  // Transform images for react-image-gallery format with memoization
  const galleryItems = useMemo(
    () =>
      galleryImages.map((image) => ({
        original: image,
        thumbnail: image,
      })),
    [galleryImages],
  );

  // Handle escape key with better cleanup
  useEffect(() => {
    if (!previewOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewOpen]);

  // Optimized mouse move handler with RAF throttling
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const card = cardRef.current;
    if (!card) return;

    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
    }

    requestRef.current = requestAnimationFrame(() => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = event.clientX - left;
      const y = event.clientY - top;

      const rotateX = ((y - height / 2) / height) * 15;
      const rotateY = ((x - width / 2) / width) * -15;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      card.style.willChange = 'transform';
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
    }

    requestRef.current = requestAnimationFrame(() => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.willChange = 'auto';
    });
  }, []);

  const showPreview = useCallback(() => {
    // On mobile, auto-scroll to gallery section instead of opening preview
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      const gallerySection = document.getElementById('projects');
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    setPreviewOpen(true);
    
    // Scroll modal into view after a brief delay to allow render
    setTimeout(() => {
      modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setPreviewOpen(false);
    }
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="flex w-full justify-center px-2 sm:px-4" style={{ perspective: '1000px' }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="group relative w-full rounded-3xl border border-white/40 bg-white/80 p-6 text-left shadow-lg transition-transform duration-300 ease-out dark:border-white/20 dark:bg-[#111111]"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          <h2
            className="text-2xl font-semibold text-slate-900 dark:text-white"
            style={{ transform: 'translateZ(50px)' }}
          >
            {title}
          </h2>

          {description ? (
            <p
              className="mt-2 text-sm text-slate-600 dark:text-neutral-300"
              style={{ transform: 'translateZ(60px)' }}
            >
              {description}
            </p>
          ) : null}

          <div className="mt-6 w-full" style={{ transform: 'translateZ(90px)' }}>
            <img
              src={galleryImages[0]}
              alt={title}
              className="h-52 w-full rounded-2xl object-cover shadow-md transition-shadow duration-300 sm:h-64 group-hover:shadow-xl"
              loading="lazy"
              decoding="async"
              style={{
                willChange: 'auto',
                imageRendering: 'crisp-edges',
              }}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4" style={{ transform: 'translateZ(30px)' }}>
            <button
              type="button"
              onClick={showPreview}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:bg-slate-900 hover:text-white"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>

      {previewOpen ? (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
          style={{
            transform: 'translateZ(0)',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          <style>{`
            .image-gallery-slide img {
              max-height: calc(100vh - 120px) !important;
              width: auto !important;
              max-width: 100% !important;
              object-fit: contain !important;
              margin: 0 auto;
              image-rendering: crisp-edges;
            }
            @media (min-width: 640px) {
              .image-gallery-slide img {
                max-height: 80vh !important;
              }
            }
            .image-gallery-content {
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            /* Optimize gallery animations */
            .image-gallery {
              will-change: contents;
            }
          `}</style>

          <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] max-w-6xl flex flex-col justify-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute top-0 right-0 z-50 rounded-full bg-black/50 border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20 sm:-top-12 sm:right-0 sm:bg-transparent sm:border-white/60"
              aria-label="Close preview"
            >
              Close ×
            </button>

            {/* Gallery Container */}
            <div className="w-full h-full sm:h-auto rounded-none sm:rounded-xl overflow-hidden flex items-center justify-center">
              <ImageGallery
                items={galleryItems}
                showBullets={true}
                showThumbnails={false}
                showFullscreenButton={false}
                showPlayButton={false}
                additionalClass="w-full"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};