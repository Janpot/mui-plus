import * as React from 'react';
import { Axis, Grid, GlyphSeries, XYChart, ThemeContext } from '@visx/xychart';
import { GlyphCircle, GlyphSquare, GlyphTriangle } from '@visx/glyph';
import { makeTheme } from 'mui-plus';

interface Datum {
  x: number;
  y: number;
}

const data1: Datum[] = [
  { x: 10, y: 4106543 },
  { x: 23, y: 3678543 },
  { x: 24, y: 6895423 },
  { x: 37, y: 6123482 },
  { x: 47, y: 6123482 },
  { x: 61, y: 12765074 },
  { x: 64, y: 9865093 },
  { x: 65, y: 7435012 },
  { x: 74, y: 12543974 },
  { x: 85, y: 10438746 },
  { x: 106, y: 12908143 },
];

const data2: Datum[] = [
  { x: 31, y: 9764925 },
  { x: 45, y: 8456098 },
  { x: 51, y: 10273649 },
  { x: 68, y: 11203548 },
  { x: 78, y: 8810345 },
  { x: 82, y: 14345035 },
  { x: 103, y: 6987213 },
];

const data3: Datum[] = [
  { x: 54, y: 7824098 },
  { x: 71, y: 8124036 },
  { x: 73, y: 9987123 },
  { x: 90, y: 8724303 },
  { x: 91, y: 12342752 },
  { x: 101, y: 10352428 },
  { x: 111, y: 10987365 },
];

const accessors = {
  xAccessor: (d: Datum) => d.x,
  yAccessor: (d: Datum) => d.y,
};

const useTheme = makeTheme();

export default function BasicGlyphs() {
  const theme = useTheme();
  return (
    <XYChart
      theme={theme}
      height={300}
      width={600}
      xScale={{ type: 'linear', nice: true }}
      yScale={{ type: 'linear', nice: true }}
    >
      <Grid numTicks={4} />
      <GlyphSeries
        dataKey="Glyphs 1"
        data={data1}
        {...accessors}
        size={150}
        renderGlyph={(props) => (
          <GlyphCircle
            fill={props.color}
            size={props.size}
            top={props.y}
            left={props.x}
          />
        )}
      />
      §
      <GlyphSeries
        dataKey="Glyphs 2"
        data={data2}
        {...accessors}
        size={150}
        renderGlyph={(props) => (
          <GlyphSquare
            fill={props.color}
            size={props.size}
            top={props.y}
            left={props.x}
          />
        )}
      />
      §
      <GlyphSeries
        dataKey="Glyphs 3"
        data={data3}
        {...accessors}
        size={150}
        renderGlyph={(props) => (
          <GlyphTriangle
            fill={props.color}
            size={props.size}
            top={props.y}
            left={props.x}
          />
        )}
      />
      §
      <Axis orientation="bottom" hideTicks label="Units" labelOffset={20} />
      <Axis
        orientation="left"
        numTicks={4}
        hideTicks
        tickFormat={(value) => `${Math.round(value / 1000000)}$`}
        label="millions"
      />
    </XYChart>
  );
}
