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

function parseOrder(input: unknown): { name: string; title?: string }[] {
  const result = [];
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string') {
        result.push({ name: item });
      } else if (
        item &&
        typeof item === 'object' &&
        typeof item.name === 'string'
      ) {
        result.push({
          name: item.name as string,
          frontMatter: {
            title: typeof item.title === 'string' ? item.title : undefined,
          },
        });
      }
    }
  }
  return result;
}

export interface SiteStructureEntry {
  name: string;
  title: string;
  route: string;
  children: SiteStructureEntry[];
}

export interface RelativePages {
  current: SiteStructureEntry[];
  prev: SiteStructureEntry | null;
  next: SiteStructureEntry | null;
}

export function isRoutePrefix(prefix: string, route: string) {
  return prefix === route || route.startsWith(prefix + '/');
}

export function findRelativePages(
  structure: SiteStructureEntry[],
  route: string
): RelativePages {
  let entryIdx = structure.findIndex((entry) => entry.route === route);
  if (entryIdx < 0) {
    entryIdx = structure.findIndex((entry) =>
      isRoutePrefix(entry.route, route)
    );
  }
  if (entryIdx >= 0) {
    const entry = structure[entryIdx];
    const childRelatives = findRelativePages(entry.children, route);
    if (childRelatives.current.length > 0) {
      return {
        ...childRelatives,
        current: [entry, ...childRelatives.current],
      };
    } else {
      return {
        current: [entry],
        prev: entryIdx > 0 ? structure[entryIdx - 1] : null,
        next: entryIdx < structure.length - 1 ? structure[entryIdx + 1] : null,
      };
    }
  } else {
    return { current: [], prev: null, next: null };
  }
}

export function parsePages(pageMap: PageMap): SiteStructureEntry[] {
  const entryMap = new Map(pageMap.map((entry) => [entry.name, entry]));
  const indexEntry = entryMap.get('index');
  const order = parseOrder(indexEntry?.frontMatter?.order);
  const orderedEntryNames = new Set(order.map((entry) => entry.name));
  const orderedEntries = order.map((orderEntry) => {
    const entry = entryMap.get(orderEntry.name);
    if (!entry) {
      throw new Error(
        `Custom order has an entry "${orderEntry.name}" for which a page can't be found`
      );
    }
    return {
      ...orderEntry,
      ...entry,
    };
  });
  const unorderedEntries = pageMap.filter(
    (entry) => !orderedEntryNames.has(entry.name)
  );
  const allEntries = [...orderedEntries, ...unorderedEntries].filter(
    Boolean
  ) as NextraPageMapEntry[];
  return allEntries
    .map((entry) =>
      entry.children
        ? {
            name: entry.name,
            title: entry.frontMatter?.title ?? entry.name,
            route: entry.route,
            children: parsePages(entry.children),
          }
        : {
            name: entry.name,
            title: entry.frontMatter?.title ?? entry.name,
            route: entry.route,
            children: [],
          }
    )
    .filter(
      (entry) =>
        !entry.name.startsWith('_') &&
        entry.route !== '/api' &&
        !entry.route.startsWith('/api/')
    );
}
