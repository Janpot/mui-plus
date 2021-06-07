import { resolve, dirname } from 'path';
import execa from 'execa';
import fetch from 'node-fetch';
import Ajv, { JSONSchemaType } from 'ajv';
import { URL } from 'url';
import { JSDOM } from 'jsdom';
import extractRecords from './extractRecords';
import { SiteSearchConfig, IndexedDocument } from './types';
import PromiseQueue from './PromiseQueue';
import lunr from 'lunr';
import { writeFile } from 'fs/promises';

const ajv = new Ajv();

const projectRoot = process.cwd();

const configPath = resolve(projectRoot, 'site-search.config');

const configSchema: JSONSchemaType<SiteSearchConfig> = {
  type: 'object',
  properties: {
    siteStartCmd: { type: 'string' },
    siteOrigin: { type: 'string' },
    siteReadyProbe: { type: 'string' },
    outputPath: { type: 'string' },
    selectors: {
      type: 'object',
      properties: {
        lvl0: { type: 'string' },
        lvl1: { type: 'string' },
        lvl2: { type: 'string' },
        lvl3: { type: 'string' },
        lvl4: { type: 'string' },
        lvl5: { type: 'string' },
        text: { type: 'string' },
      },
      required: ['lvl0', 'lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5', 'text'],
    },
  },
  required: ['siteStartCmd', 'siteOrigin', 'siteReadyProbe'],
  additionalProperties: false,
};

const validateConfig = ajv.compile(configSchema);

async function isSiteReady(url: URL): Promise<boolean> {
  try {
    const { status } = await fetch(url);
    return status >= 200 && status < 300;
  } catch (err) {
    return false;
  }
}

async function waitUntilSiteReady(url: URL): Promise<void> {
  const timeout = 30000;
  const pollInterval = 1000;

  const startTime = Date.now();
  while (true) {
    const siteReady = await isSiteReady(url);
    if (siteReady) {
      return;
    }

    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > timeout) {
      throw new Error('Timeout waiting for site to become ready');
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}

function extractLinks(doc: Document, config: SiteSearchConfig): string[] {
  const result: string[] = [];
  for (const anchor of doc.querySelectorAll('a')) {
    const url = new URL(anchor.href);
    url.search = '';
    url.hash = '';
    if (url.origin === config.siteOrigin) {
      result.push(url.toString());
    }
  }
  return result;
}

export default async function run() {
  let siteProcess;
  try {
    console.log(`Reading configuration at "${configPath}"`);
    const { default: config } = await import(configPath);

    if (!validateConfig(config)) {
      console.log(validateConfig.errors);
      return;
    }

    const resolvedOutputPath = resolve(dirname(configPath), config.outputPath);

    console.log(`Starting site with "${config.siteStartCmd}"`);
    siteProcess = execa.command(config.siteStartCmd, {
      stdio: 'inherit',
    });

    await Promise.race([
      siteProcess.then(() => {
        throw new Error(`Site process stopped unexpectedly`);
      }),
      (async () => {
        const siteReadyProbeUrl = new URL(
          config.siteReadyProbe,
          config.siteOrigin
        );
        console.log(`Waiting until site ready at ${siteReadyProbeUrl}`);
        await waitUntilSiteReady(siteReadyProbeUrl);
        console.log(`Site ready`);

        const queue = new PromiseQueue({ concurrency: 5 });
        const seen: Set<string> = new Set();

        const corpus: IndexedDocument[] = [];

        const crawl = async (url: string) => {
          if (seen.has(url)) {
            return;
          }

          seen.add(url);
          const { pathname } = new URL(url);

          const links = await queue.add(async () => {
            console.log(`Fetching ${url}`);
            const res = await fetch(url);
            const pageSrc = await res.text();
            const { window } = new JSDOM(pageSrc, {
              url,
              contentType: res.headers.get('content-type') || 'text/html',
            });

            const records = extractRecords(
              window.document.body,
              config.selectors
            );

            corpus.push(
              ...records.map((record) => ({ path: pathname, ...record }))
            );

            const links = extractLinks(window.document, config);

            return links;
          });

          await Promise.all(links.map((link) => crawl(link)));
        };

        await crawl(siteReadyProbeUrl.toString());

        const index = lunr(function () {
          this.ref('id');
          this.field('lvl0');
          this.field('lvl1');
          this.field('lvl2');
          this.field('lvl3');
          this.field('lvl4');
          this.field('lvl5');
          this.field('text');

          this.metadataWhitelist = ['position'];
          this.pipeline.remove(lunr.stemmer);

          corpus.forEach((record, id) => {
            this.add({ id, ...record });
          });
        });

        console.log(`Writing output at "${resolvedOutputPath}"`);
        await writeFile(
          resolvedOutputPath,
          JSON.stringify({
            corpus,
            index: index.toJSON(),
          })
        );
      })(),
    ]);

    await Promise.all([
      siteProcess.cancel(),
      siteProcess.catch(() => undefined),
    ]);

    console.log('Done');
  } finally {
    if (siteProcess) {
      await siteProcess.cancel();
    }
  }
}
