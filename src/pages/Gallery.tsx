import { useEffect, useState } from 'react';
import ModelCanvas from '../components/ModelCanvas';
import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';
import { subscribeToGalleryItems, type GalleryItem } from '../lib/galleryRepository';

const fallbackGallery: GalleryItem[] = [
  {
    id: 'placeholder-1',
    title: 'Lysvev I',
    description:
      'Organisk struktur i gjennomskinnelig glass – roterer sakte for å fremheve teksturen og lyset.',
    modelPath: '/models/artifact-01.glb',
  },
  {
    id: 'placeholder-2',
    title: 'Lysvev II',
    description: 'Intrikat komposisjon i metalliske materialer med et flytende uttrykk.',
    modelPath: '/models/artifact-02.glb',
  },
  {
    id: 'placeholder-3',
    title: 'Lysvev III',
    description: 'Minimalistisk skulptur med skarpe kanter og varme refleksjoner.',
    modelPath: '/models/artifact-03.glb',
  },
];

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>(fallbackGallery);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems(
      (nextItems) => {
        if (nextItems.length === 0) {
          setItems(fallbackGallery);
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
        setItems(fallbackGallery);
        setUsingFallback(true);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-20">
      <section className="space-y-6">
        <Eyebrow>digital utstilling</Eyebrow>
        <PageTitle>Et sømløst, levende galleri</PageTitle>
        <PageDescription>
          Tre nøye utvalgte GLB-objekter svever i rommet og roterer rolig slik at materialer, former og lys kommer til sin
          rett. Bytt ut filbanene for å koble på dine egne 3D-verk.
        </PageDescription>
        <ButtonLink href="#veiledning" tone="neutral" className="mt-4 w-fit">
          Hvordan bruke
        </ButtonLink>
      </section>

      <section className="grid gap-10 lg:grid-cols-3">
        {items.map((item) => (
          <Surface key={item.id ?? item.title} className="flex h-full flex-col gap-6">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
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
        ))}
      </section>

      <Surface id="veiledning" variant="subtle" className="space-y-4 border-dashed">
        <h3 className="text-lg font-semibold text-slate-900">Slik kobler du på egne GLB-filer</h3>
        <ol className="space-y-3 text-sm text-slate-600">
          <li>1. Legg filene dine i <code className="font-mono text-xs">public/models</code>.</li>
          <li>
            2. Oppdater banen i <code className="font-mono text-xs">galleryItems</code>-listen over, eller hent dataene dine
            fra et CMS.
          </li>
          <li>3. Galleriet roterer automatisk i en kontinuerlig 360° animasjon.</li>
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
