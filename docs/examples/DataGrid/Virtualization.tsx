import * as React from 'react';
import { DataGrid, ColumnDefinitons } from 'mui-plus';
import { Paper } from '@material-ui/core';

const ROWS = 100000;
const COLUMNS = 100000;

const columns: ColumnDefinitons = [];
const rows: { idx: number }[] = [];

for (let columnIdx = 0; columnIdx <= COLUMNS; columnIdx++) {
  columns.push({
    key: `col-${columnIdx}`,
    getValue: (row: any) => `value ${row.idx} ${columnIdx}`,
  });
}

for (let rowIdx = 0; rowIdx <= ROWS; rowIdx++) {
  rows.push({ idx: rowIdx });
}

export default function Basic() {
  return (
    <Paper style={{ height: 300 }}>
      <DataGrid data={rows} defaultColumns={columns} />
    </Paper>
  );
}
