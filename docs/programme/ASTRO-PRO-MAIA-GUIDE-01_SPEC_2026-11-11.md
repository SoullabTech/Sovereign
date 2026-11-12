# ASTRO-PRO-04 · MAIA-GUIDE-R1 — Astrology Pro MAIA guidance specification

```text
Class: C for this packet (documents only). The implementation it specifies is at least
       Class A-adjacent: it changes what MAIA is told inside Astrology and adds a
       chartless entry. That lane must classify itself when it opens.
Governing authority: founder direction affirmed 2026-11-11 (R1–R6, recorded in §1),
       under ASTRO-PRO-04 #1893 and continuity #1982; R4F #1817, R20 #1793 and
       security #1983 stay authoritative where they speak.
Current gate: SPEC — is this guide specification complete and source-exact enough
       to admit a build lane?
Evidence subject: canonical `clean-main-no-secrets` @ 20ce7334e5 (code read only).
       Not production, not a walk, not a device.
Stop boundary: no production code, no prompt change, no migration, no deploy, no
       access-phase or grant change, no security/R20/release self-approval.
```

**Parent flow:** ASTRO-PRO-04 (#1893).
**Reason opened:** a founder-pasted review ("MAIA × Astrology Pro — Knowledge and
Guidance Plan", 2026-11-11), which the founder called true, found that MAIA can read a
Pro chart's facts but has no source-checked knowledge of the product itself.
**Base:** `20ce7334e5` (contains #2200 cockpit, #2213 beta candidate, #2228 cockpit fixes).
**Standing:** restricted production beta (phase `tester-grant`, nine audited grants,
#1893 comments 2026-11-11 02:58Z and 03:14Z). Public release not authorized.

Companion documents in this packet:

- [Control census](ASTRO-PRO-MAIA-GUIDE-01_CONTROL_CENSUS_2026-11-11.md): every
  member-visible control, source-pinned.
- [Evaluation question set](ASTRO-PRO-MAIA-GUIDE-01_EVAL_QUESTIONS_2026-11-11.md).

Pattern reused: Writer's Studio guide, PR #2235 (`feature/ws-studio-guide-whole-studio-20261111`
@ `39590053d5`, **unmerged**): `lib/writersStudio/studioGuide.ts` and
`lib/writersStudio/__tests__/studioGuide.test.ts`. Read from that branch, not canonical.

---

## 0. Gate question

Can MAIA be told, from released source and nothing else, what Astrology (Free and Pro)
offers, where each control is, and what each member may use — so that she explains
and points but never invents a control, never implies public availability, never acts
for the member, and never carries chart or memory material across a boundary that is
held?

This packet answers *what she would be told and how that is proven*. It does not build it.

## 1. Founder direction recorded (affirmed 2026-11-11, not re-litigated here)

| # | Direction | What it binds in this spec |
|---|---|---|
| R1 | MAIA explains the product to Free and Pro members; Free never gets restricted client-chart access. | §5 permission matrix; guide slices per entitlement. |
| R2 | A distinct chartless Help entry. | §4 route H1. |
| R3 | Teach several traditions with their disagreements named; MAIA is never the final authority. | §6 Mentor map. |
| R4 | Explanation and exact navigation only; MAIA never acts on the member's behalf. | Guide stance; no action markers (unlike Studio's `show:*`). |
| R5 | Released UI is the truth; guard tests fail when labels change; no roadmap promises. | §7 guard design; "not available" list is generated, never promised. |
| R6 | Product help needs no chart or memory transfer; Pro chats stay visit-bound; own-chart memory is opt-in; R4F intact. | §4 H1 carries no chart, no memory; §5 rows. |

These are the founder's affirmed **direction**. They do not, by themselves, authorize
the build lane, a prompt change, or a release.

## 2. What is true today (code read at `20ce7334e5`)

### 2.1 Access, as the code decides it

| Surface | Gate | Source |
|---|---|---|
| Free Astrology room pages (`/astrology`, `/astrology/**` except Pro) | **Tester-only.** Proxy returns a hard 404 unless the verified member has `members.tester = true` (ASTRO-FREE-TESTERS-ONLY, founder admission 2026-10-30). | `lib/astrology/testerGate.ts`, `proxy.ts:437` |
| Astrology Pro (`/astrology/pro-preview`, `/api/astrology/pro/*`) | `ASTRO_PRO_PREVIEW_ENABLED=true`, phase `founder-only` or `tester-grant`, valid founder UUID. In `tester-grant`: founder, or a member whose latest audited event is a grant. Tier, subscription, tester flag never admit. Lookup failure admits no one. | `lib/astrology/proAccess.ts` |
| Shared client chart (`/shared-chart/<token>`) | Public, no account, live link only, Pro enabled. | `config/accessMatrix.ts:672–674` |
| Public doorway `/explore/astrology-pro` | Public marketing page, status "Development preview". | `lib/launch/publicDoorwaysP0.ts:48` |
| Identity-free calculators (`/api/astrology/birth-chart`, `current-transits`, `vedic/list`) | Public. | `config/accessMatrix.ts:647–649` |

> ⚠️ **Consequence for R1.** "Free Astrology" is not open to every member today: it is
> tester-only. A guide that tells a non-tester "open Astrology → …" would send them to a
> 404. The guide therefore needs **three** entitlement slices, not two: *no Astrology
> room* · *Free (tester)* · *Pro (granted)*. See D-02.

### 2.2 What MAIA receives today

| Path | What reaches MAIA | Product knowledge? | Source |
|---|---|---|---|
| Pro Ask (`POST /api/astrology/pro/ask`, mode `ask`) | Server-recalculated facts for one section (`natal`, `transits`, `biwheel`, `composite`, `four-pillars`, `progressed`, `vedic`, `mayan`, `deep`); a fixed **view phrase** from `PRO_ASK_VIEWS`; an optional selected body checked against the chart; up to 8 earlier turns of the visit from the page. Never a name, birth date, time or place. Nothing stored; log says only "answered". | **None.** She knows which view is open, not what the product's controls are. | `app/api/astrology/pro/ask/route.ts`; `lib/astrology/proAskMaiaSections.ts:201–218, 240–283` |
| Pro Mentor (same route, `mode: 'mentor'`) | Same facts, used "only as a worked example"; told to teach what a technique is, how it is calculated, how schools differ. | None. **Requires an open chart** (the route requires `subject`; the dock hides Ask/Mentor without one). | `proAskMaiaSections.ts:256–258`; `ProMaiaDock.tsx:58–64` |
| Pro "Read this with what you know about me" (`personal: true`) | Own chart only, plus kept memory atoms under each atom's return consent. Refused (`personal_own_chart_only`) for a saved/second chart or deep reading. | None. | `route.ts:132–135, 220–227` |
| Pro views MAIA is told are open **without their figures** (`sees: false`) | `chart-views`, `house-wheel`, `ephemeris`, `astro-map`, `vedic`. She is told to say plainly what she cannot see. `astro-map` says relocation is unknown (#2228). | — | `proAskMaiaSections.ts:205–211, 254` |
| Shared client chart Ask (`/api/shared-chart/<token>/ask`) | Owner-enabled per link; 40 questions per link; one question, no history; chart text and today's transits; the **client's first name** and the "offered by" name (census O-6); no birth details; nothing stored but the counter. | None. | `app/api/shared-chart/[token]/ask/route.ts:92`; `lib/astrology/proAskMaia.ts:53–56` |
| Free Astrology rooms | **No MAIA route at all** on `/astrology`. Reflections are kept without a model call; Chinese discussion is hard-off (451). | — | census §B |
| Main MAIA conversation (`/api/oracle/conversation`) | The **member's own** birth chart summary and current transits when they have birth data (`getAstrologyContextForUser`); an astrology handoff card can be offered (`detectAstrologyHandoff`). No Pro chart, no client chart. | None. | `app/api/oracle/conversation/route.ts:948–968`; `lib/astrology/astrologyHandoff.ts` |
| Knowledge Field (`lib/maia/knowledge/knowledgeField.ts`) | 12 domains (Jungian, Spiralogic, ritual/symbolic, …). **No astrology domain and no product knowledge.** Injected in main-chat Ask mode or on domain signal; the `knowledgeFieldLayer` flag defaults off. Tradition-specific concepts are `queryable: false` until a tradition gate exists ("cf. the astrologer gate"). | None. | `knowledgeField.ts:42–52, 295–305`; `lib/utils/feature-flags.ts:62` |
| Static teaching in Pro Study → Techniques | Nine lessons (`TECHNIQUE_LESSONS`); rendered for the astrologer, **not** given to MAIA. Three lessons name panel headings as paths ("Astro map & relocation → Draw astro map", "Aspect grid & declinations → Declinations", "Chart points & views → Harmonic"). | Partial, and not MAIA's. | `lib/astrology/proTechniqueLessons.ts:31, 147, 166` |

**What she lacks** (the review's finding, confirmed):

1. Any list of the nine tools, their tabs and their controls.
2. Any way to answer before a chart is open. The dock's empty state reads: *"Open a
   chart and MAIA can read it with you. Until then there is nothing for MAIA to see."*
   (`ProMaiaDock.tsx:67–70`). Mentor is hidden then too.
3. Any knowledge of Free Astrology's rooms, of sharing with a client, or of what Free vs
   Pro vs a client link may do.
4. Any statement of availability (restricted beta, not public).
5. Any knowledge in main MAIA chat of how Astrology works, beyond the member's own chart.

## 3. Guide content model (to be built in a later lane)

Proposed module: `lib/astrology/proGuide.ts` (name to be confirmed by the build lane),
shaped after `studioGuide.ts`:

```ts
type AstroSurface = 'free' | 'pro' | 'client-link' | 'everywhere';
type AstroControl = {
  label: string;          // exactly as shown; guard-tested against live UI source
  surface: AstroSurface;
  tool?: ProToolId;       // 'chart' | 'timing' | … | 'saved' — generated from the rail
  tab?: string;           // exact tab label
  where: string;          // e.g. "Places → Astro map"
  does: string;           // what it does, conditions included
  needsChart?: true;      // hidden or empty with no chart open
  ownChartOnly?: true;    // e.g. "Read this with what you know about me"
  clientChartNever?: true;
  phoneDiffers?: string;  // what changes at phone width
  maiaSees?: boolean;     // mirrors PRO_ASK_VIEWS[view].sees where a view exists
};
```

**Generated wherever a registry exists, so it cannot drift** (R5):

| Generated item | Registry it must come from | Today |
|---|---|---|
| The nine tools and their tabs | The `tools: Tool[]` array in `ProAstrologyExperience.tsx:607–672` | **Inline in the component, not exported.** The build lane must lift it (labels, ids, views, `withoutChart`) into an importable constant without behaviour change, or the guide must parse it. See D-04. |
| What MAIA can and cannot see per view | `PRO_ASK_VIEWS` | Exported. |
| Ask sections | `PRO_ASK_SECTIONS` | Exported. |
| Technique lessons (Study) | `TECHNIQUE_LESSONS` | Exported. |
| Access phase / beta wording | `proAccess.ts` phases + runtime env | Read at runtime, as Studio's `studioRuntime()` reads its switches. |
| "Not available" list | **No registry exists.** | Must be a hand-kept list of *released absences* only (e.g. "no billing", "no public sign-up", "no chart transfer to main MAIA"), each guard-checked to remain absent. Never a roadmap. |

**Guide stance** (fixed text, guard-pinned):

1. Explain and point; never act (R4). She names the control and the path; she does not
   open, calculate, save, share or delete anything. Unlike Studio, **no acting markers**.
2. Name only controls in this guide; if asked about one that is not here, say it is not
   in Astrology as released.
3. Availability: Pro is a restricted beta by invitation; never imply anyone can sign up,
   buy, or will receive it (R5, `MARKETING_CLAIM_DISCIPLINE.md`).
4. Never ask for, repeat or infer a client's name or birth details; never describe one
   member's chart or client to another.
5. Traditions are named and kept distinct; their disagreements are stated; she is not the
   authority (R3).
6. Where she is told a view is open without its figures, she says she cannot see them.

## 4. Where the guide could reach MAIA — route by route

| # | Route / entry | Today | Proposed guide slice | Chart? | Memory? | Gate needed |
|---|---|---|---|---|---|---|
| **H1** | **New chartless "How do I…?" entry in the Pro MAIA stage** — appears in the dock's empty state (`ProMaiaDock.tsx:66–71`) and as a third mode beside Ask/Mentor when a chart is open. Calls a **new** endpoint (e.g. `POST /api/astrology/pro/help`) that takes only `{ question, history? }` — no `subject`, no `personal`, no `view`. | Does not exist. | Pro + Free + client-link guide, Pro stance. | **None, by construction** (the endpoint must reject `subject`). | **None.** | New route → access-matrix row (D-05), handler Pro check, Class review. |
| H2 | Existing Pro Ask (`mode: 'ask'`) | Facts + view phrase. | Add a **thin slice**: the open tool's own controls only (≈ the Studio per-room trimming question). | Unchanged. | Unchanged (own-chart opt-in). | Prompt change to an accepted pathway → founder acceptance. |
| H3 | Existing Pro Mentor | Teaches with chart as example. | Add the technique→tool map (§6) so "teach me progressions" ends with "then Timing → Progressions". | Unchanged. | No. | Same as H2. |
| H4 | Free Astrology rooms (tester-only) | **No MAIA entry exists** in any Free room. (The handoff card runs the other way: main chat → `/journey`.) Building H4 means adding the first MAIA call to a Free room. | Free slice only. Never names Pro controls as available to the member. | Own chart only (already the main-chat contract). | Main-chat rules. | Free-room experience contracts; tester gate unchanged. |
| H5 | Main MAIA chat (`/api/oracle/conversation`) | Own-chart astrology context; no product knowledge. | **Not proposed by default.** Same reasoning as #2235's proposal: adding it changes every member's prompt. Narrow alternative: only when the member arrived from an Astrology "Ask MAIA" handoff, and only the slice their entitlement allows. | No new chart material. | — | Founder ruling (D-06); R4F untouched because nothing flows chart→chat. |
| H6 | Shared client chart Ask | Owner-enabled, per-link allowance. | **None.** A client is not a Soullab member and needs no product guide; adding one would spend the owner's allowance on product questions. | — | — | Recommend: out of scope. |

**H1 is the R2 deliverable.** Its privacy property is structural: the endpoint has no
field that can carry a chart, a name or memory, and its tests must prove that a request
containing `subject`, `other`, `personal`, `view`, `point` or `lifeContext` is refused
(`unexpected_field`), the same strict-keys discipline the Ask route already uses
(`route.ts:62, 79`).

## 5. Permissions matrix

| Capability | No Astrology access | Free (tester) | Pro granted (incl. founder) | Client with a link |
|---|---|---|---|---|
| H1 product help ("How do I…?") | Not reachable (no room). Main chat answers: Astrology is in testing; no path given. | Free slice, via H4 when built. | Full guide. | — |
| Learn what Pro is | Doorway copy only ("Development preview"). | Same; never "upgrade" or "buy". | Yes. | — |
| Ask about own chart (Pro) | — | — | Yes. | — |
| Own chart **with kept memory** | — | — | Yes, opt-in per conversation, own chart only. | — |
| Ask about a saved client chart | — | **Never** (R1). | Yes, facts only, no names, no memory. | — |
| Client chart with personal memory | — | — | **Refused** (`personal_own_chart_only`). | — |
| Mentor | — | — | Yes, needs an open chart today; H1 covers teaching without one. | — |
| Ask about the shared chart | — | — | (owner sets allowance) | Yes, within the owner's allowance, nothing stored. |
| Transfer a chart into main MAIA | **Held (R4F #1817)** for everyone. | Held. | Held. | Held. |
| MAIA acts (save, share, delete, calculate) | Never (R4). | Never. | Never. | Never. |
| Expired / revoked access | — | Tester flag removed → room 404s; guide must not promise return. | Grant revoked or phase back to `founder-only` → Pro gone; guide must say "you no longer have Pro access" only if the server told her, else say nothing about status. | Expired/turned-off link copy (census §C). |

## 6. Mentor teaching map (R3)

The guide adds, per technique, *which tool to open* and *which traditions disagree*.
Western (tropical), Jyotisha (sidereal, ayanamsa named), Chinese (Four Pillars / BaZi,
Da Yun) and Maya (traditional count; Dreamspell named as modern and separate) stay
distinct. Source anchors already in canonical:

| Technique | Pro location (exact labels, census) | Distinctness rule already in source |
|---|---|---|
| Secondary progressions | Timing → Progressions | `TECHNIQUE_LESSONS['progressions']` boundary: symbolic timing, not a present-sky event |
| Transits | Timing → Transits | lesson `transits` |
| Returns | Timing → Progressions → "Chart": "Solar return" … "Saturn return" (`ProDerivedPanel.tsx`) | lesson `returns` |
| Synastry / composite | Relationships → Two charts | lesson `comparison`; composite is not synastry |
| Astrocartography / relocation | Places → Astro map | lesson `astrocartography`; relocation not assumed (#2228) |
| Declination / out-of-bounds | Chart → Aspects | lesson `declination` |
| Harmonics / sidereal | Chart → Views | lesson `harmonics` |
| Vedic: nakshatras, Vimshottari, ayanamsa | Traditions → Vedic · Chinese · Mayan | `SECTION_FOCUS.vedic` |
| Chinese Four Pillars, Da Yun, day start | Traditions → Vedic · Chinese · Mayan | `fourPillarsFacts`, `dayStart` midnight / zi-hour |
| Maya traditional count vs Dreamspell | Traditions → Vedic · Chinese · Mayan | prompt: meanings of days belong to living daykeepers; Dreamspell is modern (`proAskMaiaSections.ts:274`) |

## 7. Guard tests (design)

Modelled on `studioGuide.test.ts` (#2235). All deterministic, all in `npm test`.

1. **Every label is live.** Each `AstroControl.label` appears in the live UI source of
   its surface (`app/astrology/pro-preview/**` for Pro; Free room tree for Free;
   `app/shared-chart/**` for client), after normalising `&amp;` → `&`, with tests,
   fixtures, `page-old.tsx`, `page-archetypal-backup.tsx` and other unreachable files
   excluded (census §dead-code list).
2. **The check can fail.** An invented label ("Export to PDF for client", "Book a
   session") is not found; a label found only in dead code is not counted.
3. **Generated from the registries.** Tool and tab labels equal the cockpit's tool
   registry, in order; every `PRO_ASK_VIEWS` key maps to exactly one guide entry and its
   `sees` value matches `maiaSees`; every `TECHNIQUE_LESSONS` id maps to a tool.
4. **Lesson paths are real.** Every "X → Y" in `TECHNIQUE_LESSONS.practice` names a
   heading and a control in live source (closes the three lesson paths above, which
   today name panel headings, not the rail path the member clicks).
5. **Free never sees restricted.** The Free slice names no Pro-only control and no
   client-chart control; the no-access slice names no room path at all.
6. **No availability promise.** The guide text contains none of: "sign up for Pro",
   "upgrade", "subscribe", "coming soon", "will be available", a price. It contains the
   beta wording derived from the runtime phase.
7. **Explain, not do.** The stance forbids acting; no action marker grammar exists in
   the guide or its prompt.
8. **H1 carries nothing.** The help endpoint rejects every chart/memory field; its
   prompt contains no chart facts and no kept-memory block, for any input.
9. **Own-chart memory boundary unchanged.** Existing `personal_own_chart_only` tests in
   `proAsk.test.ts` remain and are referenced from the guide test.
10. **The relocation lesson stays learned.** The guide's Places entry never says the
    chart was relocated; it says relocation is the astrologer's choice.
11. **What MAIA can see is stated once.** For each tool, the guide's "MAIA sees its
    figures" flag equals `PRO_ASK_VIEWS[view].sees`, and tools that send no view
    (Traditions, Timing → Transits/Progressions, Two charts, Deep reading) are described
    by the section they send. This also pins census observations O-1 and O-3.
12. **No expiry claim.** The guide never says client links expire (none do; census O-5).

## 8. Reconciliation items (recorded, not resolved)

**RC-1 · Contract drift.** `docs/design/contracts/astrology-pro-preview.md` still titles
the room "founder-only preview", states production "is expected to leave these unset",
and forbids "any route by which a non-founder session receives Pro content" and
"sending chart material to MAIA". Production runs `tester-grant` with nine grants
(#1893, 2026-11-11), and the facts-only Ask pathway was accepted (#2200 merge record,
2026-11-10). The contract itself already flags the MAIA lines as drift awaiting a
founder ruling (lines 89–99). The same stale wording sits in `proAccess.ts:12–13`
("'tester-grant' is built but not chosen") and `config/accessMatrix.ts:663–664`
("Founder-only Pro workstation preview"). **This is drift only. It is not permission
to relax any privacy line**, and this packet edits none of these files.

**RC-2 · Unmapped access-matrix rule.** `config/accessMatrix.ts` maps eight Pro API
routes (`:664–671`) but **not** `/api/astrology/pro/ask` (noted in #2228) **and not
`/api/astrology/pro/systems`** (found in this census). Both fall to Mode A
"Unmapped route allowed" (`proxy.ts:739–744`). Both handlers check the session and Pro
access themselves (`resolveProOwner`), so this is an outer-layer gap, not a known
breach. Under Mode B (strict) they would be denied. A future H1 help route must not
repeat this.

**RC-4 · Ungated ways into a tester-only room.** "Cosmic Blueprint" in the `/maia`
drawer (`SacredLabDrawer.tsx:409–412`) and two links in account settings point every
member at `/astrology`, which 404s for non-testers (census O-7). The guide must not
repeat that mistake; the links themselves are another lane's.

**RC-5 · Native shell.** By source only `/astrology` is a phone route in the iOS shell;
Free subroutes and `/shared-chart` would show "Available in Web Studio". Whether Pro is
reachable natively is not established. The guide's phone wording must wait for device
acceptance.

**RC-3 · Shared tester flag vs Pro grant.** Free Astrology admits by `members.tester`;
Pro admits by audited grant. A Pro tester who lacks the tester flag can enter Pro but
gets a 404 on Free Astrology. Not a defect claim; the guide must handle it (D-02).

## 9. Founder decision docket

### D-01 · Admit this packet as the spec for a build lane
**Finding:** §2–§7. **Options:** A. Accept as spec; open `ASTRO-PRO-MAIA-GUIDE-R2`
(build) under #1893. B. Return with changes. C. Hold.
**JARVIS recommendation:** A, with the build lane Class B at least (new route, prompt
change) and independent security review before merge.
**Not decided:** release, R4F, R20, device acceptance. **Founder ruling:** OPEN

### D-02 · Three slices, not two
**Finding:** Free Astrology is tester-only (§2.1). **Options:** A. Guide has three slices
(no access / Free tester / Pro). B. Treat Free as public in guide text (would send
non-testers to a 404 — not recommended).
**JARVIS recommendation:** A. **Founder ruling:** OPEN

### D-03 · Where the chartless Help entry lives (R2)
**Options:** A. Inside the Pro MAIA stage as a third mode and in its empty state (H1),
Pro members only. B. Also as an entry in Free rooms (H4). C. Also in main MAIA chat (H5).
**JARVIS recommendation:** A first; B after the Free slice is guard-tested; C only via
the handoff-scoped seam and a separate ruling. **Founder ruling:** OPEN

### D-04 · Lift the cockpit tool registry into an importable constant
**Finding:** labels live inline in `ProAstrologyExperience.tsx`. **Options:** A. Lift
(behaviour-preserving refactor in the build lane). B. Guide parses the component source.
**JARVIS recommendation:** A. **Founder ruling:** OPEN

### D-05 · Map the Pro Ask, Systems and (future) Help routes in the access matrix
**Options:** A. Add exact rows in the build lane. B. Separate security lane under #1983.
**JARVIS recommendation:** B, because the access matrix is a security surface and this
lane must not self-approve it. **Founder ruling:** OPEN

### D-06 · Main MAIA chat
**Options:** A. No guide in main chat. B. Guide only for conversations opened from an
Astrology handoff. **JARVIS recommendation:** A now; revisit with #2235's equivalent
proposal so both products take one rule. **Founder ruling:** OPEN

### D-07 · Contract drift (RC-1)
**Options:** A. Amend the contract to describe the restricted tester beta and the
accepted facts-only pathway, keeping every privacy line. B. Leave until release.
**JARVIS recommendation:** A, as its own docs-only PR, reviewed by the founder line by
line. **Founder ruling:** OPEN

## 10. Exit

- **PASS** → founder accepts D-01; build lane opens with this packet as its contract and
  the eval set as its acceptance population.
- **RETURN** → named sections revised in this branch.
- **STOP** → no guide is built; MAIA keeps today's facts-only behaviour.

## 11. Holds that this packet does not touch and a merged guide would not clear

- ASTRO-R4F #1817 — chart transfer into main MAIA: **held**.
- Independent security / R20 (#1793, #1983): **no record**; not self-approved here.
- Physical iPhone and desktop Safari acceptance: **not performed**.
- First signed-in tester witnessed on soullab.life: **not recorded**.
- Public activation, billing, broader tester waves: **not authorized**.

## 12. What this packet proves and does not

**Proves (code read at `20ce7334e5`):** the access gates, Ask route fields, view phrases,
the chartless empty state, the absent product knowledge, the two unmapped Pro routes,
and the labels quoted in the census as present in source.

**Does not prove:** that any label is visible at runtime in production; how production
renders on a phone; that MAIA would answer the eval set correctly (no model run was
made); anything about production's current SHA. Production was last recorded at
`089f6d98b` (#1893, 03:14Z 2026-11-11) and separately reported running Writer's
Studio's unmerged `0236b93b5`; this packet did not check production.

**Explicitly not authorized by this packet:** production code, prompt changes, new
routes, migrations, deploys, grant or phase changes, access-matrix edits, contract
edits, security/R20/release approval.
