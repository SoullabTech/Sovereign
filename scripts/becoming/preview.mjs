#!/usr/bin/env node
/** Isolated Becoming review server with one explicit, fixed MAIA handoff seam. */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const PORT=Number(process.env.BECOMING_PREVIEW_PORT??3797);
const MAIA_PORT=Number(process.env.BECOMING_MAIA_PORT??3597);
if(!Number.isInteger(PORT)||PORT<1024||PORT>65535)throw new Error('Invalid preview port');
if(!Number.isInteger(MAIA_PORT)||MAIA_PORT<1024||MAIA_PORT>65535)throw new Error('Invalid MAIA port');
const MAIA_UPSTREAM=`http://127.0.0.1:${MAIA_PORT}/api/sovereign/app/maia/list`;

const out=join(ROOT,'.becoming-preview');await mkdir(out,{recursive:true});
await build({entryPoints:[join(ROOT,'prototypes/becoming/App.tsx')],bundle:true,external:['/assets/*'],outfile:join(out,'app.js'),platform:'browser',target:'es2022',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},sourcemap:false,minify:true,logLevel:'warning'});
const html=await readFile(join(ROOT,'prototypes/becoming/index.html'));
const js=await readFile(join(out,'app.js')),css=await readFile(join(out,'app.css'));
const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
const bundleHash=createHash('sha256').update(js).update(css).digest('hex');
let art=null;try{art=await readFile('/private/tmp/changes-current3597/public/house/house-architecture-7a638061.webp');}catch{}
const health={scope:'isolated-local-preview',sourceHead:sha,bundleHash,accountConnected:false,providerCalls:'explicit-member-handoff-only',storage:'browser-indexeddb-explicit-keep',maiaHandoff:'fixed-localhost-canonical-route'};
const assets=new Map([
  ['/',[html,'text/html; charset=utf-8']],
  ['/becoming',[html,'text/html; charset=utf-8']],
  ['/assets/app.js',[js,'application/javascript; charset=utf-8']],
  ['/assets/app.css',[css,'text/css; charset=utf-8']],
  ['/health',[Buffer.from(JSON.stringify(health)),'application/json']],
]);
if(art)assets.set('/assets/house-field.webp',[art,'image/webp']);

function baseHeaders(res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
}
async function readJson(req,max=180000){
  let size=0,raw='';
  for await(const chunk of req){
    size+=chunk.length;
    if(size>max)throw Object.assign(new Error('Payload too large'),{status:413});
    raw+=chunk.toString('utf8');
  }
  try{return JSON.parse(raw||'{}');}catch{throw Object.assign(new Error('Invalid JSON'),{status:400});}
}
function validHistory(value){
  return Array.isArray(value)&&value.length<=24&&value.every(turn=>
    turn&&typeof turn==='object'&&
    (turn.role==='user'||turn.role==='assistant')&&
    typeof turn.content==='string'&&turn.content.length<=120000
  );
}
async function proxyMaia(req,res){
  if(req.headers['x-becoming-explicit-handoff']!=='1'){
    res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Explicit Becoming handoff required.'}));return;
  }
  const input=await readJson(req);
  const message=typeof input.message==='string'?input.message.trim():'';
  const sessionId=typeof input.sessionId==='string'?input.sessionId.trim():'';
  const journeyId=typeof input.journeyId==='string'?input.journeyId.trim():'';
  const history=input.conversationHistory??[];
  if(!message||message.length>120000||!/^becoming-[A-Za-z0-9-]{20,200}$/.test(sessionId)||journeyId.length>100||!validHistory(history)){
    res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Invalid Becoming MAIA handoff.'}));return;
  }
  const body={
    message,
    userId:'anonymous',
    userName:'Friend',
    sessionId,
    localHour:new Date().getHours(),
    mode:'dialogue',
    meta:{sessionId,memoryMode:'continuity'},
    sanctuary:input.sanctuary===true,
    conversationHistory:history,
    surface:'maia',
    isVoiceMode:false,
    fieldState:{active:true,depth:0.7,quality:'present'},
  };
  const headers={'Content-Type':'application/json'};
  if(req.headers.cookie)headers.Cookie=req.headers.cookie;
  if(typeof req.headers['x-session-token']==='string')headers['x-session-token']=req.headers['x-session-token'];
  const upstream=await fetch(MAIA_UPSTREAM,{method:'POST',headers,body:JSON.stringify(body),redirect:'manual'});
  const text=await upstream.text();
  const contentType=upstream.headers.get('content-type')||'application/json; charset=utf-8';
  res.writeHead(upstream.status,{'Content-Type':contentType});
  res.end(text);
}

const server=createServer(async(req,res)=>{
  baseHeaders(res);
  if(![`localhost:${PORT}`,`127.0.0.1:${PORT}`].includes(req.headers.host??'')){res.writeHead(403);res.end('Local preview only');return;}
  let path;try{path=new URL(req.url??'/',`http://127.0.0.1:${PORT}`).pathname;}catch{res.writeHead(400);res.end();return;}
  if(path==='/api/maia'){
    if(req.method!=='POST'){res.writeHead(405,{'Allow':'POST'});res.end();return;}
    try{await proxyMaia(req,res);}catch(err){
      const status=Number(err?.status)||502;
      res.writeHead(status,{'Content-Type':'application/json'});
      res.end(JSON.stringify({error:status===502?'The local MAIA service is unavailable.':String(err?.message||'Handoff failed.')}));
    }
    return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  if(path==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const asset=assets.get(path);if(!asset){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':asset[1]});res.end(req.method==='HEAD'?undefined:asset[0]);
});
server.listen(PORT,'127.0.0.1',()=>console.log(JSON.stringify({localPreview:`http://localhost:${PORT}/becoming`,pid:process.pid,sourceHead:sha,bundleHash,maiaHandoff:'explicit-only'})));
for(const event of ['SIGTERM','SIGINT'])process.on(event,()=>server.close(()=>process.exit(0)));
