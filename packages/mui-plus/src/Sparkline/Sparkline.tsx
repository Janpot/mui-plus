import { experimentalStyled as styled } from '@material-ui/core';
import { SxProps } from '@material-ui/system';
import clsx from 'clsx';

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
  const min = Math.min(...data);
  const max = Math.max(...data);
  const chartWidth = width - 2 * margin;
  const chartHeight = height - 2 * margin;
  const hStep = chartWidth / data.length;
  const vStep = chartHeight / (max - min);

  const path = [];
  for (let i = 0; i < data.length; i++) {
    path.push(
      `${path.length <= 0 ? 'M' : 'L'} ${margin + i * hStep} ${
        margin + data[i] * vStep
      }`
    );
  }

  const cx = margin + (data.length - 1) * hStep;
  const cy = margin + data[data.length - 1] * vStep;

  return (
    <Root
      className={clsx(
        classes[`${color}Color` as keyof typeof classes],
        className
      )}
      sx={sx}
      width={width}
      height={height}
      viewBox={`0 ${min} ${width} ${height}`}
    >
      <path
        d={path.join(' ')}
        strokeWidth={1}
        stroke="currentcolor"
        fill="none"
      />
      <circle cx={cx} cy={cy} r={3} fill="currentcolor"></circle>
    </Root>
  );
}
