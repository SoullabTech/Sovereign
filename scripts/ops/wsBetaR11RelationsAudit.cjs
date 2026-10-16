/** R11 read-only ownership relation metadata audit on the EMPTY separate real-beta database. */
'use strict';
const cp=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const base='/Volumes/T7 Shield/ws-beta-release-r9-build-20261015';
const from=JSON.parse(fs.readFileSync(path.join(base,'R11_SCHEMA_RECONNAISSANCE_20261016.json'),'utf8'));
const known=new Set(['manuscript_draft_sections','manuscript_keeps','manuscript_revision_authorizations',
 'manuscript_revision_offers','manuscript_sections','manuscript_source_arrivals',
 'manuscript_working_drafts','proposal_chains','working_draft_revisions']);
const probable=/content|text|body|prompt|response|summary|excerpt|analysis|narrat|reply|revision|proposal|extract|note|comment|draft|source|insight|interpret|memory/i;
for(const x of from.unclassifiedFields){
 if(probable.test(x.column))known.add(x.table);
}
const tables=[...known].sort();
if(tables.some(x=>!/^[a-z_][a-z0-9_]*$/.test(x)))throw Error('unexpected_schema_identifier');
const expr=tables.map(x=>"'"+x+"'").join(',');
const q=(x)=>"'"+x.replaceAll("'","'\\''")+"'";
const ssh=['-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=6','soullab@100.119.226.84'];
function run(args){
 const p=cp.spawnSync('ssh',[...ssh,args.map(q).join(' ')],
  {encoding:'utf8',timeout:25000,maxBuffer:8*1024*1024});
 if(p.error||p.status!==0)throw Error('READONLY_SCHEMA_QUERY_FAILED:'+String(p.stderr).slice(-150));
 return p.stdout.trim();
}
function query(sql){
 return JSON.parse(run(['docker','exec','ws-member-beta-pg-20261015','psql','-XAt','-v','ON_ERROR_STOP=1',
   '-U','ws_member_owner','-d','ws_member_beta_20261015','-c',sql]));
}
const cols=`SELECT COALESCE(json_agg(json_build_object('table',table_name,'column',column_name,'type',data_type)
 ORDER BY table_name,column_name),'[]'::json) FROM information_schema.columns WHERE table_schema='public'
 AND table_name IN (${expr}) AND column_name ~* '(member|manuscript|work|draft|owner|session|review|episode|proposal|version|parent|source)'`;
const fks=`SELECT COALESCE(json_agg(json_build_object('table',tc.table_name,'column',kcu.column_name,
 'references',ccu.table_name,'referenceColumn',ccu.column_name) ORDER BY tc.table_name,kcu.column_name),'[]'::json)
 FROM information_schema.table_constraints tc
 JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
 AND tc.table_schema=kcu.table_schema
 JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name=ccu.constraint_name
 AND tc.table_schema=ccu.table_schema
 WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public' AND tc.table_name IN (${expr})`;
const result={timeUtc:new Date().toISOString(),scope:'EMPTY_BETA_SCHEMA_METADATA_ONLY_NO_CONTENT',
 sourcesVisited:0,userDataRead:false,fieldsUsedForTriage:tables.length,
 status:'HOLD_REQUIRES_TABLE_BY_TABLE_STEWARD_REVIEW'};
try{
 result.ownerColumns=query(cols);
 result.foreignKeys=query(fks);
 const byTable={};
 for(const t of tables){
  const c=result.ownerColumns.filter(x=>x.table===t).map(x=>x.column);
  const keys=result.foreignKeys.filter(x=>x.table===t);
  byTable[t]={identityColumns:c,foreignKeys:keys,
   explicitMember:c.includes('member_id'),directWork:c.includes('manuscript_id')||c.includes('work_id'),
   reviewNeeded:!c.includes('member_id')||!(c.includes('manuscript_id')||c.includes('work_id'))};
 }
 result.tableLinks=byTable;
 result.tableCount=tables.length;
 result.needsOwnershipJoin=Object.values(byTable).filter(x=>x.reviewNeeded).length;
 result.foreignKeyCount=result.foreignKeys.length;
}catch(e){result.status='HOLD_OWNERSHIP_METADATA_QUERY_FAILED';result.error=String(e.message||e).slice(0,180);process.exitCode=2;}
const out=path.join(base,'R11_RELATIONAL_OWNERSHIP_METADATA_20261016.json');
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({status:result.status,tableCount:result.tableCount,
 needsOwnershipJoin:result.needsOwnershipJoin,foreignKeys:result.foreignKeyCount,
 receipt:out,error:result.error||null},null,2));
