'use strict';
const assert=require('node:assert/strict'),https=require('node:https'),fs=require('node:fs');
const {createGate}=require('./ws-iphone-https-gateway-r6.cjs');
const certDir=fs.readFileSync('/tmp/ws-iphone-tls-r6-path','utf8').trim();
const fakeToken='FICTIONAL_GATE_TEST_ONLY';
const gate=createGate({host:'192.168.4.21',port:3894,upstreamPort:65534,members:[{token:fakeToken,work:'a1000000-0000-4000-8000-000000000001'}],certDir});
function request(path,method='GET',headers={}){return new Promise((resolve,reject)=>{
 const r=https.request({host:'192.168.4.21',port:3894,path,method,headers,ca:fs.readFileSync(certDir+'/test.crt'),timeout:3000},resp=>{resp.resume();resp.on('end',()=>resolve({status:resp.statusCode,headers:resp.headers}));});r.on('error',reject);r.on('timeout',()=>r.destroy());r.end();
});}
(async()=>{let checks=0;try{await gate.start();
 assert.equal((await request('/writers-studio')).status,403);checks++;
 const entered=await request(gate.entry);assert.equal(entered.status,200);checks++;
 const cookie=entered.headers['set-cookie'][0].split(';')[0];
 assert(entered.headers['set-cookie'][0].includes('Secure'));assert(entered.headers['set-cookie'][0].includes('HttpOnly'));checks++;
 assert.equal((await request(gate.entry)).status,403);checks++;
 assert.equal((await request('/writers-studio','GET',{Cookie:cookie+'; maia_session=NOT_A_FIXTURE_SESSION'})).status,401);checks++;
 const headers={Cookie:cookie+'; maia_session='+fakeToken};
 assert.equal((await request('/api/members/delete-account','DELETE',headers)).status,403);checks++;
 assert.equal((await request('/api/sovereign/app/maia/list','POST',headers)).status,403);checks++;
 assert.equal((await request('/api/sovereign/manuscripts/ffffffff-ffff-4fff-8fff-ffffffffffff/draft','GET',headers)).status,404);checks++;
 assert.equal((await request('/api/sovereign/manuscripts','GET',{...headers,Origin:'https://not-authorized.invalid'})).status,403);checks++;
 assert.equal((await request('/api/sovereign/manuscripts/a1000000-0000-4000-8000-000000000001/sections/ffffffff-ffff-4fff-8fff-ffffffffffff','PUT',headers)).status,403);checks++;
 assert.equal(gate.counts.forwarded,0);checks++;
 console.log('TLS_GATE_NEGATIVE_ACCEPTANCE_PASS',JSON.stringify({checks,forwarded:gate.counts.forwarded,productionAccessed:false}));
 }finally{await gate.close();console.log('TLS_GATE_TEST_CLOSED');}})().catch(e=>{console.error('TLS_GATE_TEST_FAIL',e.name,e.message);process.exitCode=1;});
