# NW-D01 — LARRY DOCTRINE RECONCILIATION

**Unit**: NW-D01 · **Date**: 2026-08-26 · **Mode**: doctrine and retrieval only. No product built.
**Precedes**: NW-D01.5 (relational architecture)

---

## UNIT / STATUS

**COMPLETE AS FAR AS THE REPOSITORY PERMITS — which is not far enough to close the unit.**

D01 asks what Larry actually believes, teaches and does. **That cannot be established from
Soullab's own documents**, and the governing instrument already says so: *"if it's not on the
list, it's not in the system"*, and the list does not exist. This unit therefore delivers what
the record **can** establish, and a precise statement of what only Larry can answer — rather
than a doctrine synthesized from our own synthesis, which the corpus audit named as the failure
mode that compounds error.

## GOVERNING RULINGS IN FORCE

- **Larry Materials Agreement v1.2** (2026-07-15, **UNSIGNED**): *"Attachment A: Materials
  inventory (built together, item by item)"* · *"If it's not on the list, it's not in the
  system"* · *"Nothing moves — no book ingested, no client enters — until both versions are
  signed."*
- **Attachment A instrument v0 §5 gate**: no ingestion, no `docs/fields/larry/` runtime content,
  and no Now What? surface implying Larry-specific material until the table is populated **with
  Larry** and both versions are signed.
- **Larry-supremacy rule** (master programme §XXVII): Larry governs philosophy unless doing so
  creates an explicit safety or integrity problem.
- **Founder ruling, 2026-08-26**: *Larry's duties are not automatically MAIA's duties.* The
  platform must not obstruct his professional obligations, and must not silently impersonate that
  professional role.

## SOURCES / EVIDENCE

Repository only. **No new external retrieval; no out-of-repo filesystem access** (this session
runs in a cloud container, not on the founder's machine — the Desktop/Downloads artifacts the
corpus audit inventoried are not reachable from here and were **not** re-verified).

- `docs/reviews/LARRY_IP_CORPUS_INVENTORY_AUDIT_2026-08-03.md` (197 lines) — the central document
- `docs/governance/LARRY_ATTACHMENT_A_INSTRUMENT_v0.md` · `LARRY_SOURCE_AND_CUSTODY_SITTING_AGENDA_v1.md`
- `docs/fields/larry/` — 7 documents + a 6-part experience audit (~2,600 lines)
- `scripts/seed/seed-flourishing-field.ts` · `database/migrations/20260805200001_flourishing_dimension.sql`
- `app/now-what/work/page.tsx`

---

## FINDINGS

### D01-F1 — ⚠️ NW-R01-F1 IS SUBSTANTIALLY WRONG. The six domains are Larry's.

**This corrects my own R01 finding, and the correction matters.**

R01 concluded the six shipped domains were *"an unattributed hybrid"* that dropped VanderWeele's
material stability, converted character & virtue into contribution, and *"added Time (no research
pedigree)"*. **I measured them against the wrong yardstick.** They were never meant to be
VanderWeele.

Per the corpus audit §3a, Larry's actual landscape as reported by the founder is:

| # | Larry's dimension | Shipped today (`work/page.tsx:48`) |
|---|---|---|
| 1 | Relationships | `relationships` ✓ |
| 2 | Meaning and Purpose | `meaning` ✓ |
| 3 | **Time Affluence** | `time` ✓ |
| 4 | Presence | `presence` ✓ |
| 5 | **Health and Energy** | `health` ✓ |
| 6 | Contribution | `contribution` ✓ |

**All six match.** The "Time" I flagged as having no research pedigree is **Time Affluence —
Larry's own dimension**, and the shipped set is his framework, not a hybrid of the literature.

**The drift the audit found has been repaired in the runtime path.** On 2026-08-03 the audit
measured a 3-way error in `seed-flourishing-field.ts`: *"Attention"* invented, Time Affluence and
Health & Energy dropped. The migration CHECK constraint (2026-08-05) and the My Work room both
now carry Larry's six, and "Attention" is gone from them.

**What R01 got right and still stands**: the domains are **unvalidated** and **unlicensed**. See
D01-F3 and D01-F4. The observation that dropping material stability presupposes a materially
secure member also stands — but it is now correctly a **question for Larry about his framework**,
not a defect in an invented taxonomy.

### D01-F2 — 🔴 The repaired drift was never repaired in the seed. Two vocabularies are live.

`scripts/seed/seed-flourishing-field.ts:45` and `:70` **still declare the wrong five**:

> *"cultivated across five practice domains: attention, relationships, meaning, contribution, and presence"*

Three weeks after the audit named this exact file and this exact error, and three weeks after the
runtime path was corrected. **The repository currently holds two competing Flourishing
vocabularies** — Larry's six in the migration and the room, Soullab's invented five in the seed
that writes a practitioner field's `about_practice` text.

The audit records the seed as unrun in production, so this is not (yet) a member-facing defect.
But it is a loaded one: **the seed is the file that would author a Larry field**, and it would do
so in vocabulary the audit has already shown to be wrong. Per the Attachment A gate this file
should not run at all before signature; it should not be *able* to write the wrong five if it
ever does.

### D01-F3 — The six domains have never been validated, and the one attempt was compromised

Attachment A v0 §0 records that the Charter Workbook PART III **pre-filled Soullab's wrong five
as tickboxes and asked Larry to confirm them** — a leading instrument, and *"any answer it
collected is compromised."*

So the domains' status is: correct in the runtime path **on the strength of a founder report of
Larry's talk**, never confirmed by Larry against a held source, and with the single validation
attempt on record ruled invalid. The commits already say this — `bdac224ab` *"unattributed
pending Larry's validation"* — and it remains true.

The instrument's own instruction for the sitting: **"The six domains — must be captured in
Larry's own language, not confirmed against ours."**

### D01-F4 — Larry's authored corpus has never been ingested. The gate is unmet.

| Artifact | Held? |
|---|---|
| Rights instrument (Materials Agreement v1.2) | Exists, **UNSIGNED** |
| Attachment A inventory | **Does not exist** |
| Larry's presentation deck | **Not held** — reviewed by the founder, never ingested |
| Larry's talk corpus (the six domains' source) | **Not held** — described, did not arrive |
| Interview raw recording/transcript | **Not held** — an interview occurred; source elsewhere |
| Interview derived highlights (`Larry:` quotes) | Exists as **class D**, Soullab-compiled |
| Books / manuals / worksheets / exercises | **None held** |
| Harvard PSY 1060 slides + ~44 readings | Held, and **⛔ NOT Larry's** — Prof. Jason Mitchell's course; class C, never ingestible |

**Everything in `docs/fields/larry/` is Soullab synthesis, correctly labeled as such.** The only
Larry words in the repository are two framing sentences in a demo spec.

### D01-F5 — 🔴 Larry's professional scope, referral practice and obligations are ENTIRELY ABSENT

Searched the whole Larry corpus for `referr|licensed|credential|therapist|scope of practice|
professional obligation|out of scope`. **Nothing.** The custody sitting agenda's four sections —
Origin, Landscape, Lineage, Practice wisdom — **do not ask about scope or referral either.**

This is the single most consequential gap for the programme as sequenced, because:
- **NW-S01 gap 4** (*"Larry's own obligations… may create duties the product must not obstruct"*)
  cannot be closed.
- **NW-R02-C2** (ICF requires referral capability; the environment has none) cannot be resolved —
  we do not know whether Larry holds an ICF credential, another credential, or none, and
  therefore which professional obligations actually attach.
- The founder's handoff-boundary ruling cannot be drawn without knowing where Larry's side of it
  is.

**The sitting agenda needs a fifth section before the sitting happens.** That is this unit's most
actionable output.

### D01-F6 — What Larry's purpose IS, as far as class-D evidence permits

From the speaker-labeled highlights (`Now_What_Development_Package.docx`, **class D — derived,
Soullab-compiled, raw source not held**):

> *"People spend decades building businesses, raising families, and achieving success, then wake
> up asking: 'Now what?'"* · *"What got me here is not going to get me there."* · *"The work
> creates clarity and confidence."* · **"The relationship with the practitioner must remain
> primary."**

Plus a developmental journey map: **Achievement → Disorientation → The Question → …**, and (per
the founder's report of the talk) the thesis *"What comes after Success — Now What?"* and the
unifying claim **"Flourishing is not a destination. It is a practice."**

**Three things follow, and each is corroborated elsewhere in the programme:**

1. *"The relationship with the practitioner must remain primary"* is **Larry's own sentence**, and
   it independently confirms the founder's relational re-centering, the recovered **D-A** ruling
   (*"this prevents the AI layer from becoming the center"*), and **SDT's relatedness** finding
   from R01. Four independent lines agreeing is as close to doctrinal bedrock as this programme
   has.
2. *"Flourishing is a practice, not a destination"* is a **direct refusal of the score**, from the
   practitioner himself. Every no-metric ruling in the codebase now has Larry's own framing behind
   it rather than only Soullab's discipline.
3. **Achievement → Disorientation → The Question** is a *transition* structure, not a wellbeing
   structure — which is the strongest corroboration yet of **R02-F4** (Schlossberg is the
   best-fitting external lens, and its subject is the situation, not the person).

⚠️ All three are **class D**. They are strong enough to orient NW-D02 and weak enough that none
may be quoted publicly, ingested, or attributed to Larry in any surface until the agreement is
signed and the raw source is held.

### D01-F7 — The open production question is still open, and I could not check it

Corpus audit §4 flags the highest-priority unknown: `WHAT_NOW_FOR_LARRY.docx` claims *"Your full
program composes into every conversation in your room"*, which would mean Larry material is live
in production **ahead of a signed instrument**. The audit's instruction is explicit: *"Do not
resolve this by reasoning."*

**I could not run the check.** This session has no SSH client and no route to minisforum. It must
be run from the founder's machine:

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness \
  -c "SELECT slug, holder_username, length(about_practice) FROM practice_fields;"'
```

Unverified since 2026-08-03. **UNKNOWN, not ABSENT.**

---

## RULINGS

**KEEP** — the custody architecture: the agreement, the Attachment A instrument, the provenance
classes (A/B/C/D/F), the permitted-use vocabulary with **`never` as the default for any item
without an explicit value**. It is the best governance instrument in the programme and it should
govern NW-D01.5's publishing model unchanged.

**EVOLVE** — the custody sitting agenda: add a scope-and-obligations section (D01-F5).

**REBUILD** — `scripts/seed/seed-flourishing-field.ts` (D01-F2). Not a doctrine question: the
correct vocabulary is already ruled and already in the CHECK constraint.

**RETIRE** — nothing.

**UNKNOWN** — and this is most of the unit:
- Larry's purpose in his own held words (class-D only today)
- The six domains in Larry's own language
- What Larry counts as evidence of flourishing or movement
- What he considers outside his scope
- His referral practice, credentials and professional obligations
- What he wants a member told when material exceeds the remit
- Whether Larry material is in production (D01-F7)

## SAFETY / CONSENT

**D01-F5 blocks NW-S01's imminent-danger exception and its qualified review.** The review cannot
determine what duties attach without knowing Larry's professional standing. Its scope should be
widened to include that question, or the sitting must precede it.

The **handoff boundary** the founder named can be stated in principle now, though it cannot be
populated until F5 is answered:

> **Larry's obligations are Larry's.** Where he has a professional duty, the platform's job is to
> (a) never obstruct it, (b) never perform it, and (c) never present itself as the party
> discharging it. MAIA hands the situation to a human and says so plainly. It does not carry the
> duty, and it does not pretend the duty has been discharged because it surfaced a resource.

## DESIGN IMPLICATIONS

1. *"The relationship with the practitioner must remain primary"* is now **Larry-sourced doctrine**
   and should be the sentence NW-D01.5 and NW-D03 are tested against.
2. **Achievement → Disorientation → The Question** should be a candidate spine for NW-D02, tested
   against Schlossberg — both describe a *situation in motion*, not a person's traits.
3. *"Flourishing is a practice, not a destination"* is the founder-and-practitioner-aligned
   argument against every metric surface. It is stronger than a policy because it is his.
4. **Do not re-derive the domain vocabulary from our own documents** under any circumstance
   (Attachment A §0). This applies to NW-D03 as much as to the seed.

## TECHNICAL IMPLICATIONS

- The seed repair (D01-F2) is small, bounded, and does not touch member data. It should carry a
  guard so the file cannot write a vocabulary the CHECK constraint would reject.
- The `flourishing_dimension` CHECK constraint is the de-facto canonical list. If the sitting
  changes any domain name, **that is a migration**, and R01's note stands: making the domains
  member-declinable or renameable cannot satisfy a fixed CHECK.

## DECISIONS REQUIRED (founder)

1. **Run the D01-F7 production query** from your machine. Highest-priority unknown in the lane,
   open since 2026-08-03.
2. **Authorize the seed repair** (D01-F2) as a bounded fix, or rule the file retired.
3. **Add the scope/obligations section to the sitting agenda** (D01-F5) before the sitting.
4. **Decide whether NW-S01's qualified review waits on the sitting**, or proceeds with Larry's
   standing as an explicit open variable.
5. **Confirm D01 stays open** until the sitting occurs. Recommended: yes — the remaining questions
   are not answerable by us at all.

## NEXT ELIGIBLE UNIT

**NW-D01.5 — Relational Architecture / practitioner-lane census.** It is unblocked: it concerns
*what already exists in our own substrate*, not what Larry authored, so the Attachment A gate does
not bind it. Its output should be a census, not a design.

**NW-D02 is partially blocked** — its human-journey spine wants D01-F6's material, which is
class D. It may proceed on the explicit footing that its spine is a **hypothesis awaiting the
sitting**, not established doctrine.

## STOP
