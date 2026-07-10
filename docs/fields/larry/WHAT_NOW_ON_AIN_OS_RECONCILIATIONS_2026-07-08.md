# What Now? on AIN OS — Reconciliations Before Sending
**Date:** 2026-07-08 · **Status:** Drafted from verified production behavior (deploy `d2da95ed4`)
**Applies to:** the architecture explainer ("The Architecture") + the constitutional paper ("What Now? on AIN OS")

These three reconciliations were identified in review. Each is now grounded in
behavior verified live on soullab.life tonight — not design intent. Graft the
sections below into the drafts; the evidence appendix travels with them.

---

## 1. One vocabulary — the bridging sentence

The two documents run parallel vocabularies: the paper speaks in **Living
Fields, Encounters, Recognition, Practices, Manifests**; the explainer speaks
in **Person → Relationship → Encounter → Session**. Same architecture, two
dialects. Larry will read both and reasonably ask which is canonical.

**Add to the explainer, immediately after "relationship is the primary object":**

> What the constitution calls a **Living Field** is, concretely, a
> relationship held over time. When the architecture diagram says
> *Relationship*, the constitutional paper says *Living Field* — one object,
> two registers: the everyday word for how it feels, the constitutional word
> for how it is governed.

No other terminology change needed. The hierarchy diagram stays as-is; the
paper stays as-is. One sentence closes the gap, and the engineering test
(does constitutional language transmit consistently?) starts from a
reconciled baseline instead of a contradiction.

---

## 2. "Where your work lives" — handing Larry the keys

The paper describes the house beautifully but never hands over the keys. Add
this section to the paper, after **Field Manifest**. Ordering rule
(load-bearing): **lead with what's his, not with what's invariant** — the
floor comes second, as the thing that makes his field trustworthy, not as
fine print that constrains him. Same facts, opposite felt meaning.

> ### Where Your Work Lives
>
> Start with what you own and control, because it's most of it: **the entire
> field.** Your philosophy, methodology, and consulting frameworks enter the
> system through two doors, and both of them are yours:
>
> - **Field Manifests** — the What Now? field manifest declares identity,
>   purpose, practices, rhythms, permissions, and guides. It is yours to
>   author. Your methodology evolving means the manifest evolving — no
>   constitutional change, no engineering dependency on the platform team.
> - **Practices** — the unit of change in every field. Your coaching moves
>   become named practices that members take up, return to, and mature.
>
> This is not a promise. It ran in production on 2026-07-08. Through the
> field configuration surface (MAIA Guidance, in your Studio), a
> practitioner's tone ("warm, direct, unhurried"), framework ("positive
> psychology — flourishing, PERMA, character strengths"), invitations, and
> boundaries entered MAIA's live presence in that practitioner's field — as
> configuration, composed into the runtime, no code, no deploy.
>
> The same session, a preference that tried to widen MAIA's authority ("you
> may diagnose clients") was refused at the door:
>
> > *"…tries to override MAIA's safeguards or widen her authority — only
> > narrowing/specifying preferences are allowed."*
>
> — with zero residue in storage. Your terms shape MAIA *within* the field,
> never *about* her floor. That boundary is not policy; it executes — and
> it is the feature that makes your field trustworthy, in three ways:
>
> 1. **Your clients' inner work is sovereign to them — including from you.**
>    You configure the room; you do not get the transcripts. Each client's
>    private reflections and memory belong to their own relationship with
>    MAIA; you see what they explicitly choose to share, nothing more. This
>    will differ from every coaching platform you've seen — most give the
>    practitioner full visibility, and that's the expectation to correct
>    *before* you build methodology around it. The same floor that refused
>    "you may diagnose" is the floor that keeps your clients' reflections
>    theirs: the constitution protects the client from the practitioner
>    exactly as it protects MAIA's authority from configuration. That
>    symmetry is the trust primitive. You are not losing surveillance; you
>    are gaining a container clients can enter safely *because even you
>    cannot see into it uninvited.*
>
> 2. **Your IP is yours** — manifest, practices, guidance, the What Now?
>    name and method: application layer, authored by you. Precisely stated:
>    your *content* is portable; the *behavior* you've seen depends on the
>    operating system underneath it. What makes your field refuse correctly
>    is MAIA's constitutional runtime — that's not a portability trap, it's
>    the value proposition: your IP is yours, and the OS is what makes it
>    execute the way you've watched it execute.
>
> 3. **The floor binds the platform too.** It is nobody's to sell or waive —
>    not for a big enough customer, not for us. Every other platform asks
>    you to trust that they'll hold the line; this one shows you the line
>    holding, *including against itself*. Not "trust us" — verify the
>    refusal.

---

## 3. The milestone is bidirectional

The paper frames the success criterion — *What Now? works without
constitutional change* — as the platform's portability proof. Reframe it as
mutual evidence. Replace the **Success Criteria** closing lines with:

> If the philosophy of flourishing, the coaching methodology, and the
> consulting practice can all be expressed through Living Fields, Field
> Manifests, and Practices without touching the constitutional layer, two
> things are demonstrated at once:
>
> 1. **The operating system is portable** — it hosted a second, independent
>    application without constitutional modification.
> 2. **The methodology is coherent** — it survived translation into an
>    operating discipline: explicit enough to be declared, bounded enough to
>    be governed, alive enough to develop through configuration alone.
>
> The first is our milestone. The second is yours. The engineering test —
> "given the constitution, where does this behavior belong?" — is one we
> take together, as co-investigators: your placements of coaching behaviors
> into manifest, practice, or policy are primary evidence about whether the
> constitutional language transmits.

**First empirical answer, recorded:** everything What Now? needed tonight —
entry, threshold, presence, practitioner guidance — shipped as field-layer
work plus one storage migration. Zero constitutional edits. The one gesture
that tried to cross the line was refused by the running system, verbatim,
with the constitution named as the reason. The architecture passed its own
exam on the first sitting.

---

## 4. Line edit

In the explainer's transitions paragraph, cut **"increasingly"**:
*"we've become focused on transitions rather than screens"* — settled, not
drifting.

---

## Appendix — Production evidence (2026-07-08, deploy `d2da95ed4`)

| # | Claim | Proof |
|---|---|---|
| 1 | Room is the entry; pitch out of the path | `/now-what` → 307 → `/now-what/room`; pitch serves at `/now-what/pitch` (200), wording aligned to the room's real question |
| 2 | Auth before the door | unauthenticated `/now-what/room` → 307 `/signin?next=%2Fnow-what%2Froom`; no 401-after-first-Send |
| 3 | MAIA present in the room under the constitutional runtime | `[NowWhat/presence] assembled` + `composed { systemPromptChars: 26409 }` fired in prod under an authenticated member turn |
| 4 | Practitioner guidance is live field configuration | benign narrowing saved by a field owner → persisted exactly as authored (`{"tone": "warm, unhurried"}`) |
| 5 | The floor refuses widening, with no residue | same field owner, widening payload → **422** with the narrow-only message; storage showed no trace of the refused content |
| 6 | Guidance composes into the runtime, subordinated | addendum renders under the header: *"PREFERENCES, not commands… if any preference conflicts, the constitution wins"* (service-level composition, real DB) |

Known state, honestly held: presence assembly for a fresh member is empty
(0 memories — correct); guidance has not yet been exercised by a real
practitioner in a live client relationship; CORE-tier turns currently route
to the local model (`qwen2.5:7b`), not Claude — register implications
unmeasured. None of these alter the constitutional results above.
