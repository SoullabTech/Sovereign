import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  explainTemporalRange,
  validateTemporalRanges,
  type TemporalRangeRecord,
} from '../../lib/ain/aether/benchmark/temporalRange';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r17');
mkdirSync(OUT,{recursive:true});

const records:TemporalRangeRecord[]=[
  {
    rangeRef:'r:exact',nodeRef:'repair:v1',precision:'exact_range',
    start:'2026-09-28T14:00:00-04:00',end:'2026-09-28T16:00:00-04:00',
    sourceRef:'two-sided-clock-bound',
  },
  {
    rangeRef:'r:date',nodeRef:'repair:v2',precision:'date_range',
    start:'2026-09-24',end:'2026-09-28',sourceRef:'journal-window',
  },
  {
    rangeRef:'r:coarse',nodeRef:'repair:v3',precision:'coarse_range',
    coarseLabel:'late September 2026',sourceRef:'human-period-note',
  },
  {
    rangeRef:'r:seq',nodeRef:'repair:v4',precision:'sequence_bounded',
    afterNodeRef:'repair:v2',beforeNodeRef:'repair:v5',sourceRef:'lineage-order',
  },
  {
    rangeRef:'r:unknown',nodeRef:'repair:v6',precision:'unknown',
    sourceRef:'legacy-import',
  },
];

const evidence={
  generatedAt:new Date().toISOString(),
  parentR16:'adf888699013bfbe73825a10503d049ec20ea60b',
  validation:validateTemporalRanges(records),
  exact:explainTemporalRange(records,'repair:v1'),
  date:explainTemporalRange(records,'repair:v2'),
  coarse:explainTemporalRange(records,'repair:v3'),
  sequence:explainTemporalRange(records,'repair:v4'),
  unknown:explainTemporalRange(records,'repair:v6'),
  missing:explainTemporalRange(records,'repair:missing'),
};

writeFileSync(OUT+'/r17-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r17-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR16:evidence.parentR16,
  valid:evidence.validation.valid,
  exactPrecision:evidence.exact.precision,
  exactUnknowns:evidence.exact.unknowns,
  datePrecision:evidence.date.precision,
  dateUnknowns:evidence.date.unknowns,
  coarsePrecision:evidence.coarse.precision,
  sequencePrecision:evidence.sequence.precision,
  sequenceAnswer:evidence.sequence.answer,
  unknownPrecision:evidence.unknown.precision,
  missingUnknowns:evidence.missing.unknowns,
  noMidpointPromotion:[
    evidence.exact,evidence.date,evidence.coarse,
    evidence.sequence,evidence.unknown,evidence.missing,
  ].every(x=>x.midpointPromoted===false),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r17-summary.json','utf8')),null,2));
