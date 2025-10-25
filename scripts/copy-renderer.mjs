import { cp } from 'fs/promises';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const src = path.resolve('app/dist');
const dest = path.resolve('dist/renderer');

if (existsSync(dest)) {
  await rm(dest, { recursive: true, force: true });
}
await cp(src, dest, { recursive: true });
