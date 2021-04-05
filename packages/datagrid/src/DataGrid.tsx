/*
TODO
- resizing min/max width
- ltr
- pinned columns
- row hover
- flex
*/

import * as React from 'react';
import { makeStyles, createSvgIcon } from '@material-ui/core';
import useResizeObserver from './useResizeObserver';
// import useEventListener from './useEventListener';
import useCombinedRefs from './useCombinedRefs';
import clsx from 'clsx';
import { useControlled } from './useControlled';
import { clamp } from './math';
import { getTableVirtualSlice } from './virtualization';

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
  [key: string]: ColumnDimensions;
}

interface HasForEach<T> {
  forEach(callbackfn: (value: T, key: number) => void): void;
}

interface UseColumnResizingParams {
  columnSizings: ColumnDimensionsMap;
  columns: ColumnDefinitons;
  getColumnElements: (columnKey: string) => HasForEach<HTMLElement>;
  onColumnsChange: (newValue: ColumnDefinitons) => void;
}

function useColumnResizing({
  columnSizings,
  columns,
  onColumnsChange,
  getColumnElements,
}: UseColumnResizingParams) {
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
      setResingColumn({
        key: columnKey,
        mouseOffset: event.clientX - right,
        left,
      });
    },
    [columnSizings]
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
      const width = calculateColumnWidth(event.clientX);
      const resizingElms = getColumnElements(resizingColumn.key);
      resizingElms.forEach((elm) => {
        elm.style.width = `${width}px`;
      });
    };

    const handleDocMouseUp = (event: MouseEvent) => {
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
  }, [resizingColumn, columns, onColumnsChange, getColumnElements]);

  return {
    handleResizerMouseDown,
    resizingColumn,
  };
}

const SeparatorIcon = createSvgIcon(<path d="M11 19V5h2v14z" />, 'Separator');

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

  const updateVirtualSlice = React.useCallback(
    (scrollLeft: number, scrollTop: number) => {
      if (!viewportRect) return;
      const getColumnStart = (columnIndex: number) =>
        columnSizings[visibleColumns[columnIndex].key].left;
      const { startRow, endRow, startColumn, endColumn } = getTableVirtualSlice(
        {
          rowCount,
          rowHeight,
          columnCount: visibleColumns.length,
          getColumnStart,
          viewportWidth: viewportRect.width,
          viewportheight: viewportRect.height,
          horizontalScroll: scrollLeft,
          verticalScroll: scrollTop,
          overscan: 3,
        }
      );
      setVirtualSlice((slice) => {
        if (
          slice?.startRow === startRow &&
          slice?.endRow === endRow &&
          slice?.startColumn === startColumn &&
          slice?.endColumn === endColumn
        ) {
          return slice;
        } else {
          return { startRow, endRow, startColumn, endColumn };
        }
      });
    },
    [viewportRect, rowHeight, rowCount, visibleColumns, columnSizings]
  );

  React.useEffect(() => {
    if (!bodyRef.current) return;
    const { scrollLeft, scrollTop } = bodyRef.current;
    updateVirtualSlice(scrollLeft, scrollTop);
  }, [updateVirtualSlice]);

  const getColumnElements = React.useCallback(
    (columnKey: string) => {
      return (
        rootRef.current?.querySelectorAll<HTMLDivElement>(
          `.${classes.tableCell}[data-column=${columnKey}]`
        ) || []
      );
    },
    [classes.tableCell]
  );

  const { handleResizerMouseDown, resizingColumn } = useColumnResizing({
    columns,
    getColumnElements,
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
      virtualSlice.endColumn + 1
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
      const { scrollLeft, scrollTop } = event.currentTarget;
      updateVirtualSlice(scrollLeft, scrollTop);
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
