# JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01 — Lane Record

**Programme**: `docs/programme/MAIA_JARVIS_MEMORY_ORGANISM_FULL_OPERATIONALIZATION.md` (Track A, Pass 1 — turn on what exists)
**Branch**: `feature/memory-organism-pass1-divination-01` (base: canonical `clean-main-no-secrets @ 6d093fb3a` + charter `33abdb482`)
**Lineage**: the one that lives — `lib/maia/canonical-turn/**`, pdc-1 participation vocabulary, current `/list` canonical shadow. No Path B constructor. No second shadow.
**Authorized by**: founder directive 2026-09-03. Single writer. **No minisforum deploy during BUILD.**
**Status**: Cut 1A CERTIFIED · Cut 1B ACCEPTED `660e53015` · Cut 1C BUILD ACCEPTED `a6384d532` · record ACCEPTED `bd50a6f30` · canonical `8d04f1b9` reconciled (§10) → exact-SHA gates → immutable deploy through the lane → production witness (acceptance 9).

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

## 6. Cut 1A — production census (read-only, run by the founder 2026-09-03)

**First attempt was INVALID** — my predicate used `user_id::text LIKE '88099bb1977c%'`, but that token is `memberRef()` = truncated SHA-256 of the id (`lib/privacy/memberRef.ts`), not a prefix. Zero rows in both tables were a query artifact. Corrected census matched by the same hash in SQL (`left(encode(sha256(user_id::bytea),'hex'),12)`), resolved the member (`ce284751…`), and returned:

| Question | Result |
|---|---|
| conversation stored? | **YES** — 20 turns in 36h; the 15:59:05 member turn ("I am about to talk to Larry Closs…") and the 15:59:15 MAIA reply are in `conversation_turns`. The I Ching detail sits late in a 306-char message, i.e. past the 280-char clip in `conversationalRecallBlock.ts`. At 22:42:08 and 22:42:27 MAIA answered "I don't have the I Ching reading in front of me" while `[MAIA] conversational-block { candidateCount: 6, surfacedCount: 6 }` fired on those exact turns. **Witnessed false negative at PRESENTED/USED.** |
| relevant durable reading? | **NO** — `divination_iching_readings` holds 5 rows all-time for this member, newest `2026-06-11` (hex 62→45). Nothing from 2026-09-02/03. |
| all-time sanity | turns 27,661 · readings 5 — the predicate binds. |

**Certifying run (founder's join form, 2026-09-03)**: the founder required a single hashing proposition — `memberRef == SHA-256(UTF-8 members.id::text)[0:12]` — resolved once against `members`, with every other table joined on the resolved id rather than re-hashed. That run (`convert_to(id::text,'UTF8')` + `JOIN target ON user_id::text = member_id`) returned the identical four result sets: member `ce284751…`, the same 20 turns, the same 5 readings (newest 2026-06-11), 27,661 / 5 all-time. The classification below rests on that run; the re-hash run is corroboration only.

**Outcome**: *conversation yes + relevant reading no* → Cut 1C authorized (founder's conditional authorization, condition met). Separately: the conversational clip is now a **witnessed** mechanism, not a hypothesis — still HELD by founder ruling, to be tested on its own merits after direct artifact recall works.

Note on Cut 1B's window: all five existing readings are older than 60 days, so on today's production data `[MAIA] divination-block` would report `candidateCount: 0` for this member. That is the window working, not a defect. The first in-window row arrives via Cut 1C.

Note on where the 2026-09-02 reading was cast: the census cannot say. If it was cast outside the oracle route (physical coins, another app) Cut 1C would not have captured it either; 1C covers casts made through `POST /api/oracle/iching`. A member-entered ("manual") record path is a separate cut if wanted.

## 7. Exclusions honoured

NO Path B constructor · NO second shadow · NO dream architecture · NO astrology expansion · NO symbolic-memory ontology redesign · NO P4/P5 · NO broad salience engine · NO M3 cutover · NO deploy-governance repair · NO change to the 280-char conversational clip · NO `memoryHealth` schema change (divination is not a health layer this cut) · NO idempotency machinery on the oracle write · NO manual-entry reading path · NO deploy.

## 9. Cut 1C — oracle I Ching persistence (BUILD complete, founder scope verbatim)

Scope (founder, 2026-09-03): resolve the existing authenticated identity (never a body user_id; anonymous cast supported, does not persist) · produce the reading exactly as today · for a recognized member persist through `DivinationService.saveIChingReading()` (no new writer, table, or migration; both pre-cast and fresh-cast paths through the same seam) · persistence failure non-fatal, logged, no fabricated success · Cut 1B consumes the row unchanged · no idempotency machinery.

| File | Change |
|---|---|
| `app/api/oracle/iching/route.ts` | identity via `getMemberIdFromRequest` (session credential only); reading construction factored into `produceFromPreCastLines` / `produceFreshCast`, each returning the unchanged member-facing response **and** a `SaveIChingInput` record; one `persistForMember` seam calling `divinationService.saveIChingReading`; response gains `persisted: boolean` and `readingId` when saved; failure → `persisted: false`, logged with `memberRef`, HTTP 200; an identity-store failure degrades to an anonymous (unpersisted) cast rather than a 500 |
| `app/api/oracle/iching/__tests__/route.test.ts` | **new** — the nine pinned properties |

Record mapping (from the cast the member was shown): `question` verbatim · `cast_method` from the request (validated against the store's set, default `yarrow`) · `primary_hex` / `primary_hex_name` (englishName, the name the response shows) · `line_values` = the pre-cast lines or `castReading.castLines` · `changing_lines` · `relating_hex` / `relating_hex_name` from the transformed hexagram · trigrams · `interpretation_text` / `guidance_text` = the house text the response carried (fresh path: `insight` / `soulGuidance`, which include the transformation note and changing-line text; pre-cast path: `soulInterpretation` / `guidance`) · `sacred_timing`. Under Cut 1B the resulting row partitions exactly as §2: question → member block, cast → computed block, interpretation/guidance → house block.

**Truthfulness note (founder review, 2026-09-03)**: the route supplies `sacred_timing` in `SaveIChingInput`, but the existing writer's I Ching INSERT (`divinationService.saveIChingReading`, 15 columns ending at `guidance_text`) does **not** insert `sacred_timing`. Timing is therefore **not durably stored** by this cut and must not be described as such. Not a 1C blocker — the cut deliberately reuses the existing writer unmodified, and proof 9 does not depend on timing. Repairing the writer is out of scope here; a separate cut if timing is ever wanted in the durable record.

**Gate-evidence note**: the `typecheck 0 / N-of-N` figures in this record are locally reported gate results; GitHub attaches no status contexts to this branch, so they are not CI certification. Gates are rerun on the exact deploy candidate SHA before production (§10).

Pinned (`route.test.ts`): anonymous → reading returned, writer never called (also with a body `user_id`) · member → exactly one save, scoped to the session-resolved id · body `user_id`/`userId`/`memberId` cannot choose another member (and never appear in the record) · pre-cast `line_values` persisted as sent · fresh-cast `line_values` persisted and recompute to the response hexagram · question verbatim · hexagram / relating / trigrams / changing lines / interpretation / guidance mapped from the same cast · writer null or throw → 200 with `persisted: false` · route source has no SQL, no `lib/db/postgres`, exactly one `saveIChingReading(` call, no `body.user_id` read.

Production witness after deploy: cast on the oracle page as a signed-in member → `[oracle/iching] reading persisted { memberRef, readingId, primaryHex }` → next `/list` turn shows `[MAIA] divination-block { candidateCount: 1, emitted: true }` → ask MAIA about the reading (proof 9).

## 10. Deploy candidate — reconciliation with canonical `8d04f1b9`

Founder custody correction (2026-09-03): canonical moved `6d093fb3a → 8d04f1b9fd0b22a16c8e5673d47279fef3ada3a2` (six commits, all Writers' Studio documentation — `docs/programme/WRITERS_STUDIO_*`, `docs/launch/*`; no MAIA runtime code). The lane merged exact `8d04f1b9` with a merge commit (no rebase, no semantic Cut 1C change). The merge commit is the deploy candidate; the exact-SHA gates are rerun on it and recorded in the commit message. Deploy (from the Mac Studio, through the lane, never a bare compose):

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin feature/memory-organism-pass1-divination-01 \
  && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/feature/memory-organism-pass1-divination-01)"'
# then: docker exec maia-sovereign printenv GIT_COMMIT   (must equal the candidate short SHA)
```

## 8. Growth-obligation answers (CLAUDE.md)

- **Uncertainty introduced / preserved**: whether a reading is *relevant* to a turn is unknown to the system; Pass 1 preserves that by not deciding — bounded recency + a discipline line that leaves the invocation to the member. FP/FN scored per turn in production, not assumed.
- **Provenance / ownership boundaries**: three producers, three axes, from the write path; house text named as house text; member text quoted; cast named as computed. Nothing collapsed.
- **New responsibility**: a durable reading can now resurface for 60 days. The member's existing controls (`is_archived`, the divination surface) govern it; Sanctuary excludes it three times over. A member-facing "don't bring readings to MAIA" preference is not built this cut and is named here as the next consent surface if members want it.
