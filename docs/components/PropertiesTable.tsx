import {
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
  const properties = React.useMemo(
    () =>
      Object.entries(props)
        .filter(([, prop]) => !prop.description.includes('@ignore'))
        .sort((a, b) => a[0].localeCompare(b[0])),
    [props]
  );

  return (
    <TableContainer>
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
              <TableCell>
                <code>{def.type.name}</code>
              </TableCell>
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
