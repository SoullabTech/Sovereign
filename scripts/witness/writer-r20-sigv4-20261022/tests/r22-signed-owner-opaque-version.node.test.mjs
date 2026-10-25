/**
 * R22 stricter SigV4 wire acceptance: exact bucket OWNER header must be
 * included in SignedHeaders. Opaque UTF-8 VersionId is part of signed query.
 * All credentials, requests and keys are FICTIONAL and localhost-only.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalRequest,signSynthetic,verifyRequest,uriEncode,
} from '../sigv4-witness.mjs';

const credentials={
  accessKeyId:'ASIAFIXTURE000000001',
  secretAccessKey:'FictionalSecretKeyMaterialForLocalSigV4Only0000',
  sessionToken:'FICTIONAL_SESSION_TOKEN_FOUR_ZERO_FOR_TEST_ONLY',
};
const scope={region:'us-east-1',service:'s3',datetime:'20261022T180000Z'};
const account='111122223333';
const versionSimple='r22-version-v0001';
const versionOpaque='3/L4kqtJlcpXroDTDmJ+rmSpXd3dIbrHY+MTRCxf3vjVBH40Nr8X8gdRQBpUMLUo';
const versionLong='R22'+ 'A'.repeat(201) + '+/=é';
const urlOf=(version)=>'/fictional-audit-bucket/writer-r20/checkpoint/head.json?versionId='+encodeURIComponent(version);
const msgOf=(version,withOwner=true)=>({
  method:'HEAD',url:urlOf(version),body:Buffer.alloc(0),
  headers:{host:'127.0.0.1:55501',
    ...(withOwner?{'x-amz-expected-bucket-owner':account}:{})},
});
const signedOf=(version,withOwner=true)=>{
  const msg=msgOf(version,withOwner);
  return {...msg,headers:signSynthetic(msg,credentials,scope)};
};
const options={...credentials,region:'us-east-1',service:'s3',
  requiredSignedHeaders:['x-amz-expected-bucket-owner']};

const refuse=(operation,expected)=>{
  assert.throws(operation,(e)=>e instanceof Error && e.message===expected);
};

test('R22: correct signed owner header and SigV4 temporary session pass',()=>{
  const v=verifyRequest(signedOf(versionSimple),options);
  assert.equal(v.signedToken,true);
  assert.equal(v.signedAccessKeyId,credentials.accessKeyId);
});
test('R22: owner header present but appended AFTER signature is refused',()=>{
  const m=signedOf(versionSimple,false);
  m.headers['x-amz-expected-bucket-owner']=account;
  // HMAC itself still verifies if the caller does not demand the owner header.
  assert.equal(verifyRequest(m,{...credentials,region:'us-east-1',service:'s3'}).signedToken,true);
  refuse(()=>verifyRequest(m,options),'required_header_not_signed');
});
test('R22: missing expected-owner header is refused, even with valid signature',()=>{
  refuse(()=>verifyRequest(signedOf(versionSimple,false),options),'required_header_not_signed');
});
test('R22: changing a signed expected-owner header invalidates the HMAC',()=>{
  const m=signedOf(versionSimple);
  m.headers['x-amz-expected-bucket-owner']='999900001111';
  refuse(()=>verifyRequest(m,options),'signature_mismatch');
});
test('R22: same signed owner with service=STS instead of S3 refuses',()=>{
  refuse(()=>verifyRequest(signedOf(versionSimple),{
    ...options,service:'sts',
  }),'credential_scope_mismatch');
});
test('R22: invalid required header list cannot be used to skip owner binding',()=>{
  refuse(()=>verifyRequest(signedOf(versionSimple),{
    ...options,requiredSignedHeaders:['x-amz-expected-bucket-owner','Authorization'],
  }),'invalid_required_signed_headers');
});
test('R22: AWS-documented opaque VersionId containing + and / is signed',()=>{
  const m=signedOf(versionOpaque);
  assert.equal(new URL(m.url,'https://witness.invalid').searchParams.get('versionId'),versionOpaque);
  assert.ok(m.url.includes('%2B') && m.url.includes('%2F'));
  const verified=verifyRequest(m,options);
  assert.equal(verified.signedToken,true);
});
test('R22: >192-byte opaque VersionId including Unicode UTF-8 signs correctly',()=>{
  assert.ok(Buffer.byteLength(versionLong,'utf8')>192);
  const m=signedOf(versionLong);
  assert.ok(m.url.includes('%2B%2F%3D%C3%A9'));
  const verified=verifyRequest(m,options);
  assert.equal(verified.signedToken,true);
  assert.equal(new URL(m.url,'https://witness.invalid').searchParams.get('versionId'),versionLong);
});
test('R22: + is not decoded into a space when VersionId is percent-encoded',()=>{
  const version='v+two';
  const m=signedOf(version);
  const canonical=canonicalRequest({...m,signedHeaders:
    m.headers.authorization.match(/SignedHeaders=([^,]+),/)[1]});
  assert.equal(canonical.split('\n')[2],'versionId=v%2Btwo');
  assert.equal(verifyRequest(m,options).signedToken,true);
});
test('R22: modifying encoded plus into a literal + breaks SigV4 HMAC',()=>{
  const m=signedOf(versionOpaque);
  const changed={...m,url:m.url.replace('%2B','+')};
  refuse(()=>verifyRequest(changed,options),'signature_mismatch');
});
test('R22: tampering opaque VersionId with a percent-encoded slash is refused',()=>{
  const m=signedOf(versionOpaque);
  const changed={...m,url:m.url.replace('%2F','%2B')};
  refuse(()=>verifyRequest(changed,options),'signature_mismatch');
});
test('R22: percent sign inside opaque VersionId is encoded and verified',()=>{
  const v='r22%opaque+v1';
  const m=signedOf(v);
  assert.ok(m.url.includes('r22%25opaque%2Bv1'));
  assert.equal(verifyRequest(m,options).signedToken,true);
});
test('R22: direct uriEncode follows UTF8-byte hex rule',()=>{
  assert.equal(uriEncode('R22+/=é'),'R22%2B%2F%3D%C3%A9');
});
