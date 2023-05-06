import * as esbuild from 'esbuild';
import { glob } from 'glob';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

const requestedEntryPoints = process.argv.slice(2);
const entryPoints = requestedEntryPoints.length
  ? requestedEntryPoints
  : await glob('src/**/*.ts');

await esbuild.build({
  entryPoints: entryPoints,
  outdir: 'dist/src',
  sourcemap: true,
  platform: 'node',
  format: 'cjs',
  plugins: [esbuildPluginTsc()],
});
