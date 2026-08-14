# Witness record — authenticated walk, 2026-08-14

```text
STEP .................. 2 of the authorized sequence (record and classify)
WALK STATUS ........... INCOMPLETE — stopped at the threshold
WRITER CANVAS ......... UNVERIFIED · additionally INSTALL-BLOCKED
MANUSCRIPT ROOM ....... UNVERIFIED — never reached
CONTRACTS INSTALLED ... NONE. Neither moved to docs/design/contracts/
GATE .................. NOT RUN (a partial walk is not a gate pass)
IMPLEMENTATION ........ NONE AUTHORIZED, NONE PERFORMED
NEXT .................. step 3, explicit ownership transfer — nothing past
                        step 2 is authorized for either lane
```

## Referent binding

| | |
|---|---|
| Contract referent under test | `09f50b4b2` (Manuscript Room corrections applied) |
| Runtime referent exercised | `a2cc2d90f` — identical code; the delta to `09f50b4b2` is docs-only, 0 non-docs files |
| Server | `writers-studio-contract-walk-a2cc2d90f`, port 3493, PID 95953 |
| Route walked | `/writers-studio` (Studio Home) |
| Auth | real member session through the UI; no bypass, no `x-member-id`, no fabricated `auth_sessions` row |
| Viewport | desktop (mobile 375×812 never run) |
| Date | 2026-08-14 |
| Production | untouched |

No credentials, cookies, session tokens, or member identifiers are recorded here.

## The witness — Kelly's words, verbatim

> "Bring Something In and Continue your work are hard to understand the UI/UX. When I click
> them nothing happens."

That is the observation. Everything below is verification of it, not a substitute for it.

## Verification — independently code-read at the referent

Each claim was checked against `app/writers-studio/page.tsx` at `a2cc2d90f`. All verified.

| Claim | Verified | Evidence |
|---|---|---|
| `Continue your work` only scrolls | ✅ | line 335 → `projectsRef.current?.scrollIntoView({behavior:'smooth',block:'start'})` |
| `Bring something in` only scrolls | ✅ | line 361 → `bringRef.current?.scrollIntoView(...)` |
| Targets are on the same page | ✅ | `<div ref={projectsRef}>` line 420 · `<div ref={bringRef}>` line 493 |
| Third tile has unrelated semantics | ✅ | line 327 → `setNewOpen(!showNew)` — local state toggle, not a scroll |
| `Continue your work` can be inert | ✅ | line 343 renders `aria-disabled="true"` div, not a control |
| Five "not yet" tiles | ✅ | exactly five — Image · Quote · Note · Recording · Link (lines 511–516), each `aria-disabled`, beside one live `Document` link |

**Consequence, stated mechanically:** `scrollIntoView` is a silent no-op when the target is
already within the viewport or the document is not tall enough to scroll. On a desktop viewport
with little content, both controls therefore produce **no perceptible state change** — which is
exactly what the member reported. The member's account and the mechanism agree; they are
conjunctive evidence, not one explaining away the other.

## Classification

**CONTRACT FAILURE — design/authority class.** Not environment, not stale referent, not
primarily an implementation defect.

Reasoning, and the diagnosis discipline required of a failed walk:

- **Not environment.** Disk pressure (1.5 GiB) was the standing environmental confound, and it
  is irrelevant here: the failure is a no-op scroll on a static surface, involving no write, no
  persistence, and no build cache.
- **Not stale referent.** Contract `09f50b4b2` and runtime `a2cc2d90f` were both bound before
  the walk and verified as code-identical.
- **Not implementation-first.** The controls do what they were written to do. The defect is that
  *threshold vocabulary was attached to non-threshold behavior* — a question of what the surface
  promises, which is contract territory, above the component.

**The decisive structural fact: the walk failed in a room that has no contract at all.**
Studio Home is the arrival surface for both contracted rooms, and neither contract governs it.
The walk never reached Writer Canvas or the Manuscript Room. The architecture specified the
rooms one eventually reaches while leaving the act of entering undesigned — so the first
authenticated walk stopped at the undesigned step.

## Founder ruling recorded from this witness

> A control using threshold language must produce a perceptible threshold action. If the
> intended action is merely revealing or scrolling to material already present on the same
> surface, it must not masquerade as a door. Door vocabulary requires door behavior.

This does not mandate a URL change — a drawer or reveal is legitimate — but the member must
perceive the state transition the affordance promises. A silent `scrollIntoView` fails it.

Founder's larger reading, recorded: *"Studio Home currently presents construction inventory as
orientation."* The five `not yet` tiles and the three visually equivalent but behaviorally
unrelated tiles are symptoms of one missing contract — the surface is organized around what the
software contains rather than what the writer is doing on arrival. This is the warehouse failure
mode named in `INHABITABLE_ARCHITECTURE`.

## Install blocker — Writer Canvas contract

⛔ **Do not install the Writer Canvas contract as drafted.** Verified in its frontmatter:

```yaml
surfaces:
  - app/writers-studio/page.tsx      # Studio Home — arrive · orient · choose
  - app/writers-studio/canvas/**     # Writer Canvas — inhabit and continue the Work
  - components/canvas/**
```

The contract body describes the Canvas while its `surfaces:` glob silently claims the doorway.
Installing it would bind a doorway to a contract written for a different room. Contract boundary
follows **human activity, not filesystem ancestry** — sharing a route tree is not sharing a room.

Governed scope, as ruled:

```text
WRITER'S STUDIO — the larger place
  Studio Home ...... arrive · orient · choose where to begin/continue
  Writer Canvas .... inhabit and continue the Work
  Manuscript Room .. work directly with the long-form manuscript instrument
  Press Editor ..... make an edition
```

## What this witness establishes — and does not

**Establishes:** on runtime `a2cc2d90f`, at desktop viewport, under real authentication, two
threshold-labelled controls on Studio Home produced no perceptible transition for the member;
the mechanism is a same-page `scrollIntoView`; the Writer Canvas contract's surface glob spans
two rooms.

**Does not establish:** anything about Writer Canvas behavior · anything about the Manuscript
Room · any mobile behavior · that the contracts' clauses hold or fail · prevalence across members
or viewports · that any remedy is correct. Neither contract may be installed on this evidence.

## Not done, deliberately

No control was repaired. No contract was split. No floor plan was reworked. No component was
mapped. No tab moved. No copy corrected. The programme ledger is untouched. Steps 3–8 await the
explicit ownership transfer that step 3 requires.

## Custody note

Both diagnoses reaching this record arrived by cross-session relay. Each was independently
verified against the repository at the named referent before being written down. **Cross-session
continuity supplied evidence and hypotheses; it did not supply authority.** The relays were
accurate; verification is what made them recordable.
