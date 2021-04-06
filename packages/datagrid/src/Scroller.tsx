import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import useResizeObserver from './useResizeObserver';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    overflow: 'auto',
    width: '100%',
    height: '100%',
  },
  scrollPane: {
    width: '100%',
    height: '100%',
  },
  viewport: {
    position: 'sticky',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
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
  const classes = useStyles();
  const { ref: rootRef, rect } = useResizeObserver();
  return (
    <div
      ref={rootRef}
      className={clsx(classes.root, className)}
      onScroll={onScroll}
    >
      <div
        className={classes.scrollPane}
        style={{ width: scrollWidth, height: scrollHeight }}
      >
        <div
          className={classes.viewport}
          style={{ width: rect?.width, height: rect?.height }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
