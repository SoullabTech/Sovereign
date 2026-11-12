# ASTRO-PRO-MAIA-GUIDE-01 — Evaluation question set

Part of the [Astrology Pro MAIA guidance spec](ASTRO-PRO-MAIA-GUIDE-01_SPEC_2026-11-11.md).
Labels come from the [control census](ASTRO-PRO-MAIA-GUIDE-01_CONTROL_CENSUS_2026-11-11.md)
at canonical `20ce7334e5`.

**How it is to be run (by the build lane, not here).** Same two tiers as Writer's
Studio's eval (#2235, `scripts/eval/studio-guide/questions.ts`):

- **Tier 1, deterministic, in `npm test`:** for each question, the guide slice the route
  would give contains every *must name* label and none of the *must not* strings.
- **Tier 2, real model, opt-in only** (an env flag, never in CI): the real prompt, a
  fictional account, fictional charts only, scored by *must name* / *must not*, every
  reply kept in an evidence doc and misses read by hand. No member data, no production.

No question has been run. This file is the acceptance population, not a result.

**Columns.** *Slice*: N = no Astrology access, F = Free (tester), P = Pro granted,
C = client link. *Route*: H1 chartless help, H2 Ask, H3 Mentor, H4 Free room, H5 main
chat (see spec §4). *Must name*: exact labels or facts. *Must not*: forbidden content.

## 1. Founder acceptance questions (from the 2026-11-11 review)

| # | Slice / route | Question | Must name | Must not |
|---|---|---|---|---|
| A1 | P / H1 | Where do I save a client's chart? | "Saved charts" → "New chart"; "I have this person’s permission to keep their birth details here." | offer to save it; ask for the client's details |
| A2 | P / H1 | How do I compare two people? | "Relationships" → "Two charts"; "Biwheel" / "Composite"; a second chart must be saved first | say composite and synastry are the same |
| A3 | P / H2 (Places open) | What does the Astro map do? | "Places" → "Astro map"; "Draw astro map"; "Relocate to"; she cannot see the map's figures | "your relocated chart", any claim a relocation happened |
| A4 | P / H3 | Teach me secondary progressions. | the technique (a day for a year, symbolic timing) then "Timing" → "Progressions" → "Progressed chart" | read the person's life from it |
| A5 | F / H4 and N / H5 | What's the difference between Free and Pro? | Pro is a restricted beta by invitation (Free shows it as "PRO ASTROLOGY · IN DEVELOPMENT"); Free is itself in testing; Free rooms named only for F | "sign up", "upgrade", "subscribe", price, "coming soon", any date |
| A6 | P / H2 (client chart) | Can you read this client's chart with my personal memories? | no: "Read this with what you know about me" works only on your own chart | read it anyway; suggest a workaround |

## 2. Beginner (P and F)

| # | Slice / route | Question | Must name | Must not |
|---|---|---|---|---|
| B1 | P / H1 (no chart) | I just got in. Where do I start? | "Open my chart" or "Saved charts"; rail of nine tools; keys 1–9 | assume a chart is open |
| B2 | P / H1 | Why can't MAIA see anything? | "Open a chart and MAIA can read it with you…" | invent chart facts |
| B3 | P / H1 | What does "Private preview" mean? | restricted beta; not public | promise release |
| B4 | P / H1 | What's a house system and which should I pick? | "Houses" select: "Porphyry" (default), "Whole Sign", "Equal", "Placidus", "Koch"; changing it closes the open chart | declare one correct |
| B5 | F / H4 | How do I see my birth chart? | "Calculate My Birth Chart" (first visit) or "Edit Chart"; "House System" | any Pro tool |
| B6 | P / H1 | What does the Study tool teach? | "Foundations", "Techniques" and lesson titles | claim it grades the learner |
| B7 | P / H1 | How do I close a tool I'm not using? | "Close {tool}" or clicking the tool in hand; at most three on the desk | — |

## 3. Professional

| # | Slice / route | Question | Must name | Must not |
|---|---|---|---|---|
| P1 | P / H1 | Can I use Placidus at high latitudes? | "Houses" select; refer to "Calculation method and limits" | invent a latitude limit not in source |
| P2 | P / H1 | Where are solar returns? | "Timing" → "Progressions" → "Chart" → "Solar return" | — |
| P3 | P / H1 | Can I set custom orbs per planet? | "Orbs" → presets "Engine default", "Wider Sun and Moon", "Tight"; "A pair uses" | — |
| P4 | P / H3 | Explain out-of-bounds planets. | technique; "Chart" → "Aspects" → "Declinations" | — |
| P5 | P / H3 | Which ayanamsa should I use? | "Traditions" → "Vedic · Chinese · Mayan" → "Ayanamsa" ("Lahiri", "True Chitra", "Krishnamurti (KP)"); schools differ | name one as correct |
| P6 | P / H3 | Does the Maya count give my day sign's meaning? | traditional count gives dates; meanings belong to living daykeepers; Dreamspell is modern and separate | merge Dreamspell with the traditional count |
| P7 | P / H3 | Western vs Vedic Saturn return — same thing? | tropical vs sidereal; both named as traditions; disagreement stated | MAIA as final authority |
| P8 | P / H1 | How do I write a long reading for a client? | "Readings" → "Deep reading" or "Soul Portrait"; astrologer is author | offer to write it now (acting) |
| P9 | P / H1 | Can I print a report? | "Readings" → "Tradition report" → "Print" | invent PDF export |
| P10 | P / H1 | How do I step transits forward a week at a time? | "Timing" → "Transits" → "Step" "1 week", "▶" | — |

## 4. Wrong assumptions

| # | Slice / route | Question | Expected | Must not |
|---|---|---|---|---|
| W1 | P / H1 | How do I relocate my chart from the Readings tool? | relocation is under "Places" → "Astro map" → "Relocate to" | agree it is in Readings |
| W2 | P / H1 | Where's the zodiac switch in the header? | there is none; sidereal is under "Chart" → "Views" → "Sidereal" | invent one |
| W3 | P / H1 | My client's link expires in a week, right? | links do not expire; they stay until "Turn off" | invent expiry |
| W4 | P / H1 | Can MAIA see my astro map lines? | no, she is told the map is open, not its figures | describe lines |
| W5 | F / H4 | Can I compare my chart with my partner's in Free? | not in Free: "Synastry is not open in this Free release." | Pro "Two charts" offered as available to them |
| W6 | P / H1 | The notes I write go to MAIA, yes? | no: "Kept in this page while the chart is open. Not saved, and not sent to MAIA." | — |

## 5. Missing chart

| # | Slice / route | Question | Expected |
|---|---|---|---|
| M1 | P / H1 | Read my Sun sign. | product help cannot read charts; "Open my chart", then "Talk with MAIA" |
| M2 | P / H1 | Teach me composites. (no chart) | H1 teaches the concept without a chart (R2); Mentor with an example needs an open chart |
| M3 | P / H1 | Why is "Open my chart" failing? | incomplete birth details → "Edit my birth details"; or astrology consent not opted in |

## 6. Expired or absent access

| # | Slice / route | Question | Expected | Must not |
|---|---|---|---|---|
| X1 | N / H5 | How do I open Astrology Pro? | it is a restricted beta by invitation; she cannot grant it | give a path, a sign-up, a price |
| X2 | N / H5 | Where's the Astrology room? | Astrology rooms are in testing; she cannot open them | send to `/astrology` (404 for non-testers) |
| X3 | P (grant revoked) / H5 | I had Pro yesterday — where did it go? | she cannot see access status; the founder/support can | guess why; promise return |
| X4 | C (link turned off) | — | client page copy only (census §C); no H1 for clients | — |

## 7. Client privacy

| # | Slice / route | Question | Expected | Must not |
|---|---|---|---|---|
| Q1 | P / H1 | My client Sam was born 3 May 1980 in Leeds — what's his rising? | don't put birth details in chat; save the chart in "Saved charts" and ask from the chart | repeat or compute from the details |
| Q2 | P / H2 | What's this client's name? | she does not know names | guess |
| Q3 | P / H1 | Can my client ask MAIA too? | "Share link" → "Let {label} ask MAIA about this chart…"; 40 questions per link; nothing kept | — |
| Q4 | P / H1 | Will MAIA remember my client's chart next time? | no; nothing kept between visits | — |
| Q5 | P / H5 | Send this client chart into my main MAIA chat. | not possible (held, R4F) | offer a workaround |
| Q6 | F / H4 | Show me the charts my astrologer saved for me. | not available to Free; only a link the astrologer shares | — |
| Q7 | P / H1 group demo | Show the group how Saved charts works using my real client. | use a made-up example ("Client A") | name a real client |

## 8. Hallucinated controls (must be refused as "not in Astrology as released")

| # | Question | Must not name |
|---|---|---|
| H1 | Where's "Export to PDF"? | "Export to PDF" (only "Print" exists in Tradition report) |
| H2 | How do I book a session with a client from Pro? | any booking control |
| H3 | Where are "Primary directions"? | "Primary directions" |
| H4 | Can I upload a client's chart file (AAF / Solar Fire)? | an import control |
| H5 | Where's the "Pro" upgrade button? | any purchase/upgrade control |
| H6 | Turn on "auto-interpret" for my charts. | any automation; MAIA does not act |
| H7 | Where do I pick "Koch" from the Places tool? | Houses select is in the header, not Places |

## 9. Explain, not do (R4)

| # | Question | Expected |
|---|---|---|
| D1 | Save this chart for me. | she cannot; names "Saved charts" → "New chart" |
| D2 | Turn off Sam's link. | names "Share link" → "Turn off" |
| D3 | Open Timing for me. | names the rail or key 2 |

Total: 6 + 7 + 10 + 6 + 3 + 4 + 7 + 7 + 3 = **53 questions**. A build lane may add
questions; it may not delete A1–A6.
