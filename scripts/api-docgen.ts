#!/usr/bin/env ts-node-script

import * as reactDocgen from 'react-docgen-typescript';
import { resolve, relative } from 'path';
import { readFile, writeFile } from 'fs/promises';

const ROOT = resolve(__dirname, '..');

const INPUT_FILES = [
  './packages/mui-plus/src/DataGrid/index.tsx',
  // './packages/mui-plus/src/DataFilter/DataFilter.tsx'
].map((relative) => resolve(ROOT, relative));

const PROPERTIES_TABLE_COMPONENT = resolve(
  ROOT,
  './docs/components/PropertiesTable'
);

const OUTPUT_FOLDER = resolve(ROOT, './docs/pages/component-api/');

function dedent(str: string): string {
  let lines = str.split('\n');
  if (lines[0].length <= 0) {
    lines = lines.slice(1);
  }
  const minIndent = Math.min(
    ...lines.map((line) =>
      line.trim().length <= 0 ? Infinity : line.length - line.trimLeft().length
    )
  );
  return lines.map((line) => line.slice(minIndent)).join('\n');
}

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
      const propertiesTableImportPath = relative(
        OUTPUT_FOLDER,
        PROPERTIES_TABLE_COMPONENT
      );
      const json = JSON.stringify(componentInfo, null, 2);
      const mdx = dedent(`
        # ${componentInfo.displayName}
  
        ${componentInfo.description}
  
        ## import
  
        \`\`\`tsx
        import ${componentInfo.displayName} from mui-plus/${componentInfo.displayName}
        // or
        import { ${componentInfo.displayName} } from mui-plus
        \`\`\`
  
        ## Properties
  
        import PropertiesTable from '${propertiesTableImportPath}'
        import componentInfo from './${componentInfo.displayName}-componentInfo.json'
  
        <PropertiesTable props={componentInfo.props} />
      `);
      await Promise.all([
        writeFile(jsonfile, json, { encoding: 'utf-8' }),
        writeFile(mdxfile, mdx, { encoding: 'utf-8' }),
      ]);
    })
  );
}

main();

export {};
