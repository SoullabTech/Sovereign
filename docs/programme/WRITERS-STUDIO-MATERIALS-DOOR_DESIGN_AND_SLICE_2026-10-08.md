# Writer's Studio — Materials door (MAIA-SOVEREIGN-ka3)
## Process design + first slice · 2026-10-08

Status: **slice 1 implemented on `claude/happy-cannon-17pn9x` — not merged, not deployed, no PR.**
Worked example: the Corbin / Chapter 2 + Chapter 5 placement proposal (~6.9k characters).

## 1. The gap

New material (an insight, an excerpt, a proposed passage) arrives while a Work is open. Before this slice:
- intake lived on a separate page (`app/writers-studio/sources/page.tsx`);
- the in-room tray (`P4R1FocusMaterials`) renders **nothing when empty**, and only in the Write editorial room — so the first item could never be added in place, and Develop had no entry at all.

## 2. Process (four acts, kept distinct)

| Act | Meaning | Authority | Slice |
|---|---|---|---|
| **Bring** | paste / file / pick existing | member | 1 ✅ |
| **Keep** | the material joins the Work (belonging row; no copy into any passage) | member gesture = the consent event | 1 ✅ |
| **Explore / Place** | material enters the current MAIA conversation; MAIA offers *possible* places | explicit member choice; MAIA proposes only | 1 ✅ (conversation-level) |
| **Locate + stage** | MAIA verifies each candidate place against the manuscript text, the member picks one, the passage comes onto the workbench | member | **2 — not built** |
| **Apply** | marked suggestion → member applies | existing Write apply/undo chain | existing |

Law: adding material never touches the draft, focus or conversation; Keep ≠ Explore ≠ Place ≠ Apply.

## 3. What slice 1 does

`P4R1WorkMaterialsDoor.tsx` — one quiet **Bring in material** control, present even when the Work has no materials. Mounted in the **Develop MAIA rail** (always reachable there, no passage needed) and in **Write** — ⚠️ **corrected 2026-10-08:** in Write it sits inside the isolated Focus room beside the Focus tray, so it appears only after a passage is isolated for editorial work; the earlier claim that it shows with no passage selected is true for Develop only.
- **Paste a note** (+ optional title, source reference, and the writer's own "what might it feed" sentence) → stored as a `.txt` source through the existing intake route, then declared to the Work through the existing materials route. The reference is written as a visible first line (`Reference: …`), not hidden metadata.
- **Add a file** (`.txt .md .docx` keep immediately; `.pdf`/image arrive as drafts and are *not* declared until the writer reviews them — the existing reviewed-only gate is preserved).
- **Already brought in** — reviewed sources not yet on this Work, one click to keep.
- **Explore with MAIA** / **Help me find where it fits** — only on the writer's click. *Place* instructs MAIA to anchor to the writer's own headings or exact wording she can actually see, to say so if she cannot, to offer ≤3 places, to say plainly if nothing fits, and **not** to draft insertion wording or choose. Headings are sent only for *Place*, bounded (≤150 × 120 chars) and labelled "as stored — may include import artifacts, not confirmed authored structure".
- Over-long material (>12,000 chars) is **refused, never trimmed** — same rule as the existing tray.

No new store, route, migration or schema. The door's only network writes are `POST /api/writers-studio/sources` and `POST /api/sovereign/living-works/{id}/materials` (guarded by test).

## 4. Corbin walk-through (acceptance)

1. While editing any passage, open **Bring in material**; paste the Chapter 2 passage and the Chapter 5 passage as two notes (title + `Reference: Corbin, Mundus Imaginalis, trans. Fox`). Keep both. Manuscript, focus and conversation unchanged.
2. Later: **Help me find where it fits** on the Chapter 5 note. MAIA proposes candidate places by heading/wording, or says what she cannot see.
3. The writer chooses a place by going there (Write/Develop selection). *(slice 2 would bring that passage to the workbench automatically.)*
4. Proposed wording flows through the existing marked-suggestion chain — nothing applies without the writer's act.

## 5. Honest limits of slice 1

- **MAIA's view of the book.** *Place* sends the heading list and the material. Whether the receiving conversation can *read the manuscript text* behind each heading depends on that surface; the prompt makes her say so rather than guess. Slice 2 should give *Place* a grounded read (coverage-licensed, whole-Work, unranked) rather than rely on the conversation's ambient view.
- **Google Docs are not an intake format.** Paste the text, or download as `.docx`/`.md`. `.epub` is unsupported. Whole-book files do not belong here: the manuscript is already the Work.
- **Kept tray refresh.** The Focus tray reflects a kept item after the host reloads Works (wired via `onWorkChanged`).
- **Version anchoring.** The Corbin review itself notes it anchored to the Oct 5 v2 working manuscript, not v13. A placement is only as good as the revision it was read against; slice 2 must bind the read to a named revision.

## 6. Slice 2 (separate act)

Grounded placement: a read-only, coverage-reporting pass over the Work for one material → ≤3 candidate places, each carrying heading + exact verifiable wording + the revision it was read against; a "no good place" outcome is lawful; selecting one stages that passage on the workbench. Needs the Develop/Write consolidation lane to settle first.

## 7. Verification (this container)

- `p4r1WorkMaterialsDoor.test.ts` **9/9**; `p4r1FocusMaterials.test.ts` 6/6 unchanged.
- `npm run typecheck` gate **PASS** — 222 vs baseline 239, 0 new.
- ⚠️ `p4r1IsolatedEditorialRoom.test.ts` has 2 failures that **also fail on canonical without these changes** (latitude label `Light` vs `Touch`) — not touched here.
- ⛔ Not yet walked in a browser against a real Work.

## 8. Studio-run audit of the Corbin four-entry process (2026-10-08)

A read-only, code-level audit (two agents, file evidence; nothing was run in a browser) traced the author's four proposed entries through the door. Repaired in the same change (tests 21/21):

| Finding | Repair |
|---|---|
| The author's own "what might it feed" sentence was dropped when material was explored, because the form had cleared | The sentence is stored with the kept item and sent with it |
| The door said "Asked MAIA" whatever happened (in Develop it only pre-fills the composer) | `exploreMode`: prefill says "Nothing has been asked yet"; send says "If no reply appears, nothing was asked" |
| In Write, Explore/Place could return a MAIA-authored proposal built from the material (verbatim use the author does not want) | Write passes `proposalPolicy: 'reply_only'` |
| In Develop, Place pre-filled 7–18k characters into a 4,000-character ask and the failed send destroyed the draft; headings were redundant (server supplies them) | Door refuses over-limit context whole (`maxContextChars={4000}`), Develop sends no outline |
| Material kept in an earlier session could no longer be Explored/Placed | "Already kept with this Work" list carries both actions |

**Not repaired — capability gaps the process exposed (each needs its own governed act):**
- **No way to create a new subsection** between two existing ones (entry 2): WS2-08 08C is unbuilt and unauthorized; text typed into a neighbouring section is plain prose, not an addressable section.
- **No place-keyed record of "decided to add nothing"** (entry 4): `living_work_material_considerations` is material-keyed, has no UI, and its API refuses pasted-note material; it records no reason, place or revision.
- **No revision binding**: a placement decision carries no pointer to the revision it was read against, so a v2-vs-v13 mismatch can recur unnoticed.
- **MAIA's sight is local**: in Write, the focused passage ± 4,000 characters inside one section; in Develop, every heading plus one open section. The whole-Work read takes no material and its prompt forbids recommendations, so a grounded Place needs a new governed unit.
- **No paragraph-level anchor**: the Studio cannot take the author to "the paragraph that begins …"; entry 1 works only as a Write revision of the anchoring paragraph.
- **Door reachable in Write only inside the Focus room.**
- ❔ Unknown: whether `WRITERS_STUDIO_EDITORIAL_ENABLED` is on in production (every Write-side MAIA act depends on it).
- Entry 3 (reconcile existing text) is the one path whose data flow is complete and governed today.
