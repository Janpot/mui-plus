import * as React from 'react';

interface Rect {
  width: number;
  height: number;
}

interface UseResizeObserver<T> {
  ref: React.RefCallback<T>;
  rect?: Rect;
}

function useRefEffect<T>(
  effect: (elm: T) => void | (() => void)
): React.RefCallback<T> {
  const cleanupRef = React.useRef<null | (() => void)>(null);

  const ref = React.useCallback((elm: T) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    cleanupRef.current = effect(elm) || null;
  }, []);

  return ref;
}

export default function useResizeObserver<
  T extends HTMLElement
>(): UseResizeObserver<T> {
  const [rect, setRect] = React.useState<Rect>();
  const observerRef = React.useRef<ResizeObserver>();

  const ref = useRefEffect<T>((elm) => {
    if (elm) {
      if (!observerRef.current) {
        observerRef.current = new ResizeObserver(
          (entries: ResizeObserverEntry[]) => {
            if (entries.length <= 0) {
              return;
            }
            setRect((rect) => {
              const { width, height } = entries[0].contentRect;
              return rect?.width === width && rect?.height === height
                ? rect
                : { width, height };
            });
          }
        );
      }
      const observer = observerRef.current;
      observer.observe(elm);
      return () => observer.unobserve(elm);
    }
  });

  return {
    ref,
    rect,
  };
}
