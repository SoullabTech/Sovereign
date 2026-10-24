/** LISTEN-07: compile source React components into an isolated browser fixture.
 * Does not load Next, sessions, provider APIs, or real member data.
 * Run in review checkout with NODE_PATH pointing to temporary react/react-dom/esbuild.
 */
'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const repo=path.resolve(__dirname,'../..');
const dir=process.env.LISTEN_UI_FIXTURE_DIR || fs.mkdtempSync(path.join(os.tmpdir(),'soullab-listen07-'));
const nodePath=process.env.LISTEN_UI_NODE_MODULES || path.join(dir,'node_modules');
const esbuild=require(require.resolve('esbuild',{paths:[nodePath]}));
fs.mkdirSync(dir,{recursive:true});
const files=['app/listen/ListenRoom.tsx','app/listen/LocalAudioDesk.tsx','app/listen/PrivateBackupDesk.tsx','lib/listening/portableCollections.ts','lib/listening/privateBackup.ts','lib/listening/localAudio.ts'];
const hashes=Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,file))).digest('hex')]));
fs.writeFileSync(path.join(dir,'source-hashes.json'),JSON.stringify(hashes,null,2));
fs.writeFileSync(path.join(dir,'entry.jsx'),
 "import React from 'react'; import {createRoot} from 'react-dom/client'; import ListenRoom from "+
 JSON.stringify(path.join(repo,'app/listen/ListenRoom.tsx'))+"; createRoot(document.getElementById('app')).render(<ListenRoom/>);");
const css=[
 "body{margin:0;background:#12181c;color:#f0ece2;font:15px -apple-system,BlinkMacSystemFont,sans-serif}",
 "main{display:flex;gap:12px;padding:12px}aside{width:190px;flex-shrink:0;background:#1c292e;padding:20px;border-radius:14px}aside a,aside button{display:block;margin:6px 0}",
 "button,input,textarea{font:inherit;padding:8px;border-radius:6px}button{cursor:pointer}.main{flex:1;min-width:0}section{margin:12px 0;padding:15px;background:#203034;border-radius:12px}section.hero{min-height:160px;background:linear-gradient(125deg,#1c3334,#263a40,#42382f)}",
 ".tileGrid,.formRow,.backupRow,.importRow{display:flex;flex-wrap:wrap;gap:10px;align-items:center}label{display:inline-block;margin:6px}p{line-height:1.45}.bottomPlayer{display:flex;gap:15px;align-items:center;background:#0e191c;padding:10px}",
 "textarea{display:block;width:min(660px,90%);height:70px}input[type=file]{max-width:220px}h1{font-size:32px}h2{font-size:22px}"
].join('');
fs.writeFileSync(path.join(dir,'index.html'),
 '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Soullab Listening Room | Isolated Chrome Acceptance</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body><div id="app"></div><script src="bundle.js"></script></body></html>');
fs.writeFileSync(path.join(dir,'fictional-playlist.csv'),'Title,Artist,Album,URL\nLuminous Drift,Example Artist,Original Studies,https://open.spotify.com/track/fictional\n"<script>window.__malicious=true</script>",Second Artist,,javascript:alert(1)\n');
const media=path.join(dir,'fictional-24bit-48k.flac');
cp.execFileSync(process.env.FFMPEG_BIN||'ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','sine=frequency=220:duration=4','-af','volume=0.035','-ar','48000','-ac','2','-c:a','flac','-sample_fmt','s32','-bits_per_raw_sample','24',media],{stdio:'pipe',timeout:20000});
(async()=>{
 await esbuild.build({entryPoints:[path.join(dir,'entry.jsx')],outfile:path.join(dir,'bundle.js'),bundle:true,format:'iife',
  platform:'browser',jsx:'automatic',target:'es2022',alias:{'@':repo},nodePaths:[nodePath],
  plugins:[{name:'review-only-CSS-classnames',setup(build){
    build.onLoad({filter:/\.module\.css$/},()=>({contents:"export default new Proxy({}, {get: (_,prop) => String(prop)});",loader:'js'}));
  }}],logLevel:'silent'});
 console.log(JSON.stringify({status:'READY',fixture:dir,sourceHashes:hashes,flacBytes:fs.statSync(media).size,appBundleBytes:fs.statSync(path.join(dir,'bundle.js')).size},null,2));
})().catch(e=>{console.error('LISTEN07_FIXTURE_BUILD_ERROR',e);process.exitCode=1});
