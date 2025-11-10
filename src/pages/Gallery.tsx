import { useEffect, useMemo, useState } from 'react';
import ModelCanvas from '../components/ModelCanvas';
import JesneLogoHero from '../components/JesneLogoHero';
import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';
import {
  galleryCategories,
  galleryCategoryLabels,
  subscribeToGalleryItems,
  type GalleryCategory,
  type GalleryItem,
} from '../lib/galleryRepository';
import { fallbackGalleryItems } from '../lib/galleryFallback';

const categoryOrder: GalleryCategory[] = [...galleryCategories];

const categoryCopy: Record<GalleryCategory, { title: string; blurb: string }> = {
  commercial: {
    title: galleryCategoryLabels.commercial,
    blurb:
      'Presentasjoner og oppdrag for kunder. Hver modell er tilpasset merkevaren og lyssatt for å fremheve detaljene.',
  },
  collection: {
    title: galleryCategoryLabels.collection,
    blurb:
      'Kuraterte verk fra studioet – utforsk materialer, overflater og strukturer i et rolig tempo.',
  },
};

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>(fallbackGalleryItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(true);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('commercial');

  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems(
      (nextItems) => {
        if (nextItems.length === 0) {
          setItems(fallbackGalleryItems);
          setUsingFallback(true);
        } else {
          setItems(nextItems);
          setUsingFallback(false);
        }
        setError(null);
        setLoading(false);
      },
      (subscribeError) => {
        console.error('Kunne ikke hente galleriet fra Firestore', subscribeError);
        setError(
          subscribeError.message ||
            'Kunne ikke koble til Firestore. Viser forhåndslastede eksempler i stedet.',
        );
        setItems(fallbackGalleryItems);
        setUsingFallback(true);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const itemsByCategory = useMemo(
    () =>
      categoryOrder.reduce<Record<GalleryCategory, GalleryItem[]>>((accumulator, category) => {
        accumulator[category] = items.filter((item) => item.category === category);
        return accumulator;
      }, {} as Record<GalleryCategory, GalleryItem[]>),
    [items],
  );

  return (
    <div className="space-y-20">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
        <div className="space-y-6">
          <Eyebrow>digital utstilling</Eyebrow>
          <PageTitle>Et sømløst, levende galleri</PageTitle>
          <PageDescription>
            Tre nøye utvalgte GLB-objekter svever i rommet og roterer rolig slik at materialer, former og lys kommer til sin
            rett. Bytt ut filbanene for å koble på dine egne 3D-verk.
          </PageDescription>
          <ButtonLink href="#veiledning" tone="neutral" className="mt-4 w-fit">
            Hvordan bruke
          </ButtonLink>
        </div>
        <JesneLogoHero />
      </section>

      <section className="space-y-10">
        <div className="flex flex-wrap items-center gap-3">
          {categoryOrder.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={
                category === activeCategory
                  ? 'rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-sm shadow-slate-900/10'
                  : 'rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900'
              }
            >
              {categoryCopy[category].title}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            {categoryCopy[activeCategory].title}
          </h2>
          <Muted className="max-w-2xl text-sm text-slate-600">{categoryCopy[activeCategory].blurb}</Muted>
        </div>

        <section className="grid gap-10 lg:grid-cols-3">
          {itemsByCategory[activeCategory]?.length ? (
            itemsByCategory[activeCategory].map((item) => (
              <Surface key={item.id ?? item.title} className="flex h-full flex-col gap-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <Muted>{item.description}</Muted>
                </div>
                <div className="space-y-4">
                  {item.imageUrl ? (
                    <div className="overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/70">
                      <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" loading="lazy" />
                    </div>
                  ) : null}
                  <ModelCanvas modelPath={item.modelPath} />
                </div>
                <Muted className="font-mono text-xs uppercase tracking-[0.35em] text-slate-400">
                  {item.modelPath}
                </Muted>
              </Surface>
            ))
          ) : (
            <Surface variant="subtle" className="lg:col-span-3 border-dashed text-sm text-slate-600">
              Ingen elementer er publisert i denne kategorien ennå.
            </Surface>
          )}
        </section>
      </section>

      <Surface id="veiledning" variant="subtle" className="space-y-4 border-dashed">
        <h3 className="text-lg font-semibold text-slate-900">Slik kobler du på egne GLB-filer</h3>
        <ol className="space-y-3 text-sm text-slate-600">
          <li>1. Legg filene dine i <code className="font-mono text-xs">public/models</code>.</li>
          <li>
            2. Oppdater banen i <code className="font-mono text-xs">galleryItems</code>-listen over, eller hent dataene dine
            fra et CMS.
          </li>
          <li>3. Galleriet roterer automatisk i en kontinuerlig 360° animasjon i begge kategorier.</li>
        </ol>
        {error ? <Muted className="text-xs text-rose-600">{error}</Muted> : null}
        {loading && !error ? <Muted className="text-xs">Laster innhold fra Firestore…</Muted> : null}
        {!loading && usingFallback && !error ? (
          <Muted className="text-xs">Viser forhåndsinnhold inntil Firestore er satt opp.</Muted>
        ) : null}
      </Surface>
    </div>
  );
};

export default GalleryPage;
