import * as React from 'react';
import { Axis, Grid, BarSeries, XYChart, ThemeContext } from '@visx/xychart';
import { makeTheme } from 'mui-plus';

interface Datum {
  x: string;
  y: number;
}

const data1: Datum[] = [
  { x: 'Q1', y: 0.2 },
  { x: 'Q2', y: 0.28 },
  { x: 'Q3', y: 0.33 },
  { x: 'Q4', y: 0.39 },
];

const accessors = {
  xAccessor: (d: Datum) => d.x,
  yAccessor: (d: Datum) => d.y,
};

const useTheme = makeTheme();

const percent = new Intl.NumberFormat(undefined, { style: 'percent' });

export default function BasicBars() {
  const theme = useTheme();
  return (
    <XYChart
      theme={theme}
      height={300}
      width={350}
      xScale={{ type: 'band', padding: 0.6 }}
      yScale={{ type: 'linear', nice: true }}
    >
      <Grid columns={false} numTicks={4} />
      <BarSeries dataKey="Line 1" data={data1} {...accessors} />§
      <Axis orientation="bottom" hideTicks />
      <Axis
        orientation="right"
        hideAxisLine
        numTicks={4}
        tickFormat={(value) => percent.format(value)}
      />
    </XYChart>
  );
}
