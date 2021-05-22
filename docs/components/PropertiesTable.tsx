import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@material-ui/core';
import React from 'react';
import { Props } from 'react-docgen-typescript';

interface ApiDocProps {
  props: Props;
}

export default function ApiDoc({ props }: ApiDocProps) {
  const properties = React.useMemo(() => Object.entries(props), [props]);
  return (
    <TableContainer component={Paper}>
      <Table aria-label="properties table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Default</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {properties.map(([propName, def]) => (
            <TableRow key={propName}>
              <TableCell>{propName}</TableCell>
              <TableCell>{def.type.name}</TableCell>
              <TableCell>
                {def.defaultValue ? (
                  <code>{def.defaultValue.value}</code>
                ) : null}
              </TableCell>
              <TableCell>{def.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
