import * as React from 'react';
import { experimentalStyled as styled, SxProps } from '@mui/material';
import clsx from 'clsx';
import { scaleLinear } from '../utils/math';

const classes = {
  primaryColor: `primaryColor`,
  secondaryColor: `secondaryColor`,
  successColor: `successColor`,
  warningColor: `warningColor`,
  errorColor: `errorColor`,
  inheritColor: `inheritColor`,
} as const;

const Root = styled('svg')(({ theme }) => ({
  color: theme.palette.primary.main,
  [`&.${classes.secondaryColor}`]: {
    color: theme.palette.secondary.main,
  },
  [`&.${classes.successColor}`]: {
    color: theme.palette.success.main,
  },
  [`&.${classes.warningColor}`]: {
    color: theme.palette.warning.main,
  },
  [`&.${classes.errorColor}`]: {
    color: theme.palette.error.main,
  },
  [`&.${classes.inheritColor}`]: {
    color: 'inherit',
  },
}));

export interface SparklineProps {
  /** Width of the sparkline */
  width?: number;
  /** Height of the sparkline */
  height?: number;
  /** Sparkline series, as an array of y-values */
  data: number[];
  /** Theme color of the sparkline */
  color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'warning' | 'error';
  /** @ignore */
  className?: string;
  /** @ignore */
  sx?: SxProps;
}

export default function Sparkline({
  width = 150,
  height = 25,
  data,
  color = 'primary',
  className,
  sx,
}: SparklineProps) {
  const margin = 3;
  const dotRadius = 3;

  const [scaleX, scaleY] = React.useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    return [
      scaleLinear(0, data.length, margin, width - margin),
      scaleLinear(min, max, margin, height - margin),
    ];
  }, [data, margin, width, height]);

  const path = [];
  for (let i = 0; i < data.length; i++) {
    path.push(
      `${path.length <= 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(data[i])}`
    );
  }

  const cx = scaleX(data.length - 1);
  const cy = scaleY(data[data.length - 1]);

  return (
    <Root
      className={clsx(
        classes[`${color}Color` as keyof typeof classes],
        className
      )}
      transform={'scale(1,-1)'}
      sx={sx}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={path.join(' ')}
        strokeWidth={1}
        stroke="currentcolor"
        fill="none"
      />
      <circle cx={cx} cy={cy} r={dotRadius} fill="currentcolor"></circle>
    </Root>
  );
}
