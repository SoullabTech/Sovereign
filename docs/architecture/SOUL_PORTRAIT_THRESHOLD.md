# Soul Portrait — The Threshold (closing design)

- **Date**: 2026-06-20
- **Status**: **DESIGN CAPTURE — not an authorization to build.** No code changed by this document. The only buildable-now slice is §6 (inert mode-aware closing copy), and only on Kelly's explicit go.
- **Origin**: Kelly, 2026-06-20 — *"You've discovered something more valuable than a label."* His words are preserved as draft copy below.
- **Companion docs**: [`SOUL_PORTRAIT_PATH_B_SPEC.md`](./SOUL_PORTRAIT_PATH_B_SPEC.md) (the gates several doorways require), [`SOUL_PORTRAIT_DEPLOY_POSTURE.md`](./SOUL_PORTRAIT_DEPLOY_POSTURE.md).

---

## 1. The shift: product → threshold

A Soul Portrait should not end with a logo or a "Sign up." It should end the way the portrait itself speaks — by **opening a door, not asking for a commitment**.

> Funnel: `Portrait → Sign up`
> Ecology: `Portrait → Wonder → many possible doorways`

**Why this is the sovereignty-correct form, not just the prettier one** (load-bearing): an *invitation preserves a permission*; a *funnel manufactures an obligation*. The threshold is the closing that obeys [[permission_over_obligation]] and the Sovereignty Invariants — it is the same gesture the Mentor makes (*hand the choice back; leave them freer, not more defined*). A wall of CTAs at the end of a deeply personal experience would be the exact engagement-capture the vows forbid. So the threshold is constitutionally consistent **only in its invitational form** — the moment it becomes recruitment, it violates the thing it's trying to honor.

## 2. Three movements — honor all three temperaments

The portrait awakens *wonder*; the response must honor the person's own movement, not a single prescribed next step:

- **Do** → **doorways** (participate): continue with MAIA, journal, create a portrait, offer one, explore relationships.
- **Understand** → **windows** (perspective): archetypes, elements, developmental stages, astrology, *Elemental Alchemy*, the Spiralogic philosophy.
- **Look until ready** → neither pushed: some people simply want to stand at the threshold a while. Designing for this is the sovereignty move — *meet readiness, don't manufacture it.*

A doorway invites participation; a window offers perspective. The platform should have both, and should never imply the door is the only option.

## 3. Mode-aware invitation (the relationship shapes the welcome)

The closing changes with `SoulPortrait.mode` — the relationship through which the portrait was offered (we already carry `mode` + `offeredBy`). Kelly's draft lines:

| Mode | Closing invitation (Kelly's words) |
|---|---|
| `self` | *Continue discovering yourself.* |
| `parent-child` | *Continue walking beside your child's becoming.* |
| `gift` | *If this portrait stirred something in you, your own journey is waiting.* |
| `legacy` | *(to author — a remembrance that opens forward, not a recruitment)* |

The point (Kelly): **Katie should not feel recruited into a platform. She should feel welcomed into a conversation that was always hers.** The gift variant invites *her own* journey — it never converts the gift into a lead.

## 4. Doorways & Windows — mapped to what actually exists

The landscape is beautiful; honesty requires naming that **most doorways lead to rooms that are unbuilt or deliberately gated.** A doorway that opens onto nothing breaks the invitation.

| Invitation | Kind | Build-state / gate |
|---|---|---|
| Continue / Enter MAIA | doorway | **Path B-gated for gift recipients.** Katie is a non-member, non-consented adult — auth + consent required (Path B §2). For an existing member it's a link; for a gift recipient it is the consent crossing. |
| Begin a living journal | doorway | **Not built as a portrait surface.** Requires auth + persistence + (eventually) memory binding — currently **out of scope**. |
| Create your own portrait | doorway | **Generator — "do not build yet"** (Kelly, standing). The doorway can exist as *interest*, not as a live creation flow. |
| Offer / share a portrait (Gift) | doorway | **Path B-gated** (Gift flow). No system-initiated send, ever. |
| Explore relationships / Relationship Portraits | doorway | **Not built.** New portrait kind; its own design + consent. |
| Archetypes · Elements · Developmental stages · Astrology | window | Informational. **Destination audit pending** — some routes may exist (`/astrology` is referenced), some not. Do not link until verified. |
| *Elemental Alchemy* (the book) | window | Exists as a published book (Soullab Press). **Web destination audit pending.** |
| The philosophy behind Spiralogic | window | Content — destination pending. |

**Implication:** windows (understanding) are the *safer, sooner* half — low-capture, mostly content, no consent surface. Doorways (participation) mostly wait on Path B, the generator decision, or unbuilt surfaces. A first threshold should lean on **windows + one honest doorway**, not a full board of live actions.

## 5. The "remembered welcome" — the crown jewel **and** the most gated

Kelly's most beautiful idea: a gift recipient enters MAIA and is met not by *"Hello, I see you have a Scorpio Sun"* (foreground performance) but by a **remembered welcome** — the portrait's symbolic architecture already present as *background coherence*:

> *Welcome. Your Soul Portrait is here whenever you'd like to revisit it. Today, though, I'm more interested in who you are becoming than who you have been described to be. Where would you like to begin?*

**This is the part that must be held, not built.** It collides directly with three things held all session and a core vow:

1. **No MAIA binding** (your standing constraint this whole build).
2. **No memory binding** (same).
3. **Consent for memory / no stealth memory** (Sanctuary vow). A welcome that *feels* remembered, built without the consent gate, would in fact be **stealth recognition** — the exact thing the platform vows against. Kelly already names the danger (*"not hidden personalization… background coherence not foreground performance"*) — that naming is the **design requirement once it's built**, not a license to build it now.

The portrait → member → MAIA-prompt binding is the **deferred thread** in our own notes. The remembered welcome is **Cat-1 preserved direction**: it arrives *through* Path B's consent + member↔portrait binding, never before it. Build the consent gate first; then this becomes a *remembered* welcome rather than a stealth one.

## 6. The one safe slice now (inert threshold)

The smallest honest expression of the whole insight — and the only part buildable without touching auth, MAIA, memory, or the generator — is the **closing threshold copy itself**: a mode-aware passage that ends the portrait as an open door, with **no functional CTA to a nonexistent or gated flow.** Pure invitation; MAIA *named*, not *wired*.

Draft (Kelly's words, his to revise — this is a literary genre; research-partner-before-coder):

> **Your story is still being written.**
> This portrait is not the final word about you. It is one companion offered at one moment in your life.
> If, someday, you wish to continue exploring your unfolding — through conversation, reflection, journaling, and the wisdom of the elements — you are welcome.
> **MAIA** — *a companion for the lifelong journey of becoming.*

…prefaced by the mode-aware line from §3. As **data** (`SoulPortrait.threshold?` or derived from `mode`), authored — not hardcoded in the renderer — so it remains the author's voice.

**What this slice does NOT include:** no button, no link to auth/MAIA/journal/generator, no live doorway, no remembered welcome. It is a *threshold*, not a *funnel*. Live doorways + windows get added only as their rooms are built and verified.

## 7. What this document does NOT authorize

- No generator. No MAIA binding. No memory binding. No remembered welcome.
- No live "Continue with MAIA" / journal / create / offer / relationships doorways.
- No commit, push, or deploy.
- No reopening the (now single-owner, settled) renderer until Kelly says go on §6.

## 8. Proposed sequencing

1. **Now (optional, on go):** §6 inert mode-aware threshold copy — content review first (it's your voice).
2. **Windows next:** audit which content destinations exist; add verified windows (understanding-first, low-capture).
3. **Doorways as rooms appear:** "Continue with MAIA" lands when Path B consent exists (its first real use *is* a gift recipient crossing the consent gate — a clean §IV proof for Path B).
4. **Remembered welcome last:** only after member↔portrait binding + consent. Then it is *remembered*, not stealth.

## 9. The governing principle (elevated) + renderer architecture (HELD, not now)

**Governing principle (Kelly, 2026-06-20 — above all the mode mechanics):**

> **The relationship changes the posture, never the person.**

The chart, the symbolism, the archetypes, the truth — none of them change. Only the *way the portrait is offered* changes. `mode` and `offeredBy` are **implementations** of this principle, not the principle itself; it is more durable than any single mode. (Already echoed at the `OfferedBy` type in `lib/soulPortrait/schema.ts` — *"shapes the voice and posture, never the truth or the symbolism"*; this is its canonical phrasing.)

**Future renderer architecture (HELD — explicitly not now, per Kelly):** as portrait kinds grow (Self · Gift · Parent · Legacy · Partner · …), one renderer accumulates `if gift / if parent / if mentorEnabled / if age` conditionals. The cleaner shape composes *relationship-specific* pieces around a *shared symbolic core*:

```
SoulPortraitRenderer
  ├─ RelationshipHeader    (per-mode framing)
  ├─ RelationshipOpening   (per-mode doorway)
  ├─ <shared symbolic core: chart · elements · archetypes · seer · stage · questions>
  └─ RelationshipClosing   (per-mode threshold)
```

Each mode contributes only its own relational framing; the symbolic core stays shared — the renderer itself embodying *identity is shared, relationship is contextual.* **Not to be built now.** Sequencing (Kelly): finish the current acceptance criteria → stop → read Katie *as a gift, not as a developer* → let lived intuition choose the next architectural step. The conditionals work fine for two modes; **earn the component abstraction from experience, not anticipation** — one instance proves possibility, two reveal the abstraction ([[earn-before-name]]).

## 10. Arrival & Welcome — the hospitality made literal (Kelly, 2026-06-20)

The medium embodies the message: if Soullab is hospitality, the first thing a person meets is **"Welcome"** — not "Loading," "Access Granted," "Your report is ready," or "Create an account." The whole arrival is *a house opening its door*, never a product converting a visitor.

**The progression (Katie is the first instance):**
- **Opening threshold** — *BUILT, no infrastructure.* A quiet page: her name, a short note that it was made for her, one button (*Open My Portrait*). This already IS the "Welcome." (`/soul-portrait/[slug]/welcome`.)
- **The portrait** — no nav, no account prompt, no "next." Just the gift. *Already ends as a finished gift* (vocation + framing) — there is no conversion CTA to remove.
- **Closing "Welcome to Soullab" room — PATH B, deferred.** A room (not a sales page) of quiet doorways — Continue with MAIA · Explore the Elements · Read *Elemental Alchemy* · Begin a Living Journal · Offer a Soul Portrait · Explore Relationships — ending in *"You're always welcome here."* (anti-scarcity, anti-countdown, leave-the-light-on). Its doorways lead to login/MAIA/memory/journal/unbuilt surfaces; it is the *platform-mediated continuation* a finished gift deliberately omits. It belongs to someone *choosing* to enter Soullab.

**The gift-vs-platform slice that needs NO Path B (BUILT 2026-06-20):** the distinction that matters is *gift vs. platform*, not *public vs. logged-in*. A finished Gift Portrait can RECOGNIZE an existing member (read a session if present — never require login, never bind) and offer ONE understated coda at the very end: *"Whenever you're ready, you're welcome back."* → **Return to Soullab** (`/maia`). A non-member sees nothing — the gift stays complete. Shipped for Katie: `components/soulPortrait/ReturnToSoullab.tsx`, mounted only when `portrait.offeredBy && <signed-in>`. Deliberately NOT done (still Path B): *"Welcome back, {name}"* (naming the viewer needs the binding to know they're the subject); *"now part of your journey"* (would claim a persistence that does not exist — dropped on honesty grounds); doorways, MAIA, journal, memory. **Recognition of an *existing* relationship is Path-B-free; *naming the person* and *continuation* are not.**

**Adaptive recognition (the rest — Path B):** same warm tone, only the mechanics change. Signed in → *"Welcome back, Katie…"* → *Continue Your Journey*; not signed in → *"Welcome, Katie…"* → *Enter Soullab*. The personalized form needs the member↔portrait binding (§2) + the MAIA/journal rooms.

**Many front doors (principle, platform-wide):** a person may arrive from a Soul Portrait, a MAIA conversation, *Elemental Alchemy*, a workshop, a friend, a therapist. The system never treats an arrival as a *conversion opportunity*; it treats every arrival — first visit or hundredth — as a **return to relationship**, and simply says *Welcome*. The non-capture stance ([[permission_over_obligation]]) made into the front door: *it doesn't persuade you to come back; it leaves the light on.*

---

*The portrait already ends by handing the reader back to their own life. The threshold simply makes that gesture a place they can stand — and, when the rooms are built and consented, a door they may choose to open. We build the door only after the room exists, and only the person opens it.*
