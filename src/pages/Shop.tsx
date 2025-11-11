import { useCallback, useEffect, useMemo, useState } from 'react';
import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';
import useBigCartelProducts, { type BigCartelProduct } from '../hooks/useBigCartelProducts';
import { cn } from '../lib/cn';

const fallbackImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80';
const NOK_FORMATTER = new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' });

const parsePriceValue = (value?: string | number | null) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
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
  if (typeof product.sold_out === 'boolean') {
    return product.sold_out;
  }
  if (product.status && product.status.toLowerCase().includes('sold')) {
    return true;
  }
  if (product.options?.length) {
    return product.options.every((option) => option.sold_out ?? option.quantity === 0);
  }
  return false;
};

const ShopPage = () => {
  const { products, loading, error } = useBigCartelProducts();
  const [activeProduct, setActiveProduct] = useState<BigCartelProduct | null>(null);

  const items = useMemo(() => {
    if (products.length) {
      return products;
    }

    return Array.from({ length: 4 }, (_, index) => ({
      id: index,
      name: 'Jesné placeholder',
      price: '—',
      url: '#',
      description: 'Products from BigCartel will appear here once the API responds.',
      images: [{ secure_url: fallbackImage }],
    }));
  }, [products]);

  const handlePreview = useCallback((product: BigCartelProduct) => {
    setActiveProduct(product);
  }, []);

  const closePreview = useCallback(() => {
    setActiveProduct(null);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
      <header className="space-y-4 text-center animate-fade-in-up">
        <Eyebrow>shop</Eyebrow>
        <PageTitle>Pieces from the Jesné store</PageTitle>
        <PageDescription>
          Items are pulled directly from BigCartel. Tap a card to finish the purchase on jesne.bigcartel.com.
        </PageDescription>
      </header>

      {error ? (
        <Surface variant="subtle" className="text-sm text-rose-600">
          {error}
        </Surface>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((product, index) => {
          const image = product.images?.[0]?.secure_url ?? fallbackImage;
          const soldOut = isProductSoldOut(product);
          const priceLabel = loading && !products.length ? 'Syncing…' : formatProductPrice(product);
          const animationDelay = `${Math.min(index * 0.08, 0.4)}s`;
          return (
            <Surface
              key={product.id}
              className="flex h-full flex-col gap-4 animate-fade-in-up"
              style={{ animationDelay }}
            >
              <button
                type="button"
                onClick={() => handlePreview(product)}
                className="group overflow-hidden rounded-2xl border border-white/60 bg-white/80"
              >
                <img
                  src={image}
                  alt={product.name}
                  className={cn(
                    'h-64 w-full object-cover transition duration-500 group-hover:scale-105',
                    loading ? 'opacity-60 blur-sm' : '',
                  )}
                  loading="lazy"
                />
              </button>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{priceLabel}</p>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.25em]',
                      soldOut ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600',
                    )}
                  >
                    {soldOut ? 'Sold out' : 'Available'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handlePreview(product)}
                className="mt-auto inline-flex items-center justify-center rounded-full border border-slate-900/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-900/40 hover:text-slate-900"
                disabled={loading && !products.length}
              >
                Preview piece
              </button>
            </Surface>
          );
        })}
      </div>

      <ProductPreviewSection product={activeProduct} onClose={closePreview} />
    </div>
  );
};

const sanitizeDescription = (value?: string) => {
  if (!value) {
    return [];
  }
  const plain = value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  return plain
    .split(/\n{2,}|\r\n\r\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
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
          {hasMultiple ? (
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
          ) : null}
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
            {hasStoreUrl ? (
              <ButtonLink
                href={`https://jesne.bigcartel.com${product.url}`}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-900 px-6 text-white"
              >
                Checkout on BigCartel
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    </Surface>
  );
};

export default ShopPage;
