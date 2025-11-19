 import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';

export type GooeyTextProps = {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
  scrollControlled?: boolean;
  scrollStep?: number;
};

export const GooeyText = ({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  className,
  textClassName,
  scrollControlled = false,
  scrollStep = 360,
}: GooeyTextProps) => {
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!texts.length) {
      return undefined;
    }

    const sequence = texts.length > 1 ? texts : [...texts, texts[0]];
    let textIndex = sequence.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;

    const initializeNodes = (primaryIndex: number) => {
      if (text1Ref.current) {
        text1Ref.current.textContent = sequence[primaryIndex % sequence.length];
        text1Ref.current.style.opacity = '0%';
      }
      if (text2Ref.current) {
        text2Ref.current.textContent = sequence[(primaryIndex + 1) % sequence.length];
        text2Ref.current.style.opacity = '100%';
      }
    };

    initializeNodes(textIndex);

    const setMorph = (fraction: number) => {
      if (!text1Ref.current || !text2Ref.current) {
        return;
      }

      const safeFraction = Math.min(Math.max(fraction, 0), 1);
      const inverse = 1 - safeFraction;

      text2Ref.current.style.filter = `blur(${Math.min(8 / (safeFraction || 1e-6) - 8, 100)}px)`;
      text2Ref.current.style.opacity = `${Math.pow(safeFraction, 0.4) * 100}%`;

      text1Ref.current.style.filter = `blur(${Math.min(8 / (inverse || 1e-6) - 8, 100)}px)`;
      text1Ref.current.style.opacity = `${Math.pow(inverse, 0.4) * 100}%`;
    };

    const doCooldown = () => {
      morph = 0;
      if (!text1Ref.current || !text2Ref.current) {
        return;
      }
      text2Ref.current.style.filter = '';
      text2Ref.current.style.opacity = '100%';
      text1Ref.current.style.filter = '';
      text1Ref.current.style.opacity = '0%';
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    if (scrollControlled && typeof window !== 'undefined') {
      const stepSize = Math.max(scrollStep, 120);
      const updateFromScroll = () => {
        const scrollPosition = window.scrollY;
        const total = sequence.length;
        const primaryIndex = ((Math.floor(scrollPosition / stepSize)) % total + total) % total;
        const secondaryIndex = (primaryIndex + 1) % total;

        if (text1Ref.current) {
          text1Ref.current.textContent = sequence[primaryIndex];
        }
        if (text2Ref.current) {
          text2Ref.current.textContent = sequence[secondaryIndex];
        }

        const fraction = (scrollPosition % stepSize) / stepSize;
        setMorph(fraction);
      };

      let pending = false;
      const onScroll = () => {
        if (pending) {
          return;
        }
        pending = true;
        animationFrameRef.current = requestAnimationFrame(() => {
          updateFromScroll();
          pending = false;
        });
      };

      updateFromScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener('scroll', onScroll);
      };
    }

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const delta = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;

      cooldown -= delta;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % sequence.length;
          if (text1Ref.current) {
            text1Ref.current.textContent = sequence[textIndex % sequence.length];
          }
          if (text2Ref.current) {
            text2Ref.current.textContent = sequence[(textIndex + 1) % sequence.length];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
    };
  }, [texts, morphTime, cooldownTime, scrollControlled, scrollStep]);

  return (
    <div className={cn('relative', className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <div className="flex items-center justify-center" style={{ filter: 'url(#threshold)' }}>
        <span
          ref={text1Ref}
          className={cn(
            'absolute inline-block select-none text-center text-4xl sm:text-5xl md:text-[60pt] text-slate-900',
            textClassName,
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            'absolute inline-block select-none text-center text-4xl sm:text-5xl md:text-[60pt] text-slate-900',
            textClassName,
          )}
        />
      </div>
    </div>
  );
};

export const GooeyTextDemo = () => {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <GooeyText texts={['Design', 'Engineering', 'Is', 'Awesome']} morphTime={1} cooldownTime={0.25} className="font-bold" />
    </div>
  );
};
