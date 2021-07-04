import * as React from 'react';
import { DataGrid, ColumnDefinitions } from 'mui-plus';
import { Paper } from '@material-ui/core';
import data from '../data/people-10.json';

export default function Controlled() {
  const [columns, setColumns] = React.useState<ColumnDefinitions>([
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
  ]);

  return (
    <Paper style={{ height: 300 }}>
      {/** preview-start */}
      <DataGrid data={data} columns={columns} onColumnsChange={setColumns} />
      {/** preview-end */}
    </Paper>
  );
}
