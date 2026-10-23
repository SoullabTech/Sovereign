/**
 * R24 FIXTURE ONLY: bind observed HTTP body bytes to canonical SigV4 hash.
 * Preserves S3's expressly permitted UNSIGNED-PAYLOAD on HEAD, but requires
 * a signed payload for STS GetCallerIdentity POST. The verifier is not a
 * production AWS request validator; all keys/HTTP requests are fictional.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {request as httpRequest} from 'node:http';
import {
  signSynthetic,verifyRequest,canonicalRequest,hashHex,
} from '../sigv4-witness.mjs';

const identity={
  accessKeyId:'ASIAFIXTURE000000001',
  secretAccessKey:'FictionalSecretKeyMaterialForLocalSigV4Only0000',
  sessionToken:'FICTIONAL_SESSION_TOKEN_FOUR_ZERO_FOR_TEST_ONLY',
};
const time='20261022T180000Z';
const signingService='sts';
const region='us-east-1';
const scope={region,service:signingService,datetime:time};
const config={...identity,service:signingService,region};
const original=Buffer.from('Action=GetCallerIdentity&Version=2011-06-15');

function signedSts(body=original,extraHeaders={}){
  const m={method:'POST',url:'/',headers:{host:'127.0.0.1:55992',...extraHeaders},body};
  return {...m,headers:signSynthetic(m,identity,scope)};
}
function signedS3(body=Buffer.alloc(0),extraHeaders={}){
  const m={method:'HEAD',url:'/fictional-bucket/writer-r20/checkpoint/head.json?versionId=fixture-v0001',
    headers:{host:'127.0.0.1:55991',...extraHeaders},body};
  return {...m,headers:signSynthetic(m,identity,{...scope,service:'s3'})};
}
const refuse=(fn,msg)=>assert.throws(fn,e=>e?.message===msg);

test('R24 baseline valid STS signed payload still verifies',()=>{
  const v=verifyRequest(signedSts(),config);
  assert.equal(v.service,'sts');
  assert.equal(v.signedToken,true);
});
test('R24 STS body replaced with different action must be refused despite valid HMAC over stale hash',()=>{
  const s=signedSts();
  s.body=Buffer.from('Action=DeleteUsers&Version=2011-06-15');
  refuse(()=>verifyRequest(s,config),'payload_hash_mismatch');
});
test('R24 STS same-length body tamper must be refused',()=>{
  const s=signedSts();
  s.body=Buffer.from(original.toString().replace('GetCallerIdentity','PutCallerIdentity'));
  assert.equal(s.body.length,original.length);
  refuse(()=>verifyRequest(s,config),'payload_hash_mismatch');
});
test('R24 STS truncated observed bytes must be refused',()=>{
  const s=signedSts();s.body=s.body.subarray(0,12);
  refuse(()=>verifyRequest(s,config),'payload_hash_mismatch');
});
test('R24 S3 HEAD with zero body and SHA256 empty hash remains valid',()=>{
  const s=signedS3();
  assert.equal(s.headers['x-amz-content-sha256'],hashHex(Buffer.alloc(0)));
  assert.equal(verifyRequest(s,{...config,service:'s3'}).service,'s3');
});
test('R24 S3 HEAD with added body bytes must not pass signed empty hash',()=>{
  const s=signedS3();s.body=Buffer.from('unexpected-privileged-body');
  refuse(()=>verifyRequest(s,{...config,service:'s3'}),'payload_hash_mismatch');
});
test('R24 STS requires signed body, UNSIGNED-PAYLOAD cannot authorize POST',()=>{
  const s=signedSts(original,{'x-amz-content-sha256':'UNSIGNED-PAYLOAD'});
  refuse(()=>verifyRequest(s,config),'unsigned_sts_payload');
});
test('R24 S3 explicitly UNSIGNED-PAYLOAD for zero-body HEAD remains supported',()=>{
  const s=signedS3(Buffer.alloc(0),{'x-amz-content-sha256':'UNSIGNED-PAYLOAD'});
  assert.equal(verifyRequest(s,{...config,service:'s3'}).service,'s3');
});
test('R24 malformed declared payload hash is refused',()=>{
  const s=signedSts();
  s.headers['x-amz-content-sha256']='NOT-A-SHA256';
  refuse(()=>verifyRequest(s,config),'unsupported_payload_hash');
});
test('R24 well-formed but false signed payload hash is refused',()=>{
  const s=signedSts();
  s.headers['x-amz-content-sha256']='f'.repeat(64);
  refuse(()=>verifyRequest(s,config),'payload_hash_mismatch');
});
test('R24 valid signed UTF-8 payload verifies with byte exact hash',()=>{
  const body=Buffer.from('Action=GetCallerIdentity&Comment=é');
  assert.equal(verifyRequest(signedSts(body),config).service,'sts');
});
test('R24 UTF-8 one-byte mutation of body content cannot bypass digest',()=>{
  const body=Buffer.from('Action=GetCallerIdentity&Comment=é');
  const s=signedSts(body);
  const tampered=Buffer.from(body);
  tampered[tampered.length-1]^=1;
  s.body=tampered;
  refuse(()=>verifyRequest(s,config),'payload_hash_mismatch');
});
test('R24 payload hash check is before signature acceptance',()=>{
  const s=signedSts();s.body=Buffer.from('tampered');
  s.headers.authorization='AWS4-HMAC-SHA256 Credential='+identity.accessKeyId+'/20261022/us-east-1/sts/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date;x-amz-security-token, Signature='+ 'f'.repeat(64);
  refuse(()=>verifyRequest(s,config),'payload_hash_mismatch');
});
test('R24 canonical request itself refuses stale declared hash',()=>{
  const s=signedSts();s.body=Buffer.from('not-the-signed-content');
  const signedHeaders=s.headers.authorization.match(/SignedHeaders=([^,]+),/)[1];
  refuse(()=>canonicalRequest({...s,signedHeaders}),'payload_hash_mismatch');
});
test('R24 signed empty STS payload still verifies when bytes empty',()=>{
  const s=signedSts(Buffer.alloc(0));
  assert.equal(verifyRequest(s,config).service,'sts');
});
test('R24 session token protection survives payload checks',()=>{
  const s=signedSts();
  s.headers['x-amz-security-token']='another-token';
  refuse(()=>verifyRequest(s,config),'temporary_token_not_signed');
});

test('R24 actual localhost HTTP capture refuses altered STS body under authentic header HMAC',async()=>{
  const witnessed=[];
  const server=createServer(async(req,res)=>{
    const chunks=[];for await(const c of req)chunks.push(Buffer.from(c));
    const body=Buffer.concat(chunks);
    let result='accepted';
    try{verifyRequest({method:req.method,url:req.url,headers:req.headers,body},config);}
    catch(e){result=e.message;}
    witnessed.push(result);
    res.writeHead(result==='accepted'?200:400);res.end();
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const port=server.address().port;
    const source=signedSts();
    // AWS SigV4 canonical host includes the port actually used on wire.
    const body=Buffer.from('Action=PutCallerIdentity&Version=2011-06-15');
    const m={method:'POST',url:'/',headers:{host:'127.0.0.1:'+port},body:original};
    const headers=signSynthetic(m,identity,scope);
    const status=await new Promise((resolve,reject)=>{
      const req=httpRequest({hostname:'127.0.0.1',port,path:'/',method:'POST',
        headers:{...headers,'content-length':body.length}},res=>{
        res.resume();res.on('end',()=>resolve(res.statusCode));
      });
      req.on('error',reject);req.end(body);
    });
    assert.equal(status,400);
    assert.deepEqual(witnessed,['payload_hash_mismatch']);
    assert.equal(source.method,'POST');
  }finally{
    await new Promise(resolve=>server.close(resolve));
  }
});
