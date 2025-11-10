import { useEffect, useState } from 'react';

type AvailabilityState = 'unknown' | 'available' | 'missing';

const cache = new Map<string, AvailabilityState>();

const getCachedAvailability = (path: string): AvailabilityState | undefined => cache.get(path);

const setCachedAvailability = (path: string, state: AvailabilityState) => {
  cache.set(path, state);
};

const fetchAvailability = async (path: string): Promise<AvailabilityState> => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok ? 'available' : 'missing';
  } catch (error) {
    console.warn(`Failed to resolve availability for ${path}`, error);
    return 'missing';
  }
};

const useFileAvailability = (path: string): AvailabilityState => {
  const [state, setState] = useState<AvailabilityState>(() => getCachedAvailability(path) ?? 'unknown');

  useEffect(() => {
    let cancelled = false;

    if (state === 'available' || state === 'missing') {
      return undefined;
    }

    fetchAvailability(path).then((result) => {
      if (cancelled) {
        return;
      }

      setCachedAvailability(path, result);
      setState(result);
    });

    return () => {
      cancelled = true;
    };
  }, [path, state]);

  return state;
};

export default useFileAvailability;
