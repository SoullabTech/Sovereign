# Kelly identity consolidation — PLAN ONLY (no writes performed or authorized)

**Date:** 2026-08-24 · **Evidence:** two read-only censuses (direct FK, indirect practitioner/session)
**Status:** PLAN. No member, practitioner, session, portrait, role or FK was changed.

```
CANONICAL MEMBER              ce284751… / kelly@soullab.life
CANONICAL PRACTITIONER        0776d427… (slug kelly-nezat, status active)
SOURCE MEMBER TO RETIRE       49ae4717… / soullab1@gmail.com
SOURCE PRACTITIONER           fb0cb8b7… (slug kelly-nezat-old, status SUSPENDED)
RECENT DUPLICATE PRACTITIONER 717da53c… — provenance RESOLVED, see §2
```

## 1. The finding that reframes everything

`fb0cb8b7` — the practitioner under the account we are retiring — **holds the email
`kelly@soullab.life`**. The canonical practitioner `0776d427` holds an auto-generated placeholder,
`personal-ce284751@soullab.life`. `practitioners_email_key` is **UNIQUE(email)**.

So the good identity strings live on the wrong row, and they cannot simply be copied across —
one row must give up the email before the other can take it. This is a founder choice, not SQL.

## 2. Provenance of `717da53c` — resolved, and it is NOT a duplicate of anything

| | |
|---|---|
| name | `Personal Studio` (not "Kelly Nezat") |
| email / slug | `personal-49ae4717@soullab.life` / `personal-49ae4717` — both auto-generated from the member id |
| created | 2026-08-21 20:02:01.**650** |
| its only inbound row | one `practitioner_themes` record, created 2026-08-21 20:02:01.**650** |

**The practitioner row and its theme share a created_at to the millisecond.** That is an atomic
auto-provision, not a human act. `0776d427` shows the identical signature (row + theme both
2026-03-27 16:48:10.911). `fb0cb8b7` does not — its theme lands 24s later.

⭐ So `717da53c` was created by a **code path that auto-provisions a "Personal Studio" practitioner
+ default theme when a member without one opens Studio**. Its theme is the stock default (MAIA /
warm / `#D4AF37`), byte-similar to the other two.

⛔ It duplicates no *work*. It is also **not disposable on those grounds** — it is a live `active`
practitioner with a real inbound row, and something caused it three days ago. Disposition below.

## 3. Writer's Studio — three copies of ONE book, not divergent work

| owner | manuscript | created | draft content |
|---|---|---|---|
| Kelly | `33a9233c` book-print-kdp-final | 08-06 | **379,919 b** |
| soullab1 | `472f6759` book-print-kdp-final | 08-14 | **379,919 b** |
| soullab1 | `19cff0dc` book-print-kdp-final | 08-16 | **379,919 b** |

All four revisions read `Initialized verbatim from source`; every content length is **identical**.
These are **re-uploads of the same file** by a founder who could not find the previous one — the
same symptom as the portraits. **Nothing has diverged, so nothing can be lost by choosing.**

## 4. Domain matrix

| Domain | ce284751 side | 49ae4717 side | Proposed action | Collision risk | Rollback |
|---|---|---|---|---|---|
| MAIA memory / history | 1268 signals · 806 relationships · 655 vectors · 133 atoms | 34 · 32 · 17 · 1 | **Leave both.** Re-pointing 84 thin rows rewrites provenance for no gain | none if untouched | n/a |
| Soul Portraits | 16 | 0 | **LEAVE UNTOUCHED** — already canonical | none | n/a |
| Studio (practitioner-mediated) | 74 inbound rows | 37 inbound rows | Re-point `fb0cb8b7` children → `0776d427` | medium — 37 real client/decision rows | per-table row-level |
| Writer's Studio | 1 manuscript + 1 draft | 2 manuscripts + 2 drafts | **Founder picks one; archive the others in place** | none — all identical bytes | n/a |
| OAuth / login | none | google `1099660714…` | **Re-point `oauth_accounts.member_id` → ce284751** | **NONE** — ce284751 has no google row | single-row revert |
| Roles / admin | `founder`, `{member,beta_tester,team_admin,admin}` | `{member,beta_tester}` | **No action** — canonical already holds everything | none | n/a |
| Practitioner records | `0776d427` active, placeholder email | `fb0cb8b7` suspended, **owns kelly@soullab.life**; `717da53c` auto-provisioned | See §5 | **HIGH — UNIQUE(email), UNIQUE(slug)** | requires ordered swap |
| Singleton rows | `member_settings`, `member_spiral_state`, `team_presence` — 1 each | 1 each | **CANNOT re-point** | **HARD — UNIQUE/PK on member_id** | must choose one |

## 5. The four questions

**1 · What should move from 49ae4717 → ce284751?**
Only two things are worth moving, and only one is free:
- the **Google OAuth binding** (1 row, zero collision) — this is the whole login fix;
- the **37 practitioner-child rows** under `fb0cb8b7` (Studio decisions, clients, availability).
Nothing else. The 84 thin memory rows should stay where they happened.

**2 · What should remain attributed to the old ID?**
The memory/history rows, the `admin_role_grants` pair, and the manuscripts you do not choose. They
are a true record of what occurred under that account. Consolidating identity ≠ rewriting history.

**3 · Which collisions need a founder choice, not SQL?**
- **`practitioners.email`** — `kelly@soullab.life` sits on the *suspended* row. Which practitioner
  ends up owning it, and does `kelly-nezat-old` release the slug?
- **`member_settings` / `member_spiral_state` / `team_presence`** — one row each per member, UNIQUE
  on `member_id`. Two exist. One must be kept and one discarded; no merge is possible.
- **Which of the three identical manuscripts is the one you keep.**

**4 · Can soullab1@gmail.com become a recovery login for the canonical member?**
**Yes — and this is the cheapest correct act in the whole plan.** `oauth_accounts` is UNIQUE on
`(provider, provider_user_id)`, not on member. `ce284751` has **no** Google row. Re-pointing that
single `member_id` makes Google sign-in land on canonical Kelly. ⚠️ Note `members.has_oauth = false`
on **both** rows despite the binding existing — that flag is already wrong and should be reconciled
in the same transaction, not separately.

## 6. Disposition of `717da53c`

Not disposable, not urgent, and **not part of the consolidation**. It is an auto-provisioned shell.
Deleting it without first fixing the auto-provision path would simply recreate it the next time
that account opens Studio. ⭐ **The defect to fix is the code path, not the row.**

## 7. Not authorized by this document

No member/practitioner deletion · no FK updates · no session revocation · no portrait change ·
no role change · no manuscript deletion. One reversible transaction should be designed **after**
the §5 choices are made — not a series of small fixes that quietly rewrite provenance.
