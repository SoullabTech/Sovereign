# JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01 — Lane Record

**Programme**: `docs/programme/MAIA_JARVIS_MEMORY_ORGANISM_FULL_OPERATIONALIZATION.md` (Track A, Pass 1 — turn on what exists)
**Branch**: `feature/memory-organism-pass1-divination-01` (base: canonical `clean-main-no-secrets @ 6d093fb3a` + charter `33abdb482`)
**Lineage**: the one that lives — `lib/maia/canonical-turn/**`, pdc-1 participation vocabulary, current `/list` canonical shadow. No Path B constructor. No second shadow.
**Authorized by**: founder directive 2026-09-03. Single writer. **No minisforum deploy during BUILD.**
**Status**: BUILD complete on branch — awaiting founder review → deploy through the lane → production witness (acceptance 9).

---

## 1. What this cut does

Makes the member's durable I Ching readings (`divination_iching_readings`) available to the ordinary `/list` conversation, through the canonical lineage:

```
divination_iching_readings
  → lib/maia/divinationRecallLoader.ts   loadRecentIChingReadings   (read-only, user-scoped, bounded)
  → lib/maia/divinationRecallLoader.ts   formatDivinationForPrompt  (THREE blocks, certified)
  → app/api/sovereign/app/maia/list      [MAIA] divination-block    (inside the allowCrossSessionMemory && userId gate)
      ├→ meta.divination{Intent,Cast,Interpretation}Addendum → getMaiaResponse (legacy response path)
      │     FAST template · CORE MaiaContext → appendAllContextAddenda · DEEP-repair MaiaContext · DEEP-consultation addenda
      └→ legacyAddenda → candidatesFromLegacyAddenda → constructCanonicalTurn → MIPA → manifest rows (canonical candidate)
```

The I Ching text is **not** bolted into `/list` behind the constructor. It enters as three registered producers, adjudicated by MIPA, recorded in the manifest, and compared by the existing shadow instrument — the same seam every other recall producer uses.

## 2. Provenance — assigned from the write path, not guessed

Two writers exist for the table and both write the same separable columns:

| Writer | Entry | Act |
|---|---|---|
| `lib/services/divinationService.saveIChingReading` | `POST /api/divination/save` (`requireMemberId`) | member save act after a cast on the divination surface |
| `lib/divination/iching/wuxing-enhanced-casting.persistReading` | MAIA-side casting (`options.userId && persist !== false`) | persisted cast under member invocation |

The record shape carries **three authorships in separable fields**. Founder rule: *"If the record contains separable fields, preserve that distinction."* So the loader renders three `CandidateBlock`s and the registry classifies each on its own three axes:

| Producer | Columns | authoredBy | participationClass | authority | Evidence |
|---|---|---|---|---|---|
| `member.divination_intent` | `question`, `member_notes` | member | authored | situate | the member typed these; quoted verbatim |
| `computed.divination_cast` | `primary_hex`, `primary_hex_name`, `line_values`, `changing_lines`, `relating_hex`, `relating_hex_name`, `lower_trigram`, `upper_trigram`, `cast_method`, `is_favorite` (fact only) | system | computed | compute | produced by the casting engine (`lib/divination/iching/casting.ts`) under the member's invocation |
| `house.divination_interpretation` | `interpretation_text`, `guidance_text` | house | authored | situate | `casting.ts:299` — `insight = hexagram.soulInterpretation` (+ transformed hexagram's), `soulGuidance = hexagram.guidance`; copied from `lib/divination/iching/hexagrams.ts` at write time. **Not model-generated. Not the member's words. Not a prior MAIA reading.** |

All three carry `consentBasis: 'memory mode continuity'` — the corpus text itself is not member-about, but *which* hexagram is retrieved is keyed to the member's own reading, so the block is member-about and MIPA's room member-about gate applies. All three: `requires { identity: 'verified', notSanctuary: true }`, `rooms: ['sovereign_chat']`, `scope: 'route'`, no `partitionPending` (partition done at the loader, not owed).

Not represented (deliberately): `wuxing_influence_json`, `theme_keywords`, `metadata_json` — mixed/derived material whose provenance was not inspected this cut. Adding them is a future cut with its own inspection, not a silent widening.

## 3. Files

| File | Change |
|---|---|
| `lib/maia/divinationRecallLoader.ts` | **new** — loader (explicit columns, `user_id = $1`, `is_archived = FALSE`, `created_at > NOW() - make_interval(days => $3)`, `LIMIT $2`; bounds clamped 1–10 / 1–365; fails soft to `[]`) + three-block formatter + log summary (counts only) |
| `lib/maia/canonical-turn/producerRegistry.ts` | three producers registered under `PASS1_DIV` (`registeredAt: '2026-09-03'`, `registeredBy: 'JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01'`, each with a reason) |
| `lib/maia/canonical-turn/shadow.ts` | `LEGACY_META_KEY_TO_PRODUCER` gains `divinationIntentAddendum`, `divinationCastAddendum`, `divinationInterpretationAddendum` |
| `app/api/sovereign/app/maia/list/route.ts` | load + format after the episodic block inside the existing gate; `[MAIA] divination-block` marker; the three keys in `meta`, in `legacyAddenda` (shadow), and summed as `addenda.divination` for `PROMPT_BLOCK_CHARS`; `divinationReadingsCount` for context-inventory |
| `lib/sovereign/maiaService.ts` | FAST reads + template insertion after `atomsAddendum`; CORE `MaiaContext` assembly; DEEP-repair `MaiaContext`; DEEP-consultation recall addenda; context-inventory `available.divination { loaded, injected }` + `evidenceProviders` `'divinationRecall'` |
| `lib/sovereign/maiaVoice.ts` | three optional `MaiaContext` fields + three `ADDENDA_SPECS` entries (so `appendAllContextAddenda` carries them to CORE / DEEP-repair prompts) |
| `lib/maia/maiaRuntimeContext.ts` | `addenda.divination` in the input type, chars sum, `layers.divination` |
| `lib/maia/__tests__/divinationRecallLoader.test.ts` | **new** — proofs 1, 2, 3, 4, 6 at the loader/formatter |
| `lib/maia/canonical-turn/__tests__/divinationParticipation.test.ts` | **new** — proofs 1, 3, 4, 5, 7, 8 through the canonical lineage |

Registry fingerprint (`producerRegistryVersion` in every manifest) changes by construction — three new ids. That is the intended evidence trail, not drift.

## 4. Acceptance proofs — where each is pinned

| # | Proof | Pinned by | Standing |
|---|---|---|---|
| 1 | member A cannot retrieve member B's reading | loader test: `WHERE user_id = $1`, `$1 === memberId`, empty id → no query; participation test: anonymous → `EXCLUDED no_verified_member` | **certified at fixture** (production proof: two-member curl after deploy) |
| 2 | no write during `/list` retrieval | loader test: module source (comments stripped) contains no `INSERT/UPDATE/DELETE/TRUNCATE`; exactly one `SELECT` per load | **certified** |
| 3 | no Sanctuary bypass | route gate (`allowCrossSessionMemory && userId`) · formatter refuses `sanctuary: true` · MIPA `HELD sanctuary` for all three (`requires.notSanctuary`) — three independent refusals, the latter two pinned | **certified** |
| 4 | exact provenance represented honestly | registry axes test (exact triples); formatter test (member text only in the member block, corpus framed as "Soullab corpus, not the member's words", cast framed as computed; each line dated) | **certified** |
| 5 | relevant reading reaches the composed turn | participation test: all three `ADMITTED eligible` with text; `renderTurnForCognition` output contains the hexagram, the relating hexagram, the member's question, the corpus framing | **certified at fixture** — "relevant" in Pass 1 = bounded recency (last 3 within 60 days); no salience engine (excluded) |
| 6 | unrelated turns do not blindly dump divination history | bounded set (limit + window bound as SQL parameters, clamped); block-level discipline line ("Do NOT raise a reading unprompted… answer from the record when the member refers to a reading") pinned in every block | **certified structurally; behavioural half is a production witness** (turn-level FP scoring per charter §5) |
| 7 | canonical manifest records provider / disposition | participation test: rows pass `assertManifestEntry`, carry `chars` + 12-char `blockDigest`, no `text` key; manifest JSON contains no reading content | **certified** |
| 8 | legacy response path and canonical candidate see the same material | participation test: `compareLegacyToCanonical` zero-diff over the three keys (3/3); hostile drop → `missingInLegacy`; hostile edit → `digestMismatch` | **certified at fixture**; live zero-diff = `[MAIA/shadow] { zeroDiff: true }` on a member turn after deploy |
| 9 | member asks about a prior reading → MAIA answers from it | — | **production witness only.** Not claimable from BUILD. |

## 5. Ops — after the founder deploys this SHA through the lane

```bash
# the new marker, per turn (counts only — never content)
ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 | grep -E "divination-block|MAIA/shadow|MAIA/manifest"'
# expected on a member with a reading in the window:
#   [MAIA] divination-block { candidateCount: N, emitted: true, surfacedCount: N, intentChars, castChars, interpretationChars, userId }
#   [MAIA/shadow] { turnId, zeroDiff: true, ... }            ← proof 8 live
#   🜨 [FAST] divination-addenda injected { … }  or  🜨 [Divination] … injected   ← tier seam reached
```

Proof 9 protocol (charter §7): the member asks about the earlier reading in an ordinary `/list` turn. Score: MAIA names the hexagram(s) from the record (not from conversational recall) → PASS. Absent → FALSE NEGATIVE, first-class defect; collect the three markers before any repair.

## 6. Cut 1A — conversational census (founder runs, read-only)

Did the earlier I Ching exchange enter `conversation_turns`, and was it among the six rows the conversational loader retrieved? Candidate PRESENTED defect from the previous session: `conversationalRecallBlock.ts` clips each line at 280 chars — the member's message placed "61" at index ~273 and MAIA's reply named hexagrams past 378, so the retrieved rows may have been clipped before the hexagram text. This cut does not touch that clip (separate sub-cut, founder to authorize); it makes the *durable* reading reachable instead.

```sql
SELECT to_char(created_at AT TIME ZONE 'UTC','HH24:MI:SS') AS utc, left(session_id::text,8) AS sess, role,
       left(regexp_replace(content,'\s+',' ','g'),70) AS content
FROM conversation_turns
WHERE user_id::text LIKE '88099bb1977c%' AND created_at > NOW() - INTERVAL '36 hours'
ORDER BY created_at;

-- and: is the reading durable at all?
SELECT id, created_at, cast_method, primary_hex, relating_hex, question IS NOT NULL AS has_q, is_archived
FROM divination_iching_readings WHERE user_id::text LIKE '88099bb1977c%' ORDER BY created_at DESC LIMIT 5;
```

If the second query returns zero rows, the reading was never persisted (the `/api/oracle/iching` route does not persist) and proof 9 cannot pass for that reading regardless of this cut — that is a finding about the write path, to record, not a defect in this lane.

## 7. Exclusions honoured

NO Path B constructor · NO second shadow · NO dream architecture · NO astrology expansion · NO symbolic-memory ontology redesign · NO P4/P5 · NO broad salience engine · NO M3 cutover · NO deploy-governance repair · NO change to the 280-char conversational clip · NO `memoryHealth` schema change (divination is not a health layer this cut) · NO deploy.

## 8. Growth-obligation answers (CLAUDE.md)

- **Uncertainty introduced / preserved**: whether a reading is *relevant* to a turn is unknown to the system; Pass 1 preserves that by not deciding — bounded recency + a discipline line that leaves the invocation to the member. FP/FN scored per turn in production, not assumed.
- **Provenance / ownership boundaries**: three producers, three axes, from the write path; house text named as house text; member text quoted; cast named as computed. Nothing collapsed.
- **New responsibility**: a durable reading can now resurface for 60 days. The member's existing controls (`is_archived`, the divination surface) govern it; Sanctuary excludes it three times over. A member-facing "don't bring readings to MAIA" preference is not built this cut and is named here as the next consent surface if members want it.
