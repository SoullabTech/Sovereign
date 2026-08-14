**PROPOSED — NOT RATIFIED** · invocation JRF-07 · 2026-08-13

# JRF-07 — Adversarial Witness: the falsification instrument for RF-R3

> **What this document is.** A pre-implementation acceptance instrument: the set of scenarios that
> would falsify the Relational Field declaration architecture *before* it is built, each with the
> observation that distinguishes **"the boundary held"** from **"the boundary was never exercised."**
>
> **What it is not.** Not a review of A1/A2/A5. Not a remedy. Not a test suite. No code is written
> here and none is authorized by it.

---

## 1. Scope

**The question given:** construct the scenarios that would falsify this architecture before
implementation — covering mention, negation, ambiguity, changed circumstances, correction,
conflicting participants, withdrawal, release, expired patterns, imported text, rejected MAIA
observations — plus the cases the architecture invites that the founder's list does not name.

**What I examined:** A1 (`RELATIONAL_FIELD_R3_R6_DESIGN_2026-08-13.md`), A2
(`RF-R3_PROVENANCE_BOUNDARY_2026-08-13.md`), A5 (`docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md`),
A4 §7 (`RELATIONSHIP_ROOM_CONSTITUTION_RATIFICATION_BRIEF_2026-08-13.md` §5–§7), and a bounded
custody check of four existing artifacts named in A1's reuse list.

**What I did NOT examine, and therefore make no claim about:**

- the live conversation route, the observer, or `relationshipSignalService` execution behaviour
- production row counts, traffic, or the state of the traffic-dependent containment witness
  (A1 precondition 1) — I neither confirm nor contradict it
- UI surfaces, iOS/Capacitor behaviour, any rendering implementation
- whether any scenario below is *currently* possible; the instrument is written against the
  **designed** architecture, not against present behaviour

**Standing:** every NOT SETTLED row is a gap in the design record as of 2026-08-13. It is **not** an
accusation that the design is wrong. An instrument that found no gaps before implementation would be
evidence about the instrument.

---

## 2. Evidence and existing infrastructure

### 2.1 Authority text relied on (FACT — read in full this session)

| Ref | FACT established | Location |
|---|---|---|
| F1 | *"A declaration is an event, not a field."* Standing arises **only** from an authenticated member gesture, with immutable wording, attached to a specific relationship at creation. | A2 §"Governing principle", A2 §1 |
| F2 | A declaration carries: authoring `member_id` · **gesture witness** (route + method + server-side session/auth event id + server timestamp, never client-asserted) · `relationship_id` **NOT NULL at creation** · write-once `declared_text` · `affirmed_at` + `superseded_by` · `retrieval_consent` | A2 §2 |
| F3 | Assertions are **disjoint** classes — DECLARED / OBSERVED / INFERRED / IMPORTED — and *"an assertion never changes class"* except by §6. | A2 §3 |
| F4 | Five distinct member acts: **Affirm · Correct · Supersede · Withdraw · Release**. Correct and Supersede *share a mechanism and differ in meaning*, so intent *"must be captured explicitly, not inferred from the edit."* | A2 §4 |
| F5 | ⛔ *"No system process may perform any of these five acts. Not decay, not cleanup, not a migration."* | A2 §4 |
| F6 | Retrieval requires **all** of: DECLARED (or OBSERVED offered as MAIA's own) · `retrieval_consent` true · not withdrawn · current, or offered **as history with its date**. | A2 §5 |
| F7 | `retrieval_consent` is **FALSE when unanswered**; *"Silence creates no consent."* | A2 §8② |
| F8 | OBSERVED assertions are **IN-TURN ONLY** before RF-R6, with an **anti-laundering clause**: *"operational telemetry must not preserve the semantic assertion in another guise… If a store would let the assertion be read back as knowledge about the relationship, it is persistence, whatever the table is called."* | A2 §8③ |
| F9 | ⛔ *"a sanctuary session may not produce a Declaration. The gesture is real, but the containment boundary is absolute."* | A2 §7 |
| F10 | ⭐ Eligibility is **COMPUTED** from the declaration event and its lineage, ⛔ *"never copied into a mutable authority field."* No cached authority bit. | A2 §9 |
| F11 | ⭐ Release concerns **permission for relational use**; ⛔ *"It must NOT be interpreted as a statement that the original experience was false."* | A2 §9 |
| F12 | ⛔ *"Conditions may not be derived by the system."* | A5 Article VI BOUNDARY |
| F13 | Render gate: *"every sentence rendered in this room must survive being read aloud with the prefix 'In my experience, …' — or it must not be rendered."* | A5 Article III BOUNDARY |
| F14 | MAIA ⛔ may not *"adjudicate who is right"*, *"diagnose the other person"*, *"claim knowledge of another's interior state"*, *"manufacture relational certainty"*, *"require movement."* | A5 Article VIII BOUNDARY |
| F15 | A5 IX states that the conditions under which AIN may retain relational memories necessarily concerning another human *"belongs to its own governed unit"* — i.e. the Constitution **declares this open by its own text**. | A5 Article IX IMPLICATION |
| F16 | The **only** MAIA-facing correction promise in the design record — *"You corrected my earlier understanding; I will carry the correction forward."* — sits in A1 item 5. | A1 §5 |
| F17 | The word **Sanctuary** appears **0 times** in the Constitution's 12 articles; whether a Sanctuary clause enters before ratification is pending founder decision A4 §7①. | A4 §5 D5, A4 §7① |
| F18 | Portability/export is **absent** from the Constitution and is pending founder decision A4 §7⑤. | A4 §5 D4, A4 §7⑤ |

### 2.2 Substrate custody check (FACT — verified this session, second method noted)

| Ref | FACT | Evidence |
|---|---|---|
| F19 | `DELETE /api/relationships/[id]` is a **soft archive**, not a destroy: `UPDATE member_relationships SET archived_at = NOW() … WHERE id = $1 AND member_id = $2 AND archived_at IS NULL`. | `app/api/relationships/[id]/route.ts:158–173` (read directly) |
| F20 | The four relationship routes A1 names all exist: `app/api/relationships/route.ts`, `/[id]/route.ts`, `/[id]/entries/route.ts`, `/[id]/checkin/route.ts`. Handlers on `[id]`: GET:20, PATCH:105, DELETE:158. | `find` + `grep -n "export async function"` |
| F21 | ⚠️ **Referent hazard, named not resolved.** A1 cites `relationship_spaces` as *"migration `20260630000008`"* — that migration **file** is named `20260630000008_member_relationships.sql`, and it is where `relationship_spaces` is in fact defined (`CREATE INDEX … idx_relationship_spaces_status ON relationship_spaces(steward_member_id, status)` at line ~92). A1's citation is **correct as to migration id and wrong-looking as to filename**. A future reader binding by filename will bind the wrong object. | `grep -rln relationship_spaces database/migrations/` → 3 files; `grep -niE 'archived|status' …20260630000008…` |
| F22 | `relationship_spaces` carries `status ∈ (invited, active, paused, archived)` and `consent_status ∈ (pending, accepted, declined, withdrawn)`. A two-member consent lifecycle with a **withdrawn** terminal already exists. | same migration, lines ~53–60 |
| F23 | `posture_at_creation` exists in `database/migrations/20260718000001_s5_provenance_substrate.sql` and is referenced in `lib/memory/stores/TurnsStore.ts`, `lib/services/corpusCallosumService.ts`, `app/api/sovereign/app/maia/route.ts`. A2 §7's *"already ruled"* posture semantics have a real substrate. | `grep -rln posture_at_creation` |

**NOT ESTABLISHED:** I did not verify at runtime that any of F19–F23 executes, is called, or varies
with what was apprehended. These are **code-read and schema-read facts only** (JARVIS Core §B). No
claim below rests on their runtime behaviour.

---

## 3. Proposed design — THE INSTRUMENT

### 3.0 The governing law of this instrument (RECOMMENDATION)

> ⭐⭐ **A passing test proves nothing unless it could have failed.**
>
> Every scenario below whose expected outcome is a **prohibition** — *does not persist*, *is not
> retrieved*, *is not visible* — produces a **null observation** when it passes. A null observation
> has at least four causes, and only one of them is the boundary:
>
> | | Null cause | What it actually proves |
> |---|---|---|
> | **N0** | The boundary held | ✅ the claim |
> | **N1** | **Never apprehended** — the input never reached the producer | nothing |
> | **N2** | **Never wired** — the capability does not exist, so it cannot violate | nothing |
> | **N3** | **Never loaded** — no traffic exercised the path | nothing |
> | **N4** | **Laundered** — it did persist, somewhere this probe did not look (A2 §8③) | ⛔ the opposite |
>
> ⭐ **Therefore every prohibition scenario requires a PAIRED POSITIVE CONTROL**: the same pipeline,
> with only the boundary condition removed, must be shown to *produce* the thing. Without the
> positive control, N0 and N2 are indistinguishable.

**This is not a novel standard; it is this programme's own.** A1's precondition table states it
directly: *"0 new signals at deploy+6min proves nothing in either direction; needs accumulated
traffic"* (A1 precondition 1). That is N3 named by the founder. This instrument generalizes it to
N1–N4 and requires it of every row.

**Second required discriminator — the N4 probe.** Because A2 §8③ defines persistence *semantically*
(*"whatever the table is called"*), a prohibition is not witnessed by checking the declarations
table. It is witnessed by asking: **is the assertion readable back as knowledge about the
relationship from ANY store** — logs, metrics, agent-run metadata, debug records, caches, prompt
context. A probe scoped to one table cannot falsify a semantic boundary.

**Third — the acceptance unit is behavioural, not structural.** Per A1 crosswalk RF-R5-ACCEPTANCE:
⛔ *"'Tests pass' is not the witness."*

### 3.1 Scenario matrix

Legend — **P**ersistence · **R**etrieval · **V**isibility · **A**uthority outcome.
⚖️ = settled by named authority. ❓ = **NOT SETTLED** (collected in §7).

#### Group A — the founder's named eleven

| ID | Scenario — what happens | Expected PERSISTENCE | Expected RETRIEVAL | Expected VISIBILITY | Expected AUTHORITY outcome | Settled by |
|---|---|---|---|---|---|---|
| **W-01** | **Mention.** Member says in conversation *"had lunch with Maya"*. No composer, no gesture. | ⛔ No Declaration. OBSERVED at most, **in-turn only**; nothing persists — including telemetry (F8) | ⛔ Not retrievable at any later turn | ⛔ No new person, room, or entry appears | ⛔ **Not a declaration.** OBSERVED class | ⚖️ A2 §1, §3, §8③ |
| **W-02** | **Negation.** Member submits, in the composer for relationship X, the words *"she's not my sister"*. | ✅ Declaration created; `declared_text` verbatim **including the negation** | ✅ Quotable **verbatim only** | ✅ Renders as the member's words | ✅ DECLARED as to wording. ⛔ No structured attribute derived, set, or unset from parsing it | ⚖️ A2 §2④, F12 · ❓ **may `declared_text` ever be parsed to mutate a structured field?** |
| **W-03** | **Ambiguity.** *"Things are weird with Dad."* | ✅ Declaration with that exact text | ✅ Quote + question only | ✅ Condition renders as **unknown**, which is a real condition, not emptiness | ✅ DECLARED wording. ⛔ **No condition-of-being derived** | ⚖️ F12, A5 VI IMPLICATION, A2 §3 |
| **W-04** | **Changed circumstances.** June declaration *"we've stopped calling"*; by August they speak again. Member has said nothing. | ✅ June declaration **unchanged**, not superseded, `affirmed_at` still June | ⚠️ Offerable **only as history with its date** + a question | ✅ Last-affirmed date visible | ✅ Still DECLARED; **stale ≠ false**. ⛔ System may not supersede it | ⚖️ A2 §4 (F5), §5④ · ❓ **is there a staleness horizon past which retrieval must stop rather than be dated?** |
| **W-05** | **Correction.** *"That's not what I meant."* | ✅ **New** Declaration; prior gets `superseded_by`; **both retained**; original wording never rewritten | ✅ New one current; prior only as dated history | ✅ Lineage + *what changed and when* visible | ✅ Both DECLARED; currentness differs. Member's **intent** (Correct vs Supersede) captured explicitly | ⚖️ A2 §4, §9, A1 §2, A1 §6 |
| **W-06** | **Conflicting participants.** Two members of one `relationship_spaces` row declare contradictory accounts. | ✅ Both persist, distinct, each attributed to its author. ⛔ Never merged | ⚠️ Each retrieves **their own**; cross-member retrieval needs its own consent act | ⛔ Kept distinct — *"no private interpretation may silently become shared truth"* | ⛔ MAIA **may not adjudicate** which is right | ⚖️ A1 §7, F14 · ❓ **before shared space exists, is B's declaration visible to A at all?** |
| **W-07** | **Withdrawal.** *"Stop using this."* | ✅ Row **retained**; `retrieval_consent = false` | ⛔ Retrieval stops **immediately** | ✅ Still visible **to the member**, marked *MAIA may not use this* | ✅ Still DECLARED; retrieval-ineligible | ⚖️ A2 §4, A1 §6 |
| **W-08** | **Release.** *"Remove it."* | ⛔ Destroyed — the **only** destroying path, member-initiated only | ⛔ None | ⛔ Gone | ⛔ No standing. ⭐ ⛔ Must **not** be recorded or rendered as *"the member says this was false"* | ⚖️ A2 §4, F11 · ❓ **releasing a superseded ancestor: what happens to the lineage, and is a tombstone itself a residue?** |
| **W-09** | **Expired pattern.** `relationship_entry_patterns.expires_at` passes on a pattern the member had recognized. | ⚠️ Pattern row persists (advisory) | ⛔ Not offered as current after expiry | ⛔ Not shown as present-tense | ⛔ INFERRED class — no authority before RF-R6 at all | ⚖️ A2 §3, A1 RF-R6 row · ❓ **may a system clock expire a MEMBER-RECOGNIZED pattern? F5 says no system process may perform a member act** |
| **W-10** | **Imported text.** Member pastes an email/journal into the room. | ✅ Persists as **IMPORTED** | ⛔ Requires its own consent act | ✅ Labelled imported | ⛔ **Never speaks as the member's word** | ⚖️ A2 §3 · ❓ **paste-into-the-composer is the laundering vector — see W-10b** |
| **W-10b** | **Paste-into-composer.** Member copies text (possibly MAIA's own prior sentence) into the declaration composer and submits it. Gesture witness is genuine; wording is *"submitted"*. | ❓ | ❓ | ❓ | ❓ **A2 §2④ says DECLARED ("the member's exact submitted words"); A2 §3 says IMPORTED ("from another surface or system"). Both apply.** This is the one path by which model output can acquire declaration standing | ❓ **NOT SETTLED — highest-severity row in this document** |
| **W-11** | **Rejected MAIA observation.** MAIA offers *"you sound distant"*; member says *"no, that's wrong."* | ❓ Carrying the rejection forward **requires persisting something about an OBSERVED assertion** | ⛔ MAIA must not re-offer the rejected observation | ✅ A1 §5 promises *"I will carry the correction forward"* | ❓ | ❓ **A1 §5 and A2 §8③ collide — see §5 C-1** |

#### Group B — cases the architecture invites (steward-named)

| ID | Scenario | PERSISTENCE | RETRIEVAL | VISIBILITY | AUTHORITY outcome | Settled by |
|---|---|---|---|---|---|---|
| **W-12** | **Sanctuary declaration.** Member performs the full composer gesture during a Sanctuary session. | ⛔ **None.** No Declaration, and no telemetry carrying `declared_text` | ⛔ None | ❓ Is the member told **before** (composer unavailable) or **after** (submitted then discarded)? | ⛔ No standing. *"The gesture is real, but the containment boundary is absolute"* | ⚖️ F9, CLAUDE.md Sanctuary Invariant 6 · ❓ **structural unavailability vs accept-and-discard** |
| **W-13** | **Subject is also a member.** Kelly declares about Jondi, who has an account. | ✅ Persists in **Kelly's** field only | ✅ Kelly's MAIA only | ⛔ Jondi must not see it, be notified, or have it enter his field | ✅ DECLARED for Kelly; **zero standing** in Jondi's field | ⚖️ A5 IX BOUNDARY, A1 §7 · ❓ **does Jondi's membership create any right of notice, objection, or erasure? — A5 IX declares this open by its own text (F15)** |
| **W-14** | **Declared twice, different wording, neither superseded.** Two standing sibling declarations on one relationship. | ✅ Both persist; neither supersedes the other — **no member act said so** | ❓ Both current under A2 §5. Offer both? Most recent? Neither? | ✅ Both visible | ❓ **Choosing the most recent IS a system-inferred supersession — forbidden by F5.** There is no uniqueness rule for "the current declaration" | ❓ **NOT SETTLED** |
| **W-15** | **Correction contradicting a standing sibling.** D1→D1′; D1′ now contradicts untouched D2. | ✅ D1 superseded, D1′ current, D2 **untouched and still current** | ⚠️ A contradictory pair is retrievable | ✅ Both visible | ❓ **No cascade rule — and any cascade would be a system-performed Supersede (F5).** MAIA may surface the contradiction as a question (A1 §3) but may not resolve it | ❓ **NOT SETTLED** (the *question* posture is ⚖️ A1 §3; the *record* outcome is not) |
| **W-16** | **Withdrawal race.** Member withdraws at T; a response that already retrieved the declaration is mid-generation and emits at T+ε. | ✅ Withdrawal recorded at T | ❓ *"Immediately"* is undefined as to **evaluation point**: request start · retrieval · each token · post-emission redaction | ⛔ Member sees withdrawn content **after** withdrawing — precisely the experience the mechanism exists to prevent | ❓ F10's no-cache rule helps but does not settle in-flight emission | ❓ **NOT SETTLED** |
| **W-17** | **Subject relationship deleted.** Today (F19) `DELETE` soft-archives. A true Release at relationship level has no route. | ❓ `relationship_id` is NOT NULL (F2), so hard delete must either cascade-destroy declarations or be refused | ❓ Do an archived relationship's declarations stay retrievable? | ⚠️ A5 VII: *"Deletion may not be the only available form of completion"* — archiving is completion, **not recantation** | ❓ **Both branches fail without a ruling:** if archive silently clears consent, that is a system-performed **Withdraw** (⛔ F5); if it does not, MAIA may quote a relationship the member has put away | ❓ **NOT SETTLED** |

#### Group C — additional adversarial cases (JRF-07)

| ID | Scenario | PERSISTENCE | RETRIEVAL | VISIBILITY | AUTHORITY outcome | Settled by |
|---|---|---|---|---|---|---|
| **W-18** | **Assent as declaration.** MAIA asks *"is that still how it is?"*; member answers **"yes."** A2 §5 says the answer *"is itself a gesture, and therefore may produce a new Declaration."* | ❓ `declared_text = "yes"` is uninterpretable alone; storing MAIA's question with it puts **model wording inside a declaration** — ⛔ barred by A2 §2④ | ❓ | ❓ | ❓ **The loop A2 §5 celebrates is exactly where model language can enter `declared_text`.** RECOMMENDATION: *yes* is an **Affirm** (updates `affirmed_at`), never a new Declaration; only member-composed wording creates one | ❓ **NOT SETTLED** |
| **W-19** | **Accidental / regretted wording.** Typo, mis-submit, or words the member is ashamed of. `declared_text` is write-once and correction never rewrites. | ✅ Permanent unless Released | ⚠️ Correctable forward only | ⚠️ The regretted wording remains in the visible lineage | ⚠️ Release is available (⚖️ A2 §4) — but it destroys, and the lineage then has a hole | ⚖️ A2 §4/§9 · ❓ **is there any remedy between "permanent in the visible lineage" and "destroyed"?** Also: no stated validation for empty/whitespace `declared_text` |
| **W-20** | **Third-party characterization inside a genuine declaration.** *"My brother is a narcissist."* | ✅ DECLARED — an authentic member gesture with member wording | ❓ May MAIA **quote it back**? | ⚠️ Survives the F13 prefix (*"In my experience, my brother is a narcissist"*) — so it is renderable | ❓ Quoting is not asserting; but the utterance **carries** a third-party diagnosis, adjacent to ⛔ F14 *"diagnose the other person"* | ❓ **NOT SETTLED** — A5 IX admits the member's memory; nothing rules on MAIA re-voicing it |
| **W-21** | **Crisis content under write-once + never-delete.** A declaration containing a self-harm disclosure is permanent, consented, and offerable at an arbitrary later moment (*"You wrote in June: …"*). | ✅ Permanent | ❓ `retrieval_consent` governs **permission**, not **appropriateness of moment** | ⚠️ | ❓ **Is any content class retrieval-ineligible regardless of consent?** A1/A2/A5 are all silent | ❓ **NOT SETTLED** |
| **W-22** | **Repudiation ≠ Release.** *"I didn't write that"* — shared device, another person used an authenticated session. The gesture witness proves a **session** acted (F2), not that the named human authored it. | ✅ Row stands | ❓ | ❓ | ❓ **None of the five acts fits.** The closest, Release, is explicitly ⛔ *not* a statement that the original was false (F11) — but repudiation is precisely the claim that it was never the member's. Is there a **sixth act**? | ❓ **NOT SETTLED** |
| **W-23** | **Referent drift on the relationship object.** Member edits the relationship's person identity, or reuses a room for a different person of the same name. | ⚠️ Immutable declarations, bound by `relationship_id`, **silently retarget to a different human** | ⚠️ Retrieved as if about the new referent | ⚠️ No fork, no break in history | ❓ **Names are not identity** — this project's own discipline. Nothing requires identity change to fork the object | ❓ **NOT SETTLED** |
| **W-24** | **Translation / normalization on quote-back.** Member declares in Spanish; MAIA offers it back in English. | ✅ Stored verbatim | ⛔ Translating a quote **is** model-rewriting it (⛔ A2 §2④) | ⚠️ | ⚠️ RECOMMENDATION: quote verbatim; any gloss is separate and labelled as MAIA's | ⚖️ A2 §2④ + CLAUDE.md Invariant 14 (cultural sovereignty) — **INFERENCE**, not an explicit ruling |
| **W-25** | **Withdrawn-but-influential.** A withdrawn declaration silently shapes MAIA's response without being quoted. | ✅ Row retained | ⛔ **This is retrieval.** Influence without quotation is exactly the *"read back as knowledge about the relationship"* that F8 forecloses | ⛔ | ⛔ Prohibited | ⚖️ A2 §4 + §8③ — **settled; recorded because it is the most tempting violation and the hardest to observe** |
| **W-26** | **Flood.** Several declarations on one relationship within one session. | ❓ Distinct declarations, or one composition? No debounce or session-grouping rule stated | ❓ Compounds W-14 | ⚠️ | ❓ Any auto-grouping would be system-inferred supersession (⛔ F5) | ❓ **NOT SETTLED** (subordinate to W-14) |
| **W-27** | **Export / portability.** Declarations are the member's own words; no export exists. | ✅ | ❓ | ❓ | ❓ Already a live founder decision | ⚖️ **venue exists** — A4 §7⑤ (F18). Not re-asked here |
| **W-28** | **Member account deletion.** Declarations naming living third parties, authored by a departing member. | ❓ | ❓ | ❓ | ❓ No authority in A1/A2/A5 speaks | ❓ **NOT SETTLED** |

### 3.2 The falsifiers — per scenario, what distinguishes a held boundary from an unexercised one

⭐ Read this table as the **acceptance half** of the instrument. A scenario without its row here is
not a witness.

| ID | ⛔ The false pass (what a null result would look like if nothing was ever wired) | ✅ Required discriminator — the paired positive control + N4 probe |
|---|---|---|
| W-01 | No declaration exists after a mention — but MAIA never apprehended the sentence (N1), or the observer isn't running (N2) | MAIA's **in-turn response must demonstrably reference Maya** (proves apprehension), AND a semantic sweep of every store must show the assertion unreadable afterwards. Positive control: the same member, same session, **using the composer** produces a declaration |
| W-02 | No structured field changed — but no parser was ever built (N2) | Submit a negation and a **matching affirmation** (*"she is my sister"*). If neither changes a structured field, show that a structured field **can** be set by its own gesture. Otherwise you proved only that parsing is absent, not that it is refused |
| W-03 | No condition derived — but no condition-derivation code path exists at all | Show the condition surface renders **unknown as a condition** (A5 VI), not as an empty state. Positive control: a member-declared condition renders |
| W-04 | Stale declaration not offered — but retrieval never fired (N3) | Require an **observed offer** carrying *"You wrote in June: …"* with the date. A silent turn is N1/N3, not restraint |
| W-05 | Correction produced a new row — but Correct and Supersede are indistinguishable in the record | **Two otherwise identical edits with different declared intents must produce different stored meaning.** If the schema cannot represent the difference, F4 was never implemented |
| W-06 | Accounts not merged — but only one member ever declared (N3) | Requires **two authenticated members**, both declaring, contradictorily, on one `relationship_spaces` row (F22). Anything less is untested |
| W-07 | Retrieval returned nothing post-withdrawal — indistinguishable from *never retrievable* | ⭐ **Mandatory paired probe:** identical retrieval **before** withdrawal must return the declaration; **after**, must not. One-sided evidence is worthless |
| W-08 | Row gone — but was it Released, or never created? | Confirm existence + retrievability first, then Release, then re-probe. Additionally: confirm ⛔ **no surface renders the release as a recantation** (F11) |
| W-09 | Expired pattern not offered — but patterns are pre-RF-R6 and never offered anyway (N2) | Cannot be witnessed before RF-R6. **Record as untestable-by-construction today** rather than passing it |
| W-10 | Imported text not spoken as member's word — but nothing ever speaks any text (N2) | Positive control: a DECLARED assertion **is** quoted in MAIA's voice in the same session, while the IMPORTED one is not |
| W-10b | Either outcome looks correct because both authorities can be cited | ⭐ **Not falsifiable until ruled.** Requires a founder ruling before it can be witnessed at all — the defining case for §7 |
| W-11 | MAIA doesn't re-offer the rejected observation — because she never remembered it (which is F8-compliant but breaks A1 §5's promise) | ⭐ **The discriminator IS the conflict:** if MAIA does carry it forward, F8 is violated; if she does not, A1 §5's sentence is false. **Exactly one must be given up.** No implementation can pass both |
| W-12 | No declaration after a Sanctuary gesture — but the composer wasn't present, so no gesture occurred (N1) | Requires the **gesture to be genuinely performed** in Sanctuary posture, then a semantic sweep for `declared_text` anywhere. Positive control: the identical gesture in normal posture creates one. If the composer is structurally absent, that is a **stronger** result — record it as *structurally impossible*, not as *tested and refused* |
| W-13 | Jondi sees nothing — but Jondi never logged in (N3) | **Jondi must authenticate and load his own field** while Kelly's declaration exists. Absence from an unvisited surface is N3 |
| W-14 | MAIA offers one declaration and it seems fine | ⭐ Requires **two standing unsuperseded declarations with different wording**, then observation of what is offered. Whatever is offered reveals an unruled policy — **any** outcome here is a finding |
| W-15 | Nothing cascaded — but nothing cascades in any case (N2) | Requires D2 to be **shown retrievable before** the D1→D1′ correction and re-probed after. Otherwise the absence of cascade is untested |
| W-16 | Withdrawal during a quiet session emits nothing | ⭐ **Only witnessable when withdrawal is issued during an in-flight generation that has already retrieved the declaration.** A withdrawal with no concurrent turn proves nothing and must not be recorded as a pass |
| W-17 | Archived relationship's declarations not offered — but nothing was offered before archiving either | Probe retrieval **before** archive (must return), archive, probe again. Then separately check whether `retrieval_consent` changed — if it did, ⛔ a system performed a member act (F5) |
| W-18 | *"Yes"* produced something reasonable-looking | Inspect the stored artifact: if `declared_text` contains **any word MAIA generated**, A2 §2④ is violated regardless of how good the result reads |
| W-19 | Member corrected it and moved on | Confirm the regretted original **remains visible** in the lineage. If it is hidden, correction is silently rewriting history (⛔ A2 §9) |
| W-20 | MAIA never quoted it | Positive control: a **non-characterizing** declaration on the same relationship **is** quoted back in the same session. If neither is quoted, quoting is simply absent (N2) |
| W-21 | Nothing bad surfaced | Requires an actual crisis-content declaration, consented, and a subsequent unrelated conversation on that relationship. **Untestable without deliberately constructing it** — flag as such rather than pass by omission |
| W-22 | The member Released it and appeared satisfied | Check whether the record anywhere states or implies the experience was false (⛔ F11), and whether the member had any way to say *"this was not mine"* distinct from *"remove it."* Absence of the option is the finding |
| W-23 | History looks continuous after an identity edit | Edit the person identity, then re-read prior declarations. **Continuity here is the failure, not the pass** |
| W-24 | The quote read well in English | Compare the emitted quote byte-for-byte against `declared_text`. Any difference — translation, casing, punctuation, ellipsis — is a rewrite |
| W-25 | ⭐ **The hardest.** The response was appropriate and quoted nothing | Requires a **differential**: identical prompt and turn, one member-state with the withdrawn declaration present, one without. **If the two responses differ, the withdrawn assertion was used.** Nothing else can detect it |
| W-26 | One declaration appeared where several were submitted | Count declarations against gestures. Any collapsing is system-inferred grouping |
| W-27 | — | Out of scope; venue is A4 §7⑤ |
| W-28 | — | Untestable pre-implementation; recorded as an open gap |

### 3.3 Three scenarios that CANNOT be witnessed and must be labelled so

**RECOMMENDATION.** These must be recorded as *untestable by construction today* rather than
counted as passes:

1. **W-09** — inferred patterns have no authority before RF-R6, so their expiry cannot be exercised.
2. **W-10b** — not falsifiable until the DECLARED/IMPORTED collision is ruled; the instrument cannot
   test a boundary that has two authorities pointing opposite ways.
3. **W-11** — cannot pass. A1 §5 and A2 §8③ cannot both be satisfied (§5 C-1).

⭐ *Recording an untestable scenario as untestable is the completion state. Counting it as a pass is
the failure this instrument exists to prevent.*

---

## 4. Risks and falsification cases — what would prove THIS INSTRUMENT wrong

| # | What would falsify this document | Consequence |
|---|---|---|
| 1 | A founder ruling exists, prior to 2026-08-13, that already settles a row I marked ❓ | That row is **below the authority boundary** and I over-escalated. Per CLAUDE.md founder-escalation rule 1, the search should have found it. I searched A1/A2/A4/A5 only — **I did not sweep the full canon**, so this risk is live |
| 2 | The DECLARED/IMPORTED collision (W-10b) has an obvious reading two competent implementers would agree on | Rule 2 fails; it drops below the boundary and should not be asked |
| 3 | A1 §5's *"carry the correction forward"* is intended as future-tense RF-R6 language, not a present commitment | C-1 dissolves into sequencing, not conflict |
| 4 | Any scenario here is impossible in the designed schema | Then it is a **stronger** result — structural impossibility (A2 §6 doctrine) — and should be re-recorded as such, not deleted |
| 5 | My N0–N4 taxonomy misses a null cause | The paired-control requirement is necessary but insufficient; the instrument under-tests |
| 6 | The instrument itself becomes a checklist that is run once and marked green | ⛔ **The dominant risk.** A1 crosswalk RF-R5-ACCEPTANCE already names it: *"'Tests pass' is not the witness."* |

⚠️ **Self-directed:** this document is a design artifact reasoning about a schema that **does not
exist** (A2 closing: ratification *"is not that the schema exists"*). Every expected outcome is a
prediction about an unbuilt system. It has the same epistemic status as the design it examines —
**no more**.

---

## 5. Constitutional conflicts — named, NOT resolved

### C-1 ⭐⭐ A1 §5 vs A2 §8③ — the rejected-observation contradiction (W-11)

- **A1 §5** lists among member-recognized patterns: *"You corrected my earlier understanding; I will
  carry the correction forward."*
- **A2 §8③** rules OBSERVED assertions **in-turn only** before RF-R6, and its anti-laundering clause
  forecloses preserving *"the semantic assertion in another guise… whatever the table is called."*

Carrying a correction forward requires persisting **what was corrected** — an OBSERVED assertion,
plus the fact of its rejection, at member level, across turns. ⛔ That is precisely what §8③ bars.

**INFERENCE:** these cannot both hold before RF-R6. A1 §5's own preamble (*"only after multiple
attributable moments exist"*) is an RF-R6 item, which may reconcile it as sequencing — but A2 §8③
governs the interim and A1 §5 states the sentence unconditionally. ⛔ **I do not reconcile this.**

### C-2 A2 §2④ (DECLARED = "exact submitted words") vs A2 §3 (IMPORTED = "from another surface")

W-10b. **The two clauses are internally inconsistent for pasted text.** Because A2 §3 declares the
classes *disjoint* and *unchangeable*, a text that satisfies both definitions cannot be classified
without a ruling. ⭐ This is the **only** path by which model-generated language can acquire
declaration standing, which makes it the highest-severity conflict in the document.

### C-3 A2 §5's closing loop vs A2 §2④'s no-model-rewriting rule

W-18. §5 says the member's *answer* may produce a new Declaration; §2④ requires immutable
member-authored wording. A one-word answer has no standalone wording. The loop's closure and the
wording rule pull opposite ways.

### C-4 A5 IX (member's memory admissible) vs A5 VIII (MAIA may not diagnose the other person)

W-20. IX admits *"I felt abandoned when he left"* — and, by the same logic, *"my brother is a
narcissist"* as the member's own speech. VIII bars MAIA from diagnosing. **Whether MAIA quoting the
member's diagnosis back constitutes MAIA diagnosing is unresolved.** A4 §6 already records the
parallel unresolved question for `ruptured` (*"genuinely arguable and this brief does not resolve
it"*).

### C-5 Constitutional silence on Sanctuary vs A2 §7's absolute Sanctuary bar (W-12)

A2 §7 bars Sanctuary declarations absolutely; the Constitution names Sanctuary **0 times** (F17).
⛔ Ratifying A5 unamended would freeze that silence into canon while A2 depends on it. **Already a
live founder decision at A4 §7① — recorded here as a dependency, not re-asked.**

### C-6 F19 vs A2 §4 — "deletion" already exists and means something else

`DELETE /api/relationships/[id]` **soft-archives** (F19). A2 §4 reserves *deletion* for **Release**,
a member act that destroys. ⛔ The same word already denotes two different acts across the design and
the code. Per the project's own discipline: **names are not identity.**

### C-7 F21 — citation/filename referent hazard

A1 cites `relationship_spaces` as migration `20260630000008`; the file is named
`…_member_relationships.sql` and defines **both** names in the vicinity. ⚠️ Named, not resolved.

---

## 6. Reuse opportunities — substrate that exists and must not be duplicated

**RECOMMENDATION — this instrument must consume, never re-invent:**

| Existing | Use for | Do not |
|---|---|---|
| `relationship_spaces.consent_status ∈ (pending, accepted, declined, **withdrawn**)` (F22) | ⭐ W-06 and W-13 already have a **two-member consent lifecycle with a withdrawn terminal**. The scenarios should be constructed against it | ⛔ Do not invent a second cross-member consent model |
| `posture_at_creation` substrate (F23) | ⭐ W-12's Sanctuary discriminator: the sweep is for `declared_text` carried alongside a `sanctuary` posture | ⛔ Do not backfill it (A2 §7) |
| `archived_at` soft-archive (F19) | W-17's *"deleted"* case is **archive** today. Build the scenario against the act that exists | ⛔ Do not assume a hard delete exists |
| `relationship_entry_patterns.expires_at` | W-09 | ⛔ Do not invent decay (A1 reuse note) |
| Consent-gate precedent — atoms `return_preference`, Daily Anchor `surface_preference` (A2 §7) | `retrieval_consent` shape, and the W-07 paired probe | ⛔ Do not invent a third gate shape |
| ⭐ **The default-private + explicit-opt-in verification pattern** already executed for Daily Anchor (CLAUDE.md, 2026-07-03: six proofs — schema+ledger, default-private, authenticated opt-in, authenticated return, MAIA-follows-consent) | ⭐⭐ **This is the closest existing analogue to the W-07 paired probe and it already exists as a run procedure.** Reuse its shape | ⛔ Do not author a new verification methodology |
| ⚠️ The **correction attached to that same record** (CLAUDE.md 2026-08-09: mechanism verified ≠ in use by members) | The standing rule *"LIVE means code + schema deployed and exercised; it does not mean in use by members"* applies to **every** row in §3.1 | ⛔ Do not let a constructed proof read as member use |

---

## 7. Unresolved founder decisions

⭐ These are the rows where **no authority settles the outcome**. Each is one question of principle
carrying a recommended ruling. ⛔ None offers *hold / skip / decide later*.

| # | Question of principle | Recommended ruling | Rows |
|---|---|---|---|
| **D1** | ⭐⭐ **When a member pastes text into the declaration composer, is the product DECLARED or IMPORTED?** | **IMPORTED**, unless the composer can evidence the member composed in it. The gesture is authentic but the *wording* is not member-authored, and §2④'s anchor is the wording, not the click. ⛔ Otherwise paste is a laundering path for MAIA's own sentences into member standing | W-10b, C-2 |
| **D2** | ⭐ **May a one-word assent (*"yes"*) create a Declaration?** | **No — it is an Affirm.** Only member-composed wording creates a Declaration. Anything else puts model language inside `declared_text` | W-18, C-3 |
| **D3** | ⭐⭐ **Before RF-R6, may MAIA carry forward the fact that the member rejected one of her observations?** | **No** — §8③ governs the interim; A1 §5's sentence is **RF-R6 language and must be marked as such**. ⛔ Do not weaken the anti-laundering clause to keep a nicer sentence true | W-11, C-1 |
| **D4** | **When two declarations stand on one relationship, neither superseded, what may MAIA offer?** | **Both, dated, or neither** — never the most recent alone. Preferring recency is a system-inferred supersession (⛔ F5) | W-14, W-26 |
| **D5** | **When a correction contradicts a still-standing sibling declaration, what happens to the sibling?** | **Nothing.** ⛔ No cascade. MAIA may surface the contradiction **as a question** (A1 §3) and may never resolve it | W-15 |
| **D6** | ⭐ **At what point is retrieval eligibility evaluated relative to a response already in flight?** | **At every emission boundary, and withdrawal must interrupt an in-flight response.** A withdrawal the member watches fail is the failure the mechanism exists to prevent | W-16 |
| **D7** | ⭐ **Does archiving a relationship affect its declarations' retrieval eligibility?** | **Retrieval stops while archived; `retrieval_consent` is NOT modified.** Eligibility is computed (F10), so archive is an input to the computation — ⛔ never a system-performed Withdraw | W-17, C-6 |
| **D8** | ⭐ **Is there a sixth member act — Repudiate — for *"I did not author this"*?** | **Yes.** Release must not be the only exit, because §9 expressly forbids reading Release as *"this was false"* — leaving repudiation unrepresentable | W-22 |
| **D9** | **Must changing a relationship's person identity fork the object?** | **Yes** — prior declarations stay bound to the prior referent. ⛔ Silent retargeting makes immutable wording describe a different human | W-23 |
| **D10** | **Is any content class retrieval-ineligible regardless of `retrieval_consent`?** | **Yes** — consent governs permission, not the appropriateness of a moment. Crisis-content re-offer needs its own gate | W-21 |
| **D11** | **May `declared_text` ever be parsed to set or unset a structured relationship attribute?** | **No.** Parsing member wording into structure is derivation, and A5 VI bars system-derived conditions | W-02 |
| **D12** | **May a system clock expire a pattern the member explicitly recognized?** | **No.** ⛔ F5 bars system processes from performing member acts; recognition is a member act, so only the member can end it | W-09 |
| **D13** | **Does a subject who is also a member acquire any right of notice, objection, or erasure over a declaration naming them?** | **No** — A5 IX settles the private-memory side, and requiring the other person's participation is the failure IX names. ⚠️ But A5 IX **itself declares the surrounding question open** (F15); this ruling should be recorded as **bounded to declarations**, not to the open unit | W-13 |
| **D14** | **May MAIA quote back a member's characterization of a third party?** | **Yes, verbatim and attributed to the member, never paraphrased and never extended.** Quoting the member is rendering the member; ⛔ any restatement becomes MAIA's own claim about the person | W-20, C-4 |
| **D15** | **In Sanctuary, is the declaration composer unavailable, or available-and-discarded?** | **Unavailable.** A2 §6's own doctrine: ⭐ *prefer a boundary whose shape makes the violation impossible over one that forbids it* | W-12 |

⚠️ **Below the boundary, therefore not asked:** the D1–D15 *implementations*; the empty-`declared_text`
validation rule (W-19); release-tombstone mechanics (W-08); flood grouping (W-26 — a consequence of
D4); translation-on-quote (W-24 — settled by A2 §2④ + Invariant 14). ⛔ **Already has a venue, not
re-asked:** portability (A4 §7⑤), Sanctuary in the Constitution (A4 §7①).

---

## 8. Dissent and uncertainty

**8.1 Where I dissent from the design authority.**

⭐ **A2 §6 claims promotion is *"structurally unavailable"* — I find that claim stronger than its
evidence.** §6 reasons that a Declaration cannot be constructed after the fact because it needs a
gesture witness and immutable member wording. ⚠️ But **W-10b shows a live path**: a member pastes
model output into the composer and submits it. The gesture witness is genuine. The wording is
*"submitted."* Nothing is manufactured, nothing is backdated — and inference has acquired
declaration standing through a legitimate front door.

⭐ **Structural unavailability is a property of the whole surface, not of the record's constraints.**
A2 §6 proves the *back* door is sealed. It does not establish that the *front* door only admits
member-authored language. Until D1 is ruled, §6's central claim is **overstated**.

**8.2 Where I disagree with myself.**

- D1's recommendation (**IMPORTED**) may be unimplementable and paternalistic: a member who
  legitimately drafts elsewhere and pastes is doing nothing wrong, and *"evidence the member composed
  in it"* is keystroke surveillance — ⛔ which this project should not build. ⚠️ **I recommend the
  ruling and simultaneously doubt its mechanism.** It may be that the honest answer is DECLARED with
  a visible *pasted* provenance marker, which I did not recommend because it re-introduces
  label-as-provenance — the exact error A2 exists to end. ⭐ **I could not find a third option and I
  am not confident either of these two is right.**
- D8 (a sixth act) adds to a set A2 ratified as five. Adding to a ratified enumeration is a heavier
  act than I am comfortable recommending, and I recommend it only because Release's own §9 precision
  makes repudiation unrepresentable — **the gap is created by the safeguard.**

**8.3 NOT ESTABLISHED.**

- Whether any scenario is reachable in the **current** system — the schema does not exist (A2
  closing) and I ran no runtime witness.
- Whether canon **outside A1–A5** already settles any ❓ row. ⚠️ **I searched only the five
  authorities.** Per the founder-escalation rule, an existing instrument may already supply several
  of D1–D15, which would mean I over-escalated. ⭐ **This should be checked before any of §7 reaches
  the founder.**
- Whether A1 §5's sentence was intended as present commitment or RF-R6 language (C-1's disposition
  turns entirely on this, and only the founder can say).
- Runtime behaviour of F19–F23. **Code-read and schema-read only.**

---

**END.** ⛔ No source artifact was modified. ⛔ No document changed status. ⛔ No code was written.
⛔ No remedy was implemented. This file is the only artifact produced.
