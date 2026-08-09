# Client Field v1 — Decision Record

**Date opened:** 2026-08-03 · **Status:** ✅ **D1 + D2 RULED (founder, 2026-08-03).** ⛔ **Execution gated — see §X.**
Claude may Draft and Record, never Ratify. Rulings below are recorded verbatim in substance, not interpreted.

⚠️⚠️ **NAMING COLLISION — read before citing.** The `D1`/`D2`/`D3` in this file are **decision-record
items about the Client Field.** They are **not** the Founder Decision Docket's `D1`–`D9`
(docket `D1` = *calibrate Now What? before House*; docket `D9` = *client research recruitment authority*,
still blocking the arrival walk). ⛔ Never cite "D1 ruled yes" without naming which register.
Suggested when quoting elsewhere: **CF-D1 / CF-D2 / CF-D3.**

**Referent:** trunk = deployed `95b21ce42`.
**Evidence:** [activation audit](NOW_WHAT_FIELD_ACTIVATION_AUDIT.md) · [participation reconciliation](NOW_WHAT_FIELD_PARTICIPATION_RECONCILIATION.md) · [v1 experience model](CLIENT_FIELD_REDESIGN_V1_EXPERIENCE_MODEL.md)

---

## D1 · Doorway — does the member enter through Current Work?

*Not "do we like the five-band model." Not "do we build the Client Field."*

> ### **Do we accept the contextual field as the member's primary orientation surface?**

**If yes:** Current Work becomes the anchor · everything else appears **only when meaningful** · empty
taxonomy blocks disappear · **objects remain behind the experience rather than becoming navigation.**
**If no:** the current Home architecture stands, and the redesign stops before becoming another IA experiment.

⚠️ **Recorded, not ruled** — founder observations 2026-08-03 offered as leaning toward yes: the six old
Home bands were not the product · the backend already holds multiple capabilities · the goal is one
coherent orientation layer, not more destinations. ⛔ **A lean is not a ruling.**

| | Option | Consequence |
|---|---|---|
| **A** | **Current Work is the primary threshold** — supporting layers beneath it | ⚠️ **Reverses a live ruling** (Home inventory superseded; *"the act must emerge from meaning, not from a register of past acts"*). Must be made as a reversal with reasons |
| **B** | **Current Work is one contextual element** inside a broader field | ✅ No reversal. The deployed Home already does approximately this — `journey` is a band, not the doorway |

**Ruling:** ⬜ ______  **Reasons (required if A):** ______

---

## D2 · Invitation — does practitioner-originated work enter the member's field?

⚠️⚠️ **This is an integrity problem before it is a design question.**

```
Schema:  practitioner_seeded exists
UI:      practitioner_seeded is described to the member
Code:    no writer exists
```

> ### **That is a false affordance. A dead branch is not harmless — it is a hidden promise.**

Neither answer is free.

| | Option | What it obligates |
|---|---|---|
| **A** | **Yes** — a practitioner may originate | Build the **invitation + member response** pair. ⛔ Not *assignment*, not *completion* — that recreates an LMS workflow the sovereignty model refuses. Requires D2a |
| **B** | **No** — every entry originates with the member | Requires **removing** the dead branch: the `practitioner_seeded` render in `ClientHome.tsx:307`, `position/page.tsx:44`, `NowWhatRoom.tsx:179`, and a decision on the unreachable enum value. *A "no" that leaves the copy in place is not a no* |

**D2a — if A: what member act makes it theirs?**
The gesture vocabulary must stay in the member's register — *"I want to work with this"* / *"I want to carry this forward"* — ⛔ never *Enroll · Accept assignment · Complete step*.

**Ruling:** ⬜ ______  **D2a gesture:** ______

---

## D3 · v1 scope — what ships first?

Only capabilities measured alive are eligible.

| Candidate | State | In v1? |
|---|---|---|
| Current Work — doorway or band per **D1** | ✅ alive | ⬜ |
| Door from Home → `/now-what/position` (navigation, **not** build) | ✅ gesture complete, no door | ⬜ |
| "What you are carrying" — member's material, labels intact | ✅ alive | ⬜ |
| Prepare | ❌ no member read path for lessons | ⛔ ineligible |
| Practice — practitioner half | ❌ no writer (= D2) | ⛔ ineligible |
| Connect — communication | ❌ no substrate | ⛔ ineligible |

**Ruling:** ⬜ ______

---

## Not to be done regardless of ruling

⛔ Prepare placeholders · ⛔ Connect UI · ⛔ practitioner assignments · ⛔ renaming existing sections into bands.

> Each would make the interface look complete while the authority model stayed unresolved.

---

## ✅ RULINGS — founder, 2026-08-03

### CF-D1 — **YES.** The contextual field is the member's primary orientation surface.

> **The field is not a replacement for the underlying objects. It is the human-facing composition layer
> over them.** Decisions remain decisions · commitments remain commitments · reflections remain
> reflections · programs remain containers · sessions remain conversations. **The member does not enter
> through those object categories.**

Reason recorded: a member does not wake asking *"where are my field notes?"* They ask *"what am I
working on, what matters today, what do I need to bring forward?"* The system answers the human
question and preserves the underlying structure.

### CF-D2 — **YES.** Remove false affordances.

> **Any UI element implying a capability that does not exist must be removed.** A visible promise
> creates product debt: the member assumes the action is supported, the practitioner assumes the pathway
> exists, and future developers assume the architecture exists.
>
> **The field exposes only actions with complete authority chains.**

### CF-D3 — scope, as ruled

| Build now | Do not build yet |
|---|---|
| Contextual Client Field shell · Current Work projection · Member-owned Work projection · Explore projection · existing session/relationship entry points · **dynamic rendering — only show meaningful zones** | practitioner assignments · program enrollment changes · preparation workflows · group/community expansion · messaging layer |

---

## ⚠️ §Y — Two consequences of CF-D2 that constrain CF-D1's own illustration

CF-D1 names five entry zones (*Current Work · Prepare · Practice · Explore · Connection*). CF-D2 permits
only complete authority chains. **The build list resolves this correctly; recording it so a later reader
does not build the other three.**

> **Five zones are the conceptual model. Only zones with a complete chain may render.**

⛔ **Two elements of the illustrative mockup fail CF-D2 as measured** and may not ship in v1:

| Mockup element | Why it fails |
|---|---|
| *"NEXT CONVERSATION · Bring forward: saved question, unresolved decision"* | **Bring Forward is not on trunk and not deployed.** `coach_shared_offerings` exists only on the parked `feature/bring-forward-v1` — absent from `95b21ce42`. Rendering it is precisely the false affordance CF-D2 prohibits |
| *"NEXT CONVERSATION"* as a scheduled-session anchor | Sessions are blocked by **#899** (4 INSERT paths omit `sessions.team_id`); `sessions.notes` is plaintext PHI |

⭐ The Home may still say *what the member is carrying* — that is member-authored material already live.
It may not offer to **carry it forward** until the carrying mechanism is deployed.

---

## ⏳ CF-D4 — Flourishing orientation (opened 2026-08-03, founder direction)

Full record: [`CLIENT_FIELD_FLOURISHING_ORIENTATION_AMENDMENT.md`](CLIENT_FIELD_FLOURISHING_ORIENTATION_AMENDMENT.md).
The Client Field is to orient around the participant's **flourishing journey**, not coaching artifacts —
zones *My Flourishing Journey · Prepare · Practice · Discover · Connect*, register *"Try this"*.

**Amendment 2, same day:** leadership is the **context**, flourishing the **foundation** —
*Executive Leadership Field powered by positive psychology principles.* Zones become
*Leadership Focus · Practice · Insights · Conversations · Resources* over a **Leadership Memory** layer.
⭐ *"The executive is not managing a coaching program. They are developing themselves as a leader."*

**The fork, as the founder separated it — ⛔ these two must not be merged:**

| Part | Question | Kind | Ruling |
|---|---|---|---|
| **CF-D4-L** | Client Field becomes a **flourishing/leadership lens over existing member-owned work** | UX orientation | ✅ **eligible now** (no missing substrate) · ⛔ execution still gated by §X |
| **CF-D4-P** | Larry's program introduces a **flourishing-specific pathway model** | domain model | ⛔ requires Larry's corpus, practices, authority |
| **CF-D4-C** | Does adopting **-L** re-point the arrival walk's referent (`95b21ce42`)? | sequencing | ⬜ ______ |

⛔ **Three collisions recorded in the amendment §7, unresolved:** **C1** *Leadership Memory* lists
*Lessons Learned · Wisdom* — those are **our** words over the member's *question · reflection* tags, and
contradict the founder's own §5b rule (⛔ *"Your wisdom"*) · **C2** *"Prepare for your conversation with
Larry"* = Bring Forward (parked) + **#899**, already withdrawn by §Y · **C3** *"assessments"* as a resource
collides with the **live** member promise at `ClientHome.tsx:463` that G9 currently passes.

⚠️ **`78358f979`** (`feature/my-work-field-phase-1`, not on trunk, `ClientHome.tsx` +216/−212) is a
**prototype of the interaction model** — ⛔ not a merge candidate.

⚠️ **The amendment changes naming, not capability.** 4 of 5 zones still lack an authority chain; CF-D2 is
unaffected. ⛔ **B1** — Larry's corpus is **absent** and the rights instrument **unsigned**, so no zone may ship
filled with our approximation of his voice. ⛔ **B2** — *Discover* may rename the band, never the member's own
`spiralogic_phase` label.

---

## ✅ §X — G-a LIFTED NARROWLY (founder, 2026-08-03)

> **G-a is lifted only for: the Client Field v1 experience rewrite, bounded by CF-D1 / CF-D2.**

Reason recorded: G-a existed to stop observations silently becoming product changes. That danger was
handled — observations recorded, findings separated, rulings explicitly made, scope constrained. The
rewrite is therefore **not** *"we saw a problem so we changed it"*; it is *"the founder ruled a new
experience model, and implementation is authorized within that boundary."*

⛔ **NOT lifted for:** participation object · practitioner invitation · Prepare capability · Connect
expansion · messaging · **any new database object.**

### ✅ Sequencing — ruled: the walk runs FIRST

```
1. G-a lifted narrowly            ✅ done
2. Arrival walk on 95b21ce42      ⛔ blocked — see §Z
3. Implement complete pathways only
4. Test with Larry + one member   ⛔ blocked — see §Z
5. Later: enrollment · invitation · Prepare · Connect
```

> **The old Home is the evidence artifact. The new Home is the response.** Rewriting first destroys the
> ability to answer *"did the redesign actually solve the arrival problem?"* ⛔ **Do not destroy the baseline.**

### v1 zones — ruled

| Render | Do **not** render |
|---|---|
| **Current Focus** · **Practice** (member commitments/experiments — register *"Try"*, ⛔ never *"Complete"*) · **Discover** (member-created meaning) · **Connection** (existing sessions + relationship **only**) | **Prepare** — capability incomplete · **Flourishing Community** — no substrate |

**Remove:** ❌ Bring forward · ❌ Next-conversation carrying · ❌ shared-offering language · ❌ practitioner suggestions presented as member work.
**Replace with:** ✅ *Continue exploring* · ✅ *Return to your work* · ✅ *What you have chosen to keep*.
**Naming (Larry):** ⛔ not *"Your coaching work"* — that keeps the practitioner at the centre. ✅ *"Your flourishing journey."*

---

## ✅ §W — CF-D5: universal structure ⊥ practitioner expression (founder, 2026-08-03)

> **The architecture survives because the verbs remain stable while the practitioner language changes.**

Three layers. ⛔ **Now What? is not the universal language.**

```
AIN Client Field            ← universal verbs — STABLE
        ↓
Practitioner expression     ← vocabulary layer — VARIES
        ↓
Now What? · Executive Leadership · Healing · Education
```

| Universal (upstream, stable) | Now What? expression (one instance) |
|---|---|
| Current Work · **Practice** · Explore · Keep · Connect | Leadership Focus · Leadership Practice · Leadership Insights · Leadership Commitments · Coach Relationship |

⭐ **Larry is a flagship use case, not the ontology.** The inverted layering — *AIN → Flourishing → Now What?* —
would make one practitioner's domain lens the platform's structure. ⛔ Refuse it.
**CF-D4 (flourishing / CEO vocabulary) sits at the expression layer**, which is why it is separable, and why
holding it does not block the universal build.

### ⚠️ Hazard this creates — the vocabulary door

The proposed expression set is **not a pure relabelling** of the universal set:

| | |
|---|---|
| CF-D4 **adds** *Prepare* | no universal counterpart — **and no capability** |
| CF-D4 **drops** *Keep* | universal verb with live substrate (`member_decision_at`) |

⛔ **If the expression layer may introduce zones the universal layer does not have, vocabulary becomes a
capability-creation channel — and CF-D2 is bypassed through naming rather than through code.**

### ✅ CF-D5a — Expression Vocabulary Constraint — **RULED** (founder, 2026-08-03)

> **A practitioner expression may rename, order, combine, or omit universal verbs. It may not introduce a
> new member-facing zone, action, or capability unless a corresponding universal capability exists and is
> authorized.**

**The universal layer is the capability contract. The expression layer is the language of experience.**

```
✅  Universal capability → Expression vocabulary → Member experience
⛔  Expression vocabulary → implied capability → future build pressure
```

#### ⭐ Omission is not deletion, and not substitution

An expression **may omit** a universal verb — a spiritual director may not use *Practice*; a short
engagement may not use *Connect*. That is legitimate.

| **Omit** means | ⛔ **Omit does not mean** |
|---|---|
| not shown | replaced by an invented equivalent |

⇒ the field is **available universal capabilities + practitioner expression choices** — never expression
choices that manufacture their own capabilities.

#### Now What? expression — corrected against CF-D5a

| Universal | Now What? |
|---|---|
| Current Work | Leadership Focus |
| Practice | Leadership Practice |
| Explore | Leadership Insights |
| Keep | Leadership Commitments |
| Connect | Coach Connection |
| — | ⛔ **Prepare — NOT ALLOWED**: no universal verb · no authorized capability · no member action behind it |

**If Prepare is later wanted:** *need emerges → universal capability decision → implementation → expression
may expose it.* ⛔ **Never** *"Larry wants Prepare → add the label → backfill capability later."*

#### ⭐⭐⭐ The namespace rule (founder, 2026-08-03) — what CF-D5a actually protects

> **Universal language and expression language must not share a namespace without an explicit
> translation boundary.**

CF-D5a did not only constrain future implementation — **it exposed an existing altitude leak.**
`Discover` appearing in a universal-layer scope line is the leak in miniature.

| Statement | Layer | Verdict |
|---|---|---|
| *"The Client Field has **Discover**."* | universal | ⛔ **changes the operating system** |
| *"The Now What? expression may render **Explore** as **Discover**."* | expression | ✅ **changes the lens** |

⭐ `Discover` is perfectly valid **as a Now What? expression**. It is not valid as a universal capability
unless the universal layer itself adopts it. **Every appearance of an expression term outside its lens
must be read as a leak until proven a translation.**

#### ⚠️ Immediate consequence — CF-D4 cannot be adopted as currently drafted

CF-D4's zone set (*My Flourishing Journey · Prepare · **Practice** · Discover · Connect*) violates CF-D5a:

- **`Prepare`** — ⛔ must be dropped from the zone set before CF-D4a can be ruled yes.
- **`Discover` → Explore** — ✅ a rename, permitted.
- **`Keep` absent** — ✅ permitted **as omission** (not shown), ⛔ **not** as replacement by another zone.

⇒ **CF-D4a is now conditional: it may be ruled yes only on a zone set that satisfies CF-D5a.**

#### Why this matters most for the strongest use case

⭐⭐⭐ **The danger is not that Larry's model is wrong. It is that the first beautiful expression gets
mistaken for the operating system.** CF-D5a prevents *"everyone needs Prepare because Larry's clients do"*
while preserving *"Larry can have Prepare once the universal capability exists."*

### ⛔ The vocabulary layer has no substrate — measured 2026-08-03

| | |
|---|---|
| Zone-label / vocabulary column on `practice_fields` | ❌ **does not exist** (`20260701000001`, `20260710000001` — `field_slug` only) |
| `modality_vocabulary` (`20260110000001`) · `practice_worlds.vocabulary` (`20260110000002`) | ⚠️ **different lanes** — therapeutic modalities and world markers. ⛔ **Do not repurpose to carry zone labels** |

⛔⛔ **CF-D5b — whose words are the expression labels?** *Leadership Focus · Flourishing Practice ·
Executive Insight* are either **Larry's language** (⇒ practitioner content, requiring the provenance +
rights chain — corpus absent, instrument unsigned) or **ours** (⇒ **unattributed absorption**, the named
failure mode — not impersonation). ⛔ **The vocabulary layer may not be built before this is ruled.**
→ **CF-D5b: ⬜ ______**

⭐ Note this is the member-side counterpart of the **Universal Practitioner Field** shape: *receive any
practitioner's wisdom without confusing our understanding of them with their own.*

#### CF-D5b — the three options (founder-framed, 2026-08-03)

> **Where do expression labels come from, and who has authority over them?**
> ⭐ **With CF-D5a ruled, this is the only open question in the stack.**

| | Option | For | Against / requires |
|---|---|---|---|
| **A** | **Platform-defined** — AIN owns all labels | consistency · simple governance | ⚠️ **the platform imposes a worldview** |
| **B** | **Practitioner-defined** — Larry authors *Leadership Focus · Flourishing Practice · Executive Insight* | authentic to the practitioner | provenance · explicit ownership · corpus + rights clarity |
| **C** | **Hybrid** — AIN provides the vocabulary **framework**; practitioners express **within that boundary** | ⭐ **founder-indicated likely** | preserves all three authorities |

**Option C preserves the three authorities exactly:**

```text
AIN     → Current Work            platform authority over CAPABILITY
Larry   → Leadership Focus        practitioner authority over OFFERING LANGUAGE
Member  → "Leading my team through uncertainty"   member authority over MEANING
```

⚠️⚠️ **C does not avoid the substrate finding above — it bounds authority, not storage.** B and C both
require the same zone-label column; only **A** keeps labels in code. ⇒ **CF-D5b determines *who may write*
the vocabulary, not *whether the column exists*.** ⛔ Do not read a C ruling as "no schema needed."

⭐ **The member row already works.** `member_program_positions.current_focal_point` (member-confirmed) is
the **only one of C's three rows with live substrate today** — the platform and practitioner rows are both
unbuilt.

### ⭐⭐⭐ CF-D5c — vocabulary ATTACHMENT: the real seam (founder, 2026-08-03)

**CF-D5a** = *what vocabulary may do.* **CF-D5b** = *who may author it.* ⛔ **Do not merge them** —
and the deeper question is neither:

> ### **How long does practitioner language remain attached to member meaning?**

A CEO works with Larry for six months. During: *Leadership Focus — leading through uncertainty.*
Afterward the CEO keeps: *"I learned I don't need to carry every decision."* Does that render as
**"Larry's Leadership Insight"** or **"My realization about responsibility"**?

| Answer | Vocabulary is… |
|---|---|
| **1** | a **temporary lens** — practitioner language is scoped to the live relationship |
| **2** | a **permanent imprint** — the label travels with the artifact forever |
| **3** | a **member-owned translation layer** — the member inherits and may re-language it |

#### ✅ Measured 2026-08-03 — the schema has already half-answered this

| Finding | Evidence |
|---|---|
| The member's kept material carries **no practitioner or program scope at all** — no `program_id`, no `practitioner_id`, no `field_id` | `home/route.ts:104` selects `id, title, content, authorship, member_decision, spiralogic_phase, created_at, member_decision_at` — **nothing practitioner-scoped** |
| Departure is a **hard DELETE with zero residue** — *"No departed status"* | `programPositionService.ts:206, 217` — `DELETE FROM field_program_positions` |

⇒ **Answer 1 (temporary lens) is the current de-facto behavior**, and it is not an accident — it follows
from the departure ruling (*a closed-state column would be an enrollment ledger by another name*).
⇒ **Answer 2 (permanent imprint) is currently NOT IMPLEMENTABLE** — it would require adding a
practitioner/program FK to member-authored rows.
⇒ **Answer 3** would persist the **member's** chosen wording, ⛔ never the practitioner's.

#### ⛔⛔ The constraint that keeps all three answers reachable — adopt before ruling CF-D5b

> **Never persist an expression label, or a practitioner/program FK, onto a member-authored row.
> Vocabulary resolves at RENDER time only.**

⚠️ This is cheap today and expensive later. The moment a practitioner label is written onto a member's
object, Answer 1 is foreclosed and *"Larry's Leadership Insight"* becomes the member's permanent record of
their own realization — **practitioner language taking ownership of member meaning**, which is the exact
failure this architecture exists to prevent.

---

## ✅ CF-D5c — **RULED** (founder, 2026-08-03) — and it re-orders the stack

> **CF-D5a** *what may vocabulary do?* → **CF-D5c** *how long may it remain attached?* → **CF-D5b** *who may author it?*

⭐⭐⭐ **CF-D5c comes BEFORE CF-D5b because it defines the boundary every vocabulary owner must respect.**
⛔ Without it CF-D5b is **under-specified**: a practitioner-owned vocabulary could accidentally become
**permanent authorship over a member's life record.**

### The ruling

> **Expression vocabulary resolves at RENDER time. It does not become part of the member-authored object.**

```text
Expression  →  rendering only
Member object  →  member words only
```

⚠️ **Say RENDER, not READ.** *Read* is ambiguous — database read · API read · memory retrieval · document
load. **Render names the exact boundary: where interpretation enters experience.**

> ⛔ The rule is **not** *"do not fetch vocabulary."* It is: **do not store or substitute meaning-bearing
> vocabulary into the artifact layer. Resolve the lens at the point of presentation.**

```text
✅ member artifact → universal meaning → optional contextual lens → rendered experience
⛔ member artifact → practitioner interpretation baked into record → ownership ambiguity
```

All three futures stay reachable: **temporary lens** (de-facto today) · **permanent imprint** — possible
only via a deliberate future **member act** (*"keep this language as part of how I understand this"*),
which would be **a different object** · **member translation layer** — practitioner supplies the lens, the
member supplies identity.

⭐⭐⭐ **The schema finding is an architectural protection, not a missing feature.** That member rows lack
`practitioner_id` / `program_id` / `field_id` already embodies: **the member's meaning is portable beyond
the relationship that helped reveal it** — the opposite of platforms that create a permanent client record
of the provider's interpretation.

⭐ **This protects Larry's work rather than diminishing it.** Larry contributes framework · questions ·
practices · language · invitations. The member contributes adoption · meaning · integration.
> **Larry provides the lens. The member provides the life.**

### ⭐⭐⭐ CF-D5c refinement — attribution ⊥ ownership

| | Form | Verdict |
|---|---|---|
| **Contextual attribution** | *"During your work with Larry, this was explored through Leadership Presence."* | ✅ **allowed** — historical context |
| **Semantic ownership** | *"Your leadership insight: I learned…"* | ⛔ **prohibited** — assigns authorship of meaning |

> **Practitioner vocabulary may describe the CONTEXT in which a member-authored object emerged, but may
> never become the IDENTITY of that object.** *Provenance without transfer of ownership.*

### ⚠️ Implementability of the allowed form — measured 2026-08-03

*"During your work with Larry…"* requires knowing **which relationship a member object emerged during** —
which is precisely the practitioner/program scope member rows **do not carry**, and which the firewall
above **forbids adding**. Three ways to source it, only one admissible:

| | Source | Verdict |
|---|---|---|
| **1** | Add a practitioner/program FK to the member row | ⛔ **prohibited by this ruling** |
| **2** | Join by time window (object `created_at` inside the relationship) | ⛔ **derivation, not declaration** — `declared ≠ derived`; it would also mislabel work the member did for their own reasons during that period |
| **3** | Render inside the live expression — the practitioner context is already known at render time, so no join is needed; when the relationship ends the context is gone and the attribution simply **stops appearing** | ✅ **admissible — and requires nothing new** |

⭐ **Option 3 is self-consistent with the ruling:** contextual attribution is available for exactly as long
as the context exists. ⛔ **Attribution must not survive the relationship** — a line that outlives its
context has become identity, which is the prohibited form.

**→ CF-D5c: ✅ RULED — render-time only; attribution ⊥ ownership; option 3 the only admissible source.**

### ✅ CF-D5c final guard — source attribution ⊥ meaning attribution (founder, 2026-08-03)

| | Form | Verdict |
|---|---|---|
| **Source attribution** | *"This practice came from Larry."* | ✅ appropriate |
| **Meaning attribution** | *"This insight belongs to Larry's framework."* | ⛔ not appropriate unless the **member explicitly chooses** it |

> ### **Source can be attributed. Meaning cannot be transferred.**

⚠️ **The failure this prevents:** a system that *looks* respectful because it avoids storing practitioner
ownership directly, then **reconstructs ownership through inference.** ⛔ The tempting join —
*"just add `practitioner_id` to member reflections"* — permanently couples a person's meaning to the person
who helped evoke it. **The relationship was a doorway, not a stamp.**

#### ⚠️⚠️ The rule is SCOPED BY OBJECT CLASS — the two failure modes run opposite

⛔ **Do not read *"attribution must not survive the relationship"* flatly.** It governs **member-authored**
objects. Applied to **practitioner-authored** objects it would produce the *other* prohibited failure.

| Object class | Attribution at relationship end | Failure if inverted |
|---|---|---|
| **Member-authored** — insights · decisions · commitments · reflections | ⛔ **must NOT survive.** The lens disappears; the meaning remains | practitioner language acquires **ownership of member meaning** |
| **Practitioner-authored** — practices · invitations · frameworks · language | ✅ **MUST survive, permanently.** Larry authored it whether or not the relationship continues | **unattributed absorption** — the named failure mode of the corpus-authority lane |

⭐⭐⭐ **One rule cannot cover both. Attribution is an obligation on the practitioner's object and a
prohibition on the member's object** — and the discriminator is **who authored the row**, which the
`authorship` column already carries.

#### ✅ CORRECTED INVARIANT (founder, 2026-08-03) — attribution and ownership are different AXES

> ### **Attribution follows AUTHORSHIP. Meaning ownership follows the MEMBER.**

⛔ The flat rule *"attribution must not survive the relationship"* was **correct but incomplete** — it
described *relationship to attribution*, not *authorship direction*, and would **accidentally destroy
practitioner provenance.** Corrected:

```text
⛔ relationship ends → remove attribution
✅ relationship ends → remove contextual association WHERE THE MEMBER DID NOT AUTHOR IT
```

| Object author | Survives relationship end | Why |
|---|---|---|
| **Member** | meaning survives; **practitioner attribution does not** | the relationship may have **evoked** the insight; it does not **own** it |
| **Practitioner** | **authorship survives**; member ownership does not attach unless **adopted** | the practice/framework remains the practitioner's creation |

**The mirror-image failures:**

| Object | Failure | What happened |
|---|---|---|
| *"I realized I avoid difficult conversations because I fear disappointing people."* | ⛔ **"Larry's Leadership Insight"** | facilitation converted into **ownership**. Larry created conditions; the member created meaning |
| *"Practice noticing where you avoid direct feedback."* | ⛔ rendered **with no source** | ⛔ **not neutrality — ABSORPTION.** Authored work silently made platform-generated |

#### ⭐⭐⭐ Three separate questions — ⛔ do not collapse them into one field called "ownership"

| # | Question | Nature | Values |
|---|---|---|---|
| **1** | **Who authored this?** | **persistent** | member · practitioner · platform |
| **2** | **Who currently has access?** | **contextual** | active relationship · group membership · program participation · permission state |
| **3** | **What does it mean to the person?** | **member-owned** | adoption · reflection · commitment · kept meaning |

⚠️ **This is a schema-shaped warning, not only a copy rule.** A single `owner` column would fuse all three
and re-create every failure above at once.

#### The renderer therefore needs two behaviors, not one

```text
PRACTITIONER MATERIAL          MEMBER MATERIAL
Practice                       Insight
"Have one conversation         "I noticed I apologize before
 this week."                    I speak clearly."
Source: Larry /                Source: the member
        Leadership Presence    Context: (optional active relationship lens)
```

> **The relationship can provide context. It cannot rewrite authorship.**

### ⭐⭐⭐ FINAL GUARD — both directions in one line

> ## **No authored object may lose its source. No member meaning may acquire a source it did not choose.**

⚠️ **Prospective today:** no practitioner-authored object reaches a member at all (no invitation writer, no
lesson read path). ⛔ The second row is a rule for when that path is built — **not a live requirement**, and
⛔ not a reason to build it.

### The three futures, as re-stated by the founder

| | | Mechanism |
|---|---|---|
| **1 Lens** | current default | practitioner language → **temporary rendering** |
| **2 Translation** | future | Larry: *Leadership Presence* → member: *"Staying grounded when everyone expects me to have the answer"* — ⭐ **the second phrase belongs to the member** |
| **3 Permanent imprint** | separate member act | *"I want to keep this framework as part of my ongoing practice"* — ⭐ **that is member ADOPTION, not vocabulary persistence** |

### The remaining question, now properly bounded

> **CF-D5b: who may author the lens, knowing the lens can never own the person's meaning?**

⭐ *This is the seam that lets AIN work with thousands of practitioners without becoming thousands of
competing ontologies.*

### ⭐ What the walk is actually testing (founder, recorded so step 2 is not mis-scoped)

⛔ **Not** whether Larry's labels are good · **not** whether the vocabulary is scalable · **not** whether
the schema is elegant.

> ### **"When a person enters this environment without explanation, do they understand what this place is for?"**

⭐ **That evidence should influence CF-D5b** — which is why the walk precedes it. ⛔ Optimizing the
abstraction before knowing whether humans experience the expression correctly is the inversion to refuse.

### ⭐⭐⭐ The four-level hierarchy (founder refinement — §W's stack has three)

```text
AIN Universal Client Field
  └── Human Development Expressions
        └── Now What?
              └── Executive Leadership / Flourishing
```

> **The Client Field is universal. Now What? is the first expression. Larry's executive leadership field
> is the first expression of that expression.**

⚠️ The middle level is **descriptive today** — it carries no substrate implication and creates no registry.
⛔ Do not build a taxonomy table for it.

### ✅ Prototype disposition — `78358f979`

> **A valid Now What? *expression* prototype.** ⛔ Not the universal Client Field · ⛔ not a failed
> implementation · ⛔ not discarded work. **Its value is that it exposed the seam.**

| Claimed proven | Revealed |
|---|---|
| contextual stream · arrival · objects sitting behind experience · member-first orientation | ⚠️ **domain language embedded too early** — *a useful discovery* |

⚠️⚠️ **Those four are design-level claims, not walk-verified.** Step 2 of the sequence below is precisely
the walk that tests comprehension of this prototype. ⛔ Recording them as *proven* before that walk would
pre-empt the instrument. **Classify as: the prototype's design intent held together; whether a participant
comprehends it is the open measurement.**

### ✅ Priority order — ruled (founder, 2026-08-03)

```text
1. D9                       authorize participant encounter        ⛔ UNRULED — the unlock
2. Walk                     test comprehension of the prototype expression
3. CF-D5b                   decide vocabulary provenance
4. Extract Now What?        move Larry language into its proper layer
5. Build universal Client Field
```

**Build implication — ⛔ the next build is not "add five flourishing zones":**
1. universal Client Field shell · 2. expression vocabulary configurable · 3. Now What? as the first
expression · 4. Larry's executive language as a **vocabulary layer** · 5. ⛔ **do not invent missing
capabilities.**

⭐⭐⭐ **The thing to protect:** *do not let the desire to make Larry's experience beautiful collapse the
universal architecture into Larry's vocabulary.*

> **Larry can be the first great expression of AIN without becoming the definition of AIN.**
> **North star: universal field · practitioner expression · member transformation.**

### Implementation boundary, as ruled

| ✅ Allowed now | ⛔ Not yet |
|---|---|
| Universal Client Field shell · contextual stream · Current Work (existing member-authorized data) · Practice (existing member-owned material) · Explore (member meaning-making) · Keep / retained material · existing relationship connection | flourishing vocabulary · CEO-specific copy · Larry-specific practices · Prepare · practitioner assignments · community / messaging |

⛔ **No placeholders, no "coming soon."** If preparation exists → show Prepare. If it does not → **it does
not exist in the member experience.** The field exposes living pathways only.

---

## ⛔ §Z — Three blockers the lift does not clear

⭐ **G-a is lifted. The sequence is still stopped at step 2.**

| # | Blocker | Effect |
|---|---|---|
| **Z1** | **Docket D9** — client research recruitment authority — is **UNRULED and blocking**. *(Docket register, not CF.)* The arrival walk cannot recruit a participant | **step 2 blocked** ⇒ step 3 is authorized but unreachable while walk-first holds |
| **Z2** | **Step 4** (*test with Larry + one member*) needs **D9** *and* the **Larry IP one-pager** — the rights instrument is **UNSIGNED** | **step 4 blocked** |
| **Z3** | The lift cites *"CF-D1 / CF-D2 / **flourishing model**"* — but **CF-D4a is ⬜ unruled.** An authorization may not rest on an input that has not been ruled | **scope ambiguity** — see below |

**On Z3:** CF-D1 and CF-D2 are ruled and can bound the rewrite on their own. The flourishing *naming*
(CF-D4) is not yet adopted. ⇒ **Build to CF-D1/CF-D2; hold the flourishing vocabulary until CF-D4a is
ruled** — otherwise zone names ship on an unruled basis and the walk's referent question (CF-D4c) is
pre-empted.

**On the replace-list:** ⛔ *"Prepare when available"* was proposed as a replacement but **is itself a
false affordance under CF-D2** — it advertises a capability that does not exist and tells the member to
expect it. It is omitted from the ✅ list above. **A promise of a future capability is still a promise.**

**Net position:** implementation is **authorized and not yet startable.** The single act that unblocks
the most is a **D9 ruling**.

---

## Status

```
CF-D1 doorway     ✅ RULED YES — contextual field is the primary orientation surface
CF-D2 affordances ✅ RULED YES — only complete authority chains may render
CF-D3 scope       ✅ RULED — build list + do-not-build list recorded
Mockup elements   ⛔ 2 fail CF-D2 (Bring Forward · Next Conversation) — §Y
CF-D4 flourishing ⏳ OPEN — a/b/c; naming change, not capability; content authorship = Larry
G-a               ✅ LIFTED NARROWLY — Client Field v1 rewrite only, per CF-D1/CF-D2
Sequencing        ✅ RULED — walk FIRST on 95b21ce42; ⛔ do not destroy the baseline
v1 zones          ✅ Current Focus · Practice · Discover · Connection(existing only)
                  ⛔ Prepare · Flourishing Community — not rendered
Z1 docket D9      ⛔ BLOCKING step 2 (walk) — the single highest-value ruling
Z2 Larry IP       ⛔ BLOCKING step 4 — one-pager + UNSIGNED rights instrument
Z3 CF-D4a unruled ⚠️ build to CF-D1/CF-D2; HOLD flourishing vocabulary
CF-D5  universal  ✅ RULED — universal owns VERBS · practitioners own VOCABULARY
CF-D5a constraint ✅ RULED — expression may rename/order/omit, ⛔ never introduce a zone
CF-D5b provenance ⏳ OPEN — who AUTHORS vocabulary: A platform · B practitioner · C hybrid
                  ⚠️ C bounds AUTHORITY, not STORAGE — B and C both need the column
CF-D5c attachment ✅ RULED — render-time only; ⭐ ORDER IS a → c → b (c bounds b)
                  ✅ attribution ⊥ ownership: "during your work with Larry" OK;
                     "your leadership insight: I learned…" ⛔ assigns authorship
                  ⚠️ allowed form sourceable ONLY by rendering inside the live
                     expression — FK ⛔ prohibited, time-window join ⛔ derivation
                  ⛔ attribution must NOT survive — ⚠️ ON MEMBER-AUTHORED OBJECTS ONLY
                  ✅ SOURCE attributable ⊥ MEANING never transferable; practitioner-
                     authored objects MUST carry permanent attribution (inverse
                     failure = unattributed absorption). Discriminator = `authorship`
CF-D5c basis      how long practitioner language stays attached to member meaning
                  ✅ MEASURED: member material carries NO practitioner/program scope;
                     departure = hard DELETE ⇒ "temporary lens" is de-facto today,
                     "permanent imprint" is NOT implementable without a new FK
                  ⛔⛔ CONSTRAINT: never persist an expression label onto a member row —
                     render-time resolution only (cheap now, forecloses later)
78358f979         ✅ valid Now What? EXPRESSION prototype — exposed the seam
                  ⚠️ its 4 proofs are design-level, NOT walk-verified (that is step 2)
Sequence          1 D9 → 2 Walk → 3 CF-D5b → 4 extract expression → 5 universal field
Implementation    ✅ authorized · ⛔ not startable (walk-first + Z1)
```

*Decide the doorway. Decide the invitation boundary. Build only what exists — and only once the lane is open.*
