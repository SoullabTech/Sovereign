# Writer's Studio — Free Studio plan (2026-11-13)

**Standing:** plan `PROPOSED`; the §3 definition of "one active Work" is a founder ruling (TAKEN 2026-11-13). Docs only. ⛔ No code, no migration, no admission change, no deploy.
**Code read at:** canonical `deb062753f` (after #2261 dated beta grants merged).
**Lane:** Writer owner #1800 · release ledger #1938 (HOLD; Gate 4 "Free/Pro and individually approved beta grants").

## 1. Why now

The founder ruled on 2026-11-13 that when a beta tester's one-year grant ends, *"If they lose pro their pro writing
should be still available on free."* Today that is not true:

- An expired grant removes **Studio admission**, not only Pro. Studio admission and Pro are one decision
  (`admissionServer.ts` admits only `pilotEligible`), and every `/writers-studio` page and Studio API sits behind it
  (`restrictedCorridor.ts`, enforced in `proxy.ts`).
- The Works themselves stay reachable (manuscript reader `/press/manuscript`, `/api/sovereign/manuscripts/:id`,
  `/export`, `/chapters` are outside the Writer gate), but the Studio rooms close.

## 1a. The principle (founder, 2026-11-13)

**Pro unlocks capabilities. It never holds a writer's work hostage.** A Pro-to-Free change alters what a writer can
*do*, never what they *own*:
- every Work, manuscript, revision and saved piece stays intact and theirs;
- they keep writing, editing and saving on Free;
- **downloading or exporting their own writing never depends on Publish or on Pro** (export already sits outside the
  Writer gate: `/api/sovereign/manuscripts/:id/export`);
- upgrading again restores Pro without moving or rebuilding anything.

What Free vs Pro *includes* stays as ruled on 2026-11-02 (§2): today's develop, review and MAIA are in Free; Pro adds
more Works and each Pro capability as it ships (Publish, Listen, and any future advanced develop/review). A proposal
on 2026-11-13 to make review "basic" and develop "limited" on Free would reverse that ruling and needs a per-action
table first — **not adopted here**.

## 2. What already stands (recovered — this plan builds on it, it does not re-decide it)

The founder already ruled on a Free Writer's Studio on **2026-11-02**. Those rulings sat only on the unmerged branch
`chore/writers-studio-access-tier-census-20261102`; this PR brings them onto canonical unchanged
(`docs/programme/WRITERS-STUDIO_FREE_PRO_ACCESS_CENSUS_2026-11-02.md`, cherry-picked with `-x`):

- **"ADMIT FREE NOW"** (§6): ordinary signed-in members are admitted to Writer's Studio on a Free plan — after the
  Free/Pro boundary is enforced server-side; Pro-only features stay visible with a way to ask; Writer Pro testers
  become named, audited, revocable grants; payment out of scope; the paid plan renamed away from "Pro".
- **"ONE-WORK FREE"** (§6.2): **Free = the whole Studio as built today, on one active Work. Pro = more than one active
  Work, plus each Pro-only capability as it ships.** It authorizes four build steps, each its own reviewed change:
  1. one server-side active-Work check at Work creation/activation, refusing honestly and losing no data;
  2. admission of `plan: 'free'` in `admissionServer.ts`, built dark behind a server switch;
  3. a reachable plans surface (replacing the dead `/writers-studio/plans` link) with a request path, not a checkout;
  4. Writer Pro tester grants on the audited event-log pattern.

**Step 4 is now done:** #2261 (dated, audited one-year beta grants) merged as `deb062753f`.

With Free admission in place, an expired tester needs no special path: they are simply a Free member, keep the whole
Studio, and lose only what is Pro.

## 3. The one gap: "active Work" has no referent

- `living_works` (migration `20260801000001`) has no status, archive or active column, and its comment says a member
  may steward several Works.
- No Work-count limit exists anywhere in code.
- So "one active Work" must be defined before step 1 is built. Two competent implementers would differ.

**Question (one, of principle):** what does "one active Work" mean for a Free writer who already has more than one
— in particular an expired beta tester?

**⭐ Founder ruling TAKEN (2026-11-13, in session): *"Yes, new Works only"*.**

**Ruling — "Free limits new Works, never existing ones":**
- On Free, a writer may **start** a Work only while they hold none (the limit applies at creation).
- A writer who already holds several Works (e.g. a tester whose Pro ended) **keeps every one of them fully** — open,
  write, edit, develop, review, copy and export — exactly as before. Nothing is hidden, frozen or chosen-between.
- Starting an additional Work is what Pro adds.

Why: it is the founder's 2026-11-13 ruling made literal ("their pro writing should be still available on free"); it
needs exactly one enforcement point (Work creation), which step 1 already names; it never strands writing; and it
avoids inventing an "active/inactive" state the schema does not have.

Alternative (declined): add an `active` flag, let a Free writer keep one Work active and the rest read-and-export
only, with a way to switch. More honest to the word "active", but it introduces a new state, a switching rule and a
partly-frozen experience for the writers the founder asked to protect.

## 4. Build sequence (each step a separate PR, built dark, Class B)

| Step | Change | Switch / default | Done when |
|---|---|---|---|
| A | **Work-creation check** at every path that creates a `living_works` row: refuse a new Work on Free if the member already holds one; Pro (any active grant, holding, or `members.tier='pro'`) unlimited. Plain refusal copy with a way to ask for Pro. | `WS_FREE_WORK_LIMIT_ENABLED` (default off) | Tests: Free with 0 Works creates; Free with ≥1 refused, nothing written; Pro unlimited; an expired tester with 3 Works keeps all 3 and is refused only a 4th. |
| B | **Free admission** in `admissionServer.ts`: admit `plan:'free'` members to the corridor. | `WS_FREE_ADMISSION_ENABLED` (default off) | With it off, admission is byte-identical to today (proxy tests). With it on, a non-pilot member enters `/writers-studio`; Pro-only executors (`writing.wholeWork`, holdings) still refuse. |
| C | **Plans surface** at `/writers-studio/plans`: what Free includes, what Pro adds, how to ask. No checkout. | needs the plan-name ruling (still owed) | Experience Contract + desktop/mobile walk. |
| D | **Expiry walk** with fictional accounts: a tester with 2+ Works whose grant expires → enters the Studio on Free, opens, edits and exports every Work, sees Pro-only features described, is refused only a new Work. | — | Live walk through real routes (the reviewer's acceptance item 4). |

**Order matters:** A must land before B is switched on (the 2026-11-02 precondition: boundary enforced before
admission opens). Turning B on in production remains a deploy act for the Writer walk session, under #1938.

## 5. Not in this plan

- Payment, checkout or prices (out of scope by the 2026-11-02 ruling).
- The paid plan's member-facing name (still owed; blocks step C only).
- Expiry notice and 30/7-day reminders (separate, already listed under #2261's open items).
- Any change to `WRITER_INDEPENDENT_RELEASE_HOLDS`.
- Opening Free admission in production.
