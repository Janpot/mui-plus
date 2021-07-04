import * as React from 'react';
import { DataGrid, ColumnDefinition } from 'mui-plus';
import { Paper } from '@material-ui/core';

const data = [
  {
    property: 'foo',
    lat: 50.8949,
    long: 4.3416,
  },
];

const columns: ColumnDefinition<typeof data[number]>[] = [
  {
    key: 'property',
  },
  /// preview-start
  {
    key: 'computed',
    width: 200,
    getValue: (row) => `${row.lat}, ${row.long}`,
  },
  /// preview-end
];

export default function Value() {
  return (
    <Paper style={{ height: 150 }}>
      <DataGrid data={data} defaultColumns={columns} />
    </Paper>
  );
}
