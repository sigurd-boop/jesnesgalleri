import { useEffect, useState } from 'react';

import { cn } from '../../lib/cn';

type TypingAnimationProps = {
  text: string;
  duration?: number;
  className?: string;
};

const TypingAnimation = ({ text, duration = 120, className }: TypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (!text || index >= text.length) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setDisplayedText(text.slice(0, index + 1));
      setIndex((prev) => prev + 1);
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [duration, index, text]);

  return (
    <p
      className={cn(
        'font-mono text-xs uppercase tracking-[0.4em] text-slate-500 sm:text-sm',
        className,
      )}
    >
      {displayedText}
    </p>
  );
};

export default TypingAnimation;
