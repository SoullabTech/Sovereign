# HPB-05 — Book Cover Assets Evidence

**Date:** 2026-09-16
**Base:** HPB-04 head `a38a7c50b`
**Branch:** `feature/ws-hallmark-book-production-05`

## Purpose

Elemental Alchemy — Hallmark Edition is the acceptance target. HPB-05 gives Book Production two independent author-owned print-cover slots: paperback and hardcover.

Uploading a cover establishes custody of exact artwork bytes. It does **not** certify that the file matches final trim, spine, bleed, or printer geometry. That certification depends on the finished interior and is a successor gate.

## Custody law

- paperback and hardcover are distinct edition identities
- accepted upload is one readable single-page PDF wrap
- browser MIME and dimensions are not authoritative
- server computes SHA-256, byte size, page count, width and height in PDF points
- bytes live in the private vault; no public cover URL is minted
- replacement queues the superseded bytes for erasure in the same transaction that repoints custody
- removal deletes the metadata row and owes destruction of the exact stored bytes
- a failed metadata commit cleans up newly written orphan bytes
## Whole-manuscript erasure

Cover custody must end when the manuscript ends. `eraseManuscript` therefore reads both cover storage paths before deleting `member_manuscripts`, adds those exact paths to the existing vault erasure queue inside the same transaction, and only then permits the metadata cascade. Paperback and hardcover bytes cannot become unreferenced-but-retained artifacts of a manuscript deletion.

## Author surface

Book Production presents two independent slots: **Paperback cover** and **Hardcover cover**. Each slot supports upload/replace, download of the exact private original, and remove. The surface shows the preserved filename, byte size, abbreviated SHA-256, one-page PDF status, server-measured physical page box, and the explicit state **Print geometry not yet certified**.

No automatic resize, reinterpretation, or printer-ready claim occurs in HPB-05.
## Browser witness

Local browser walk against HPB-05 at desktop 1440×1000 and mobile 390×844 used synthetic member-scoped responses shaped from the two supplied Elemental Alchemy cover assets. Both editions rendered independently with no horizontal overflow, and the existing Proof action remained available.

Witnessed metadata:
- Paperback — `Soft_COVER_FINAL.pdf`, 7.2 MB, page box approximately 53.22 × 38.54 in.
- Hardcover — `Hardcover Cover.pdf`, 6.0 MB, page box approximately 56.89 × 41.43 in.

These large page boxes are recorded as evidence only. They are not interpreted as literal finished-cover dimensions, and they are exactly why print certification remains a successor gate.

## Gates

- cover inspector / custody / UI / publication-plan / render suites: 43 / 43 passed
- cover + existing Work visual erasure doctrine after whole-manuscript repair: 25 / 25 passed
- TypeScript no-regression after final custody repair: 229 vs baseline 239; zero regressions
- design canon: green with one Book Production Experience Contract
- internal imports: green with existing 44 warn-only unresolved imports
- backend imports: green
- no-Supabase: green
- blank-database reconstruction after final custody repair: green; all migrations applied cleanly and app schema gate satisfied
- `git diff --check`: clean
