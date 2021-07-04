import * as React from 'react';
import { DataGrid, ColumnDefinition } from 'mui-plus';
import { Paper } from '@material-ui/core';

const columns: ColumnDefinition[] = [
  {
    key: 'start',
    align: 'start',
  },
  {
    key: 'center',
    align: 'center',
  },
  /// preview-start
  {
    key: 'end',
    align: 'end',
  },
  /// preview-end
];

const data = [
  {
    start: 'foo',
    center: 'bar',
    end: 'baz',
  },
];

export default function Alignment() {
  return (
    <Paper style={{ height: 150 }}>
      <DataGrid data={data} defaultColumns={columns} />
    </Paper>
  );
}
