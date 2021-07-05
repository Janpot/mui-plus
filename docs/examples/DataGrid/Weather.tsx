import * as React from 'react';
import { DataGrid, ColumnDefinition, Sparkbars } from 'mui-plus';
import { Paper, Link } from '@material-ui/core';
import data from '../data/uk-station-data.json';

function numberColumn(
  format?: Intl.NumberFormatOptions
): Partial<ColumnDefinition> {
  const formatter = new Intl.NumberFormat(undefined, format);
  return {
    align: 'end',
    renderContent: ({ value }) =>
      value === null || value === undefined ? '' : formatter.format(value),
  };
}

const columns: ColumnDefinition[] = [
  {
    key: 'name',
    header: 'Station',
    width: 250,
    pin: 'start',
  },
  /// preview-start
  {
    key: 'location',
    width: 150,
    getValue: (row) => [row.lat, row.long],
    renderContent: ({ value: [lat, long] }) => (
      <Link
        noWrap
        sx={{ display: 'block' }}
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${long}`}
      >
        {lat}, {long}
      </Link>
    ),
    header: 'Location',
  },
  /// preview-end
  {
    key: 'closed',
    header: 'Closed',
    align: 'center',
  },
  {
    key: 'tmin',
    header: (
      <>
        T<sub>min</sub>
      </>
    ),
    width: 125,
    ...numberColumn({ style: 'unit', unit: 'celsius' }),
  },
  {
    key: 'tmax',
    header: (
      <>
        T<sub>max</sub>
      </>
    ),
    width: 125,
    ...numberColumn({ style: 'unit', unit: 'celsius' }),
  },
  {
    key: 'rain12',
    header: 'Rain',
    minWidth: 160,
    align: 'center',
    renderContent: ({ value }) => (
      <Sparkbars sx={{ verticalAlign: 'middle' }} data={value} />
    ),
  },
  {
    key: 'rain',
    header: (
      <>
        Rain<sub>total</sub>
      </>
    ),
    width: 125,
    ...numberColumn({ style: 'unit', unit: 'millimeter' }),
  },
  {
    key: 'af',
    header: 'Frost',
    width: 125,
    ...numberColumn({ style: 'unit', unit: 'day' }),
  },
  {
    key: 'sun',
    header: 'Sunlight',
    width: 125,
    ...numberColumn({ style: 'unit', unit: 'hour' }),
  },
];

export default function Weather() {
  return (
    <Paper style={{ height: 300 }}>
      <DataGrid data={data} defaultColumns={columns} />
    </Paper>
  );
}
