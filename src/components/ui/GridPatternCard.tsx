import type { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

import { cn } from '../../lib/cn';

type GridPatternCardProps = {
  children: ReactNode;
  className?: string;
  patternClassName?: string;
  gradientClassName?: string;
};

export const GridPatternCard = ({
  children,
  className,
  patternClassName,
  gradientClassName,
}: GridPatternCardProps) => {
  return (
    <motion.div
      className={cn(
        'overflow-hidden rounded-[30px] border border-white/60 bg-white/80 shadow-2xl',
        className,
      )}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div
        className={cn(
          'relative h-full w-full bg-[length:48px_48px]',
          'bg-[radial-gradient(circle_at_1px_1px,#94a3b833,transparent_0)]',
          patternClassName,
        )}
      >
        <div
          className={cn(
            'relative h-full w-full bg-gradient-to-br from-white via-white/90 to-slate-100',
            gradientClassName,
          )}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export const GridPatternCardBody = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('p-6 text-left', className)} {...props} />;
};
