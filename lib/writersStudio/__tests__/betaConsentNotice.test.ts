import { createHash } from 'node:crypto';
import { verifiedBetaConsentNotice } from '../betaConsentNotice';

const fiction='This is fictional-only policy language for isolated laboratory acceptance. No real member may accept this test notice.';
const hash=createHash('sha256').update(fiction).digest('hex');
const version='fictional-test-v1';
const configured=(overrides:Record<string,string|undefined>={})=>({
  WRITERS_STUDIO_BETA_CONSENT_VERSION:version,
  WRITERS_STUDIO_BETA_CONSENT_SHA256:hash,
  WRITERS_STUDIO_BETA_CONSENT_NOTICE:fiction,
  ...overrides,
} as NodeJS.ProcessEnv);
it('accepts only a notice matching exact reviewed bytes and version',()=>{
 const n=verifiedBetaConsentNotice(configured());
 expect(n).toEqual({version,sha256:hash,text:fiction});
});
it('refuses missing text, missing hash, fake hash, or text changed after approval',()=>{
 for(const x of [
  {WRITERS_STUDIO_BETA_CONSENT_NOTICE:undefined},
  {WRITERS_STUDIO_BETA_CONSENT_SHA256:undefined},
  {WRITERS_STUDIO_BETA_CONSENT_SHA256:'a'.repeat(64)},
  {WRITERS_STUDIO_BETA_CONSENT_NOTICE:fiction+' changed'},
  {WRITERS_STUDIO_BETA_CONSENT_VERSION:'invalid policy'},
 ]){
  expect(verifiedBetaConsentNotice(configured(x))).toBeNull();
 }
});
it('has no fallback notice in an unconfigured environment',()=>{
 expect(verifiedBetaConsentNotice({} as NodeJS.ProcessEnv)).toBeNull();
});
