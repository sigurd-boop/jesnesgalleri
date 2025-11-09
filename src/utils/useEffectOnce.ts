import { useEffect } from 'react';

type EffectCallback = () => void | (() => void);

export const useEffectOnce = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};
