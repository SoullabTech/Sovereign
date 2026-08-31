import https from 'node:https'; import fs from 'node:fs';
// Chrome 40 predates variable-font support => Google Fonts serves STATIC per-weight WOFF.
const UA='Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36';
const get=(u)=>new Promise((res,rej)=>https.get(u,{headers:{'User-Agent':UA}},r=>{
  if(r.statusCode>=300&&r.statusCode<400&&r.headers.location) return get(r.headers.location).then(res,rej);
  const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res({status:r.statusCode,buf:Buffer.concat(c)}));}).on('error',rej));
const css=(await get('https://fonts.googleapis.com/css?family=EB+Garamond:400,500,700,400italic,500italic')).buf.toString();
const urls=[...new Set([...css.matchAll(/url\((https?:\/\/[^)]+)\)/g)].map(m=>m[1]))];
const faces=(css.match(/@font-face/g)||[]).length;
console.log('@font-face blocks:',faces,'| unique files:',urls.length);
let out=css, allStatic=true;
for(const u of urls){
  const r=await get(u); if(r.status!==200){console.log('FAIL',r.status);process.exit(1);}
  const isVar=r.buf.includes(Buffer.from('fvar')); if(isVar) allStatic=false;
  const ext=(u.match(/\.(woff2|woff|ttf)(\?|$)/)||[])[1]||'ttf';
  const mime={woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf'}[ext];
  out=out.split(u).join(`data:${mime};base64,${r.buf.toString('base64')}`);
  console.log(` ${isVar?'VARIABLE ❌':'static ✅'} ${(r.buf.length/1024).toFixed(0).padStart(4)}KB .${ext}`);
}
fs.writeFileSync('ebgaramond-static.css',out);
console.log('all static:',allStatic,'| written',(out.length/1048576).toFixed(2)+'MB');
console.log(out.replace(/url\([^)]*\)/g,'url(…)'));
