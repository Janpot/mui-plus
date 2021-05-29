import type { Config } from '@jest/types';

export default {
  rootDir: __dirname,
  watchPathIgnorePatterns: ['dist', '.next'],
} as Config.InitialOptions;
