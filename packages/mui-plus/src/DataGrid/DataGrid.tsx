/*
TODO
- ltr
- row hover
- flex
*/

import * as React from 'react';
import { createSvgIcon, experimentalStyled as styled } from '@material-ui/core';
import useResizeObserver from './useResizeObserver';
// import useEventListener from './useEventListener';
import clsx from 'clsx';
import { useControlled } from '../utils/useControlled';
import { clamp } from '../utils/math';
import {
  getVirtualSliceFixed,
  getVirtualSliceVariable,
} from '../utils/virtualization';
import Scroller from './Scroller';

type TableClass =
  | 'resizing'
  | 'reverse'
  | 'tableCell'
  | 'centerHeader'
  | 'pinnedStartHeader'
  | 'pinnedEndHeader'
  | 'tableHeadRenderPane'
  | 'tableHead'
  | 'tableBody'
  | 'tableColumns'
  | 'pinnedStartColumns'
  | 'pinnedEndColumns'
  | 'centerColumns'
  | 'tableRowRoot'
  | 'columnAlignStart'
  | 'columnAlignCenter'
  | 'columnAlignEnd'
  | 'cellContent'
  | 'resizer';

const classes: {
  [Key in TableClass]: `MuiPlus${Capitalize<Key>}`;
} = {
  resizing: 'MuiPlusResizing',
  reverse: 'MuiPlusReverse',
  tableCell: 'MuiPlusTableCell',
  centerHeader: 'MuiPlusCenterHeader',
  pinnedStartHeader: 'MuiPlusPinnedStartHeader',
  pinnedEndHeader: 'MuiPlusPinnedEndHeader',
  tableHeadRenderPane: 'MuiPlusTableHeadRenderPane',
  tableHead: 'MuiPlusTableHead',
  tableBody: 'MuiPlusTableBody',
  tableColumns: 'MuiPlusTableColumns',
  pinnedStartColumns: 'MuiPlusPinnedStartColumns',
  pinnedEndColumns: 'MuiPlusPinnedEndColumns',
  centerColumns: 'MuiPlusCenterColumns',
  tableRowRoot: 'MuiPlusTableRowRoot',
  columnAlignStart: 'MuiPlusColumnAlignStart',
  columnAlignCenter: 'MuiPlusColumnAlignCenter',
  columnAlignEnd: 'MuiPlusColumnAlignEnd',
  cellContent: 'MuiPlusCellContent',
  resizer: 'MuiPlusResizer',
};

export { classes as dataGridClasses };

const alignmentClass = {
  start: classes.columnAlignStart,
  center: classes.columnAlignCenter,
  end: classes.columnAlignEnd,
};

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,

  [`&.${classes.resizing}`]: {
    userSelect: 'none',
  },

  [`& .${classes.centerHeader}`]: {
    flex: 1,
    overflow: 'hidden',
  },

  [`& .${classes.pinnedStartHeader}`]: {
    fontWeight: theme.typography.fontWeightBold,
    display: 'flex',
  },

  [`& .${classes.pinnedEndHeader}`]: {
    fontWeight: theme.typography.fontWeightBold,
    display: 'flex',
  },

  [`& .${classes.tableHeadRenderPane}`]: {
    fontWeight: theme.typography.fontWeightBold,
    position: 'relative',
    height: '100%',
    display: 'flex',
  },

  [`& .${classes.tableHead}`]: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
  },

  [`& .${classes.tableBody}`]: {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
  },

  [`& .${classes.tableColumns}`]: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
  },

  [`& .${classes.pinnedStartColumns}`]: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },

  [`& .${classes.pinnedEndColumns}`]: {
    borderLeft: `1px solid ${theme.palette.divider}`,
  },

  [`& .${classes.centerColumns}`]: {
    flex: 1,
    overflow: 'hidden',
  },

  [`& .${classes.tableRowRoot}`]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    width: '100%',
    position: 'relative',
    display: 'flex',
    overflow: 'visible',
    [`&.${classes.reverse}`]: {
      flexDirection: 'row-reverse',
    },
  },

  [`& .${classes.tableCell}`]: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    height: '100%',
    flexShrink: 0,
    flexgrow: 0,

    [`&.${classes.columnAlignStart}`]: {
      justifyContent: 'flex-start',
    },

    [`&.${classes.columnAlignCenter}`]: {
      justifyContent: 'center',
    },

    [`&.${classes.columnAlignEnd}`]: {
      justifyContent: 'flex-end',
    },
  },

  [`& .${classes.tableHead} .${classes.tableCell}`]: {
    position: 'relative',
  },

  [`& .${classes.cellContent}`]: {
    padding: '0 16px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },

  [`& .${classes.resizer}`]: {
    color: theme.palette.divider,
    display: 'inline-flex',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    cursor: 'col-resize',
    width: 10,
    zIndex: 1,
    '&:hover': {
      color: theme.palette.action.active,
    },
  },

  [`& .${classes.resizer} svg`]: {
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    transform: 'translateX(50%)',
  },

  [`& .${classes.reverse} .${classes.resizer}`]: {
    right: 'unset',
    left: 0,
  },

  [`& .${classes.reverse} .${classes.resizer} svg`]: {
    left: 0,
    transform: 'translateX(-50%)',
  },
}));

interface ResizingColumn {
  key: string;
  mouseStartX: number;
  reverse: boolean;
  width: number;
}

export interface ColumnDefinition<R = any, V = any> {
  key: string;
  pin?: 'start' | 'end';
  align?: 'start' | 'center' | 'end';
  header?: React.ReactNode;
  visible?: boolean;
  getValue?: (row: R) => V;
  renderContent?: (params: { value: V }) => React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
}

export type ColumnDefinitions = ColumnDefinition[];

export interface DataGridProps<RowType = any> {
  /**
   * Column definitions for the grid.
   */
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
  const [resizingColumn, setResingColumn] =
    React.useState<ResizingColumn | null>(null);

  const handleResizerMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const columnKey = event.currentTarget.dataset.column!;
      const reverse = !!event.currentTarget.dataset.reverse;
      const dimensions = columnDimensions[columnKey];
      if (!dimensions) {
        return;
      }
      setResingColumn({
        key: columnKey,
        mouseStartX: event.clientX,
        reverse,
        width: dimensions.width,
      });
    },
    [columnDimensions]
  );

  React.useEffect(() => {
    if (!resizingColumn) {
      return;
    }

    const calculateResizedColumnWidth = (mouseX: number): number => {
      const widthOffset = mouseX - resizingColumn.mouseStartX;
      const desiredWidth =
        resizingColumn.width + (resizingColumn.reverse ? -1 : 1) * widthOffset;
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
  reverse?: boolean;
  children?: React.ReactNode;
}

function TableRow({ height, children, reverse }: TableRowProps) {
  return (
    <div
      className={clsx(classes.tableRowRoot, { [classes.reverse]: reverse })}
      style={{ height }}
    >
      {children}
    </div>
  );
}

interface RenderColumnsOptions {
  reverse?: boolean;
  leftMargin?: number;
}

interface TableCellProps {
  width: number;
  columnKey?: string;
  children?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

function TableCell({
  width,
  columnKey,
  children,
  align = 'start',
}: TableCellProps) {
  const alignClass: string = alignmentClass[align];
  return (
    <div
      style={{ width }}
      className={clsx(classes.tableCell, alignClass)}
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

/**
 * mui-plus DataGrid Component
 */
export default function DataGrid({
  data,
  columns: columnsProp,
  onColumnsChange: onColumnsChangeProp,
  defaultColumns = [],
  rowHeight = 52,
}: DataGridProps) {
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
    pinnedStartWidth,
    pinnedEndWidth,
    centerWidth,
  } = React.useMemo(() => {
    const pinnedStartColumns: ColumnDefinitions = [];
    const pinnedEndColumns: ColumnDefinitions = [];
    const centerColumns: ColumnDefinitions = [];
    const columnDimensions: ColumnDimensionsMap = {};
    const columnByKey: ColumnDefinitionMap = {};
    let pinnedStartWidth = 0;
    let pinnedEndWidth = 0;
    let centerWidth = 0;
    for (const column of columns) {
      if (column.visible !== false) {
        const width = calculateColumnWidth(column);
        let offset;
        if (column.pin === 'start') {
          pinnedStartColumns.push(column);
          offset = pinnedStartWidth;
          pinnedStartWidth += width;
        } else if (column.pin === 'end') {
          pinnedEndColumns.push(column);
          offset = pinnedEndWidth;
          pinnedEndWidth += width;
        } else {
          centerColumns.push(column);
          offset = centerWidth;
          centerWidth += width;
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
      pinnedStartWidth,
      pinnedEndWidth,
      centerWidth,
    };
  }, [columns]);

  const totalHeight = rowHeight * data.length;
  const totalWidth = pinnedStartWidth + centerWidth + pinnedEndWidth;

  const tableHeadRenderPaneRef = React.useRef<HTMLDivElement>(null);
  const { ref: tableBodyRef, rect: bodyRect } = useResizeObserver();

  const rowCount = data.length;
  const centerColumnCount = centerColumns.length;

  const { ref: centerColumnsRef, rect: centerViewport } = useResizeObserver();

  const getCenterColumnOffset = React.useCallback(
    (columnIndex: number) =>
      columnDimensions[centerColumns[columnIndex].key].offset,
    [centerColumns, columnDimensions]
  );

  const updateVirtualSlice = React.useCallback(
    (scrollLeft: number, scrollTop: number) => {
      if (!centerViewport) return;

      const overscan = 3;

      const [startRow, endRow] = getVirtualSliceFixed(
        rowCount,
        rowHeight,
        scrollTop,
        scrollTop + centerViewport.height,
        overscan
      );

      const [startColumn, endColumn] = getVirtualSliceVariable(
        centerColumnCount,
        getCenterColumnOffset,
        scrollLeft,
        scrollLeft + centerViewport.width,
        overscan
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
    [
      centerViewport,
      rowHeight,
      rowCount,
      getCenterColumnOffset,
      centerColumnCount,
    ]
  );

  const getColumnElements = React.useCallback((columnKey: string) => {
    return (
      rootRef.current?.querySelectorAll<HTMLDivElement>(
        `.${classes.tableCell}[data-column=${columnKey}]`
      ) || []
    );
  }, []);

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
    centerHeaderElms,
    centerElms,
    pinnedStartHeaderElms,
    pinnedStartElms,
    pinnedEndHeaderElms,
    pinnedEndElms,
  }: {
    centerHeaderElms: React.ReactNode;
    centerElms: React.ReactNode;
    pinnedStartHeaderElms: React.ReactNode;
    pinnedStartElms: React.ReactNode;
    pinnedEndHeaderElms: React.ReactNode;
    pinnedEndElms: React.ReactNode;
  } = React.useMemo(() => {
    if (!virtualSlice) {
      return {
        centerHeaderElms: <React.Fragment></React.Fragment>,
        centerElms: [],
        pinnedStartHeaderElms: <React.Fragment></React.Fragment>,
        pinnedStartElms: [],
        pinnedEndHeaderElms: <React.Fragment></React.Fragment>,
        pinnedEndElms: [],
      };
    }

    const columnsSlice = centerColumns.slice(
      virtualSlice.startColumn,
      virtualSlice.endColumn
    );

    const renderHeader = (
      columns: ColumnDefinitions,
      { reverse = false }: RenderColumnsOptions = {}
    ) => (
      <TableRow height={56} reverse={reverse}>
        {columns.map((column) => {
          const headerContent = column?.header ?? column.key;
          const { width } = getCellBoundingrect(0, column.key);
          return (
            <TableCell
              key={column.key}
              width={width}
              columnKey={column.key}
              align={column.align}
            >
              <div className={classes.cellContent}>{headerContent}</div>
              <div
                className={classes.resizer}
                onMouseDown={handleResizerMouseDown}
                data-column={column.key}
                data-reverse={reverse ? true : undefined}
              >
                <SeparatorIcon />
              </div>
            </TableCell>
          );
        })}
      </TableRow>
    );

    const pinnedStartHeaderElms = renderHeader(pinnedStartColumns);
    const centerHeaderElms = renderHeader(columnsSlice);
    const pinnedEndHeaderElms = renderHeader(pinnedEndColumns, {
      reverse: true,
    });

    const renderBody = (
      columns: ColumnDefinitions,
      { reverse = false }: RenderColumnsOptions = {}
    ) => {
      const elms = [];
      for (
        let rowIdx = virtualSlice.startRow;
        rowIdx < virtualSlice.endRow;
        rowIdx += 1
      ) {
        elms.push(
          <TableRow key={rowIdx} height={rowHeight} reverse={reverse}>
            {columns.map((column) => {
              const value = column.getValue
                ? column.getValue(data[rowIdx])
                : data[rowIdx][column.key];
              const { width } = getCellBoundingrect(rowIdx, column.key);
              const content = column.renderContent ? (
                column.renderContent({ value })
              ) : (
                <div className={classes.cellContent}>{String(value)}</div>
              );
              return (
                <TableCell
                  key={column.key}
                  width={width}
                  columnKey={column.key}
                  align={column.align}
                >
                  {content}
                </TableCell>
              );
            })}
          </TableRow>
        );
      }
      return elms;
    };

    const pinnedStartElms = renderBody(pinnedStartColumns);
    const centerElms = renderBody(columnsSlice);
    const pinnedEndElms = renderBody(pinnedEndColumns, { reverse: true });

    return {
      centerHeaderElms,
      centerElms,
      pinnedStartHeaderElms,
      pinnedStartElms,
      pinnedEndElms,
      pinnedEndHeaderElms,
    };
  }, [
    virtualSlice,
    getCellBoundingrect,
    centerColumns,
    pinnedStartColumns,
    pinnedStartWidth,
    data,
    handleResizerMouseDown,
    rowHeight,
    pinnedEndColumns,
  ]);

  const tableBodyRenderPaneRef = React.useRef<HTMLDivElement>(null);
  const pinnedStartRenderPaneRef = React.useRef<HTMLDivElement>(null);
  const pinnedEndRenderPaneRef = React.useRef<HTMLDivElement>(null);

  const sliceLeft = virtualSlice
    ? getCenterColumnOffset(virtualSlice.startColumn)
    : 0;

  const sliceTop = virtualSlice ? virtualSlice.startRow * rowHeight : 0;

  const scrollPosition = React.useRef({ top: 0, left: 0 });
  const updateScroll = React.useCallback(() => {
    const { left: scrollLeft, top: scrollTop } = scrollPosition.current;
    updateVirtualSlice(scrollLeft, scrollTop);

    const deltaX = sliceLeft - scrollLeft;
    const deltaY = sliceTop - scrollTop;

    if (tableBodyRenderPaneRef.current) {
      tableBodyRenderPaneRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
    if (pinnedStartRenderPaneRef.current) {
      pinnedStartRenderPaneRef.current.style.transform = `translate(0px, ${deltaY}px)`;
    }
    if (pinnedEndRenderPaneRef.current) {
      pinnedEndRenderPaneRef.current.style.transform = `translate(0px, ${deltaY}px)`;
    }
    if (tableHeadRenderPaneRef.current) {
      tableHeadRenderPaneRef.current.style.transform = `translate(${deltaX}px, 0px)`;
    }
  }, [updateVirtualSlice, sliceLeft, sliceTop]);

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollLeft } = event.currentTarget;
      scrollPosition.current.top = scrollTop;
      scrollPosition.current.left = scrollLeft;
      updateScroll();
    },
    [updateScroll]
  );

  React.useLayoutEffect(() => updateScroll(), [updateScroll]);

  // useEventListener(bodyRef, 'wheel', handleWheel, {
  //   passive: false,
  // });

  const hasPinnedStart = pinnedStartColumns.length > 0;
  const hasPinnedEnd = pinnedEndColumns.length > 0;

  return (
    <Root ref={rootRef} className={clsx({ [classes.resizing]: isResizing })}>
      <div className={classes.tableHead}>
        {hasPinnedStart && (
          <div className={classes.pinnedStartHeader}>
            {pinnedStartHeaderElms}
          </div>
        )}
        <div
          className={classes.centerHeader}
          style={{ width: bodyRect?.width }}
        >
          <div
            className={classes.tableHeadRenderPane}
            ref={tableHeadRenderPaneRef}
            style={{ width: totalWidth }}
          >
            {centerHeaderElms}
          </div>
        </div>
        {hasPinnedEnd && (
          <div className={classes.pinnedEndHeader}>{pinnedEndHeaderElms}</div>
        )}
      </div>
      <div ref={tableBodyRef} className={classes.tableBody}>
        <Scroller
          onScroll={handleScroll}
          scrollHeight={totalHeight}
          scrollWidth={totalWidth}
        >
          <div className={classes.tableColumns}>
            {hasPinnedStart && (
              <div className={classes.pinnedStartColumns}>
                <div ref={pinnedStartRenderPaneRef}>{pinnedStartElms}</div>
              </div>
            )}
            <div className={classes.centerColumns} ref={centerColumnsRef}>
              <div
                ref={tableBodyRenderPaneRef}
                style={{ width: totalWidth, height: totalHeight }}
              >
                {centerElms}
              </div>
            </div>
            {hasPinnedEnd && (
              <div className={classes.pinnedEndColumns}>
                <div ref={pinnedEndRenderPaneRef}>{pinnedEndElms}</div>
              </div>
            )}
          </div>
        </Scroller>
      </div>
    </Root>
  );
}
