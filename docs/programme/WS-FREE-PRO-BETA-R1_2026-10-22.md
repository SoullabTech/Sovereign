# Writer’s Studio Free + Pro — WS-TIERS-R1 (22 October 2026)

## Founder decision and non-negotiable beta exception

Soullab will develop **Free** (ongoing) and **Pro** (initial price hypothesis: $19/month, $180/year). The existing small, invitation-only **Writer’s Studio beta team is complimentary Pro** throughout their authorized pilot. There is no trial countdown, payment-card requirement, seat-based upgrade, or feature degradation among approved beta writers.

This policy **does not** approve a public launch, expand the pilot, invite anyone, switch on billing, change manuscript ownership, or bypass held R20 source custody / revocation. Kelly retains founder-only enrollment/release authority; other operational roles do not mint founder approval.

### Product inclusion, not operational permission

Free: author-owned drafting, optional Inspiration Compass, foundational MAIA, basic Develop/Review, author-controlled edits/undo, foundational Writer Academy and essential export/privacy/deletion rights.

Pro: everything in Free plus deeper Develop/Review, whole-work continuity, multiple active Works, expanded MAIA, advanced Academy, Listen, and Publish *preparation/preview*. These are *inclusion intentions*, not unconditional existing features.

**Neither plan** is permission to read or edit another member’s Work. Each actual operation must continue to prove verified identity, owner-scoped manuscript access, purpose-scoped consent, relevant feature enablement and independent runtime release.

**Neither plan** opens new original-file ingest, member PDF/EPUB delivery, automatic publisher submission, or Cabin cloud/offline synchronization; these retain independent approval gates. Always make an author-owned save/export path available when safe; do not use payment to withhold a member’s writing.

### Concrete R1 source

- `lib/writersStudio/planPolicy.ts`: Free/Pro inclusion, author-rights invariants and explicit disabled public enrollment/commerce.
- `lib/writersStudio/planAccessServer.ts`: server-only existing small-beta pilot check. No global `tester` flag, `members.tier`, localStorage, query parameter, or generic Soullab subscription can mint Pro.
- `app/api/sovereign/writers-studio/plan/route.ts`: authenticated, no-store, current-member projection; denial on DB failure. Not an operations gate.
- `app/dev/writers-studio-p4r1/WriterStudioBetaPlanNotice.tsx`: optional badge for verified complimentary Pro only; no claim that held features are live.
- `app/writers-studio/plans/page.tsx`: transparent Free/Pro **future-public** presentation. The canonical route remains authentication-protected pending separately approved public route admission. No purchase buttons or active signup promises.
- R1 unit/HTTP-shape/jsdom regression tests and writer-specific TypeScript check. The design contract contains desktop/mobile screenshots of a temporary local Next preview alias, removed after capture; it is not public-route release proof.

### Small beta means individually approved accounts, not everybody with a tester label

Issue #1800 controls admission. Begin with **two separately verified writer accounts**, then add only other personally approved members of the same restricted group after canary acceptance. Store the actual roster/contacts only in the established restricted invitation record; no names, addresses, tokens, manuscripts or private feedback in code, issues, fixtures or analytics. Confirm each person's existing account through member-controlled login. No bulk grant. Founder approval and account verification remain separate from current `ops_contacts` eligibility.

R1 *reads the existing* `writersStudioBetaAccess` predicate based on active member-linked `ops_contacts` or founder witness. It does **not** improve that predicate's per-writer approval/canary precision, and does not make its broad beta status proof of founder invitation. Before a real Free/Pro pilot grant is honored by operational APIs, bind it to an independently reviewed per-writer founder-approved entitlement source and preserve the existing admission HOLD.

### Essential remaining engineering before commercial launch

1. Canonical source owner reviews this narrow slice against the current qualified Writer P4R1 work; stage/source merge is not permission to deploy.
2. Reconcile R1 with Inspiration Compass / Writer Academy HOLD issue #1904. An inspiration journal must have explicit provenance, opt-in recall, correction and deletion-safe custody before claims of persistent original-spark history.
3. Introduce independently audited *server-side* plan gates for expensive advanced operations; never rely on the display badge or plan JSON. Meter AI usage server-side with no manuscript text in usage analytics. Keep drafting and author-owned essentials outside payment enforcement.
4. Verify production-backed payment receipt and revocation (not generic Soullab tier), then test purchase, cancellation, failed/duplicate webhook, refunds, downgrade with retained author-owned Works, and zero-charge beta status. Billing remains OFF until this is accepted.
5. Verify two fictional member sessions against actual PostgreSQL and authenticated Next.js routes: foreign manuscript IDs and valid/invalid dual credentials, explicit revocation and restore, signed-out behavior, no cross-member material or session response caching.
6. Complete existing first-author ingress and R20 old/new reader, deletion/restore and full backup custody; production immutable image and rollback proofs; Chromium + mobile Safari + VoiceOver; independent Class A review; founder exact-source go/no-go.
7. After beta approval, collect consented product feedback on MAIA usefulness and author agency, AI resource costs, conversion intent, and Academy progression without passive writing-content telemetry.

### R1 test claims (bounded)

The isolated R1 tests validate policy, private route response behavior with mocked authentication, server beta lookup, and beta badge rendering with mocked HTTP. Passing these tests **does not** establish real DB, payment, source vault, mobile UX, production access, or release acceptance.

**Disposition: review-only / HOLD.** No production changes, subscription charges, invitations or public enrollment are authorized by this document.
