import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const subscribe = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
};

const getSnapshot = () =>
  typeof window !== 'undefined' && window.matchMedia(QUERY).matches;

const getServerSnapshot = () => false;

export const useReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
