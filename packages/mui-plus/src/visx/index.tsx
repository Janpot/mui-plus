import * as React from 'react';
import {
  buildChartTheme,
  Tooltip,
  TooltipContext,
  TooltipContextType,
} from '@visx/xychart';
import { grey, cyan, purple, orange } from '@material-ui/core/colors';
import {
  useTheme as useMuiTheme,
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
  tooltipClasses as muiTooltipClasses,
  experimentalStyled as styled,
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

interface HighlightedGlyphProps {
  radius?: number;
  color?: string;
}

function HighlightedGlyph({ radius = 12, color }: HighlightedGlyphProps) {
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

interface TooltipGlyphProps {
  datumKey: string;
  radius?: number;
  color?: string;
}

function VisxTooltipGlyph<Datum extends object>({
  datumKey,
  radius = 4,
  color,
}: TooltipGlyphProps) {
  const { tooltipData } = React.useContext(
    TooltipContext
  ) as TooltipContextType<Datum>;
  const nearestDatumKey = tooltipData?.nearestDatum?.key;
  return nearestDatumKey === datumKey ? (
    <HighlightedGlyph radius={radius * 3} color={color} />
  ) : (
    <circle r={radius} cx={0} cy={0} fill={color} />
  );
}

const StyledMuiTooltip = styled(({ className, ...props }: MuiTooltipProps) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${muiTooltipClasses.tooltip}`]: {
    background:
      theme.palette.mode === 'dark'
        ? undefined
        : theme.palette.background.paper,
    color: theme.palette.text.secondary,
    boxShadow: theme.shadows[1],
  },
  [`& .${muiTooltipClasses.arrow}`]: {
    color:
      theme.palette.mode === 'dark'
        ? undefined
        : theme.palette.background.paper,
    '&:before': {
      boxShadow:
        theme.palette.mode === 'dark'
          ? undefined
          : // TODO: can this be improved? It seems a bit offset
            theme.shadows[1],
    },
  },
}));

interface TooltipContentProps {
  children?: React.ReactNode;
}

function TooltipContent({ children }: TooltipContentProps) {
  return (
    <StyledMuiTooltip
      sx={{ pointerEvents: 'none' }}
      open
      enterDelay={0}
      disableHoverListener
      disableInteractive
      title={<>{children}</>}
      placement="top"
      arrow
    >
      <div />
    </StyledMuiTooltip>
  );
}

export function VisxTooltip<Datum extends object>({
  renderTooltip,
  ...props
}: TooltipProps<Datum>) {
  return (
    <Tooltip<Datum>
      snapTooltipToDatumX
      snapTooltipToDatumY
      showVerticalCrosshair
      showDatumGlyph
      showSeriesGlyphs
      unstyled
      applyPositionStyle
      renderGlyph={({ key, color }) => (
        <VisxTooltipGlyph datumKey={key} color={color} />
      )}
      offsetLeft={0}
      renderTooltip={(params) =>
        params.tooltipData?.nearestDatum ? (
          <TooltipContent>{renderTooltip(params)}</TooltipContent>
        ) : null
      }
      {...props}
    />
  );
}
