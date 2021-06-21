type PageMap = NextraPageMapEntry[];

interface NextraPageMapEntryBase {
  name: string;
  route: string;
  frontMatter?: { [key: string]: any };
}

interface NextraPageMapFileEntry extends NextraPageMapEntryBase {
  children?: undefined;
}

interface NextraPageMapFolderEntry extends NextraPageMapEntryBase {
  children: PageMap;
}

type NextraPageMapEntry = NextraPageMapFileEntry | NextraPageMapFolderEntry;

function parseOrder(
  input: unknown
): { name: string; title?: string; hidden?: boolean }[] {
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
            hidden: item.hidden,
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

function findLeafs(structure: SiteStructureEntry[]): SiteStructureEntry[] {
  return structure.flatMap((entry) =>
    entry.children.length > 0 ? findLeafs(entry.children) : [entry]
  );
}

function findPath(
  structure: SiteStructureEntry[],
  route: string
): SiteStructureEntry[] {
  const entry =
    structure.find((entry) => entry.route === route) ||
    structure.find((entry) => isRoutePrefix(entry.route, route));
  return entry ? [entry, ...findPath(entry.children, route)] : [];
}

export function findRelativePages(
  structure: SiteStructureEntry[],
  route: string
): RelativePages {
  const allLeafs = findLeafs(structure);
  const entryIdx = allLeafs.findIndex((entry) => entry.route === route);
  const prev = entryIdx > 0 ? allLeafs[entryIdx - 1] : null;
  const next =
    entryIdx >= 0 && entryIdx < allLeafs.length - 1
      ? allLeafs[entryIdx + 1]
      : null;
  const current = findPath(structure, route);
  return { prev, next, current };
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
            hidden: entry.frontMatter?.hidden,
          }
        : {
            name: entry.name,
            title: entry.frontMatter?.title ?? entry.name,
            route: entry.route,
            children: [],
            hidden: entry.frontMatter?.hidden,
          }
    )
    .filter(
      (entry) =>
        !entry.hidden &&
        !entry.name.startsWith('_') &&
        entry.route !== '/api' &&
        !entry.route.startsWith('/api/')
    );
}
