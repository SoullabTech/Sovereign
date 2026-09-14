# S3 · ROUTE INTEGRATION — ACCEPTED / CLOSED

**Founder ruling** 2026-09-14
**Candidate** `6ec5ff1d` — atomic post-cognition completion + sibling route-effect law
**Witness** `e5241151` — `docs/programme/S3-ROUTE-INTEGRATION-REPAIR_WITNESS_RESULT_2026-09-14.md`
**Frozen law** Class-B freeze @ `2255b60d` — INTACT

> The witness answered the exact open question: **can `6ec5ff1d` produce only the
> two durable worlds the architecture permits? Yes.**

⛔ **THIS RULING CLOSES THE LANE. IT DOES NOT AUTHORIZE MERGE OR DEPLOY.**

---

## 1 · What was proved

```text
S3 substrate                    PROVED
route integration               PROVED
atomic post-cognition repair    PROVED
RI-X1                           CLOSED
RI-X2                           CLOSED
post-repair F8                  CLOSED
R1–R12                          CLOSED
project typecheck               PASS · 229 vs baseline 239 · 0 regressions
Class-B freeze                  INTACT · diff EMPTY
```

⭐ **The two decisive pieces, and why they are the decisive ones.**

**RI-X1** — failure at the *latest* transactional point rolled back the canonical
turn, both receipt confirmations and the completion together. The retry then
returned `INTERRUPTED`, which at `8e5da279` was the defect and here is **the
truth**: no canonical result exists to recover.

**RI-X2, N = 2** — receipt 1 actually became `crossed` **inside** the transaction
(`in_tx_crossed_before_abort = 1`) before receipt 2 was forced to fail, and
rollback restored **both** to `attempted`. ⭐ That proves real transactional
indivisibility rather than an early error caught before anything changed. A
one-receipt case would have proved only that the throwing API can abort.

⭐ **Lost-response recovery needed nothing new.** `S3-F6` carries it in the frozen
suite; `R4` carries it at route scope. Both ran. ⛔ No architecture was invented
to satisfy the obligation — the founder's instruction was to report a gap rather
than build one, and there was no gap.

---

## 2 · What the ruling explicitly did NOT do

⛔ **It did not reopen the architecture.** There is no technical reason in the
witness to demand another S3 repair.

⛔ **It did not convert the standing prohibition into authority.** A proved
candidate is not a merged one. Merge is a separate founder act — and by the
2026-09-07 finding, **merging these migrations to `clean-main-no-secrets` is
itself latent schema-deploy authorization**: the next unrelated full deploy would
apply them.

⛔ **It did not absorb the two caveats the witness recorded.** Both stay explicit:

- The **`ask_turns_pkey` concurrent author-turn collision** is routed OUT of this
  lane — see `THREAD_STORE_CONCURRENT_TURN_COLLISION_FINDING_2026-09-14.md`.
  ⛔ *Do not repair it opportunistically here.*
- **56 of 480 legacy migrations refused** on the shadow (absent extensions or
  predecessors). Every table the route reaches was created and each is named in
  the witness §6. ⭐ The refusals stay **explicitly recorded rather than silently
  normalized** — a caveat that is quietly dropped is a caveat that was never
  really held.

---

## 3 · Standing

```text
S3 ROUTE-INTEGRATION            ✅ ACCEPTED / CLOSED
candidate                       6ec5ff1d
witness                         e5241151
Class-B freeze                  INTACT @ 2255b60d

thread-store concurrency        OPEN · ROUTED OUT

MERGE                           ⛔ requires explicit authorization
SCHEMA DEPLOY                   ⛔ requires explicit authorization
PRODUCTION                      UNTOUCHED
```

The next decision is the founder's: authorize merge of the proved Class-B
candidate, or hold it.
