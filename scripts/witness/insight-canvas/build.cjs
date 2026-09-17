const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const out = process.env.WS_INSIGHT_WITNESS_DIR || '/tmp/ws-insight-witness';
fs.mkdirSync(out, { recursive: true });
const virtual = {
  'next/navigation': "export function useSearchParams(){return new URLSearchParams(location.search)}; export function usePathname(){return location.pathname}; export function useRouter(){return {push:h=>location.assign(h),replace:h=>location.replace(h)}}",
  'next/link': "import React from 'react';export default function Link(p){return React.createElement('a',p,p.children)}",
  api: "export const apiFetch=(url,init)=>fetch(url,init);export const apiBase=()=>'';",
  atmosphere: "import {CANVAS_SURFACES,canvasSurfaceVariables} from './app/writers-studio/atmosphere/canvasSurfaces';export function useCanvasSurfaceVariables(){return canvasSurfaceVariables(CANVAS_SURFACES.parchment)};export function useAtmosphere(){return {id:'forest',canvasSurface:'paper',choose:()=>{},chooseCanvas:()=>{}}}",
};
esbuild.build({
  entryPoints: [path.join(__dirname, 'fixture.tsx')], outfile: path.join(out, 'app.js'),
  bundle: true, platform: 'browser', format: 'iife', jsx: 'automatic', sourcemap: true,
  define: { 'process.env': '{}', 'process.env.NODE_ENV': '"development"' },
  plugins: [{ name: 'controlled-platform', setup(build) {
    build.onResolve({ filter: /^(next\/navigation|next\/link)$/ }, args => ({ path: args.path, namespace: 'controlled' }));
    build.onResolve({ filter: /lib\/http\/apiBase$/ }, () => ({ path: 'api', namespace: 'controlled' }));
    build.onResolve({ filter: /StudioAtmosphere$/ }, () => ({ path: 'atmosphere', namespace: 'controlled' }));
    build.onLoad({ filter: /.*/, namespace: 'controlled' }, args => ({ contents: virtual[args.path], loader: 'js', resolveDir: process.cwd() }));
  } }],
}).then(() => {
  fs.writeFileSync(path.join(out, 'index.html'), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><style>body{margin:0;--ws-ground-base:#141e18;--ws-ground-raised:#252e28;--ws-ground-field:#eee5d4;--ws-ground-active:#d4cfb8;--ws-ink-primary:#29281f;--ws-ink-secondary:#4b4b3c;--ws-ink-muted:#5c5c50;--ws-ink-quiet:#686856;--ws-rule:#aca892;--ws-rule-soft:#c9c1ac;--ws-gold-text:#735816;--ws-gold-fill:#d4bc80}button,input,textarea,select{box-sizing:border-box} .flex{display:flex}.flex-1{flex:1}.min-w-0{min-width:0}.min-h-0{min-height:0}.shrink-0{flex-shrink:0}.overflow-y-auto{overflow-y:auto}</style></head><body><div id="root"></div><script src="/app.js"></script></body></html>');
  console.log('Built controlled witness at ' + out);
}).catch(e => { console.error(e.message); process.exitCode = 1; });
