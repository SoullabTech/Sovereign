# Experience Contracts

**Status:** operative gate. Enforced by `npm run check:design-canon`
(`scripts/check-design-canon.ts`), wired into `npm run preflight`.

Governing law: [`docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md`](../../canon/INHABITABLE_ARCHITECTURE_STANDARD.md)
· [`docs/canon/SOULLAB_THEME.md`](../../canon/SOULLAB_THEME.md)
Origin: [Experience Language Reconciliation, 2026-08-10](../SOULLAB_EXPERIENCE_LANGUAGE_RECONCILIATION_2026-08-10.md) §5 M1.

---

## Why this exists

Soullab has design law and had **nothing in the commit path enforcing it**. As of
2026-08-10 the repo carried 20+ `check:*` gates — sovereignty, Supabase, providers,
PHI, refusals — and zero for design. So the canon was real, good, and free to ignore.
That is the whole reason each new session could regress into cards, dashboards,
office forms and arbitrary palettes: not missing principles, missing consequence.

**More canon would not have fixed this.** A fifth charter would have joined the same
unenforced shelf.

## What the gate enforces — and what it must never enforce

The gate enforces **process and evidence**. It asks whether a member-facing change
can say what room it belongs to, what human activity it serves, what it shares with
the House, and what it keeps distinct — and whether someone actually looked at it.

⛔ **It does not enforce aesthetics by regex, and must never be made to.** There is
no "ivory good, green bad" rule here. Two reasons, both load-bearing:

1. It would freeze the house style at whatever a lint rule could express, which is
   the opposite of a living experience language.
2. It would be unshippable. Measured 2026-08-10: **381** files use
   purple/violet/pink/indigo and **362** use raw hex, of **1,424** `.tsx` files in
   `app/` + `components/`. A palette gate blocks every commit and teaches nothing.

Taste is not enforceable. Having *consulted the references and said what you did* is.

## The ratchet

The gate asks nothing of the 1,424 files already in the tree. It applies only to
surfaces a change actually touches. Coverage therefore grows monotonically with real
work, and no baseline file is needed — unlike `typecheck-baseline.json`, there is
nothing to bless, because there is no pre-existing violation set.

## Flow

```
CODE CHANGE
    ↓
member-facing UI?  (.tsx under app/ or components/,
    │               excluding api · tests · admin/founder/labtools/dev routes)
    ├── NO  → pass
    └── YES
          ↓
    contract covers this surface?      ── no →  FAIL
          ↓
    room + human activity declared?    ── no →  FAIL
          ↓
    canon principles cited?            ── no →  FAIL
          ↓
    reference surfaces named?          ── no →  FAIL
          ↓
    House / Room split stated?         ── no →  FAIL
          ↓
    desktop + mobile evidence on disk? ── no →  FAIL
          ↓
    experience verification recorded?  ── no →  FAIL
          ↓
    deviation without authority?       ── yes → FAIL
          ↓
         PASS
```

## Usage

```bash
npm run check:design-canon
```

Scaffold a contract for a new room:

```bash
npm run check:design-canon -- --init Journal
```

Review a whole branch (PR-level, opt-in):

```bash
npm run check:design-canon -- --branch
```

Audit coverage across the whole tree (reporting, not gating):

```bash
npm run check:design-canon -- --all
```

### Scope, and why the default is narrow

| Context | Scope | Enforcing? |
|---|---|---|
| **pre-commit hook** (`GIT_PRE_COMMIT=1`) | staged files — what this commit introduces | ✅ fail closed |
| **PR / CI** (`--branch`) | merge-base vs `origin/clean-main-no-secrets` | ✅ fail closed |
| default (manual) | staged + unstaged | reporting |
| `--all` | whole tree | reporting (audit) |

⛔ **Deliberately NOT wired into `npm run preflight`** (founder ruling, 2026-08-10).
`preflight` runs in a dirty, multi-session working tree, where the gate correctly
detects unrelated in-flight UI files — and that turns *"new UI work must comply"*
into *"the entire uncommitted UI estate must be reconciled before anything can
proceed."* That is not the ratchet. Enforcement belongs at **commit** and at
**PR**, where a change is actually being proposed.

The default is deliberately **not** the branch diff. Gating a whole branch against
trunk retroactively demands contracts for work done before this gate existed — on
the branch where it landed, that was **37 surfaces**. That would break the ratchet
promise on day one and train people to bypass the gate. `--branch` remains available
when you actually want PR-level review.

## Format

One file per room, `<room-slug>.md`, frontmatter + prose. See [`_TEMPLATE.md`](_TEMPLATE.md).

| Field | Required | Meaning |
|---|---|---|
| `room` | always | which room is being changed |
| `human_activity` | always | the activity it serves — not the data model |
| `surfaces` | always | globs this contract governs (this is the coverage mechanism) |
| `change_class` | defaults `experiential` | `experiential` or `structural` |
| `principles` | always | which existing Soullab principles apply — cite, don't restate |
| `reference_surfaces` | always | approved references actually consulted |
| `shared_with_house` | always | what is intentionally common |
| `distinct_to_room` | always | what stays particular, and why |
| `screenshot_desktop` | experiential | must exist on disk |
| `screenshot_mobile` | experiential | must exist on disk |
| `experience_verification` | experiential | how it was checked as lived experience |
| `structural_rationale` | structural | why the change is not experiential |
| `deviation` | optional | what departs from canon |
| `authority` | with `deviation` | the ruling that permits it |

### On `structural`

`change_class: structural` is the honest escape for changes that genuinely do not
alter experience — a type fix, a prop rename, an extracted helper. It still requires
declaring the room and writing `structural_rationale`. **The claim is committed and
reviewable.** There is no silent bypass, and adding one would defeat the gate.

## What this becomes

Contracts are the durable artifact the **JARVIS memory layer** (step 3) will read.
Every approved contract is evidence of a design judgment that was accepted; every
rejection recorded against one is equally valuable. That is how the emerging Soullab
aesthetic stops being something rediscovered each session and becomes something the
development system preserves.

Sequence: **enforcement gate (this)** → room character register → JARVIS memory
layer → golden references → Experience Contract auto-attached to every UI work packet.
