import * as React from 'react';

export type UserRef<E> = React.RefObject<E> | React.RefCallback<E>;

export default function useCombinedRefs<E>(
  ...refs: UserRef<E>[]
): React.RefCallback<E> {
  const prevRefs = React.useRef<UserRef<E>[]>();
  return React.useCallback((elm) => {
    refs.forEach((ref, i) => {
      const prevRef = prevRefs.current?.[i];
      if (prevRef !== ref) {
        if (typeof ref === 'function') {
          ref(elm);
        } else {
          (ref as React.MutableRefObject<E | null>).current = elm;
        }
      }
    });

    prevRefs.current = refs;
  }, refs);
}
