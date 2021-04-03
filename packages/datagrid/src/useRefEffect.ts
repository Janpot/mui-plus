import * as React from 'react';

export default function useRefEffect<T>(
  effect: (elm: T) => void | (() => void)
): React.RefCallback<T> {
  const cleanupRef = React.useRef<null | (() => void)>(null);
  const effectRef = React.useRef(effect);
  effectRef.current = effect;

  const ref = React.useCallback((elm: T) => {
    cleanupRef.current?.();
    if (elm) {
      const effectCleanup = effectRef.current(elm);
      if (effectCleanup) {
        cleanupRef.current = () => {
          effectCleanup();
          cleanupRef.current = null;
        };
      }
    }
  }, []);

  React.useEffect(() => () => cleanupRef.current?.(), []);

  return ref;
}
