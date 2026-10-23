#!/usr/bin/env node
/**
 * R21 source-owner real AWS SDK v3 on-wire witness. NO REAL AWS CONNECTIONS.
 *
 * Usage: node R21_REAL_AWS_SDK_WITNESS.mjs --project /ABSOLUTE/READONLY/CHECKOUT
 * It dynamically requires the REAL @aws-sdk/client-s3 and client-sts from the
 * supplied project's node_modules, gives them the EXACT SAME immutable,
 * obviously fictional temp credential snapshot, and points BOTH service
 * endpoints at ephemeral 127.0.0.1 listeners. It captures actual emitted
 * HTTP requests, checks SigV4 HMAC independently and refuses if either
 * service signed with another access key/secret/token, region or service.
 *
 * NO IAM/STS/S3 account, resource, real credential, writer member or upload.
 * NO live Pro or source modifications; does NOT prove independently governed
 * current authority, S3 Object Lock, signer custody, AWS endpoint validation,
 * or exact serving route behavior. Run only with owner-approved source.
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {resolve,join,isAbsolute,dirname} from 'node:path';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {verifyRequest} from './sigv4-witness.mjs';

function refuse(code) {throw Error(code);}
const argv=process.argv.slice(2);
if(argv.length!==2 || argv[0]!=='--project' || !isAbsolute(argv[1])) {
 refuse('R21_REQUIRES_ABSOLUTE_READ_ONLY_PROJECT_PATH');
}
const project=resolve(argv[1]);
if(!existsSync(join(project,'package.json')))refuse('R21_PROJECT_PACKAGE_JSON_MISSING');
const manifest=JSON.parse(readFileSync(join(project,'package.json'),'utf8'));
const declared={...manifest.dependencies,...manifest.devDependencies};
if(!declared['@aws-sdk/client-s3'] || !declared['@aws-sdk/client-sts']) {
 refuse('R21_REAL_SDK_PACKAGES_MUST_BE_DECLARED_IN_PROJECT_MANIFEST');
}
const requireFromProject=createRequire(join(project,'package.json'));
// Some SDK package versions restrict package.json in their exports map.
// Read only the nearest verified SDK's package metadata as a fallback.
function sdkVersion(name){
 try{return requireFromProject(name+'/package.json').version;}
 catch{
  let base=dirname(requireFromProject.resolve(name));
  for(let i=0;i<8;i++){
   const file=join(base,'package.json');
   if(existsSync(file)){
    const pkg=JSON.parse(readFileSync(file,'utf8'));
    if(pkg.name===name && typeof pkg.version==='string')return pkg.version;
   }
   base=dirname(base);
  }
  refuse('R21_CANNOT_VERIFY_SDK_PACKAGE_VERSION');
 }
}
let S3Client,HeadObjectCommand,STSClient,GetCallerIdentityCommand,versionS3,versionSTS;
try{
 const s3=requireFromProject('@aws-sdk/client-s3');
 const sts=requireFromProject('@aws-sdk/client-sts');
 S3Client=s3.S3Client;HeadObjectCommand=s3.HeadObjectCommand;
 STSClient=sts.STSClient;GetCallerIdentityCommand=sts.GetCallerIdentityCommand;
 versionS3=sdkVersion('@aws-sdk/client-s3');
 versionSTS=sdkVersion('@aws-sdk/client-sts');
 if(![S3Client,HeadObjectCommand,STSClient,GetCallerIdentityCommand]
    .every(x=>typeof x==='function'))refuse('sdk_functions_missing');
}catch{refuse('R21_REAL_AWS_SDK_DEPENDENCIES_NOT_INSTALLED_OR_INCOMPATIBLE');}
if(versionS3!==versionSTS)refuse('R21_S3_STS_SDK_VERSIONS_NOT_PINNED_TO_IDENTICAL_RELEASE');
const region='us-east-1';
const credentials=Object.freeze({
 accessKeyId:'ASIA000000000000R21X',
 secretAccessKey:'R21FictionalOnlyTemporarySecretKeyForWireWitness001',
 sessionToken:'R21FICTIONALONLYTEMPORARYTOKENNOTVALIDINANYAWSACCOUNT001',
});
const expectedAccount='111122223333';
const bucket='r21-fictitious-audit-bucket';
const key='writer-r20/checkpoint/canary-audit-head.json';
// Include realistic S3-generated opaque ids (+, /) and a >192-byte id.
// This exercises the R15/R16 UTF-8 opaque-version compatibility gate.
// All are fictional and are sent ONLY to the local S3 witness listener.
const versionIds=[
 'r21-fixture-v0001',
 '3/L4kqtJlcpXroDTDmJ+rmSpXd3dIbrHY+MTRCxf3vjVBH40Nr8X8gdRQBpUMLUo',
 'R22'+ 'A'.repeat(201) + '+/=é',
];
const captures=[];
function safeHeaderMetadata(req){
 return {
  method:req.method,
  url:req.url,
  headers:req.headers,
 };
}
async function listen(service){
 const server=createServer(async(req,res)=>{
  try{
   const chunks=[];let size=0;
   for await(const chunk of req){size+=chunk.length;
    if(size>4096)throw Error('unexpected_large_witness_body');
    chunks.push(Buffer.from(chunk));}
   captures.push({service,...safeHeaderMetadata(req),body:Buffer.concat(chunks)});
   if(service==='s3'){
    res.writeHead(200,{
     'content-type':'application/json',
     'content-length':'0',
     'x-amz-version-id':new URL(req.url,'http://witness.invalid').searchParams.get('versionId')||'',
     'x-amz-object-lock-mode':'COMPLIANCE',
     'x-amz-object-lock-retain-until-date':'2027-10-22T00:00:00.000Z',
    });res.end();return;
   }
   res.writeHead(200,{'content-type':'text/xml; charset=utf-8'});
   res.end('<?xml version="1.0"?><GetCallerIdentityResponse xmlns="https://sts.amazonaws.com/doc/2011-06-15/"><GetCallerIdentityResult><Arn>arn:aws:sts::'+expectedAccount+':assumed-role/r21-test-only/wire</Arn><UserId>AROAFAKE:R21</UserId><Account>'+expectedAccount+'</Account></GetCallerIdentityResult><ResponseMetadata><RequestId>r21-fictitious</RequestId></ResponseMetadata></GetCallerIdentityResponse>');
  }catch{res.writeHead(400).end();}
 });
 await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(0,'127.0.0.1',resolve);
 });
 return server;
}
async function shutdown(server){
 if(!server.listening)return;
 await new Promise(resolve=>server.close(resolve));
}
const serverS3=await listen('s3');
const serverSTS=await listen('sts');
let clientS3,clientSTS;
try{
 const endpointS3='http://127.0.0.1:'+serverS3.address().port;
 const endpointSTS='http://127.0.0.1:'+serverSTS.address().port;
 clientS3=new S3Client({region,endpoint:endpointS3,credentials,maxAttempts:1,
  forcePathStyle:true});
 clientSTS=new STSClient({region,endpoint:endpointSTS,credentials,maxAttempts:1});
 // The wire request is the evidence; SDK parser response success is not
 // required to prove it sent a signed HTTP request to local loopback.
 const ctrl=new AbortController();
 const deadline=setTimeout(()=>ctrl.abort(),5000);
 try{
  await Promise.allSettled([
   ...versionIds.map(versionId=>clientS3.send(new HeadObjectCommand({
    Bucket:bucket,Key:key,VersionId:versionId,
    ExpectedBucketOwner:expectedAccount,
   }),{abortSignal:ctrl.signal})),
   clientSTS.send(new GetCallerIdentityCommand({}),
    {abortSignal:ctrl.signal}),
  ]);
 }finally{clearTimeout(deadline);}
 assert.equal(captures.length,versionIds.length+1,
  'R22_REQUIRES_EXACT_THREE_REAL_S3_AND_ONE_STS_SIGNED_REQUEST');
 const s3All=captures.filter(x=>x.service==='s3');
 const sts=captures.find(x=>x.service==='sts');
 assert.equal(s3All.length,versionIds.length,
  'R22_REQUIRES_ALL_THREE_OPAQUE_VERSION_HEAD_REQUESTS');
 assert.ok(sts,'R22_REQUIRES_ONE_STS_GET_CALLER_IDENTITY_REQUEST');
 assert.ok(sts.body.toString('utf8').includes('GetCallerIdentity'),
  'R22_STS_MUST_SEND_GET_CALLER_IDENTITY');
 const shared={...credentials,region};
 const verifiedSTS=verifyRequest(sts,{...shared,service:'sts'});
 const observedVersions=new Set();
 for(const s3 of s3All){
  assert.equal(s3.method,'HEAD','R22_EXPECTS_READ_ONLY_HEAD');
  const decodedVersion=new URL(s3.url,'http://witness.invalid')
    .searchParams.get('versionId');
  assert.ok(versionIds.includes(decodedVersion),
   'R22_MUST_SIGN_EXACT_OPAQUE_VERSION_ID');
  assert.equal(s3.headers['x-amz-expected-bucket-owner'],expectedAccount);
  const signed=verifyRequest(s3,{
   ...shared,service:'s3',
   // A header that is present but unsigned is not protected by SigV4.
   requiredSignedHeaders:['x-amz-expected-bucket-owner'],
  });
  assert.equal(signed.signedAccessKeyId,verifiedSTS.signedAccessKeyId);
  assert.equal(signed.signedToken,true);
  assert.ok(!observedVersions.has(decodedVersion),
   'R22_DUPLICATE_VERSION_REQUEST_IS_NOT_FULL_COVERAGE');
  observedVersions.add(decodedVersion);
 }
 assert.equal(observedVersions.size,versionIds.length);
 assert.equal(verifiedSTS.signedToken,true);
 console.log('R22_REAL_SDK_SIGNED_BUCKET_OWNER_AND_OPAQUE_VERSIONS_PASS');
 console.log(JSON.stringify({
  scope:'fictional_loopback_only',
  sdk_versions_equal:versionS3===versionSTS,
  sdk_version:versionS3,
  services:['s3','sts'],
  signatures_verified:versionIds.length+1,
  common_access_key_id_sha256_prefix:createHash('sha256')
   .update(credentials.accessKeyId).digest('hex').slice(0,12),
  same_frozen_temporary_credentials:true,
  session_token_signed_by_both:true,
  expected_s3_owner_bound:true,
  S3_version_id_bound:true,
  signed_bucket_owner_required_for_each_head:true,
  verified_opaque_version_shapes:versionIds.length,
  exotic_version_length_over_192_bytes:true,
  live_AWS_resource_used:false,
  member_authorization_granted:false,
  independent_current_R20_proven:false,
 },null,2));
}finally{
 clientS3?.destroy();clientSTS?.destroy();
 await Promise.all([shutdown(serverS3),shutdown(serverSTS)]);
}
