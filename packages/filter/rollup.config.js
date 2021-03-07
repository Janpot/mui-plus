import rollupTypescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import externals from 'rollup-plugin-node-externals';

const packageJson = require('./package.json');

export default {
  input: './src/index.tsx',
  plugins: [
    externals({ deps: true }),
    nodeResolve(),
    rollupTypescript({ jsx: 'react' }),
    commonjs(),
  ],
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
};
