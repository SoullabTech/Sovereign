# WS2 02c-2R — Mac Studio Canonical Successor Witness (evidence record)

Instrument and evidence carrier only. Witnessed product SHA:
`58ac95a779278bda427fb869aa188e618442d756`. Host: Kelly's Mac Studio
(`Darwin Kellys-Mac-Studio.local 24.6.0 arm64`, Mac16,9).

---

## ATTEMPT 1 — STOP (prerequisite infrastructure defect)

```text
MAC SUCCESSOR ATTEMPT 1
STOP — prerequisite infrastructure defect

Finding:
npm run db:migrate cannot bootstrap an empty PostgreSQL database at 58ac95a77.

Failure:
20251231_memory_architecture_enhancements.sql:123
ALTER TABLE developmental_memories ...
relation "developmental_memories" does not exist

Runtime proposition:
NOT REACHED

02c-2R repair verdict:
UNCHANGED
```

Scratch DB `maia_ws2_02c_2r_witness_58ac95a77` created fresh; chain halted at
36 of 459 migrations (exit 3). Retained un-dropped as evidence for
DB-EMPTY-BOOTSTRAP-01. This is not a 02c-2R failure.

---

## ATTEMPT 2 — canonical witness executed

### Database substrate (state precisely; do not call this "migrated")

```text
fresh empty scratch database populated with SCHEMA ONLY from the local
maia_consciousness schema; no member rows copied; synthetic witness fixture
was subsequently created by seed.ts.

This run does NOT attest empty-database migration reproducibility.
That property was separately tested and failed under DB-EMPTY-BOOTSTRAP-01.
```

- DB: `maia_ws2_02c_2r_mac_58ac95a77` (created fresh; prior partial DB NOT reused)
- Source: `pg_dump --schema-only --no-owner --no-privileges maia_consciousness`,
  read-only, one time. PG17 client required (PATH default 14.19 aborted on
  server 17.7 mismatch).
- 641 tables loaded, 0 load errors.
- No-member-data boundary: members / auth_sessions / member_manuscripts /
  manuscript_working_drafts / manuscript_draft_sections all **0**; and
  `sum(n_live_tup)` across all public tables = **0** before seeding.
- The app was never pointed at `maia_consciousness`. Next was started with
  `npx next dev -p 3100` (NOT `npm run dev`, which runs `env -u DATABASE_URL`).
- Corroborates DB-EMPTY-BOOTSTRAP-01: `developmental_memories` DOES exist in
  the production schema while no repo migration creates it.

### Custody

```text
HEAD      58ac95a779278bda427fb869aa188e618442d756
detached  YES (git branch --show-current empty)
tracked   CLEAN  (git status --porcelain = "?? .witness/" only)
worktree  /private/tmp/ws2-02c-2r-runtime-witness
```

Verified before extraction, after extraction, after `npm ci`, and after the run.

### Instrument

```text
7c7988745011b52058be4a51f4b96a710971e723d28eadeffd902a76c16bdbe1  .witness/seed.ts
855e24eada8162e252e752c139b4f7d1332d81410cfe48d410f4dbbf9772cd86  .witness/browser-witness.mjs
```

Portable instrument `ef0063dc0` (branch `claude/ws2-02c-2r-witness-ltdfvw`),
pinned by commit, not branch name. It was **absent from this machine's object
store** and had to be fetched — the handoff record assumed local presence.

Verified diff `5e69c8234 -> ef0063dc0` on `browser-witness.mjs` is exactly the
`executablePath` parameterization plus a comment. Nothing else differs.

### Browser

```text
CHROMIUM_PATH=/Users/soullab/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing
Google Chrome for Testing 151.0.7922.34
```

Playwright chromium-1234 distribution, NOT system Chrome. Note: on macOS this
Playwright build ships as `Google Chrome for Testing.app`, not `Chromium.app`;
the `*/Chromium.app/Contents/MacOS/Chromium` find pattern yields nothing.

### Result

```text
http_status                 200
structure_review_present    true      data-form="mixed"
loading_state_present       false
review_notice               null
mark_question_count         3
mark_open_count             8
review_map_present          true
inspector_present           true
marker click                clicked=true, inspector "p3",
                            [data-ask-maia] mounted = 1, body_has_ask = true
hook_faults                 []
page_errors                 []
failed_requests             []
console_errors              only the dev-server HMR websocket
```

Mark labels carried the 02c-2 form, e.g.
`Talk with MAIA about her question: Where does the first element begin?`

`next_error_overlay: true` is `q('nextjs-portal') > 0` — the host element Next
15 dev mounts unconditionally for its dev-tools indicator. It is not an error
signal here: `page_errors` and `hook_faults` are empty and `body_text_head`
begins "MAIA'S READ", not the control's "Something Went Wrong". The remote
record's curated summary does not report this field, so it is stated rather
than cross-compared.

### Comparison to the remote-container record (`5e69c8234`)

Every field the remote record adjudicates on matches exactly: `http_status`,
`structure_review_present` + form, `loading_state_present`, `mark_question_count`,
`mark_open_count`, `review_map_present`, `inspector_present`, marker click
(inspector `p3`, ask-maia = 1), `hook_faults`, `page_errors`, `console_errors`,
and the mark label text.

### Verdict

```text
MAC CANONICAL SUCCESSOR WITNESS   PASS
02c-2R IMPLEMENTATION VERDICT     PASS — repair verified at runtime on the
                                  chartered host, second host, second OS,
                                  second browser distribution
```

Claim discipline: instrumentation is **not** byte-identical across hosts. What
holds is that instrument logic is identical except for one host-specific
executable-path constant moved to an environment parameter. No negative control
was re-run on the Mac; the discriminating control remains the remote one at
`17c8a3d29`.
