import * as React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MdxTheme from './MdxTheme';
import Link from '../src/Link';
import { Container } from '@material-ui/core';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(3),
    },
  })
);

interface LayoutProps {
  children?: React.ReactNode;
  opts: NextraOptions;
  config: MuiNextraThemeConfig;
}

function Layout({ children, opts, config }: LayoutProps) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar></Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            {config.logo}
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {opts.pageMap.map((entry, i) => {
            if (entry.name.startsWith('_')) {
              return null;
            }
            return (
              <ListItem
                key={i}
                button
                component={Link}
                naked
                href={entry.route}
              >
                <ListItemText primary={entry.name} />
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Container maxWidth="md">
          <MdxTheme>{children}</MdxTheme>
        </Container>
      </main>
    </div>
  );
}

interface NextraPageMapEntry {
  name: string;
  route: string;
}

interface NextraOptions {
  filename: string;
  route: string;
  meta: any;
  pageMap: NextraPageMapEntry[];
}

interface NextraRootProps {
  children?: React.ReactNode;
}

export interface MuiNextraThemeConfig {
  logo?: React.ReactNode;
}

export default function createTheme(
  opts: NextraOptions,
  config: MuiNextraThemeConfig | null
) {
  const NextraRoot = (props: NextraRootProps) => {
    return <Layout {...props} opts={opts} config={config || {}} />;
  };
  return NextraRoot;
}
