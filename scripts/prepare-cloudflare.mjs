import { cp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Keep the standard build intact for GitHub Pages rollback deployments.
const output = 'dist-cloudflare';
await rm(output, { recursive: true, force: true });
await cp('dist', output, { recursive: true });
await rm(join(output, 'CNAME'), { force: true });

// Preserve the original MP4 byte-for-byte in Git instead of recompressing it.
// Cloudflare's 25 MiB per-file limit applies only to the deployed bundle.
const original = '/assets/templates/forklift-trailer.mp4';
const archive = 'https://raw.githubusercontent.com/LarionS/portfolio-website/f9c9dbd976d2916ba355cdc1d69fca21a0241985/public/assets/templates/forklift-trailer.mp4';
await rm(join(output, original.slice(1)));
let redirects = '';
try { redirects = await readFile(join(output, '_redirects'), 'utf8'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
await writeFile(join(output, '_redirects'), `${redirects.trimEnd()}\n${original} ${archive} 302\n`.trimStart());

let count = 0;
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await check(path);
    else {
      count++;
      if ((await stat(path)).size > 25 * 1024 * 1024) {
        throw new Error(`Cloudflare asset exceeds 25 MiB: ${path}`);
      }
    }
  }
}
await check(output);
if (count > 20000) throw new Error(`Cloudflare file limit exceeded: ${count}`);
console.log(`Cloudflare bundle ready: ${count} files; original forklift MP4 redirected to its immutable GitHub copy.`);
