import esbuild from 'esbuild';

esbuild.buildSync({
  entryPoints: {
    ask: 'server/api-entries/ask.ts',
    analyze: 'server/api-entries/analyze.ts',
    health: 'server/api-entries/health.ts',
    index: 'server/api-entries/index.ts',
  },
  outdir: 'api',
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  external: ['@google/genai', 'mammoth', 'multer', 'dotenv', 'express', 'cors'],
});

console.log('Successfully bundled serverless API functions to api/');
