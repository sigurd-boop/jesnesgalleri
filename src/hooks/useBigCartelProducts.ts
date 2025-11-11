import { useEffect, useState } from 'react';

export type BigCartelProductOption = {
  id: number;
  name: string;
  price: string;
  price_in_cents?: number;
  sold_out?: boolean;
  quantity?: number;
};

export type BigCartelProduct = {
  id: number;
  name: string;
  price?: string;
  price_in_cents?: number;
  url: string;
  description?: string;
  images: Array<{ secure_url: string }>;
  sold_out?: boolean;
  status?: string;
  options?: BigCartelProductOption[];
};

const CACHE_KEY = 'jesne_bigcartel_products';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const useBigCartelProducts = () => {
  const [products, setProducts] = useState<BigCartelProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { timestamp: number; data: BigCartelProduct[] };
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        setProducts(parsed.data);
        setLoading(false);
        return;
      }
    }

    const controller = new AbortController();

    fetch('https://api.bigcartel.com/jesne/products.json', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to reach BigCartel right now.');
        }
        return response.json();
      })
      .then((data: BigCartelProduct[]) => {
        if (cancelled) {
          return;
        }
        const sanitized = Array.isArray(data) ? data : [];
        setProducts(sanitized);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: sanitized }));
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled || err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load shop products.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { products, loading, error };
};

export default useBigCartelProducts;
