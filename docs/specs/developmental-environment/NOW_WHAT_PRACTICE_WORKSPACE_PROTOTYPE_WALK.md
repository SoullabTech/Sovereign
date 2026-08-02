# Practice Workspace — prototype acceptance walk

**2026-08-02** · Lane `feature/now-what-client-home-pilot` · trunk `c0c8b0ba6`
⛔ **Freeze this spec before executing it.** A walk authored during its own execution is not evidence.

> ⛔ The question is **not** *"does the UI look good?"*
> It is: **can each person answer their own questions in the first 30 seconds, and does the
> sovereignty boundary hold?**

---

## 0. What is being built

⭐ **Not two dashboards.** Two dashboards would make this a reporting tool.

> **One shared practice reality, viewed through two accountable perspectives.**

| | Sees |
|---|---|
| **Larry** | *what I am holding, offering, and accompanying* |
| **Client** | *what I have chosen, what is mine, and what I am continuing* |

⭐ **Not different datasets — different relationships to the same unfolding work.**

---

## 1. W-L · Larry arrives

Larry opens his practice cold, no orientation, no explanation.

| # | Question he must answer immediately | Substrate | Walkable now |
|---|---|---|---|
| **W-L1** | Who am I working with? | `practitioner_clients` | ✅ |
| **W-L2** | What needs my attention? | ⚠️ derived from structure only — no follow-ups table | ⚠️ **partial** |
| **W-L3** | What did this person choose to work on? | 🔴 `coach_client_selected_focus` is **person-owned** — Larry cannot see it unless the client shared it | 🔴 **see §3** |
| **W-L4** | What happened last time? | `coach_sessions` (dates only, no notes) | ⚠️ **partial** |

⚠️ **W-L3 is not a gap — it is the sovereignty boundary working.** A walk that "fixes" it has broken
the product. It passes when Larry sees *either* what the client explicitly shared *or* nothing, and
the interface does not imply something is being withheld from him unfairly.

---

## 2. W-C · Client arrives

| # | Question they must answer immediately | Substrate | Walkable now |
|---|---|---|---|
| **W-C1** | What am I working with? | program · process · stage | ✅ |
| **W-C2** | What did I choose? | `field_notes` §`tending`/`alive` · selected focus | ✅ |
| **W-C3** | What did Larry offer? | 🔴 **no substrate** — deferred to the encrypted-content lane | 🔴 **BLOCKED** |
| **W-C4** | Where do I continue? | unfinished client thread → MAIA | ✅ |

🔴 **W-C3 cannot be walked.** ⛔ Do not score it, do not substitute a proxy, do not mark it PASS on
the grounds that the section is designed. **A designed section is not an answered question.**

---

## 3. W-S · The sovereignty test — the gate

Both must be **actively falsified**, not assumed from code reading.

| # | Test | Passes when |
|---|---|---|
| **W-S1** | **Can Larry accidentally see something the client has not offered?** | Every practitioner-side surface is exercised against a client who has declared a focus and shared **nothing**. Larry sees nothing of it — no count, no "1 private item", no greyed row, no timestamp implying activity. |
| **W-S2** | **Can the client mistake Larry's observation for their own truth?** | Anything practitioner-authored is attributed at the item. The client's own words are visually distinct from system and practitioner language. ⛔ No system-generated summary of the client appears anywhere. |

⭐ **W-S1 is the strongest structural claim available.** `coach_client_selected_focus` is keyed on
`members.id` with **no `relationship_id`** — Larry's relationship *cannot address the record*. The
walk must confirm **presentation did not undo what the schema made unreachable**: a join added for
convenience, a denormalized cache, an admin view, a log line.

⛔ **If W-S1 or W-S2 fails, do not build.** These are not polish items.

---

## 4. Evidence discipline

- ⛔ **An endpoint call is not admissible evidence for a member path.** Every client-side question is
  answered by walking the surface a member actually reaches — first act to last.
- **Audit verbs from the first act**, not from the point where the feature begins.
- **Measure, don't infer** — reachability of a control is measured (≥44px tap target on device),
  never read off the DOM.
- **A harness that has never been run is a proposal**, not evidence.
- ⚠️ **The 30-second claim requires a person who has not seen the design.** The author of a layout
  cannot measure its legibility. If no naive participant is available, report the walk as
  *structure-verified, legibility-unmeasured* — do not silently convert one into the other.

---

## 5. Coverage statement — required in the result

The result must state its own width. Anything else overstates the pilot.

> **This walk verifies the Client Continuity Pilot.** It does **not** verify the Practitioner
> Extension Pilot. `W-C3` was not scored: no substrate exists for practitioner-authored content.
> `W-L2` and `W-L4` were scored **partial** — structure only, no follow-ups and no session content.

⛔ **Do not report "the practice workspace passed."** Report: *the client continuity path passed;
the practitioner extension path was not tested because it does not exist.*

⭐ **The return test, at its honest width:** a client leaves for two weeks and returns. With nothing
from Larry able to arrive, **the only thing that can be waiting is what the client themselves left.**
If that alone produces *"something I began is still here,"* that is a real and significant result —
and a narrower claim than the full product intent.

---

## 6. Outcome

| Result | Meaning |
|---|---|
| **W-S1 + W-S2 pass** and W-L1/W-C1/W-C2/W-C4 pass | ⭐ **Build.** The room is recognizable and the boundary holds. |
| **W-S1 or W-S2 fails** | ⛔ **Do not build.** Repair the boundary first. |
| Larry cannot answer W-L1/W-L2 in 30 seconds | ⚠️ The doorway is not familiar enough — a *design* failure, not a substrate one. Return to `NOW_WHAT_PRACTICE_WORKSPACE_DESIGN.md` §2. |

> The challenge is no longer making a homepage. It is making **the first genuinely recognizable room
> in AIN where a CEO like Larry feels at home.**

Related: `NOW_WHAT_PRACTICE_WORKSPACE_DESIGN.md` · `…CLIENT_HOME_SUBSTRATE_BOUNDARY.md` ·
`…CLIENT_HOME_V1_AVAILABLE_NOW.md`
