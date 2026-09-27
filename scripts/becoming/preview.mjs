#!/usr/bin/env node
/** Isolated review server. No application environment, auth, database, or model. */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const PORT=Number(process.env.BECOMING_PREVIEW_PORT??3797);
if(!Number.isInteger(PORT)||PORT<1024||PORT>65535)throw new Error('Invalid preview port');
const out=join(ROOT,'.becoming-preview');await mkdir(out,{recursive:true});
await build({entryPoints:[join(ROOT,'prototypes/becoming/App.tsx')],bundle:true,external:['/assets/*'],outfile:join(out,'app.js'),platform:'browser',target:'es2022',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},sourcemap:false,minify:true,logLevel:'warning'});
const html=await readFile(join(ROOT,'prototypes/becoming/index.html'));
const js=await readFile(join(out,'app.js')),css=await readFile(join(out,'app.css'));
const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
const bundleHash=createHash('sha256').update(js).update(css).digest('hex');
let art=null;try{art=await readFile('/private/tmp/changes-current3597/public/house/house-architecture-7a638061.webp');}catch{ /* CSS fallback remains functional. */ }
const assets=new Map([['/',[html,'text/html; charset=utf-8']],['/becoming',[html,'text/html; charset=utf-8']],['/assets/app.js',[js,'application/javascript; charset=utf-8']],['/assets/app.css',[css,'text/css; charset=utf-8']],['/health',[Buffer.from(JSON.stringify({scope:'isolated-local-preview',sourceHead:sha,bundleHash,accountConnected:false,providerCalls:false,storage:'browser-indexeddb-explicit-keep'})),'application/json']]]);
if(art)assets.set('/assets/house-field.webp',[art,'image/webp']);
const server=createServer((req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  if(![`localhost:${PORT}`,`127.0.0.1:${PORT}`].includes(req.headers.host??'')){res.writeHead(403);res.end('Local preview only');return;}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  let path;try{path=new URL(req.url??'/',`http://127.0.0.1:${PORT}`).pathname;}catch{res.writeHead(400);res.end();return;}
  if(path==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const asset=assets.get(path);if(!asset){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':asset[1]});res.end(req.method==='HEAD'?undefined:asset[0]);
});
server.listen(PORT,'127.0.0.1',()=>console.log(JSON.stringify({localPreview:`http://localhost:${PORT}/becoming`,pid:process.pid,sourceHead:sha,bundleHash})));
for(const event of ['SIGTERM','SIGINT'])process.on(event,()=>server.close(()=>process.exit(0)));
