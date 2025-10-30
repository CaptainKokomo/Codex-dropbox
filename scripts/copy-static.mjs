import { cpSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const srcDir = resolve('public');
const destDir = resolve('dist');

mkdirSync(destDir, { recursive: true });
cpSync(srcDir, destDir, { recursive: true });
