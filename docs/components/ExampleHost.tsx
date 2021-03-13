import {
  Collapse,
  IconButton,
  makeStyles,
  Snackbar,
  Toolbar,
} from '@material-ui/core';
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
  tools: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: theme.direction === 'rtl' ? 'row-reverse' : 'row',
  },
}));

interface ExampleHostProps {
  renderExample: () => React.ReactNode;
  code: string;
}

export default function ExampleHost({ renderExample, code }: ExampleHostProps) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(code).then(
      () => {
        setSnackbarOpen(true);
      },
      () => {}
    );
  }, [code]);

  return (
    <div className={classes.root}>
      <div className={classes.container}>{renderExample()}</div>
      <Toolbar className={classes.tools} disableGutters>
        <IconButton onClick={() => setExpanded((expanded) => !expanded)}>
          <CodeIcon />
        </IconButton>
        <IconButton onClick={handleCopy}>
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
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message="The code sample has been copied."
      />
    </div>
  );
}
