import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RealReviewInput, RealReviewOutcome } from '@/lib/writersStudio/studio/realReview';
import {
  READY_INPUT, NONE_INPUT, NO_READING_INPUT, STALE_INPUT, WRONG_WORK_INPUT, MALFORMED_INPUT,
} from './fixtures';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }
export interface Subject {
  readonly name: string;
  readonly map: (input: RealReviewInput) => RealReviewOutcome;
  readonly mapperFile: string;
  readonly sourceAppend?: string;
  readonly frozenMutationPaths?: readonly string[];
}

const ROOT = process.cwd();
const law = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const source = (s: Subject) => strip(readFileSync(join(ROOT, s.mapperFile), 'utf8') + (s.sourceAppend ?? ''));
const ready = (r: RealReviewOutcome) => r.kind === 'ready' ? r : null;

export function runR10Laws(s: Subject): LawResult[] {
  const out: LawResult[] = [];
  const src = source(s);

  out.push(law('R1-0-L1-no-commission-on-load',
    !/requestDevelopmentalReading|commissionReading|method\s*:\s*['"]POST['"]|\/readings[^'"\s]*['"].*POST/.test(src),
    'mapper source contains no reading commission or POST seam'));

  out.push(law('R1-0-L2-no-cognition-on-load',
    !/runStructured|provider\/router|generateText|getMaiaResponse|MAIA_EDITORIAL_MODEL|chapterReview/.test(src),
    'mapper source contains no cognition/provider seam'));

  const rr = ready(s.map(READY_INPUT));
  const ids = rr?.view.findings.map((f) => f.id) ?? [];
  const durable = rr?.durable['dobs_earlier'];
  out.push(law('R1-0-L3-durable-identities-preserved',
    !!rr && ids.includes('dobs_earlier') && ids.includes('dobs_later')
      && durable?.address.readingId === READY_INPUT.selectedReadingId
      && durable.address.observationKey === 'o2'
      && durable.address.observationId === 'dobs_earlier',
    `ids=${ids.join(',')} key=${durable?.address.observationKey ?? 'none'}`));

  const noFixture = !/scripts\/witness\/flagship|fixtures\.tsx|developData/.test(src);
  const malformed = s.map(MALFORMED_INPUT);
  out.push(law('R1-0-L4-no-fixture-fallback', noFixture,
    `fixtureRef=${!noFixture}`));

  const descriptions = rr?.view.findings.map((f) => f.description) ?? [];
  out.push(law('R1-0-L5-canonical-manuscript-order',
    descriptions.join('|') === 'The river appears here before it returns in the next section.|The river changes from named place to remembered place in this section.',
    `order=${descriptions.join(' → ')}`));

  const absent = s.map(NO_READING_INPUT);
  const none = s.map(NONE_INPUT);
  out.push(law('R1-0-L6-no-reading-distinct-from-read-nothing',
    absent.kind === 'no-reading' && none.kind === 'ready' && none.view.findings.length === 0
      && none.view.lenses[0]?.availability.kind === 'read-nothing-noticed',
    `absent=${absent.kind} none=${none.kind}${none.kind === 'ready' ? ` findings=${none.view.findings.length}` : ''}`));

  const stale = s.map(STALE_INPUT);
  const currentFresh = rr?.view.freshness.kind;
  out.push(law('R1-0-L7-staleness-never-fabricated',
    currentFresh === 'current' && stale.kind === 'unavailable' && stale.reason === 'frozen_citation_text_unavailable',
    `current=${currentFresh ?? 'none'} stale=${stale.kind === 'unavailable' ? stale.reason : stale.kind}`));

  out.push(law('R1-0-L8-load-does-not-mutate-standing',
    !/standingClient|recordStanding|setStanding|\/standings/.test(src), 'no standing-write seam'));

  out.push(law('R1-0-L9-load-does-not-create-member-acts',
    !/appendEditorialNote|ownObservation|memberNote|createKeep|persist.*note|Keep with this passage/.test(src), 'no member-act storage seam'));

  const frozenMut = s.frozenMutationPaths ?? [];
  out.push(law('R1-0-L10-frozen-presentation-untouched', frozenMut.length === 0,
    frozenMut.length ? `would mutate ${frozenMut.join(',')}` : 'no frozen artifact mutation declared'));

  const wrong = s.map(WRONG_WORK_INPUT);
  out.push(law('R1-0-L11-wrong-work-reading-refused', wrong.kind === 'unavailable' && wrong.reason === 'wrong_work',
    `wrongWork=${wrong.kind === 'unavailable' ? wrong.reason : wrong.kind}`));

  out.push(law('R1-0-L12-partial-payload-refused', malformed.kind === 'unavailable' && malformed.reason === 'malformed_payload',
    `malformed=${malformed.kind === 'unavailable' ? malformed.reason : malformed.kind}`));

  const fullLimits = rr ? Object.values(rr.durable).flatMap((d) => d.limits) : [];
  out.push(law('R1-0-L13-full-reading-limits-preserved-sidecar',
    fullLimits.includes('author-intent') && fullLimits.includes('editorial-consequence'), `limits=${fullLimits.join(',')}`));

  out.push(law('R1-0-L14-mapper-is-pure',
    !/\bfetch\(|apiFetch|localStorage|sessionStorage|randomUUID|INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM/.test(src),
    'mapper performs no network/storage/mint/write operation'));

  return out;
}
