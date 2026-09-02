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
