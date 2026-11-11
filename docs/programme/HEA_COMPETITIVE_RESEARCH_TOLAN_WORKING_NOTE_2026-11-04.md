# Tolan — competitive research working note (2026-11-04)

**Status: WORKING NOTE. Not canon, not a design, not a build authorization.**
Standing: `conversation suggestion < working note < reviewed design < canon`. This note sits at the second rung.
Home: Human Experience Architecture / MAIA research. Opens no lane. Existing implementation and release holds are untouched.

## Provenance

Founder-pasted memo, 2026-11-04. It appears to be machine-generated (embedded images are served from an OpenAI domain). It says it consulted GitHub issues #1982, #1819 and #1903. **That was not independently confirmed in this session**, so any statement in it about holds "remaining intact" is unverified.

**Not done:** no external source was fetched; no figure below was checked against its original. Every external number is a claim about Tolan, not a fact about Tolan.

## Claims carried from the memo (all UNVERIFIED, company- or press-reported)

| Claim | Class |
|---|---|
| >250,000 active users; 70M conversations in a year (tolans.com) | company-reported |
| 4.8 App Store rating across ~188,000 ratings | store-displayed; recheck |
| $30M round reported 2026-10-19, ~$60M total (TechCrunch) | press-reported; recheck |
| ~0.7s faster time-to-speak after a model transition; ~30% fewer memory recall misses | vendor/company measurement |
| 86% "helped through an emotionally difficult experience"; 73% "with a relationship" | self-reported, methodology unpublished — **never cite as evidence of benefit** |
| Conversations are logged to build memory; researchers review conversation records | per Tolan FAQ / case study, as relayed; recheck |
| User reports of voice/personality drift, inconsistent memory, subscription friction | anecdotal (Reddit); not population-level |

## What transfers, and the constraint on each

1. **Evaluation method** (small human-judged sets of recurring conversational failures — repetitive questions, premature interpretation, therapeutic over-prompting). Transferable. Use **fictional, consent-safe** material only; no member data; do not copy Tolan's direct-to-production iteration.
2. **Voice latency.** Capture, STT and TTS may be optimized. **Gain via substituting a lighter mind is RED** under the Deep-Intelligence Gate (`docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`, pinned by `__tests__/voice-non-degradation.test.ts`). Any latency work must name that test.
3. **Per-turn context reconstruction and selective memory.** MAIA already rebuilds context per turn under consent and provenance rules. The comparison worth making is *felt continuity across turns* (the drift reports above), not retrieval-miss rate. Gestalt non-capture law applies: memory may deepen present orientation, never become the fixed lens.
4. **Authored character.** Do **not** import a fictional biography or "alien/pet" framing. Sovereignty Invariants and Representation & Claim Discipline govern; MAIA does not simulate intimacy or invent personal history.

## Positioning contrast (descriptive, not a claim to publish)

Tolan's published data practice (logging for memory, researcher review) is the opposite of Sanctuary's absolute boundary. This supports an internal contrast. Any outward use is governed by `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` (Live / Designed / Vision) and must not be told as tomorrow's story as if it were today's.

## Memo's three research priorities — candidates only

1. Relational conversation-quality eval set (listening, remembering, correction, silence, interruption, refraining from premature interpretation).
2. Memory and voice continuity comparison (emotional tone, retrieval, scope control kept separate).
3. First-five-minutes study of Tolan onboarding → translate into House / Living Field / one meaningful MAIA encounter.

**None is authorized by this note.** Starting any of them needs a founder act naming scope, exclusions and stopping condition.

## Not authorized by this note

Any implementation, voice-path change, memory change, onboarding change, outward claim, comparison in public material, or new lane.

## Verification pass (2026-11-04, same day) — partial

Evidence class: fetched page text, read this session. Statements about Tolan's marketing are verified as *what Tolan currently says*, not as true.

| Claim | Result |
|---|---|
| Issues #1982, #1819, #1903 exist | **CONFIRMED** (all OPEN): #1982 "SOULLAB-CONTINUITY-01 … [GOVERNANCE ONLY]" (updated 2026-10-31); #1819 "MAIA–SEC–R5 … [BETA HOLD]" (2026-10-29); #1903 "Sovereign Conversation Fabric — open-source, full-duplex and offline MAIA research" (2026-10-31) |
| Memo's "holds remain intact" | **NOT VERIFIED** — only titles and states read; 756 combined comments unread. The #1819 BETA HOLD label is consistent with a hold, nothing more |
| 250,000+ active users; 70M+ conversations in past year; 4.8 stars | **CONFIRMED as Tolan's own site text** (tolans.com). Site says "over 180,000 reviews"; memo's "~188,000 ratings" not checked against the App Store |
| 86% / 73% survey figures | **CONFIRMED as Tolan's own site text**, "in a survey of Tolan users"; methodology still unpublished here |
| Braintrust: 4x faster prompt iteration; SMEs (behavioral researcher, sci-fi writer, game designer) review logs hours daily and ship prompt changes to production without engineering handoffs; issue-to-production "week → same day" | **CONFIRMED** (braintrust.dev/customers/portola; a vendor case study, so promotional) |
| Tolan positions as "non-romantic" alien best friend; site now says "friendly guide through life" | **CONFIRMED** |
| $30M round on 2026-10-19, ~$60M total | **NOT VERIFIED** — a TechCrunch site search returned no Tolan article |
| OpenAI study: 0.7s latency gain; ~30% fewer recall misses | **NOT VERIFIED** — openai.com/index/tolan/ returned HTTP 403 to the fetcher |
| FAQ: conversations logged for memory; researcher review of records; privacy-policy sharing terms | **NOT VERIFIED** — FAQ and privacy policy not fetched. (Braintrust does confirm staff review *logs*, which is adjacent, not the same claim) |
| Reddit reports of drift / memory inconsistency / subscription limits | **NOT VERIFIED** — not fetched |

**Net:** the Tolan numbers on its own site and the Braintrust workflow are real as stated. The funding, the OpenAI technical figures, the data-practice claims and the user complaints remain unverified; do not repeat them outward until checked.

## Still owed

- Read the issue bodies/comments if the "holds remain intact" claim is to be relied on.
- Retrieve the OpenAI study by another route (founder browser or Chrome), plus Tolan's FAQ and privacy policy, and the funding report.
- The "positioning contrast" with Sanctuary above rests on the unverified data-practice claim; hold it until that is checked.
