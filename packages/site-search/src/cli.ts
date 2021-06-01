import { resolve } from 'path';
import * as sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import execa from 'execa';
import fetch from 'node-fetch';
import Ajv, { JSONSchemaType } from 'ajv';
import { URL } from 'url';
import { JSDOM } from 'jsdom';
import extractRecords from './extractRecords';
import { SiteSearchConfig } from './types';
import PromiseQueue from './PromiseQueue';

const ajv = new Ajv();

const projectRoot = process.cwd();

const configPath = resolve(projectRoot, 'site-search.config');
const indexPath = resolve(projectRoot, 'site-search.db');

const configSchema: JSONSchemaType<SiteSearchConfig> = {
  type: 'object',
  properties: {
    siteStartCmd: { type: 'string' },
    siteOrigin: { type: 'string' },
    siteReadyProbe: { type: 'string' },
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

async function main() {
  let db = await open({
    filename: indexPath,
    driver: sqlite3.Database,
  });

  let siteProcess;
  try {
    console.log(`Reading configuration at "${configPath}"`);
    const config = require(configPath);

    if (!validateConfig(config)) {
      console.log(validateConfig.errors);
      return;
    }

    console.log(`Creating index at "${indexPath}"`);
    await db.exec(
      `CREATE VIRTUAL TABLE IF NOT EXISTS site_search_index USING fts5(
        lvl0,
        lvl1,
        lvl2,
        lvl3,
        lvl4,
        lvl5,
        text,
        path UNINDEXED,
        anchor UNINDEXED
      )`
    );

    console.log(`Starting site with "${config.siteStartCmd}"`);
    siteProcess = execa.command(config.siteStartCmd, {
      stdio: 'inherit',
    });

    const siteReadyProbeUrl = new URL(config.siteReadyProbe, config.siteOrigin);
    console.log(`Waiting until site ready at ${siteReadyProbeUrl}`);
    await waitUntilSiteReady(siteReadyProbeUrl);
    console.log(`Site ready`);

    const queue = new PromiseQueue({ concurrency: 5 });
    const seen: Set<string> = new Set();

    const crawl = async (url: string) => {
      if (seen.has(url)) {
        return;
      }
      seen.add(url);
      await queue.add(async () => {
        const { pathname } = new URL(url);
        console.log(`Fetching ${url}`);
        const res = await fetch(url);
        const pageSrc = await res.text();
        const { window } = new JSDOM(pageSrc, {
          url,
          contentType: res.headers.get('content-type') || 'text/html',
        });

        const records = extractRecords(window.document.body, config.selectors);

        await Promise.all(
          records.map(async (record) => {
            await db.run(
              `INSERT INTO site_search_index(lvl0, lvl1, lvl2, lvl3, lvl4, lvl5, text, path, anchor)VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              record.lvl0,
              record.lvl1,
              record.lvl2,
              record.lvl3,
              record.lvl4,
              record.lvl5,
              record.text,
              pathname,
              record.anchor
            );
          })
        );

        await Promise.all(
          Array.from(window.document.querySelectorAll('a'), async (anchor) => {
            const url = new URL(anchor.href);
            url.search = '';
            url.hash = '';
            if (url.origin === config.siteOrigin) {
              const urlStr = url.toString();
              await crawl(url.toString());
            }
          })
        );
      });
    };

    await crawl(siteReadyProbeUrl.toString());
  } finally {
    console.log('Cleaning up');
    await Promise.all([db.close(), siteProcess?.cancel()]);
  }
}

main();
