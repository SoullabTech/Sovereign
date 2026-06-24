# Evening Portal — Concrete Spec (the first buildable piece of the Personal Portal)

- **Date**: 2026-06-14
- **Governed by**: `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`, Sanctuary Mode invariants (`CLAUDE.md`), `docs/canon/MAIA_ATTENTION_DOCTRINE.md`, claim-discipline
- **Parent**: `docs/specs/PERSONAL_PORTAL_CASE_STUDY_EVALUATION_2026-06-14.md` (North Star + Drift Register)
- **Status**: SPEC. Buildable. Not yet authorized. Author of the design: Kelly (2026-06-14); grounding + invariants: this pass.

---

## Why this is the first piece

The Evening Portal is where the Personal Portal "becomes tangible" — the proof-of-belief. Most apps optimize **arrival**; this optimizes **release**. It is also the *smallest net-new build that exercises the entire vision*, because it instantiates all four verbs of the product principle in a single flow.

## The product principle it serves (governing test)

> **The Personal Portal exists to help people notice, choose, and carry forward what matters while releasing what does not.**

Feature test: **Does this help a person notice, choose, carry forward, or release?** If not, it may be useful, but it does not belong at the center. The Evening Portal is the only surface that does all four.

## The asymmetry (load-bearing — do *not* build one reflection component for both)

Morning = **direction** (orientation). Evening = **meaning** (integration). Not symmetrical. Morning is the **Daily Anchor (Live)**. Evening is net-new. Reusing a single "reflection" component for both would flatten the asymmetry that is the whole point.

## Continuity, reframed (the Companion-tier thesis)

Continuity is **not memory accumulation** — it is **the continuity of a living record.** Most systems remember everything; very few help a person decide *what is worth remembering.* The Remember gesture (Layer 4) is that curation mechanism, and it is sovereignty-native: **the member marks; MAIA holds; the system never says "this was important."**

---

## The opening, four gestures, and the across-time echo (with substrate + status)

Kelly (2026-06-14) distinguishes **four evening gestures** — *Honor · Witness · Release · Remember* — framed by an **Exhale** (opening) and a **Continuity** echo. They are **peers, not a sequence**; the portal decides none of them, it only makes the space where they can happen. Each gesture also *chooses a keeping tier* — the member decides what happens to a share by choosing which gesture to express it through (**hybrid**, Kelly 2026-06-14):

- **Honor / Witness → Witnessed (tier 2):** a background continuity atom may form, like normal conversation — remembered, not marked.
- **Release → Released (tier 1):** kept nowhere.
- **Remember → Marked (tier 3):** member-declared significance.

**Governing principle (Kelly, canon-candidate): _atom formation is continuity; significance is sovereignty_** — MAIA may remember what was shared; it may not declare what matters. (Four-verb map: Honor + Witness → notice; Remember → choose + carry forward; Release → release; Continuity → carry forward across time.)

### Exhale (opening)  · `NEW · trivial · UI/copy only`
Slows the nervous system before asking anything: *"Take a breath. The day is ending. What remains with you?"* No backend, no required input — a member may breathe and leave (zero-input floor).

### Honor  · `Witnessed (tier 2) · gratitude / acknowledgment`
*What mattered today? What deserves gratitude? What deserves acknowledgment?* The appreciative gesture — distinct from Witness: **Honor values; Witness registers.** Optional. Like normal conversation, an Honor entry **may form a background continuity atom (tier 2)** — remembered, but **not marked** as significant unless the member elevates it via Remember. No **"gratitude streak"** (Drift #1).

### Witness  · `Witnessed (tier 2) · reuses Quick Journal grammar`
*What happened to me? What did I learn? What touched me?* No obligation to answer all, or any. Like normal conversation, a Witness entry **may form a background continuity atom (tier 2)** — MAIA can remember the lived thread, but does **not** declare it significant. The member's later **Remember** is what says "carry this forward." *Rationale (Kelly): if Witness left no trace the Evening Portal would feel oddly less alive than normal conversation; if Witness auto-marked significance it would be too interpretive — the background atom is the middle path.* (Substrate: the existing atom-formation path — Live.)

### Release  · `NEW · the defining gesture · SANCTUARY-CLASS`
> *"What am I ready to set down? What no longer needs to be carried?"* — **Not stored. Not analyzed. Not surfaced later. Released.**

The radical departure from save-everything, and the daily-scale expression of **Sanctuary Mode** (an *absolute* boundary in this codebase, not a preference).

**Design (per Phase 0 audit — `EVENING_PORTAL_RELEASE_AUDIT_2026-06-14.md`): content is never transmitted** — the strongest form, and the audit confirms it is achievable:
- The release text lives **only in the browser**, is shown, then **discarded on submit**. The server receives at most `release_event: true` + timestamp — **never the content** (mirrors Sanctuary's "log that it occurred, never content").
- MAIA's acknowledgment is **content-free** ("Take a breath. That's set down now.") — *the refusal to read it is the feature*, more trustworthy than a personalized reply.
- Release must **not**: flow through `getMaiaResponse`'s writeback tail (`maiaService.ts:2867–3429`); touch `OracleConversation`'s `messages`/localStorage (`OracleConversation.tsx:2949`); parameterize the text into any DB query (`postgres.ts:72` logs params on error); run the forward-readiness/preview logs (`route.ts:897,638,489`).
- **If end-to-end non-persistence cannot be guaranteed, the gesture does not ship.** Mandatory `security-auditor` pass on the non-persistence path. *Do not naively reuse the existing Sanctuary path — the audit found it currently leaks into `maia_turns` + `expansion_events`; fix those first.*

### Remember  · `tier 3 — Marked · the Keep gesture`
> *"What do I want carried forward? What belongs in the living record of my life?"* — the member explicitly chooses.

The chosen moment is promoted to a **marked** atom — flagged **`is_breakthrough`** (member-declared significance). Remember is the only gesture that **marks** (tier 3); Honor / Witness form *background* atoms (tier 2) automatically, but only Remember elevates to significance. The label is **member-selected or member-written, never inferred** (e.g. gratitude / courage / insight / beauty / synchronicity / relationship / creative-spark). (Substrate: Keep/Capture + atoms + `is_breakthrough` — all Live, Cat 6.)

**Asymmetry guard (Kelly — the first crack to watch at build time):** the temptation will be to make Remember *easier* by having MAIA suggest what to remember. That feels helpful and is the first breach of the witnessing/authority boundary. MAIA may **open** the gesture — *"is there anything from today you want remembered?"* — but may **never propose the content** — *"would you like me to remember this insight?"* The second names "this insight" as significant; significance is the member's. **MAIA opens the gesture; it never nominates the content.** (This is the Witnessing Rule applied to questions: an invitation, never a nomination.)

### Continuity (across-time echo)  · `LIVE substrate · verbatim echo only`
> *"Three days ago you marked courage. Tonight you marked trust."*

Reads back prior **member-authored** marks. **STRUCTURAL GUARD — where the denominator and classifier drifts live (Drift Register #1, #2):**
- **Verbatim echo only** — replay the member's own labels + timestamps. No paraphrase, no theme-naming.
- **No aggregation, no denominator** — never "you've marked courage 3 times," never a streak, never "this week."
- **No interpretation** — never "you seem to be working on trust." Witnessing, not psychoanalysis.
- Max 1–2 items, factual, gentle. (Substrate: atoms loader, Live.)

---

## Relationship Field = the same interaction model, pointed at a transcript

A relationship-transcript review **is** the Evening Portal applied to a conversation: *What mattered? / What did I learn? / What do I want remembered?* — Release and Remember work identically; there is **no layer about the other person.** One interaction model, two contexts. This is *why* the third-party-consent boundary holds structurally: **the model has nowhere to put the other person.**

## Data flow (one surface, four outcomes)

```
Honor / Witness  →  background continuity atom may form (tier 2 — remembered, NOT marked) — existing atom path
Release          →  kept nowhere (tier 1 — never transmitted; server gets only release_event + timestamp)
Remember         →  marked atom (tier 3 — member-declared significance; optional is_breakthrough)
Continuity       →  read last 1–2 member-MARKED (tier 3) atoms (verbatim label + date)
```

## What's Live vs New (claim-disciplined)

- **Live substrate:** Remember (atoms + `is_breakthrough`), Continuity (atoms loader), and the morning counterpart (Daily Anchor).
- **New & trivial:** Exhale, Witness UI.
- **New & delicate (the one real engineering task):** the Release non-persistence path.

→ A **small build over mostly-Live substrate**, whose only hard part is the part that proves the belief.

## The exit is the product

The Evening Portal closes by handing the person back to their evening, lighter — **not** "see you tomorrow." A clean close is the Sovereignty Invariant in felt form: no streak to maintain, no hook, no reason to return except that the person chooses to.

## Drift gates (from the North Star Drift Register — set *before* build)

1. **No denominator anywhere** (#1) — no counts, streaks, "this week," completion.
2. **Release persists nothing** (#4 + Sanctuary) — security-auditor pass on the non-persistence path.
3. **Continuity = verbatim echo, no inference** (#4) — member labels only.
4. **One foreground per layer; fully optional** (#3 + zero-input floor).
5. **Build from journal / focus-tool grammar, never the `studio_tasks` board** (#2).

## Build sequence (gated)

1. **Scope the Release path first** — it is the gating risk; if non-persistence can't be guaranteed, the design changes. Prototype + security-auditor review before anything else.
2. Exhale + Witness UI (transient, no writes).
3. Remember → atom (member-marked) over the Live Keep/Capture substrate.
4. Continuity (verbatim read of last 1–2 marked atoms).
5. Wire as the first member-reachable surface of the Personal Portal (depends on the access-architecture decision, eval §12.1).
6. Verify each layer against its drift gate before the next.
