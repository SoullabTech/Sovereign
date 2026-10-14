'use strict';
// Disposable fixture-only TLS gateway. No production route/config changes.
const https=require('node:https'),http=require('node:http');
const fs=require('node:fs'),crypto=require('node:crypto');
function createGate({host,port,upstreamPort,members,certDir}) {
 const token=crypto.randomBytes(32).toString('hex');
 const entry='/_fixture_entry/'+crypto.randomBytes(32).toString('hex');
 const hostHeader=host+':'+port,origin='https://'+hostHeader;
 const sessions=new Set(members.map(x=>x.token)),works=new Set(members.map(x=>x.work));
 let peer=null,entered=false,closed=false;const counts={forwarded:0,refused:0};
 const cookies=s=>Object.fromEntries(String(s||'').split(';').map(v=>v.trim().split(/=(.*)/s)).filter(v=>v.length>1).map(v=>[v[0],v[1]]));
 const equal=(a,b)=>typeof a==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
 const csp="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; img-src 'self' data: blob:; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'";
 const opts={key:fs.readFileSync(certDir+'/test.key'),cert:fs.readFileSync(certDir+'/test.crt'),minVersion:'TLSv1.2',ALPNProtocols:['http/1.1']};
 const server=https.createServer(opts,(req,res)=>{
  const reply=(code,msg,extra={})=>{if(req.url.startsWith('/api/'))console.log('FIXTURE_GATE_REPLY',req.method,req.url.split('?')[0].replace(/[0-9a-f-]{36}/g,':fixture'),code,msg);if(res.headersSent)return res.destroy();const raw=Buffer.from(msg);res.writeHead(code,{'Content-Type':'text/plain; charset=utf-8','Content-Length':raw.length,'Cache-Control':'no-store','Content-Security-Policy':csp,...extra});res.end(raw);};
  if(req.headers.host!==hostHeader || req.url.includes('\\') || req.url.includes('%') || req.url.startsWith('//')){counts.refused++;return reply(403,'Fictional endpoint refused');}
  if(req.method==='GET' && req.url===entry && !entered){entered=true;peer=req.socket.remoteAddress;return reply(200,'SOULLAB_PRIVATE_FICTIONAL_BRIDGE_READY',{'Set-Cookie':'__Host-WS_FICTIONAL_BRIDGE='+token+'; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=600'});}
  const c=cookies(req.headers.cookie);
  if(!entered || req.socket.remoteAddress!==peer || !equal(c['__Host-WS_FICTIONAL_BRIDGE'],token)){counts.refused++;return reply(403,'Private fictional test only');}
  const path=req.url.split('?')[0];
  const assets=path.startsWith('/_next/static/')||/^\/(fonts|assets|icons|images|house)\//.test(path)||path.startsWith('/favicon');
  const pages=path==='/writers-studio'||path==='/writers-studio/beta-limited'||path==='/signin';
  const api=path==='/api/health'||path==='/api/sovereign/writers-studio/beta-access'||path==='/api/writers-studio/rebuild/context'||/^\/api\/sovereign\/(manuscripts|living-works|studio|keeps)(\/|$)/.test(path);
  const draft=/^\/api\/sovereign\/manuscripts\/([0-9a-f-]{36})\/draft$/.exec(path);
  const sectionSave=/^\/api\/sovereign\/manuscripts\/([0-9a-f-]{36})\/sections\/([0-9a-f-]{36})$/.exec(path);
  const permittedSectionSave=req.method==='PUT' && sectionSave && members.some(m=>m.work===sectionSave[1]&&(m.draftSections||[]).includes(sectionSave[2]));
  const bodyMethod=['POST','PUT'].includes(req.method);
  const memberCookie=c.maia_session;
  if(!assets && memberCookie && !sessions.has(memberCookie)){counts.refused++;return reply(401,'Only fixture credentials are accepted');}
  if(!assets && (!memberCookie||!sessions.has(memberCookie))){counts.refused++;return reply(401,'Fictional session required');}
  if((req.method==='GET'&&!(assets||pages||api)) || (req.method!=='GET'&&!((bodyMethod&&draft&&works.has(draft[1]))||permittedSectionSave))){counts.refused++;return reply(403,'Unavailable in fictional writing test');}
  const workId=/^\/api\/sovereign\/manuscripts\/([0-9a-f-]{36})(\/|$)/.exec(path);
  if(workId&&!works.has(workId[1])){counts.refused++;return reply(404,'Not found');}
  const length=Number(req.headers['content-length']||0);
  if(!Number.isSafeInteger(length)||length<0||length>1024*1024||req.headers['transfer-encoding'])return reply(413,'Fixture body limit');
  const incomingOrigin=req.headers.origin;
  if(incomingOrigin && incomingOrigin!==origin)return reply(403,'Origin refused');
  let chunks=[],size=0;
  req.on('data',buf=>{size+=buf.length;if(size>1024*1024){req.destroy();return;}chunks.push(buf);});
  req.on('end',()=>{
   const headers={Host:'127.0.0.1:'+upstreamPort,Accept:req.headers.accept||'*/*','Accept-Encoding':'identity','User-Agent':req.headers['user-agent']||'Fixture','X-Forwarded-Host':hostHeader,'X-Forwarded-Proto':'https'};
   if(memberCookie)headers.Cookie='maia_session='+memberCookie;
   for(const name of ['rsc','next-router-state-tree','next-router-prefetch','next-url'])if(req.headers[name])headers[name]=req.headers[name];
   if(incomingOrigin)headers.Origin=origin;
   if(size){headers['Content-Type']=req.headers['content-type']||'application/json';headers['Content-Length']=size;}
   const up=http.request({host:'127.0.0.1',port:upstreamPort,path:req.url,method:req.method,headers,timeout:20000},r=>{
    let bufs=[],total=0;r.on('data',b=>{total+=b.length;if(total>20*1024*1024){r.destroy();return reply(502,'Fixture response limit');}bufs.push(b);});
    r.on('end',()=>{if(res.headersSent)return;const bytes=Buffer.concat(bufs),out={};
     for(const [k,v] of Object.entries(r.headers))if(!['content-length','transfer-encoding','connection','keep-alive','set-cookie','content-encoding','content-security-policy','access-control-allow-origin','access-control-allow-credentials'].includes(k)&&v!==undefined)out[k]=v;
     if(out.location&&/^https?:\/\//.test(out.location)){const u=new URL(out.location);if(u.origin==='http://127.0.0.1:'+upstreamPort)out.location=u.pathname+u.search;else return reply(502,'External redirect refused');}
     res.writeHead(r.statusCode, {...out,'Content-Length':bytes.length,'Cache-Control':'no-store','Content-Security-Policy':csp});res.end(bytes);counts.forwarded++;if(req.url.startsWith('/api/')&&req.method!=='GET')console.log('FIXTURE_GATE_UPSTREAM',req.method,req.url.split('?')[0].replace(/[0-9a-f-]{36}/g,':fixture'),r.statusCode);
    });r.on('error',()=>reply(502,'Local fixture response unavailable'));
   });up.on('timeout',()=>up.destroy());up.on('error',()=>reply(502,'Local fixture unavailable'));up.end(size?Buffer.concat(chunks):undefined);
  });
 });
 server.requestTimeout=30000;server.headersTimeout=15000;server.on('tlsClientError',()=>{});
 let expiry;
 const close=()=>new Promise(resolve=>{if(closed)return resolve();closed=true;clearTimeout(expiry);server.close(resolve);server.closeAllConnections();});
 return {entry,origin,counts,start:()=>new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,()=>{expiry=setTimeout(close,10*60*1000);expiry.unref();resolve();});}),close};
}
module.exports={createGate};
