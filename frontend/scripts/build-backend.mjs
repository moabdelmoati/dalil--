import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(frontendRoot, '..');

const tscBin = path.join(frontendRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const tsconfig = path.join(repoRoot, 'backend', 'tsconfig.build.json');

execSync(`"${process.execPath}" "${tscBin}" -p "${tsconfig}"`, {
  stdio: 'inherit',
  cwd: frontendRoot,
});

const dataSrc = path.join(repoRoot, 'backend', 'data');
const dataDest = path.join(repoRoot, 'backend', 'dist', 'data');
fs.cpSync(dataSrc, dataDest, { recursive: true });
console.log(`Copied ${dataSrc} -> ${dataDest}`);