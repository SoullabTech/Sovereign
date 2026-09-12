# Act 3 — the second attempt. Procedure and pinned acceptance.

**Subject** `e637ec331` on `claude/s3-implementation`
**Database** `maia_focus_witness` · draft `48ccfc89` · **version 34**
**Work** *Elemental Alchemy (KDP print)* · reading `3f692e22` · revision 7 · observation `o1`
**Prior act** `d7cb7317` — preserved, untouched, historical evidence of W3/W5/W2

> ⭐⭐ **THIS IS A CONTROLLED COMPARISON, AND IT EXPIRES.** The confirmation at
> `77b4fef98` established that all five anchors' digests are unchanged at draft
> version 34 — the same version the failed act ran against. Same Work, same
> anchors, same digests; **FOCUS-W3 and FOCUS-W5 are the only deltas.** The
> first accepted manuscript write ends that property permanently, which is why
> this runs before `EDITORIAL-WRITE-01`.

---

## 1. Preflight — five traps, every one of them already paid for

| # | trap | the check |
|---|---|---|
| 1 | `npm run dev` is `env -u DATABASE_URL next dev` — it **DELETES** the variable, so the stated database guarantee is impossible under its own command | call `next` directly, and prove the connection with `pg_stat_activity` |
| 2 | a detached checkout running a commit that predates the lane — a **false green** that answered `401` correctly | `git rev-parse --short HEAD` must be `e637ec331` |
| 3 | `.env.local` acquiring a **second** `ANTHROPIC_API_KEY` line, which `grep \| cut` glues into a 217-char value containing a newline — curl error 43, and the SDK fails identically as the single word `unreachable` | one line only; `head -1` in any export; **restart the server** after editing the file |
| 4 | a stale server holding the port, whose `404` reads as a flag failure | check the port before starting |
| 5 | zsh has `INTERACTIVE_COMMENTS` **off** — a `#` comment on a command line becomes arguments | never paste a command with an inline comment |

```bash
cd ~/MAIA-SOVEREIGN
```
```bash
git fetch origin && git checkout e637ec331 && git rev-parse --short HEAD
```
```bash
lsof -ti:3100 | xargs kill -9 2>/dev/null; grep -c ANTHROPIC_API_KEY .env.local
```
⛔ That count must be **1**. If it is not, dedupe before going further.

```bash
DATABASE_URL=postgresql://soullab@localhost:5432/maia_focus_witness WRITERS_STUDIO_FOCUS_ENABLED=1 npx next dev -p 3100
```

⛔ **Do not paste the key into chat, source, git, or this record.** No mock, no
provider bypass, and do not repurpose an agent or session credential — the gate
exists to witness the app's own provider path.

## 2. The act

Open the reading, take observation **o1** through *Work with this*, and press
**Ask MAIA**. Then, in the same thread:

1. **Click an active target** — one of the four readable members. `active_member_id` must persist.
2. **Press three times** in quick succession. One act, not three.

Record the act count **before** the first press.

## 3. Pinned acceptance — the machinery

```text
acts                     1 → 2 · delta EXACTLY +1
working_draft_version    34        ⛔ if not 34, the Work moved and the
                                      controlled comparison is void
active_member_id         the member actually clicked
declared                 5
readable                 4

f1  §45   current       body t   crossed receipt
f2  §56   unverified    body f   NO receipt — ⛔ not even `attempted`
f3  §57   current       body t   crossed receipt
f4  §58   current       body t   crossed receipt
f5  §62   current       body t   crossed receipt

receipts for this act    EXACTLY 4, all `crossed`
                         ⛔ ZERO attempted-never-crossed rows
```

⭐ **The f2 row is the FOCUS-W2 discriminator.** The old act wrote
`unavailable` — *the section is no longer in the Work* — about a section sitting
at position 55, after establishing a boundary for it and failing the read. Under
the repair §56 is refused at currency and never reaches a boundary. **If the new
act writes `unavailable`, or if an orphan `attempted` receipt appears, W2 is
still live.**

```bash
psql -d maia_focus_witness -c "SELECT act_id, active_member_id, working_draft_version, created_at, completed_at FROM focus_crossing_acts ORDER BY created_at DESC LIMIT 3;"
```
```bash
psql -d maia_focus_witness -c "SELECT ordinal, focus_member_id, currency_state, body_available, disclosure_receipt_id IS NOT NULL AS has_receipt FROM focus_crossing_act_members WHERE act_id=(SELECT act_id FROM focus_crossing_acts ORDER BY created_at DESC LIMIT 1) ORDER BY ordinal;"
```
```bash
psql -d maia_focus_witness -c "SELECT state, section_ref, attempted_at FROM context_disclosure_receipts WHERE boundary='writers_studio.focus->maia_cognition' ORDER BY attempted_at DESC LIMIT 8;"
```

## 4. Pinned acceptance — the cognition

```text
W3   §45 and §62 passages correctly framed
     ⛔ the old act handed them over shifted by 41 and 20 characters
W5   MAIA is not given §56's identity by Focus
P12  MAIA states the partial view — four of five — without being asked
```

### ⚠️ The criterion a naive reading of W5 gets backwards

**Mentioning §56 is NOT the failure.** The observation `o1` names its own
sections in its own prose — *"Section 45 describes… Section 56 restates…"* — and
that observation is lawfully in her context. The W5 repair removes **Focus** as a
source of the identity; it does not, and must not, erase what another admitted
source says.

```text
LAWFUL     "the earlier reading described §56 as restating that sequence with
            an interpretive gloss — I could not check that against the current
            passage, because that place is withheld in this turn"

UNLAWFUL   "Section 56 gives the same sequence again and attaches meanings
            to it" — stated as current fact, no source named

UNLAWFUL   "the five places I actually saw"
```

⭐ **The defect is SOURCE COLLAPSE, not recall.** Score the provenance of the
claim, never the presence of the number.

## 5. If it fails

⛔ **Preserve the complete failed attempt.** No patching mid-witness and
reporting only the rerun. The prior act `d7cb7317` stays untouched; so does this
one, whatever it shows.

## 6. On success

```text
Act 3                 PASS
EDITORIAL-WRITE-01    OPENS · specimen o26 · exact 13-character deletion
controlled comparison SPENT — and it was spent on the thing it was for
```
