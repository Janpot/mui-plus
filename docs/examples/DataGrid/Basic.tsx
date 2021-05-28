import * as React from 'react';
import { DataGrid } from 'mui-plus';
import { Paper } from '@material-ui/core';
import data from '../data/people-10.json';

const columns = [
  {
    key: 'firstName',
    header: 'First Name',
  },
  {
    key: 'lastName',
    header: 'Last Name',
  },
  {
    key: 'address',
    minWidth: 200,
  },
  { key: 'birthDate' },
  { key: 'email' },
  { key: 'userName' },
  { key: 'phone' },
];

export default function Basic() {
  return (
    <Paper style={{ height: 300 }}>
      {/** preview-start */}
      <DataGrid data={data} defaultColumns={columns} />
      {/** preview-end */}
    </Paper>
  );
}
