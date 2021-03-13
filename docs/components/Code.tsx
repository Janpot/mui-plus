import * as React from 'react';
import Highlight, {
  defaultProps,
  Language,
  PrismTheme,
} from 'prism-react-renderer';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
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

const THEME = {
  plain: {
    backgroundColor: 'transparent',
  },
  styles: [
    {
      types: ['keyword', 'builtin'],
      style: {
        color: '#ff0078',
        fontWeight: 'bold',
      },
    },
    {
      types: ['comment'],
      style: {
        color: '#999',
        fontStyle: 'italic',
      },
    },
    {
      types: ['variable', 'language-javascript'],
      style: {
        color: '#0076ff',
      },
    },
    {
      types: ['attr-name'],
      style: {
        color: '#d9931e',
        fontStyle: 'normal',
      },
    },
    {
      types: ['boolean', 'regex'],
      style: {
        color: '#d9931e',
      },
    },
  ],
} as PrismTheme;

export interface CodeProps {
  children: string;
  language?: string;
  highlight?: number[];
  lineNumbers?: boolean;
}

export default function Code({
  children,
  language,
  highlight = [],
  lineNumbers,
  ...props
}: CodeProps) {
  const classes = useStyles();

  if (!language) return <code {...props}>{children}</code>;

  // https://mdxjs.com/guides/syntax-highlighting#all-together
  return (
    <Highlight
      {...defaultProps}
      code={children.trim()}
      language={language as Language}
      theme={THEME}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <code className={className} style={{ ...style }}>
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
