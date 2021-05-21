import * as React from 'react';
import Highlight, { defaultProps, Language } from 'prism-react-renderer';
import { makeStyles, useTheme } from '@material-ui/core';
import clsx from 'clsx';
import useIsMounted from '../useIsMounted';

const useStyles = makeStyles((theme) => ({
  root: {
    whiteSpace: 'pre',
    display: 'block',
    borderRadius: theme.shape.borderRadius,
    overflow: 'scroll',
    padding: theme.spacing(2),
  },
  line: {
    display: 'table-row',
    '&$highlight': {
      background: 'var(--c-highlight)',
      margin: '0 -1rem',
      padding: '0 1rem',
    },
  },
  highlight: {},
  lineNumber: {
    display: 'table-cell',
    textAlign: 'right',
    paddingRight: '1em',
    userSelect: 'none',
    opacity: 0.5,
  },
  lineContent: {
    display: 'table-cell',
  },
}));

export interface CodeProps {
  children: string;
  className?: string;
  language?: string;
  highlight?: number[];
  lineNumbers?: boolean;
}

export default function Code({
  children,
  language,
  className: classNameProp,
  highlight = [],
  lineNumbers,
}: CodeProps) {
  const mounted = useIsMounted();
  const classes = useStyles();
  const theme = useTheme();

  if (!mounted) return <code className={classes.root}>{children}</code>;

  // https://mdxjs.com/guides/syntax-highlighting#all-together
  return (
    <Highlight
      {...defaultProps}
      code={children.trim()}
      language={language as Language}
      theme={theme.prism}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <code
          className={clsx(classNameProp, className, classes.root)}
          style={style}
        >
          {tokens.map((line, i) => {
            const { className, ...props } = getLineProps({ line, key: i });
            return (
              <div
                key={i}
                className={clsx(className, classes.line, {
                  [classes.highlight]: highlight.includes(i + 1),
                })}
                {...props}
              >
                {lineNumbers ? (
                  <span className={classes.lineNumber}>{i + 1}</span>
                ) : null}
                <span className={classes.lineContent}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </span>
              </div>
            );
          })}
        </code>
      )}
    </Highlight>
  );
}