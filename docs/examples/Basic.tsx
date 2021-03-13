import * as React from 'react';
import DataGrid from '@mui-plus/datagrid';
import faker from 'faker';

function useData() {
  return React.useMemo(() => {
    const result = [];
    for (let i = 0; i < 25; i++) {
      result.push({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        address: faker.address.streetAddress(),
        birthDate: faker.date.past(90),
        email: faker.internet.email(),
        userName: faker.internet.userName(),
        phone: faker.phone.phoneNumber(),
        timeZone: faker.address.timeZone(),
      });
    }
    return result;
  }, []);
}

const columns = {
  firstName: {
    header: 'First Name',
  },
  lastName: {
    header: 'Last Name',
  },
  address: {
    minWidth: 200,
  },
  birthDate: {},
  email: {},
  userName: {},
  phone: {},
  timeZone: {},
};

export default function Basic() {
  const rows = useData();

  return (
    <div style={{ height: 300 }}>
      <DataGrid data={rows} columns={columns} />
    </div>
  );
}
