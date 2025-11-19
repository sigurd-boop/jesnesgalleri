import { useEffect, useMemo, useRef } from 'react';
import { cn } from '../../lib/cn';

import './MetallicTiltCard.css';

type Metal = 'gold' | 'silver' | 'bronze' | 'platinum';

const METAL_BG: Record<Metal, string> = {
  gold: '#ffcc70',
  silver: '#dddde0',
  bronze: '#df9070',
  platinum: '#ffffff',
};

export type MetallicTiltCardProps = {
  metal?: Metal;
  width?: number | string;
  radius?: number;
  maxRotation?: number;
  influenceRadius?: number;
  ease?: number;
  lightFollow?: number;
  mode?: 'light' | 'dark' | 'system';
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
};

export const MetallicTiltCard = ({
  metal = 'platinum',
  width = 'min(100%, 820px)',
  radius = 28,
  maxRotation = 32,
  influenceRadius = 520,
  ease = 0.08,
  lightFollow = 0.4,
  mode = 'system',
  className,
  ariaLabel = 'Metallic tilt card',
  children,
}: MetallicTiltCardProps) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const ids = useMemo(() => {
    const k = Math.random().toString(36).slice(2, 8);
    return { noise: `noiseFilter-${k}` };
  }, []);

  const current = useRef({ angle: 0, x: 0, y: 0 });
  const target = useRef({ angle: 0, x: 0, y: 0 });
  const currentG = useRef({ x: 50, y: 50 });
  const targetG = useRef({ x: 50, y: 50 });
  const rafRef = useRef<number | null>(null);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const applyVars = () => {
    const host = wrapRef.current;
    if (!host) {
      return;
    }
    host.style.setProperty('--gradient-rotation', `${current.current.angle}deg`);
    host.style.setProperty('--rotate-x', `${current.current.x}deg`);
    host.style.setProperty('--rotate-y', `${current.current.y}deg`);
    host.style.setProperty('--gradient-position-x', `${currentG.current.x}%`);
    host.style.setProperty('--gradient-position-y', `${currentG.current.y}%`);
    host.style.setProperty('--card-width', typeof width === 'number' ? `${width}px` : width);
    host.style.setProperty('--border-radius', `${radius}px`);
    host.style.setProperty('--bg-card', METAL_BG[metal]);
    host.style.setProperty('--noise-filter', `url(#${ids.noise})`);
  };

  const tick = () => {
    const t = ease;
    current.current.angle = lerp(current.current.angle, target.current.angle, t);
    current.current.x = lerp(current.current.x, target.current.x, t);
    current.current.y = lerp(current.current.y, target.current.y, t);
    currentG.current.x = lerp(currentG.current.x, targetG.current.x, t);
    currentG.current.y = lerp(currentG.current.y, targetG.current.y, t);

    applyVars();
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, width, radius, metal]);

  const resetTargets = () => {
    target.current = { angle: 0, x: 0, y: 0 };
    targetG.current = { x: 50, y: 50 };
  };

  const handlePointer = (event: React.PointerEvent) => {
    const card = cardRef.current;
    if (!card) {
      return;
    }
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const inRange = dist < influenceRadius;
    const mult = Math.max(0.1, 1 - Math.min(1, dist / influenceRadius));

    const nx = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

    if (inRange) {
      targetG.current.x = 50 - (nx - 0.5) * 100 * lightFollow;
      targetG.current.y = 50 - (ny - 0.5) * 100 * lightFollow;

      target.current.y = (nx - 0.5) * maxRotation * 2 * mult;
      target.current.x = (0.5 - ny) * maxRotation * 2 * mult;

      const angleTop = 120 * (1 - nx);
      const angleBottom = 120 * nx;
      target.current.angle = (angleTop * (1 - ny) + angleBottom * ny) * mult;
    } else {
      resetTargets();
    }
  };

  const wrapMode = mode === 'system' ? undefined : mode;

  return (
    <div ref={wrapRef} data-theme={wrapMode} className={cn('metallic-tilt-wrap', className)} aria-label={ariaLabel}>
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <filter id={ids.noise} filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="linearRGB">
          <feTurbulence type="turbulence" baseFrequency="0.3" numOctaves="4" seed="15" stitchTiles="stitch" result="turbulence" />
          <feSpecularLighting surfaceScale="1" specularConstant="1.8" specularExponent="10" lightingColor="#7957A8" in="turbulence" result="specularLighting">
            <feDistantLight azimuth="3" elevation="50" />
          </feSpecularLighting>
          <feColorMatrix type="saturate" values="0" in="specularLighting" result="colormatrix" />
        </filter>
      </svg>

      <div
        ref={cardRef}
        className="metallic-tilt-card"
        onPointerMove={handlePointer}
        onPointerLeave={resetTargets}
        onBlur={resetTargets}
      >
        <div className="metallic-tilt-card-content">{children}</div>
      </div>
    </div>
  );
};

export default MetallicTiltCard;
