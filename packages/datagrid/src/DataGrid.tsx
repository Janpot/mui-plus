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
    flexDirection: 'row',
    height: '100%',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    '&.resizing': {
      userSelect: 'none',
    },
  },
  resizing: {},

  pinnedStartColumns: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  pinnedStartHeader: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    height: 56,
  },
  pinnedStartBody: {
    flex: 1,
    overflow: 'hidden',
  },

  pinnedEndColumns: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  pinnedEndHeader: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    height: 56,
  },
  pinnedEndBody: {
    flex: 1,
    overflow: 'hidden',
  },

  centerColumns: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },

  tableHeadRenderViewport: {
    display: 'flex',
    overflow: 'hidden',
    borderBottom: `1px solid ${theme.palette.divider}`,
    height: 56,
  },
  tableHeadRenderPane: {
    fontWeight: theme.typography.fontWeightBold,
    position: 'relative',
    height: '100%',
    display: 'flex',
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
  offset: number;
}

export interface ColumnDefinition {
  key: string;
  pin?: 'start' | 'end';
  header?: string;
  visible?: boolean;
  getValue?: (row: any) => any;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
}

export type ColumnDefinitions = ColumnDefinition[];

export interface DataGridProps<RowType = any> {
  columns?: ColumnDefinitions;
  onColumnsChange?: (newValue: ColumnDefinitions) => void;
  defaultColumns?: ColumnDefinitions;
  data: RowType[];
  rowHeight?: number;
}

interface ColumnDimensions {
  offset: number;
  width: number;
}

interface ColumnDimensionsMap {
  [key: string]: ColumnDimensions;
}

interface ColumnDefinitionMap {
  [key: string]: ColumnDefinition;
}

interface HasForEach<T> {
  forEach(callbackfn: (value: T, key: number) => void): void;
}

interface UseColumnResizingParams {
  columnDimensions: ColumnDimensionsMap;
  columns: ColumnDefinitions;
  columnByKey: ColumnDefinitionMap;
  getColumnElements: (columnKey: string) => HasForEach<HTMLElement>;
  onColumnsChange: (newValue: ColumnDefinitions) => void;
}

function useColumnResizing({
  columnDimensions,
  columns,
  columnByKey,
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
      const dimensions = columnDimensions[columnKey];
      if (!dimensions) {
        return;
      }
      const { offset, width } = dimensions;
      const right = offset + width;
      setResingColumn({
        key: columnKey,
        mouseOffset: event.clientX - right,
        offset,
      });
    },
    [columnDimensions]
  );

  React.useEffect(() => {
    if (!resizingColumn) {
      return;
    }

    const calculateResizedColumnWidth = (mouseX: number): number => {
      const desiredPosition = mouseX - resizingColumn.mouseOffset;
      const desiredWidth = desiredPosition - resizingColumn.offset;
      return calculateColumnWidth(
        columnByKey[resizingColumn.key],
        desiredWidth
      );
    };

    const handleDocMouseMove = (event: MouseEvent) => {
      const width = calculateResizedColumnWidth(event.clientX);
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
              width: calculateResizedColumnWidth(event.clientX),
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
    resizingColumn,
    columns,
    columnByKey,
    onColumnsChange,
    getColumnElements,
  ]);

  return {
    handleResizerMouseDown,
    isResizing: !!resizingColumn,
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

function calculateColumnWidth(
  column: ColumnDefinition,
  width?: number
): number {
  return clamp(
    width ?? column.width ?? 100,
    column.minWidth ?? 50,
    column.maxWidth ?? Infinity
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

  const [virtualSlice, setVirtualSlice] = React.useState<GridVirtualSlice>();

  const {
    centerColumns,
    pinnedStartColumns,
    pinnedEndColumns,
    columnDimensions,
    columnByKey,
  } = React.useMemo(() => {
    const pinnedStartColumns: ColumnDefinitions = [];
    const pinnedEndColumns: ColumnDefinitions = [];
    const centerColumns: ColumnDefinitions = [];
    const columnDimensions: ColumnDimensionsMap = {};
    const columnByKey: ColumnDefinitionMap = {};
    let pinnedStartOffset = 0;
    let pinnedEndOffset = 0;
    let centerOffset = 0;
    for (const column of columns) {
      if (column.visible !== false) {
        const width = calculateColumnWidth(column);
        let offset;
        if (column.pin === 'start') {
          pinnedStartColumns.push(column);
          offset = pinnedStartOffset;
          pinnedStartOffset += width;
        } else if (column.pin === 'end') {
          pinnedEndColumns.push(column);
          offset = pinnedEndOffset;
          pinnedEndOffset += width;
        } else {
          centerColumns.push(column);
          offset = centerOffset;
          centerOffset += width;
        }
        columnDimensions[column.key] = { width, offset };
      }
      columnByKey[column.key] = column;
    }
    return {
      centerColumns,
      pinnedStartColumns,
      pinnedEndColumns,
      columnByKey,
      columnDimensions,
    };
  }, [columns]);

  const totalWidth = React.useMemo(() => {
    if (centerColumns.length <= 0) {
      return 0;
    }
    const lastColumnKey = centerColumns[centerColumns.length - 1].key;
    const lastColumn = columnDimensions[lastColumnKey]!;
    return lastColumn.offset + lastColumn.width;
  }, [centerColumns, columnDimensions]);

  const totalHeight = rowHeight * data.length;

  const tableHeadRenderPaneRef = React.useRef<HTMLDivElement>(null);
  const { ref: bodyResizeRef, rect: viewportRect } = useResizeObserver();

  const rowCount = data.length;

  const bodyRef = React.useRef<HTMLDivElement>(null);

  const updateVirtualSlice = React.useCallback(
    (scrollLeft: number, scrollTop: number) => {
      if (!viewportRect) return;
      const getColumnStart = (columnIndex: number) =>
        columnDimensions[centerColumns[columnIndex].key].offset;
      const { startRow, endRow, startColumn, endColumn } = getTableVirtualSlice(
        {
          rowCount,
          rowHeight,
          columnCount: centerColumns.length,
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
    [viewportRect, rowHeight, rowCount, centerColumns, columnDimensions]
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

  const { handleResizerMouseDown, isResizing } = useColumnResizing({
    columns,
    columnByKey,
    getColumnElements,
    onColumnsChange: setColumns,
    columnDimensions,
  });

  const getCellBoundingrect = React.useCallback(
    (row: number, columnKey: string): BoundingRect => {
      const top = row * rowHeight;
      const { offset, width } = columnDimensions[columnKey]!;
      return {
        top,
        height: rowHeight,
        left: offset,
        width,
      };
    },
    [rowHeight, columnDimensions]
  );

  const {
    headerElms,
    bodyElms,
    pinnedStartHeaderElms,
    pinnedStartElms,
  }: {
    headerElms: JSX.Element;
    bodyElms: JSX.Element[];
    pinnedStartHeaderElms: JSX.Element;
    pinnedStartElms: JSX.Element[];
  } = React.useMemo(() => {
    if (!virtualSlice) {
      return {
        headerElms: <React.Fragment></React.Fragment>,
        bodyElms: [],
        pinnedStartHeaderElms: <React.Fragment></React.Fragment>,
        pinnedStartElms: [],
      };
    }

    const columnsSlice = centerColumns.slice(
      virtualSlice.startColumn,
      virtualSlice.endColumn + 1
    );

    const leftMargin = getCellBoundingrect(
      0,
      centerColumns[virtualSlice.startColumn].key
    ).left;

    const pinnedStartHeaderElms = (
      <React.Fragment>
        {pinnedStartColumns.map((column) => {
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

    const topMargin = virtualSlice.startRow * rowHeight;

    const pinnedStartElms = [<TableRow key={-1} height={topMargin} />];
    const bodyElms = [<TableRow key={-1} height={topMargin} />];
    for (
      let rowIdx = virtualSlice.startRow;
      rowIdx <= virtualSlice.endRow;
      rowIdx += 1
    ) {
      pinnedStartElms.push(
        <TableRow key={rowIdx} height={rowHeight}>
          {pinnedStartColumns.map((column) => {
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

    return { headerElms, bodyElms, pinnedStartHeaderElms, pinnedStartElms };
  }, [
    virtualSlice,
    getCellBoundingrect,
    centerColumns,
    pinnedStartColumns,
    data,
    handleResizerMouseDown,
    rowHeight,
    classes.cellContent,
    classes.resizer,
  ]);

  const tableBodyRenderPaneRef = React.useRef<HTMLDivElement>(null);
  const tableBodyPinnedStartRenderPaneRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollLeft, scrollTop } = event.currentTarget;
      updateVirtualSlice(scrollLeft, scrollTop);
      if (tableBodyRenderPaneRef.current) {
        tableBodyRenderPaneRef.current.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`;
      }
      if (tableBodyPinnedStartRenderPaneRef.current) {
        tableBodyPinnedStartRenderPaneRef.current.style.transform = `translate(0px, ${-scrollTop}px)`;
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
        [classes.resizing]: isResizing,
      })}
    >
      <div className={classes.pinnedStartColumns}>
        <div className={classes.pinnedStartHeader}>{pinnedStartHeaderElms}</div>
        <div className={classes.pinnedStartBody}>
          <div ref={tableBodyPinnedStartRenderPaneRef}>{pinnedStartElms}</div>
        </div>
      </div>
      <div className={classes.centerColumns}>
        <div
          className={classes.tableHeadRenderViewport}
          style={{ width: viewportRect?.width }}
        >
          <div
            ref={tableHeadRenderPaneRef}
            className={classes.tableHeadRenderPane}
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
              style={{
                width: viewportRect?.width,
                height: viewportRect?.height,
              }}
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
    </div>
  );
}
