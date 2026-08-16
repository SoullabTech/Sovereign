# Living Spiral — Slice 1 completion and lane custody

**Status:** programme transition record. Founder ruling 2026-08-16.
**Lane:** `chore/jarvis-epistemic-custody-2026-08-16` @ `8d0b41163`
**Upstream:** [`…BOUNDED_IMPLEMENTATION_PROPOSAL_2026-08-16.md`](./JARVIS_LIVING_SPIRAL_BOUNDED_IMPLEMENTATION_PROPOSAL_2026-08-16.md) · [`…PROGRAMME_DIRECTIVE_2026-08-16.md`](../governance/JARVIS_LIVING_SPIRAL_PROGRAMME_DIRECTIVE_2026-08-16.md)

```text
SLICE 1 BUILD           COMPLETE
PERFORMED_DERIVATION    ESTABLISHED
LANE CUSTODY            ESTABLISHED
PROTOTYPE ACCEPTANCE    STILL AWAITING_AUTHORITY
UI BUILD                NOT IMPLIED
```

## Custody chain

| Commit | Unit | Standing |
|---|---|---|
| `9f1c7bc32` | PHI inventory gate repair | custody ESTABLISHED · fail-closed behaviour PROVEN |
| `a49dbdbb3` | Programme directive + bounded Slice 1 proposal | custody ESTABLISHED |
| `8d0b41163` | Slice 1 performed-derivation harness + proof | lane custody ESTABLISHED |

**Merge evidence (2026-08-16):** target lane rebound at `a49dbdbb3`; `8d0b41163` verified to
contain only `scripts/builder/living-spiral-derive.mjs` and its proof (2 files, +944, no deletions);
`git merge-base --is-ancestor` confirmed linear descent with no foreign ancestry; fast-forward merge;
proof rerun **from the resulting lane SHA** — 9 passed · 0 failed; gates
`check:no-supabase` · `check:no-inline-names` · `check:phi-inventory` · `check:no-direct-anthropic`
all exit 0; `npm run typecheck` no regressions (237 vs baseline 239).

⛔ Not merged to trunk. Lane custody is not canonical custody.

## Durable event — the harness caught a Subject Identity Failure in itself

Recorded because it is the strongest evidence Slice 1 produced, and it was produced *against* the
implementation rather than for it.

```text
HARNESS FIRST RUN
  produced valid assertions
  about wrong repository

CAUSE
  ambient JARVIS_REPO_ROOT=/Users/soullab/jarvis-runtime
  a different, detached checkout (5767d5d41)

CONTROL
  subject-binding rule — resolved path + WHY it resolved, printed before any assertion

RESULT
  fail-closed repair — ambient redirection now refuses with SUBJECT DIVERGENCE
  unless the subject is named explicitly

LESSON
  internally correct evidence about the wrong referent
  is still invalid evidence
```

This is instance **#3** of [`docs/ops/JARVIS_SUBJECT_IDENTITY_FAILURE.md`](../ops/JARVIS_SUBJECT_IDENTITY_FAILURE.md)
reproduced live: the output was well-formed, self-consistent, and about the wrong tree. It announced
nothing. It became visible only because the rule requires printing *why* the subject resolved — the
pathname alone would not have exposed it.

⭐ **The programme conclusion this licenses:** referent binding must precede derivation, structurally,
not by discipline. Without it Living Spiral could have produced a beautifully coherent false cockpit —
every panel internally consistent, every assertion well-formed, the whole thing describing a
different repository. ⚠️ Note the aperture that remains: `JARVIS_SUBJECT_IDENTITY_FAILURE.md` is
itself **UNTRACKED** and therefore has no commit lineage, which is instance #1 of the same record.

## What Slice 1 established, and what it did not

**Established.** That assertions can be derived from real sources in this repository today, in
accepted contract vocabulary, with provenance that survives re-reading (4 provenances re-read and
confirmed to contain their cited text); that absence stays representable; that the derivation refuses
a structurally convincing but wrong referent.

⛔ **Not established.** Any runtime behaviour, any deployment, any member experience, any witness.
Every assertion is a source read. No health value, lifecycle value, error class, scalar, or ranking
was emitted, and none is derivable under Slice 1. The four collisions **C2 · C3 · C7 · C8** remain
`RULING_REQUIRED` and untouched — Slice 1 was built to depend on none of them.

## Two findings carried forward

- **`maia.identity.congruence` → DIVERGENT.** Edge defect `DISCOVERED`; downstream exposure
  `UNKNOWN`. Adjudication authorized as a separate unit; **repair NOT authorized**. See
  [`AIN_MEMBER_AUTH_EDGE_ADJUDICATION_2026-08-16.md`](./AIN_MEMBER_AUTH_EDGE_ADJUDICATION_2026-08-16.md).
- **`astrology.maia_relation`.** Assembly-point evidence YES · composition `provisional` · runtime
  witness NO. ⭐ Founder ruling: this is the correct epistemic result and the harness must not
  normalize it — `conveyance` and `composition` stay as the accepted contract defines them, and
  *"the prompt interpolates the addendum at the assembly point"* may never become *"MAIA is receiving
  astrology in production."*

⛔ **Nothing here opens the Living Spiral UI, prototype acceptance, or trunk custody.**
