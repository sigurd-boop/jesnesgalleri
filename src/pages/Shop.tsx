import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import {
  Box3,
  Color,
  MeshPhysicalMaterial,
  Vector3,
  type Group,
  type Mesh,
} from 'three';

import { ButtonLink, Eyebrow, Muted, PageDescription, Surface } from '../components/Bits';
import useBigCartelProducts, { type BigCartelProduct } from '../hooks/useBigCartelProducts';
import { cn } from '../lib/cn';
import { GooeyText } from '../components/ui/gooey-text-morphing';
import ShopProductCard from '../components/ShopProductCard';

import paintDudeModelUrl from '/models/paintdude.glb?url';

const fallbackImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80';
const NOK_FORMATTER = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' });

const PaintDudeModel = ({ spinSpeed = 0.55 }: { spinSpeed?: number }) => {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(paintDudeModelUrl);
  const clone = useMemo(() => scene.clone(true), [scene]);

  const createChromeMaterial = useCallback(() => {
    const material = new MeshPhysicalMaterial({
      color: new Color('#050505').convertSRGBToLinear(),
      metalness: 1,
      roughness: 0.12,
      reflectivity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.6,
    });
    material.emissive = new Color('#000000');
    material.emissiveIntensity = 0.02;
    return material;
  }, []);

  useEffect(() => {
    const materials: MeshPhysicalMaterial[] = [];

    clone.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const material = createChromeMaterial();
        material.needsUpdate = true;
        mesh.material = material;
        materials.push(material);
      }
    });

    const box = new Box3().setFromObject(clone);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    clone.position.sub(center);
    clone.scale.setScalar(2.2 / maxDimension);

    return () => {
      materials.forEach((material) => material.dispose());
    };
  }, [clone, createChromeMaterial]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * spinSpeed;
    group.current.rotation.x = Math.sin(Date.now() / 2200) * 0.25;
  });

  return (
    <group ref={group} position={[0, -0.1, 0]}>
      <primitive object={clone} dispose={null} />
    </group>
  );
};

const PaintDudeSpinner = () => (
  <div className="mx-auto h-64 w-full max-w-3xl">
    <Canvas camera={{ position: [0, 0.6, 4], fov: 35 }} shadows dpr={[1, 2]} gl={{ alpha: true }}>
      <Suspense
        fallback={
          <Html center>
            <div className="rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              Loading sculpt …
            </div>
          </Html>
        }
      >
        <PaintDudeModel />
      </Suspense>
    </Canvas>
  </div>
);

const parsePriceValue = (value?: string | number | null) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const normalized = Number(value.replace(',', '.'));
    return Number.isFinite(normalized) ? normalized : null;
  }
  return null;
};

const formatProductPrice = (product: BigCartelProduct) => {
  if (typeof product.price_in_cents === 'number') {
    return NOK_FORMATTER.format(product.price_in_cents / 100);
  }
  const numeric = parsePriceValue(product.price);
  if (numeric !== null) {
    return NOK_FORMATTER.format(numeric);
  }
  return product.price ?? '—';
};

const isProductSoldOut = (product: BigCartelProduct) => {
  if (typeof product.sold_out === 'boolean') return product.sold_out;
  if (product.status?.toLowerCase().includes('sold')) return true;
  if (product.options?.length) {
    return product.options.every((option) => option.sold_out ?? option.quantity === 0);
  }
  return false;
};

const sanitizeDescription = (value?: string) => {
  if (!value) return [];
  const plain = value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  return plain
    .split(/\n{2,}|\r\n\r\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
};

const ShopPage = () => {
  const { products, loading, error } = useBigCartelProducts();
  const [activeProduct, setActiveProduct] = useState<BigCartelProduct | null>(null);
  const [gridActivated, setGridActivated] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(() => {
    if (products.length) return products;
    return Array.from({ length: 4 }, (_, index) => ({
      id: index,
      name: 'Jesné placeholder',
      price: '—',
      url: '#',
      description: 'Products from BigCartel will appear here once the API responds.',
      images: [{ secure_url: fallbackImage }],
    })) as BigCartelProduct[];
  }, [products]);

  const heroTexts = ['Aztro collection', 'Available soon'];

  const handlePreview = useCallback((product: BigCartelProduct) => {
    setActiveProduct(product);
  }, []);

  const closePreview = useCallback(() => {
    setActiveProduct(null);
  }, []);

  useEffect(() => {
    const node = gridRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setGridActivated(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
      <section className="space-y-6 text-center animate-fade-in-up">
        <Eyebrow>shop collection</Eyebrow>
        <div className="mx-auto h-[200px] w-full max-w-4xl">
          <GooeyText
            texts={heroTexts}
            scrollControlled
            scrollStep={420}
            className="h-full"
            textClassName="font-semibold text-slate-900 leading-[1.05] tracking-[0.04em] text-[20vw] sm:leading-[0.9] sm:text-[12vw] md:text-[9rem]"
          />
        </div>
        <div className="flex justify-center">
          <PaintDudeSpinner />
        </div>
        <PageDescription className="sr-only">
          Scroll to reveal the current Jesné drop pulled live from BigCartel. Tap a card to finish the purchase on jesne.bigcartel.com.
        </PageDescription>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Scroll to reveal ↓</p>
      </section>

      {error && (
        <Surface variant="subtle" className="text-sm text-rose-600">
          {error}
        </Surface>
      )}

      <div
        ref={gridRef}
        className={cn(
          'grid gap-8 md:grid-cols-2 transition-all duration-700 ease-out',
          gridActivated ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-5 opacity-0',
        )}
      >
        {items.map((product) => {
          const soldOut = isProductSoldOut(product);
          const priceLabel = loading && !products.length ? 'Syncing…' : formatProductPrice(product);
          const descriptionParagraphs = sanitizeDescription(product.description);
          return (
            <ShopProductCard
              key={product.id}
              product={product}
              priceLabel={priceLabel}
              soldOut={soldOut}
              descriptionParagraphs={descriptionParagraphs.length ? descriptionParagraphs : ['No description provided yet.']}
              onPreview={() => handlePreview(product)}
            />
          );
        })}
      </div>

      <ProductPreviewSection product={activeProduct} onClose={closePreview} />
    </div>
  );
};

const ProductPreviewSection = ({
  product,
  onClose,
}: {
  product: BigCartelProduct | null;
  onClose: () => void;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [product?.id]);

  if (!product) {
    return (
      <Surface variant="subtle" className="space-y-2 text-sm text-slate-500">
        <p>Select a product card to preview it here.</p>
      </Surface>
    );
  }

  const images = product.images?.length ? product.images : [{ secure_url: fallbackImage }];
  const description = sanitizeDescription(product.description);
  const hasMultiple = images.length > 1;
  const hasStoreUrl = product.url && product.url !== '#';
  const soldOut = isProductSoldOut(product);
  const priceLabel = formatProductPrice(product);

  const stepImage = (direction: number) => {
    setIndex((previous) => (previous + direction + images.length) % images.length);
  };

  return (
    <Surface className="space-y-8 border-white bg-white/95 p-8 shadow-xl shadow-slate-900/5">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="relative flex-1 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white">
          <img
            src={images[index]?.secure_url ?? fallbackImage}
            alt={product.name}
            className="max-h-[520px] w-full object-cover"
            loading="lazy"
          />
          {hasMultiple && (
            <>
              <div className="absolute inset-0 flex items-center justify-between px-4 text-white">
                <button
                  type="button"
                  onClick={() => stepImage(-1)}
                  className="rounded-full bg-black/35 px-3 py-2 text-lg backdrop-blur"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => stepImage(1)}
                  className="rounded-full bg-black/35 px-3 py-2 text-lg backdrop-blur"
                >
                  ›
                </button>
              </div>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
                {images.map((_, dotIndex) => (
                  <span
                    key={`${product.id}-${dotIndex}`}
                    className={cn(
                      'h-1.5 w-6 rounded-full bg-white/40 transition-opacity',
                      dotIndex === index ? 'bg-white/90' : 'opacity-60',
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Jesné drop</p>
              <h3 className="text-3xl font-semibold text-slate-900">{product.name}</h3>
            </div>
            <div className="text-right text-sm font-medium uppercase tracking-[0.35em] text-slate-600">
              <p>{priceLabel}</p>
              <p className={cn('text-[0.6rem] font-semibold tracking-[0.4em]', soldOut ? 'text-rose-500' : 'text-emerald-600')}>
                {soldOut ? 'Sold out' : 'Available'}
              </p>
            </div>
          </div>

          {description.length ? (
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white/70 p-4 text-sm leading-relaxed text-slate-600">
              {description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <Muted>No description provided yet.</Muted>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            >
              Close preview
            </button>
            {hasStoreUrl && (
              <ButtonLink
                href={`https://jesne.bigcartel.com${product.url}`}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-900 px-6 text-white"
              >
                Checkout on BigCartel
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </Surface>
  );
};

export default ShopPage;

useGLTF.preload(paintDudeModelUrl);
