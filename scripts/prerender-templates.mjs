import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '../.ssr/templates-render.js';

const templates = JSON.parse(readFileSync('src/templates.json', 'utf8'));
const shell = readFileSync('dist/templates.html', 'utf8');
const origin = 'https://playframe.qd.je';
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const paths = ['/'];
for (const item of [null, ...templates]) {
  const path = item ? `/templates/${item.slug}/` : '/templates/';
  const title = item ? `${item.name} for Unreal Engine | Playframe` : 'VR Vehicle Templates for Unreal Engine | Playframe';
  const description = item ? item.summary : 'Explore five Unreal Engine 5.8 VR vehicle templates: boat, helicopter, car, jet ski and motorcycle. See actual product galleries, try demos and read the guides.';
  const image = `${origin}/assets/templates/${item?.image || 'boat-hero'}.webp`;
  const schema = item ? {
    '@context':'https://schema.org','@type':'SoftwareApplication',name:item.name,url:origin+path,
    description:item.summary,applicationCategory:'DeveloperApplication',operatingSystem:'Windows, Android',
    softwareRequirements:item.requirements.join(' '),image,author:{'@type':'Organization',name:'Playframe',url:origin},sameAs:item.fab
  } : {
    '@context':'https://schema.org','@type':'CollectionPage',name:title,url:origin+path,description,
    mainEntity:{'@type':'ItemList',itemListElement:templates.map((template,index)=>({'@type':'ListItem',position:index+1,name:template.name,url:`${origin}/templates/${template.slug}/`}))}
  };
  const meta = `<meta name="description" content="${escape(description)}" />
    <link rel="canonical" href="${origin}${path}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Playframe" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:url" content="${origin}${path}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${escape(item?.imageAlt || templates[0].imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(title)}" />
    <meta name="twitter:description" content="${escape(description)}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>`;
  const html = shell.replace(/<title>.*?<\/title>/,`<title>${escape(title)}</title>`).replace('<!--template-meta-->',meta).replace('<div id="template-root"></div>',`<div id="template-root">${render(item?.slug || '')}</div>`);
  const folder = resolve('dist',path.slice(1)); mkdirSync(folder,{recursive:true});
  writeFileSync(resolve(folder,'index.html'),html);
  paths.push(path);
}
writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path=>`  <url><loc>${origin}${path}</loc></url>`).join('\n')}\n</urlset>\n`);
unlinkSync('dist/templates.html');
console.log(`Pre-rendered ${templates.length + 1} template pages and sitemap.`);
