import { useEffect, useState } from 'react';

export type ShopProduct = {
  id: string;
  title: string;
  price: string;
  url: string;
  imageUrl: string;
  status?: 'available' | 'sold';
};

export type ShopHighlightState = {
  loading: boolean;
  products: ShopProduct[];
  error: string | null;
};

const placeholderProducts: ShopProduct[] = [
  {
    id: 'placeholder-product-1',
    title: 'Chrome Bloom – Mini',
    price: '2 900 NOK',
    url: 'https://jesnesgalleri.bigcartel.com/product/chrome-bloom-mini',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'placeholder-product-2',
    title: 'Orbit Vase',
    price: '3 600 NOK',
    url: 'https://jesnesgalleri.bigcartel.com/product/orbit-vase',
    imageUrl: 'https://images.unsplash.com/photo-1513351105278-7ee57bb372a7?auto=format&fit=crop&w=1080&q=80',
    status: 'sold',
  },
];

const useShopHighlights = () => {
  const [state, setState] = useState<ShopHighlightState>({
    loading: true,
    products: placeholderProducts,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchHighlights = async () => {
      try {
        const response = await fetch('/api/shop/highlights', { signal: controller.signal });

        if (!response.ok) {
          throw new Error('BigCartel API is not reachable yet.');
        }

        const payload = (await response.json()) as { products?: ShopProduct[] };

        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          products: payload.products?.length ? payload.products : placeholderProducts,
          error: null,
        });
      } catch (error) {
        if (cancelled || (error as DOMException).name === 'AbortError') {
          return;
        }

        setState({
          loading: false,
          products: placeholderProducts,
          error: error instanceof Error ? error.message : 'Unable to load shop highlights.',
        });
      }
    };

    fetchHighlights();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return state;
};

export default useShopHighlights;
