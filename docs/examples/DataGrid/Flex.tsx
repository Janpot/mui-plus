import * as React from 'react';
import { DataGrid, ColumnDefinition } from 'mui-plus';
import { Paper } from '@material-ui/core';

const columns: ColumnDefinition[] = [
  {
    key: 'first',
    flex: 1,
  },
  {
    key: 'second',
    flex: 3,
  },
  /// preview-start
  {
    key: 'third',
    flex: 2,
  },
  /// preview-end
];

const data = [
  {
    first: 'foo',
    second: 'bar',
    third: 'baz',
  },
];

export default function Alignment() {
  return (
    <Paper style={{ height: 150 }}>
      <DataGrid data={data} defaultColumns={columns} />
    </Paper>
  );
}
