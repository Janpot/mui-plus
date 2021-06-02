export interface ContentSelectors {
  lvl0: string;
  lvl1: string;
  lvl2: string;
  lvl3: string;
  lvl4: string;
  lvl5: string;
  text: string;
}

export interface SiteSearchConfig {
  siteStartCmd: string;
  siteOrigin: string;
  siteReadyProbe: string;
  outputPath: string;
  selectors: ContentSelectors;
}

export type Level = keyof ContentSelectors;

export type IndexedRecord = Partial<
  Record<Level, string> & {
    anchor: string;
  }
>;

export type IndexedDocument = IndexedRecord & { path: string };
