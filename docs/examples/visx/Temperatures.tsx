import * as React from 'react';
import { Axis, Grid, LineSeries, XYChart, Tooltip } from '@visx/xychart';
import { makeTheme } from 'mui-plus';
import { TooltipProps } from '@visx/xychart/lib/components/Tooltip';
import {
  Tooltip as MuiTooltip,
  Typography,
  useTheme as useMuiTheme,
} from '@material-ui/core';

type Datum = [number, number];

const avg = [
  ...[3.5, 3.8, 6.4, 9.9, 13.5, 16.6, 18.5, 18, 15.3, 11.8, 7.3, 4.2].entries(),
];
const min = [
  ...[1.2, 1, 2.6, 5.2, 9, 11.9, 14.1, 13.9, 11.5, 8.7, 4.9, 2].entries(),
];
const max = [
  ...[
    5.8, 6.9, 10.3, 14.4, 17.7, 20.8, 22.5, 22.1, 19.2, 15, 9.9, 6.5,
  ].entries(),
];

const useTheme = makeTheme();

const accessors = {
  xAccessor: ([x]: Datum) => x,
  yAccessor: ([, y]: Datum) => y,
};

const { format: formatTemperature } = new Intl.NumberFormat(undefined, {
  style: 'unit',
  unit: 'celsius',
});
const { format: formatDate } = new Intl.DateTimeFormat(undefined, {
  month: 'short',
});
const formatMonth = (month: number) => formatDate(new Date(0, month));

interface TooltipGlyphProps {
  radius: number;
  color?: string;
}

const TooltipGlyph = React.forwardRef<SVGSVGElement, TooltipGlyphProps>(
  ({ radius, color, ...props }, ref) => {
    const muiTheme = useMuiTheme();
    return (
      <svg
        width={radius * 2}
        height={radius * 2}
        ref={ref}
        style={{
          position: 'absolute',
          top: -radius,
          left: -radius,
          pointerEvents: 'none',
        }}
        {...props}
      >
        <g transform={`translate(${radius}, ${radius})`}>
          <circle r={radius} cx={0} cy={0} fill={color} opacity="0.3" />
          <circle
            r={radius / 2}
            cx={0}
            cy={0}
            stroke={color}
            fill={muiTheme.palette.background.paper}
            strokeWidth={2}
          />
        </g>
      </svg>
    );
  }
);

function VisxMuiTooltip<Datum extends object>(props: TooltipProps<Datum>) {
  return (
    <Tooltip<Datum>
      snapTooltipToDatumX
      snapTooltipToDatumY
      showVerticalCrosshair
      showDatumGlyph
      unstyled
      applyPositionStyle
      offsetTop={0}
      offsetLeft={0}
      renderTooltip={({ tooltipData, colorScale }) => {
        const nearestDatum = tooltipData?.nearestDatum;
        if (!nearestDatum) return null;
        return (
          <MuiTooltip
            sx={{ pointerEvents: 'none' }}
            open
            enterDelay={0}
            disableHoverListener
            disableInteractive
            title={
              <>
                <Typography variant="h6">
                  {formatTemperature(nearestDatum.datum[1])}
                </Typography>
                <Typography variant="body2">
                  {formatMonth(nearestDatum.datum[0])}
                </Typography>
              </>
            }
            placement="top"
            arrow
          >
            <TooltipGlyph radius={12} color={colorScale?.(nearestDatum.key)} />
          </MuiTooltip>
        );
        // return (
        //   <div>
        //     <div style={{ color: colorScale(tooltipData.nearestDatum.key) }}>
        //       {tooltipData.nearestDatum.key}
        //     </div>
        //     {formatMonth(accessors.xAccessor(tooltipData.nearestDatum.datum))}
        //     {', '}
        //     {formatTemperature(accessors.yAccessor(tooltipData.nearestDatum.datum))}
        //   </div>
        // );
      }}
    />
  );
}

export default function Temperatures() {
  const theme = useTheme();
  return (
    <XYChart
      theme={theme}
      height={300}
      width={600}
      xScale={{ type: 'linear' }}
      yScale={{ type: 'linear', nice: true }}
    >
      <Grid columns={false} numTicks={4} />
      <LineSeries dataKey="Average" data={avg} {...accessors} />§
      <LineSeries dataKey="Min" data={min} {...accessors} />§
      <LineSeries dataKey="Max" data={max} {...accessors} />§
      <Axis orientation="bottom" tickFormat={formatMonth} />
      <Axis
        orientation="right"
        hideAxisLine
        numTicks={4}
        tickFormat={formatTemperature}
      />
      <VisxMuiTooltip<Datum>
        snapTooltipToDatumX
        snapTooltipToDatumY
        showVerticalCrosshair
        showDatumGlyph
      />
    </XYChart>
  );
}
