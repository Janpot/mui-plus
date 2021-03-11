import * as React from 'react';
import { makeStyles, createSvgIcon } from '@material-ui/core';
import useResizeObserver from './useResizeObserver';
import useEventListener from './useEventListener';
import useCombinedRefs from './useCombinedRefs';

const useStyles = makeStyles((theme) => ({
  resizing: {},
  grid: {
    display: 'grid',
  },
  cell: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
  },
  textContent: {
    padding: '0 16px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  cellHead: {
    height: 56,
  },
  cellBody: {
    height: 52,
  },
  virtualPadding: {
    gridColumn: '1 / -1',
  },
  resizer: {
    color: theme.palette.divider,
    display: 'inline-flex',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    cursor: 'col-resize',
    zIndex: 1,
    transform: 'translateX(50%)',
    '&:hover': {
      color: theme.palette.action.active,
    },
  },

  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  tableHeadViewport: {
    overflow: 'hidden',
    borderBottom: `1px solid ${theme.palette.divider}`,
    height: 56,
  },
  tableBodyViewport: {
    flex: 1,
    overflow: 'auto',
  },
  tableHead: {
    position: 'relative',
  },
  tableBody: {
    position: 'relative',
    flex: 1,
  },
  headerCell: {
    fontWeight: theme.typography.fontWeightBold,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
  },
  tableCell: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
  },
  cellContent: {
    padding: '0 16px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

interface ResizingColumn {
  key: string;
  mouseOffset: number;
}

export interface ColumnState {}

interface ColumnWidths {
  [key: string]: number | undefined;
}

interface ColumnVisbility {
  [key: string]: boolean | undefined;
}

export interface DataGridState {
  columnOrder?: string[];
  columnVisibility?: ColumnVisbility;
  columnWidths?: ColumnWidths;
  resizingColumn?: ResizingColumn;
}

export interface ColumnDefiniton {
  header?: string;
  getValue?: (row: any) => any;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
}

export interface ColumnDefinitons {
  [key: string]: ColumnDefiniton | undefined;
}

export interface DataGridProps<RowType = any> {
  columns: ColumnDefinitons;
  data: RowType[];
  getKey: (row: RowType) => string;
  state?: DataGridState;
  setState?: (newState: DataGridState) => void;
}

interface HeaderElms {
  [key: string]: HTMLDivElement | null | undefined;
}

interface ColumnSizing {
  left: number;
  width: number;
}

interface ColumnSizings {
  [key: string]: ColumnSizing | undefined;
}

function useVisibleColumns(
  columns: ColumnDefinitons,
  state: DataGridState
): string[] {
  return React.useMemo(() => {
    const result: string[] = [];
    const allColumns = [...(state.columnOrder || []), ...Object.keys(columns)];
    const seen = new Set<string>();
    for (const column of allColumns) {
      if (
        !seen.has(column) &&
        (!state.columnVisibility || state.columnVisibility[column])
      ) {
        seen.add(column);
        result.push(column);
      }
    }
    return result;
  }, [columns, state.columnOrder, state.columnVisibility]);
}

function calculateGridTemplateColumns(
  columns: ColumnDefinitons,
  visibleColumns: string[],
  columnWidths?: ColumnWidths
) {
  return visibleColumns
    .map((columnKey) => {
      const columnStateWidth = columnWidths?.[columnKey];
      if (typeof columnStateWidth === 'number') {
        return `${columnStateWidth}px`;
      } else {
        const column = columns[columnKey]!;
        const min = column.minWidth ? `${column.minWidth}px` : 0;
        const max = column.maxWidth ? `${column.maxWidth}px` : '1fr';
        return `minmax(${min}, ${max})`;
      }
    })
    .join(' ');
}

function getCurrentColumnWidths(headers: HeaderElms): ColumnWidths {
  return Object.fromEntries(
    Object.entries(headers).flatMap(([key, elm]) =>
      elm ? [[key, elm?.getBoundingClientRect().width]] : []
    )
  );
}

interface UseColumnResizingParams {
  state: DataGridState;
  setState: React.Dispatch<React.SetStateAction<DataGridState>>;
  headerElms: React.MutableRefObject<HeaderElms>;
  columns: ColumnDefinitons;
  gridRoot: React.RefObject<HTMLDivElement>;
  visibleColumns: string[];
}

function useColumnResizing({
  state,
  setState,
  headerElms,
  columns,
  gridRoot,
  visibleColumns,
}: UseColumnResizingParams) {
  const handleResizerMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const columnKey = event.currentTarget.dataset.column!;
      const headerElm = headerElms.current[columnKey];
      if (!headerElm) {
        return;
      }
      const { right: columnRight } = headerElm.getBoundingClientRect();
      setState((state) => ({
        ...state,
        columnWidths: getCurrentColumnWidths(headerElms.current),
        resizingColumn: {
          key: columnKey,
          mouseOffset: event.clientX - columnRight,
        },
      }));
    },
    []
  );

  const { columnWidths, resizingColumn } = state;

  React.useEffect(() => {
    if (!resizingColumn) {
      return;
    }

    const calculateColumnWidths = (mouseX?: number) => {
      const column = columns[resizingColumn.key];
      if (!column || typeof mouseX !== 'number') {
        return columnWidths;
      }
      const resizedColumn = headerElms.current?.[resizingColumn.key];
      if (!resizedColumn) {
        return columnWidths;
      }
      const { left: resizedColumnLeft } = resizedColumn.getBoundingClientRect();
      const desiredPosition = mouseX - resizingColumn.mouseOffset;
      const desiredWidth = desiredPosition - resizedColumnLeft;
      const width = Math.max(
        Math.min(desiredWidth, column.maxWidth || Infinity),
        column.minWidth || 0
      );
      return {
        ...columnWidths,
        [resizingColumn.key]: width,
      };
    };

    const handleDocMouseMove = (event: MouseEvent) => {
      if (!gridRoot.current) return;
      const columnWidths = calculateColumnWidths(event.clientX);
      const gridTemplateColumns = calculateGridTemplateColumns(
        columns,
        visibleColumns,
        columnWidths
      );
      gridRoot.current.style.gridTemplateColumns = gridTemplateColumns;
    };

    const handleDocMouseUp = (event: MouseEvent) => {
      if (!gridRoot.current) return;
      setState(({ resizingColumn: _, ...state }) => ({
        ...state,
        columnWidths: calculateColumnWidths(event.clientX),
      }));
    };

    document.addEventListener('mousemove', handleDocMouseMove);
    document.addEventListener('mouseup', handleDocMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleDocMouseMove);
      document.removeEventListener('mouseup', handleDocMouseUp);
    };
  }, [visibleColumns, columnWidths, resizingColumn, columns]);

  return {
    handleResizerMouseDown,
  };
}

const SeparatorIcon = createSvgIcon(<path d="M11 19V5h2v14z" />, 'Separator');

const clamp = (value: number, lower: number, upper: number): number =>
  Math.min(Math.max(value, lower), upper);

function findNextColumn(
  visibleColumns: string[],
  columnSizing: ColumnSizings,
  x: number,
  first = 0,
  last = visibleColumns.length - 1
): number {
  if (first >= last) {
    return first;
  }

  const pivot = first + Math.floor((last - first) / 2);
  const pivotColumn = columnSizing[visibleColumns[pivot]]!;
  if (x < pivotColumn.left) {
    return findNextColumn(visibleColumns, columnSizing, x, first, pivot);
  } else {
    return findNextColumn(visibleColumns, columnSizing, x, pivot + 1, last);
  }
}

interface BoundingRect {
  top: number;
  height: number;
  left: number;
  width: number;
}

interface GridVirtualSlice {
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

interface Dimensions {
  width: number;
  height: number;
}

export default function DataGrid({ columns, data, getKey }: DataGridProps) {
  const classes = useStyles();

  const [state, setState] = React.useState<DataGridState>({});
  const visibleColumns = useVisibleColumns(columns, state);
  const rowHeight = 52;

  const [virtualSlice, setVirtualSlice] = React.useState<GridVirtualSlice>();

  const columnSizings: ColumnSizings = React.useMemo(() => {
    const result: ColumnSizings = {};
    let left = 0;
    for (const columnKey of visibleColumns) {
      const column = columns[columnKey]!;
      const width =
        state.columnWidths?.[columnKey] ??
        clamp(
          column.width ?? 100,
          column.minWidth ?? 0,
          column.maxWidth ?? Infinity
        );
      result[columnKey] = { left, width };
      left += width;
    }
    return result;
  }, [visibleColumns, columns, state.columnWidths]);

  const totalWidth = React.useMemo(() => {
    const lastColumnKey = visibleColumns[visibleColumns.length - 1];
    const lastColumn = columnSizings[lastColumnKey]!;
    return lastColumn.left + lastColumn.width;
  }, [visibleColumns, columnSizings]);

  const totalHeight = rowHeight * data.length;

  const tableHeaderRef = React.useRef<HTMLDivElement>(null);
  const { ref: bodyResizeRef, rect: viewportRect } = useResizeObserver();

  const getCellBoundingrect = React.useCallback(
    (row: number, column: number): BoundingRect => {
      const top = row * rowHeight;
      const { left, width } = columnSizings[visibleColumns[column]]!;
      return {
        top,
        height: rowHeight,
        left,
        width,
      };
    },
    [rowHeight, visibleColumns, columnSizings]
  );

  const rowCount = data.length;

  const updateVirtualSlice = React.useCallback(
    (scrollLeft: number, scrollTop: number) => {
      if (!viewportRect) return;
      const firstVisibleRow = Math.floor(scrollTop / rowHeight);
      const lastVisibleRow = Math.floor(
        (scrollTop + viewportRect.height) / rowHeight
      );
      const firstVisibleColumn =
        findNextColumn(visibleColumns, columnSizings, scrollLeft) - 1;
      const lastVisibleColumn = findNextColumn(
        visibleColumns,
        columnSizings,
        scrollLeft + viewportRect.width
      );
      const overscan = 3;
      setVirtualSlice((slice) => {
        if (
          slice?.startRow === firstVisibleRow &&
          slice?.endRow === lastVisibleRow &&
          slice?.startColumn === firstVisibleColumn &&
          slice?.endColumn === lastVisibleColumn
        ) {
          return slice;
        } else {
          return {
            startRow: Math.max(0, firstVisibleRow - overscan),
            endRow: Math.min(rowCount - 1, lastVisibleRow + overscan),
            startColumn: Math.max(0, firstVisibleColumn - overscan),
            endColumn: Math.min(
              visibleColumns.length - 1,
              lastVisibleColumn + overscan
            ),
          };
        }
      });
    },
    [
      viewportRect,
      rowHeight,
      rowCount,
      totalHeight,
      visibleColumns,
      columnSizings,
      totalWidth,
    ]
  );

  React.useEffect(() => updateVirtualSlice(0, 0), [updateVirtualSlice]);

  const {
    headerElms,
    bodyElms,
  }: {
    headerElms: JSX.Element[];
    bodyElms: JSX.Element[];
  } = React.useMemo(() => {
    if (!virtualSlice) {
      return {
        headerElms: [],
        bodyElms: [],
      };
    }
    const headerElms = [];
    const bodyElms = [];
    for (
      let columnIdx = virtualSlice.startColumn;
      columnIdx <= virtualSlice.endColumn;
      columnIdx += 1
    ) {
      const columnKey = visibleColumns[columnIdx];
      headerElms.push(
        <div
          key={columnKey}
          className={classes.headerCell}
          style={{ ...getCellBoundingrect(0, columnIdx), height: 56 }}
        >
          <div className={classes.cellContent}>{columnKey}</div>
        </div>
      );
      for (
        let rowIdx = virtualSlice.startRow;
        rowIdx <= virtualSlice.endRow;
        rowIdx += 1
      ) {
        const value = data[rowIdx][columnKey];
        bodyElms.push(
          <div
            key={`${rowIdx}:${columnKey}`}
            className={classes.tableCell}
            style={getCellBoundingrect(rowIdx, columnIdx)}
          >
            <div className={classes.cellContent}>{String(value)}</div>
          </div>
        );
      }
    }
    return { headerElms, bodyElms };
  }, [virtualSlice, getCellBoundingrect, visibleColumns, data]);

  const bodyRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = React.useCallback(
    (e: Event) => {
      if (!e.currentTarget) {
        return;
      }
      const { scrollLeft, scrollTop } = e.currentTarget as HTMLDivElement;
      e.preventDefault();
      e.stopPropagation();
      if (bodyRef.current) {
        bodyRef.current.scrollLeft = scrollLeft;
        bodyRef.current.scrollTop = scrollTop;
        updateVirtualSlice(
          bodyRef.current.scrollLeft,
          bodyRef.current.scrollTop
        );
      }
      if (tableHeaderRef.current) {
        tableHeaderRef.current.scrollLeft = scrollLeft;
      }
    },
    [updateVirtualSlice]
  );

  const wheelEventRef = useEventListener('scroll', handleScroll, {
    passive: false,
  });

  const tableBodyRef = useCombinedRefs(bodyResizeRef, wheelEventRef, bodyRef);

  return (
    <div className={classes.root}>
      <div ref={tableHeaderRef} className={classes.tableHeadViewport}>
        <div className={classes.tableHead} style={{ width: totalWidth }}>
          {headerElms}
        </div>
      </div>
      <div ref={tableBodyRef} className={classes.tableBodyViewport}>
        <div
          className={classes.tableBody}
          style={{ width: totalWidth, height: totalHeight }}
        >
          {bodyElms}
        </div>
      </div>
    </div>
  );
}
