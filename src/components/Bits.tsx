import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export const Eyebrow = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    {...props}
    className={cn('text-[0.7rem] uppercase tracking-[0.5em] text-slate-500', className)}
  />
);

export const PageTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    {...props}
    className={cn(
      'text-balance text-4xl font-bold tracking-[-0.02em] text-slate-900 sm:text-5xl lg:text-6xl',
      className,
    )}
  />
);

export const PageDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} className={cn('max-w-2xl text-lg text-slate-600', className)} />
);

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'soft' | 'subtle';
};

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant = 'soft', ...props }, ref) => (
    <div
      ref={ref}
      {...props}
      className={cn(
        'rounded-[2rem] border p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm',
        variant === 'soft'
          ? 'border-slate-200/80 bg-white/80'
          : 'border-slate-200/40 bg-white/40',
        className,
      )}
    />
  ),
);
Surface.displayName = 'Surface';

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  tone?: 'primary' | 'neutral';
};

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, tone = 'primary', ...props }, ref) => (
    <a
      ref={ref}
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-sm font-medium tracking-[0.2em] transition-colors',
        tone === 'primary'
          ? 'bg-slate-900 text-white hover:bg-slate-700'
          : 'border border-slate-300 bg-white/70 text-slate-700 hover:border-slate-400 hover:text-slate-900',
        className,
      )}
    />
  ),
);
ButtonLink.displayName = 'ButtonLink';

export const Muted = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} className={cn('text-sm text-slate-500', className)} />
);
