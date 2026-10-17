# Writer’s Studio R51 — Actual PC3 editorial gesture and exact repeated-passage locus

**October 16, 2026 · Founder Mac Studio · Fiction-only browser engineering · Real five-person beta HOLD**

## Exact lineage and authority

Parent is accepted R50 source `41b8472956551ddf30c5cfec40fd7bf5f335e627`, with its independent validated R17/R38 session + consent → encrypted R47 private editorial choice → R44/R46 one-use signed Apply → R48 ciphertext confirmation → R47 separate Undo, on one invented Work after PostgreSQL restart.

This R51 branch `fix/ws-beta-r51-real-editor-gesture-browser-chatgpt-20261016` adds real **browser-interface** acceptance and one bounded real PC3 UX bug fix. It does **not** create a Next API route, merge to main/release, activate member writing, change SQL migrations, contact writers, purchase model calls, access real keys, or deploy anything.

The browser fixture deliberately renders the **actual** `EditorialDancePanel.tsx` (the same component used by `P4R1Pc3WriteEditView.tsx`) inside the **actual** canonical React `Shell`, with the **real** R41 Unicode selection helper. All text, version identities, member credentials, key tokens and in-browser MAIA examples are invented. It is **not** the full mounted `P4R1WriteEditController` or production Next runtime. Its local HTTP adapter is bounded in-memory fictional authorization, **not** the R50 PostgreSQL, real consent, managed KMS or member service. Independently accepted R50 physical PostgreSQL remains separate evidence.

## Actual UX defect the prior fixture missed

The earlier Shell-only R44–R50 browsers exercised a synthetic Work panel. R51's first actual PC3 component run revealed that repeated passage text (two instances of `lantern glows`) makes **“Read my version in context” disabled** even after the genuine R41 editor resolved the *second* exact occurrence. Root cause: `EditorialDancePanel` called `passageContext(sectionBody, currentText)`, a uniqueness-only lookup that correctly refuses duplicates, but the actual editor already held a trusted exact selection **location** that was not passed through.

Repair:
- `lib/writersStudio/editorialApproaches.ts`: add pure `passageContextAt(body,{start,end,text})`, treating offsets as **Unicode codepoints**, validating integer boundaries and exact selected bytes before extracting before/after. If stale, ambiguous, wrong-body or invalid, return null. The legacy unique-only method remains unchanged when no exact location exists. **Never relocate to the first or nearest phrase**.
- `EditorialDancePanel.tsx`: optional `passageLocus`, which owns the context when provided. No uniqueness fallback when a provided locus fails validation; current selected text must match the exact location as well.
- `P4R1Pc3WriteEditView.tsx`: carry `props.held` exact position only into **the isolated editorial room** that genuinely owns a held passage. Its non-isolated branch only mounts when `!props.held` and must not invent a location; strict TypeScript caught and enforced that distinction.
- `RevisionDesk.tsx`: optional exact passage locus and locus-aware review identity; moving to a different occurrence with the *same* words invalidates an earlier reviewed preview. Existing non-locus callers retain conservative uniqueness behavior.
- `EditorialDancePanel` also disables durable “Save my version”, “Apply my version” and “Undo this change” controls while the session privacy posture is unresolved or Sanctuary. This is a UX guard, **not** a substitute for real R50 server-side Sanctuary/consent authorization.

## Real browser action walkthrough

The bounded R51 fixture `wsR51ActualEditorialGestureBrowser.tsx` mounts actual Shell + EditorialDancePanel and locally serves only `127.0.0.1` HTML/JS/CSS; Playwright uses installed Mac Chrome and WebKit on desktop and 390×844 mobile. Strict no-external-request interception, local HttpOnly fake session, exact Origin/CSRF, small JSON bodies, and **closed action vocabulary** are enforced by `wsBetaR51ActualEditorialGestureBrowser.cjs`.

The real component event sequence tests:
1. The UI initially contains the unedited fictional manuscript, with **no open editorial panel** and no possibility to Apply.
2. A genuine textarea selection anchors the **second** repeated phrase after an emoji, using R41 codepoint offsets. The actual PC3 editorial panel appears with two non-ranked fictional MAIA possibilities.
3. Reading a MAIA recommendation is **not** enough to Apply. Selecting a different/deliberately refreshed version resets prior preview. The actual **Save my version** action sends writer-chosen words only to the fake local **Save** endpoint and returns a separately identified **member version**; manuscript remains unchanged.
4. **Read my version in context** shows the proposal at the right repeated occurrence and enables Apply only for that exact reviewed member version. Editing the wording invalidates the review; typing old wording back does **not** silently restore the prior authorization. A fresh review is required.
5. **Sanctuary posture** disables all persistent Save/Apply/Undo controls; Ordinary restores the explicit author action.
6. Actual **Apply my version** click triggers a fake separate token PREPARE followed by POST `{kind:"apply_reviewed_change",opaqueToken}` only; no Work, member, alternative or prose crosses Apply. One fake change edits only the second occurrence; a replay of spent token refuses.
7. A **separate Undo this change** click triggers its own fresh token and POST `{kind:"undo_reviewed_change",opaqueToken}` only, restoring exact preceding fictional manuscript bytes.
8. Chrome + WebKit and mobile check real canonical Shell, mobile manuscript first, initial author editing gates, no JavaScript errors, zero off-origin HTTP/model requests, and browser/server teardown. Screenshots contain only invented writing.

**Actual precommit R51 v5:** **79/79 browser checks PASS**, with four invented-text Chrome/WebKit screenshots, no external requests, browser/server closed. Focused **11/11 pure exact-location/stale-Unicode/real-view/Sanctuary tests PASS**; strict scoped UI TypeScript PASS.

## Negative-history custody

R51 v1 HOLD identified the actual repeated-locus defect. v2 HOLD correctly exposed an over-specific test expectation: the real editor intentionally preserves an author’s prior review when newly saved member wording is **byte-for-byte identical**. The test was adjusted to explicitly *reselect* before saving so it can exercise separate Save → contextual Read → Apply gates. No existing author intent was discarded. v3 HOLD was a browser-harness JavaScript closure error (`SOURCE` belonged to Node rather than the page); v4 PASSED 65 checks; expanded v5 PASSED 79, additionally requiring stale working-text review invalidation and Sanctuary Save/Undo disability. All older evidence directories are preserved and never overwritten.

## What remains nonwaivable

- **The browser HTTP fixture is intentionally in-memory.** It is not the real R50 authenticated encrypted Apply/Undo backend or one transaction connecting a real PC3 controller to the R50 PostgreSQL. Do not claim end-to-end Next/signed-in Mac Safari/physical iPhone app readiness from separate R50 PG and R51 Playwright successes. A browser user-action request does not establish biological presence or unforgeable human intent.
- The real R50 service still needs independently enforced Sanctuary posture, anti-CSRF, current revocation/fenced keys, a durable server-side bound author review/consent receipt, operational managed KMS and cross-process authorization. UI disabled controls alone are not security.
- Every legacy plaintext writer/source/edit/Keep/revision/SQL/JSON/log/WAL/backup/export/old rollback route must have an independently vetted encrypted migration or fail-closed quarantine; **no plaintext fallback**.
- Entire enforced shipping production TypeScript/build, external signer/key high-water/rollback/offsite recovery, real authenticated editor, actual document import & Save a Copy/Listen/MAIA depth, App/Safari mobile manual review, separate Class A and founder exact source/image and **per-writer canary GO** remain outstanding. Prior shipping baseline had 193 inherited TypeScript diagnostics.

**Decision: R51 real-component UI rehearsal locally accepted only after exact-source postcommit requalification; production & small-group beta remain HOLD.**
