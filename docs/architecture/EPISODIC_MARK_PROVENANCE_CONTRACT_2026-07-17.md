# Episodic Mark Provenance Contract — Decision Note

**Date:** 2026-07-17
**Status:** **RULED — Option A/C approved (Kelly, 2026-07-17).** Implemented in
PR #625. Sections below preserve the decision context and the future
typed-source direction.
**Scope:** the API contract of `POST /api/sovereign/episodes/mark` only.

## The ruling

> No durable episodic mark may be written without a resolvable source.

For the present API, the only valid source is an authenticated member-owned
session. `sourceSessionId` is required; its absence is a **Sanctuary-boundary
refusal** (403, R18), not ordinary field validation. Nonexistent, malformed,
and cross-member sources receive one indistinguishable governed denial —
nothing reveals whether an inaccessible session exists.

The typed-source union (below) is the preserved future direction: migrate
mechanically from `sourceSessionId: string` to
`source: { type: 'session', sessionId }` when — and not before — a second
legitimate origin type exists. Each future source type must define its own
authentication, authorization, provenance, Sanctuary policy, and deletion
behavior. Unused variants are NOT implemented now.

Classification discipline: the episodic-mark API now requires authoritative
source-session provenance and refuses Sanctuary-origin writes before
persistence. **Repository-wide Sanctuary write-incapacity remains governed by
the broader Sanctuary audit** — `episodic_memories` has other writers
(journal/quick, memory/ingest, sessionProcessor, summary worker,
EpisodicMemoryService) outside this route's jurisdiction.

---

*Original decision packet (context for the ruling):*

## The problem

The server-side Sanctuary guard (R18, grade B) refuses any episodic mark whose
`sourceSessionId` resolves to a Sanctuary session. But `sourceSessionId` is
**optional**:

```text
Optional provenance
      ↓
Optional boundary enforcement
```

An absolute container boundary (Sanctuary invariant 6) cannot ultimately depend
on an optional field supplied by the caller. A direct caller that omits the
field gives the server nothing to resolve, and the write proceeds. This is the
**known bypass**, named in the route header, in R18's
`passingDoesNotAuthorize`, and in the runtime test
`app/api/sovereign/episodes/mark/__tests__/sanctuaryGuard.test.ts`
("the KNOWN BYPASS, named").

R18 stays **grade B** until provenance-less writes are impossible or
independently classifiable as non-Sanctuary.

## Current caller reality (surveyed 2026-07-17)

- **One live POST caller**: `components/OracleConversation.tsx` ("Keep this
  moment") — always sends `sourceSessionId: sessionId`. Same component serves
  web and the iOS Capacitor build.
- `app/maia/moments/page.tsx` uses GET and DELETE only.
- `scripts/verify-episodic-mark.ts` exercises POST in verification.
- **No background job, import path, or migration writes marks** — the
  member-marked doctrine forbids system authorship, so no legitimate
  provenance-less writer exists today.

## Option A — Require `sourceSessionId`

Make the field mandatory; 400 without it.

- **Callers**: the only live caller already complies. Zero client change.
- **Historical clients**: old iOS builds run the same component; no version
  ever omitted the field. Compatibility risk ≈ nil.
- **Migrations/imports**: none exist. Nothing to break.
- **Does every legitimate mark have a source session?** Today, yes by
  construction — a mark is a member gesture inside a live conversation.
- **Limitation**: encodes "every mark comes from a live MAIA session" into the
  contract. If member-authored imports or migrations ever become legitimate,
  the contract must be revised (see B).
- **Rollout**: one route change + tests; revert-sufficient.

## Option B — Typed source (no bare field, no absent field)

```ts
source:
  | { type: 'session';                sessionId: string }
  | { type: 'member-authored-import'; provenanceId: string }
  | { type: 'system-migration';       migrationId: string }
```

Every durable episodic object knows where it came from, even when the origin is
not a live session. Non-session origins carry a **server-classifiable**
provenance type instead of an omitted field — provenance-less writes become
*impossible*, and non-session writes become *independently classifiable as
non-Sanctuary* (the two conditions under which R18 may be re-graded).

- **Cost now**: contract redesign + client change for a variant space with
  exactly one inhabited variant. The other two variants would be speculative
  scaffolding — Cat 1/2 material shipped into a live API.
- **Strength**: the constitutionally complete form. The Sanctuary membrane
  stops depending on caller goodwill entirely.

## Option C — Refuse all provenance-less marks

Operationally identical to A at the enforcement point (no `sourceSessionId` →
refused); differs only in framing (constitutional refusal vs. contract
validation). Given no legitimate provenance-less writer exists, C is already
constitutionally correct and operationally safe — it is A with the refusal
stated as boundary rather than validation error.

## Recommendation

**Adopt A/C now** (require the field; state the refusal in Sanctuary-boundary
language, not just "400 missing field" — that is C's framing on A's
mechanics). Zero caller impact, closes the bypass, allows R18 re-grade.

**Adopt B's shape when — and not before — a second origin type becomes real**
(e.g. member-authored import ships). Requiring `sourceSessionId` today is
forward-compatible with B: `sourceSessionId: string` migrates mechanically to
`source: { type: 'session', sessionId }`. Building the full union now would
manufacture variants no caller inhabits — the same premature-scaffolding drift
the six-category typology exists to refuse.

*(Superseded by the ruling above: Kelly approved A/C the same day and directed
the contract hardening into PR #625, since the missing-field bypass prevented
the PR's stated boundary from being complete.)*
