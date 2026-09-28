import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createReflectionLineage } from '../../lib/ain/aether/benchmark/repairLineage';
import {
  explainTemporalOrder,
  explainWhenNode,
  validateTemporalRecords,
  type LineageTemporalRecord,
} from '../../lib/ain/aether/benchmark/lineageTemporalMetadata';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r16');
mkdirSync(OUT,{recursive:true});

const lineage=createReflectionLineage('R16','machine:v0','Original reflection');
lineage.nodes.push(
  {nodeRef:'repair:v1',kind:'repair',parentRef:'machine:v0',text:'Repair one',accepted:true,supersededByRef:null,active:false},
  {nodeRef:'repair:v2',kind:'repair',parentRef:'repair:v1',text:'Repair two',accepted:true,supersededByRef:null,active:false},
  {nodeRef:'repair:v3',kind:'repair',parentRef:'repair:v2',text:'Repair three',accepted:true,supersededByRef:null,active:false},
  {nodeRef:'repair:v4',kind:'repair',parentRef:'repair:v3',text:'Repair four',accepted:true,supersededByRef:null,active:false},
);

const records:LineageTemporalRecord[]=[
  {temporalRef:'t:v0',nodeRef:'machine:v0',sequenceIndex:0,precision:'exact_timestamp',recordedAt:'2026-09-28T14:00:00-04:00',sourceRef:'runtime-clock'},
  {temporalRef:'t:v1',nodeRef:'repair:v1',sequenceIndex:1,precision:'calendar_date',calendarDate:'2026-09-28',sourceRef:'review-date'},
  {temporalRef:'t:v2',nodeRef:'repair:v2',sequenceIndex:2,precision:'coarse_period',coarsePeriod:'late September 2026',sourceRef:'human-period-note'},
  {temporalRef:'t:v3',nodeRef:'repair:v3',sequenceIndex:3,precision:'sequence_only',sourceRef:'lineage-order'},
  {temporalRef:'t:v4',nodeRef:'repair:v4',sequenceIndex:4,precision:'unknown',sourceRef:'legacy-import'},
];

const evidence={
  generatedAt:new Date().toISOString(),
  parentR15:'34094c8f78dffab768126eddd7c6cc2588f0dcb9',
  validation:validateTemporalRecords(lineage,records),
  exact:explainWhenNode(lineage,records,'machine:v0'),
  dateOnly:explainWhenNode(lineage,records,'repair:v1'),
  coarse:explainWhenNode(lineage,records,'repair:v2'),
  sequenceOnly:explainWhenNode(lineage,records,'repair:v3'),
  unknown:explainWhenNode(lineage,records,'repair:v4'),
  order:explainTemporalOrder(records,'repair:v1','repair:v3'),
  missing:explainWhenNode(lineage,[],'repair:v2'),
};

writeFileSync(OUT+'/r16-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r16-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR15:evidence.parentR15,
  valid:evidence.validation.valid,
  exactPrecision:evidence.exact.precision,
  exactAnswer:evidence.exact.answer,
  datePrecision:evidence.dateOnly.precision,
  dateUnknowns:evidence.dateOnly.unknowns,
  coarsePrecision:evidence.coarse.precision,
  sequencePrecision:evidence.sequenceOnly.precision,
  unknownPrecision:evidence.unknown.precision,
  orderAnswer:evidence.order.answer,
  orderPrecision:evidence.order.precision,
  missingUnknowns:evidence.missing.unknowns,
  noFalsePrecision:[
    evidence.exact,evidence.dateOnly,evidence.coarse,
    evidence.sequenceOnly,evidence.unknown,evidence.order,evidence.missing,
  ].every(x=>x.falsePrecisionIntroduced===false),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r16-summary.json','utf8')),null,2));
