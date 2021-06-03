import { TextField } from '@material-ui/core';
import * as React from 'react';
import SearchBox from './components/SearchBox';

export default {
  logo: <span>Mui+</span>,
  title: 'Mui+: extensions for Material UI',
  repository: 'https://github.com/Janpot/mui-plus',
  search: <SearchBox endpoint="/api/search" />,
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Mui+: extensions for Material UI" />
      <meta name="og:title" content="Mui+: extensions for Material UI" />
    </>
  ),
};
