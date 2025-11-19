import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { cn } from '../../lib/cn';

export type ZoomParallaxImage = {
  id?: string;
  src: string;
  alt?: string;
};

const ZoomParallaxInner = ({
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

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth < 640;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const easedProgress = useSpring(scrollYProgress, { stiffness: 85, damping: 18, mass: 0.9 });

  const scale3 = useTransform(easedProgress, [0, 1], [1, isMobile ? 3.3 : 3.2]);
  const scale4 = useTransform(easedProgress, [0, 1], [1, isMobile ? 3.8 : 4.1]);
  const scale45 = useTransform(easedProgress, [0, 1], [1, isMobile ? 4.2 : 4.8]);
  const scale5 = useTransform(easedProgress, [0, 1], [1, isMobile ? 4.8 : 5.4]);
  const scales = [scale3, scale4, scale45, scale4, scale45, scale5, scale4];

  if (!images.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        Shots will appear here once the gallery syncs with Firebase.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ height: `${isMobile ? mobileHeight : height}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {images.map(({ src, alt, id }, index) => {
          const scale = scales[index % scales.length];
          const positioningClass =
            index === 1
              ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]'
              : index === 2
                ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]'
                : index === 3
                  ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]'
                  : index === 4
                    ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]'
                    : index === 5
                      ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]'
                      : index === 6
                        ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]'
                        : '';

          return (
            <motion.div key={id ?? src} style={{ scale }} className={cn('absolute top-0 flex h-full w-full items-center justify-center', positioningClass)}>
              <div className="relative h-[25vh] w-[25vw] overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/20">
                <img src={src || '/placeholder.svg'} alt={alt || 'Jesné gallery parallax'} className="h-full w-full object-cover" loading="lazy" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const ZoomParallax = (props: { images: ZoomParallaxImage[]; className?: string; height?: number }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn('relative h-[120vh]', props.className)} />;
  }

  return <ZoomParallaxInner {...props} />;
};

export default ZoomParallax;
