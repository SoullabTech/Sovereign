# Episodic Mark Provenance Contract — Decision Note (read-only)

**Date:** 2026-07-17
**Status:** DECISION PENDING — Kelly ruling required. This note authorizes nothing.
**Scope:** the API contract of `POST /api/sovereign/episodes/mark` only.

## The problem

The server-side Sanctuary guard (R17, grade B) refuses any episodic mark whose
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
**known bypass**, named in the route header, in R17's
`passingDoesNotAuthorize`, and in the runtime test
`app/api/sovereign/episodes/mark/__tests__/sanctuaryGuard.test.ts`
("the KNOWN BYPASS, named").

R17 stays **grade B** until provenance-less writes are impossible or
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
non-Sanctuary* (the two conditions under which R17 may be re-graded).

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
mechanics). Zero caller impact, closes the bypass, allows R17 re-grade.

**Adopt B's shape when — and not before — a second origin type becomes real**
(e.g. member-authored import ships). Requiring `sourceSessionId` today is
forward-compatible with B: `sourceSessionId: string` migrates mechanically to
`source: { type: 'session', sessionId }`. Building the full union now would
manufacture variants no caller inhabits — the same premature-scaffolding drift
the six-category typology exists to refuse.

**Not implemented in the R17 guard PR** — per ruling, this is a separate
contract-hardening decision.
