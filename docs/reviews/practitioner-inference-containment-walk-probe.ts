/**
 * Containment walk probe — composition-layer evidence for PR #993.
 *
 * Replicates BOTH consult routes' evidence-bundle composition verbatim, using
 * the REAL admitFieldSignalsForConsult() and the REAL buildChangeQuestion()
 * against the REAL seeded rows in the disposable walk database.
 *
 * This observes the composed prompt — the actual text a council model would
 * receive — without firing a paid model call.
 *
 * Run: npx tsx scripts/walk-containment-probe.ts
 */
import { query } from '../lib/db/postgres';
import { admitFieldSignalsForConsult } from '../lib/studio/containment/inferenceContainment';
import { buildChangeQuestion, getChangeTypeConfig } from '../lib/studio/changes/changeTypes';

const CHANGE = '22220000-0000-4000-8000-000000000001';
const DECISION = '33330000-0000-4000-8000-000000000001';
const CANARY = /CANARYSIGNAL[A-Z]*/g;
const OBS_CANARY = /CANARYOBSERVATION[A-Z]*/g;

async function bundleFor(kind: 'change' | 'decision', id: string) {
  const col = kind === 'change' ? 'change_id' : 'decision_id';
  const [signalsResult, observationsResult] = await Promise.all([
    query(`SELECT * FROM studio_field_signals WHERE ${col} = $1 ORDER BY signal_timestamp DESC`, [id]),
    query(`SELECT * FROM studio_practitioner_observations WHERE ${col} = $1 ORDER BY created_at DESC`, [id]),
  ]);

  const rawSignals = signalsResult.rows.map((r: any) => ({
    id: r.id, clientId: r.client_id, practitionerId: r.practitioner_id,
    source: r.source, type: r.signal_type, title: r.title, content: r.content,
    intensity: r.intensity != null ? Number(r.intensity) : null,
    tags: r.tags || [], timestamp: r.signal_timestamp, createdAt: r.created_at,
  }));

  return {
    rawSignalCount: rawSignals.length,
    rawSignalSources: rawSignals.map((s: any) => s.source).sort(),
    bundle: {
      clientInquiry: null,
      // ← the exact guard both routes now apply
      fieldSignals: admitFieldSignalsForConsult(rawSignals),
      practitionerObservations: observationsResult.rows.map((r: any) => ({
        id: r.id, practitionerId: r.practitioner_id, clientId: r.client_id,
        observationType: r.observation_type, content: r.content,
        tags: r.tags || [], createdAt: r.created_at,
      })),
      existingNotes: null,
    },
  };
}

(async () => {
  const results: any = {};

  for (const [kind, id] of [['change', CHANGE], ['decision', DECISION]] as const) {
    const { rawSignalCount, rawSignalSources, bundle } = await bundleFor(kind, id);

    const prompt = buildChangeQuestion(
      { title: `Walk ${kind}`, description: 'probe', changeType: 'behavioral' } as any,
      getChangeTypeConfig('behavioral'),
      undefined,
      undefined,
      bundle as any,
      undefined
    );

    results[kind] = {
      raw_signals_in_db: rawSignalCount,
      raw_signal_sources: rawSignalSources,
      admitted_signals: bundle.fieldSignals.length,
      observations_admitted: bundle.practitionerObservations.length,
      // Leakage checks — the composed prompt is the thing the model sees.
      signal_canaries_in_prompt: prompt.match(CANARY) || [],
      observation_canaries_in_prompt: prompt.match(OBS_CANARY) || [],
      prompt_says_no_field_signals: prompt.includes('No field signals captured.'),
      prompt_has_field_signals_section: prompt.includes('FIELD SIGNALS'),
      prompt_has_observations_section: prompt.includes('PRACTITIONER OBSERVATIONS'),
      // Nested/renamed leakage: serialise the whole bundle and search it too.
      canaries_anywhere_in_serialised_bundle:
        (JSON.stringify(bundle).match(CANARY) || []),
      intensity_scores_in_prompt: (prompt.match(/intensity: \d+\/10/g) || []),
    };
  }

  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
})();
