import * as React from 'react';
import { makeStyles, createSvgIcon } from '@material-ui/core';
import useResizeObserver from './useResizeObserver';
import useEventListener from './useEventListener';
import useCombinedRefs from './useCombinedRefs';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    '&.resizing': {
      userSelect: 'none',
    },
  },
  resizing: {},
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
    height: '100%',
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
}));

interface ResizingColumn {
  key: string;
  mouseOffset: number;
  left: number;
  width: number;
}

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
  state?: DataGridState;
  setState?: (newState: DataGridState) => void;
}

interface ColumnDimensions {
  left: number;
  width: number;
}

interface ColumnDimensionsMap {
  [key: string]: ColumnDimensions | undefined;
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

function useIsMounted() {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
}

interface UseColumnResizingParams {
  state: DataGridState;
  setState: React.Dispatch<React.SetStateAction<DataGridState>>;
  columnSizings: ColumnDimensionsMap;
}

function useColumnResizing({
  state,
  setState,
  columnSizings,
}: UseColumnResizingParams) {
  const isMounted = useIsMounted();
  const handleResizerMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const columnKey = event.currentTarget.dataset.column!;
      const sizing = columnSizings[columnKey];
      if (!sizing) {
        return;
      }
      const { left, width } = sizing;
      const right = left + width;
      if (!isMounted.current) {
        console.warn('resizing state on unmounted component x');
      }
      setState((state) => ({
        ...state,
        resizingColumn: {
          key: columnKey,
          mouseOffset: event.clientX - right,
          left,
          width,
        },
      }));
    },
    [columnSizings, setState, isMounted]
  );

  const { resizingColumn } = state;

  React.useEffect(() => {
    if (!resizingColumn) {
      return;
    }

    const calculateColumnWidths = (
      state: DataGridState,
      mouseX: number
    ): ColumnWidths => {
      const desiredPosition = mouseX - resizingColumn.mouseOffset;
      const desiredWidth = desiredPosition - resizingColumn.left;
      return {
        ...state.columnWidths,
        [resizingColumn.key]: desiredWidth,
      };
    };

    const handleDocMouseMove = (event: MouseEvent) => {
      if (!isMounted.current) {
        console.warn('mousemove on unmounted component');
      }
      setState((state) => ({
        ...state,
        columnWidths: calculateColumnWidths(state, event.clientX),
      }));
    };

    const handleDocMouseUp = (event: MouseEvent) => {
      if (!isMounted.current) {
        console.warn('mouseup on unmounted component');
      }
      setState(({ resizingColumn: _, ...state }) => ({
        ...state,
        columnWidths: calculateColumnWidths(state, event.clientX),
      }));
    };

    window.addEventListener('mousemove', handleDocMouseMove);
    window.addEventListener('mouseup', handleDocMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleDocMouseMove);
      window.removeEventListener('mouseup', handleDocMouseUp);
    };
  }, [resizingColumn, setState, isMounted]);

  return {
    handleResizerMouseDown,
    setState,
  };
}

const SeparatorIcon = createSvgIcon(<path d="M11 19V5h2v14z" />, 'Separator');

const clamp = (value: number, lower: number, upper: number): number =>
  Math.min(Math.max(value, lower), upper);

function findNextColumn(
  visibleColumns: string[],
  columnSizing: ColumnDimensionsMap,
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

export default function DataGrid({ columns, data }: DataGridProps) {
  const classes = useStyles();

  const [state, setState] = React.useState<DataGridState>({});
  const visibleColumns = useVisibleColumns(columns, state);
  const rowHeight = 52;

  const [virtualSlice, setVirtualSlice] = React.useState<GridVirtualSlice>();

  const columnSizings: ColumnDimensionsMap = React.useMemo(() => {
    const result: ColumnDimensionsMap = {};
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

  const bodyRef = React.useRef<HTMLDivElement>(null);

  const isMounted = useIsMounted();

  const updateVirtualSlice = React.useCallback(() => {
    if (!viewportRect || !bodyRef.current) return;
    const { scrollLeft, scrollTop } = bodyRef.current;
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
    if (!isMounted.current) {
      console.warn('updating slice on unmounted component');
    }
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
  }, [
    viewportRect,
    rowHeight,
    rowCount,
    visibleColumns,
    columnSizings,
    isMounted,
  ]);

  React.useEffect(() => updateVirtualSlice(), [updateVirtualSlice]);

  const { handleResizerMouseDown } = useColumnResizing({
    state,
    setState,
    columnSizings,
  });

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
      const column = columns[columnKey];
      const headerContent = column?.header ?? columnKey;
      headerElms.push(
        <div
          key={columnKey}
          className={classes.headerCell}
          style={{ ...getCellBoundingrect(0, columnIdx), height: 56 }}
        >
          <div className={classes.cellContent}>{headerContent}</div>
          <div
            className={classes.resizer}
            onMouseDown={handleResizerMouseDown}
            data-column={columnKey}
          >
            <SeparatorIcon />
          </div>
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
  }, [
    virtualSlice,
    getCellBoundingrect,
    visibleColumns,
    data,
    columns,
    handleResizerMouseDown,
    classes.cellContent,
    classes.headerCell,
    classes.resizer,
    classes.tableCell,
  ]);

  const handleWheel = React.useCallback(
    (e: WheelEvent) => {
      if (!e.currentTarget || !viewportRect) {
        return;
      }
      const { scrollLeft, scrollTop } = e.currentTarget as HTMLDivElement;
      e.preventDefault();
      e.stopPropagation();
      const newScrollLeft = clamp(
        scrollLeft + e.deltaX,
        0,
        totalWidth - viewportRect.width
      );
      if (bodyRef.current) {
        bodyRef.current.scrollLeft = newScrollLeft;
        bodyRef.current.scrollTop = scrollTop + e.deltaY;
        updateVirtualSlice();
      }
      if (tableHeaderRef.current) {
        tableHeaderRef.current.scrollLeft = newScrollLeft;
      }
    },
    [updateVirtualSlice, viewportRect, totalWidth]
  );

  useEventListener(bodyRef, 'wheel', handleWheel, {
    passive: false,
  });

  const tableBodyRef = useCombinedRefs(bodyResizeRef, bodyRef);

  return (
    <div
      className={clsx(classes.root, {
        [classes.resizing]: !!state.resizingColumn,
      })}
    >
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
