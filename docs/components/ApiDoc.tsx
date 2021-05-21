import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@material-ui/core';
import React from 'react';
import { ComponentDoc } from 'react-docgen-typescript';

interface ApiDocProps {
  componentInfo: ComponentDoc;
}

export default function ApiDoc({ componentInfo }: ApiDocProps) {
  const properties = React.useMemo(
    () => Object.entries(componentInfo.props),
    [componentInfo]
  );
  return (
    <div>
      <Typography variant="h1">{componentInfo.displayName}</Typography>

      <Typography>{componentInfo.description}</Typography>

      <Typography variant="h2">Properties</Typography>

      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>name</TableCell>
              <TableCell>type</TableCell>
              <TableCell>description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map(([propName, def]) => (
              <TableRow key={propName}>
                <TableCell component="th" scope="row">
                  {propName}
                </TableCell>
                <TableCell>{def.type.name}</TableCell>
                <TableCell>{def.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
