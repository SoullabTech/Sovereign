# F5 — ERASURE TRACE ADJUDICATION

**Standing: TRACE COMPLETE · ERASURE CONFORMANCE FAIL / STOP**

Bound to the read-only F5 trace executed against
`a5834c94656a461dd89ea2dec044e9418f355717`.

No production behavior, schema, deletion logic, UI, or storage was modified
during the trace.

---

> ## CUSTODY NOTE — not part of the ruling
>
> This block is the recording agent's, not the founder's. The ruling below is
> transcribed verbatim and is not edited, summarized, or reconciled by it.
>
> **Two evidence subjects are in play, and they are not the same commit.**
>
> | | |
> |---|---|
> | this adjudication binds to | `a5834c94` — *docs(SPM-D9C): representation discriminator*, 2026-09-17 16:29:38 +0000 |
> | `F5-A` / `F5-B` / `F5-C` bind to | `7ee173db` |
>
> Neither is an ancestor of the other. They are siblings over merge-base
> `8b80ec21060a`. `a5834c94` was not present in this checkout and was fetched
> from origin to perform this check; it is on no remote branch.
>
> **The divergence is ten files and none of them is in the erasure surface.**
> Five are the SPM-D9 lane's own programme records, two are corpus authority
> documents, and three are `lib/corpus/admission.ts`, its test, and
> `data/ain/corpus-admission.json`.
>
> A diff restricted to every locus F5-A/B/C examined — the account-deletion
> route, the `/api/sovereignty` surface, the Lab Tools sovereignty page,
> `eraseManuscript`, `fileVault`, `lib/auth`, `config/accessMatrix.ts`,
> `middleware.ts`, `database/migrations`, `database/baseline`,
> `services/user-sovereignty`, the scribe end-session route, `lib/memory/stores`,
> `lib/circles`, and the member-id log gate — **is empty**.
>
> So the two subjects describe the **same erasure organism**, established by
> evidence rather than assumed. The F5-A/B/C evidence base applies to this
> ruling without re-binding, and no re-binding is performed.
>
> **What this note does not claim.** The load-bearing figures in §2 — 242
> FK-linked tables, 43 governed, 161 CASCADE / 24 RESTRICT / 43 NO ACTION /
> 30 SET NULL, the `mem0` finding, the Account Settings client's handling of
> `res.ok`, and the D9-C `consent_mode` warrant — **are not derived from F5-A,
> F5-B or F5-C.** They come from a trace not held in this session's records.
> They are recorded here as the founder's adjudicated findings, not as this
> agent's witnessed evidence. Where F5-A/B/C reached an adjacent question they
> did so with different instruments and reported different numbers; §2 is not
> reconciled against them, and the difference is not silently averaged away.
>
> Reconciliation of the two figure sets is available and is **not performed
> here**, because it was not authorized and because a census that quietly
> revises another lane's denominator is the failure this programme exists to
> refuse.

---

## 1. RULING

F5 succeeded as an evidence obligation: the current erasure organism is now
sufficiently traced to adjudicate.

The organism does **not** presently satisfy a trustworthy sovereign-erasure
boundary.

Therefore:

**F5 TRACE — COMPLETE**

**F5 ERASURE CONFORMANCE — FAIL / STOP**

**SPM IMPLEMENTATION — REMAINS CLOSED**

Discovery of these failures does not itself authorize repair.

## 2. LOAD-BEARING FINDINGS

The member-facing account-deletion route is not an authoritative map of the
storage graph.

242 distinct tables carry foreign keys to `members(id)`, while the route
explicitly governs only 43 tables. The remainder are disposed through implicit
database behavior:

* 161 CASCADE,
* 24 RESTRICT,
* 43 NO ACTION,
* 30 SET NULL,

with additional member-linked stores carrying no foreign key at all.

Implicit CASCADE is not itself a violation. The failure is that the governed
erasure process cannot presently account explicitly for the complete resulting
disposition.

Major Writer's Studio and related stores use RESTRICT while remaining absent
from `GOVERNED_CONTENT`. A member can therefore pass the explicit preflight and
subsequently encounter an FK failure inside the deletion transaction, producing
rollback and a generic 500 rather than a governed retained-content refusal.

`developmental_memories` appears in both `GOVERNED_CONTENT` and
`OPTIONAL_CLEANUP`. Where developmental material exists, preflight refuses
deletion, making the cleanup branch unreachable precisely when there would be
material to clean.

Thirty SET NULL relationships preserve content while removing direct
attribution. This may or may not be a legitimate retention policy; F5 does not
infer otherwise. The current erasure process, however, does not govern or
explain this class as a retention disposition.

Several member-associated stores have no FK relationship to `members(id)` and
therefore survive deletion unless separately governed.

## 3. D9-C CONSEQUENCE — ORPHANED AUTHORITY

`circle_memberships.member_id` and `shared_artifacts.shared_by` can survive
account deletion without a governing FK.

D9-C established that `circle_memberships.consent_mode` is an audience-indexed
representation warrant: changing it can cause already-published representations
to cease without changing the underlying material, provenance, or present
standing.

Account deletion can therefore produce a state in which:

**the representation survives → its warrant survives → the warrant-holder has
been erased → the ordinary revocation act can no longer be exercised.**

This is an **orphaned authority state**.

F5 therefore earns the following invariant:

> **Deletion may not convert revocable member authority into irrevocable
> surviving authority.**

This invariant does not determine whether surviving representation should be
deleted, revoked, anonymized, retained as history, or handled by another
governed disposition.

It requires only that erasure not strand an operative representation under
authority the erased sovereign can no longer exercise.

## 4. MEMBER-VISIBLE TRUTH

The account-deletion API has a governed 409 refusal containing:

* a truthful message,
* retained content,
* `accountChanged: false`,
* and a next step.

The current Account Settings client handles `res.ok` only and does not read or
render that response body.

Therefore the server-side refusal exists but does not reach the member.

The same surface provides no governed explanation for a generic 500 caused by an
unenumerated RESTRICT / NO ACTION dependency.

F5 earns the following requirement:

> **An erasure refusal is not complete merely because the server knows why it
> refused. The member must receive the governed reason and an unambiguous
> statement of whether anything changed.**

## 5. POSITIVE FINDINGS

No active `mem0` importer was found.

Vector embeddings examined in this trace reside with their owning rows rather
than in a separately evidenced off-system store.

`member_memory_atoms` and `interpretive_ledger` are presently covered by
member-linked cascade behavior.

These findings narrow the repair problem but do not cure the incomplete erasure
contract.

## 6. F5-DERIVED ACCEPTANCE REQUIREMENTS

The subsequent combined D9 + F5 falsification contract must preserve at least
these distinctions:

**Identity** — who holds deletion authority.

**Content disposition** — every governed class that is erased, retained,
blocked, anonymized, or otherwise transformed.

**Lineage** — retained content must not lose attribution or derivation meaning
accidentally.

**Present standing** — withdrawal/deletion must not silently restore or preserve
current influence contrary to the member's act.

**Crossing / representation authority** — deletion must not leave an active
crossing under an authority its erased holder can no longer exercise.

**Member-visible truth** — success, refusal, retention, rollback, and no-change
outcomes must be rendered accurately to the member.

**Manifestability** — the erasure outcome must be explainable from the governed
erasure mechanism itself rather than reconstructed from incidental FK behavior
after the fact.

These are falsification requirements, not implementation instructions.

## 7. NOT AUTHORIZED

This adjudication does not authorize:

* FK changes,
* cascade changes,
* schema changes,
* new erasure tables,
* UI repair,
* Writer's Studio deletion,
* Circles deletion or revocation repair,
* `developmental_memories` repair,
* backfills,
* SPM implementation.

## 8. STANDING

**D9 — CLOSED**

**F5 TRACE — COMPLETE**

**F5 ERASURE CONFORMANCE — FAIL / STOP**

**SPM IMPLEMENTATION — CLOSED**

**NEXT AUTHORIZED ACT — construct the combined D9 + F5 falsification contract
from the evidence already earned.**

Do not begin repair until that contract has been adjudicated.

---

## APPENDIX — evidence base held in this repository

Recorded for custody so a later reader can find what this ruling rests on.

| record | subject | standing |
|---|---|---|
| `F5-A_ERASURE_ARCHITECTURE_CENSUS_2026-09-17.md` | `7ee173db` | CLOSED — PASS AS CENSUS |
| `F5-B_MEMBER_ERASURE_AUTHORITY_AND_TRUTHFULNESS_TRACE_2026-09-17.md` | `7ee173db` | CLOSED — NON-AUTHORITATIVE |
| `F5-C_MEMBER_INFORMATION_CUSTODY_GRAPH_2026-09-17.md` | `7ee173db` | COMPLETE |
| the trace underlying §2–§5 of this ruling | `a5834c94` | not held in this session's records |

The five `SPM-D9*` records exist at `a5834c94` and not at `7ee173db`. This
adjudication is the first F5 record in this custody line to bind to the D9 lane's
subject.

**A note preserved rather than resolved:** F5-B ruled the
`/api/sovereignty/delete-my-memory` surface `NON-AUTHORITATIVE`, and F5-C
established that all five of its target tables are absent from the canonical
schema surface at `7ee173db` — baseline and migrations both. Since the erasure
surface is byte-identical at `a5834c94`, that finding holds at this ruling's
subject too. It is **not** among the §2 load-bearing findings and is not inserted
into them; it is noted here so the two evidence bases can be read together
without either being rewritten to accommodate the other.
