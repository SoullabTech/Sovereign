# S3 · Step 7 — acceptance walks · result

**Date:** 2026-09-10 · **Result:** `48 passed · 2 failed`
**Both failures are findings in the recognition layer. Neither is an authority defect.**
**Nothing was repaired during the walk.**

## W0 — the subject of this record

```
application SHA   : 25cd830890ad32838c3633e7743a6af23186fe4d   (working tree clean)
database          : maia_consciousness as soullab on :5433 · UTF8 · 464 migrations
fixture           : tag e2b18d03 · work 2fc6ee6c… · reading ae7d241d…
server            : http://127.0.0.1:3100 · /api/health ok
work geometry     : dc8a779ad8a9d3d8fda358d0d1601b49
```

Qualification of the database: `docs/programme/S3_STEP7_WALK_DB_QUALIFICATION_2026-09-10.md`.
Scope: a repository-derived database sufficient for the Writer's Studio / S3
path; no claim is made about the 16 unrelated migration lanes.

## What passed

| | |
|---|---|
| **structure-only Ask** | no pause, no `pendingAskRef`, no sections offered |
| **body Ask** | pauses at `BODY_AUTHORITY_REQUIRED`, names exactly the required section, resumable ref, **crosses nothing** |
| **the act** | accepted, resumes the SAME thread, one receipt, section-scoped, `crossed`, on `writers_studio.ask->maia_developmental` |
| **double press** | same `actId` → `ACT_ALREADY_PROCESSED` with a truthful `completion`; **no second crossing** |
| **a different act on a spent claim** | `ALREADY_CONSUMED` — the two are distinguished, and both refuse identically |
| **partial authorization** | `BODY_SCOPE_INCOMPLETE`, outstanding section named, **nothing crossed — not even the section that WAS authorized**, ref not spent |
| **multi-section** | one act → **two receipts sharing ONE `request_ref`**, each `scope_kind='section'` with its own `section_ref`, both `crossed` |
| **client display metadata** | a client-asserted section, heading, label, `bodyRequired:false` and `allowBody:true` changed nothing; the server re-derived the required set and refused |
| **continuity failures** | unknown → **404 `unknown`** · expired → **410 `expired`** · malformed act **not** downgraded to an ordinary Ask · another member → **404 `not_found`** |
| **the sixth state** | consent substrate made genuinely unavailable → `DISCLOSURE_UNAVAILABLE`, `actSpent: true`, **no receipt crossed**, and the claim really is spent in the record |
| **no structure unit** | `heading: null` — the server invents nothing — and `label: "Section 5"` |
| **never a UUID** | no label anywhere is or contains one |
| **R1 · Work geometry** | `dc8a779a…` at open, `dc8a779a…` at close — opening, pausing, authorizing, double-pressing, failing and completing moved nothing |

The single-consumption law held under every shape it was pressed on: the same
act twice, a different act on a spent claim, a partial act, an expired claim, an
unknown ref, and a boundary failure after the claim was taken.

## Finding F1 — two sections in one structure unit are indistinguishable

**Walk 7e.** An authorization request for two distinct sections that live inside
the same structure unit:

```
c070de10-c181-4403-aa23-3f253201cf39  =>  "Before the water"
cabae9c4-7351-4404-82cc-af1012a1c97e  =>  "Before the water"
```

`recognizeSections` titles a section by the unit that contains it
(`u.title AS heading`), which is deliberate and documented: `source_section_id`
is provenance only and never a source of text, so the authored title comes from
the structure lane. The consequence was not carried through. A **unit** names a
division of the Work; **sections** are finer than units, so N sections inside one
unit receive N identical labels.

The member is asked to authorize two things that read the same. *A member asked
to authorize a string they cannot tell apart from another string has been asked
to consent to something they cannot identify* — the same failure the recognition
metadata exists to prevent, one level up from the UUID case it already solves.

Visible in three walks (2d, 7e, 12c); only 7e fails, because only 7e puts two
same-unit sections in one request.

⛔ Not repaired. Repair is a design question — position-qualified labels
(`"Before the water · Section 2"`), the section's own authored heading if one can
be reached without turning provenance into content authority, or something else —
and it belongs to whoever rules on it.

## Finding F2 — the order shown is the order of the ids

**Walk 6c.** Two required sections, presented in this order:

```
shown     : 7ba786af…  cabae9c4…
work order: cabae9c4…  7ba786af…
```

The recognition query ends `ORDER BY s.position ASC`, but `recognizeSections`
re-keys the result by the **input** order (`sectionIds.map(...)`), and the input
is `requirement.requiredSections` = `[...required].sort()` — a lexicographic sort
of UUIDs. The `ORDER BY` is therefore dead, and the member is shown their own
sections in an order derived from identifiers they never see, which changes if
the identifiers change.

This is not an authority defect: the *set* is correct and all-or-none is enforced
against the re-derived set. It is a recognition defect — the request does not read
as the Work reads.

⛔ Not repaired.

## Two instrument errors, recorded rather than hidden

1. The first draft of walk 2d asserted the **source section's** heading
   (`'Arrival'`). The design never promised that; it promises an authored title
   from the structure lane. The expectation was the instrument's, not the
   system's, and was corrected. What the arrangement actually costs is measured
   at 7e instead.
2. The first draft of walk 11b tried to age a claim with
   `UPDATE pending_ask_claims SET expires_at = …`. `pending_ask_claims_forward_only()`
   **refused it** — lifetime is immutable. That refusal is the substrate behaving
   correctly. The expired claim is now seeded with both timestamps in the past,
   since `expires_at > created_at` is a lifetime invariant, not a freshness one.

## One limit of this environment

No `ANTHROPIC_API_KEY` is present, so the model call at the end of ACT 3 cannot
run. Every constitutional act — claim, boundary, W2 enforcement, receipts,
completion — happens before it and was walked. The terminal `BODY_AUTHORIZED`
payload with MAIA's answer text was **not** observed, and no walk claims it was.
The walks assert that the protocol *leaves* the authorization states and that the
crossings are recorded correctly, which is exactly what is decidable here.
