import { cp, mkdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The release workflow packages dist/ directly. This script intentionally keeps
// local packaging simple and dependency-free; GitHub Actions creates the final zip.
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
await mkdir(resolve(root, 'release'), { recursive: true });
await cp(resolve(root, 'dist'), resolve(root, 'release/dist'), { recursive: true });
console.log(`Prepared ${basename(resolve(root, 'release/dist'))}`);
