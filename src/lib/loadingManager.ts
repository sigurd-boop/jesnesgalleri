import { DefaultLoadingManager } from 'three';
import { useEffect, useState } from 'react';

type LoadingState = {
  pending: number;
};

const listeners = new Set<(state: LoadingState) => void>();

let pending = 0;

const notify = () => {
  const snapshot = { pending };
  listeners.forEach((listener) => listener(snapshot));
};

const manager = DefaultLoadingManager;

manager.onStart = (_, itemsLoaded, itemsTotal) => {
  pending = Math.max(itemsTotal - itemsLoaded, 1);
  notify();
};

manager.onProgress = (_, itemsLoaded, itemsTotal) => {
  pending = Math.max(itemsTotal - itemsLoaded, 0);
  notify();
};

manager.onLoad = () => {
  pending = 0;
  notify();
};

manager.onError = () => {
  pending = Math.max(pending - 1, 0);
  notify();
};

export const getLoadingState = (): LoadingState => ({ pending });

export const subscribeToLoadingManager = (listener: (state: LoadingState) => void) => {
  listeners.add(listener);
  listener(getLoadingState());
  return () => {
    listeners.delete(listener);
  };
};

export const useLoadingManagerState = () => {
  const [state, setState] = useState<LoadingState>(getLoadingState());

  useEffect(() => subscribeToLoadingManager(setState), []);

  return state;
};
