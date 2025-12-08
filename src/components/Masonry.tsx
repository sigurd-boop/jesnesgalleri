import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

import './Masonry.css';

type MasonryItem = {
  id: string;
  img: string;
  url?: string;
  height?: number;
  title?: string;
  description?: string;
  meta?: string[];
  images?: string[];
};

type GridItem = MasonryItem & {
  x: number;
  y: number;
  w: number;
  h: number;
};

type MasonryProps = {
  items: MasonryItem[];
  duration?: number;
  stagger?: number;
  ease?: string;
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center';
  hoverScale?: number;
  onSelect?: (item: MasonryItem) => void;
};

// Custom hook for responsive columns
const useColumns = () => {
  const queries = ['(min-width:1500px)', '(min-width:1100px)', '(min-width:800px)', '(min-width:500px)'];
  const values = [5, 4, 3, 2];
  
  const getValue = () => {
    return values[queries.findIndex((query) => matchMedia(query).matches)] ?? 1;
  };
  
  const [columns, setColumns] = useState(getValue());

  useEffect(() => {
    const handler = () => setColumns(getValue());
    // Use passive event listeners for better scroll performance
    const options = { passive: true };
    queries.forEach((query) => matchMedia(query).addEventListener('change', handler, options));
    return () => queries.forEach((query) => matchMedia(query).removeEventListener('change', handler));
  }, []);

  return columns;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setSize(entry.contentRect);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
};

const Masonry = ({
  items,
  duration = 0.6,
  ease = 'power3.out',
  stagger = 0.05,
  animateFrom = 'bottom',
  hoverScale = 0.95,
  onSelect,
}: MasonryProps) => {
  const columns = useColumns();
  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const gsapContextRef = useRef<ReturnType<typeof gsap.context> | null>(null);
  const hoverTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const grid = useMemo(() => {
    if (!width) {
      return [];
    }
    const heights = Array.from({ length: columns }, () => 0);
    const columnWidth = width / columns;

    const isMobile = columns <= 2;

    return items.map((item, index) => {
      const column = heights.indexOf(Math.min(...heights));
      const x = columnWidth * column;

      // Adjust height based on screen size
      let height = isMobile ? (item.height ?? 400) / 1.2 : (item.height ?? 400) / 2;

      // On mobile: make first item (left column) even thicker
      if (isMobile && index === 0 && column === 0) {
        height = (item.height ?? 400) / 0.6;
      }

      const y = heights[column];
      heights[column] += height + 24;
      return { ...item, x, y, w: columnWidth - 12, h: height } satisfies GridItem;
    });
  }, [columns, items, width]);

  // Optimized animation setup with better GSAP context management
  useLayoutEffect(() => {
    if (gsapContextRef.current) {
      gsapContextRef.current.revert();
    }

    const ctx = gsap.context(() => {
      const animationTimeline = gsap.timeline();

      grid.forEach((item, index) => {
        const selector = `[data-masonry-id="${item.id}"]`;
        const from = (() => {
          if (animateFrom === 'top') return { x: item.x, y: -200 };
          if (animateFrom === 'left') return { x: -200, y: item.y };
          if (animateFrom === 'right') return { x: window.innerWidth + 200, y: item.y };
          if (animateFrom === 'center') return { x: width / 2 - item.w / 2, y: item.y + 80 };
          return { x: item.x, y: window.innerHeight + 200 };
        })();

        animationTimeline.fromTo(
          selector,
          { opacity: 0, ...from },
          {
            opacity: 1,
            x: item.x,
            y: item.y,
            duration,
            ease,
          },
          index * stagger,
        );
      });
    }, containerRef);

    gsapContextRef.current = ctx;

    return () => {
      ctx.revert();
      gsapContextRef.current = null;
    };
  }, [animateFrom, duration, ease, grid, stagger, width, containerRef]);

  // Optimized hover handlers with proper cleanup
  const handleMouseEnter = useCallback((itemId: string) => {
    const timeout = hoverTimeoutsRef.current.get(itemId);
    if (timeout) {
      clearTimeout(timeout);
      hoverTimeoutsRef.current.delete(itemId);
    }

    gsap.to(`[data-masonry-id="${itemId}"]`, {
      scale: hoverScale,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }, [hoverScale]);

  const handleMouseLeave = useCallback((itemId: string) => {
    const timeout = setTimeout(() => {
      gsap.to(`[data-masonry-id="${itemId}"]`, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      hoverTimeoutsRef.current.delete(itemId);
    }, 50);

    hoverTimeoutsRef.current.set(itemId, timeout);
  }, []);

  const handleClick = useCallback((item: GridItem) => {
    if (onSelect) {
      onSelect(item);
    } else if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  }, [onSelect]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      hoverTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      hoverTimeoutsRef.current.clear();
    };
  }, []);

  return (
    <div ref={containerRef} className="masonry-grid" style={{ position: 'relative' }}>
      {grid.map((item) => (
        <button
          key={item.id}
          data-masonry-id={item.id}
          type="button"
          className="masonry-item"
          style={{
            width: item.w,
            height: item.h,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          onClick={() => handleClick(item)}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={() => handleMouseLeave(item.id)}
          aria-label={item.title || 'Gallery item'}
        >
          <img
            className="masonry-img"
            src={item.img}
            loading="lazy"
            decoding="async"
            alt={item.title ?? ''}
            srcSet={`${item.img}?w=400 400w, ${item.img}?w=800 800w`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </button>
      ))}
    </div>
  );
};

export type { MasonryItem };
export default Masonry;
