import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  adjudicateSourceFieldDryRun,
  createSourceManifest,
} from '../../lib/ain/aether/connector/sourceManifest';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r2');
mkdirSync(OUT,{recursive:true});

const manifest=createSourceManifest('manifest:r2:witness',[
  {
    sourceClass:'member_authored_text',
    fields:[
      {field:'recordRef',purpose:'identify_source',required:true},
      {field:'memberRef',purpose:'bind_member_scope',required:true},
      {field:'text',purpose:'represent_observation',required:true},
      {field:'createdAt',purpose:'represent_time',required:true},
      {field:'domain',purpose:'represent_domain',required:true},
    ],
  },
  {
    sourceClass:'system_observed_event',
    fields:[
      {field:'eventRef',purpose:'identify_source',required:true},
      {field:'memberRef',purpose:'bind_member_scope',required:true},
      {field:'summary',purpose:'represent_observation',required:true},
      {field:'observedAt',purpose:'represent_time',required:true},
      {field:'domain',purpose:'represent_domain',required:true},
      {field:'sourceStanding',purpose:'represent_source_standing',required:true},
    ],
  },
]);

const allowed=adjudicateSourceFieldDryRun(manifest,{
  manifestRef:manifest.manifestRef,
  sourceClass:'member_authored_text',
  requestedFields:['recordRef','memberRef','text','createdAt','domain'],
});

const undeclared=adjudicateSourceFieldDryRun(manifest,{
  manifestRef:manifest.manifestRef,
  sourceClass:'member_authored_text',
  requestedFields:['recordRef','memberRef','text','createdAt','domain','email'],
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentConnectorR1:'9abb694d4bd0d6c26e2acca46b0187fa5cb42868',
  manifest,
  allowed,
  undeclared,
};

writeFileSync(OUT+'/r2-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r2-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentConnectorR1:evidence.parentConnectorR1,
  manifestRef:evidence.manifest.manifestRef,
  sourceClassCount:evidence.manifest.entries.length,
  minimumNecessary:evidence.manifest.minimumNecessary,
  zeroRecordRead:evidence.manifest.zeroRecordRead,
  allowedDryRun:evidence.allowed.allowed,
  allowedFields:evidence.allowed.allowedFields,
  undeclaredAllowed:evidence.undeclared.allowed,
  undeclaredErrors:evidence.undeclared.errors,
  recordReadExecuted:evidence.allowed.recordReadExecuted,
  recordCountRead:evidence.allowed.recordCountRead,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r2-summary.json','utf8')),null,2));