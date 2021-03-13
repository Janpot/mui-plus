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
import { Collapse, Container } from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { useRouter } from 'next/router';

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

interface SideBarItemProps {
  level?: number;
  entry: NextraPageMapEntry;
}

function SideBarItem({ entry, ...props }: SideBarItemProps) {
  if (entry.children) {
    return <SideBarFolderItem entry={entry} {...props} />;
  } else {
    return <SideBarFileItem entry={entry} {...props} />;
  }
}

interface SideBarFileItemProps {
  level?: number;
  entry: NextraPageMapFileEntry;
}

function SideBarFileItem({ entry, level = 0 }: SideBarFileItemProps) {
  const { route } = useRouter();
  const isActive = route === entry.route;
  return (
    <ListItem
      selected={isActive}
      button
      component={Link}
      naked
      href={entry.route}
      style={{ paddingLeft: 16 + level * 16 }}
    >
      <ListItemText primary={entry.frontMatter?.title ?? entry.name} />
    </ListItem>
  );
}

interface SideBarItemListProps {
  level?: number;
  entries: PageMap;
}

function SideBarItemList({ entries, level = 0 }: SideBarItemListProps) {
  return (
    <List dense>
      {entries.map((entry, i) => {
        if (entry.name.startsWith('_')) {
          return null;
        }
        return <SideBarItem key={i} entry={entry} level={level} />;
      })}
    </List>
  );
}

interface SideBarFolderItemProps {
  level?: number;
  entry: NextraPageMapFolderEntry;
}

function SideBarFolderItem({ entry, level = 0 }: SideBarFolderItemProps) {
  const { route } = useRouter();
  const isOpen = route === entry.route || route.startsWith(entry.route + '/');
  const [open, setOpen] = React.useState(isOpen);

  return (
    <>
      <ListItem
        button
        onClick={() => setOpen((open) => !open)}
        style={{ paddingLeft: 16 + level * 16 }}
      >
        <ListItemText primary={entry.frontMatter?.title ?? entry.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open}>
        <SideBarItemList entries={entry.children} level={level + 1} />
      </Collapse>
    </>
  );
}

interface LayoutProps {
  children?: React.ReactNode;
  opts: NextraOptions;
  config: MuiNextraThemeConfig;
}

function Layout({ children, opts, config }: LayoutProps) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="fixed" color="default" className={classes.appBar}>
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
        <SideBarItemList entries={opts.pageMap} />
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

type PageMap = NextraPageMapEntry[];

interface NextraPageMapEntryBase {
  name: string;
  route: string;
  frontMatter?: any;
}

interface NextraPageMapFileEntry extends NextraPageMapEntryBase {
  children?: undefined;
}

interface NextraPageMapFolderEntry extends NextraPageMapEntryBase {
  children: PageMap;
}

type NextraPageMapEntry = NextraPageMapFileEntry | NextraPageMapFolderEntry;

interface NextraOptions {
  filename: string;
  route: string;
  meta: any;
  pageMap: PageMap;
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
