# Soullab Press — Publishing Runbook (Elemental Alchemy)

**Decision (2026-06-18, revised):** Establish **Soullab Press** (an imprint of Soullab Media,
Hamden, CT) through the **hardcover**, which has no accumulated history to lose. **Keep the
existing paperback exactly as it is** — its reviews, sales history, and ranking
(#8 Sacred Geometry) are assets worth more than one metadata line.

**Publishing lineage:**
- **First paperback edition** — independent (unchanged, free ISBN)
- **First Soullab Press edition** — hardcover (`979-8-9967127-1-7`)
- **All future titles** — Soullab Press

**Imprint of record:** `Soullab Press` (register this exact string on every ISBN).

---

## Why (the calculus, for the record)

- Free KDP ISBNs force the Amazon "Publisher:" line to read **"Independently published"** and
  cannot be changed. Your own ISBN lets you set the imprint. (KDP help G201834170.)
- The existing paperback already has momentum (#8 Sacred Geometry, reviews, sales). Those are
  assets — not worth trading for one metadata field. **Leave it.**
- The hardcover has essentially no history yet → the clean place to plant the imprint.
- Paperback and hardcover are different products → **each needs its own ISBN** (Bowker).

---

## Part 1 — Interior (DONE in repo)

- [x] Title page → `Soullab Press / an imprint of Soullab Media / Hamden, Connecticut`
- [x] Full professional copyright page: copyright (Kelly W. Nezat), rights, publisher block +
      `soullab.life`, both ISBNs, First Edition, Printed in the United States of America
- [x] Real Bowker ISBNs filled in (no placeholders remain)
- Canonical source (what both render scripts read):
  `docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md`

## Part 2 — Bowker ISBNs (DONE)

1. [x] Bought the 10-pack. ISBNs do not expire. Registrant block: `979-8-9967127`.
2. [ ] **Confirm imprint = Soullab Press on the Bowker title record** — it must match the
       Imprint you type into KDP, or the Amazon "Publisher:" line won't read Soullab Press.
       (Bowker status shows "Pending" until the title metadata is completed; the ISBN is
       already usable for KDP.)
3. [x] Assigned paperback + hardcover ISBNs (2026-06-18):
   - Paperback ISBN: `979-8-9967127-0-0`  *(held in reserve — see Part 4.7)*
   - Hardcover ISBN: `979-8-9967127-1-7`  *(the Soullab Press edition)*
   - Unassigned, future titles: `979-8-9967127-2-4`, `979-8-9967127-3-1`, …

## Part 3 — Fill ISBNs + render (DONE)

4. [x] Real ISBNs in `ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md`; guard comment removed.
5. [x] Rendered both formats (verified: "Soullab Press" ×2, both ISBNs, print line, 0 placeholders):
   - Print: `exports/elemental-alchemy/book-print-soullab-press-v2.pdf` (15.6 MB)
   - EPUB:  `exports/elemental-alchemy/book-epub-soullab-press-v2.epub`  (18 MB)
   - (Generated artifacts — intentionally NOT committed to the repo.)

---

## Part 4 — KDP publishing (your action)

7. [x] **Paperback — leave it.** Keep the existing live listing
       (`B0H37X9P8J` / free ISBN `979-8196110795`) exactly as-is: reviews, sales, ranking
       intact. This stays the *first edition, independent.* The Bowker paperback ISBN
       `979-8-9967127-0-0` is **held in reserve** for a possible future Soullab Press paperback.

8. [ ] **Hardcover — the first Soullab Press edition.** Create the hardcover →
       "Use my own ISBN" `979-8-9967127-1-7` → **Imprint = Soullab Press** → upload the new
       interior `book-print-soullab-press-v2.pdf` + a hardcover cover wrap carrying that ISBN.
       - ⚠️ **Set the Bowker ISBN before it goes live.** The interior copyright page now prints
         `979-8-9967127-1-7`; if the book publishes under a *free* ISBN, the printed ISBN won't
         match the barcode/metadata. If a hardback is already in review under a free ISBN, end it
         and resubmit a fresh hardcover pairing **this ISBN + this interior PDF together.**

9. [ ] **Kindle eBook — update in place.** It uses an ASIN, not an ISBN. Edit its
       **Publisher** field to `Soullab Press` and re-upload `book-epub-soullab-press-v2.epub` —
       same listing/ASIN, reviews preserved.

---

## Verify

**Before publishing the hardcover — open the Bowker record for `979-8-9967127-1-7` and confirm
(match KDP exactly to avoid a metadata mismatch):**
- [ ] Publisher / imprint: **Soullab Press**
- [ ] Title: *Elemental Alchemy: The Art of Living a Phenomenal Life*
- [ ] Author: **Kelly W. Nezat**

**After publishing:**
- [ ] Hardcover product page "Publisher:" reads **Soullab Press** (not "Independently published").
- [ ] Hardcover Look-Inside title + copyright pages show the Soullab Press block + ISBN `…1-7`.
- [ ] Kindle edition Publisher field shows Soullab Press.
- [ ] Paperback untouched — still live, reviews/ranking intact.

## Notes / open

- ⚠️ **Don't buy Bowker's "Buy Barcode."** KDP auto-generates the cover barcode for free.
- The copyright page lists **both** ISBNs (paperback `…0-0` + hardcover `…1-7`), which is
  conventional. The live paperback is the separate independent edition (free ISBN); the
  paperback Bowker ISBN anticipates a future Soullab Press paperback. Say the word to trim to
  hardcover-only if you'd rather the canonical edition not reference a paperback that doesn't
  exist yet.
- Author byline on the title page is "Kelly Nezat"; copyright holder is "Kelly W. Nezat"
  (per spec). Change the byline too if you want them identical.
- "First Edition" on the copyright page could read "First Soullab Press Edition" to mark the
  lineage — say the word.
- Stale, non-shipping variants still say "Soullab Media / © 2024":
  `ELEMENTAL_ALCHEMY_MANUSCRIPT.md`, `ELEMENTAL_ALCHEMY_REBUILT_COMPLETE_DRAFT.md` —
  reconcile or delete to avoid a future wrong-file render.
