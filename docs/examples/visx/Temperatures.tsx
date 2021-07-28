import * as React from 'react';
import { Axis, Grid, LineSeries, XYChart, DataProvider } from '@visx/xychart';
import { makeVisxTheme, VisxTooltip, VisxLegend } from 'mui-plus';
import { curveCatmullRom } from '@visx/curve';
import { Typography } from '@material-ui/core';

type Datum = { x: number; y: number };

const makeDatum = (y: number, x: number): Datum => ({ x, y });

const avg = [
  3.5, 3.8, 6.4, 9.9, 13.5, 16.6, 18.5, 18, 15.3, 11.8, 7.3, 4.2,
].map(makeDatum);
const min = [1.2, 1, 2.6, 5.2, 9, 11.9, 14.1, 13.9, 11.5, 8.7, 4.9, 2].map(
  makeDatum
);
const max = [
  5.8, 6.9, 10.3, 14.4, 17.7, 20.8, 22.5, 22.1, 19.2, 15, 9.9, 6.5,
].map(makeDatum);

const useTheme = makeVisxTheme();

const accessors = {
  xAccessor: ({ x }: Datum) => x,
  yAccessor: ({ y }: Datum) => y,
};

const { format: formatTemperature } = new Intl.NumberFormat(undefined, {
  style: 'unit',
  unit: 'celsius',
});
const { format: formatDate } = new Intl.DateTimeFormat(undefined, {
  month: 'short',
});
const formatMonth = (month: number) => formatDate(new Date(0, month));

export default function Temperatures() {
  const theme = useTheme();
  return (
    <DataProvider
      theme={theme}
      xScale={{ type: 'linear' }}
      yScale={{ type: 'linear', nice: true }}
    >
      <XYChart
        height={250}
        width={600}
        margin={{ top: 0, bottom: 30, left: 20, right: 40 }}
      >
        <Grid columns={false} numTicks={4} />
        <LineSeries
          curve={curveCatmullRom}
          dataKey="Avg"
          data={avg}
          {...accessors}
        />
        <LineSeries
          curve={curveCatmullRom}
          dataKey="Min"
          data={min}
          {...accessors}
        />
        <LineSeries
          curve={curveCatmullRom}
          dataKey="Max"
          data={max}
          {...accessors}
        />
        <Axis orientation="bottom" tickFormat={formatMonth} />
        <Axis
          orientation="right"
          hideAxisLine
          numTicks={4}
          tickFormat={formatTemperature}
        />
        <VisxTooltip<Datum>
          snapTooltipToDatumX
          snapTooltipToDatumY
          showVerticalCrosshair
          showDatumGlyph
          renderTooltip={({ tooltipData }) => {
            const nearestDatum = tooltipData?.nearestDatum;
            if (!nearestDatum) return null;
            return (
              <>
                <Typography variant="h6">
                  {formatTemperature(nearestDatum.datum.x)}
                </Typography>
                <Typography variant="body2">
                  {formatMonth(nearestDatum.datum.y)}
                </Typography>
              </>
            );
          }}
        />
      </XYChart>
      <VisxLegend />
    </DataProvider>
  );
}
