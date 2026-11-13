import { useSyncExternalStore } from 'react';
function subscribeQuery(query, callback) {
  const match = window.matchMedia(query);
  match.addEventListener('change', callback);
  return () => match.removeEventListener('change', callback);
}
const subscribeMotion = callback => subscribeQuery('(prefers-reduced-motion: reduce)', callback);
const subscribeMobile = callback => subscribeQuery('(max-width: 767px)', callback);
export function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => false);
}
export function useMobile() {
  return useSyncExternalStore(subscribeMobile, () => window.matchMedia('(max-width: 767px)').matches, () => true);
}
