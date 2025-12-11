import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

import { cn } from '../../lib/cn';

export type ZoomParallaxImage = {
  id?: string;
  src: string;
  alt?: string;
  highQualitySrc?: string; // High quality version for the main image
};

// Array of positioning classes for better readability and maintenance.
const positionClasses = [
  '', // index 0: default centered position
  '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]', // index 1
  '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]', // index 2
  '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]', // index 3
  '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]', // index 4
  '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]', // index 5
  '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]', // index 6
];

const ZoomParallax = ({
  images,
  className,
  height = 200,
  mobileHeight = 140,
}: {
  images: ZoomParallaxImage[];
  className?: string;
  height?: number;
  mobileHeight?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1024 : window.innerWidth));
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadCountRef = useRef(0);

  // Optimized image preloading
  useEffect(() => {
    if (!images || images.length === 0) {
      setImagesLoaded(true);
      return;
    }

    loadCountRef.current = 0;
    const numImages = images.length;

    const handleLoadEnd = () => {
      loadCountRef.current++;
      if (loadCountRef.current === numImages) {
        setImagesLoaded(true);
      }
    };

    // Use Promise.all for more efficient loading
    const imagePromises = images.map(({ src }) => {
      if (!src) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        const onFinish = () => {
          handleLoadEnd();
          resolve();
        };
        img.onload = onFinish;
        img.onerror = onFinish;
      });
    });

    Promise.all(imagePromises).catch(() => {
      // Ensure loaded state even if promises reject
      setImagesLoaded(true);
    });
  }, [images]);

  // Optimized debounced resize handler
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setViewportWidth(window.innerWidth);
      }, 150);
    };

    // Use passive event listener
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = useMemo(() => viewportWidth < 640, [viewportWidth]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Optimized spring animation with reduced stiffness for smoother performance
  const easedProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 18,
    mass: 0.9,
  });

  // Transform scales - hooks must be called at top level with consistent count
  // Always create all scales regardless of mobile state
  const scaleDesktop3 = useTransform(easedProgress, [0, 1], [1, 3.2]);
  const scaleDesktop4 = useTransform(easedProgress, [0, 1], [1, 4.1]);
  const scaleDesktop45 = useTransform(easedProgress, [0, 1], [1, 4.8]);
  const scaleDesktop5 = useTransform(easedProgress, [0, 1], [1, 5.4]);
  
  const scaleMobile3 = useTransform(easedProgress, [0, 1], [1, 3.3]);
  const scaleMobile4 = useTransform(easedProgress, [0, 1], [1, 3.8]);
  const scaleMobile45 = useTransform(easedProgress, [0, 1], [1, 4.2]);
  const scaleMobile5 = useTransform(easedProgress, [0, 1], [1, 4.8]);

  // Memoized scale array - select based on isMobile
  const scales = useMemo(() => {
    if (isMobile) {
      return [scaleMobile3, scaleMobile4, scaleMobile45, scaleMobile4, scaleMobile45, scaleMobile5, scaleMobile4];
    }
    return [scaleDesktop3, scaleDesktop4, scaleDesktop45, scaleDesktop4, scaleDesktop45, scaleDesktop5, scaleDesktop4];
  }, [isMobile, scaleDesktop3, scaleDesktop4, scaleDesktop45, scaleDesktop5, scaleMobile3, scaleMobile4, scaleMobile45, scaleMobile5]);

  const showContent = imagesLoaded && images.length > 0;

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ height: `${isMobile ? mobileHeight : height}vh` }}
    >
      {/* Main content with GPU acceleration */}
      <div
        className={cn('sticky top-0 h-screen overflow-hidden', !showContent && 'invisible')}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {images.map(({ src, alt, id, highQualitySrc }, index) => {
          const scale = scales[index % scales.length];
          const positioningClass = positionClasses[index % positionClasses.length] || '';
          
          // Use high quality src for first image (main image), regular for others
          const isMainImage = index === 0;
          const imageSrc = isMainImage && highQualitySrc ? highQualitySrc : src;

          return (
            <motion.div
              key={id ?? src}
              style={{
                scale,
                transform: 'translateZ(0)',
                willChange: 'transform',
              }}
              className={cn('absolute top-0 flex h-full w-full items-center justify-center', positioningClass)}
            >
              <div
                className="relative h-[25vh] w-[25vw] overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/20"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                  contain: 'layout style paint',
                }}
              >
                <img
                  src={imageSrc || '/placeholder.svg'}
                  alt={alt || 'Jesné gallery parallax'}
                  className="h-full w-full object-cover"
                  loading={isMainImage ? 'eager' : 'lazy'}
                  decoding={isMainImage ? 'sync' : 'async'}
                  fetchPriority={isMainImage ? 'high' : 'auto'}
                  style={{
                    willChange: 'auto',
                    imageRendering: 'auto',
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Loading state */}
      {!showContent && (
        <div className="sticky top-0 flex h-screen items-center justify-center">
          <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            {images.length ? 'Loading assets...' : 'Gallery shots will appear here once loaded from the server.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoomParallax;
