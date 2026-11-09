# WS-CONTINUITY — independent review of the branch (2026-11-08)

Two separate review agents (read-only, code not conclusions): A = consent / isolation / migrations; B = correctness / UX / tests. Everything below is from reading code unless marked.
Evidence class: INDEPENDENT REVIEW (reading), then fixes verified by unit tests + disposable-database witnesses (38/38) + the frozen-suite guard (intact; no frozen file touched).

## Fixed (each verified as stated)
| # | Finding | Fix | Verified by |
|---|---|---|---|
| A1 HIGH | a Work with any standing-read receipt could no longer be removed (receipt FK → scope event vs the Work's cascade) | `scope_event_id` is a plain UUID, validated at INSERT by a trigger (must be a GRANT by the same member), immutable after; dangles by design | DB witness: Work with a receipt is removed, receipt survives; a receipt naming another member's grant, a missing event, is refused |
| A2 MED-HIGH | the D5 exception could be widened by a small edit without the guard noticing | the exception module is pinned by blob hash; the importers of the shared decision read are a closed list; falsifiers added | guard tests 51/51 |
| A4 MED | `LIMIT 1` with no ORDER BY could resolve a manuscript to different Works | one deterministic lookup (`workOfManuscript.ts`) used by the Ask context, the scope route and the decision read | unit + DB witnesses |
| A5 LOW-MED | decision text could forge prompt headings | decision lines are collapsed to one line | unit |
| A6 LOW | the decisions route did not validate UUIDs (500) | 404 on a non-UUID id or target | static |
| B1 | the passage desk's held-quote refusal answered 502 and lost its copy | 409, the CODE `quote_not_in_text` is forwarded, the writer-facing sentence is client-owned (the "server detail never reaches the writer" law is kept) | existing controller test + new branch |
| B2 (part) | gate false-rejects: `--`, `. . .`, `[brackets]`, odd straight quotes, non-string content | normalisation + flattening | unit |
| B3/B4 | Work-conversation fallback used incomplete sources | sources are exactly what she was handed (`seen`) | route walk |
| B5 | controls could mislead (Sanctuary ON; failed check; failed Stop; failed withdraw; stale lists) | honest notes, retry, refresh on focus | component read + unit; NOT browser re-walked |
| B6 | KeepNote label named the wrong passage if the writer moved; a11y | label captured at open; dialog role, focus, Escape, status | unit; NOT browser re-walked |
| B7 | heading match over-read ("Air" in "fair") | whole-word match | unit |
| B8 | a failed read-record could 500 a saved answer | logged, never a 500 | static |
| (walk) | **a bug introduced while fixing**: the retry's correction note quoted the invented line and so grounded it | the retry is judged against the ORIGINAL sources only | route walk W8 (it caught it) |

## Not fixed — decisions or limits (open)
- **Passage-desk gate can still refuse an ordinary reply** that quotes MAIA's own illustrative wording not equal to her proposal (B2). It refuses the whole turn (this lane's convention). Real traffic is unknown. Options: warn-only at first, or ground illustrative quotes. Founder tradeoff.
- **Dismissed observations carry text (≤300 chars each, ≤12) with no receipt and no grant** (A3). **RULED (founder, 2026-11-08): leave as ruled.** The text is MAIA's own earlier wording from a reading the writer commissioned, not new manuscript text crossing a boundary, so a receipt would record a crossing that did not happen. **The claim is corrected, not the code: "every crossing is receipted" covers READS OF THE WRITER'S SAVED TEXT; it does not cover MAIA's own earlier observations the writer set aside.** Revisit only if such observations are found to quote the manuscript at length.
- Partial minting leaves `attempted` receipts for sections whose text never loaded (truthful, over-reports a possible crossing). Left.
- Manuscript text and decision text still enter prompts as text; the standing-read preamble says it is the writer's writing, not instructions. Residual self-injection for pasted third-party text.
- **Member erasure — TRACED (read-only, 2026-11-08).** `POST /api/members/delete-account` is in REFUSE posture (`CONTAINMENT_POSTURE='refuse'`) and counts member-owned content from `GOVERNED_CONTENT`. `living_works` and the Work tables are not in that list either, and already name `members ON DELETE RESTRICT` — so the new tables add no new KIND of obstacle, but `writer_decision_events` (the writer's own words) and `work_reading_scope_events` were invisible to the preflight. **Fixed: both added to `GOVERNED_CONTENT`** so a member is told. `ask_turn_reads` has no member column and follows `ask_threads` by cascade. NOT done: the route's 'proceed' posture would still fail on RESTRICT for any member with Works — a pre-existing retention-lane matter, not changed. `delete-account/__tests__/route.test.ts` has one failure that exists on the branch base without this change.
- Version-binding still unset; `Sanctuary=false` remains a client claim (as before this work).
- Not re-walked in a browser after these fixes. Your walk is still owed.
