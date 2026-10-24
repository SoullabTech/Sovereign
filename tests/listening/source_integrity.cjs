const fs=require('fs'),assert=require('assert'),path=require('path'),ts=require('typescript');
const root=path.resolve(__dirname,'../..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const files=['app/listen/page.tsx','app/listen/ListenRoom.tsx','lib/listening/rightsPolicy.ts','lib/listening/portableCollections.ts'];
let checks=0;
function check(message,pred){assert(pred,message);console.log('PASS',message);checks++;}
for(const f of files){const r=ts.transpileModule(read(f),{fileName:f,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext}});check(f+' parses',!(r.diagnostics||[]).some(d=>d.category===ts.DiagnosticCategory.Error));}
const page=read('app/listen/page.tsx'),room=read('app/listen/ListenRoom.tsx'),rights=read('lib/listening/rightsPolicy.ts'),parser=read('lib/listening/portableCollections.ts');
check('review flag absent by default',page.includes("SOULLAB_LISTEN_REVIEW_ENABLED !== '1'")&&page.includes('notFound()'));
check('server checks member authentication',page.includes('await requireMemberId()'));
check('no browser persistent member store',!room.includes('localStorage')&&!room.includes('sessionStorage'));
check('no provider API credentials',!room.includes('access_token')&&!room.includes('client_secret')&&!room.includes('fetch('));
check('never media-fetch imported URLs',!parser.includes('fetch(')&&!parser.includes('new Audio('));
check('rights policy not imported in client',!room.includes('rightsPolicy'));
check('signer/media URL not falsely claimed',!rights.includes('signedDeliveryURL'));
check('private page not indexed',page.includes('index: false'));
console.log('TOTAL',checks,'PASS');

