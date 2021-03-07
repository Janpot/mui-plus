import * as React from 'react';
import './DataGrid.css';

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

function className(...names: (string | null | undefined)[]): string {
  return names
    .filter(Boolean)
    .map((name) => `DataGrid_${name}`)
    .join(' ');
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
      const desiredPosition = mouseX - resizingColumn.mouseOffset;
      const desiredWidth = desiredPosition - resizedColumn.offsetLeft;
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

export default function DataGrid({ columns, data, getKey }: DataGridProps) {
  const [state, setState] = React.useState<DataGridState>({});
  const { columnWidths } = state;
  const visibleColumns = useVisibleColumns(columns, state);
  const gridRoot = React.useRef<HTMLDivElement>(null);

  const headerElms = React.useRef<HeaderElms>({});
  React.useEffect(() => {
    headerElms.current = Object.fromEntries(
      Object.keys(columns).map((columnKey) => [
        columnKey,
        headerElms.current[columnKey],
      ])
    );
  }, [columns]);

  const gridTemplateColumns = React.useMemo(() => {
    return calculateGridTemplateColumns(columns, visibleColumns, columnWidths);
  }, [columns, visibleColumns, columnWidths]);

  const { handleResizerMouseDown } = useColumnResizing({
    state,
    setState,
    visibleColumns,
    headerElms,
    columns,
    gridRoot,
  });

  const classes = [];
  if (state.resizingColumn) {
    classes.push('resizing');
  }

  return (
    <div
      ref={gridRoot}
      className={className('root', ...classes)}
      style={{ gridTemplateColumns }}
    >
      {visibleColumns.map((columnKey) => {
        const column = columns[columnKey];
        return (
          <div
            ref={(elm) => (headerElms.current[columnKey] = elm)}
            key={columnKey}
            className={className('cell', 'header')}
          >
            {column?.header || columnKey}
            <div
              className={className('resizer')}
              onMouseDown={handleResizerMouseDown}
              data-column={columnKey}
            />
          </div>
        );
      })}
      <div className={className('virtual-padding')} style={{ height: 0 }} />
      {data.map((row) => {
        const rowKey = getKey(row);
        return visibleColumns.map((columnKey) => {
          const column = columns[columnKey]!;
          // TODO: Guarantee uniqueness?
          const cellKey = `${rowKey}:${columnKey}`;
          return (
            <div key={cellKey} className={className('cell', 'body')}>
              {column.getValue ? column.getValue(row) : row[columnKey]}
            </div>
          );
        });
      })}
      <div className={className('virtual-padding')} style={{ height: 0 }} />
    </div>
  );
}
