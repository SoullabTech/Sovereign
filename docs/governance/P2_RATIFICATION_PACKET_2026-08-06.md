# P2 — Ratification Packet

**Prepared 2026-08-06. Evidential only.**

⛔ **This document contains no ruling, no proposed ratification language, and no recommendation.**
Its sole purpose is to let the founder perform P2 against **identified, immutable referents** rather
than reconstructed memory. The preparation is evidential; the sitting is constitutional.

**Authority for this packet:** `docs/design/practitioner-portal/PRACTITIONER_PLAN_RECORD_2026-08-05.md`
— §1 row 2 (P2), §2 (P2 amendment), §5 (custody ruling), line 190.

⚠️ **Ratifying the Record is not P2** (Record :23). The Record authorizes the *sequence*; P2
authorizes the *model* the sequence builds on.

---

## 1. What P2 ratifies

Per Record :69 — **one act, explicitly inclusive**: the authority model **and** prohibitions N7, N8,
N11. The ratification record must **name the exact source commits** and state that those three
prohibitions **acquire force through this act**.

### 1a. The authority model — two documents

| Canonical path | Commit | Blob | Bytes | Status at that commit | Object governed |
|---|---|---|---|---|---|
| `docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md` | `72945d1eb` | `19d65f207a9e` | 38,185 | **CANDIDATE** product definition. Cat 1 + Cat 2. *"Authorizes: nothing to be built, migrated, or ingested."* | The Constitution. §3 axes are the portion P2 ratifies (per Six-Month Plan :40). |
| `docs/governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md` | `6a521eb5f` | `f87e8b394ed1` | 21,930 | ⛔ **SCHEMA / DESIGN — NOT IMPLEMENTED.** *"No table, no migration, no route, no compiler exists. This document authorizes nothing to run."* | The authority model. Parts 1–3 are the portion P2 ratifies. |

### 1b. The three Tier 2 prohibitions

Verbatim from Record :121–124. Text is carried here for the sitting; the governing copies live in
the documents above.

- **N7** — aggregation cannot manufacture a rights grant unavailable at the individual level.
- **N8** — popularity, frequency, consensus may not harden into normative authority or "best practice."
- **N11** — MAIA may disclose state and available gestures; it may not nudge toward promotion or
  authorship claims.

---

## 2. Custody-repair scope — the five governing documents (§5)

⚠️ **Distinct from P2.** These five are the *custody act* (Record §1 row 3), authorized by the
Record and performed by implementation, sequenced **after P2, before P3**. Two of them are also the
P2 referents above; three are not.

§5 binds the method: **restore the byte-identical committed files at their existing canonical
paths**, preserving source history and statuses. ⛔ Not permission to create copies or alternate
canonical homes.

| # | Canonical path | Restore from | Blob | Bytes | Status at commit | On trunk? |
|---|---|---|---|---|---|---|
| 1 | `docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md` | `72945d1eb` | `19d65f207a9e` | 38,185 | CANDIDATE | ❌ absent |
| 2 | `docs/governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md` | `6a521eb5f` | `f87e8b394ed1` | 21,930 | SCHEMA/DESIGN — NOT IMPLEMENTED | ❌ absent |
| 3 | `docs/governance/PRACTITIONER_WISDOM_CAPTURE_PROTOCOL_v1.md` | `51deb4b2d` | `7791bc87f532` | 10,554 | CANDIDATE protocol | ❌ absent |
| 4 | `docs/reviews/LARRY_IP_CORPUS_INVENTORY_AUDIT_2026-08-03.md` | `51fea00ad` | `858db3073f54` | 15,731 | *(no status line)* | ❌ absent |
| 5 | `docs/governance/LARRY_ATTACHMENT_A_INSTRUMENT_v0.md` | `51fea00ad` | `58e431d9f719` | 3,987 | ⛔ DRAFT INSTRUMENT · NOT AN INVENTORY · NO ITEMS PRE-FILLED | ❌ absent |

**Verified:** all four named commits exist and are reachable; all five blobs are present at their
named commits at the stated paths; **all five paths are absent from trunk (`clean-main-no-secrets`,
tip `f9a7326f1`)** and absent from the current worktree (`feature/labtools-redesign`, `f5c5b7ab9`).
The custody gap §5 describes is confirmed as still open.

---

## 3. Drift check (Record → today)

Requested explicitly: confirm each document is still in its intended candidate state, with no silent
drift since the Record was authored.

**Four of five: no drift.** No commit touches paths 2–5 after their named restore commits. Every
other commit found for those paths is a same-day duplicate of the same change across branches.

### ⚠️ One drift finding — document 1 (the Constitution)

A **later** commit modifies the path the Record names:

| | Record's named commit | Later commit |
|---|---|---|
| SHA | `72945d1eb` | `dd8917b08` |
| Date | 2026-08-03 | **2026-08-05 21:14 -0400** |
| Branch | (widely replicated) | `chore/practitioner-field-custody-ruling` (+ `origin/`) |
| Title | v0 as named by §5 | *"absorb the 2026-08-05 founder custody ruling — store the relationship, not the material"* |
| Version header | v0 | **v0.3** |
| Status | CANDIDATE | **CANDIDATE** (unchanged) |
| Size delta | — | +52 / −2 lines |

**Measured facts about the difference** (stated without inference):

- The change is **additive**: a new **§13 (source custody)** at the end, plus header/date lines and
  two single-line insertions at lines ~346 and ~368.
- **The §3 axes — the portion P2 ratifies — are byte-unchanged between the two commits.** Diff hunks
  fall at the header, lines 346/368, and 613+; none touches §3.
- `dd8917b08`'s own commit body states: *"Custody is recorded as a third dimension beside authority
  (§3-§5) and expression (§6) — **the authority schema is not redesigned.** Design only: no build,
  migration, or connector authorized; Larry agreement unsigned."*

⛔ **This packet does not propose which commit P2 should name.** Both are identified above so the
choice is made against known referents.

### ⚠️ Second observation — the Record itself is uncommitted

`git log --all` returns **no commits** for
`docs/design/practitioner-portal/PRACTITIONER_PLAN_RECORD_2026-08-05.md`. The file exists on disk in
the current worktree only. The document that authorizes the sequence, states the custody ruling, and
names the restore commits is therefore **not itself in version control**, and is subject to the same
"absent from the working tree is not adequately recoverable" rationale it applies to the other five
(§5). Recorded as a fact; ⛔ no disposition proposed.

---

## 4. Scope of this verification

- Read-only. Nothing was committed, restored, moved, or modified.
- Verified: commit existence · blob presence at path · byte size · status line as written at that
  commit · trunk presence · worktree presence · post-commit history per path.
- **Not** verified: the *content* correctness of any document · whether §3 axes and Schema Parts 1–3
  say what the Record assumes · production state · any branch other than trunk and the current
  worktree.
- No ruling, no recommendation, no proposed ratification language — per the preparation ⊥ sitting
  separation.
