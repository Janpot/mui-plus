import * as React from 'react';
import { DataGrid, ColumnDefinitions } from 'mui-plus';
import { Paper } from '@material-ui/core';

const ROWS = 100000;
const COLUMNS = 100000;

const columns: ColumnDefinitions = [];
const rows: { idx: number }[] = [];

for (let columnIdx = 0; columnIdx < COLUMNS; columnIdx++) {
  columns.push({
    key: `col-${columnIdx}`,
    getValue: (row: any) => `${row.idx} ${columnIdx}`,
  });
}

for (let rowIdx = 0; rowIdx < ROWS; rowIdx++) {
  rows.push({ idx: rowIdx });
}

export default function Benchmark() {
  return (
    <Paper style={{ height: 'calc(100vh - 16px)', width: '100%' }}>
      <DataGrid data={rows} rowHeight={32} defaultColumns={columns} />
    </Paper>
  );
}
