import * as React from 'react';
import useRefEffect from './useRefEffect';

export default function useEventListener<
  E extends HTMLElement,
  K extends keyof HTMLElementEventMap
>(
  event: K,
  listener: (event: HTMLElementEventMap[K]) => any,
  options?: AddEventListenerOptions
): React.RefCallback<E> {
  const { capture, once, passive } = options ?? {};
  return useRefEffect<E>(
    (elm) => {
      elm.addEventListener<K>(event, listener, {
        capture,
        once,
        passive,
      });
    },
    [event, listener, capture, once, passive]
  );
}
