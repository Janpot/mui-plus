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
  selectors: ContentSelectors;
}
