import * as React from 'react';

const ScrollSpyRegisterContext = React.createContext<
  (elm: Element, id: string) => () => void
>(() => () => undefined);
const ScrollSpyActiveSectionContext = React.createContext<string | null>(null);

export function useActiveSection() {
  return React.useContext(ScrollSpyActiveSectionContext);
}

export function useSection(id: string): React.RefCallback<Element> {
  const register = React.useContext(ScrollSpyRegisterContext);
  const cleanupRef = React.useRef<(() => void) | null>(null);
  return React.useCallback(
    (elm: Element) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (elm) {
        cleanupRef.current = register(elm, id);
      }
    },
    [register, id]
  );
}

interface ScrollSpyProviderProps {
  children?: React.ReactNode;
}

function useThrottled<A extends any[]>(
  fn: (...args: A) => void,
  delay: number
) {
  const lastExecution = React.useRef(0);
  const timeout = React.useRef<NodeJS.Timeout | null>(null);

  const cancel = React.useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  const throttled = React.useCallback(
    (...args: A) => {
      const now = Date.now();
      const elapsed = now - lastExecution.current;
      if (elapsed < delay) {
        cancel();
        timeout.current = setTimeout(() => {
          fn(...args);
        }, delay - elapsed);
      } else {
        lastExecution.current = now;
        fn(...args);
      }
    },
    [fn, delay, cancel]
  );

  return {
    throttled,
    cancel,
  };
}

export function ScrollSpyProvider({ children }: ScrollSpyProviderProps) {
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const elms = React.useRef(new Map<Element, string>());

  const updateState = React.useCallback(() => {
    const sortedEntries = Array.from(elms.current.entries(), ([elm, id]) => {
      const { top } = elm.getBoundingClientRect();
      return { top, id };
    }).sort((entry1, entry2) => entry1.top - entry2.top);
    if (sortedEntries.length <= 0) {
      return;
    }
    const scanline = document.documentElement.clientHeight * 0.3;
    const { id: activeId } =
      sortedEntries.reverse().find(({ top }) => top < scanline) ||
      sortedEntries[sortedEntries.length - 1];
    setActiveSection(activeId);
  }, []);

  const register = React.useCallback((elm: Element, id: string) => {
    elms.current.set(elm, id);
    return () => elms.current.delete(elm);
  }, []);

  const { throttled: updateStateThrottled, cancel } = useThrottled(
    updateState,
    100
  );

  React.useEffect(() => cancel, [cancel]);

  React.useEffect(() => {
    updateStateThrottled();
    window.addEventListener('scroll', updateStateThrottled);
    return () => window.removeEventListener('scroll', updateStateThrottled);
  }, [updateStateThrottled]);

  return (
    <ScrollSpyRegisterContext.Provider value={register}>
      <ScrollSpyActiveSectionContext.Provider value={activeSection}>
        {children}
      </ScrollSpyActiveSectionContext.Provider>
    </ScrollSpyRegisterContext.Provider>
  );
}
