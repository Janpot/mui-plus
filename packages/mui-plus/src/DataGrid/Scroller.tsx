import * as React from 'react';
import { experimentalStyled as styled } from '@material-ui/core';
import useResizeObserver from './useResizeObserver';

const Root = styled('div')({
  position: 'relative',
  overflow: 'auto',
  width: '100%',
  height: '100%',
});

const ScrollPane = styled('div')({
  width: '100%',
  height: '100%',
});

const Viewport = styled('div')({
  position: 'sticky',
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  overflow: 'hidden',
});

interface ScrollerProps {
  className?: string;
  scrollWidth?: number;
  scrollHeight?: number;
  children?: React.ReactNode;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

export default function Scroller({
  scrollWidth,
  scrollHeight,
  className,
  children,
  onScroll,
}: ScrollerProps) {
  const { ref: rootRef, rect } = useResizeObserver();
  return (
    <Root ref={rootRef} className={className} onScroll={onScroll}>
      <ScrollPane style={{ width: scrollWidth, height: scrollHeight }}>
        <Viewport style={{ width: rect?.width, height: rect?.height }}>
          {children}
        </Viewport>
      </ScrollPane>
    </Root>
  );
}
