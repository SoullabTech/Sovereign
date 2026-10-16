/**
 * R11 READ-ONLY schema reconnaissance, external protected-empty beta PG.
 * Never selects member rows, content values, credentials or identities.
 * A scoped regex inventory cannot assert all reconstructive stores are known.
 */
'use strict';
const cp = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const expected = 'd2020f7bfa66286c5f4b274d2a5fdb17b8c913b2';
const source = '/Volumes/T7 Shield/ws-beta-r11-encrypted-recovery-20261016';
const evidence = '/Volumes/T7 Shield/ws-beta-release-r9-build-20261015';
const ssh = ['-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes',
 '-o', 'ConnectTimeout=6', 'soullab@100.119.226.84'];
const shq = x => "'" + x.replaceAll("'", "'\\''") + "'";
function run(cmd,args){
 const p = cp.spawnSync(cmd,args,{encoding:'utf8',timeout:25000,maxBuffer:8*1024*1024});
 if(p.error || p.status!==0) throw Error('read_only_shell_failure:'+cmd+':'+(p.stderr||'').slice(0,220));
 return p.stdout.trim();
}
function query(sql){
 const args=['docker','exec','ws-member-beta-pg-20261015','psql','-XAt',
  '-v','ON_ERROR_STOP=1','-U','ws_member_owner','-d','ws_member_beta_20261015','-c',sql];
 return run('ssh',[...ssh,args.map(shq).join(' ')]);
}
const known = [
 'manuscript_draft_sections.text','manuscript_keeps.verbatim_text',
 'manuscript_revision_authorizations.expected_text','manuscript_revision_offers.proposed_text',
 'manuscript_sections.body','manuscript_source_arrivals.source_text',
 'manuscript_working_drafts.content','proposal_chains.expected_text',
 'working_draft_revisions.content','working_draft_revisions.note',
];
const sql = `SELECT COALESCE(json_agg(json_build_object(
 'table',table_name,'column',column_name,'type',data_type)
 ORDER BY table_name,column_name),'[]'::json)
 FROM information_schema.columns
 WHERE table_schema='public'
 AND table_name ~* '(manuscript|draft|proposal|editor|writer|studio|review|render|source|work)'
 AND (data_type IN ('text','character varying','json','jsonb','bytea')
 OR column_name ~* '(content|text|body|note|summary|excerpt|response|prompt|snapshot|payload|metadata)')`;
const receipt={timestampUtc:new Date().toISOString(),scope:'SCOPED_SCHEMA_ONLY_NO_CONTENT_ROW_READ',
 sourceBase:expected,categoriesSearched:['manuscript','draft','proposal','editor','writer','studio','review',
 'render','source','work'],sourceRowsRead:0,memberAccountsRead:0,providerCalls:0,productionChanged:false,
 status:'HOLD_BROAD_SCHEMA_REVIEW_REQUIRED'};
try{
 const head=run('git',['-C',source,'rev-parse','HEAD']);
 if(head!==expected) throw Error('candidate must begin at exact R9 source (branch has now diverged)');
 receipt.activeCandidateHead=head;
 const counts=query(`SELECT (SELECT count(*) FROM members)||'|'||
 (SELECT count(*) FROM writers_studio_beta_consent_events)||'|'||
 (SELECT count(*) FROM manuscript_source_arrivals)`);
 if(counts!=='0|0|0')throw Error('beta database no longer empty; refuse');
 receipt.realBetaEmptyCensus=counts;
 const fields=JSON.parse(query(sql));
 const classified=new Set(known);
 receipt.candidateFields=fields;
 receipt.candidateFieldCount=fields.length;
 receipt.knownTextFields=fields.filter(x=>classified.has(x.table+'.'+x.column)).length;
 receipt.unclassifiedFields=fields.filter(x=>!classified.has(x.table+'.'+x.column));
 receipt.unclassifiedFieldCount=receipt.unclassifiedFields.length;
 receipt.expectedMissing=known.filter(x=>!fields.some(y=>y.table+'.'+y.column===x));
 receipt.schemaFingerprint=crypto.createHash('sha256').update(JSON.stringify(fields)).digest('hex');
 receipt.status=receipt.expectedMissing.length?'HOLD_SCHEMA_MISMATCH':'HOLD_UNCLASSIFIED_CONTENT_AND_DERIVATIVES';
}catch(e){receipt.status='HOLD_SCHEMA_READ_FAILED';receipt.error=String(e.message||e).slice(0,320);process.exitCode=2;}
const output=path.join(evidence,'R11_SCHEMA_RECONNAISSANCE_20261016.json');
fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({status:receipt.status,fields:receipt.candidateFieldCount,
 known:receipt.knownTextFields,unknown:receipt.unclassifiedFieldCount,
 fingerprint:receipt.schemaFingerprint,source:receipt.sourceBase,receipt:output,error:receipt.error||null},null,2));
