#!/usr/bin/env node
/**
 * R25 — ACTUAL AWS SDK v3 S3 HEAD / GET / ListObjectVersions loopback witness.
 *
 * A deliberately fictional, test-only extension of the R21/R24 SigV4 job.
 * No production endpoint, real AWS credentials, keys, buckets, IAM, Writer
 * content, R20 signer or authorization. This tests SDK parsing/signing,
 * NOT independently current object custody or a live R16/R17 integration.
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {join,isAbsolute,resolve,dirname} from 'node:path';
import {existsSync,readFileSync} from 'node:fs';
import {verifyRequest} from './sigv4-witness.mjs';

function fail(){throw Error('R25_TEST_ONLY_S3_SDK_CONTRACT_REFUSED');}
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--project'||!isAbsolute(args[1]))fail();
const project=resolve(args[1]);
const pkgFile=join(project,'package.json');
if(!existsSync(pkgFile))fail();
const pkg=JSON.parse(readFileSync(pkgFile,'utf8'));
if(pkg.dependencies?.['@aws-sdk/client-s3']!=='3.658.1'
  ||pkg.dependencies?.['@aws-sdk/client-sts']!=='3.658.1')fail();
const projectRequire=createRequire(pkgFile);
function packageVersion(name){
  let dir=dirname(projectRequire.resolve(name));
  for(let i=0;i<8;i++){
    const file=join(dir,'package.json');
    if(existsSync(file)){
      const data=JSON.parse(readFileSync(file,'utf8'));
      if(data.name===name)return data.version;
    }
    dir=dirname(dir);
  }
  fail();
}
if(packageVersion('@aws-sdk/client-s3')!=='3.658.1'
  ||packageVersion('@aws-sdk/client-sts')!=='3.658.1')fail();
const {S3Client,HeadObjectCommand,GetObjectCommand,ListObjectVersionsCommand}
  =projectRequire('@aws-sdk/client-s3');
if(![S3Client,HeadObjectCommand,GetObjectCommand,ListObjectVersionsCommand]
  .every(x=>typeof x==='function'))fail();

const region='us-east-1';
const account='111122223333';
const bucket='r25-fictional-lock-test';
const key='writer-r20/checkpoint/canary-audit-head.json';
const oldVersion='3/L4kqtJlcpXroDTDmJ+rmSpXd3dIbrHY+MTRCxf3vjVBH40Nr8X8gdRQBpUMLUo';
const markerVersion='R25DELETE+'+'x'.repeat(210)+'/é';
const expires='2031-10-22T00:00:00.000Z';
const credentials=Object.freeze({
  accessKeyId:'ASIA000000000000R25X',
  secretAccessKey:'R25FictionalOnlyTemporarySecretKeyForWireWitness001',
  sessionToken:'R25FICTIONALONLYTEMPORARYTOKENNOTVALIDINANYAWSACCOUNT001',
});
const bytes=Buffer.from(JSON.stringify({
  version:1,purpose:'soullab.writer-beta.r20.audit-head.v1',
  authorityId:'fictional-r25-custody',
  epoch:7,lastSequence:7,lastHash:'a'.repeat(64),
}),'utf8');
const xmlEscape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const inventoryXml=
  '<?xml version="1.0" encoding="UTF-8"?>'
 +'<ListVersionsResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">'
 +'<Name>'+xmlEscape(bucket)+'</Name><Prefix>'+xmlEscape(key)+'</Prefix>'
 +'<KeyMarker></KeyMarker><VersionIdMarker></VersionIdMarker>'
 +'<MaxKeys>32</MaxKeys><IsTruncated>false</IsTruncated>'
 +'<Version><Key>'+xmlEscape(key)+'</Key><VersionId>'+xmlEscape(oldVersion)
 +'</VersionId><IsLatest>false</IsLatest>'
 +'<LastModified>2026-10-22T00:00:00.000Z</LastModified>'
 +'<ETag>&quot;fictional-version-etag&quot;</ETag>'
 +'<Size>'+bytes.length+'</Size><StorageClass>STANDARD</StorageClass></Version>'
 +'<DeleteMarker><Key>'+xmlEscape(key)+'</Key><VersionId>'
 +xmlEscape(markerVersion)+'</VersionId><IsLatest>true</IsLatest>'
 +'<LastModified>2026-10-22T01:00:00.000Z</LastModified>'
 +'</DeleteMarker></ListVersionsResult>';
const captured=[];
const maxRequestBytes=2048;
const server=createServer(async(req,res)=>{
  try{
    assert.equal(req.socket.remoteAddress,'127.0.0.1');
    const chunks=[];let total=0;
    for await(const chunk of req){
      total+=chunk.length;if(total>maxRequestBytes)fail();
      chunks.push(Buffer.from(chunk));
    }
    captured.push({
      method:req.method,url:req.url,headers:req.headers,body:Buffer.concat(chunks),
    });
    const url=new URL(req.url,'http://local.invalid');
    const exactKey='/'+bucket+'/'+key;
    assert.equal(req.headers['x-amz-expected-bucket-owner'],account);
    if(req.method==='GET'&&url.pathname==='/'+bucket+'/'
      &&url.searchParams.has('versions')
      &&url.searchParams.get('prefix')===key){
      res.writeHead(200,{
        'content-type':'application/xml',
        'content-length':Buffer.byteLength(inventoryXml),
      });
      res.end(inventoryXml);
      return;
    }
    assert.equal(url.pathname,exactKey);
    assert.equal(url.searchParams.get('versionId'),oldVersion);
    assert.ok(req.method==='GET'||req.method==='HEAD');
    res.writeHead(200,{
      'content-type':'application/json',
      'content-length':String(bytes.length),
      'x-amz-version-id':oldVersion,
      'x-amz-object-lock-mode':'COMPLIANCE',
      'x-amz-object-lock-retain-until-date':expires,
      'x-amz-object-lock-legal-hold':'OFF',
    });
    res.end(req.method==='HEAD'?undefined:bytes);
  }catch{
    res.writeHead(400,{'content-type':'application/xml'});
    res.end('<Error><Code>InvalidRequest</Code></Error>');
  }
});
await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(0,'127.0.0.1',resolve);
});
let s3;
try{
  const endpoint='http://127.0.0.1:'+server.address().port;
  s3=new S3Client({region,endpoint,forcePathStyle:true,credentials,maxAttempts:1});
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),5000);
  try{
    const base={
      Bucket:bucket,Key:key,VersionId:oldVersion,ExpectedBucketOwner:account,
    };
    const head=await s3.send(new HeadObjectCommand(base),
      {abortSignal:controller.signal});
    assert.equal(head.VersionId,oldVersion);
    assert.equal(head.ObjectLockMode,'COMPLIANCE');
    assert.equal(head.ObjectLockLegalHoldStatus,'OFF');
    assert.equal(head.ContentLength,bytes.length);
    assert.equal(head.ContentType,'application/json');
    assert.equal(head.ObjectLockRetainUntilDate?.toISOString(),expires);

    const got=await s3.send(new GetObjectCommand(base),
      {abortSignal:controller.signal});
    assert.equal(got.VersionId,oldVersion);
    assert.equal(got.ObjectLockMode,'COMPLIANCE');
    assert.equal(got.ObjectLockLegalHoldStatus,'OFF');
    assert.equal(got.ContentLength,bytes.length);
    assert.equal(got.ObjectLockRetainUntilDate?.toISOString(),expires);
    assert.ok(got.Body?.[Symbol.asyncIterator],'R25_EXPECTS_STREAMING_BODY');
    let chunks=[];let read=0;
    for await(const chunk of got.Body){
      assert.ok(chunk instanceof Uint8Array);
      read+=chunk.length;
      assert.ok(read<=4096,'R25_ABSOLUTE_CONTENT_LIMIT');
      chunks.push(Buffer.from(chunk));
    }
    assert.equal(read,bytes.length);
    assert.deepEqual(Buffer.concat(chunks),bytes);

    const listing=await s3.send(new ListObjectVersionsCommand({
      Bucket:bucket,Prefix:key,MaxKeys:32,ExpectedBucketOwner:account,
    }),{abortSignal:controller.signal});
    assert.equal(listing.IsTruncated,false);
    assert.equal(listing.Versions?.length,1);
    assert.equal(listing.Versions?.[0]?.VersionId,oldVersion);
    assert.equal(listing.Versions?.[0]?.IsLatest,false);
    assert.equal(listing.DeleteMarkers?.length,1);
    assert.equal(listing.DeleteMarkers?.[0]?.VersionId,markerVersion);
    assert.equal(listing.DeleteMarkers?.[0]?.IsLatest,true);
  }finally{clearTimeout(timer);}
  assert.equal(captured.length,3,'R25_EXPECTS_HEAD_GET_LIST');
  assert.deepEqual(captured.map(x=>x.method),['HEAD','GET','GET']);
  for(const capturedRequest of captured){
    const verified=verifyRequest(capturedRequest,{
      ...credentials,region,service:'s3',
      requiredSignedHeaders:['x-amz-expected-bucket-owner'],
    });
    assert.equal(verified.signedAccessKeyId,credentials.accessKeyId);
    assert.equal(verified.signedToken,true);
  }
  console.log('R25_REAL_SDK_S3_HEAD_GET_LIST_OBJECT_LOCK_AND_DELETE_MARKER_PASS');
  console.log(JSON.stringify({
    mode:'fictional_loopback_only',
    sdk_version:'3.658.1',
    requests_signed:captured.length,
    version_specific_head_metadata:true,
    version_specific_get_body_bytes:true,
    listed_newer_delete_marker:true,
    opaque_utf8_version_ids:true,
    no_aws_account_or_production:true,
    independent_latest_R20_proven:false,
  },null,2));
}finally{
  s3?.destroy();
  await new Promise(resolve=>server.close(resolve));
}