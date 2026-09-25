import type { ScopeIdentityContract } from './model';
import { referenceContract } from './contract';
const clone=():ScopeIdentityContract=>structuredClone(referenceContract());

export const defeatCandidates = [
  ['D1','L1',(c:any)=>{c.relationshipFrameDistinctFromChildSubject=false}],
  ['D2','L2',(c:any)=>{c.childSubjectDistinctFromManuscriptScope=false}],
  ['D3','L3',(c:any)=>{c.reviewSubjectKind='EDITORIAL_LOCUS';c.reviewAddress='SECTION_ID'}],
  ['D4','L4',(c:any)=>{c.reviewManuscriptScope='PASSAGE'}],
  ['D5','L5',(c:any)=>{c.reviewEvidenceAuthority='A2_PARENT_COPY';c.reviewEvidenceCopiedToParent=true}],
  ['D6','L6',(c:any)=>{c.reviewReadingScopeAutoMapsToFrame=true;c.reviewUnitAutoMapsToChapter=true}],
  ['D7','L7',(c:any)=>{c.editorialDiscriminatorLocation='NONE'}],
  ['D8','L8',(c:any)=>{c.editorialSectionOpenScope='UNMEASURED'}],
  ['D9','L9',(c:any)=>{c.editorialPassageOpenScope='section'}],
  ['D10','L10',(c:any)=>{c.fullBodyPassageScope='section'}],
  ['D11','L11',(c:any)=>{c.editorialScopeSource='CLIENT_ASSERTED'}],
  ['D12','L12',(c:any)=>{c.editorialScopeMutable=true}],
  ['D13','L13',(c:any)=>{c.historicalEditorialStanding='BACKFILLED';c.historicalHeuristicBackfill=true}],
  ['D14','L14',(c:any)=>{c.historicalEditorialA2Admittable=true}],
  ['D15','L15',(c:any)=>{c.a24GenericScopeSurvives=true;c.a24ColumnsMeaning='UNIVERSAL_SCOPE'}],
  ['D16','L16',(c:any)=>{c.reviewScopeNullable=false;c.reviewScopeMustBeNull=false;c.editorialScopeRequired=false}],
  ['D17','L17',(c:any)=>{c.relationshipFrameAuthority='COGNITION_AUTHORITY';c.relationshipFrameVocabularyMakesExecutable=true}],
  ['D18','L18',(c:any)=>{c.heterogeneousSubjectsShareOneRelationship=false;c.successorNoBackfillFailClosed=false}],
] as const;

export function mutant(fn:(c:any)=>void):ScopeIdentityContract {
  const c:any=clone(); fn(c); return c;
}
