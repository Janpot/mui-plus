import * as React from 'react';

export default function useRefEffect<T>(
  effect: (elm: T) => void | (() => void),
  deps: React.DependencyList
): React.RefCallback<T> {
  const cleanupRef = React.useRef<null | (() => void)>(null);
  const effectRef = React.useRef(effect);
  effectRef.current = effect;

  const ref = React.useCallback((elm: T) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    cleanupRef.current = effectRef.current(elm) || null;
  }, deps);

  return ref;
}
