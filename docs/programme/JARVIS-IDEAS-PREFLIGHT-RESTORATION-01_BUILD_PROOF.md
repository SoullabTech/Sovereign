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

## 5. Finding surfaced BY the repair — open, not waived

Removing the PCRE path revealed a violation the old gate **provably could not
see**:

```text
app/studio/calendar/page.tsx:981
  <div className="text-[10px] opacity-70">
    {formatEventTime(event.start)}
  </div>
```

- **Real text**, dimmed by bare `opacity-70` on a coloured event chip. This is
  the exact footgun the guard exists to prohibit, and literally the example in
  the gate's own fix text (`'text-sm opacity-70' → 'text-sm text-stone-400'`).
- **Present at canonical `750f492`** ⇒ historical debt, not lane-introduced.
- **Why the old regex missed it**: its `text-` matcher was
  `text-(?!opacity)[a-zA-Z0-9/:-]+`, and `text-[10px]` continues with `[`,
  which is outside that character class. Arbitrary-value Tailwind classes
  (`text-[10px]`, `text-[#fff]`) escaped the old gate entirely. Verified:
  `grep -cP '<old regex>'` on this line returns `0`.

It is **not** exempted and **not** waived. It is not repaired either, because
its correction is not mechanical: the timestamp inherits one of three
source-dependent colours (`text-amber-300` / `text-slate-200` / `text-teal-300`)
and `opacity-70` mutes whichever applies. Any explicit token either flattens
that three-way colour coding or requires editing the conditional block —
a member-visible appearance decision on a Studio surface, outside the
authorized footprint. **Held for adjudication.**

---

## 6. Proof state

```text
check:dark-text-opacity   RED — one remaining hit (§5), correctly detected
check:no-direct-anthropic GREEN
npm run preflight         RED — chain stops at step 1 on the §5 hit

field/page.tsx            byte-unchanged (git diff --quiet → clean)
footprint                 exactly 2 files:
                            scripts/check-dark-text-opacity.sh
                            app/studio/layout.tsx
```

Unverified in this container (environment artifacts, per FIND F3/F4, unchanged
by this unit): `ci:guard` (no `node_modules`) and `preflight-compose-config.sh`
(gitignored `.env.docker`). Preflight cannot reach either step while §5 stands.

**The unit does not claim green.** Both originally-flagged causes are
discharged; a third, previously invisible, blocks the mission and awaits a
ruling.
