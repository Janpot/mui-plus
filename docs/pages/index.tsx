import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ProTip from '../src/ProTip';
import Link from '../src/Link';
import Copyright from '../src/Copyright';
import DataGrid, { DataGridProps } from '@mui-plus/datagrid';

const props = {
  columns: {
    col1: {
      header: 'Column 1',
    },
    col2: {
      maxWidth: 250,
    },
  },
  data: [
    { key: 1, col1: 'foo1', col2: 'bar1' },
    { key: 2, col1: 'foo2', col2: 'bar2' },
    { key: 3, col1: 'foo3', col2: 'bar3' },
    { key: 4, col1: 'foo3', col2: 'bar3' },
    { key: 5, col1: 'foo3', col2: 'bar3' },
    { key: 6, col1: 'foo3', col2: 'bar3' },
    { key: 7, col1: 'foo3', col2: 'bar3' },
    { key: 8, col1: 'foo3', col2: 'bar3' },
    { key: 9, col1: 'foo3', col2: 'bar3' },
    { key: 10, col1: 'foo3', col2: 'bar3' },
  ],
  getKey: (row) => row.key,
};

export default function Index() {
  return (
    <Container maxWidth="sm">
      <DataGrid {...props} />
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Next.js with TypeScript example
        </Typography>
        <Link href="/about" color="secondary">
          Go to the about page
        </Link>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  );
}
