/**
 * R21 test-only AWS Signature Version 4 header verifier.
 * Verifies credential scope + exact signed headers + HMAC for captured Node
 * HTTP requests from local fake S3 and STS endpoints, never a real AWS URL.
 * The AWS published S3 header-signing example is a known-answer vector.
 * This is not a general-purpose production SigV4 implementation.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export function hashHex(value) {
  return createHash('sha256').update(value).digest('hex');
}
export function hmac(key, value) {
  return createHmac('sha256', key).update(value).digest();
}
export function keyFor(secret, day, region, service) {
  return hmac(hmac(hmac(hmac('AWS4' + secret, day), region), service), 'aws4_request');
}
export function uriEncode(value) {
  return [...Buffer.from(String(value), 'utf8')].map(byte =>
    (byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122)
    || (byte >= 48 && byte <= 57) || [45,46,95,126].includes(byte)
      ? String.fromCharCode(byte)
      : '%' + byte.toString(16).toUpperCase().padStart(2, '0')).join('');
}
function strictAuthorization(value) {
  if (typeof value !== 'string') throw Error('missing_authorization');
  const match = /^AWS4-HMAC-SHA256 Credential=([A-Z0-9]+)\/(\d{8})\/([a-z0-9-]+)\/([a-z0-9-]+)\/aws4_request,\s*SignedHeaders=([a-z0-9;-]+),\s*Signature=([a-f0-9]{64})$/.exec(value);
  if (!match) throw Error('unsupported_authorization');
  return { accessKeyId:match[1],day:match[2],region:match[3],service:match[4],signedHeaders:match[5],signature:match[6] };
}
function normalizeHeader(value) {
  if (typeof value !== 'string') throw Error('invalid_signed_header');
  return value.trim().replace(/\s+/g, ' ');
}
function canonicalQuery(pathAndSearch) {
  const u = new URL(pathAndSearch, 'https://witness.invalid');
  const entries = [...u.searchParams.entries()]
    .map(([k,v]) => [uriEncode(k), uriEncode(v)])
    .sort((a,b) => a[0].localeCompare(b[0], 'en') || a[1].localeCompare(b[1], 'en'));
  return entries.map(([k,v]) => k + '=' + v).join('&');
}
export function canonicalRequest({method,url,headers,body=Buffer.alloc(0),signedHeaders}) {
  const names=signedHeaders.split(';');
  if (names.length===0 || new Set(names).size !== names.length
    || [...names].sort().join(';')!==signedHeaders || !names.includes('host')) {
    throw Error('invalid_signed_headers');
  }
  if (names.some(n => !/^[a-z0-9-]+$/.test(n))) throw Error('bad_header_name');
  const lower = Object.fromEntries(Object.entries(headers).map(([k,v])=>[k.toLowerCase(),v]));
  if (names.some(k=>typeof lower[k]!=='string')) throw Error('missing_signed_header');
  const canonicalHeaders = names.map(k=>k+':'+normalizeHeader(lower[k])+'\n').join('');
  const encodedPath = new URL(url,'https://witness.invalid').pathname || '/';
  // Fixed witness URLs use only RFC3986 unreserved ASCII paths/slashes.
  // Do not use this simplified path handling for arbitrary S3 object keys.
  if (!/^\/[A-Za-z0-9/_~.-]*$/.test(encodedPath)) throw Error('unsupported_witness_path');
  const payloadHash = typeof lower['x-amz-content-sha256']==='string'
    ? lower['x-amz-content-sha256'] : hashHex(body);
  if (payloadHash !== 'UNSIGNED-PAYLOAD' && !/^[a-f0-9]{64}$/.test(payloadHash)) {
    throw Error('unsupported_payload_hash');
  }
  // R24: A valid HMAC over a CLAIMED body digest does not establish that
  // the captured HTTP body matches that digest. The previous witness used
  // the x-amz-content-sha256 header but never checked the actual bytes.
  // S3 permits its explicitly declared UNSIGNED-PAYLOAD option; STS does not.
  if (payloadHash !== 'UNSIGNED-PAYLOAD' && payloadHash !== hashHex(body)) {
    throw Error('payload_hash_mismatch');
  }
  const text = [method.toUpperCase(),encodedPath,canonicalQuery(url),
    canonicalHeaders,signedHeaders,payloadHash].join('\n');
  return text;
}
function hexEq(a,b) {
  const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');
  return x.length===32 && y.length===32 && timingSafeEqual(x,y);
}
export function verifyRequest({method,url,headers,body=Buffer.alloc(0)},options) {
  const auth=strictAuthorization(headers.authorization || headers.Authorization);
  if (!options || auth.accessKeyId!==options.accessKeyId
    || auth.region!==options.region || auth.service!==options.service) {
    throw Error('credential_scope_mismatch');
  }
  const date=headers['x-amz-date']||headers['X-Amz-Date'];
  if (typeof date!=='string' || !/^\d{8}T\d{6}Z$/.test(date)
    || date.slice(0,8)!==auth.day) throw Error('date_scope_mismatch');
  const signedSet=new Set(auth.signedHeaders.split(';'));
  if (options.sessionToken!==undefined) {
    if ((headers['x-amz-security-token']||headers['X-Amz-Security-Token'])!==options.sessionToken
      || !signedSet.has('x-amz-security-token')) {
      throw Error('temporary_token_not_signed');
    }
  }
  // R22 WIRE TEST-ONLY gate: the S3 expected bucket owner must itself be
  // protected by the Authorization SignedHeaders HMAC. Merely seeing the
  // correct header value is insufficient: an intermediary could replace an
  // unsigned x-amz-expected-bucket-owner without breaking the signature.
  // Do not use this bounded fixture verifier as a general AWS authenticator.
  if(options.requiredSignedHeaders!==undefined){
    if(!Array.isArray(options.requiredSignedHeaders)
      ||options.requiredSignedHeaders.length===0
      ||options.requiredSignedHeaders.length>8
      ||options.requiredSignedHeaders.some(h=>typeof h!=='string'
        || !/^[a-z0-9-]+$/.test(h))) {
      throw Error('invalid_required_signed_headers');
    }
    const lower=Object.fromEntries(Object.entries(headers)
      .map(([k,v])=>[k.toLowerCase(),v]));
    for(const h of options.requiredSignedHeaders){
      if(!signedSet.has(h)||typeof lower[h]!=='string'){
        throw Error('required_header_not_signed');
      }
    }
  }
  // R24: UNSIGNED-PAYLOAD is an explicit S3 mode. Never accept that mode
  // for the STS GetCallerIdentity POST used by this signing witness.
  if (auth.service !== 's3' &&
      (headers['x-amz-content-sha256']||headers['X-Amz-Content-Sha256'])
        === 'UNSIGNED-PAYLOAD') {
    throw Error('unsigned_sts_payload');
  }
  const canon=canonicalRequest({method,url,headers,body,signedHeaders:auth.signedHeaders});
  const scope=[auth.day,auth.region,auth.service,'aws4_request'].join('/');
  const toSign=['AWS4-HMAC-SHA256',date,scope,hashHex(canon)].join('\n');
  const expected = createHmac('sha256',keyFor(options.secretAccessKey,auth.day,auth.region,auth.service))
    .update(toSign).digest('hex');
  if(!hexEq(expected,auth.signature)) throw Error('signature_mismatch');
  return Object.freeze({signedAccessKeyId:auth.accessKeyId,
    service:auth.service, region:auth.region,
    signedToken:options.sessionToken!==undefined,
    canonicalRequestSha256:hashHex(canon)});
}
/** Explicit witness-only helper for generating synthetic requests in unit tests. */
export function signSynthetic({method,url,headers={},body=Buffer.alloc(0)},credentials,scope={region:'us-east-1',service:'s3',datetime:'20261022T180000Z'}) {
  const extra={...headers,'x-amz-date':scope.datetime,
    ...(credentials.sessionToken?{'x-amz-security-token':credentials.sessionToken}:{})};
  if(!extra.host) extra.host='127.0.0.1:55501';
  if(!extra['x-amz-content-sha256'])extra['x-amz-content-sha256']=hashHex(body);
  const names=Object.keys(extra).map(n=>n.toLowerCase()).sort();
  const signedHeaders=names.join(';');
  const canon=canonicalRequest({method,url,headers:extra,body,signedHeaders});
  const day=scope.datetime.slice(0,8);
  const signedScope=[day,scope.region,scope.service,'aws4_request'].join('/');
  const stringToSign=['AWS4-HMAC-SHA256',scope.datetime,signedScope,hashHex(canon)].join('\n');
  const signature=createHmac('sha256',keyFor(credentials.secretAccessKey,day,scope.region,scope.service)).update(stringToSign).digest('hex');
  return {...extra,authorization:'AWS4-HMAC-SHA256 Credential='+credentials.accessKeyId+'/'+signedScope+', SignedHeaders='+signedHeaders+', Signature='+signature};
}
