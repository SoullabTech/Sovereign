# JARVIS — IDEAS PREFLIGHT RESTORATION — 01

## FIND

```text
LANE          JARVIS-IDEAS-PREFLIGHT-RESTORATION-01
PHASE         FIND
AUTHORIZATION FIND ONLY — no repair performed
STATUS        COMPLETE · awaiting adjudication
DATE          2026-09-02
```

**Mission (restated).** Restore the repository's existing preflight gate to
truthful green on the lineage T1 must eventually ship against, without
changing T1, Ideas behaviour, or weakening any gate.

**Governing rule held throughout.** A pre-existing failure is not permission
to waive, weaken, or route around a gate. No file was changed in this phase.

---

## 1. Base established

| Fact | Value |
|---|---|
| Working branch | `claude/jarvis-preflight-restoration-xnmkpi` |
| HEAD | `90f401c` — *Merge pull request #1176 from SoullabTech/docs/ws2-07-board-correction* (2026-09-02) |
| Worktree | clean (`git status --porcelain` empty) |
| `origin/clean-main-no-secrets` | `750f492` (2026-08-31, PR #1158) |
| Relation | `750f492` **is an ancestor** of HEAD. HEAD's **first-parent** (integration) chain descends directly from it — 17 merge commits (PRs #1160–#1176) ahead. |
| Clone depth | **shallow** — 8 grafts, 207 commits reachable |

**Lineage finding (F0).** `clean-main-no-secrets` is not a divergent branch; it
is a **stale pointer into the same integration chain**. The lineage T1 must
ship against is the chain HEAD sits on. There is no fork to adjudicate, and no
rebase decision hidden here. The eventual repair base is this integration tip.

**Shallow-clone caveat.** `git blame` returns `^37bbf0c` boundary markers on the
files below. Those are **graft boundaries, not provenance**. First-introduction
of the violating lines cannot be established from this clone. What *is*
established below by direct object read is stronger and sufficient: the lines
exist in canonical.

---

## 2. Full preflight reproduced

`npm run preflight` is a single `&&` chain. It **short-circuits at the first
failure**, so the reported inventory ("two failures") was never established —
checks 2..N never executed in the reported run. Each step was therefore run
independently.

```text
STEP                                        EXIT   VERDICT
check-dark-text-opacity.sh                   1     ❌ FAIL — reproduces
check:no-supabase                            0     ✅
check:no-direct-anthropic                    0     ✅ DOES NOT REPRODUCE
check:no-vendor-voices                       0     ✅
check:voice-provenance                       0     ✅
check:no-openai                              0     ✅
check:member-owned-boundary                  0     ✅
ci:guard                                   127     ⚠️ environment artifact
preflight-compose-config.sh                  1     ⚠️ environment artifact

npm run preflight (as a chain)               1     ❌
```

---

## 3. Findings

### F1 — `check-dark-text-opacity` · **STALE GATE + WRONG SCOPE** (composite)

**Reproduces.** Exit 1. Three hits:

```text
app/studio/field/page.tsx:1003  text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300
app/studio/field/page.tsx:1085  text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300
app/studio/layout.tsx:113       text-slate-600 hover:text-slate-400 … opacity-50 group-hover:opacity-100
```

**Rule being enforced.** `scripts/check-dark-text-opacity.sh` branch 2:

```
class(?:Name)?="[^"]*text-(?!opacity)[a-zA-Z0-9/:-]+[^"]*(?<![a-z]:)\bopacity-[0-9]+
```

Intent per the script's own header: *catch bare `opacity-*` used to **dim
text**, the footgun that makes text unreadable on dark gradients.*

**Are the three lines actually violating that rule? No.** Four independent
lines of evidence:

1. **There is no text.** All three elements are icon-only buttons —
   `<X className="w-3.5 h-3.5"/>` and `<GripVertical className="w-3.5 h-3.5"/>`,
   with `aria-label` carrying the accessible name. The matched `text-slate-600`
   is not text styling; it is **`currentColor` for the SVG stroke**. No text
   node exists inside any of the three. The invariant "invisible text on dark
   panels" is not reachable here.

2. **The gate documents these exact patterns as allowed.** Its header states
   verbatim: `group-hover:opacity-*` — fine; and
   `opacity-0 group-hover:opacity-100  (tooltip pattern — fine)`. Lines 1003
   and 1085 are that literal string. The **implementation does not encode the
   exclusion the gate declares.**

3. **The gate's two branches disagree on this same code.** Branch 2 has a PCRE
   path and an ERE fallback. Measured on this tree:

   ```text
   PCRE path      (grep -nP …)                        → 3 hits  → FAIL
   ERE fallback   (grep -nE … | grep -v group-hover:) → 0 hits  → PASS
   text-opacity-* (branch 1, hard ban)                → 0 hits  → PASS
   ```

   The fallback's filter list contains `group-hover:opacity`; the PCRE
   lookbehind `(?<![a-z]:)` guards only the token immediately following it, so
   the *bare* `opacity-0` earlier in the string still matches. **The verdict of
   this gate depends on which grep built the host.** This container is GNU grep
   3.11 with PCRE (`-P` works) → fail. A host whose grep lacks `-P` yields an
   empty PCRE result, falls through to the fallback, and passes. This is the
   most plausible mechanism by which the violating code and the gate were
   merged together and the gate has been believed green.

4. **Sibling control lines pass.** `app/studio/field/page.tsx:729` and `:865`
   use the identical reveal pattern —
   `opacity-0 group-hover:opacity-100 transition` — and are **not** flagged,
   solely because no `text-*` token happens to share their class string. The
   gate is keying on the *presence of a `text-*` class*, not on text being
   dimmed.

**Is the invariant still canonical? Yes.** Opacity-dimmed text on dark panels
is a genuine legibility footgun and the gate should keep catching it. What has
drifted is the encoding, not the invariant.

**Canonicality of the code.** Read directly out of the canonical ref (no blame,
no graft dependency):

```text
git show origin/clean-main-no-secrets:app/studio/field/page.tsx  → lines 1003, 1085 present
git show origin/clean-main-no-secrets:app/studio/layout.tsx      → line 113 present
git show origin/clean-main-no-secrets:scripts/check-dark-text-opacity.sh → present
```

Both the gate and the code it flags are canonical. Neither is lane-local.

---

### F2 — `check:no-direct-anthropic` · **DOES NOT REPRODUCE**

```text
npx tsx scripts/check-no-direct-anthropic.ts   EXIT=0
✅ No direct @anthropic-ai/sdk imports outside allowlist.
   approved:      2 file(s) — canonical provider-adapter layer
   operational:   1 file(s) — non-cognitive (health checks, probes)
   grandfathered: 55 file(s) — legacy, to be migrated
```

The second reported blocker **is green on this lineage**. It is not part of the
preflight blocker here.

**Open question (single, and it requires a checkout this container does not
have).** The lane brief reports this check failing. That report originated
elsewhere. Two candidate explanations, undecided:

- it was observed on the T1 branch, cut from a base predating the allowlist
  state present here; or
- it was observed as the *chain* exit and mis-attributed — impossible to tell
  from a short-circuiting `&&` chain.

Resolving this needs the Mac Studio checkout where `eb0a7af` exists. It does
**not** block the F1 line of work.

---

### F3 — `ci:guard` · **ENVIRONMENT ARTIFACT** (not a repository fault)

```text
> jest scripts/ci/maia-route-guard.test.ts …
sh: 1: jest: not found        EXIT=127
```

`node_modules` is **absent** in this container. `jest@^29.7.0` is declared in
devDependencies; the tsx-based checks only ran because `npx` fetched `tsx` on
demand. Exit 127 is a missing-install artifact. **Whether `ci:guard` passes on
an installed tree is UNVERIFIED here** and must not be assumed either way.

### F4 — `preflight-compose-config.sh` · **ENVIRONMENT ARTIFACT**

```text
preflight: .env.docker not found — docker compose config requires it.   EXIT=1
```

`.env.docker` is gitignored and exists only in the main checkout. This is the
trap already documented in `CLAUDE.md` ("Worktrees + preflight `.env.docker`");
a fresh remote clone is the same class of case. The step detected it and
printed its own guidance. Not a repository fault.

---

## 4. Did either failure arise from T1? — **No. Proven, not inherited.**

```text
git cat-file -t eb0a7af   → fatal: Not a valid object name eb0a7af
```

T1 (`feature/ideas-cut02-t1-fault-localization`, `eb0a7af`) is **not present in
this clone at all**, and is not among the fetched remote refs. The F1 failure
reproduces on a T1-free tree whose flagged lines are readable directly out of
canonical. T1 cannot be a contributing cause.

`eb0a7af` was not touched. No file in the repository was modified in this phase.

---

## 5. Classification table

| # | Finding | Classification | Invariant still canonical? |
|---|---|---|---|
| F1 | `check-dark-text-opacity` — 3 icon-button hits | **STALE GATE + WRONG SCOPE** — implementation does not encode the exclusion the gate declares; and it keys on `text-*` presence rather than on text being dimmed. Not a real violation. | **Yes** — the legibility invariant is sound and must keep biting |
| F2 | `check:no-direct-anthropic` | **NOT REPRODUCIBLE** on this lineage (exit 0) | n/a |
| F3 | `ci:guard` exit 127 | **ENVIRONMENT ARTIFACT** — `node_modules` absent | n/a — verdict unverified |
| F4 | compose-config exit 1 | **ENVIRONMENT ARTIFACT** — gitignored `.env.docker`; documented trap | n/a |
| F0 | lineage | `clean-main-no-secrets` is a stale pointer 17 merges behind the same first-parent chain HEAD sits on | n/a |

**"Pre-existing" is provenance, not exemption** — held. F1 is not dismissed as
old; it is classified as an encoding that never matched its own declared
semantics, which is a defect in the gate that must be corrected rather than
waived.

---

## 6. Carried into UNDERSTAND (no repair proposed here)

Questions UNDERSTAND must answer before any correction is named:

1. What is the smallest correction that makes the PCRE branch encode the
   exclusion the header already declares — without loosening detection of
   genuine text dimming?
2. Should the gate distinguish *element reveal* from *text dimming* structurally
   (e.g. by the absence of a text child / icon-only element) rather than by
   token adjacency in a class string?
3. Is the PCRE/ERE dual-path design itself the fault? A gate whose verdict
   varies by host grep build is not truthful on any host. Does the correction
   belong at "make both paths agree", or at "have one path"?
4. Do lines 729/865 (same reveal pattern, currently passing) tell us the gate's
   true intended scope is narrower than its regex, or that it is under-catching
   elsewhere?
5. Is F2 a T1-base artifact or a mis-attributed chain exit? — needs the Mac
   Studio checkout.
6. Do F3/F4 need to be made robust so that preflight is *runnable* off the main
   checkout, or is that a separate unit? (Held: **out of scope unless
   UNDERSTAND proves it is required for preflight truthfulness.**)

Explicitly **not** entered, per the lane's DO NOT TOUCH list: T1 / Ideas code,
C3 / C5, T2, the 500 reproduction, Cuts 3–4, unrelated Studio redesign,
`tsconfig.ship` coverage.

---

## 7. Phase verdict

```text
FIND        COMPLETE
REPAIRS     NONE PERFORMED
BLOCKER     one real gate defect (F1); one reported blocker does not reproduce (F2);
            two environment artifacts (F3, F4)
NEXT        UNDERSTAND — authorization required
```

STOPPED FOR ADJUDICATION.
