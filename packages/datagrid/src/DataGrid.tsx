import * as React from 'react';
import { makeStyles, createSvgIcon } from '@material-ui/core';
import useResizeObserver from './useResizeObserver';
// import useEventListener from './useEventListener';
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

  tableHeadRenderViewport: {
    overflow: 'hidden',
    borderBottom: `1px solid ${theme.palette.divider}`,
    height: 56,
  },
  tableHeadRenderPane: {
    fontWeight: theme.typography.fontWeightBold,
    position: 'relative',
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
  },
  tableBodyScrollViewport: {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
  },
  tableBodyScrollPane: {},
  tableBodyRenderViewport: {
    position: 'sticky',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  tableBodyRenderPane: {},

  tableRow: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    width: '100%',
    position: 'relative',
    display: 'flex',
    overflow: 'hidden',
  },
  tableCell: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    flexShrink: 0,
    flexgrow: 0,
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
  rootRef: React.RefObject<HTMLDivElement>;
  columnSizings: ColumnDimensionsMap;
  columns: ColumnDefinitons;
  onColumnsChange: (newValue: ColumnDefinitons) => void;
}

function useColumnResizing({
  rootRef,
  columnSizings,
  columns,
  onColumnsChange,
}: UseColumnResizingParams) {
  const classes = useStyles();
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
      if (!rootRef.current) {
        return;
      }
      const resizingCells = rootRef.current.querySelectorAll<HTMLDivElement>(
        `.${classes.tableCell}[data-column=${resizingColumn.key}]`
      );
      const width = calculateColumnWidth(event.clientX);
      resizingCells.forEach((cell) => (cell.style.width = `${width}px`));
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
  }, [
    rootRef,
    resizingColumn,
    isMounted,
    columns,
    onColumnsChange,
    classes.tableCell,
  ]);

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
  visibleColumns: ColumnDefinitons
): ColumnDimensionsMap {
  const result: ColumnDimensionsMap = {};
  let left = 0;
  for (const column of visibleColumns) {
    const width = clamp(
      column.width ?? 100,
      column.minWidth ?? 50,
      column.maxWidth ?? Infinity
    );
    result[column.key] = { left, width };
    left += width;
  }
  return result;
}

interface TableRowProps {
  height: number;
  children?: React.ReactNode;
}

function TableRow({ height, children }: TableRowProps) {
  const classes = useStyles();
  return (
    <div className={classes.tableRow} style={{ height }}>
      {children}
    </div>
  );
}

interface TableCellProps {
  width: number;
  columnKey?: string;
  children?: React.ReactNode;
}

function TableCell({ width, columnKey, children }: TableCellProps) {
  const classes = useStyles();
  return (
    <div
      className={classes.tableCell}
      style={{ width }}
      data-column={columnKey}
    >
      {children}
    </div>
  );
}

export default function DataGrid({
  data,
  columns: columnsProp,
  onColumnsChange: onColumnsChangeProp,
  defaultColumns = [],
  rowHeight = 52,
}: DataGridProps) {
  const classes = useStyles();
  const rootRef = React.useRef<HTMLDivElement>(null);

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
    return calculateColumnSizing(visibleColumns);
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

  const tableHeadRenderPaneRef = React.useRef<HTMLDivElement>(null);
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
    rootRef,
    columns,
    onColumnsChange: setColumns,
    columnSizings,
  });

  const getCellBoundingrect = React.useCallback(
    (row: number, columnKey: string): BoundingRect => {
      const top = row * rowHeight;
      const { left, width } = columnSizings[columnKey]!;
      return {
        top,
        height: rowHeight,
        left,
        width,
      };
    },
    [rowHeight, columnSizings]
  );

  const {
    headerElms,
    bodyElms,
  }: {
    headerElms: JSX.Element;
    bodyElms: JSX.Element[];
  } = React.useMemo(() => {
    if (!virtualSlice) {
      return {
        headerElms: <React.Fragment></React.Fragment>,
        bodyElms: [],
      };
    }

    const columnsSlice = visibleColumns.slice(
      virtualSlice.startColumn,
      virtualSlice.endColumn
    );

    const leftMargin = getCellBoundingrect(
      0,
      visibleColumns[virtualSlice.startColumn].key
    ).left;

    const headerElms = (
      <React.Fragment>
        <TableCell width={leftMargin} />
        {columnsSlice.map((column) => {
          const headerContent = column?.header ?? column.key;
          const { width } = getCellBoundingrect(0, column.key);
          return (
            <TableCell key={column.key} width={width} columnKey={column.key}>
              <div className={classes.cellContent}>{headerContent}</div>
              <div
                className={classes.resizer}
                onMouseDown={handleResizerMouseDown}
                data-column={column.key}
              >
                <SeparatorIcon />
              </div>
            </TableCell>
          );
        })}
      </React.Fragment>
    );

    const bodyElms = [
      <TableRow key={-1} height={virtualSlice.startRow * rowHeight} />,
    ];
    for (
      let rowIdx = virtualSlice.startRow;
      rowIdx <= virtualSlice.endRow;
      rowIdx += 1
    ) {
      bodyElms.push(
        <TableRow key={rowIdx} height={rowHeight}>
          <TableCell width={leftMargin} />
          {columnsSlice.map((column) => {
            const value = column.getValue
              ? column.getValue(data[rowIdx])
              : data[rowIdx][column.key];
            const { width } = getCellBoundingrect(rowIdx, column.key);
            return (
              <TableCell key={column.key} width={width} columnKey={column.key}>
                <div className={classes.cellContent}>{String(value)}</div>
              </TableCell>
            );
          })}
        </TableRow>
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
    classes.resizer,
  ]);

  const tableBodyRenderPaneRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      updateVirtualSlice();
      const { scrollLeft, scrollTop } = event.currentTarget;
      if (tableBodyRenderPaneRef.current) {
        tableBodyRenderPaneRef.current.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`;
      }
      if (tableHeadRenderPaneRef.current) {
        tableHeadRenderPaneRef.current.style.transform = `translate(${-scrollLeft}px, 0px)`;
      }
    },
    [updateVirtualSlice]
  );

  // useEventListener(bodyRef, 'wheel', handleWheel, {
  //   passive: false,
  // });

  const tableBodyScrollViewportRef = useCombinedRefs(bodyResizeRef, bodyRef);

  return (
    <div
      ref={rootRef}
      className={clsx(classes.root, {
        [classes.resizing]: !!resizingColumn,
      })}
    >
      <div className={classes.tableHeadRenderViewport}>
        <div
          ref={tableHeadRenderPaneRef}
          className={classes.tableHeadRenderPane}
          style={{ width: totalWidth }}
        >
          {headerElms}
        </div>
      </div>
      <div
        ref={tableBodyScrollViewportRef}
        className={classes.tableBodyScrollViewport}
        onScroll={handleScroll}
      >
        <div
          className={classes.tableBodyScrollPane}
          style={{ width: totalWidth, height: totalHeight }}
        >
          <div
            className={classes.tableBodyRenderViewport}
            style={{ width: viewportRect?.width, height: viewportRect?.height }}
          >
            <div
              ref={tableBodyRenderPaneRef}
              className={classes.tableBodyRenderPane}
              style={{ width: totalWidth, height: totalHeight }}
            >
              {bodyElms}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
