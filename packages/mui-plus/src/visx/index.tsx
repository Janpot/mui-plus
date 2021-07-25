import * as React from 'react';
import { buildChartTheme, Tooltip } from '@visx/xychart';
import { grey, cyan, purple, orange } from '@material-ui/core/colors';
import {
  useTheme as useMuiTheme,
  Tooltip as MuiTooltip,
} from '@material-ui/core';
import { TooltipProps } from '@visx/xychart/lib/components/Tooltip';

export function makeVisxTheme() {
  return function useTheme() {
    const muiTheme = useMuiTheme();
    return React.useMemo(
      () =>
        buildChartTheme({
          backgroundColor: '#222',
          colors: [cyan[400], purple[400], orange[400]],
          tickLength: 4,
          xAxisLineStyles: {
            strokeWidth: 1,
            stroke:
              muiTheme.palette.mode === 'light'
                ? muiTheme.palette.grey[400]
                : muiTheme.palette.grey[200],
          },
          yAxisLineStyles: {
            strokeWidth: 1,
            stroke:
              muiTheme.palette.mode === 'light'
                ? muiTheme.palette.grey[400]
                : muiTheme.palette.grey[200],
          },
          svgLabelSmall: {
            fill:
              muiTheme.palette.mode === 'light'
                ? muiTheme.palette.grey[700]
                : muiTheme.palette.grey[100],
            fontFamily: muiTheme.typography.fontFamily,
            fontWeight: muiTheme.typography.fontWeightRegular,
            fontSize: 12,
          },
          svgLabelBig: {
            fill:
              muiTheme.palette.mode === 'light'
                ? muiTheme.palette.grey[700]
                : muiTheme.palette.grey[100],
            fontFamily: muiTheme.typography.fontFamily,
            fontWeight: muiTheme.typography.fontWeightRegular,
            fontSize: 12,
          },
          gridColor: muiTheme.palette.mode === 'light' ? grey[200] : grey[800],
          gridColorDark: grey[100],
        }),
      [muiTheme]
    );
  };
}

interface TooltipGlyphProps {
  radius?: number;
  color?: string;
}

export function VisxTooltipGlyph({ radius = 12, color }: TooltipGlyphProps) {
  const muiTheme = useMuiTheme();
  return (
    <g>
      <circle r={radius} cx={0} cy={0} fill={color} opacity="0.3" />
      <circle
        r={radius / 2}
        cx={0}
        cy={0}
        stroke={color || muiTheme.palette.primary.main}
        fill={muiTheme.palette.background.paper}
        strokeWidth={2}
      />
    </g>
  );
}

export function VisxTooltip<Datum extends object>(props: TooltipProps<Datum>) {
  return (
    <Tooltip<Datum>
      snapTooltipToDatumX
      snapTooltipToDatumY
      showVerticalCrosshair
      showDatumGlyph
      // showSeriesGlyphs
      unstyled
      applyPositionStyle
      renderGlyph={({ color }) => <VisxTooltipGlyph color={color} />}
      offsetLeft={0}
      renderTooltip={(params) => {
        const { tooltipData } = params;
        const nearestDatum = tooltipData?.nearestDatum;
        if (!nearestDatum) return null;
        return (
          <MuiTooltip
            sx={{ pointerEvents: 'none' }}
            open
            enterDelay={0}
            disableHoverListener
            disableInteractive
            title={<>{props.renderTooltip(params)}</>}
            placement="top"
            arrow
          >
            <div />
          </MuiTooltip>
        );
      }}
    />
  );
}
