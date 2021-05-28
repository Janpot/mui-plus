import * as React from 'react';
import { DataGrid, ColumnDefinitions } from 'mui-plus';
import { Paper } from '@material-ui/core';
import data from '../data/people-10.json';

const columns: ColumnDefinitions = [
  /// preview-start
  {
    key: 'firstName',
    header: 'First Name',
    pin: 'start',
  },
  /// preview-end
  {
    key: 'lastName',
    header: 'Last Name',
    width: 200,
    pin: 'start',
  },
  {
    key: 'address',
    minWidth: 200,
  },
  { key: 'birthDate', width: 200 },
  { key: 'email', width: 200 },
  { key: 'userName', pin: 'end', width: 50 },
  { key: 'phone', pin: 'end', width: 50 },
];

export default function Pinned() {
  return (
    <Paper style={{ height: 300 }}>
      <DataGrid data={data} defaultColumns={columns} />
    </Paper>
  );
}
