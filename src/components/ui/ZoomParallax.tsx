import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

import { cn } from '../../lib/cn';

export type ZoomParallaxImage = {
  id?: string;
  src: string;
  alt?: string;
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

  // Memoized scale values
  const scales = useMemo(() => {
    const scale3 = useTransform(easedProgress, [0, 1], [1, isMobile ? 3.3 : 3.2]);
    const scale4 = useTransform(easedProgress, [0, 1], [1, isMobile ? 3.8 : 4.1]);
    const scale45 = useTransform(easedProgress, [0, 1], [1, isMobile ? 4.2 : 4.8]);
    const scale5 = useTransform(easedProgress, [0, 1], [1, isMobile ? 4.8 : 5.4]);

    return [scale3, scale4, scale45, scale4, scale45, scale5, scale4];
  }, [easedProgress, isMobile]);

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
        {images.map(({ src, alt, id }, index) => {
          const scale = scales[index % scales.length];
          const positioningClass = positionClasses[index % positionClasses.length] || '';

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
                  src={src || '/placeholder.svg'}
                  alt={alt || 'Jesné gallery parallax'}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  style={{
                    willChange: 'auto',
                    imageRendering: 'crisp-edges',
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
            {images.length ? 'Loading assets...' : 'Shots will appear here once the gallery syncs with Firebase.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoomParallax;
