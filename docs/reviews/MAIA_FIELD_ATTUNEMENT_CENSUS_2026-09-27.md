# MAIA Field Attunement Census — 2026-09-27

**Programme:** MAIA-FIELD-ATTUNEMENT-01
**Lineage inspected:** feature/decisions-current3597-reconcile-20260927 at /private/tmp/decisions-current3597
**Evidence type:** source + existing contracts only
**Scope ceiling:** descriptive census. No redesign, runtime mutation, posture binding, or migration is authorized here.

## Reading this census

Two standings are kept separate:

- **Contract standing** — whether the field has actually specified threshold, subject, stance, authority, context/persistence, and exit.
- **Runtime standing** — whether current code binds those laws through MAIA’s sanctioned cognition/relationship substrate.

A beautiful experience is not automatically a bound posture.
A posture name in an enum is not automatically a runtime posture.
## Summary matrix

| Field / surface | Primary subject | MAIA threshold / stance | Persistence posture | Contract | Runtime | Main finding |
|---|---|---|---|---|---|---|
| **MAIA / main conversation** | the member’s live conversation | direct destination / companion | canonical conversation continuity under member memory/privacy settings | EXPLICIT | BOUND | Reference identity; other fields should specialize participation, not personhood |
| **Journal** | kept Journal entry | explicit “Reflect with MAIA”; quiet, relational, writing remains primary | **transient Sanctuary encounter**; content-free operational receipt only | EXPLICIT | BOUND | Strongest current proof that same MAIA can change field posture without sharing transcript policy |
| **Reflections** | member-kept Reflection | explicit “Discuss with MAIA”; member sees/edits exactly what travels | appends to canonical MAIA conversation | EXPLICIT | BOUND | Canonical in-place presence; reflection stays open underneath |
| **Changes** | lived Change | explicit encounter; reflect one feature, open one question, evidence ≠ hypothesis | stable contained conversation keyed to Change | EXPLICIT | PARTIAL | Canonical OracleConversation is used, but field specialization is not yet carried through the MaiaPosture channel |
| **Relationships** | one member-owned Relationship | explicit Talk / Write with MAIA; relational context bridge | canonical conversation per open encounter | EXPLICIT | PARTIAL | Same MAIA and server relational context; reopen currently mints a fresh epoch-based session |
| **Divination / I Ching** | symbolic reading | explicit Explore with MAIA; symbolic inquiry | component-local transcript during page life; /api/between/chat | PARTIAL | DUPLICATE | Strong experience, but EmbeddedMAIAChat is a separate conversation implementation wearing MAIA’s name |
| **Dream** | kept dream | quiet until invited; encounter should stay with image/dream before amplification | not yet established for MAIA encounter | EXPLICIT (design) | DESIGN ONLY | Dream architecture is unusually clear; Encounter/Amplify cognition remains intentionally unbound in current Dream programme |
| **Personal Decisions** | live human choice | no direct MAIA encounter currently; “Gather perspectives” is invited council practice | council artifacts / decision records, not MAIA conversation | PARTIAL | TOOL / DELIBERATELY ABSENT | decision-witness exists only as posture vocabulary; current council should not be relabeled MAIA by implication |
| **Astrology** | birth chart / chosen symbolic lens | MAIA described as reflective companion, never astrological authority | not adequately specified in current narrow contract | PARTIAL | UNVERIFIED | Current Astrology contract explicitly says the room has not been experientially walked/approved |
| **Writer’s Studio** | Work / manuscript / held passage | MAIA situated beside the Work; text enters only through explicit governed handoff | durable server-owned ask threads; distinct from full-MAIA session identity | EXPLICIT | PARTIAL | Strong governance and canonical cognition seams, but Studio thread identity is intentionally not presented as the same transcript identity as full MAIA |
| **Living Field / Living Constellation** | member-authored life configuration and source objects | witness, clarify, remember, compare, teach when invited | source-object custody; read-only projection laws | EXPLICIT (field law) | UNVERIFIED | Posture is conceptually clear; this census does not establish a single current runtime MAIA host for the whole field |
| **Daily Anchor** | today’s member-authored anchor | MAIA context only by explicit “may remember this with me” consent | private by default; bounded standing consent when chosen | PARTIAL | PARTIAL / CONTEXT ONLY | Primarily a memory/context crossing, not yet evidence of a distinct conversational posture |
| **Ideas** | member-authored idea block/thread | canon says “Ask MAIA”; July House Presence classified composer as bounded room tool | idea-thread storage, not established canonical MAIA relationship | CONFLICTING | TOOL / UNRESOLVED | Direct canon conflict: Living Orientation describes MAIA; House Presence says the Ideas composer must never gain MAIA voice |
| **Now What?** | container-scoped member journey | isolated guided conversation | container-bounded learning; no general MAIA memory in or automatic outflow from container | EXPLICIT ISOLATION | UNVERIFIED / ISOLATED | Founder-governed exception; convergence requires a separate constitutional ruling |
| **Session Review / legacy mentor surfaces** | practitioner decision/change/session material | specialized “MAIA Mentor” / review behavior | deliberately write-suppressed or local artifacts | PARTIAL | DUPLICATE CANDIDATES | July reconciliation already identifies these as migration debt; Session Review has additional client-content privacy constraints |
| **Becoming** | has been · is being · may be becoming | newer work exists outside this inspected lineage | not claimed here | UNVERIFIED | UNVERIFIED | Current 3597 lineage cannot establish the newer Becoming runtime; no capability claim made |
## 1. Main MAIA — reference identity

**Evidence:** lib/maia/presence/postures.ts · components/OracleConversation.tsx · docs/architecture/MAIA_HOUSE_PRESENCE_IMPLEMENTATION.md

Current posture vocabulary calls the default posture **companion**.

This is the reference relationship surface, not the template every field must visually copy.

Load-bearing invariant:

> A room may specialize participation without minting a second MAIA identity, memory system, or contradictory conversation truth.
## 2. Journal — current strongest attunement specimen

**Evidence:** docs/design/contracts/journal-room.md · app/api/journal/reflect/route.ts · components/journal/room/Reflection.tsx · lib/sovereign/maiaService.ts

Observed/verified in the current lineage:

- kept entry is primary;
- MAIA enters only after explicit invitation;
- current entry is re-resolved server-side;
- sovereign getMaiaResponse supplies cognition;
- journalContextAddendum carries current source context;
- Sanctuary blocks conversation-content persistence and memory formation;
- encounter continuity exists while the encounter is open;
- “Write from here” is optional carry-back;
- “Let it rest” ends the encounter.

**Finding:** identity/cognition and persistence posture are successfully separated.
## 3. Reflections — canonical contained presence

**Evidence:** components/reflections/DiscussWithMaia.tsx · docs/design/contracts/reflections-maia-handoff.md

The member sees and edits the exact message before it travels.

When the House presence layer can host, openMaiaWith() opens the same canonical conversation over the Reflection. The Reflection remains visible underneath.

No room-owned transcript is created.

**Standing:** aligned and already close to the field-attunement law.
## 4. Changes — behavior aligned, posture channel still implicit

**Evidence:** docs/design/contracts/changes-living-room.md · docs/design/contracts/changes-maia-encounter.md · components/maia/changes/ChangeRoom.tsx

Changes explicitly says:

> **MAIA is one MAIA moving through the House.**

It uses canonical OracleConversation in contained mode and keeps the Change materially present.

The member explicitly chooses when Change content enters conversation.

**Debt:** the runtime does not appear to carry an explicit MaiaPosture = change-reflection contract through the canonical route. The behavior is aligned; the general posture mechanism is not yet the authority.
## 5. Relationships — strong field context, imperfect reopen continuity

**Evidence:** app/relationships/[id]/page.tsx · SOULLAB_LIVING_ORIENTATION_SYSTEM.md · RELATIONSHIP_ROOM_CONSTITUTION.md

Relationships correctly separates:

- exact relationship identity;
- member-authored history;
- system inference;
- present member report.

The page mounts canonical OracleConversation in contained mode and carries relationshipContextId through the explicit handoff.

**Debt:** sessionId currently contains a maiaSessionEpoch. Closing/reopening the in-place encounter can therefore create a fresh conversation session rather than recover the exact prior one.

Same MAIA identity is present; exact thread continuity across reopen is not yet established.
## 6. Divination — experiential success, runtime duplicate

**Evidence:** components/oracle/EmbeddedMAIAChat.tsx · app/oracle/iching/page.tsx · docs/design/contracts/divination-readability.md

The Divination experience is strong: the reading stays primary, MAIA is explicitly invited, and the member can continue talking.

But EmbeddedMAIAChat:

- owns its own local messages array;
- constructs its own reading-context message;
- posts directly to /api/between/chat;
- sends client-assembled conversationHistory.

This is exactly the shape the one-MAIA law is meant to eventually reconcile.

**Standing:** do not redesign it now; later compare behavior and migrate cognition/continuity without losing the accepted Divination experience.
## 7. Dream — posture designed before cognition

**Evidence:** docs/design/contracts/dream-room-experience-architecture.md and current DREAM programme boundaries.

Dream already specifies a distinct posture exceptionally well:

- MAIA quiet on arrival;
- dream remains primary;
- begin from one exact image/phrase/affect/gap;
- one precise reflection + one live question;
- amplification only after invitation or sufficient personal exploration;
- symbolic material stays possibility, not verdict.

The programme deliberately left Encounter, Amplify, Dream Series cognition and MAIA interpretation unbound during the canonical-room build.

**Standing:** design is ready for later posture binding; runtime claim remains DESIGN ONLY.
## 8. Decisions — perspective tool is not yet MAIA posture

**Evidence:** app/decisions/[id]/page.tsx · docs/design/contracts/personal-decisions-room.md · lib/maia/presence/postures.ts

The current member room offers **Gather perspectives**, held by the Decision Council.

The decision-witness posture name exists in MaiaPosture, but the member room does not currently host a direct MAIA conversation.

That is not a defect by itself.

The council is a bounded perspective function and should remain a tool unless relationship/continuity/dialogue becomes essential.

**Standing:** do not relabel council output as MAIA to make the architecture appear more unified.
## 9. Astrology — right authority law, incomplete posture law

**Evidence:** docs/design/contracts/astrology.md

The narrow Astrology contract correctly establishes:

- chart as symbolic map, not identity verdict;
- MAIA as reflective companion rather than astrological authority;
- deterministic, diagnostic, and fate language forbidden.

But the contract explicitly says the current composition has not been experientially walked or approved and does not cover the whole Astrology surface family.

**Standing:** posture remains PARTIAL / UNVERIFIED until the actual room is walked and the entry/context/persistence/exit laws are specified.
## 10. Writer’s Studio — governed MAIA relation with distinct thread identity

**Evidence:** app/writers-studio/canvas/WorkConversation.tsx · app/api/writers-studio/focus/route.ts · docs/design/contracts/flagship-studio.md

Studio has done substantial identity work:

- the manuscript/Work remains primary;
- conversation identity is server-owned, never browser-minted;
- Work identity and passage locus are separate;
- chosen Keeps enter the composer, never auto-send;
- canonical Focus route states “one authorized boundary, one accountable crossing, one canonical MAIA.”

Studio also explicitly refuses to pass its ask_thread id to full MAIA as though it were a session id.

**Finding:** this is truthful federation, not yet one shared transcript identity. Do not “fix” it by conflating identity spaces.
## 11. Living Field / Living Constellation — field law ahead of host binding

**Evidence:** LIVING_CONSTELLATION_CONTRACT_V0_1_2026-09-18.md

The contract already says MAIA’s posture changes by room without changing identity.

Living Field posture: witness, clarify, remember, and help the member perceive what they already authored.

Vision Studio posture: develop the work through reflection, questioning, comparison, teaching when invited, tentative proposals.

Practice Field posture: articulate and steward relational conditions and practice material under professional boundaries.

Across all three MAIA may retrieve, offer, compare, ask, teach when invited, and propose—but may not silently author higher-order meaning.

**Standing:** strong contract law; this census does not prove one current runtime posture host across the constellation.
## 12. Daily Anchor — context consent, not necessarily a conversation posture

**Evidence:** SOULLAB_LIVING_ORIENTATION_SYSTEM.md

Anchors remain private by default.

“MAIA may remember this with me” grants bounded standing consent for contextual return.

This is principally a memory/context authority decision. It should not automatically be promoted into a distinct MAIA posture unless a relational encounter is actually needed.

**Standing:** preserve the distinction between contextual availability and conversational presence.
## 13. Ideas — explicit conflict requiring later adjudication

Two current authorities disagree:

- SOULLAB_LIVING_ORIENTATION_SYSTEM.md says **Ask MAIA remains in the Idea thread** and distinguishes member blocks from MAIA response blocks.
- MAIA_HOUSE_PRESENCE_IMPLEMENTATION.md classifies the Ideas detail “Continue thinking…” composer as a **bounded non-conversational tool** and says it “must never gain a MAIA voice.”

This census does not reconcile the conflict.

**Standing:** CONFLICTING / UNRESOLVED. No implementation should use one document to silently erase the other.
## 14. Now What? — governed isolation

**Evidence:** MAIA_HOUSE_PRESENCE_IMPLEMENTATION.md · MENTOR_SURFACE_RECONCILIATION_2026-07-17.md · Now What? architecture.

Now What? is deliberately excluded from general House MAIA presence.

Its current continuity is container-bounded, with no automatic general-MAIA memory inflow/outflow beyond what has separately been authorized.

The MaiaPosture vocabulary reserves now-what, but the future relationship model remains a separate constitutional question.

**Standing:** intentional exception; no convergence under this act.
## 15. Practitioner mentor/review surfaces — known duplicate-identity debt

The July reconciliation already identified:

- MentorChat / ChangeMentorPanel;
- MentorPanel / Decisions;
- SessionReviewChat.

These surfaces wear MAIA’s name but have their own implementations and special privacy/persistence laws.

The prior ruling still stands: migrate one at a time only after a server-enforced posture can reproduce the required write suppression, object context, and practitioner authorization.

Session Review remains highest risk because client transcript material must never fall into practitioner personal memory by accident.
## 16. Becoming — no current-lineage runtime claim

This inspected 3597 lineage does not contain the newer Becoming / Future Self implementation currently being explored elsewhere.

Historical repository records include Becoming as concept/design vocabulary, but that is not evidence for the newer runtime.

**Standing:** UNVERIFIED IN THIS LINEAGE.

This is deliberate epistemic restraint, not a claim that Becoming does not exist elsewhere.
## Cross-House findings

### A. The architecture is converging before the mechanism is

The same experiential law appears independently in Journal, Reflections, Changes, Relationships, Dream, Studio, and Living Constellation:

> **the field’s subject remains primary while MAIA enters in relation to it.**

This is stronger evidence than shared component reuse because the same law has emerged across materially different rooms.
### B. Persistence is genuinely plural

At least four legitimate persistence shapes are already visible:

- canonical durable conversation;
- transient Sanctuary encounter;
- server-owned room thread;
- container-scoped / zero-write specialized work.

This confirms that persistence policy belongs to field/container law and member consent, not to MAIA identity alone.
### C. The MaiaPosture enum is behind the actual architecture

Current vocabulary contains:

- companion;
- journal-reflection;
- decision-witness;
- change-reflection;
- session-review;
- now-what.

But current House work also clearly needs to reason about Relationship, Reflection, Dream, Divination, Astrology, Writer’s Studio, and possibly Living Field / Becoming postures.

This census does **not** authorize expanding the enum. It records only that the current vocabulary no longer covers the conceptual field.
### D. One-MAIA debt is concentrated, not universal

The clearest duplicate-implementation debt is:

1. Divination EmbeddedMAIAChat;
2. legacy practitioner mentor/review surfaces;
3. any future room that creates a local transcript + provider route while presenting it as MAIA.

Journal is no longer in that category after the sovereign-MAIA reconciliation.

Relationships and Writer’s Studio have continuity/identity distinctions to reconcile, but they are not accurately described as simple duplicate assistants.
### E. A posture channel must eventually carry more than tone

The July mentor reconciliation already anticipated the correct shape.

A real posture authority will need server-enforced:

- identity;
- room/object jurisdiction;
- context fetch;
- memory read policy;
- memory write policy;
- conversation persistence policy;
- epistemic/response constraints;
- tool permissions;
- practitioner/container authorization where relevant.

A string prompt addendum alone is insufficient.
## Closure of MAIA-FIELD-ATTUNEMENT-01

This census establishes the current map without changing runtime behavior.

The next act, if separately authorized, should **not** be “wire every posture.”

It should select one discrepant field where the member experience is already accepted and run a narrow reconciliation against the House-wide contract.

No such implementation is opened by this document.
