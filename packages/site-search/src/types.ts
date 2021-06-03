export const LEVELS = [
  'lvl0',
  'lvl1',
  'lvl2',
  'lvl3',
  'lvl4',
  'lvl5',
  'text',
] as const;

export type Level = typeof LEVELS[number];

export type ContentSelectors = {
  [key in Level]: string;
};

export interface SiteSearchConfig {
  siteStartCmd: string;
  siteOrigin: string;
  siteReadyProbe: string;
  outputPath: string;
  selectors: ContentSelectors;
}

export type IndexedRecord = Partial<
  Record<Level, string> & {
    anchor: string;
  }
>;

export type IndexedDocument = IndexedRecord & { path: string };
