/**
 * Release-baseline member research snapshot verifier.
 * Read-only, offline, fixed digest and strict public-field constraints.
 * Source derivation was independently witnessed against accepted Foundry commit
 * 45ac2a182a7687062704e28f0dc0e3d5e0c5ce4d before transfer.
 * The historic internal research catalogue is intentionally not bundled
 * with the production-based member release.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const sourcePath=path.join(root,'lib/foundry/memberResearchSnapshot.json');
const bytes=readFileSync(sourcePath);
const sha=b=>createHash('sha256').update(b).digest('hex');
const expected='90a8a6e31fbbdde63000da8091875a16bfe71b3b5e16f64cc9817d14fbb42197';
if(sha(bytes)!==expected)throw Error('Public Foundry member snapshot differs from accepted source-derived fingerprint.');
const doc=JSON.parse(bytes.toString('utf8'));
if(doc.schema!=='soullab.member-foundry.research-sources.v1'
 ||doc.origin!=='AIN-CAPABILITY-FOUNDRY-01'
 ||doc.accepted_research_catalogue_commit!=='45ac2a182a7687062704e28f0dc0e3d5e0c5ce4d'
 ||doc.origin_catalogue_sha256!=='9037d3f9695a72cfa70b01a9eb8eba58027f8f2134e3458e6e6dd32a02e6f54b'
 ||doc.presentation!=='MEMBER_INFORMATION_ONLY'
 ||doc.license_clearance!=='PENDING_FOR_ALL_CANDIDATES'
 ||doc.installed_capabilities!==0
 ||doc.model_skill_execution!=='NOT_AUTHORIZED'
 ||doc.member_information_included!==false
 ||doc.source_count!==26 ||!Array.isArray(doc.entries)||doc.entries.length!==26)
 throw Error('Public Foundry snapshot has an unauthorized or inconsistent standing.');
const keys=['area','availability','could_inform','id','name','public_source_url','purpose','research_caution','source_standing'].sort();
const hosts=new Set(['github.com','huggingface.co','arxiv.org','sophontic.ai','blog.pypi.org','www.promptfoo.dev']);
const ids=new Set();
for(const item of doc.entries){
 if(JSON.stringify(Object.keys(item).sort())!==JSON.stringify(keys)
  ||typeof item.id!=='string'||ids.has(item.id)
  ||item.availability!=='RESEARCH_ONLY_NOT_ENABLED'
  ||!['DOCUMENTATION_SURVEYED','LINK_NOMINATED'].includes(item.source_standing)
  ||!Array.isArray(item.could_inform)
  ||!item.name ||!item.purpose ||!item.research_caution)
  throw Error('Unauthorized/duplicate Foundry member source fields.');
 ids.add(item.id);
 const u=new URL(item.public_source_url);
 if(u.protocol!=='https:' ||!hosts.has(u.hostname)||u.username||u.password)
  throw Error('Foundry public source points to an unapproved destination.');
}
console.log('MEMBER_RESEARCH_SNAPSHOT_VERIFIED',doc.entries.length,'candidates','sha256',expected,'zero execution grants');
