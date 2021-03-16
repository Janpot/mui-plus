import { MDXProvider, MDXProviderComponents } from '@mdx-js/react';
import Slugger from 'github-slugger';
import Link from './Link';
import * as React from 'react';
import { makeStyles, Typography, TypographyProps } from '@material-ui/core';
import innerText from 'react-innertext';
import Code from '../components/Code';
import { useSection } from './useScrollSpy';
import LinkIcon from '@material-ui/icons/Link';

const useStyles = makeStyles((theme) => ({
  root: {
    '& pre code': {
      display: 'block',
    },
    '& h1': {
      ...theme.typography.h3,
      fontSize: 40,
      margin: '16px 0',
    },
    '& h2': {
      ...theme.typography.h4,
      fontSize: 30,
      margin: '40px 0 16px',
    },
    '& h3': {
      ...theme.typography.h5,
      margin: '40px 0 16px',
    },
    '& h4': {
      ...theme.typography.h6,
      margin: '32px 0 16px',
    },
    '& h5': {
      ...theme.typography.subtitle1,
      margin: '32px 0 16px',
    },
    '& h6': {
      ...theme.typography.subtitle2,
      margin: '32px 0 16px',
    },
  },
  headerLink: {},
  headerLinkAnchor: {
    padding: theme.spacing(0, 1),
    verticalAlign: 'middle',
    visibility: 'hidden',
    '$headerLink:hover &': {
      visibility: 'visible',
    },
  },
  anchor: {
    position: 'absolute',
    marginTop: -100,
  },
}));

interface HeaderLinkProps extends TypographyProps {
  slugger: Slugger;
}

const HeaderLink = ({ children, slugger, ...props }: HeaderLinkProps) => {
  const slug = slugger.slug(innerText(children) || '');
  const classes = useStyles();

  const ref = useSection(slug);

  return (
    <Typography className={classes.headerLink} {...props}>
      <span ref={ref} id={slug} className={classes.anchor} />

      {children}
      <Link
        href={'#' + slug}
        className={classes.headerLinkAnchor}
        underline="none"
        color="inherit"
      >
        <LinkIcon fontSize="small" />
      </Link>
    </Typography>
  );
};

function createHeaderLink(
  variant: TypographyProps['variant'],
  slugger: Slugger,
  predefinedProps?: TypographyProps
) {
  const Header = (props: TypographyProps) => (
    <HeaderLink
      variant={variant}
      slugger={slugger}
      {...predefinedProps}
      {...props}
    />
  );
  return Header;
}

function H1(props: any) {
  return <Typography variant="h1" {...props} />;
}

function CodeBlock({ className, highlight, ...props }: any) {
  return (
    <Code
      language={className ? className.slice('language-'.length) : undefined}
      highlight={highlight ? highlight.split(',').map(Number) : []}
      {...props}
    />
  );
}

interface GetComponentsOptions {
  slugger: Slugger;
}

function getComponents({
  slugger,
}: GetComponentsOptions): MDXProviderComponents {
  return {
    h1: H1,
    h2: createHeaderLink('h2', slugger),
    h3: createHeaderLink('h3', slugger),
    h4: createHeaderLink('h4', slugger),
    h5: createHeaderLink('h5', slugger),
    h6: createHeaderLink('h6', slugger),
    a: Link,
    code: CodeBlock,
  } as MDXProviderComponents;
}

interface MdxThemeProps {
  children?: React.ReactNode;
}

export default function MdxTheme({ children }: MdxThemeProps) {
  const classes = useStyles();
  const slugger = new Slugger();
  return (
    <MDXProvider components={getComponents({ slugger })}>
      <article className={classes.root}>{children}</article>
    </MDXProvider>
  );
}
