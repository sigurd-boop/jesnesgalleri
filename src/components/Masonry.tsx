import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

const useColumns = () => {
  const queries = ['(min-width:1500px)', '(min-width:1100px)', '(min-width:800px)', '(min-width:500px)'];
  const values = [5, 4, 3, 2];
  const getValue = () => values[queries.findIndex((query) => matchMedia(query).matches)] ?? 1;
  const [columns, setColumns] = useState(getValue);

  useEffect(() => {
    const handler = () => setColumns(getValue());
    queries.forEach((query) => matchMedia(query).addEventListener('change', handler));
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
          height = (item.height ?? 400) / 0.6; // Much thicker for the door image on mobile
        }
        
        const y = heights[column];
        heights[column] += height + 24;
        return { ...item, x, y, w: columnWidth - 12, h: height } satisfies GridItem;
      });
    }, [columns, items, width]);
  
    useLayoutEffect(() => {
      const ctx = gsap.context(() => {
        grid.forEach((item, index) => {
          const selector = `[data-masonry-id="${item.id}"]`;
          const from = (() => {
            if (animateFrom === 'top') return { x: item.x, y: -200 };
            if (animateFrom === 'left') return { x: -200, y: item.y };
            if (animateFrom === 'right') return { x: window.innerWidth + 200, y: item.y };
            if (animateFrom === 'center') return { x: width / 2 - item.w / 2, y: item.y + 80 };
            return { x: item.x, y: window.innerHeight + 200 };
          })();
  
          gsap.fromTo(
            selector,
            { opacity: 0, ...from },
            {
              opacity: 1,
              x: item.x,
              y: item.y,
              duration,
              ease,
              delay: index * stagger,
            },
          );
        });
      }, containerRef);
  
      return () => ctx.revert();
    }, [animateFrom, duration, ease, grid, stagger, width, containerRef]);
  
    return (
      <div ref={containerRef} className="masonry-grid">
        {grid.map((item) => (
          <button
            key={item.id}
            data-masonry-id={item.id}
            type="button"
            className="masonry-item"
            style={{ width: item.w, height: item.h }}
            onClick={() => {
              if (onSelect) {
                onSelect(item);
              } else if (item.url) {
                window.open(item.url, '_blank', 'noopener,noreferrer');
              }
            }}
            onMouseEnter={() =>
              gsap.to(`[data-masonry-id="${item.id}"]`, {
                scale: hoverScale,
                duration: 0.3,
                ease: 'power2.out',
              })
            }
            onMouseLeave={() =>
              gsap.to(`[data-masonry-id="${item.id}"]`, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
              })
            }
          >
            <img
              className="masonry-img"
              src={item.img}
              loading="lazy"
              alt={item.title ?? ''}
            />
          </button>
        ))}
      </div>
    );
  
};

export type { MasonryItem };
export default Masonry;
