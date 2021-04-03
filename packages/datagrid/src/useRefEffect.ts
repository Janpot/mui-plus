import * as React from 'react';

export default function useRefEffect<T>(
  effect: (elm: T) => void | (() => void)
): React.RefCallback<T> {
  const cleanupRef = React.useRef<null | (() => void)>(null);
  const prevElm = React.useRef<T>();

  const ref = React.useCallback(
    (elm: T) => {
      if (prevElm.current === elm) {
        return;
      }
      prevElm.current = elm;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (elm) {
        cleanupRef.current = effect(elm) || null;
      }
    },
    [effect]
  );

  React.useEffect(
    () => () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    },
    []
  );

  return ref;
}
