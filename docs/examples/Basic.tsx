import * as React from 'react';
import Container from '@material-ui/core/Container';
import DataGrid from '@mui-plus/datagrid';
import faker from 'faker';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  example: {
    margin: theme.spacing(4),
    height: 400,
  },
}));

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

export default function Basic() {
  const classes = useStyles();

  const rows = useData();

  const columns = React.useMemo(
    () => ({
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
    }),
    []
  );

  return (
    <Container maxWidth="md">
      <div className={classes.example}>
        <DataGrid data={rows} columns={columns} getKey={(row) => row.key} />
      </div>
    </Container>
  );
}
