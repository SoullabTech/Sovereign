// R1b synthetic adapter tests — no live server, database or member information.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readStudioResource, practiceHomeStanding } from '../practiceHomeLoad.ts';

const http=(status, body)=>async()=>({
  ok:status>=200&&status<300, status, json:async()=>body,
});
const isList=(data)=>data&&Array.isArray(data.clients)?data.clients:null;
const ok=(value)=>({standing:'ready', value});
const standing=(resource)=>practiceHomeStanding(ok({name:'fiction'}),resource,ok([]));

test('verified empty array stays a genuinely empty record set',async()=>{
 const c=await readStudioResource(http(200,{clients:[]}),'/clients',isList);
 assert.deepEqual(c,{standing:'ready',value:[]});
 assert.equal(standing(c),'ready');
});
test('HTTP 401 stays signed-out rather than a false empty practice',async()=>{
 const c=await readStudioResource(http(401,{clients:[]}),'/clients',isList);
 assert.equal(c.standing,'signed-out');assert.equal(standing(c),'signed-out');
});
test('HTTP 403 stays forbidden rather than a false empty practice',async()=>{
 const c=await readStudioResource(http(403,{}),'/clients',isList);
 assert.equal(c.standing,'forbidden');assert.equal(standing(c),'forbidden');
});
test('server failures cannot imply zero records',async()=>{
 for(const status of [404,429,500,503]){
  const c=await readStudioResource(http(status,{}),'/clients',isList);
  assert.equal(c.standing,'unavailable');assert.equal(standing(c),'unavailable');
 }
});
test('network failure cannot imply zero records',async()=>{
 const c=await readStudioResource(async()=>{throw new Error('offline');},'/clients',isList);
 assert.equal(c.standing,'unavailable');
});
test('malformed JSON, empty payload, invalid list shape cannot imply empty',async()=>{
 for(const payload of [null,{}, {clients:null}, {clients:'none'}]){
  const c=await readStudioResource(http(200,payload),'/clients',isList);
  assert.equal(c.standing,'unavailable');
 }
 const c=await readStudioResource(async()=>({ok:true,status:200,json:async()=>{throw Error('bad JSON');}}),'/clients',isList);
 assert.equal(c.standing,'unavailable');
});
test('unauthorized identity takes precedence over successful clients',()=>{
 assert.equal(practiceHomeStanding({standing:'signed-out'},ok([]),ok([])),'signed-out');
});
test('forbidden identity takes precedence over successful clients',()=>{
 assert.equal(practiceHomeStanding({standing:'forbidden'},ok([]),ok([])),'forbidden');
});
test('partial loads do not represent genuinely empty practice',()=>{
 assert.equal(practiceHomeStanding(ok({}),{standing:'unavailable'},ok([])),'unavailable');
 assert.equal(practiceHomeStanding(ok({}),ok([]),{standing:'unavailable'}),'unavailable');
});
test('read helper does not log raw client/member values',async()=>{
 const orig=console.log;
 const logs=[];
 console.log=(...args)=>logs.push(args.join(' '));
 try{await readStudioResource(http(500,{member:'fiction-sensitive-id'}),'/clients',isList);}
 finally{console.log=orig;}
 assert.deepEqual(logs,[]);
});
