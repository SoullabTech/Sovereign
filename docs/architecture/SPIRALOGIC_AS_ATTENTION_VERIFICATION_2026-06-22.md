# Spiralogic as Implicit Attention — Architectural Verification (2026-06-22)

**Read-only / report-only.** Verifies whether the existing architecture can support Spiralogic
**primarily as internal attention** rather than an explicit interpretive engine. Distinguishes
two surfaces the prior traces blurred: **prompt-side** (instructions *to* MAIA — internal) vs
**member-side** (text shown to the member — output).

## Verdict

**Confirmed, high confidence: the live architecture already embodies Spiralogic as internal
attention — estimated ~85–90% of live Spiralogic use is internal or gated.** The *"Spiralogic
is something MAIA tells the member"* assumption survives mainly in **dormant** code. The
redesign surface is small, and the highest-leverage change is a **framing** change (internal
detection → internal hypothesis), not a **surfacing** change.

Three independent enforcement layers already exist:
1. **Prompt framing** — the live `fieldIntelligence` block is labeled *"Reference Context… your
   response emerges from your own intelligence"* (`maiaService.ts:~889`). Element/phase are
   *sensing that informs choices*, not a relay.
2. **Instructional discipline** — *"use them internally unless the member uses that language"*
   (`ClaudeService`), *"sensed internally — never spoken"* (`elemental-presence-greetings`),
   *"ELEMENTAL CORRELATION (Internal Reference)"* (`presenceMode`), *"Your Internal Process"*
   (`spiralCore`), *"MAIA's Internal State"* (`ArchetypalConstellation`).
3. **Output enforcement** — `maiaService.ts:3464` strips internal markers before the response
   leaves the server; `scrubIdentityDisclaimers` is "the final safeguard."

## Map: internal attention → invited reflection → explicit teaching

| Surface | Current class | Member-requested? | Same benefit w/o exposing terms? | Assumes | Live? | Recommendation |
|---|---|---|---|---|---|---|
| `fieldIntelligence` "Field State / Phase detected" (Talk) | internal attention (labeled *Reference Context*) | n/a (internal) | **yes — already internal** | **think** | live | **Remain** — reframe internal wording (below) |
| `spiralSnapshotAddendum` / atlas facet/phase | internal attention (prompt addendum) | n/a | yes | think | live | Remain (same reframe) |
| `member_spiral_state` / `spiralOrientation` / `trajectory_focus` | internal / parked / orphaned | n/a | yes | think | per prior trace | Remain internal; multi-spiral wire feeds **attention**, not output |
| `elemental-presence-greetings` | internal attention (element → **tone**, "never spoken") | n/a | yes | think | live | Remain |
| `sacredMirror` MIRROR ("reflect what feels alive… no clinical language") | conversational reflection (feeling, not framework) | n/a | yes | think→reflect | live | Remain |
| `sacredMirror` MAP (name spiral/element/phase/facet **only if block present**, else *"don't guess"*) | gated reflection | yes (gated on data; blocks mostly empty) | partial | reflect-when-present | live | **Remain** — already the Mode 2/3 seam, correctly gated |
| strip / scrub layer (`maiaService:3464`) | output enforcement | n/a | yes | think (hard) | live | Remain (note: marker-targeted, not vocabulary-general) |
| soul portraits ("You are in the years of…") | explicit interpretation (declarative) | **YES — commissioned gift** | no (it *is* the framework rendered) | tell (**invited**) | member-facing | **Remain** — invited by nature (Mode 3) |
| `holoflower/facets-interpretation` ("You are in a state of beautiful balance…") | explicit interpretation (declarative) | member-initiated gesture | could soften | tell | **liveness uncertain** | **Optional / soften** — verify liveness; declaratives could become reflective |
| `maia-central-hub` ("figure out their phase", "journey field lighting up around {life_area}") | explicit interpretation / telling | no | yes | **tell** | **DORMANT** (only `maia-master-oracle`, itself dormant) | n/a — the "telling" assumption lives **here**, not on the live path |
| `chartIntegrationService` "element detected" excerpt | declarative label | journal context | yes | tell (minor) | member-facing journal | Optional / soften |

**Pattern (the week's signature, again):** the *"helps MAIA think"* assumption is what's **live**;
the *"tells the member"* assumption is what's **dormant** (`maia-central-hub`) or **invited**
(portraits, holoflower). The architecture already leans the way the hypothesis predicts.

## "Where does MAIA tell when it could ask?" (the literal pass)

- **At the member-output layer, MAIA already barely tells.** MIRROR reflects *feeling*; MAP is
  *gated*; greetings are *tone*; the field block is *internal*. The live spoken surface is
  already reflection/question, not developmental claim.
- **The real tell-vs-ask issue is internal, not external.** The field block is framed as
  *"Element detected / Phase detected / Detection confidence: 87%"* — an **assertion** to the
  model, not a hypothesis. Per the lens-not-filter restraint, the highest-leverage change is to
  reframe the *internal* sensing from conviction to hypothesis:
  > `Element detected: water (87%)` → `Possible elemental texture: water — hold as hypothesis; test against what they actually say.`
  This changes nothing the member sees; it changes how MAIA *holds* the read, preventing the
  lens from becoming a filter. It is the internal twin of *"Phase detected" → "Does this feel
  like a period of…?"*
- **The few member-output declaratives** (`holoflower` if live; chart excerpt) → soften to
  reflective form where not explicitly invited. Soul portraits **remain** (invited).

## Per-occurrence answers (Kelly's four questions, summarized)

1. **Class:** the live set is overwhelmingly *internal attention* + *gated reflection*; *explicit
   interpretation* is dormant or invited.
2. **Member requesting the framework?** Only the invited surfaces (portraits, MAP-when-asked,
   holoflower gesture). The live default does **not** assume a request — and does **not** surface.
3. **Benefit achievable without exposing terminology?** Yes, and it already is — element→tone,
   phase→conversational choice, all internal.
4. **Think vs tell?** The **live** implementation assumes *Spiralogic helps MAIA think*. The
   *tell-the-member* assumption is concentrated in **dormant** code.

## Honest residuals (not closed)

- `holoflower/facets-interpretation` liveness (importer grep inconclusive).
- Field-intelligence framing verified for **Talk/FAST**; Care/Scribe (Counsel/Scribe) modes may
  frame differently — a further per-mode check.
- The strip layer targets **markers**, not Spiralogic **vocabulary** — vocabulary discipline
  relies on the prompt instructions, not the strip. So the guarantee is instructional, not absolute.

## Bottom line

MAIA can embody Spiralogic before it explains Spiralogic — and largely already does. The work is
**not** a redesign; it is: (a) reframe the internal sensing from *detection* to *hypothesis*
(lens-not-filter), (b) gate or soften two or three member-output declaratives, (c) leave the
dormant *"telling"* surfaces dormant. Embodiment is the live default; explanation is already
behind invitation.
