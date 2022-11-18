import * as React from 'react';
import { SxProps, experimentalStyled as styled } from '@mui/material';
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

export interface SparkbarsProps {
  /** Width of the sparkbars */
  width?: number;
  /** Height of the sparkbars */
  height?: number;
  /** Sparkbars series, as an array of y-values */
  data: number[];
  /** Theme color of the sparkbars */
  color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'warning' | 'error';
  /** @ignore */
  className?: string;
  /** @ignore */
  sx?: SxProps;
}

export default function Sparkbars({
  width = 120,
  height = 25,
  data,
  color = 'primary',
  className,
  sx,
}: SparkbarsProps) {
  const margin = 3;

  const [scaleX, scaleY] = React.useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);

    return [
      scaleLinear(0, data.length, margin, width - margin),
      scaleLinear(min, max, margin, height - margin),
    ];
  }, [data, margin, width, height]);

  const barWidth = scaleX(1) - scaleX(0);
  const bars: React.ReactNode[] = [];
  for (let i = 0; i < data.length; i++) {
    const origin = scaleY(0);
    const y = scaleY(data[i]);

    bars.push(
      <rect
        key={i}
        x={scaleX(i)}
        y={y > origin ? origin : y}
        width={barWidth}
        height={y > origin ? y - origin : origin - y}
        fill="currentcolor"
      />
    );
  }
  return (
    <Root
      className={clsx(
        classes[`${color}Color` as keyof typeof classes],
        className
      )}
      transform={'scale(1, -1)'}
      sx={sx}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {bars}
    </Root>
  );
}
