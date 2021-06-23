import * as React from 'react';
import { buildChartTheme } from '@visx/xychart';
import { grey, cyan, purple, orange } from '@material-ui/core/colors';
import { useTheme as useMuiTheme } from '@material-ui/core';

export function makeTheme() {
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
