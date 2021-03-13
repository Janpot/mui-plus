import { MDXProvider, MDXProviderComponents } from '@mdx-js/react';
import Slugger from 'github-slugger';
import Link from './Link';
import * as React from 'react';
import { makeStyles, Typography, TypographyProps } from '@material-ui/core';
import innerText from 'react-innertext';
import Code from '../components/Code';
import CodeBlock from '../components/CodeBlock';

const useStyles = makeStyles(() => ({
  headerLink: {
    '&:hover $linkIcon': {
      visibility: 'visible',
    },
  },
  linkIcon: {
    visibility: 'hidden',
  },
}));

interface HeaderLinkProps extends TypographyProps {
  slugger: Slugger;
}

const HeaderLink = ({ children, slugger, ...props }: HeaderLinkProps) => {
  const slug = slugger.slug(innerText(children) || '');
  const classes = useStyles();

  return (
    <Typography {...props}>
      <span id={slug} />

      <Link
        href={'#' + slug}
        className={classes.headerLink}
        underline="none"
        variant="h2"
        color="inherit"
      >
        {children}
        <span className={classes.linkIcon}>#</span>
      </Link>
    </Typography>
  );
};

function createHeaderLink(
  variant: TypographyProps['variant'],
  slugger: Slugger
) {
  const Header = (props: TypographyProps) => (
    <HeaderLink variant={variant} slugger={slugger} {...props} />
  );
  return Header;
}

interface GetComponentsOptions {
  slugger: Slugger;
}

function getComponents({
  slugger,
}: GetComponentsOptions): MDXProviderComponents {
  return {
    h1: (props) => <Typography variant="h1" {...props} />,
    h2: createHeaderLink('h2', slugger),
    h3: createHeaderLink('h3', slugger),
    h4: createHeaderLink('h4', slugger),
    h5: createHeaderLink('h5', slugger),
    h6: createHeaderLink('h6', slugger),
    a: Link,
    code: ({ className, highlight, ...props }) => (
      <Code
        language={className ? className.slice('language-'.length) : undefined}
        highlight={highlight ? highlight.split(',').map(Number) : []}
        {...props}
      />
    ),
    pre: CodeBlock,
  } as MDXProviderComponents;
}

interface MdxThemeProps {
  children?: React.ReactNode;
}

export default function MdxTheme({ children }: MdxThemeProps) {
  const slugger = new Slugger();
  return (
    <MDXProvider components={getComponents({ slugger })}>
      {children}
    </MDXProvider>
  );
}
