import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

// Exactly the five specs in app/globals.css, unchanged.
const SPECS = [
  ['Atkinson Hyperlegible', 'Atkinson+Hyperlegible:wght@400;700'],
  ['Spectral',              'Spectral:ital,wght@0,400;0,600;1,400;1,600'],
  ['Crimson Pro',           'Crimson+Pro:wght@200;300;400;600'],
  ['Source Sans Pro',       'Source+Sans+Pro:wght@300;400;600'],
  ['IBM Plex Sans',         'IBM+Plex+Sans:wght@300;400;500'],
];
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const OUT = 'public/fonts';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const blocks = [];
let files = 0, bytes = 0;

for (const [family, spec] of SPECS) {
  const url = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
  const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
  const dir = path.join(OUT, slug(family));
  await mkdir(dir, { recursive: true });

  // Each @font-face is preceded by a /* subset */ comment in Google's output.
  const re = /\/\*\s*([\w\[\]-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;
  let m, n = 0;
  while ((m = re.exec(css))) {
    const subset = m[1], body = m[2];
    const style  = (body.match(/font-style:\s*([^;]+);/) || [, 'normal'])[1].trim();
    const weight = (body.match(/font-weight:\s*([^;]+);/) || [, '400'])[1].trim();
    const range  = (body.match(/unicode-range:\s*([^;]+);/) || [, ''])[1].trim();
    const src    = (body.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/) || [])[1];
    if (!src) continue;

    const name = `${slug(family)}-${weight}-${style}-${subset}.woff2`;
    const buf = Buffer.from(await (await fetch(src, { headers: { 'User-Agent': UA } })).arrayBuffer());
    await writeFile(path.join(dir, name), buf);
    files++; bytes += buf.length; n++;

    blocks.push(
      `@font-face {\n` +
      `  font-family: '${family}';\n` +
      `  font-style: ${style};\n` +
      `  font-weight: ${weight};\n` +
      `  font-display: swap;\n` +
      `  src: url('/fonts/${slug(family)}/${name}') format('woff2');\n` +
      (range ? `  unicode-range: ${range};\n` : '') +
      `}`
    );
  }
  console.log(`${family}: ${n} faces`);
}

await writeFile('app/fonts.css',
  `/* Self-hosted fonts. Generated from the exact family/weight/italic/subset\n` +
  ` * specs that app/globals.css previously requested from Google Fonts.\n` +
  ` * Sovereignty repair: a member's browser must not call a third party to\n` +
  ` * render this UI. Do not reintroduce a remote @import here.\n` +
  ` * Regenerate: scripts/vendor-google-fonts.mjs\n` +
  ` * Licenses: public/fonts/LICENSES.md\n */\n\n` + blocks.join('\n\n') + '\n');

console.log(`TOTAL ${files} files, ${(bytes / 1048576).toFixed(2)} MB`);
