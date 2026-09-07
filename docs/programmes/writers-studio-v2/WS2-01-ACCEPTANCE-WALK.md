# WS2-01 — Acceptance Walk

Candidate `cc3ef9cbe`, live 2026-08-27, provenance verified three ways.
Deployment is proven. **Acceptance is open.** This file is where the walk lands.

Fill it in during the walk, not from recollection afterwards. An acceptance
record written from memory is a story about a walk, not the walk.

---

## Adjudication — strict, as stated by the founder

```text
A  passes ONLY if Studio Home opens the exact imported title/manuscript
   you selected.

B  passes ONLY if the import completes.

C  passes ONLY if Chapter 10 contains the full chapter body with its
   subheads nested INSIDE it, earlier and later chapters also hold
   correctly, and the bogus "Part 0 — carried without a name" structure
   is gone.
```

A step is PASS or FAIL. There is no partial credit and no "close enough" —
those are the words that let a defect ship.

---

## The walk

| # | Step | Proves | Result |
|---|---|---|---|
| 1 | Import `book-print-kdp-final` again — same file, same path in | B | |
| 2 | Open it from Studio Home | A | |
| 3 | Title and manuscript are the ones clicked | A | |
| 4 | Click Chapter 10 | C | |
| 5 | It holds the chapter BODY, subheads included — not a one-page fragment | C | |
| 6 | Spot-check one earlier and one later chapter | C | |

Also confirm, because these are the specific claims C makes:

- [ ] the rail shows **chapters**, not a hundred one-page fragments
- [ ] the ALL-CAPS subheads (`THE ALCHEMICAL PROPERTIES OF AETHER`,
      `RETURN TO FLOW`) are **inside** Chapter 10, not peers of it
- [ ] **`Part 0 — carried without a name` is gone.** The front matter is the
      opening region and has its own door.

---

## Evidence — durable, not remembered

Two screenshots are required for C:

```text
reference/walk/ws2-01-rail-chapter-10.png     the rail around Chapter 10
reference/walk/ws2-01-body-chapter-10.png     the Chapter 10 body, with the
                                              ALL-CAPS subheads inside it
```

If the import refuses instead: capture the on-screen reason and the matching
log line. Both now exist — that is what WS2-01B bought.

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 15m 2>&1 \
  | grep -E "INGEST ARRIVED|INGEST REFUSED|INGEST READ FAILURE|SEGMENTATION LOSS"'
```

---

## Closure language — fixed in advance, so it cannot drift

If all six pass, the record reads exactly:

```text
A PASS · B PASS · C PASS · cluster closed · root cause unattributed
```

**No retroactive story about which of the four B defects was "the" cause.**
Four were fixed; a green walk does not say which one was being hit. Writing
that story later would be inventing evidence nobody collected — the same
failure the D-007 stamp-versus-code lesson exists to prevent.

If any step fails, that step is FAIL and its unit reopens. A passing sibling
does not carry a failing one.

---

RESULT          not yet walked
WALKED BY
DATE
