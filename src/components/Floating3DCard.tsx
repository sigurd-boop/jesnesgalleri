import React, { useRef, useState } from 'react';

type Floating3DCardProps = {
  title: string;
  description?: string;
  images: string[];
  meta?: string[];
  actionLabel?: string;
};

export const Floating3DCard = ({
  title,
  description,
  images,
  meta,
  actionLabel = 'View gallery',
}: Floating3DCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const normalizedImages = images.map((image) => image.trim()).filter(Boolean);
  const galleryImages = normalizedImages.length
    ? normalizedImages
    : ['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1080&q=80'];

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const card = cardRef.current;
    if (!card) {
      return;
    }

    const { left, top, width, height } = card.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;

    const rotateX = ((y - height / 2) / height) * 15;
    const rotateY = ((x - width / 2) / width) * -15;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) {
      return;
    }
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  };

  const showPreview = () => {
    setIndex(0);
    setPreviewOpen(true);
  };

  const navigateImage = (direction: 1 | -1) => {
    setIndex((previous) => (previous + direction + galleryImages.length) % galleryImages.length);
  };

  return (
    <>
      <div className="flex w-full justify-center px-2 sm:px-4" style={{ perspective: '1000px' }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="group relative w-full rounded-3xl border border-white/40 bg-white/80 p-6 text-left shadow-lg transition-transform duration-300 ease-out dark:border-white/20 dark:bg-[#111111]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {meta?.[0] ? (
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-slate-500" style={{ transform: 'translateZ(35px)' }}>
              {meta[0]}
            </p>
          ) : null}
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white" style={{ transform: 'translateZ(50px)' }}>
            {title}
          </h2>

          {description ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-neutral-300" style={{ transform: 'translateZ(60px)' }}>
              {description}
            </p>
          ) : null}

          <div className="mt-6 w-full" style={{ transform: 'translateZ(90px)' }}>
            <img
              src={galleryImages[0]}
              alt={title}
              className="h-52 w-full rounded-2xl object-cover shadow-md transition-shadow duration-300 sm:h-64 group-hover:shadow-xl"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4" style={{ transform: 'translateZ(30px)' }}>
            <button
              type="button"
              onClick={showPreview}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:bg-slate-900 hover:text-white"
            >
              {actionLabel}
            </button>
            <div className="space-y-1">
              <p className="text-[0.55rem] uppercase tracking-[0.3em] text-slate-400">
                UV ArtGlass • A5 200gsm • Mixed media
              </p>
              {meta?.[1] ? (
                <p className="text-[0.5rem] uppercase tracking-[0.3em] text-slate-400/80">{meta[1]}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl space-y-4 rounded-3xl border border-white/20 bg-transparent p-6 text-white">
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute right-4 top-4 rounded-full border border-white/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/10"
            >
              Close
            </button>
            <img
              src={galleryImages[index]}
              alt={`${title}-${index}`}
              className="max-h-[70vh] w-full rounded-2xl object-cover shadow-2xl shadow-black/40"
            />
            <div className="flex items-center justify-between text-sm text-white/90">
              <span>
                {index + 1} / {galleryImages.length}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigateImage(-1)}
                  className="rounded-full border border-white/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/10"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => navigateImage(1)}
                  className="rounded-full border border-white/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/10"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
