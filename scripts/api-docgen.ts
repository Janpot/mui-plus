import * as reactDocgen from 'react-docgen-typescript';
import { resolve, relative } from 'path';
import { writeFile, rm, mkdir } from 'fs/promises';
import { format } from 'prettier';

const ROOT = resolve(__dirname, '..');

const INPUT_FILES = [
  './packages/mui-plus/src/DataGrid/DataGrid.tsx',
  './packages/mui-plus/src/DataFilter/DataFilter.tsx',
  './packages/mui-plus/src/Sparkline/Sparkline.tsx',
  './packages/mui-plus/src/Sparkbars/Sparkbars.tsx',
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
      const componentInfo = reactDocgen.parse(filename, {});
      if (componentInfo.length <= 0) {
        throw new Error(`No component found in ${filename}`);
      }
      return componentInfo;
    })
  );

  await rm(OUTPUT_FOLDER, { recursive: true, force: true });
  await mkdir(OUTPUT_FOLDER);

  await Promise.all(
    docgenResults.flat().map(async (componentInfo) => {
      const mdxFilepath = resolve(
        OUTPUT_FOLDER,
        `${componentInfo.displayName}.mdx`
      );
      const jsonFilepath = resolve(
        OUTPUT_FOLDER,
        `${componentInfo.displayName}-componentInfo.json`
      );
      const propertiesTableImportPath = relative(
        OUTPUT_FOLDER,
        PROPERTIES_TABLE_COMPONENT
      );
      const json = format(JSON.stringify(componentInfo), {
        filepath: jsonFilepath,
      });
      const mdx = dedent(`
        # ${componentInfo.displayName}
  
        ${componentInfo.description}
  
        ## import
  
        \`\`\`tsx
        import { ${componentInfo.displayName} } from 'mui-plus';
        \`\`\`
  
        ## Properties
  
        import PropertiesTable from '${propertiesTableImportPath}';
        import componentInfo from './${componentInfo.displayName}-componentInfo.json';
  
        <PropertiesTable props={componentInfo.props} />
      `);
      await Promise.all([
        writeFile(jsonFilepath, json, { encoding: 'utf-8' }),
        writeFile(mdxFilepath, mdx, { encoding: 'utf-8' }),
      ]);
    })
  );
}

main();

export {};
