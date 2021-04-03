import * as React from 'react';
import useRefEffect from './useRefEffect';

interface Rect {
  width: number;
  height: number;
}

interface UseResizeObserver<T> {
  ref: React.RefCallback<T>;
  rect?: Rect;
}

export default function useResizeObserver<
  T extends HTMLElement
>(): UseResizeObserver<T> {
  const [rect, setRect] = React.useState<Rect>();
  const observerRef = React.useRef<ResizeObserver>();

  const ref = useRefEffect<T>((elm) => {
    if (!observerRef.current) {
      observerRef.current = new ResizeObserver(
        (entries: ResizeObserverEntry[]) => {
          if (entries.length <= 0) {
            return;
          }
          const { width, height } = entries[0].contentRect;
          setRect((rect) => {
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
  });

  return {
    ref,
    rect,
  };
}
