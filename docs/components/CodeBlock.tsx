import { makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
  },
}));

interface CodeBlockProps {
  children?: React.ReactNode;
}

export default function CodeBlock({ children }: CodeBlockProps) {
  const classes = useStyles();
  return <pre className={classes.root}>{children}</pre>;
}
