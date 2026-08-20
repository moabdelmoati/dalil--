import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'data');
const dest = path.join(root, 'dist', 'data');

fs.cpSync(src, dest, { recursive: true });
console.log(`Copied ${src} -> ${dest}`);