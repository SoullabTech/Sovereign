/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-2
 * LIVE REVIEW DISCUSS + ISOLATED FOUNDER-TEST DEPLOYMENT
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface LawResult { readonly id:string; readonly ok:boolean; readonly detail:string }
const ROOT=process.cwd();
const read=(p:string)=>existsSync(join(ROOT,p))?readFileSync(join(ROOT,p),'utf8'):'';
const yes=(id:string,ok:boolean,detail:string):LawResult=>({id,ok,detail});
const has=(s:string,re:RegExp)=>re.test(s);

const P={
 route:'app/api/sovereign/manuscripts/[id]/review-discuss/route.ts',
 reader:'lib/manuscript/ask/reviewDiscussReader.ts',
 client:'lib/writersStudio/rebuild/reviewDiscuss.ts',
 live:'app/writers-studio/rebuild/liveReview.ts',
 liveView:'app/writers-studio/rebuild/LiveReviewView.tsx',
 host:'app/writers-studio/rebuild/FlagshipWriteHost.tsx',
 presentation:'app/writers-studio/flagship/DevelopReview.tsx',
 thread:'lib/manuscript/ask/threadStore.ts',
 receipt:'lib/disclosure/contextDisclosureReceipt.ts',
 migration:'database/migrations/20260923000001_review_discuss_disclosure_boundary.sql',
 page:'app/writers-studio/rebuild/page.tsx',
 deploy:'scripts/writers-studio/run-r2-2-founder-test.sh',
} as const;

export function runR22Laws():LawResult[]{
 const route=read(P.route), reader=read(P.reader), client=read(P.client);
 const live=read(P.live), liveView=read(P.liveView), host=read(P.host);
 const presentation=read(P.presentation), thread=read(P.thread), receipt=read(P.receipt);
 const migration=read(P.migration), page=read(P.page), deploy=read(P.deploy);
 const out:LawResult[]=[];

 out.push(yes('R2-2-L1-truthful-review-discuss-receipt-vocabulary',
  has(receipt,/writers_studio\.review_discuss->maia_cognition/) &&
  has(receipt,/discuss_finding/) &&
  has(migration,/writers_studio\.review_discuss->maia_cognition/) &&
  has(migration,/discuss_finding/),
  'receipt=' + Boolean(receipt) + ' migration=' + Boolean(migration)));

 out.push(yes('R2-2-L2-review-thread-identity-is-distinct',
  has(thread,/ReviewDiscussReadingIdentity/) &&
  has(thread,/kind:\s*['"]review_discuss_r2_1['"]/) &&
  has(thread,/o\.kind\s*===\s*['"]review_discuss_r2_1['"]/),
  'threadIdentity=' + has(thread,/review_discuss_r2_1/)));

 out.push(yes('R2-2-L3-live-review-preserves-durable-sidecar',
  has(live,/DurableObservationTruth/) &&
  has(live,/readonly durable:/) &&
  has(live,/durable:\s*mapped\.durable/) &&
  has(host,/durable:\s*r\.durable/),
  'live=' + Boolean(live) + ' host=' + Boolean(host)));

 out.push(yes('R2-2-L4-review-discuss-uses-exact-sidecar-address',
  has(host,/review\.durable\[findingId\]/) &&
  has(host,/observationKey:\s*truth\.address\.observationKey/) &&
  has(host,/readingId:\s*truth\.address\.readingId/) &&
  !has(host,/findingId\.slice|findingId\.split/),
  'exact durable sidecar, no id parsing'));

 out.push(yes('R2-2-L5-review-presentation-has-real-discuss-action',
  has(presentation,/ReviewDiscussion/) &&
  has(presentation,/discussion\?/) &&
  has(presentation,/onDiscuss/) &&
  has(liveView,/onDiscussFinding/) &&
  has(liveView,/discuss:\s*true/),
  'presentation=' + Boolean(presentation) + ' liveView=' + Boolean(liveView)));

 out.push(yes('R2-2-L6-route-auth-and-ownership-precede-persistence',(()=>{
  const auth=route.indexOf('getMemberIdFromRequest');
  const own=route.indexOf('memberOwnsWork');
  const open=route.indexOf('openThread');
  return auth>=0 && own>auth && open>own;
 })(), 'auth < ownership < openThread'));

 out.push(yes('R2-2-L7-sanctuary-refuses-before-any-persistence',(()=>{
  const explicit=has(route,/typeof body\.sanctuary\s*!==\s*['"]boolean['"]/);
  const refusal=route.indexOf('sanctuary_unavailable');
  const open=route.indexOf('openThread');
  return explicit && refusal>=0 && open>refusal;
 })(), 'explicit posture + refusal before openThread'));

 out.push(yes('R2-2-L8-first-act-is-history-empty-and-non-resumable',
  Boolean(route) &&
  !has(route,/loadThread|threadsOnAnchor|historyFor/) &&
  !has(route,/body\.threadId/) &&
  has(reader,/messages:\s*\[\s*\{\s*role:\s*['"]user['"]/s),
  'no resume/history path'));

 out.push(yes('R2-2-L9-exact-frozen-reading-and-verified-historical-evidence',
  has(route,/loadFrozenDevelopmentalReading/) &&
  has(route,/checkObservationAnchor/) &&
  has(route,/deriveBodyRequirement/) &&
  has(route,/loadRevisionContent/) &&
  has(route,/assembleDevelopmentalContext/) &&
  has(route,/historical_evidence_unavailable/),
  'exact reading + digest recovery'));

 out.push(yes('R2-2-L10-work-crosses-only-after-truthful-boundary',
  has(route,/establishDisclosureBoundary/) &&
  has(route,/writers_studio\.review_discuss->maia_cognition/) &&
  has(route,/gesture:\s*['"]discuss_finding['"]/) &&
  route.indexOf('establishDisclosureBoundary') < route.indexOf('loadRevisionContent'),
  'boundary before historical body read'));

 out.push(yes('R2-2-L11-single-use-act-and-atomic-completion',
  has(route,/mintAct/) && has(route,/claimAct/) &&
  has(route,/transaction/) && has(route,/appendTurnWithClient/) &&
  has(route,/confirmDisclosureCrossedWithClient/) &&
  has(route,/recordCompletionWithClient/),
  'claim + turn + confirm + completion'));

 out.push(yes('R2-2-L12-reader-is-structured-router-only-as-read',
  has(reader,/runStructured/) &&
  !has(reader,/@anthropic-ai|anthropicStructured|tools\s*:/) &&
  has(reader,/AS_READ/) &&
  has(reader,/reread/i) &&
  has(reader,/current text/i),
  'structured router, no tools/vendor bypass'));

 out.push(yes('R2-2-L13-server-provenance-carries-r2-envelope',
  has(route,/provenanceAuthority:\s*['"]SERVER['"]/) &&
  has(route,/contractVersion:\s*['"]R2-1['"]/) &&
  has(route,/historyPolicy:\s*['"]NONE['"]/) &&
  has(route,/durableEffect:\s*['"]NONE['"]/) &&
  has(route,/cognitionInputFingerprint/) &&
  has(route,/authorizationRef/) &&
  has(route,/disclosureReceiptRefs/),
  'server-authored answer provenance'));

 out.push(yes('R2-2-L14-independent-review-discuss-feature-flag',
  has(page,/WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED/) &&
  has(host,/reviewDiscussEnabled/) &&
  has(host,/reviewDiscussEnabled\s*&&/),
  'separate test activation'));

 out.push(yes('R2-2-L15-client-refuses-unresolved-posture-before-network',
  has(client,/CurrentPostureRead/) &&
  has(client,/if\s*\(!posture\.resolved\)/) &&
  has(client,/posture_unresolved/) &&
  client.indexOf('if (!posture.resolved)') < client.indexOf('apiFetch'),
  'client posture gate'));

 const noWorkWrites=Boolean(route) &&
  !has(route,/UPDATE\s+(member_manuscripts|draft_sections|manuscript_|developmental_)/i) &&
  !has(route,/INSERT\s+INTO\s+(member_manuscripts|draft_sections)/i) &&
  !has(reader,/UPDATE\s+|INSERT\s+INTO|DELETE\s+FROM/i);
 out.push(yes('R2-2-L16-review-discuss-cannot-write-work',
  noWorkWrites,'route/reader contain no Work mutation SQL'));

 out.push(yes('R2-2-L17-founder-test-launch-is-isolated-and-fail-closed',
  has(deploy,/verify-test-env\.sh/) &&
  has(deploy,/maia_consciousness_test/) &&
  has(deploy,/WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1/) &&
  has(deploy,/WRITERS_STUDIO_EDITORIAL_ENABLED=1/) &&
  has(deploy,/NEXT_PUBLIC_API_BASE_URL=http:\/\/localhost:/) &&
  !has(deploy,/\.env\.production|clean-main-no-secrets/),
  'isolated DB + local API + both conversation surfaces enabled'));

 return out;
}
