import * as React from 'react';

export default function useEventListener<
  E extends HTMLElement,
  K extends keyof HTMLElementEventMap
>(
  ref: React.RefObject<E>,
  event: K,
  listener: (event: HTMLElementEventMap[K]) => any,
  options?: AddEventListenerOptions
): void {
  const { capture, once, passive } = options ?? {};
  React.useEffect(() => {
    const elm = ref.current;
    if (!elm) {
      return;
    }
    elm.addEventListener<K>(event, listener, {
      capture,
      once,
      passive,
    });
    return () => elm.removeEventListener<K>(event, listener);
  }, [ref, event, listener, capture, once, passive]);
}
