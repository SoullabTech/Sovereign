---
tier: 4
authority: derivative
source_type: research
title: "Glenn Perry — AstroPsychology: attributed source-linked wisdom candidate"
author: "Soullab editorial curation (primary referenced author: Glenn Perry, Ph.D.)"
version: "0.2"
date_added: "2026-10-17"
status: review
safe_for_retrieval: false
---

# Glenn Perry — AstroPsychology | candidate for MAIA's Wisdom Field

**State: source-linked editorial candidate only. Not corpus-admitted, licensed full-text retrieval, prompt material, deployed software, or founder-ratified teaching.**

## Stage O — Disposable PostgreSQL sign-in verified; sign-out is a release blocker

**Actual password authentication and founder restriction were verified using the protected route/proxy/session code against a private, Unix-socket-only PostgreSQL 14.19 fixture** with two entirely fictional bcrypt-backed members. This did not use the live Soullab database or real credentials.

- [Stage O real-PostgreSQL witness and sign-out security docket](./STAGE-O_REAL-POSTGRES-FOUNDER-SIGNIN-SIGNOUT-RELEASE-BLOCKER_20261018.md): original wrong/unknown credential denial (401), founder HTTP 200 with durable signed-in session and Secure/HttpOnly cookie, ordinary member denied founder (404), real proxy stripping forged role/tier, four auth audit records.
- **Confirmed release blocker:** `POST /api/members/signout` returns **404** under the protected strict `config/accessMatrix.ts`: `/api/members/signin` has a declared route, `/api/members/signout` has none. **No database session revocation was proven**. Do not claim sign-out success or loosen an entire API prefix.
- **Separate code-review risk:** the original password sign-in route includes a catch that may return `success: true` even when durable session creation fails. Requires bounded failure-injection tests, not a production claim.
- The disposable Next.js auth test app, test PostgreSQL, fictional credentials and synthetic session records were shut down and removed after evidence capture. Existing PostgreSQL listeners on `5432/5433` and the original **Mac Studio-only** Gather Together design preview at `http://127.0.0.1:3817/fixture` remained unchanged.

**Next authorization:** a distinct, independently reviewed **isolated auth-security correction** for exact sign-out access with origin/CSRF discipline and session-creation fail-closed semantics. Then real PostgreSQL sign-out/revocation, HTTPS/Safari and whole-product staging acceptance—**before any genuine founder staging login**. Member rollout, Keeper partnership and source ingestion remain HOLD.

## Stage N — Full protected Next.js 16 build PASS, canonical type gate PASS (release HOLD)

**Next milestone verified without any production access.** At pinned protected commit `6a144edabc686afc9b99828726c214dc7800158f`, with the three exact Gather Together preview modules from research revision `b316e70627d03ca79ed3eebbbafcf9073961f41e`, the Mac Studio completed a **full Next.js 16.3.8 offline production-mode Webpack build**: exit **0**, **823/823** static pages, `/wisdom-keepers/wisdom/gather-preview` compiled, and the normal Next **Proxy (Middleware)** emitted.

- [Stage N offline Prisma/full-build/type-health witness](./STAGE-N_OFFLINE-PRISMA_FULL-NEXT16-BUILD-TYPEHEALTH-WITNESS_20261018.md): checksum-verified local Prisma 5.22.0 engines, isolated generated client, exact-source checks, full build and separate canonical type-health evidence.
- **Prisma blocker resolved offline:** Native artifacts were copied into a disposable dependency farm and the Prisma client was generated using the pinned schema and no network connection. The source schema was not modified; Prisma's generated schema matched a separately formatted copy.
- **Governed `tsconfig.ship.json` no-regression gate PASS:** 222 diagnostics versus 239 baselined; **no new TypeScript regressions** and 765 more files in the programme. Initial fixture runner failed to find `.bin/tsc`, then its local symlink was restored without changing shared dependencies and the gate passed read-only. Baseline unchanged.
- **Do not deploy this test bundle:** Font files are an intentionally offline-only mock, and optional Capacitor Contacts import warnings remain. The broader `tsconfig.core.json` standalone check still reports 516 diagnostics elsewhere (none from the three new Gather files). Full **runtime** acceptance is separate.
- The generated `.next/cache` (~3.8 GB) was removed after the successful build, leaving the compiled route manifest and a private **DO_NOT_DEPLOY** warning in the isolated temporary snapshot. Approximately **40 GiB** free remained; the original `http://127.0.0.1:3817/fixture` Mac Studio preview still works.

**Next decision:** an isolated, disposable **full-product runtime test with fictional PostgreSQL identities** and proper cookie/revocation/host/privacy checks, then a *separate* founder-approved real staging login. No release, outreach, Circle/video admission, licensed source ingestion, or production change has occurred.

## Stage M — Full protected Next.js 16 offline build preflight (HOLD)

A **complete protected source archive** (`6a144edabc686afc9b99828726c214dc7800158f`) was created in a disposable Mac Studio directory and the three research-source Gather Together files were added **without changing the active worktree**. All three existing pre-build validators passed with outbound network denied.

The first full Next16 Webpack build was blocked by Google Font downloads, as expected under network isolation. A **test-only offline font fixture** moved compilation past that boundary: **Webpack compiled with warnings**, but the full application **failed at page-data collection** due to a missing generated Prisma client (`.prisma/client/default`) in the reused isolated dependencies. The optional Capacitor contacts import also produced an unrelated module warning. Prisma's generator attempted to download an engine and was blocked, so no live environment or shared dependency was modified. Full-app TypeScript verification was **not** established.

- [Stage M full-app build custody, failure and next gating](./STAGE-M_FULL-NEXT16-CANONICAL-OFFLINE-BUILD-PREFLIGHT_20261018.md): exact source SHA, network sandbox, offline font fixture, compilation evidence, Prisma blocker and cleanup.
- The disposable `.next` build output (~4.9 GB) was **deleted** to protect the Mac Studio's disk; build logs/source remain only in isolated `/tmp`.
- The running local founder review at `http://127.0.0.1:3817/fixture` remains unchanged. No staging account, Circle, meeting, production or beta was activated.

**Next technical gate:** a properly isolated *offline* generated Prisma client/dependency set, then a fresh disk-budgeted, network-denied full-app compile; real founder login still requires independent authorization and release review.

## Stage L — Current protected Next.js 16 proxy and session-chain integration

**Additional current-version verification; not a production release.** The protected reference now declares **Next.js 16.3.8** with `proxy.ts` instead of the old Next.js 15 middleware entry. An independent, **real Next.js 16 optimized Webpack build and WebKit browser acceptance** ran the exact protected `proxy.ts`, access matrix, identity-stripping module, session validator and founder allowlist alongside the actual staged Gather Together page.

- [Stage L protected-proxy/real-auth-source integration witness](./STAGE-L_NEXT16-FOUNDER-PROXY-FICTIONAL-INTEGRATION-WITNESS_20261018.md): real compiled Next proxy, fictional non-network database, source hash custody, browser sign-in, member/founder separation, expired/revoked/forged refusal, flag-off and native refusal.
- The new Next16 integration app was built in an isolated temporary directory. Its real-account DB was replaced with a **fictional, signed, non-network adapter**. This complements the earlier independently isolated **Next15 + disposable PostgreSQL** acceptance below; neither is a completed full-product Next16 staging build.
- The standalone Next16 integration test listener and two temporary flag-mode probes were **stopped** after passing. Only the existing **Mac Studio-only** founder review at `http://127.0.0.1:3817/fixture` remains available.
- In the current access matrix, `/wisdom-keepers` is broadly public at the outer request layer. The preview's actual server-side `requireFounder()` is the decisive narrower gate; tested denial for real execution with fictional records. Any extra exact-route access-matrix rule requires its own review, not an unannounced privilege edit.

**Next gate:** exact latest-current full Next.js 16 app with a disposable backend and properly reviewed real founder staging sign-in. No production credentials, member data, Circle roles, source admission or keeper access were changed.

## Stage K — Real Soullab session code, exact Next.js 15, isolated PostgreSQL

**Security acceptance achieved for selected real modules, not real founder login or full-app release.** On the Mac Studio, an independently built **Next.js 15.5.11** test app ran the exact original `serverSessions`, PostgreSQL `query`, founder allowlist, Gather Together page and real canonical middleware source, against **two fictional members** in a separate PostgreSQL instance. Live HTTP and actual WebKit proved founder 200, nonfounder 404 even with admin role, forged credential refusal, server-side revocation 404, old-cookie replay refusal and functional mobile interface. **Eight separate static auth-contract regression checks passed** at a pinned source revision.

- [Stage K Next.js 15 / PostgreSQL session witness](./STAGE-K_NEXT15_VERIFIED-SOULLAB-SESSION_FOUNDER-GATE-WITNESS_20261018.md): the exact test provenance, source and build versions, known SWC warning and withheld full-product/real-member gates.
- [Committed Stage K authorization guard tests](./stage-k-auth-postgres-contract.test.mjs): real session cookie and SQL validation, founder-only decision, still-public Wisdom prefix + founder-gated preview child.
- **Temporary session-issuance test service and isolated PostgreSQL were stopped**, and ephemeral database/config passwords were unlinked after verification. The original visual review at **`http://127.0.0.1:3817/fixture`** remains available from the Mac Studio.

**Still HOLD:** the real founder has not logged into a full staging Soullab instance. It requires a separately approved exact-canonical full app build, current middleware/cookie contract and verified member sign-in through Soullab's actual authentication. Do not substitute the fictional issuer, touch real sessions, widen Circle roles or deploy this branch.

## Stage J — The founder is real; the demo identity is not

The founder clarified the actual human role while reviewing the Mac Studio preview. The [Stage J identity/copy correction witness](./STAGE-J_REAL-FOUNDER-REVIEW-LANGUAGE-AND-AUTH_BOUNDARY_20261018.md) distinguishes **real Soullab founder review** from the isolated, temporary test-session credential. The committed preview now reads **"Founder review · Interactive prototype · Not yet open"**. Its five updated WebKit UI checks passed, and the local Next.js preview was rebuilt, tested again under real Safari WebKit, and kept loopback-only.

On the Mac Studio, open **`http://127.0.0.1:3817/fixture`** and choose **Open founder review**. This local button uses demo credentials only; it is **not** proof of the founder's actual Soullab authenticated identity. The existing actual `requireFounder()` server gate remains unchanged. No production login, code merge or member feature was activated.

**Next:** Reconcile and verify the **complete** canonical Next.js 15.5.11 app, including the real login and middleware/cookie path. Selected actual auth/session modules already passed the **isolated Stage K Next.js 15 and PostgreSQL test**; the separate real-founder staging sign-in still requires authorization.

## Stage I — Local founder walkthrough available on the Mac Studio

**Verified running demo, localhost only, not a production deploy.** The exact Stage H component and server founder gate were copied into an isolated Next.js 16.3.8 app with a **fictional signed-cookie session provider** and test-only sign-in buttons. The full standalone build, actual real-HTTP denied/allowed sign-ins, actual WebKit desktop/mobile interaction, server-side feature-flag shutdown case, and loopback-only listening boundary passed.

On the **Mac Studio itself**, open **`http://127.0.0.1:3817/fixture`**, then choose **Open founder review**. No real member login, Circle, media room, or production data are attached. It will not open over LAN/iPhone; restart/cleanup may remove this temporary process.

[Read Stage I local Next/WebKit witness](./STAGE-I_LOCAL-WISDOM-GATHER_FOUNDER-PREVIEW-WITNESS_20261018.md). **Next gate:** founder hands-on UI feedback, then separate exact integrated Next 15.5.11 build and fictional-account acceptance before any beta access.

## Stage H — Gather Together now staged under the real Wisdom route

**Founder-only, default-OFF, unlinked and undeployed.** A new preview route at `/wisdom-keepers/wisdom/gather-preview` illustrates the future member path: find an original keeper → intentionally choose to gather → enter a private, consent-governed Circle → meet in an approved online/hybrid room. The actual `/wisdom-keepers/wisdom` page, Circle access and video providers **are unchanged**. All joining and registration are fictional and unavailable.

- [Stage H placement, security and browser witness](./STAGE-H_GATHER-TOGETHER_WISDOM-PLACEMENT-WITNESS_20261018.md) — **170/170 combined isolated tests PASS**, including 16 Stage H gate/WebKit checks, targeted strict TypeScript, native exclusion and defeated flag/auth bypasses. **Not a complete Next.js build or live meeting test.**
- [Server-gated preview route](../../../../app/wisdom-keepers/wisdom/gather-preview/page.tsx): requires `MAIA_WISDOM_GATHER_PREVIEW_ENABLED=1` on the server **and** verified `requireFounder()`; otherwise 404; excludes native export.
- [Interactive fictional Wisdom Gather component](../../../../components/wisdom/WisdomGatherFounderPreview.tsx) and [static four-stage source](../../../../lib/wisdom/wisdomGatherPreview.ts): no member data, external video, model, recording, licensed text or live join.
- [Actual page gate tests](./stage-h-gather-placement-gates.test.mjs) and [actual component WebKit tests](./stage-h-gather-placement-webkit.test.mjs): repeatable fictional cases.

**Next step:** a separately authorized isolated Mac Studio web preview for founder review. Do not expose the route to members, widen Circle access, enable it in production, or schedule a gathering.

## Platform placement decision — Wisdom is the doorway

[Source-grounded placement audit (2026-10-18)](./PLATFORM-PLACEMENT_WISDOM-KEEPERS-GATHERING_DECISION-CANDIDATE_20261018.md): Put future **Gather Together** discovery inside existing `/wisdom-keepers/wisdom`, let approved invited members gather in consent-scoped `/commons/circles/[circleId]`, keep Studio's Groups/meeting control as human host operations, and reuse the already-built on-platform hybrid service only after **actual multiperson/video and access acceptance**. Master/keeper `/fields/[field]/with-others` is a future specifically approved human home, currently a placeholder. Circle API/UI are founder-only today; there is no authorized beta cohort gate or real event. Historical `/commons/fields` routes are absent from current canonical tree. **Design only; no app, rights, groups, roles or production changes.**

## Gathering direction — Online first, then hybrid (Stage G)

**Founder direction accepted for preparation, not event creation.** Start with a private online Wisdom Circle; extend to human study gatherings and keeper-hosted online experiences only by explicit keeper/member choice. Later, introduce local and remote hybrid meetings, workshops and retreats after proving genuine remote participation parity, sound and privacy.

- [Founder-facing online-first/hybrid brief](./STAGE-G_ONLINE-FIRST_TO-HYBRID_FOUNDER-BRIEF_20261017.md) — the four phases and the next one decision: **identify and test Soullab's existing on-platform hybrid service before external options**.
- [Read-only existing hybrid service reuse audit](./STAGE-G_PLATFORM-HYBRID-REUSE_AUDIT_20261018.md) — confirms built Studio meeting link/consent/LiveKit/WebRTC pieces but **does not claim safe 6–8-person group hosting**. The older native client is one-peer and its early signaling join lacks the newer consent-backed gate; a private multiperson acceptance remains mandatory. External provider is a contingency, not the default.
- [Stage G full service and operations roadmap](./STAGE-G_ONLINE-FIRST_TO-HYBRID_GATHERINGS-CANDIDATE_20261017.md) — repo media-stack distinctions, provider-agnostic pilot, accessibility, remote/local hosting parity, safeguards and independent hybrid release.
- [Delivery contract](./STAGE-G_ONLINE-TO-HYBRID_DELIVERY-CONTRACT_CANDIDATE_20261017.json) — **no meeting/provider/URL, invitation, recording, roster, membership, or event activated**; hybrid venue and technical verification also unset.
- [Stage G source/browser test witness](./STAGE-G_ONLINE-TO-HYBRID_WITNESS_20261017.md) — **153/153 combined isolated checks PASS** at the exact tested source revision, targeted strict preview TypeScript check.
- The [disabled founder preview](../../../../app/maia/perry-lens-preview/page.tsx) now compares Online first / Hybrid later without live media access.

**Source of truth:** No video provider has been selected or proved privacy-compatible. Soullab's individual Session Room WebRTC and LiveKit token substrate do not certify a private multiperson event; the public event registration endpoint is inappropriate for a private Wisdom Circle. Choose/test a provider first, then date and consent, then separate invitations.

## First human pilot — Where Symbols Meet Life (Stage F)

**Founder development approved; no invitation, booking or launch authority.** Prepare a small, founder-hosted educational Circle **before** claiming any living keeper partnership. A 75-minute six-movement format begins with an original Soullab elemental inquiry and lets members speak, remain silent, or reject the symbolism. Glenn Perry is only an unaffiliated, correctly linked public source reference.

- [Start here: one-page founder pilot brief](./STAGE-F_FIRST-GATHERING_FOUNDER-BRIEF_20261017.md) — what people experience and what the founder decides next.
- [Facilitator's full 75-minute guide](./STAGE-F_FIRST-GATHERING_FACILITATOR-KIT_CANDIDATE_20261017.md) — actual host words, Earth/Water/Air/Fire/Weather questions, privacy/safety boundaries and launch checklist.
- [Unsent invitation and participant notice](./STAGE-F_FIRST-GATHERING_INVITATION-AND-CONSENT_CANDIDATE_20261017.md) — no real recipient list, date, venue, fee, recording or approved access yet.
- [Fictional stage-by-stage rehearsal contract](./STAGE-F_FIRST-GATHERING_PILOT-REHEARSAL_CANDIDATE_20261017.json) — ten release checks, all live invitations, enrollment, recording, source ingestion and paid access OFF.
- [Stage F preparation witness](./STAGE-F_FIRST-GATHERING_PREPARATION-WITNESS_20261017.md) — **138/138** source/rights/consent/Next.js handler/WebKit/rehearsal checks passed at pinned source revision; three denial mutants caught. This is an isolated test, **not** a real Circle or website build.
- [Rehearsal cues](../../../../lib/maia/knowledge/wisdomFirstCircleRehearsal.ts) in the **default-OFF founder preview**: six static steps to practice as a facilitator; no timekeeping, data capture or event.

**Next actual human step:** Founder reviews the invitation and chooses a plausible venue/date so we can verify real membership and recording controls. No one may be contacted or enrolled from this research branch.

## Next proposal — Keeper-Hosted Fields (Stage E)

**Not yet approved or operational.** A willing wisdom keeper may eventually have an explicitly bounded human teaching/engagement space hosted within Soullab's already-ratified relational ontology. Approval concerns **the actual keeper's identity, consent, precise activities, member choice, privacy and safety**—not a blanket clinical/spiritual endorsement or access to members' personal histories. Glenn Perry remains an unaffiliated author reference; contact is founder-held.

- [Keeper-Hosted Field service and approval charter](./KEEPER-HOSTED-FIELD_APPROVAL-AND-ENGAGEMENT-CANDIDATE_20261017.md): an invited keeper's home/studio, small circles and inquiry, resource shelf, consented human Q&A, optional collaboration and fairly supported teaching.
- [Machine-readable field permissions and first gathering](./KEEPER-HOSTED-FIELD_APPROVAL-CONTRACT_CANDIDATE_20261017.json): all hosting, roles, member enrolment, recordings, payments and source rights **OFF**; fictional 75-minute adult nonclinical study pilot, no real participants.
- [Stage E approval and WebKit test witness](./STAGE-E-KEEPER-HOSTED-FIELD_WITNESS_20261017.md): **126/126** combined checks in a disposable fixture, including reversible **member/keeper** prototype views and two defeated false-authority mutations.
- [Stage E contract tests](./stage-e-keeper-hosted-field.test.mjs) plus [founder-preview WebKit suite](./stage-c-founder-preview-webkit.test.mjs): no automatic Circle facilitator promotion, MAIA imitation, private field reads, outreach or invented keeper consent.

**Six existing fields stay authoritative:** this is a hosting mode, **not a seventh field type**; Keeper ≠ facilitator authority; member/keeper/organization approval are separate. Full clinical, copyright, Sanctuary and release boundaries remain closed.

## Current founder service direction — Wisdom Keepers Commons

**Proposed, not adopted or deployed.** Soullab could become a place where people encounter not only the *ideas* of wisdom keepers, but the people and communities that steward them. The relationship is communal and reciprocal rather than a marketplace, content-extraction economy, or unauthorized contact directory. Any personal encounter needs mutual consent and ethical compensation, not a built-in pay-to-access hierarchy.

- [Wisdom Keepers Commons service charter](./WISDOM-KEEPERS-COMMONS_SERVICE-CHARTER_CANDIDATE_20261017.md) — the proposed communal promise, five ways to participate, existing FR-02 Interest Commons governance, free choice/keeper standing, transparent compensation and a Glenn Perry pilot.
- [Machine-readable pilot and consent contract](./WISDOM-KEEPERS-COMMONS_PILOT-CONTRACT_CANDIDATE_20261017.json) — all live service, interest, invitation, fund and third-party source rights **OFF**.
- [Stage D isolated witness](./STAGE-D-WISDOM-KEEPERS-COMMONS_SERVICE-WITNESS_20261017.md) — **109/109** combined review/contract/WebKit checks at pinned candidate revision, plus targeted TypeScript review. There has been no real community service build or keeper outreach.
- [Communal service contract tests](./stage-d-community-service-contract.test.mjs) — provenance, right-to-decline, FR-06 declared-only interests, FR-07/08 membrane safeguards, no monetized ranking.
- The founder-only, default-OFF [Perry preview](../../../../app/maia/perry-lens-preview/page.tsx) now contains a **fictional four-movement community journey**, not a signup form, active Circle, live chat or Perry partnership.

**Naming distinction:** “Wisdom Keepers Commons” is *working service language within* the ratified FR-02 Interest Commons, **not** a separate new Commons or reuse of the status-oriented legacy community/contributions tables. Its proposed public-facing name is subject to founder decision.

## Current workstream — original Soullab editorial teaching

- [Original Soullab teaching candidate](./soullab-original-teaching-candidate.md): seven movements of inquiry, three fictional encounters; **pending founder approval, not active knowledge**.
- [Claim-level provenance](./claims.json): separates seven Glenn Perry assertions from eight Soullab editorial choices. Explicitly distinguishes Perry's life-script/fate language from the member-centered Soullab adaptation.
- [Stage A readiness and test witness](./STAGE-A-READINESS-20261017.md): 9/9 static integrity tests and 5/5 tests against actual admission/global Library code, all in disposable local fixtures. These do not authorize admission or live runtime use.
- [Stage B source-path and trust-boundary design](./STAGE-B-ISOLATED-INTEGRATION-DESIGN-20261017.md): original read-only assessment of current MAIA route and knowledge-field limits.
- [Stage B code integration witness](./STAGE-B-CODE-INTEGRATION-WITNESS-20261017.md): default-off code connected to the actual serving route, 49/49 isolated tests; **not admitted, deployed, or live**.
- [Stage B genuine Next.js 15 handler witness](./STAGE-B-NEXT15-REQUEST-WITNESS-20261017.md): earlier exact-route verification at 56/56 tests; no model calls or live source admission.
- [Stage B Perry-only Sanctuary correction witness](./STAGE-B-PRIVACY-POSTURE-WITNESS-20261017.md): updated **59/59 PASS**; missing, malformed, or contradictory current-turn privacy declarations now refuse Perry source lookup before access. The general serving-route Sanctuary boundary remains separately open.
- [Stage B client-current-posture witness](./STAGE-B-CLIENT-CARRIAGE-WITNESS-20261017.md): **71/71 final combined isolated tests PASS**, targeted strict TypeScript check, and a deliberately defeated live-setting bypass (7/12 hostile failures). The client helper is **unwired**; no MAIA UI change or source activation.
- [Stage C founder choice preview witness](./STAGE-C-FOUNDER-CHOICE-WITNESS-20261017.md): **88/88 combined tests passed**; new default-off server-gated `/maia/perry-lens-preview` review page, real founder allowlist tests, actual WebKit desktop/mobile acceptance, native export exclusion, and defeated founder/flag bypasses. The page is **not mounted in the ordinary MAIA UI, merged, or deployed**.
- [Stage C wisdom-keeper website and works witness](./STAGE-C-WISDOM-KEEPER-LINKOUT-WITNESS-20261017.md): official Glenn Perry and Academy destinations, six author-directed links, reviewed commentary and **96/96 combined isolated tests passed**. The preview and corpus remain disabled.
- [Proposed wisdom-keeper reciprocity standard](./WISDOM-KEEPER-RECIPROCITY-CANDIDATE-20261017.md): credit writers, link to original works, avoid implying endorsement or source-text rights. **Editorial candidate, not ratified canon.**
- [Direct outbound-link tests](./stage-c-wisdom-keeper-links.test.mjs): official HTTPS destinations, exact source registry, same two authored books, no implicit rights grant.
- [Stage C founder gate tests](./stage-c-founder-preview-gates.test.mjs) and [Stage C WebKit interaction tests](./stage-c-founder-preview-webkit.test.mjs): repeatable fictional tests; no source text or real member data.
- [Next.js 15 request harness](./stage-b-next15-serving-route.test.mjs): seven fictional tests of authenticated/guest, Sanctuary, opt-out, opt-in, feature flag, and forged client prompt metadata.
- [Stage B fictional HTTP source-lens tests](./stage-b-active-route-fixture.test.mjs) and [physical corpus authorization tests](./stage-b-physical-corpus.test.mjs): session spoofing, Sanctuary, opt-out, chart-facts restraint, exact source, checksum and founder record.
- [Stage B fictional MAIA knowledge-field rehearsal](./knowledge-field-integration-rehearsal.test.mjs): imports the current knowledge registry and prompt builder in isolation; 12/12 passed, including explicit member choice, refusal, Sanctuary exclusion, and unpublished-source gates.
- [Actual admission preflight tests](./governed-admission-preflight.test.mjs): fail-closed when authority, rights, source hash, or per-file admission are absent.

**Founder direction (2026-10-17):** founder will contact Glenn Perry personally. Do not send the previously prepared permission draft. No third-party book or essay text is licensed for AI retrieval under this record.

## Purpose and intellectual standing

Kelly has identified Glenn Perry's two books as important to Soullab's inquiry into consciousness, symbolic interpretation, and depth psychology. This document gives them a *named, accountable place in research review* without claiming MAIA has read or ingested the books. Book-level descriptions are based on the author's public catalog; the book text was not supplied or processed.

**Works:** Glenn Perry, *An Introduction to AstroPsychology: A Synthesis of Modern Astrology & Depth Psychology* and *Depth Analysis of the Natal Chart: Advanced Therapeutic Astrology*. Author catalog: https://aaperry.com/astrology-books/ . Source-level bibliographic URLs and original essay links are in `sources.json`.

**Scope:** Jungian/depth psychology, astrological symbolic frameworks, motivation, emotional experience, defenses, integration, personal mythology, development, agency, and whole-chart synthesis. Perry is an **attributed external interpretive lineage**, not the origin of Soullab canon, a clinical standard, or authority over a member's own experience.

## Eight usable scholarly distinctions — original Soullab curation

1. **Need and action are not identical.** In Perry's model, zodiacal signs represent motivational needs and planets the psychological functions engaged in pursuing them. Houses symbolize contexts, and aspects relationships among functions. These are symbolic associations, not empirical personality measurements. See Perry, *Intrinsic Motivation and Astrological Signs* and *The Significance of Planetary Emotions*.
2. **Emotion may invite an inquiry into need.** Perry's account links symbolic planetary/emotional patterns to motivation. MAIA should ask about lived feeling before proposing any chart-based analogy. See *The Significance of Planetary Emotions*.
3. **A horoscope is not a sentence.** A chart can be contemplated as an evolving narrative with competing aims and changing possibilities; it cannot establish a person's fate. See *The Horoscope as Evolving Story*.
4. **Integration and individuation have different scopes.** In Perry's use, integration may concern a particular psychological configuration; individuation concerns the whole person. Both are conceptual lenses, not diagnoses of someone's development. See *The Concept of Integration*.
5. **Protection precedes premature pathology.** When a member identifies a protective habit, explore its possible earlier usefulness without presuming a particular trauma, cause, or family history. See *The Wisdom of Defenses*.
6. **Archetypes are multivalent.** The same symbolic configuration can be interpreted in more than one way; its meaning cannot be identified without meeting the person. See *The Protean Nature of Astrological Archetypes*.
7. **Development is a possibility, not a forced stage label.** Perry's symbolic developmental interpretations may be compared with psychological developmental theories, but do not demonstrate that zodiac signs predict actual developmental stages. See *Zodiac Signs As Developmental Stages*.
8. **Psychological interpretation must remain revisable.** Even if a symbolic frame is meaningful, member testimony, exceptions, and disconfirming experience take precedence. See *AstroPsychology as Personality Theory & Diagnostic Tool* (note: its stronger diagnostic/prognostic claims are **not** clinically validated).

## MAIA's bounded encounter pattern (future candidate, not active)

Preserve the existing six-part astrology reading frame:

1. **Calculated facts:** only placements, aspects and transits calculated from available birth/time data with identifiable provenance.
2. **Named symbolic tradition:** explicitly say when a psychological-astrology lens comes from Perry.
3. **Whole-chart synthesis:** avoid isolated sign/aspect verdicts; offer relationships across the chart as conditional possibilities.
4. **Possible human expression:** give more than one non-pathologizing expression and do not assert specific childhood events, diagnoses, trauma, abuse, psychodynamics or fate.
5. **Present activation:** distinguish real computed transit dates from symbolic reflection; no unsupported forecasts.
6. **Member-authored meaning:** invite the person to accept, reject, qualify or create their own interpretation. The member's experience is not an inferior data point to a symbol.

**Example of acceptable voice (fictional, no chart data):**
> Glenn Perry's approach offers one symbolic question: are two important needs asking for expression at once? I would not know from a chart whether this describes your experience. Is there a tension you actually recognize, or does another story fit better?

**Not acceptable:** "Your Saturn placement proves childhood abandonment"; "Perry's research clinically establishes your trauma"; "A coming transit will cause a divorce"; "This source has already been learned by MAIA."

## Relationship to Elemental Alchemy and Jung

Compare, do not collapse: integration and individuation; archetypal ambiguity and symbolic meaning; defenses and psychological protection; motivation and conscious choice. These themes may be examined alongside Jungian reflection, Soullab's Elemental Alchemy, and Spiralogic **as distinct traditions**. Do not generate a deterministic zodiac-to-Fire/Water/Earth/Air/Weather mapping or use a correspondence to manufacture personal Recognition. Perry's writings do not become a substitute for the founder's original work.

## Rights and custody

- This file is **original commentary and indexing metadata**, not copied Perry source text. No primary book or essay body has been stored here.
- Kelly reports owning copies of both books; ownership of copies does not itself grant permission to embed, reproduce, index, train on, or redistribute the copyrighted books in MAIA.
- Source metadata may support scholarly discovery and human review; it does **not** license full-text RAG.
- `sources.json` explicitly records per-source access and rights gates; absence of an affirmative right means **no text ingestion**.
- No member conversations, clinical records, or Sanctuary materials may enter this author reference file.
- Governance to preserve: `docs/canon/MAIA_SOUL_CORPUS.md`, `docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md`, `docs/canon/MAIA_KNOWLEDGE_FIELD_12_DOMAIN_MAP.md`, `data/ain/corpus-admission.json` and `docs/programme/MAIA-WISDOM_PROGRAMME_STATE_2026-09-15.md`.
- Do not place these files under `data/ain/source` or `/data/oracle-corpus` while review and authorization are unresolved. Location does not confer admission.
- This branch carries **no changes to application routes, retrieval, embedding jobs, prompts, database, admission rules, production or protected branches**.

## Readiness gates before MAIA can actually use material

1. Confirm physical-book editions and chapter contents with Kelly; no claim of full book analysis before that happens.
2. Curator verifies every attributed interpretation against the exact author essay or page; preserve sources, objections, and citation trail.
3. Determine specific rights basis for each proposed use (citation/catalog, original Soullab commentary, licensed copyrighted excerpt/full text). For book/essay text storage or embedding, obtain explicit rights-holder permission suitable for this use, subject to review.
4. Apply existing corpus-authority admission contract with evidence and a specific source hash, not blanket folder inheritance or implicit founder assent.
5. Review epistemic/clinical constraints, member-choice and Sanctuary boundaries.
6. Run isolated tests of provenance, access gating, disconfirming interpretations, non-diagnosis, no fabricated chart facts, and negative rights cases.
7. Seek explicit founder approval for admission and separately evidence runtime activation. A Git branch is not a live capability.

## Current review outcome

**Prepared for founder, scholarship, and rights review. Not retrieval-safe.** The next useful human inputs are tables of contents for the two owned editions and approval of a limited license request to Glenn Perry, if desired.
