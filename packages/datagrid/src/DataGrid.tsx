import * as React from 'react';
import { makeStyles, createSvgIcon } from '@material-ui/core';
import useResizeObserver from './useResizeObserver';
import useEventListener from './useEventListener';
import useCombinedRefs from './useCombinedRefs';
import clsx from 'clsx';
import useIsMounted from './useIsMounted';
import { useControlled } from './useControlled';

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
    overflow: 'hidden',
  },
  tableBody: {
    position: 'relative',
    flex: 1,
  },
  bodyRow: {
    position: 'absolute',
    borderBottom: `1px solid ${theme.palette.divider}`,
    width: '100%',
  },
  headerCell: {
    fontWeight: theme.typography.fontWeightBold,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
  },
  tableCell: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
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

export interface ColumnDefiniton {
  key: string;
  header?: string;
  visible?: boolean;
  getValue?: (row: any) => any;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
}

export type ColumnDefinitons = ColumnDefiniton[];

export interface DataGridProps<RowType = any> {
  columns?: ColumnDefinitons;
  onColumnsChange?: (newValue: ColumnDefinitons) => void;
  defaultColumns?: ColumnDefinitons;
  data: RowType[];
  rowHeight?: number;
}

interface ColumnDimensions {
  left: number;
  width: number;
}

interface ColumnDimensionsMap {
  [key: string]: ColumnDimensions | undefined;
}

interface UseColumnResizingParams {
  columnSizings: ColumnDimensionsMap;
  columns: ColumnDefinitons;
  onColumnsChange: (newValue: ColumnDefinitons) => void;
}

function useColumnResizing({
  columnSizings,
  columns,
  onColumnsChange,
}: UseColumnResizingParams) {
  const isMounted = useIsMounted();
  const [
    resizingColumn,
    setResingColumn,
  ] = React.useState<ResizingColumn | null>(null);

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
      setResingColumn({
        key: columnKey,
        mouseOffset: event.clientX - right,
        left,
        width,
      });
    },
    [columnSizings, isMounted]
  );

  React.useEffect(() => {
    if (!resizingColumn) {
      return;
    }

    const calculateColumnWidth = (mouseX: number): number => {
      const desiredPosition = mouseX - resizingColumn.mouseOffset;
      return desiredPosition - resizingColumn.left;
    };

    const handleDocMouseMove = (event: MouseEvent) => {
      if (!isMounted.current) {
        console.warn('mousemove on unmounted component');
      }
      setResingColumn({
        ...resizingColumn,
        width: calculateColumnWidth(event.clientX),
      });
    };

    const handleDocMouseUp = (event: MouseEvent) => {
      if (!isMounted.current) {
        console.warn('mouseup on unmounted component');
      }
      onColumnsChange(
        columns.map((column) => {
          if (column.key === resizingColumn.key) {
            return {
              ...column,
              width: calculateColumnWidth(event.clientX),
            };
          } else {
            return column;
          }
        })
      );
      setResingColumn(null);
    };

    window.addEventListener('mousemove', handleDocMouseMove);
    window.addEventListener('mouseup', handleDocMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleDocMouseMove);
      window.removeEventListener('mouseup', handleDocMouseUp);
    };
  }, [resizingColumn, isMounted, columns, onColumnsChange]);

  return {
    handleResizerMouseDown,
    resizingColumn,
  };
}

const SeparatorIcon = createSvgIcon(<path d="M11 19V5h2v14z" />, 'Separator');

const clamp = (value: number, lower: number, upper: number): number =>
  Math.min(Math.max(value, lower), upper);

function findNextColumn(
  visibleColumns: ColumnDefinitons,
  columnSizing: ColumnDimensionsMap,
  x: number,
  first = 0,
  last = visibleColumns.length - 1
): number {
  if (first >= last) {
    return first;
  }

  const pivot = first + Math.floor((last - first) / 2);
  const pivotColumn = columnSizing[visibleColumns[pivot].key]!;
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

function calculateColumnSizing(
  visibleColumns: ColumnDefinitons,
  resizingColumn: ResizingColumn | null
): ColumnDimensionsMap {
  const result: ColumnDimensionsMap = {};
  let left = 0;
  for (const column of visibleColumns) {
    const width = clamp(
      resizingColumn && resizingColumn.key === column.key
        ? resizingColumn.width
        : column.width ?? 100,
      column.minWidth ?? 50,
      column.maxWidth ?? Infinity
    );
    result[column.key] = { left, width };
    left += width;
  }
  return result;
}

export default function DataGrid({
  data,
  columns: columnsProp,
  onColumnsChange: onColumnsChangeProp,
  defaultColumns = [],
  rowHeight = 52,
}: DataGridProps) {
  const classes = useStyles();

  const [columns, setColumns] = useControlled(
    'columns',
    columnsProp,
    onColumnsChangeProp,
    defaultColumns
  );

  const visibleColumns = React.useMemo(() => {
    // TODO: stabilize further in case the visibility doesn't change?
    return columns.filter((column) => column.visible ?? true);
  }, [columns]);

  const [virtualSlice, setVirtualSlice] = React.useState<GridVirtualSlice>();

  const columnSizings: ColumnDimensionsMap = React.useMemo(() => {
    return calculateColumnSizing(visibleColumns, null);
  }, [visibleColumns]);

  const totalWidth = React.useMemo(() => {
    if (visibleColumns.length <= 0) {
      return 0;
    }
    const lastColumnKey = visibleColumns[visibleColumns.length - 1].key;
    const lastColumn = columnSizings[lastColumnKey]!;
    return lastColumn.left + lastColumn.width;
  }, [visibleColumns, columnSizings]);

  const totalHeight = rowHeight * data.length;

  const tableHeaderRef = React.useRef<HTMLDivElement>(null);
  const { ref: bodyResizeRef, rect: viewportRect } = useResizeObserver();

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

  const { handleResizerMouseDown, resizingColumn } = useColumnResizing({
    columns,
    onColumnsChange: setColumns,
    columnSizings,
  });

  const columnSizingWithResizing = React.useMemo(() => {
    if (!resizingColumn) {
      return columnSizings;
    } else {
      return calculateColumnSizing(visibleColumns, resizingColumn);
    }
  }, [columnSizings, resizingColumn, visibleColumns]);

  const getCellBoundingrect = React.useCallback(
    (row: number, columnKey: string): BoundingRect => {
      const top = row * rowHeight;
      const { left, width } = columnSizingWithResizing[columnKey]!;
      return {
        top,
        height: rowHeight,
        left,
        width,
      };
    },
    [rowHeight, columnSizingWithResizing]
  );

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
      const column = visibleColumns[columnIdx];
      const headerContent = column?.header ?? column.key;
      headerElms.push(
        <div
          key={column.key}
          className={classes.headerCell}
          style={{ ...getCellBoundingrect(0, column.key), height: 56 }}
        >
          <div className={classes.cellContent}>{headerContent}</div>
          <div
            className={classes.resizer}
            onMouseDown={handleResizerMouseDown}
            data-column={column.key}
          >
            <SeparatorIcon />
          </div>
        </div>
      );
    }
    for (
      let rowIdx = virtualSlice.startRow;
      rowIdx <= virtualSlice.endRow;
      rowIdx += 1
    ) {
      const rowElms: JSX.Element[] = [];
      for (
        let columnIdx = virtualSlice.startColumn;
        columnIdx <= virtualSlice.endColumn;
        columnIdx += 1
      ) {
        const column = visibleColumns[columnIdx];
        const value = column.getValue
          ? column.getValue(data[rowIdx])
          : data[rowIdx][column.key];
        const { left, width } = getCellBoundingrect(rowIdx, column.key);
        rowElms.push(
          <div
            key={`${rowIdx}:${column.key}`}
            className={classes.tableCell}
            style={{ left, width }}
          >
            <div className={classes.cellContent}>{String(value)}</div>
          </div>
        );
      }
      bodyElms.push(
        <div
          key={rowIdx}
          className={classes.bodyRow}
          style={{
            top: rowIdx * rowHeight,
            height: rowHeight,
          }}
        >
          {rowElms}
        </div>
      );
    }
    return { headerElms, bodyElms };
  }, [
    virtualSlice,
    getCellBoundingrect,
    visibleColumns,
    data,
    handleResizerMouseDown,
    rowHeight,
    classes.cellContent,
    classes.headerCell,
    classes.resizer,
    classes.tableCell,
    classes.bodyRow,
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
        [classes.resizing]: !!resizingColumn,
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
