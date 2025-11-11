import React, { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollFloat.css';

gsap.registerPlugin(ScrollTrigger);

type ScrollFloatProps = {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
};

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
}: ScrollFloatProps) => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [wrappedChildren, setWrappedChildren] = useState<string>('');

  const spans = useMemo(() => {
    const text = wrappedChildren || (typeof children === 'string' ? children : '');
    return text.split('').map((char, index) => (
      <span className="char" key={`${char}-${index}`}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    if (typeof children === 'string') {
      const words = children.split(' ');
      const chunked: string[] = [];
      let currentLine: string[] = [];
      words.forEach((word) => {
        if ((currentLine.join(' ') + ' ' + word).trim().split(' ').length > 4) {
          chunked.push(currentLine.join(' '));
          currentLine = [word];
          return;
        }
        currentLine.push(word);
      });
      if (currentLine.length) {
        chunked.push(currentLine.join(' '));
      }
      setWrappedChildren(chunked.join('\n'));
    }
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    const scroller = scrollContainerRef?.current ?? window;
    const chars = el.querySelectorAll('.char');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        {
          willChange: 'opacity, transform',
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: '50% 0%',
        },
        {
          duration: animationDuration,
          ease,
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  const containerClasses = ['scroll-float', containerClassName].filter(Boolean).join(' ');
  const textClasses = ['scroll-float-text', textClassName].filter(Boolean).join(' ');

  return (
    <h2 ref={containerRef} className={containerClasses}>
      <span className={textClasses}>{spans}</span>
    </h2>
  );
};

export default ScrollFloat;
