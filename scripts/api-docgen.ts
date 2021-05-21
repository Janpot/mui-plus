#!/usr/bin/env ts-node-script

import * as reactDocgen from 'react-docgen-typescript';
import { resolve, relative } from 'path';
import { readFile, writeFile } from 'fs/promises';

const ROOT = resolve(__dirname, '..');

const INPUT_FILES = [
  './packages/mui-plus/src/DataGrid/index.tsx',
  // './packages/mui-plus/src/DataFilter/DataFilter.tsx'
].map((relative) => resolve(ROOT, relative));

const API_DOC_COMPONENT = resolve(ROOT, './docs/components/ApiDoc');

const OUTPUT_FOLDER = resolve(ROOT, './docs/pages/component-api/');

async function main() {
  const docgenResults = await Promise.all(
    INPUT_FILES.map(async (filename) => {
      return reactDocgen.parse(filename, {});
    })
  );

  await Promise.all(
    docgenResults.flat().map(async (componentInfo) => {
      const mdxfile = resolve(
        OUTPUT_FOLDER,
        `${componentInfo.displayName}.mdx`
      );
      const jsonfile = resolve(
        OUTPUT_FOLDER,
        `${componentInfo.displayName}-componentInfo.json`
      );
      const apiDocImportPath = relative(OUTPUT_FOLDER, API_DOC_COMPONENT);
      const json = JSON.stringify(componentInfo, null, 2);
      const mdx = [
        `import ApiDoc from '${apiDocImportPath}'`,
        `import componentInfo from './${componentInfo.displayName}-componentInfo.json'`,
        '',
        `<ApiDoc componentInfo={componentInfo} />`,
      ].join('\n');
      await Promise.all([
        writeFile(jsonfile, json, { encoding: 'utf-8' }),
        writeFile(mdxfile, mdx, { encoding: 'utf-8' }),
      ]);
    })
  );
}

main();

export {};
