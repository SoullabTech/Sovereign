# Soullab Press Re-Edition Plan — *Elemental Alchemy*

**Status:** Planned — pending Phase 0 verification (§4) before any irreversible step.
**Authored:** 2026-06-20.
**Purpose:** Move all *Elemental Alchemy* formats from the free-KDP-ISBN / "Independently published" imprint onto the **Soullab Press** imprint using the already-owned Bowker ISBN block **979-8-9967127**.
**Decision (2026-06-20):** Confirmed — proceed with the Soullab Press re-edition in the pre-marketing window (last low-cost moment; flagship-provenance value > the small current equity). The §8 off-ramp applies only if gate 3 flips (paperback equity turns out non-trivial at execution).

---

## 1. Why this exists

The live paperback and the about-to-publish hardcover both carry **free KDP ISBNs**, which force the imprint to **"Independently published."** A free KDP ISBN is permanent the moment it is assigned and cannot be swapped on its own listing. The only way to put **Soullab Press** on the catalog as publisher of record is to publish the print formats under our **own** ISBNs — which means **new listings**.

We already own the ISBNs (Bowker block `979-8-9967127`, printed in the manuscript front matter, commit `7c98ce7b5`), so **no purchase is needed** — this is purely an execution + sequencing task.

## 2. Current state (as of 2026-06-20)

| Format | Status | Price | ASIN | ISBN / Imprint |
|---|---|---|---|---|
| Kindle eBook | Live (KDP Select) | $9.99 | `B0H5FPZ4G1` | ASIN only — *publisher field editable in place* |
| Paperback | Live | $22.99 | `B0H37X9P8J` | free KDP ISBN → "Independently published" |
| Hardcover | publishing now | $24.99 | `B0H629X69H` | free KDP ISBN `9798182204248` → "Independently published" |

## 3. Cheap vs. costly — know this before deciding

- **eBook = cheap — *assumption to verify (§4 Phase 0).*** Kindle eBooks have no ISBN; the **Publisher** field is *believed* free-text and editable on a live listing — set it to "Soullab Press" with no new ASIN and no review loss. **Verify experimentally before committing** (Amazon changes what metadata is editable). Robustness: even if it is *not* in-place editable, the strategy holds — the durable provenance marker is the **print ISBN** registered to Soullab Press at Bowker, not the eBook field. Worst case, leave the eBook as-is (its publisher field is cosmetic and rarely surfaced) rather than re-creating it and losing its reviews / KDP-Select history.
- **Print formats = costly.** Imprint is bound to the ISBN, and the ISBN cannot change on a live book. New ISBN → **new listing → new ASIN**. Reviews and sales history **generally do not transfer** to a new print ASIN — Amazon occasionally links editions differently, so **assume they will not transfer unless KDP Support confirms otherwise**.
- **But the hardcover has *zero* equity.** It has never been published (draft only) — no reviews, no rank to lose. It is a **clean Soullab Press debut either way**; there is no reason to publish the free-ISBN hardcover first. The equity-vs-provenance tradeoff is therefore **paperback-only**.

**The entire real cost of this project = whatever reviews / sales rank the *paperback* has accumulated by the day we execute.** That cost only grows with time → execute sooner, not later, and *before* any marketing push.

## 4. Execution sequence

### Phase 0 — verify before anything irreversible
- **Snapshot the current state (recovery point) — do this before anything else:** export every KDP metadata screen as PDF + screenshots, and record all ASINs, ISBNs, pricing, categories, keywords, book description, and author bio for every format. This is the complete rollback reference if anything goes wrong.
- **Contact KDP support with the exact scenario, before you change anything:** "I own the ISBNs and want to republish these print formats under my own imprint." Ask specifically about (a) print ⇄ eBook **detail-page linking**, (b) **review retention / migration** possibilities, (c) **recommended migration order**. Operate from Amazon's *current* guidance, not this doc's assumptions — for a one-time irreversible decision, an extra day here is cheap.
- **Test the eBook publisher field** (see §3): on the live Kindle title, set Publisher → "Soullab Press" and confirm it saves cleanly. Works → eBook handled in place. Doesn't → fall back to leaving the eBook as-is (provenance still lives in the print ISBNs).
- **Order the hardcover proof** from the current free-ISBN draft to confirm physical production. Same trim / paper / files carry to the Soullab Press version, so the *production* proof is valid for both. Finishing Rights & Pricing unlocks the proof order — **that is not publishing; it stays a draft until you click Publish.** Long-lead item (~1–2 weeks), so start it first. The free-ISBN hardcover never goes live; it is a draft to be removed, not a listing to be unpublished.
  - **On the proof, verify the *physical* items** (the expensive mistakes): spine alignment, barcode **placement + scannability**, case-wrap margins, page numbering, and front-matter layout. *(KDP hardcover is case-laminate — printed on the case; there is no dust jacket.)*
  - **Defer the ISBN-*value* checks to the Soullab Press hardcover** (Phase 1 step 4), not this proof: it is printed from the **free** KDP ISBN draft, so its barcode and any interior ISBN will not match Bowker *by design*. The real "interior ISBN == barcode == Bowker number" check belongs on the actual Soullab Press edition.

### Phase 1 — build the new editions
- **Complete Bowker metadata before publication** — for each print ISBN, register title, contributors, imprint (**Soullab Press**), format, publication date, and description at Bowker, so libraries, wholesalers, and retailers receive consistent publisher information. (Not required by KDP, but it makes the imprint coherent across the supply chain.)
1. **eBook (in place, if verified):** Edit eBook details → set **Publisher = Soullab Press** → save & publish update. (No new ASIN.)
2. **Confirm manuscript is frozen** — no content edits planned for 30+ days. Re-render print interior + cover from source if anything changed (`scripts/render-book-print.ts`).
3. **New Paperback:** create a new paperback → **"Add your own ISBN"** → Bowker paperback ISBN + imprint **Soullab Press** → upload current interior + cover → $22.99 → preview → publish.
4. **New Hardcover (clean debut):** remove the free-ISBN hardcover draft (`B0H629X69H`) via unlink, then create the hardcover fresh → **"Add your own ISBN"** with the Bowker **hardcover** ISBN (a *different* number from the paperback) → upload hardcover-spec cover (case wrap) + interior → $24.99 → preview → publish. **Before publishing, confirm the ISBN values line up:** the ISBN printed on the interior copyright page matches the Bowker hardcover number you assigned in KDP (KDP generates the barcode from that assignment, so interior == barcode == retail ISBN). Run the same check on the new paperback (step 3).

### Phase 2 — verify, then unpublish (overlap — do NOT unpublish immediately)
5. **Verify linking.** Confirm the new print formats share one Amazon detail page with the eBook. KDP often will *not* auto-link standalone new listings — use the Phase 0 support ticket to link the new ASINs to `B0H5FPZ4G1`.
6. **Repoint marketing + website** to the new ASINs (links, buy buttons, metadata).
7. **Stabilization overlap (~1 week).** Keep the old paperback **live** while the new editions settle — confirm orders, previews, and links all function. If Amazon delays linking or a metadata issue appears, readers still have a complete catalog.
8. **Unpublish the Edition 1 paperback** (`B0H37X9P8J`) from KDP **only after *all* of these are true:**
   - new paperback is **searchable** on Amazon;
   - new hardcover is **searchable**;
   - detail-page linking is **complete** (or KDP has confirmed it is in progress);
   - ISBN metadata is correct on the new listings;
   - all website / marketing links point to the new ASINs;
   - you have **successfully placed a test order** from the new listing.

   Only then unpublish the Edition 1 paperback. (The hardcover `B0H629X69H` was never published — nothing to unpublish; removed as a draft in step 4.)

   **Rollback criterion:** if any Phase 2 verification fails (linking, metadata, ordering, or discoverability), **suspend unpublishing** the Edition 1 paperback until the issue is resolved. The migration stays fully reversible until this final switch.

## 5. Risks & mitigations

- **Review / rank loss** on the unpublished Edition 1 print ASIN — *primary cost, though not certain* (Amazon occasionally links editions; confirm with KDP Support). Assume loss; mitigation: execute early, before marketing.
- **Linking is sticky** — re-linking already-published formats frequently needs KDP support. Mitigation: open the Phase 0 support ticket first and verify linking (Phase 2 step 5) *before* unpublishing anything. Expect a few business days.
- **ISBN-per-format discipline** — paperback and hardcover need **distinct** numbers from the block. Never reuse one ISBN across formats.
- **Interior copyright page must match** the new retail ISBN per format. If the front matter prints a single ISBN, give each print format its own copyright-page ISBN before re-uploading.
- **Brief two-edition overlap is intentional, not a bug** — keeping the old paperback live until the new editions are verified + linked (Phase 2) prevents a catalog gap if Amazon stalls. Mitigate buyer confusion by repointing *all* marketing/links to the new ASINs during the overlap, then unpublish the old.

## 6. The trigger is the gates, not the date

**The three gates below are the decision. The date is subordinate** — a planning reference, not a target. If all three are satisfied earlier, execute earlier; if any one fails, wait, regardless of what the calendar says.

1. **Hardcover is stable.** The proof copy confirms interior, cover, and production quality. *(Readiness gate — must be true to proceed.)*
2. **Editorial freeze.** Maya's Chapter 10 has landed (2026-06-20); confirm no further round of manuscript edits is about to begin. *(Readiness gate — must be true to proceed.)*
3. **No accumulated marketing equity.** New print editions start with fresh ASINs and inherit no reviews or sales history from the existing listings. *(Closing-window gate — the cost rises monotonically over time, so this argues for acting sooner, not waiting.)*

Note the asymmetry: gates 1–2 are *readiness* (wait until true); gate 3 is a *closing window* (act before it's expensive). The right moment is the earliest point where 1 and 2 are both true and 3 still holds.

**Execution rule (no calendar date):** Execute at the earliest point when the readiness gates (1–2) are satisfied and the paperback has not accumulated meaningful market equity (gate 3). No fixed week is set on purpose — a date written down would subtly bias the decision; the gates alone determine timing.

## 7. Go/No-Go — final gate immediately before execution

The gates in §6 decide *when*. This checklist decides *whether to begin on the day*, and exists to keep this a **controlled publishing operation, not an editorial project** — nothing editorial rides along with the ISBN/imprint migration. Every box checked → proceed. Any box open → stop and resolve it first.

- [ ] **Hardcover proof approved** — physical/preview proof signed off.
- [ ] **Interior parity confirmed** — paperback and hardcover interiors are byte-identical except for ISBN/barcode and required front-matter differences (the tripwire that catches stray editorial drift).
- [ ] **Production package archived** — final print PDF + EPUB *and* the full production source set (§10), version-stamped — not just the deliverables.
- [ ] **Recovery snapshot captured (Phase 0)** — every KDP metadata screen exported (PDF + screenshots); ASINs (`B0H5FPZ4G1`, `B0H37X9P8J`, `B0H629X69H`), ISBNs, pricing, categories, keywords, description, and author bio all recorded before any change.
- [ ] **New ISBNs verified** — Bowker numbers from block `979-8-9967127`, one per print format, confirmed distinct.
- [ ] **KDP support guidance in hand** — current answers on detail-page linking, review retention/migration, and recommended migration order (Phase 0), not assumptions.
- [ ] **eBook publisher field tested** — confirmed editable in place, *or* the fallback (leave eBook as-is; provenance lives in the print ISBNs) explicitly accepted.
- [ ] **Marketing stays paused** until the new editions are live *and* verified-linked; then repoint all links to the new ASINs *before* unpublishing the Edition 1 paperback.

## 8. Lighter alternative (off-ramp)

**Status: not selected (2026-06-20)** — the decision is to proceed (see the decision banner up top). This off-ramp stays live only as a **gate-3 contingency**: if the go/no-go reveals the *paperback* has accumulated reviews worth keeping by execution day, fall back to **grandfathering** — leave Edition 1 as "Independently published," set only the eBook publisher to Soullab Press (free), and reserve the Soullab Press + Bowker-ISBN treatment for the *next* edition or new title. Trades catalog consistency now for keeping existing social proof. Decide against the *actual* review count at execution.

## 9. Execution task checklist (day of)

These are the *actions* performed during execution, once the §7 go/no-go has cleared:

- [ ] eBook publisher set to "Soullab Press"
- [ ] Manuscript frozen; print interior + cover re-rendered if changed
- [ ] Bowker ISBNs assigned: one for paperback, a distinct one for hardcover
- [ ] Copyright-page ISBN per format matches that format's retail ISBN
- [ ] New paperback published (own ISBN, Soullab Press), previewed
- [ ] New hardcover published (own ISBN, Soullab Press), hardcover-spec cover previewed
- [ ] Edition 1 paperback unpublished — *only after Phase 2 verification passes* (the hardcover draft was removed in Phase 1, never published)
- [ ] KDP support ticket opened: link new ASINs to eBook detail page (+ ask re: review migration)
- [ ] Final check: all three formats show "Soullab Press" and share one Amazon page

## 10. Provenance & preservation record

### Edition history (permanent provenance — fill in ISBNs/ASINs as assigned)

**Edition 1 — "Independently published" (free KDP ISBNs)**
- Paperback — ISBN: `[old free-KDP ISBN — record from KDP before unpublishing]` · ASIN: `B0H37X9P8J` (live; unpublished after Phase 2)
- Hardcover — free KDP ISBN: `9798182204248` · ASIN: `B0H629X69H` (draft only — never published)
- Kindle eBook — no ISBN · ASIN: `B0H5FPZ4G1`

**Edition 2 — Soullab Press (Bowker block `979-8-9967127`)**
- Paperback — ISBN: `979-8-9967127-0-0` · ASIN: *(assigned after publication)*
- Hardcover — ISBN: `[second number in the 979-8-9967127 block — confirm check digit at Bowker]` · ASIN: *(assigned after publication)*
- Kindle eBook — no ISBN · ASIN: `B0H5FPZ4G1` (unchanged; publisher → Soullab Press if §4 Phase 0 confirms the field is editable)

> Record the free-KDP **paperback** ISBN *before* unpublishing Edition 1 — it is otherwise hard to recover afterward.

### Production package to archive (the whole package, not just deliverables)

Alongside the final print PDF + EPUB, preserve a complete, recoverable production set:
- Figma source (cover + any layout)
- original cover assets (art, photography, logo files)
- fonts (if licensing permits storage)
- barcode assets
- rendered KDP cover PDFs (paperback *and* hardcover case-wrap)
- Atticus project (or equivalent manuscript-layout source)
- any scripts used to generate the print files (`scripts/render-book-print.ts`, etc.)

The goal: Edition 2 — or a future Edition 3 — can be reproduced years from now from archived sources alone.
