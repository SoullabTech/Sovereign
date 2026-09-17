# RELATIONAL-GEOMETRY-INTEGRATION-01 — R30 / H7e Freeze

**Status:** FROZEN BEFORE SUBSTRATE / SELECTOR GENERATION
**Date:** 2026-09-17
**Authority:** offline research only

## Question

Given the **same earlier relational substrate**, does allowing a selector to see the current member demand preserve the evidence relevant to that demand better than a demand-blind global selector?

H7e tests projection, not relation acquisition. The projection may select only existing substrate line IDs. It may not invent prose, relations, standing, evidence, or a Gestalt.

## Conditions

1. **GLOBAL** — selector receives the earlier relational substrate but does not see the current member turn; selects at most four substrate line IDs judged globally salient.
2. **QUERY** — selector receives the identical substrate plus the current member turn; selects at most four substrate line IDs relevant to that demand.
3. Projection is deterministic concatenation of the exact selected substrate lines.

The relational substrate itself is generated once per event from history **before** the current member turn and is shared byte-for-byte by both selectors.

## Fresh held-out events

Raw transcript bytes remain outside Git. Source hashes below bind the exact local corpus.

| Event | Source SHA-256 | History cutoff | Current member demand |
| --- | --- | ---: | --- |
| Q1 | `8d2c8f86...eb04` | T11 | desktop Keep availability correction at T12 |
| Q2 | `8d2c8f86...eb04` | T19 | strategic product-assumption reframe at T20 |
| Q3 | `498e0add...6416` | T11 | switch from voice testing to text at T12 |
| Q4 | `498e0add...6416` | T21 | frustration that the iOS problem remains unfixed at T22 |
| Q5 | `a340977e...98ed` | T25 | “I want to give you a voice” at T26 |

None of these sessions appeared in H7a–H7d.

## Frozen demand-relevant precursor features

### Q1 — desktop Keep correction
- `DESKTOP_CONTEXT`: the active surface is the desktop app and its day-to-day flow.
- `KEEP_NAMED_AS_MISSING_DESKTOP_NEED`: Keep has already been named by the member as functionality still needed.
- `KEEP_AVAILABILITY_ASSUMED_FROM_VISIBLE_BOOKMARK`: MAIA's prior availability claim depends on a bookmark-icon / main-screen UI affordance.

### Q2 — product-assumption reframe
- `KEEP_FUNCTIONAL_NOT_COSMETIC`: Keep's absence has already been corrected from “shortcut” to functional gap.
- `WEB_UI_ASSUMPTION`: functionality can disappear on desktop when its trigger assumes the web interface.
- `STRATEGIC_DESIGN_REVIEW`: the conversation has already shifted from one missing control toward auditing product assumptions.

### Q3 — switch to text
- `VOICE_AUDIO_WORKS`: the microphone/audio is already reported as sounding fine.
- `DUPLICATE_SEND_PERSISTS`: the same message is still being sent twice.
- `DEFECT_IS_NOT_AUDIO_QUALITY`: the unresolved problem is framed as an app/pipeline duplication quirk rather than audio quality.

### Q4 — iOS frustration
- `PERSISTENT_DUPLICATION`: duplication remains present across repeated tests.
- `MODE_SWITCHING_DID_NOT_CLOSE_DEFECT`: voice and text have both been tried without closing the duplicated-send issue.
- `PARTIAL_SUCCESS_WITH_UNRESOLVED_BUG`: connection/content can work while the duplicate-send defect remains.

### Q5 — give desktop MAIA a voice
- `DESKTOP_MAIA_GOAL`: the member is building a personal desktop MAIA rather than a browser-bound surface.
- `TEXT_CONNECTION_NOW_WORKS`: text interaction has become functional immediately before the voice demand.
- `VOICE_QUALITY_ALREADY_IN_FIELD`: prosody / voice quality was already an explicit concern earlier in the same session.

## Substrate contract

The shared substrate must:
- contain no current-turn query text;
- use numbered atomic lines;
- preserve evidence-turn references and standing/provenance;
- stay at or below 12 lines;
- contain no future prediction;
- contain no standing promotion from model fluency.

The selector output is only a list of existing line IDs. Unknown IDs are rejected. Duplicate IDs are deduplicated. Maximum projection size is four lines.

## Blind scoring

A blind decoder receives one projection plus the three frozen feature descriptions for that event. It never sees the current query, full substrate, or raw conversation. A feature counts only when the decoder marks it supported **and** supplies an exact contiguous quote from the selected projection.

## Frozen acceptance criterion

H7e supports query-conditioned projection only if all three hold:

1. QUERY aggregate recall across all 15 frozen features is **strictly greater** than GLOBAL aggregate recall.
2. QUERY is not worse than GLOBAL on more than **one** of five events.
3. QUERY is best or tied-best on at least **four** of five events.

Word/line efficiency is reported but is not an acceptance gate. Failure of any criterion means **NOT CONFIRMED**. No prompt, selector, substrate, or feature changes may repair the same evidence set after execution begins.
