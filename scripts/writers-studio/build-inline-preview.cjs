/** Build a local, synthetic preview. Usage: node scripts/writers-studio/build-inline-preview.cjs [output-directory] */
const path = require('node:path');
const fs = require('node:fs');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '../..');
const out = path.resolve(process.argv[2] || '/tmp/ws-inline-preview');
fs.mkdirSync(out, { recursive: true });
esbuild.buildSync({ entryPoints:[path.join(__dirname,'inline-preview.tsx')], bundle:true, platform:'browser', format:'iife', jsx:'automatic', minify:true, outfile:path.join(out,'preview.js'), define:{'process.env.NODE_ENV':'"production"', ...Object.fromEntries(['NEXT_PUBLIC_BUILD_SHA','NEXT_PUBLIC_BUILD_BRANCH','NEXT_PUBLIC_BUILD_TIME','NEXT_PUBLIC_BUILD_MODE','NEXT_PUBLIC_VERSION','NEXT_PUBLIC_API_BASE_URL'].map(key => ['process.env.'+key, '""']))}, tsconfig:path.join(root,'tsconfig.json') });
const css = fs.readFileSync(path.join(__dirname,'inline-preview.css'),'utf8') + '\n' + fs.readFileSync(path.join(out,'preview.css'),'utf8');
const js = fs.readFileSync(path.join(out,'preview.js'),'utf8');
fs.writeFileSync(path.join(out,'index.html'), '<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Manuscript-first editorial preview</title><style>'+css+'</style><div id="root"></div><script>'+js+'</script></html>');
console.log('Built synthetic preview at '+out);
