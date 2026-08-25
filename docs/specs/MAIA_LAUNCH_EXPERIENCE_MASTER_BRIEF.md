# MAIA LAUNCH EXPERIENCE — MASTER BRIEF (MLX)

**Programme:** MLX — MAIA Launch Experience
**Status:** MLX-00 + MLX-01 complete. No production UI modified.
**Canonical:** `SoullabTech/Sovereign` · `clean-main-no-secrets` @ `950ea33429b5`
**Working head:** `5b26bdc` (`claude/maya-voice-input-disconnect-agkuba`) — canonical tip + 3 voice commits
**Evidence date:** 2026-08-25

> This is the single canonical programme record. Do not create a competing master brief.

---

## 0. EVIDENCE APERTURE FOR THIS PASS

Every claim below is sized to the instrument that produced it.

| Class | What it proves | Used for |
|---|---|---|
| **CODE** | An implementation exists at a named path on the bound SHA | The current-state map (§1) |
| **ABSENCE** | A targeted search returned zero matches in a named file | Stated explicitly, never as proof of runtime behavior |
| **DESK** | Third-party reporting on another product | The R&D matrix (§2) — secondary sources, not hands-on walkthroughs |

**Not yet gathered:** live production walkthrough, mobile/PWA observation, screenshots,
returning-member runtime state, analytics. **No runtime claim is made in this pass.**
MLX-00's "record desktop/mobile behavior" step is therefore *partially* complete — the
code path is mapped, the lived behavior is not. That gap is deliberate and is the first
item of MLX-02 scope (§9).

---

## 1. DELIVERABLE A — CURRENT MAIA THRESHOLD MAP

### 1.1 The actual route graph (CODE)

```text
soullab.life/                 app/page.tsx → components/landing/SoullabLanding.tsx
   │                          11 sections; MAIA is ONE of them
   ├── "Enter MAIA" ────────► /enter        app/enter/page.tsx (routing shim, 133 lines)
   │                             │           signout latch · redirect-once guard
   │                             ├── beta_user present ──► /maia
   │                             └── otherwise ──────────► /signin
   ├── "Work with Soullab" ──► scrolls to ContactSection (no route)
   └── MaiaSection CTA ─────► /signin        (a SECOND, different entry CTA)

/signin        components/auth/UnifiedAuth.tsx — unified signin+signup (2026-06-04)
   │           default action: EMAIL + ONE-TIME CODE
   │           biometric = return path · Google/Apple secondary · password = recovery
   ├── onboarded ────► /maia?ts=…      (UnifiedAuth.tsx:390)
   └── not onboarded ► /onboarding ──► /maia

/maia          app/maia/page.tsx (2,166 lines) — conversation IS the arrival surface
   └── one button at :1882 ──► /home   ← the ONLY inbound route to the House
```

### 1.2 The five structural findings

**F1 — There is no public MAIA landing.** Surface A does not exist. `app/page.tsx`
renders a Soullab *organization* page: Hero, Maia, Research, Narrative, Inquiry,
Portfolio, BookAnnouncement, Ask, PastSites, Covenant, Contact. The hero copy is
"Soullab · We build for the soul. · We study what carries transformation forward. ·
Technology should help you become more yourself, not more dependent on technology."

A stranger learns *an organization exists and has a philosophy*. They do not learn what
MAIA is, what to bring it, or what talking to it feels like. **MAIA appears first as a
button label.**

**F2 — The House exists, and it is behind the conversation.** `app/home/page.tsx`
(95 lines, `PortalThreshold`) is a real authenticated surface with server-side member
resolution. A repo-wide search for inbound routes to `/home` returns exactly one hit:
a button *inside* `/maia` at line 1882.

> The MLX thesis is `HOUSE → CONVERSATION`. The code is `CONVERSATION → HOUSE`.
> The architecture is not missing. **It is inverted.**

This is the single most consequential finding in this pass, because it converts most of
MLX-04 from "design a House" into "promote the House that exists and prove it carries
the load" — materially cheaper, and it satisfies §38 (reuse and reveal what exists).

**F3 — `/maia` has no recognition-before-invention layer.** (ABSENCE) A targeted search
of all 2,166 lines of `app/maia/page.tsx` for `suggest`, `Suggested`, `starter`,
`emptyState`, `firstTime`, `isFirstVisit`, and example-prompt patterns returned **zero
matches**. Authentication lands the member in a conversation surface with no doorways.
This is §1's governing problem, present in code.

**F4 — Two divergent entry CTAs.** The hero sends to `/enter` (a routing shim);
`MaiaSection` sends to `/signin` directly. Two front doors with different behavior —
`/enter` carries the signout latch and redirect-once guard, `/signin` does not.

**F5 — CLAUDE.md's documented onboarding flow is stale.** CLAUDE.md §"Onboarding Flow"
specifies `/begin → /intro-maia → /intro-daimon → /test-elemental → /faq → /onboarding
→ /maia`. On the bound SHA: `/begin` is **deprecated** and redirects to `/signin`
(deprecated 2026-05-16, per its own comment); `/intro-maia` and `/intro-daimon` **do not
exist as routes**. Any builder trusting that section would design against a flow that
was removed three months ago.

### 1.3 Live blocker discovered during this pass

**The front door is degraded right now.** `/signin`'s *default* action is email +
one-time code, and the email provider is refusing all sends
(`monthly_quota_exceeded`; `POST /api/members/email-code` → HTTP 502). Biometric
(returning devices only) and password (recovery) still work. **New members cannot
currently complete the default path.** Recorded here, not absorbed — it is an
auth/ops defect, out of MLX scope per §21, and it blocks any MLX usability testing
with new participants.

---

## 2. DELIVERABLE B — COMPETITOR EVIDENCE MATRIX (DESK)

Secondary sources only. No hands-on walkthroughs were performed.

| Product | Threshold mechanism | Transferable principle |
|---|---|---|
| **Pi** (Inflection) | Organizes the whole product around **six named modes**: untangling thoughts, getting things done, fueling curiosity, talking it out live, helping with a decision, having fun. First open → first message reported **under 30 seconds**. | A small closed set of *human states* — not features — can carry an entire product's IA. Directly validates §11. |
| **Rosebud** | Explicitly designed against the blank page: serves prompt sequences instead. After writing, AI generates 2–3 tailored follow-ups. Extensive onboarding quiz. | Prompts *after* the entry are as important as prompts before it. But the heavy quiz is a **cost** MAIA should not copy (§4.2 vs §5-B's 60–90s ceiling). |
| **Headspace Ebb** | Names the problem outright — "the first step can feel overwhelming" — and offers three graded entries: **talk out loud · guided prompts · simply check in**. Routes into a 5,000-item library via conversation. | "Simply check in" is a legitimate lowest-effort doorway. Conversation as *router into existing rooms* is exactly MAIA's unexploited advantage (F2). |
| **The Pattern** | Translates astrological data into **plain psychological language**. Never "Saturn transiting your natal Moon"; instead "a period of significant internal restructuring." Framework taught later via optional Astrology 101. | **The closest analogue to MAIA's elemental problem (§34).** Proof that a deep framework can run underneath while the member is met in ordinary language, with vocabulary offered as an *optional later layer*. |

---

## 3. DELIVERABLE C — TEN STRONGEST FINDINGS

1. **The House is inverted, not missing.** (F2) Reveal, don't rebuild.
2. **There is no public MAIA landing at all.** (F1) Surface A is net-new.
3. **`/maia` offers zero doorways.** (F3) The governing problem, confirmed in code.
4. **Pi proves the doorway model at scale.** Six modes; sub-30-second first message.
5. **The Pattern proves §34 is solvable.** Deep framework, plain language, optional vocabulary.
6. **Ebb legitimizes "I don't know."** "Simply check in" is a shipped, graded doorway.
7. **Rosebud warns against the onboarding quiz.** Personalization depth costs threshold speed.
8. **Two front doors with divergent guards.** (F4) Must converge before MLX-09.
9. **Canon drift is already misleading builders.** (F5) CLAUDE.md needs correcting.
10. **The default auth path is down.** Blocks usability testing before it blocks launch.

---

## 4. DELIVERABLE D — SOULLAB-SPECIFIC DESIGN PRINCIPLES

- **D1 — Reveal before you build.** F2 means MLX's first move is promotion of an existing surface. §38 made operational.
- **D2 — The doorway carries context into the conversation.** A doorway that only navigates is a menu. Per §5-D, MAIA must open already knowing which door was used.
- **D3 — Ordinary language on the surface, architecture underneath.** The Pattern's method, applied to Fire/Water/Earth/Air/Aether.
- **D4 — "I don't know" is a designed path, not a fallback.** Ebb ships it; it is MAIA's strongest differentiator because it is the case a blank box handles worst.
- **D5 — Orientation must not cost personalization time.** Rosebud's quiz is the anti-pattern against §5-B.
- **D6 — Continuity is claimed only where `AVAILABLE NOW`.** Per §12 and §6, and reinforced by the voice-continuity work: never state a guarantee the architecture cannot make.

---

## 5. DELIVERABLE E — RECOMMENDED PUBLIC MAIA ARCHITECTURE

A **dedicated `/maia` public route**, distinct from the Soullab org page. Do not
retrofit the org landing — it serves a different audience (collaborators, researchers,
practitioners) and F1 shows the two jobs are already tangled.

Sequence per §31, with one change: **the doorway list moves to position 2**, immediately
after the promise. The strongest evidence in this pass (Pi, Ebb, Rosebud all
independently) is that showing people *what others bring* is what converts comprehension
into action.

`soullab.life/` keeps its org role and links to the MAIA page. One CTA, resolving F4.

---

## 6. DELIVERABLE F — RECOMMENDED MAIA HOUSE ARCHITECTURE

**Promote `/home` (`PortalThreshold`) to the post-authentication destination.**
`UnifiedAuth.tsx:390` currently sends to `/maia`; it should send to `/home`, with
`/maia` reachable in one tap from there.

Load-bearing sequence, per §5-C: **Continue · Begin · Orient · Explore**.

Before any of this is authorized, MLX-02 must answer a question this pass could not:
**what does `PortalThreshold` actually render today, and can it carry Continue/Begin/
Orient/Explore without becoming the dashboard §4.5 forbids?** That is a code-and-runtime
question, not a design question.

---

## 7. DELIVERABLE G — FIRST-ARRIVAL ARCHITECTURE

`WELCOME → WHAT BRINGS YOU HERE? → DOORWAY → CONTEXTUAL MAIA OPENING`, under 90 seconds,
no quiz (D5). The doorway selection is passed into the conversation as context (D2), so
MAIA opens already oriented — never asking the member to restate what they just chose.

---

## 8. DELIVERABLE H — RETURNING-MEMBER ARCHITECTURE

Distinct from first arrival, per §6. Every proposed continuity surface must be
classified `AVAILABLE NOW` / `ARCHITECTED` / `REQUIRES FUTURE WORK` / `NOT APPROPRIATE`
**before** it appears in a wireframe. That classification is MLX-06 and has **not** been
done — this pass deliberately proposes no continuity content, because doing so would
manufacture exactly the unsupported memory claims §20 marks RED.

---

## 9. DELIVERABLE I — MOBILE IMPLICATIONS

**Not assessed.** No mobile or PWA observation was performed. Per §0, no claim is made.
§14 requires mobile be designed, not inherited — so this is a genuine gap that MLX-02
must open with, not a formality.

---

## 10. DELIVERABLE J — CONTRADICTIONS AND CAPABILITY GAPS

| # | Item | Class | Disposition |
|---|---|---|---|
| J1 | CLAUDE.md onboarding flow contradicts routes (F5) | Canon drift | Correct CLAUDE.md — separate unit |
| J2 | Two entry CTAs with divergent guards (F4) | Defect | Converge in MLX-09A |
| J3 | Email provider refusing all sends | Live P0 | **Out of MLX scope (§21).** Blocks MLX-08 |
| J4 | `PortalThreshold` contents unknown | Evidence gap | First item of MLX-02 |
| J5 | Mobile threshold unobserved | Evidence gap | MLX-02 |
| J6 | Continuity eligibility unclassified | Evidence gap | MLX-06, before any wireframe |

---

## 11. DELIVERABLE K — RECOMMENDED MLX-02 SCOPE

1. **Read `PortalThreshold` end to end.** Everything in §6 depends on it (J4).
2. **Observe the live threshold** on desktop and phone — the runtime half of MLX-00 (J5).
3. **Classify continuity eligibility** per §12 (J6).
4. **Resolve the doorway taxonomy** against §33's eleven-state test.
5. **Then, and only then**, freeze target IA for MLX-03/04.

**Do not begin implementation.** Per §37, the research confirming the hypothesis is not
authorization to build. The single largest change this pass makes to the programme is
F2 — and it *reduces* scope rather than expanding it.
