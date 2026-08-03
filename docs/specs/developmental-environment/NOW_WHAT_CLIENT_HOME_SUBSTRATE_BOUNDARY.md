# Now What? Client Home — the substrate boundary

**2026-08-02** · Lane `feature/now-what-client-home-pilot` · trunk `c0c8b0ba6`
Companion to `…CLIENT_HOME_V1_AVAILABLE_NOW.md` and `…CLIENT_HOME_V2_PRACTITIONER_EXTENDED.md`.

---

## 1. The finding, stated correctly

⛔ **Not** *"the Home is blocked."*

> **The Home currently has an asymmetrical relationship model: the client can carry themselves
> forward, but Larry cannot yet intentionally place things into that environment.**

⭐ **This is product evidence, not a deficiency to hide.** The missing content lane is not a minor
feature gap — it is **the bridge that makes the practitioner relationship extend through time.**

---

## 2. Two pilots — legitimate, and never to be conflated

| | **Option A — Client Continuity Pilot** | **Option B — Practitioner Extension Pilot** |
|---|---|---|
| **Question** | Can a person return to their own work and experience continuity between sessions? | Can Larry extend his coaching relationship into the client's environment between sessions? |
| **Available** | ✅ **now** | ❌ requires the encrypted-content lane |
| **Proves** | the environment holds a relationship *shape* | the deeper Now What? product claim |

⭐⭐⭐ **Name it honestly: this is a "Client Continuity Pilot," NOT a "Larry Platform Pilot."**
Conflating them would let structural success be reported as practitioner success.

**Option A tests:** relationship identity · program orientation · process context · client Field ·
selected focus · **commitments the client creates** · MAIA as companion · return experience.

**Option A does NOT test:** Larry sending practices · assigning homework · sharing notes · preparing
clients between sessions through the platform.

---

## 3. What exists — verified against trunk `c0c8b0ba6`

| Available | Table |
|---|---|
| the relationship | `practitioner_clients` |
| program + stages | `coach_program_definitions` · `coach_program_stages` |
| enrollment + bounded history | `coach_program_enrollments` · `coach_enrollment_stage_history` |
| the process (⭐ no `title`) | `coach_client_processes` |
| cohorts | `coach_cohorts` · `coach_cohort_memberships` |
| sessions (external ids only) | `coach_sessions` |
| the consent switch | `coach_position_share_consents` |
| ⭐ client's declared focus — **person-owned**, no `relationship_id` | `coach_client_selected_focus` |
| ⭐ **the client's own Field, live in production** | `field_notes` · `member_field_note_threads` · `field_attention` |

### 3.1 ⭐ `field_notes` is the whole client-authored layer

`field_notes` carries `section IN ('alive','asking','emerging','tending')` with a client-authored
`body`. That maps directly onto the Home's client-side needs:

| Section | Home meaning |
|---|---|
| `alive` | what is live for me now |
| `asking` | questions I am carrying |
| `emerging` | reflections |
| `tending` | **what I am tending — the client's own commitments and practices** |

⇒ *"Commitments the client creates"* is **available now**, and needs **no new table**.

---

## 4. 🔴 What cannot be built until the encrypted-content lane exists

| Surface | Required table | State |
|---|---|---|
| practitioner-authored client notes | `coach_authored_notes` | deferred |
| client-visible sharing / publication | `coach_note_publications`, `coach_note_publication_events` | deferred |
| what Larry shared | `coach_client_shared_items` | deferred |
| assignments · practices · homework | `coach_work_items`, `coach_work_item_history` | deferred |
| resources | `coach_resource_recommendations` | deferred |
| important dates | `coach_important_dates` | deferred |
| preparation / follow-up loop | `coach_follow_ups` | deferred |
| current focus **as practitioner-set text** | `coach_current_focus` | deferred |
| shared-position payload | `coach_position_shares` | deferred (⚠️ **consent row exists, share does not**) |

### 4.1 Prohibitions

⛔ **No placeholder storage.** ⛔ **No fake empty panels.** ⛔ **No temporary plaintext
implementations.** ⛔ **No new ontology under different names** — that rebuilds the surface #898 was
reverted for.

⭐ An **empty container is a false promise**: an empty state asserts the container is real.

---

## 5. ⚠️ An inconsistency this audit exposes — reported, not resolved

**`field_notes.body` is plaintext client-authored content, already live in production.**

The encryption standard now being applied to *practitioner*-authored content is **not** applied to the
client's own field notes. Both are substantive human expression.

This is **not** a blocker for v1 — `field_notes` is existing live substrate, not something this lane
introduces — and v1 adds no new plaintext. But the posture is uneven, and naming it is required by
the standing discipline against under-reporting:

> The client's own expression is already stored in plaintext, while the practitioner's expression is
> being held back for encryption.

⏳ **Unruled.** Whether the encrypted-content contract should cover `field_notes` belongs to that
lane's scope decision, not to this pilot. ⛔ Do not let v1 shipping be read as a ruling that
client-authored plaintext is acceptable.

---

## 6. The pilot boundary question

> **What is the smallest honest experience that lets Larry see the power of Now What? without
> pretending the practitioner extension layer already exists?**

That question — not *"what UI should we build?"* — governs the next decision.

---

## 7. ⭐⭐⭐ The two lanes are different sovereignty questions

⛔ **Do not merge them just because both involve practitioner content.**

| Lane | Question |
|---|---|
| **Coach Field** — #902, merged | **What may the practitioner *receive*?** |
| **Encrypted content** — **#940**, no owner | **What may the practitioner *create and retain*?** |

Receiving is governed by **relationship authorization**. Creating and retaining is governed by an
**encryption contract, an ownership model, and a retention rule.** ⛔ The second is not a follow-on of
the first.

⭐ **#940 now exists** — the lane that was repeatedly flagged as *"no issue, no owner, no scope"* has a
referent, per the standing rule that a debt item without one is an observation, not tracked work.
Still unowned.

### 7.1 §5's symmetry question, reframed (#922)

The question underneath is **not** *practitioner vs member*. It is:

> **Who owns this meaning, and what relationship permits access?**

⭐ That applies in **both directions**. Source-based framing produces a false symmetry in either
orientation — *member material sacred, practitioner material visible*, or the reverse. **Ownership and
sensitivity are the axes; authorship is not.**

⚠️ **#922 governs *scope*; #940 governs *mechanism*.** Neither answers the other.

---

## 8. Build sequence

1. **Merge/deploy the current substrate.**
2. **Run the walk against the actual environment** (`…PROTOTYPE_WALK.md`).
3. **Collect verbatim language from a person unfamiliar with the model.**
4. **Only then** refine the member reflection view and practitioner extension.

⭐⭐⭐ **The walk is the next authority.** Step 3 is not optional colour — it is the only admissible
evidence for the 30-second legibility claim, because *the author of a layout cannot measure its
legibility.*

⭐ The acceptance question has shifted, and this is the threshold that matters:

> ⛔ Not *"did we build the intended thing?"*
> ✅ **"Does the person experience the intended thing without being told what it is?"**
