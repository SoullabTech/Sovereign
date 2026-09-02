# JARVIS — IDEAS PREFLIGHT RESTORATION — 01

## DECIDE (ratified) + BUILD proof

```text
PHASE         BUILD
AUTHORIZED    scripts/check-dark-text-opacity.sh
              app/studio/layout.tsx
              documentation + proof artifacts
STATUS        authorized slice COMPLETE and PROVEN
              unit mission NOT YET MET — one adjudication item open
DATE          2026-09-02
```

---

## 0. Ground, bound to exact trees

```text
CANONICAL     origin/clean-main-no-secrets @ 750f492b48bf3aeb2bf2a071ba0ac2dc22624957
CURRENT HEAD  claude/jarvis-preflight-restoration-xnmkpi @ cbc9756e (at BUILD start)
MERGE-BASE    750f492b  (== canonical tip)
RELATION      canonical IS ancestor of HEAD   (git merge-base --is-ancestor → exit 0)
AHEAD         95 commits on HEAD not in canonical
BEHIND        0 commits in canonical not on HEAD
```

`origin/clean-main-no-secrets` being an ancestor of HEAD is **not** a claim that
HEAD is the canonical shipping state. It is only an ancestry fact. Every finding
below is therefore bound to the tree it was observed on.

### Reproduction at the exact canonical SHA (isolated detached worktree)

Run in a clean worktree at `750f492`, **not** on HEAD:

```text
npm run preflight                     EXIT=1   (chain fails at step 1)
check:dark-text-opacity               EXIT=1
  app/studio/field/page.tsx:1003
  app/studio/field/page.tsx:1085
  app/studio/layout.tsx:113
check:no-direct-anthropic             EXIT=0   ✅ green at canonical
```

Identical file:line set on canonical and on HEAD ⇒ **canonical debt, not
introduced later**. `check:no-direct-anthropic` is green on both trees
(canonical reports `approved: 1`, HEAD `approved: 2` — a later commit added one
adapter; both pass).

---

## 1. Rulings applied

| Item | Ruling | Action taken |
|---|---|---|
| `check:no-direct-anthropic` | **OUT OF UNIT — wrong lineage** | Untouched. No allowlist entry added. Green at canonical and HEAD. |
| opacity hits 1–2 (`field/page.tsx:1003,1085`) | **STALE GATE IMPLEMENTATION** | Gate repaired. `field/page.tsx` **byte-unchanged** (verified). |
| opacity hit 3 (`layout.tsx:113`) | **REAL VIOLATION** (historical-debt provenance) | Source repaired. |
| CI enforcement of preflight | **HELD** | Not wired. No CI file touched. |
| `tsconfig.ship.json` coverage | **HELD** | Not touched. |
| T1 / `eb0a7af` | **FROZEN** | Not present in clone; untouched. |
| 500 reproduction · T2 · C3/C5 · Cuts 3–4 | **HELD / UNAUTHORIZED** | Not entered. |

---

## 2. Change 1 — `scripts/check-dark-text-opacity.sh`

**Defect repaired.** Branch 2 had a `grep -P` primary and a `grep -E` fallback
whose filter list disagreed with it on the same input. Measured on the canonical
tree: PCRE path → 3 hits; ERE fallback → 0 hits. The gate's verdict therefore
depended on whether the host `grep` was built with PCRE — red on GNU grep,
green on a grep without `-P`. A gate that answers differently per host is not
truthful on any host, so the two paths were replaced by **one deterministic,
POSIX-awk path** with no PCRE dependence.

**Exemption is precise, not broad.** The only bare opacity token permitted is
`opacity-0`, and only when `group-hover:opacity-100` appears in the same class
string — the reveal pattern the file's own header already declares legal. Bare
opacity at any other value remains a violation *regardless of accompanying
hover state*:

```text
opacity-0  + group-hover:opacity-100   → allowed  (hidden until hover)
opacity-50 + group-hover:opacity-100   → STILL A VIOLATION
```

A class string carrying both an exempt `opacity-0` and any other bare opacity
token still fails.

## 3. Change 2 — `app/studio/layout.tsx:113`

The drag handle is a persistent affordance whose already-muted colour was
further reduced by bare opacity — the family the guard exists to prohibit.
Same interaction (quiet at rest, clearer on row hover), expressed through
colour:

```diff
- className="px-1 py-2 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity touch-none"
+ className="px-1 py-2 text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors touch-none"
```

No opacity. `hover:` → `group-hover:` so the handle brightens with its row, as
the opacity version did.

---

## 4. Negative controls — the gate still discriminates

Run **end-to-end through the real gate**, one tracked probe fixture at a time in
a scoped directory, each reverted byte-for-byte afterwards (0 probe files
remain):

```text
✅ PASS (want PASS)  text-slate-600 opacity-0 group-hover:opacity-100
✅ PASS (want PASS)  text-slate-600 disabled:opacity-50
✅ FAIL (want FAIL)  text-sm opacity-70
✅ FAIL (want FAIL)  text-slate-600 opacity-50
✅ FAIL (want FAIL)  text-slate-600 opacity-50 group-hover:opacity-100
✅ FAIL (want FAIL)  text-opacity-50
```

Case 5 is the load-bearing one: it proves the reveal exemption did **not**
become "anything containing group-hover is allowed."

---

## 5. Third violation — surfaced by the repair, then repaired

Removing the PCRE path revealed a violation the old gate **provably could not
see**:

```text
app/studio/calendar/page.tsx:981
  <div className="text-[10px] opacity-70">
    {formatEventTime(event.start)}
  </div>
```

- **Real text** (an event timestamp), dimmed by bare `opacity-70` on a coloured
  chip. The exact footgun this guard exists to prohibit, and literally the
  example in its own fix text.
- **Present at canonical `750f492`** ⇒ historical debt, not lane-introduced.
- **Why the old regex missed it**: its matcher was
  `text-(?!opacity)[a-zA-Z0-9/:-]+`, and `text-[10px]` continues with `[`,
  outside that character class. Arbitrary-value Tailwind classes
  (`text-[10px]`, `text-[#fff]`) escaped the old gate entirely. Verified:
  `grep -cP '<old regex>'` on this line returns `0`. This was **masked
  under-catching**, not a new defect.

**Ruling applied** (authorized as newly exposed historical debt required to
restore the gate): repair as a real canonical violation using explicit **opaque**
source-colour tokens — no bare opacity, and no `/70` alpha workaround. An
alpha-suffixed token would pass the regex while moving the same opacity-based
dimming one layer inward: green by syntax, not by invariant.

The parent chip already establishes three source-specific foreground colours.
The timestamp now takes an explicit opaque token one step down from each,
preserving both the source tint and the visual hierarchy:

```text
MAIA    text-amber-300  → timestamp  text-amber-400
Studio  text-slate-200  → timestamp  text-slate-300
Other   text-teal-300   → timestamp  text-teal-400
```

`text-[10px]` retained. No opacity of any kind on the element.

### Disclosed side effect — the line left the gate's scanned surface

The gate matches `class(Name)?="` — a **literal double-quoted** class string.
A per-source colour requires a JSX expression (`className={...}`), so the
repaired line is no longer scanned by this gate. This must not be read as the
reason the gate went green: the violation is genuinely gone (no opacity token
remains), and the probe in §7 proves the gate still turns red on the original
text.

It does, however, name a **real pre-existing scope gap**: the gate is blind to
template-literal and expression classNames. The same gap already exempts this
chip's own parent button, which carries `hover:opacity-80 transition-opacity`
in a backtick className and has never been scanned. Widening the gate to
expression classNames is a larger change than this unit authorizes.
**Recorded as a finding for a follow-up unit; not fixed here, not waived.**

---

## 6. Bounded footprint (final)

```text
scripts/check-dark-text-opacity.sh     gate repair (§2)
app/studio/layout.tsx                  real violation, drag handle (§3)
app/studio/calendar/page.tsx           real violation, timestamp (§5)
docs/programme/…_FIND.md               FIND record
docs/programme/…_BUILD_PROOF.md        this document

app/studio/field/page.tsx              BYTE-UNCHANGED (git diff --quiet, clean)
```

---

## 7. Proof

**Repository gates** — all eight run to completion:

```text
check-dark-text-opacity        ✅ EXIT 0   No dark-text opacity footguns found
check:no-supabase              ✅ EXIT 0
check:no-direct-anthropic      ✅ EXIT 0
check:no-vendor-voices         ✅ EXIT 0
check:voice-provenance         ✅ EXIT 0
check:no-openai                ✅ EXIT 0
check:member-owned-boundary    ✅ EXIT 0
ci:guard                       ✅ EXIT 0   1 suite passed (deps installed)
npm run typecheck              ✅ EXIT 0   No TypeScript regressions
```

FIND F3 is **resolved, not assumed**: `ci:guard` was exit 127 only because
`node_modules` was absent. With dependencies installed it passes.

**Negative controls** — end-to-end through the real gate, one tracked probe
fixture at a time in a scoped directory, each reverted (0 probe files remain):

```text
✅ PASS  text-slate-600 opacity-0 group-hover:opacity-100
✅ PASS  text-slate-600 disabled:opacity-50
✅ FAIL  text-sm opacity-70
✅ FAIL  text-slate-600 opacity-50
✅ FAIL  text-slate-600 opacity-50 group-hover:opacity-100
✅ FAIL  text-opacity-50
```

Case 5 is load-bearing: the reveal exemption did **not** become "anything
containing group-hover is allowed."

**Forbidden probe** — the repaired gate actually turns red on real repository
content, then byte-for-byte revert:

```text
original violation restored at calendar/page.tsx:981   → gate EXIT 1  (RED)
byte-for-byte revert                                    → gate EXIT 0  (GREEN)
```

**The one step this container cannot run.** `npm run preflight` reaches its
final step, `preflight-compose-config.sh`, and stops:

```text
preflight: .env.docker not found — docker compose config requires it.
```

`.env.docker` is gitignored (`.gitignore:303`) and exists only on the main
checkout; the docker daemon is also unreachable here. This is an environment
precondition, unchanged and untouched by this unit — the CLAUDE.md trap. A
synthetic `.env.docker` was **not** fabricated to force the chain green; that
would be the same "green by syntax, not by invariant" failure rejected in §5.

```text
Every repository gate in the chain:  GREEN
Final chain step:                    UNRUNNABLE HERE — needs a checkout with
                                     .env.docker and a live docker daemon
```

**`npm run preflight` returning 0 must therefore be confirmed once on the main
checkout.** Everything it gates on is proven green above.

---

## 8. Held, as ruled

```text
CI enforcement of preflight   HELD — not wired, no CI file touched
tsconfig.ship coverage        HELD — untouched
check:no-direct-anthropic     OUT OF UNIT — untouched, green at canonical and HEAD
T1 / eb0a7af                  FROZEN — not present in clone, untouched
500 reproduction · T2 · C3/C5 · Cuts 3-4    NOT ENTERED
```

**Open finding carried out of this unit** (§5): the gate does not scan
template-literal or expression classNames. Needs its own authorization.

---

## 9. INTEGRATE — custody

**Canonical moved during this lane.** At FIND, `origin/clean-main-no-secrets`
pointed at `750f492b`. On re-fetch at integration time it points at `90f401c1`
— the tip this lane's work was already built on. The "97 commits ahead"
custody concern was an artifact of a stale remote ref, and it dissolves against
current canonical:

```text
BASE (current canonical)  origin/clean-main-no-secrets @ 90f401c1
INTEGRATION BRANCH        feature/preflight-restoration-01-repair
COMMITS AHEAD             1
```

**Conflict check against current canonical.** All three authorized source files
are unchanged on canonical between the witness base `750f492b` and the current
tip `90f401c1`, so the repair applies to current canonical without
re-adjudication:

```text
unchanged   scripts/check-dark-text-opacity.sh
unchanged   app/studio/layout.tsx
unchanged   app/studio/calendar/page.tsx
```

**Bounded diff — `git diff origin/clean-main-no-secrets...HEAD`:**

```text
app/studio/calendar/page.tsx                        |   8 +-
app/studio/layout.tsx                               |   2 +-
scripts/check-dark-text-opacity.sh                  |  62 ++++-
docs/programme/…_BUILD_PROOF.md                     | 277 +++++
docs/programme/…_FIND.md                            | 271 +++++
5 files changed, 610 insertions(+), 10 deletions(-)
```

Only the authorized surface. `app/studio/field/page.tsx` byte-unchanged against
canonical.

**`feature/preflight-restoration-01` was not used and not touched.** It exists
on origin at `a6ebf9a`, based on the same canonical tip, carrying a *different*
document from a parallel lane
(`…/JARVIS_PREFLIGHT_RESTORATION_01_FIND.md`, underscore-named, 150 lines).
Pushing this repair onto it would have overwritten another lane's record, so a
separate integration branch was cut. **The two FIND documents should be
reconciled before merge** — that is a custody decision, not this unit's to make.

**Re-proved on the integration branch:**

```text
six negative controls     hold (0 probe residue)
ci:guard                  EXIT 0
npm run typecheck         EXIT 0 — no regressions
npm run preflight         all seven repository gates ✅, stops at the final
                          compose step
```

### The one outstanding witness

`npm run preflight` cannot return 0 in this container, and no source change
would alter that:

```text
ssh              not installed — the main checkout is unreachable from here
docker daemon    not reachable
.env.docker      absent (gitignored, .gitignore:303)
```

No `.env.docker` was synthesized. The witness must be taken where the real file
and a live docker daemon exist:

```bash
cp /Users/soullab/MAIA-SOVEREIGN/.env.docker <checkout>/.env.docker   # do not commit
cd <checkout> && git checkout feature/preflight-restoration-01-repair
npm run preflight        # must EXIT 0
```

```text
PREFLIGHT RESTORATION   NOT CLOSED
BLOCKING                one real-environment preflight witness
THEN                    PR → canonical merge → canonical gate witness → CLOSED
```

---

## 10. PROVE — expression/template className census (read-only)

The repaired guard's bare-opacity branch scans only literal `className="..."`
strings (§5). Before calling this tree green, a **read-only** census asked
whether that blindness hides a real violation. No code was changed.

**Method.** Across the same eight scoped directories the guard covers, every
`className={...}` / `class={...}` expression was extracted by brace-matching
(template literals and nested `${}` included) and tokenized. An expression was
collected as a candidate if it contained **both** a bare `opacity-N` token
(no variant prefix) **and** a foreground token (`text-*` or `currentColor`).

```text
scoped files scanned            198
expression classNames scanned   635
candidates                        8
```

**Classification — 8 candidates, 0 genuine violations.**

| # | Location | Condition | Class |
|---|---|---|---|
| 1 | `app/labtools/admin/system/page.tsx:377` | `saving === 'maintenance_mode'` | in-flight save |
| 2 | `app/labtools/admin/system/page.tsx:495` | `saving \|\| !bannerText` | in-flight / invalid input |
| 3 | `app/labtools/admin/system/page.tsx:574` | `saving === setting.key` | in-flight save |
| 4 | `app/labtools/navigator/page.tsx:338` | `isProcessing ? 'opacity-50 cursor-not-allowed'` | disabled |
| 5 | `app/labtools/rlm/page.tsx:304` | `mode !== 'ask' ? 'opacity-40 cursor-not-allowed'` | disabled |
| 6 | `app/studio/clients/import/page.tsx:349` | `!isNative ? 'opacity-50 cursor-not-allowed'` | unavailable platform |
| 7 | `app/studio/settings/page.tsx:900` | `isComingSoon ? 'cursor-default opacity-60'` | unavailable feature |
| 8 | `components/account/AccountSettings.tsx:2208` | `serverDisabled ? 'opacity-50 cursor-not-allowed'` | disabled |

Every one dims a **whole control that is unavailable** — the semantics the
guard's header already names as allowed (`disabled:opacity-50 (button disabled
state — fine)`), written as a conditional class string rather than the
`disabled:` variant. None dims text that is meant to remain readable, which is
the family the guard exists to prohibit.

Two honest qualifications:

- The census **over-collects by design**. In 4 of the 8, the only "foreground"
  token was `text-left` or `text-sm` — alignment and size, not colour. They were
  read in full rather than filtered out.
- **#5 is the nearest to the line**: `opacity-40` on a `<label>` containing text.
  It still classifies as disabled — its `<input>` carries
  `disabled={mode !== 'ask'}`, and the label dims with the control it belongs
  to, replacing the enabled `text-white/80` rather than stacking on it.

```text
expression/template coverage gap   OPEN FOLLOW-UP (own authorization)
current integration tree           NO HIDDEN KNOWN VIOLATION
```

The gap does not block this lane.

---

## 11. Correction — the daemon was never the blocker

An earlier note in this record listed an unreachable docker daemon among the
reasons `npm run preflight` could not complete here. That was wrong.
`scripts/preflight-compose-config.sh` runs `docker compose config`, which is a
client-side parse. Demonstrated in this container, with no daemon reachable:

```text
$ docker compose -f docker-compose.yml config
warning /home/user/Sovereign/docker-compose.yml: the attribute `version` is obsolete…
env file /home/user/Sovereign/.env.docker not found: stat …: no such file or directory
EXIT=1
```

It parsed the compose file and failed on **one thing only**: the absent
`.env.docker`.

```text
SOLE BLOCKER   the real .env.docker (gitignored, .gitignore:303),
               which exists only in the main checkout
```

`ssh` is not installed in this container, so the main checkout is unreachable
from here and no real `.env.docker` can be obtained. None was synthesized.

---

## 12. Superseded FIND custody

The earlier FIND-only branch at `a6ebf9a`
(`feature/preflight-restoration-01`) is preserved as historical investigation
custody and is not part of this integration. It is not merged, not combined,
and not altered.

---

## 13. WITNESS — full preflight, real environment

Taken on the Mac main checkout (`/Users/soullab/MAIA-SOVEREIGN`) with the real
`.env.docker`, against this branch's exact head. No synthetic values, no
modification to `.env.docker`, no source change.

```text
HEAD=8677838c99d49238780a01eb87d80f1cce46946b
.env.docker=REAL_PRESENT

🔍 Checking for dark-text opacity footguns...
✅ No dark-text opacity footguns found.
✅ No Supabase detected.
✅ No direct @anthropic-ai/sdk imports outside allowlist.
   approved: 2 · operational: 1 · grandfathered: 55
✅ No vendor voice names in UI code.          (1493 UI-facing files scanned)
✅ voice-provenance: no cloud backend impersonating a sovereign voice.
✅ No new OpenAI surface. Migration debt on allowlist: 53 file(s).
✅ Boundary holds. 3 member-owned tables have no application reader.
                                              (5993 application files scanned)
 PASS  scripts/ci/maia-route-guard.test.ts
Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
WARN[0000] docker-compose.yml: the attribute `version` is obsolete…
✅ Preflight passed: opacity + supabase + direct-anthropic + vendor voices +
   voice-provenance + provider-governance + member-owned-boundary +
   route-guard + docker checks clean
PREFLIGHT_EXIT=0
```

### The host-dependence defect is empirically closed

This witness ran on **macOS**. The pre-repair gate reached its verdict there via
the `grep -E` fallback (no PCRE) and reported green, while on GNU grep it
reported red on the same tree (§2). The repaired single-path detector now
returns the **same verdict on both hosts**:

```text
GNU grep 3.11 / Linux container   dark-text gate ✅ EXIT 0
macOS main checkout               dark-text gate ✅ EXIT 0
```

Same tree, same answer, two greps. That is the defect this unit set out to
remove, demonstrated rather than argued.

### Deviation recorded

`git status --porcelain` was **not** empty before the switch. It reported one
pre-existing local modification unrelated to this lane:

```text
M docs/design/now-what/reconciliation/NOW_WHAT_MASTER_PROGRAMME.md
```

`git switch --detach` carried it across, so it was present in the working tree
during the run. The witness stands: that file is a design document under
`docs/design/`, outside every input any preflight step reads — the dark-text
guard's eight scoped directories, the UI-facing and application file sets, and
the compose config. It is noted rather than omitted, because "the checkout was
clean" would not be a true statement about this run.

```text
PROVE   PASS
```
