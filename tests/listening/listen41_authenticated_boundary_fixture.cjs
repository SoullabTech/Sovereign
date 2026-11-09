/**
 * LISTEN-41 · Build an isolated browser fixture from the actual authenticated
 * boundary and persistent transport source. No Next server, database, member
 * credential, remote media, or production endpoint is used.
 */
'use strict';
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const repo=path.resolve(__dirname,'../..');
const dir=process.env.LISTEN41_FIXTURE_DIR || fs.mkdtempSync(path.join(os.tmpdir(),'soullab-listen41-'));
const nodePath=process.env.LISTEN_UI_NODE_MODULES || '/Users/soullab/MAIA-SOVEREIGN/node_modules';
const esbuild=require(require.resolve('esbuild',{paths:[nodePath]}));
fs.mkdirSync(dir,{recursive:true});

const sourceFiles=[
  'components/listening/AuthenticatedListeningBoundary.tsx',
  'components/listening/PersistentListeningProvider.tsx',
  'lib/listening/listeningSessionBoundary.ts',
  'lib/listening/audioFocus.ts',
  'lib/listening/audioOutputLock.ts',
  'lib/listening/maiaSpeechFocus.ts',
];
const hashes=Object.fromEntries(sourceFiles.map(file=>[
  file,crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,file))).digest('hex'),
]));
fs.writeFileSync(path.join(dir,'source-hashes.json'),JSON.stringify(hashes,null,2));

const routeShim=path.join(dir,'next-navigation-shim.jsx');
fs.writeFileSync(routeShim,`import {useSyncExternalStore} from 'react';
let pathname='/listen';
const listeners=new Set();
export function usePathname(){return useSyncExternalStore(cb=>{listeners.add(cb);return()=>listeners.delete(cb)},()=>pathname,()=>pathname)}
export function setFixturePath(next){pathname=next;for(const listener of listeners)listener()}
window.__setFixturePath=setFixturePath;
`);

const apiShim=path.join(dir,'api-base-shim.js');
fs.writeFileSync(apiShim,`const A='11111111-2222-4333-8444-555555555555';
const B='aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
window.__listen41SessionMode='A';window.__listen41SessionCalls=[];
window.__setListen41SessionMode=mode=>{window.__listen41SessionMode=mode};
function delay(signal){return new Promise((resolve,reject)=>{const id=setTimeout(resolve,12);if(signal)signal.addEventListener('abort',()=>{clearTimeout(id);reject(new DOMException('Aborted','AbortError'))},{once:true})})}
export async function apiFetch(path,options={}){
 window.__listen41SessionCalls.push({path,method:options.method||'GET',cache:options.cache||null});
 await delay(options.signal);
 const mode=window.__listen41SessionMode;
 if(mode==='network')throw new Error('fictional network failure');
 if(mode==='invalid')return new Response(JSON.stringify({authenticated:false}),{status:401,headers:{'content-type':'application/json'}});
 if(mode==='server')return new Response(JSON.stringify({error:'fictional unavailable'}),{status:503,headers:{'content-type':'application/json'}});
 if(mode==='badjson')return new Response('{bad-json',{status:200,headers:{'content-type':'application/json'}});
 const id=mode==='B'?B:A;
 return new Response(JSON.stringify({authenticated:true,member:{id,username:'ignored',tier:'ignored',roles:['ignored']}}),{status:200,headers:{'content-type':'application/json'}});
}
`);

const entry=path.join(dir,'entry.jsx');
fs.writeFileSync(entry,`import React from 'react';
import {createRoot} from 'react-dom/client';
import {usePathname,setFixturePath} from 'next/navigation';
import {AuthenticatedListeningBoundary} from ${JSON.stringify(path.join(repo,'components/listening/AuthenticatedListeningBoundary.tsx'))};
import {usePersistentListening} from ${JSON.stringify(path.join(repo,'components/listening/PersistentListeningProvider.tsx'))};
function App(){
 const pathname=usePathname();const transport=usePersistentListening();
 const state=transport?.snapshot;
 return <main>
  <h1>LISTEN-41 fictional boundary fixture</h1>
  <output data-pathname>{pathname}</output>
  <output data-transport>{transport?'mounted':'none'}</output>
  <output data-playback>{state?.playback||'unavailable'}</output>
  <output data-kind>{state?.kind||'unavailable'}</output>
  <button data-start disabled={!transport} onClick={()=>transport?.playSketch('focus',[110,164.81,220])}>Start fictional sound</button>
  <button data-stop disabled={!transport} onClick={()=>transport?.pause()}>Pause fictional sound</button>
  <button data-home onClick={()=>setFixturePath('/home')}>Home</button>
  <button data-maia onClick={()=>setFixturePath('/maia')}>MAIA</button>
  <button data-public onClick={()=>setFixturePath('/signin')}>Public sign-in</button>
  <button data-listen onClick={()=>setFixturePath('/listen')}>Listening Field</button>
 </main>;
}
createRoot(document.getElementById('app')).render(
 <AuthenticatedListeningBoundary enabled={true} runtimeMode="online"><App/></AuthenticatedListeningBoundary>
);
`);
fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>LISTEN-41</title></head><body><div id="app"></div><script src="bundle.js"></script></body></html>`);

(async()=>{
 await esbuild.build({
  entryPoints:[entry],outfile:path.join(dir,'bundle.js'),bundle:true,format:'iife',platform:'browser',jsx:'automatic',target:'es2022',
  alias:{'@':repo,'react':require.resolve('react',{paths:[nodePath]}),'react/jsx-runtime':require.resolve('react/jsx-runtime',{paths:[nodePath]})},
  nodePaths:[nodePath],
  plugins:[{name:'listen41-shims',setup(build){
   build.onResolve({filter:/^next\/navigation$/},()=>({path:routeShim}));
   build.onResolve({filter:/^@\/lib\/http\/apiBase$/},()=>({path:apiShim}));
  }}],
  logLevel:'silent',
 });
 console.log(JSON.stringify({status:'READY',fixture:dir,sourceHashes:hashes,bundleBytes:fs.statSync(path.join(dir,'bundle.js')).size},null,2));
})().catch(error=>{console.error('LISTEN41_FIXTURE_ERROR',error);process.exitCode=1});
