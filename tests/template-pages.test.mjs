import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const templates = JSON.parse(readFileSync('src/templates.json','utf8'));
test('every vehicle has usable product media and public purchase/demo resources', () => {
  const unique = new Set();
  for (const item of templates) {
    assert.ok(!unique.has(item.slug), `Duplicate URL: ${item.slug}`); unique.add(item.slug);
    assert.equal(new URL(item.fab).hostname,'www.fab.com');
    assert.match(new URL(item.fab).pathname,/^\/listings\/[a-f0-9-]+$/);
    assert.ok(item.downloads.some(link=>/demo/i.test(link.label)),`No demo for ${item.name}`);
    for (const link of item.downloads) assert.match(link.url,/^https:\/\/drive.google.com\/file\/d\/[^/]+\/view$/);
    for (const name of [item.image,`${item.image}-small`,...item.gallery.map(frame=>frame.image)]) {
      const file = resolve('public/assets/templates',`${name}.webp`);
      assert.ok(existsSync(file),`Missing product media: ${file}`);
      assert.ok(statSync(file).size > 1_000 && statSync(file).size < 200_000,`Image outside delivery budget: ${file}`);
    }
    if(item.video) assert.ok(existsSync(resolve('public',item.video.slice(1))));
  }
  assert.equal(templates.length,5);
});

test('production pages contain crawlable content, metadata and working local targets', {skip:!existsSync('dist/templates/index.html')}, () => {
  const titles = new Set();
  const paths = ['/templates/',...templates.map(item=>`/templates/${item.slug}/`)];
  for (const path of paths) {
    const html = readFileSync(resolve('dist',path.slice(1),'index.html'),'utf8');
    assert.match(html,/<h1[ >]/,`Missing rendered heading: ${path}`);
    assert.match(html,/<meta name="description" content="[^"]+"/);
    assert.ok(html.includes(`rel="canonical" href="https://playframe.qd.je${path}"`));
    assert.ok(!html.includes('<!--template-meta-->'));
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title),`Duplicate title: ${path}`); titles.add(title);
    for (const [,url] of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
      const file = resolve('dist',url.slice(1),url.endsWith('/')?'index.html':'');
      assert.ok(existsSync(file),`Broken local URL on ${path}: ${url}`);
    }
    for (const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`),`Missing anchor ${path}#${id}`);
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
    assert.ok(scripts.length>0); for(const [,json] of scripts) JSON.parse(json);
    assert.ok(readFileSync('dist/sitemap.xml','utf8').includes(`https://playframe.qd.je${path}`));
  }
});
