import { Collapse, IconButton, makeStyles, Toolbar } from '@material-ui/core';
import * as React from 'react';
import Code from './Code';
import CodeIcon from '@material-ui/icons/Code';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CodeBlock from './CodeBlock';

const useStyles = makeStyles((theme) => ({
  root: {},
  container: {
    background:
      theme.palette.type === 'dark' ? '#333' : theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(6),
  },
}));

interface ExampleHostProps {
  renderExample: () => React.ReactNode;
  code: string;
}

export default function ExampleHost({ renderExample, code }: ExampleHostProps) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div className={classes.root}>
      <div className={classes.container}>{renderExample()}</div>
      <Toolbar disableGutters>
        <IconButton onClick={() => setExpanded((expanded) => !expanded)}>
          <CodeIcon />
        </IconButton>
        <IconButton onClick={() => setExpanded((expanded) => !expanded)}>
          <FileCopyIcon />
        </IconButton>
      </Toolbar>
      <Collapse in={expanded}>
        <CodeBlock>
          <Code language="ts" lineNumbers>
            {code}
          </Code>
        </CodeBlock>
      </Collapse>
    </div>
  );
}
