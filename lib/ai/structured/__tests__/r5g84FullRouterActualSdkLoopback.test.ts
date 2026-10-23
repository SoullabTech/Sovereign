/**
 * R5G84 Class A DRAFT. Real production runStructured -> adapter -> actual SDK
 * transport, with a loopback-only guarded SDK constructor. Fictional data only.
 */
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { StructuredRequest } from '../types';

let mockOrigin = '';
let mockConstructed = 0;
const SECRET = 'R5G84_FICTIONAL_ERROR_MUST_NOT_REACH_LOGS';

jest.mock('@anthropic-ai/sdk', () => {
  const real = jest.requireActual('@anthropic-ai/sdk');
  const RealSDK = real.default ?? real;
  class GuardedActualSDK extends RealSDK {
    constructor(opts: Record<string, unknown> = {}) {
      mockConstructed += 1;
      super({
        ...opts,
        apiKey: 'R5G84_FAKE_KEY_LOCAL_ONLY',
        baseURL: mockOrigin,
        maxRetries: 2,
        timeout: 8000,
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const url = new URL(input instanceof Request ? input.url : String(input));
          if (url.origin !== mockOrigin) throw new Error('R5G84 egress forbidden');
          return fetch(input, init);
        },
      });
    }
  }
  return { __esModule: true, default: GuardedActualSDK };
});
// Real router is not mocked.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { runStructured } = require('../router') as typeof import('../router');

const request: StructuredRequest = {
  model: 'fictional-exact-model',
  system: 'Invented prose only.',
  messages: [{ role: 'user', content: 'An invented meadow and river.' }],
  maxTokens: 32,
  tools: [{ name:'editorial_outcome', inputSchema:{
    type:'object',properties:{reply:{type:'string'}},required:['reply'],
  },schemaEnforcement:'required' }],
  toolChoice: { type:'tool', name:'editorial_outcome' },
};
const originalMode=process.env.MAIA_INFERENCE_MODE;
afterEach(()=>{
 if(originalMode===undefined) delete process.env.MAIA_INFERENCE_MODE;
 else process.env.MAIA_INFERENCE_MODE=originalMode;
 jest.restoreAllMocks();
});
jest.setTimeout(30000);
async function withLocal(
 kind:'ok'|'529'|'503'|'different',
 test:(requests:Array<{method?:string,path?:string,body:any}>)=>Promise<void>,
){
 const requests:Array<{method?:string,path?:string,body:any}>=[];
 const server=createServer(async (req,res)=>{
  try{
   const chunks:Buffer[]=[];
   for await(const chunk of req)chunks.push(Buffer.from(chunk));
   const raw=Buffer.concat(chunks).toString('utf8');
   requests.push({method:req.method,path:req.url,body:raw?JSON.parse(raw):{}});
   res.setHeader('content-type','application/json');
   res.setHeader('request-id','req_fake_local');
   if(kind==='529'||kind==='503'){
    res.statusCode=Number(kind);
    res.end(JSON.stringify({type:'error',error:{type:'overloaded_error',message:SECRET}}));
   }else{
    res.statusCode=200;
    res.end(JSON.stringify({
      id:'msg_fictional',type:'message',role:'assistant',
      model:kind==='different'?'different-fictional-model':request.model,
      content:[{type:'tool_use',id:'toolu_local',name:'editorial_outcome',input:{reply:'Only fictional.'}}],
      stop_reason:'tool_use',stop_sequence:null,usage:{input_tokens:19,output_tokens:7},
    }));
   }
  }catch{
   res.statusCode=500;
   res.end(JSON.stringify({type:'error',error:{type:'api_error',message:'fake fixture'}}));
  }
 });
 await new Promise<void>((resolve,reject)=>{
  server.once('error',reject);
  server.listen(0,'127.0.0.1',resolve);
 });
 mockOrigin='http://127.0.0.1:'+(server.address() as AddressInfo).port;
 try{await test(requests)}
 finally{
  server.closeAllConnections?.();
  await new Promise<void>(resolve=>server.close(()=>resolve()));
  mockOrigin='';
 }
}
describe('R5G84 whole structured router with actual localhost SDK — REVIEW/HOLD',()=>{
 it('success preserves real SDK tool, usage and exact reported model',async()=>{
  await withLocal('ok',async seen=>{
   mockConstructed=0;process.env.MAIA_INFERENCE_MODE='primary';
   const r=await runStructured(request);
   expect(r.ok).toBe(true);
   if(r.ok){
    expect(r.result.provenance).toMatchObject({
      model:request.model,reportedModel:request.model,modelAgreement:'agreed',
    });
    expect(r.result.usage).toEqual({inputTokens:19,outputTokens:7});
    expect(r.result.content[0]).toMatchObject({type:'tool_use',name:'editorial_outcome'});
   }
   expect(seen).toHaveLength(1);
   expect(seen[0]?.body.tool_choice).toMatchObject({name:'editorial_outcome'});
   expect(mockConstructed).toBe(1);
  });
 });
 it('HTTP529 redacts refusal/logs and sends exactly one physical SDK request',async()=>{
  await withLocal('529',async seen=>{
   process.env.MAIA_INFERENCE_MODE='primary';
   const spy=jest.spyOn(console,'error').mockImplementation(()=>{});
   const r=await runStructured(request);
   expect(r).toMatchObject({ok:false,refusal:'provider_unavailable',
     detail:'structured_provider_error_redacted',dispatch:'response_observed'});
   expect(JSON.stringify(spy.mock.calls)).not.toContain(SECRET);
   expect(JSON.stringify(r)).not.toContain(SECRET);
   expect(seen).toHaveLength(1);
  });
 });
 it('stream helper HTTP503 redacts while sending one physical request',async()=>{
  await withLocal('503',async seen=>{
   process.env.MAIA_INFERENCE_MODE='primary';
   const spy=jest.spyOn(console,'error').mockImplementation(()=>{});
   const r=await runStructured({...request,execution:{completion:'long-running'}});
   expect(r).toMatchObject({ok:false,refusal:'provider_unavailable',
     detail:'structured_provider_error_redacted',dispatch:'response_observed'});
   expect(JSON.stringify(spy.mock.calls)).not.toContain(SECRET);
   expect(seen).toHaveLength(1);
  });
 });
 it('model substitution is visible and not normalized',async()=>{
  await withLocal('different',async seen=>{
   process.env.MAIA_INFERENCE_MODE='primary';
   const r=await runStructured(request);
   expect(r.ok).toBe(true);
   if(r.ok)expect(r.result.provenance.modelAgreement).toBe('differs');
   expect(seen).toHaveLength(1);
  });
 });
 it.each(['sovereign','local_only'] as const)('%s refuses without SDK construction',async mode=>{
  await withLocal('ok',async seen=>{
   mockConstructed=0;process.env.MAIA_INFERENCE_MODE=mode;
   const r=await runStructured(request);
   expect(r).toMatchObject({ok:false,refusal:'structured_inference_unavailable'});
   expect(mockConstructed).toBe(0);
   expect(seen).toHaveLength(0);
  });
 });
});
