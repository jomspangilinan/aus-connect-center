import { build } from 'esbuild';
import { readdirSync } from 'fs';

const exclude = ['repositories', 'services'];

const entryPoints = readdirSync('./lambda')
    .filter(x => x !== 'base' && !x.endsWith('.ts') && !exclude.includes(x))
    .map(x => `./lambda/${x}/index.ts`);

build({
    entryPoints: entryPoints,
    outbase: 'lambda',
    entryNames: '[dir]/index',
    outdir: '../../dist/packages/backend',
    bundle: true,
    minify: true,
    platform: 'node',
    sourcemap: true,
    target: 'node20',
    external: ['fsevents*', 'express*', 'aws-cdk-lib/*', 'punycode*'],
}).catch(() => process.exit(1));
