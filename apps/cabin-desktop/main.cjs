const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { writeFileSync } = require('node:fs');
const { pathToFileURL } = require('node:url');
const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const flow = require('./cabin-flow.js');
const canary = process.env.CABIN_CANARY === '1';
app.setName(canary ? 'Cabin Test' : 'Cabin');
app.setPath('userData', process.env.CABIN_TEST_DATA && canary
 ? process.env.CABIN_TEST_DATA : path.join(app.getPath('appData'), 'Soullab Cabin'));
const port=canary?Number(process.env.CABIN_TEST_PORT||43121):43121;
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid Cabin test port');
const origin='http://127.0.0.1:'+port;
const token = randomBytes(32).toString('hex');
const fetchLocal = (url, options={}) => {url=url.replace('http://127.0.0.1:43121',origin);return fetch(url, url.startsWith(origin+'/')
 ? {...options,headers:{...options.headers,Authorization:'Bearer '+token}} : options);};
if (!app.requestSingleInstanceLock()) { app.quit(); } else {
 let home, workspace, child, starting;
 const homeUrl = pathToFileURL(path.join(__dirname,'index.html')).href;
 const allowed = url => url.startsWith(origin+'/');
 function authorize(event) {
  if (!home || event.sender !== home.webContents || event.senderFrame !== home.webContents.mainFrame ||
    event.senderFrame.url !== homeUrl) throw new Error('CABIN_CALLER_DENIED');
 }
 async function startRuntime() {
  if(starting) return starting;
  starting = (async()=>{
   const binary=path.join(__dirname,'runtime','node');
   const entry=path.join(__dirname,'runtime','server.cjs');
   const sandbox='(version 1)(allow default)(deny network-outbound)(allow network-outbound (remote ip \"localhost:*\"))';
   child=spawn(process.platform==='darwin'?'/usr/bin/sandbox-exec':binary,
    process.platform==='darwin'?['-p',sandbox,binary,entry]:[entry],{
    cwd:path.join(__dirname,'runtime'),env:{PATH:process.env.PATH||'/usr/bin:/bin',
     CABIN_TOKEN:token,CABIN_PORT:String(port),CABIN_DATA_PATH:path.join(app.getPath('userData'),'workspace.sqlite')},
    stdio:['ignore','ignore','pipe']});
   let exited=false;child.once('exit',()=>{exited=true;starting=null;});child.once('error',()=>{exited=true;starting=null;});
   // Error output is bounded and contains no prompts or manuscript content.
   child.stderr.on('data',()=>{});
   for(let i=0;i<100;i++){
    if(exited) throw Error('The local runtime could not start. Another Cabin window may already be open.');
    try {const r=await fetchLocal('http://127.0.0.1:43121/api/cabin/health',{signal:AbortSignal.timeout(800)});if(r.ok)return;}
    catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
   }
   throw Error('Local workspace startup timed out.');
  })();
  try{return await starting;}catch(e){child?.kill('SIGTERM');starting=null;throw e;}
 }
 function createHome() {
  home=new BrowserWindow({title:'Cabin',width:860,height:680,backgroundColor:'#e7eee3',
   webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});
  home.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  home.webContents.on('will-navigate',event=>event.preventDefault());
  home.loadFile(path.join(__dirname,'index.html'));
 }
 ipcMain.handle('cabin:readiness',async event=>{authorize(event);await startRuntime();return flow.inspectCabin({fetchImpl:fetchLocal});});
 ipcMain.handle('cabin:open',async event=>{
  authorize(event);await startRuntime();
  return flow.openCabin({fetchImpl:fetchLocal,openView:async url=>{
   url=origin+'/house';
   if(workspace&&!workspace.isDestroyed()){workspace.focus();return;}
   workspace=new BrowserWindow({title:'Cabin — local workspace',width:1320,height:950,backgroundColor:'#e7eee3',
    webPreferences:{preload:path.join(__dirname,'workspace-preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,partition:'persist:soullab-cabin-local'}});
   workspace.webContents.setWindowOpenHandler(()=>({action:'deny'}));
   workspace.webContents.on('will-navigate',(event,destination)=>{if(!allowed(destination))event.preventDefault();});
   workspace.webContents.session.webRequest.onBeforeRequest((request,callback)=>callback({cancel:!allowed(request.url)&&!request.url.startsWith('blob:'+origin+'/')}));
   try{await workspace.loadURL(url,{extraHeaders:'Authorization: Bearer '+token+'\n'});}
   catch(error){workspace.destroy();throw error;}
  }});
 });
 ipcMain.handle('cabin:save-copy',async(event,id)=>{
  if(!workspace || event.sender!==workspace.webContents || event.senderFrame!==workspace.webContents.mainFrame ||
    event.senderFrame.url!==origin+'/cabin' || typeof id!=='string' || id.length>100) throw Error('CABIN_CALLER_DENIED');
  const response=await fetchLocal('http://127.0.0.1:43121/api/export?id='+encodeURIComponent(id));
  if(!response.ok) throw Error('Saved writing could not be read');
  const writing=await response.json();
  const name=(writing.title||'Cabin writing').replace(/[^a-zA-Z0-9 _-]/g,'_')+'.txt';
  const selected=canary ? {canceled:false,filePath:path.join(app.getPath('userData'),'fictional-copy.txt')} :
   await dialog.showSaveDialog(workspace,{title:'Save a copy',defaultPath:path.join(app.getPath('documents'),name),filters:[{name:'Text',extensions:['txt']}]});
  if(selected.canceled || !selected.filePath) return {saved:false};
  writeFileSync(selected.filePath,writing.body,{encoding:'utf8',mode:0o600});
  return {saved:true};
 });
 app.on('second-instance',()=>{if(home&&!home.isDestroyed()){home.restore();home.focus();}});
 app.whenReady().then(()=>{if(process.platform==='darwin')app.dock.setIcon(path.join(process.resourcesPath,'Cabin.png'));createHome();});
 app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createHome();});
 app.on('before-quit',()=>child?.kill('SIGTERM'));
 app.on('window-all-closed',()=>app.quit());
}
