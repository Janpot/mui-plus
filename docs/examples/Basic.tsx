import * as React from 'react';
import DataGrid from '@mui-plus/datagrid';
import { Paper } from '@material-ui/core';

function useData() {
  return React.useMemo(() => {
    const result = [];
    for (let i = 0; i < 25; i++) {
      result.push({
        firstName: 'Bill',
        lastName: 'Becker',
        address: '6922 Colleen Square',
        birthDate: new Date(448816240341),
        email: 'bill.becker@email.com',
        userName: 'billyboy123',
        phone: '251-526-5211',
      });
    }
    return result;
  }, []);
}

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
  const rows = useData();

  return (
    <Paper style={{ height: 300 }}>
      <DataGrid data={rows} defaultColumns={columns} />
    </Paper>
  );
}
