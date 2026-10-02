# KELLY'S WORLD — SAFETY-DELIVERY-01 Propagation

**Date:** 2026-10-01
**Purpose:** carry the current SAFETY-DELIVERY-01 state into Kelly's World as founder-facing orientation without copying member material, creating a second safety system, or changing programme authority.

## Governing law

Kelly's World is an operational projection of canonical work, not a competing source of truth.

A safety finding may appear here as orientation only:

- visibility does not create urgency;
- urgency does not create disclosure authority;
- recognition does not create notification authority;
- a programme record does not become implementation merely because it is visible here.

No member utterance, crisis transcript, risk score, or personal safety state is copied into Kelly's World.

## Source state

The current SAFETY-DELIVERY-01 / SAFETY-DISCLOSURE-01 lineage is represented by nine custody surfaces:

- PR #1663 — **MERGED / CANONICAL** at `edf656496`: S1 reachability correction;
- PR #1664 — **MERGED / CANONICAL** at `aa3bc543b`: canonical live crisis-path census;
- PR #1633 / `SAFETY-CRISIS-01` — **MERGED / CANONICAL**, but **governance disposition still open**: server-side `crisisAssessment`, short-lived `crisisCheckIn`, clear/ambiguous tiers, and deterministic crisis referral on clear; #1724 records that this self-authored Class-A admission also had zero reviews, and production `12b461bd8` does not contain its crisis-assessment file or live seam;
- PR #1671 — **MERGED / CANONICAL** at `15a9175fb`, but **governance disposition still open**: separate human-safety delivery membrane with content-free SMS/Slack fallback; #1709 records that this self-authored Class-A admission had zero reviews under the standing distinct-human custody law; production `12b461bd8` does not contain the #1671 merge;
- PR #1665 — **CLOSED / SUPERSEDED**: older `crisisRecognition.ts` contract retained as provenance only; superseded by canonical SAFETY-CRISIS-01;
- PR #1669 — **CLOSED / SUPERSEDED**: older hard-override `/list` wiring retained as provenance only; superseded by canonical SAFETY-CRISIS-01;
- PR #1675 — SAFETY-DISCLOSURE-01 authority contract for future member-initiated disclosure/off-ramp acts; canonical #1671 delivery authority is preserved separately; new imminent/legal/minor-vulnerable-adult exception classes remain review-required inside the off-ramp resolver;
- PR #1678 — practitioner-field relationship boundary: a member's practitioner-sharing gesture is readable only by the practitioner in that member's active/paused relationship, not by practitioner role globally;
- PR #1694 — portal-message identity boundary: portal messaging now carries practitioner practice-record identity and practitioner member identity separately so relationship checks, messaging tables, PHI ownership, and safety notification use the correct identity.

These are custody surfaces with mixed standing. Kelly's World must distinguish canonical merges from open review branches and must never present an open PR as canonical merely because it is visible.

## Needs Kelly

### Canonical Class-A custody

The standing canonical law requires a **genuinely distinct second human custodian** for self-authored Class-A admission. #1671 and #1633 entered canonical with zero reviews before that law was mechanically enforced; #1709 and #1724 preserve those admission exceptions.

PR #1716 is the immediate mechanical repair: it makes the already-required authoritative-adjudication check fail closed when a governed custodian record or exact-head custodian approval is absent. It does **not** choose the human.

**Needs Kelly:** constitute the second human custodian under the existing canon. The governed record must bind the human identity, GitHub login + immutable user id, custody role, explicit distinctness from Founder, authority scope, effective date / Founder act, and revocation path. A second credential controlled by Kelly does not satisfy the law.

Until that act exists, new Class-A PRs such as #1713 should remain red by design.

### Production delivery authority

Current production witness on 2026-10-02:

- running SHA: `12b461bd8`;
- #1671 and #1633 safety changes are **not** present in the running production artifact;
- Resend key is present but invalid: `HTTP 400 · validation_error · API key is invalid`;
- Twilio account/auth/from credentials are present;
- `SAFETY_ALERT_PHONE` is absent;
- safety Slack and legacy Slack webhooks are absent.

**Needs Kelly:**
1. rotate the invalid Resend credential as a credential-only act, preserving the running artifact while the process rereads env;
2. explicitly designate the human safety recipient via `SAFETY_ALERT_PHONE` or governed safety Slack webhook;
3. do not infer the recipient from a practitioner/member phone, ordinary monitor destination, historical contact, or convenience.

PR #1718 holds the lawful production-cut order. Canonical presence alone is not treated as deployment authority while #1671/#1633 post-facto governance disposition remains open.

### New disclosure authority beyond the canonical membranes

Canonical #1671 already owns a separate human-safety delivery membrane for specifically governed safety paths. SAFETY-DISCLOSURE-01 does not revoke or reinterpret that authority.

For the **future member-controlled off-ramp** governed by PR #1675, a present explicit member act is required before the resolver can return `may_cross`. Crisis severity, model judgment, or practitioner relationship does not manufacture a new off-ramp grant.

**Needs Kelly only on the narrower question:** should Soullab create any **new** disclosure exception or handoff authority beyond the canonical membranes already in force?

Candidate new exception classes remain:

- imminent danger;
- legal compulsion;
- minors or vulnerable adults.

PR #1675 represents each as `review_required` with `mayCross: false` inside the member-initiated resolver. It does not define thresholds, recipients, jurisdiction, retention, or operational duty.

Current standing: **canonical #1671 remains authoritative for its own delivery membrane; new member-controlled disclosure requires member act; no additional automatic exception has been authorized by #1675.**

### PHI stage for the future safety-contact off-ramp

R7 on PR #1675 leaves a separate founder choice open before any `Message my practitioner` implementation:

- **A — permit bounded Stage A use:** allow this member-authored, member-sent safety-contact use to enter the current sanctioned `client_messages` dual-write substrate, subject to every R2–R6 boundary and the #1694 identity prerequisite; or
- **B — wait for Phase 2B:** keep the off-ramp implementation-blocked until encrypted-only `client_messages` handling is structurally active and witnessed.

Neither option changes the member-act disclosure law, authorizes automatic disclosure, or opens implementation by itself. The founder choice removes or preserves only the PHI-stage hold.

R8 now makes the cost of Option B concrete: `client_messages` is still Stage A/plaintext-first; the prefer-encrypted accessor has no live caller found; several live portal/practitioner surfaces still read plaintext `body` directly; no canonical backfill-completion witness was found; and encrypted-only DB constraints are not active. Waiting for Phase 2B therefore means a substantive backfill + read-path + write-path + constraint + soak programme, not a flag flip.

## In motion

### Governance remediation and delivery completion

The safety programme now has five bounded successor lanes:

- **#1709** — records the #1671 Class-A admission exception;
- **#1724** — records the #1633 Class-A admission exception;
- **#1716** — mechanically fail-closes self-authored Class-A admission when governed distinct-human custody evidence is absent;
- **#1714** — reconciles the non-delivery register to post-#1671 standing without pretending merge equals human delivery;
- **#1718** — defines the production-cut order from the actual running projection rather than canonical fast-forward.

PR **#1713** is the remaining Class-A S4 repair. Its technical candidate now routes both reachable circuit-breaker integration families—Phase II and Phase III—to the shared content-free human safety service while keeping `humanNotified=false` until affirmative delivery confirmation. It is intentionally governance-held until #1716 is active and a valid distinct-human custodian exists.

**Current law of motion:** evidence may merge as Class C, enforcement may merge as its governed structural act, but unresolved Class-A safety code does not gain admission or deployment authority from technical readiness alone.

### Canonical member-facing safety floor

The member-facing crisis floor is now present in canonical source under #1633 / SAFETY-CRISIS-01 rather than the retired #1665/#1669 stack. **Canonical source standing is not the same as settled Class-A custody or production deployment:** #1724 records the admission exception, and running production `12b461bd8` does not contain the crisis-assessment implementation.

Current canonical-source invariant:

member utterance
→ durable acceptance when lawful
→ server-side `assessCrisisWithCheckIn`
→ `clear | ambiguous | none`
→ CLEAR: deterministic 988 / Crisis Text Line / emergency referral + safety context for MAIA
→ AMBIGUOUS: safety context for MAIA, with a direct safety check-in rather than a hotline script
→ if MAIA actually asks about safety, a short-lived in-memory check-in flag may let a later affirmative answer such as “yes” escalate to CLEAR
→ crisis classification itself does not determine or assert human-delivery outcome; any human delivery belongs to the separate canonical #1671 membrane

The canonical crisis copy says MAIA is not an emergency service and must not be relied on to contact help for the member.

The check-in state is process-local, content-free, short-lived, and non-persistent. Restart or instance movement can drop it; that limitation remains visible.

### Current review order

1. #1663 / #1664 evidence is canonical;
2. #1665 / #1669 remain closed as superseded provenance;
3. canonical SAFETY-CRISIS-01 remains the active crisis-response authority;
4. admit the disclosure-authority law (#1675) independently of crisis severity;
5. admit the practitioner-field relationship repair (#1678) before treating Now What practitioner visibility as correctly recipient-bounded;
6. admit the portal practitioner identity repair (#1694) before any future MAIA handoff may reuse portal-message service semantics.

Dependency order matters. A later member-contact feature must not revive the retired crisis stack, infer disclosure authority from crisis severity, or bypass the privacy/identity prerequisites.

### Member-act disclosure substrates

Three existing acts now have distinct standing:

- **Send a message** — actual member-authored communication, with optional member-selected `safety_concern` urgency and practitioner notification;
- **Share this thread with my practitioner** — direct, revocable field visibility. PR #1678 narrows the recipient to the member's actual practitioner relationship;
- **Bring this into my work** — isolated encrypted snapshot architecture in `bringForward()`, currently with no live caller.

These are not interchangeable. Safety recognition must not silently choose among them for the member.

### Member-controlled safety off-ramp — candidate only

R2 on PR #1675 defines the lowest-authority future off-ramp: MAIA may eventually offer `Message my practitioner`, but the action would open a member-controlled composer rather than send anything. The member would still choose the recipient when needed, author/review the content, select urgency, and press Send. A separate optional act could copy only the member's current utterance into the draft; hidden context and MAIA interpretation remain excluded.

R3 corrects one implementation assumption: the existing portal POST cannot simply be reused from canonical MAIA because portal authority is token-bound, while the canonical MAIA turn uses the ordinary member session. The generic comms POST is practitioner-side, and `sendClientMessage()` is only a service seam once relationship ids are already lawfully resolved. A new authenticated member handoff seam would therefore be required.

R3 also clarifies the PHI standing: the current message service's plaintext + encrypted body writes are the repository's sanctioned Stage A dual-write pattern, while Phase 2B encrypted-only enforcement is not structurally active for `client_messages` yet. Before code wiring, stewardship must explicitly choose whether this bounded safety-contact use may enter Stage A or must wait for Phase 2B.

R3 additionally discovered a prerequisite identity defect in the existing portal message path. PR #1694 separates the practitioner's practice-record id from the practitioner's member id. Until that repair (or an equivalent superseding repair) is admitted, the future MAIA handoff must not reuse the portal message service.

R4 freezes the recipient-discovery contract without implementing it: the ordinary authenticated member session is the only root authority; eligible practitioner relationships must be server-derived; effective messaging policy must allow client messages; zero candidates means no off-ramp, one may be named truthfully, and more than one requires member choice rather than inference.

R5 freezes the notification-result vocabulary. Message persistence, safety logging, provider acceptance, practitioner read, and explicit safety acknowledgment are separate states. Provider acceptance is never treated as human receipt; practitioner read is the first human-receipt witness, and explicit acknowledgment is stronger.

The dormant portal confirmation component currently contains stronger language (`Your practitioner has been notified`, `Your message has been delivered`) than the evidence model permits. No live mount was found, so this is dormant copy debt rather than a proven live member-facing misstatement. It must be corrected before that surface is mounted.

R6 freezes the copy law for those states: `message_persisted` may only claim the message was saved; `provider_accepted` may only claim provider acceptance; `practitioner_read` may claim the practitioner opened the message; and only `safety_acknowledged` may claim explicit acknowledgment. Failure or uncertainty in notification never suppresses immediate crisis-resource guidance.

**Standing: design/contract + pure result projector only. No UI wiring, member-send route, portal-token borrowing, recipient inference, notification transport change, or new disclosure authority is authorized by R2–R6.**

## Watching

### Sharing semantics

Watch for future work collapsing message urgency, field visibility, and snapshot offerings into one generic `share` operation. Each carries a different human intention, persistence model, and recipient expectation.

### False-positive pressure

The older voice crisis detector has known broad stopgap phrases. The server recognizer deliberately does not inherit examples such as:

- "this is goodbye";
- "I wrote letters";
- "I've just taken my medication";
- ordinary discussion of suicide prevention;
- third-person reports.

Watch for pressure to widen detection without corresponding falsifiers.

### Multi-turn safety posture

The current minimal live design is deliberately self-contained per hard-override turn.

No hidden persistent crisis mode is added because:

- process-local Maps are not reliable across server instances/restarts;
- database-backed risk state would persist sensitive mental-health information and change the privacy contract.

If a multi-turn safety posture is later desired, it requires its own privacy/retention design rather than being smuggled into session metadata.

### Non-delivery register

S1 remains an architecture finding with live reachability not established for the old prototype pipeline.

S2–S4 remain separate findings.

The new canonical live safety contract does not automatically close those rows because it is not the same mechanism.

## Kelly's World projection

This record belongs in the Living Field Library because it gives Kelly one place to recover the current safety boundary without reconstructing it from multiple PRs or chats.

Its orientation should read:

- **Needs Kelly:** constitute the genuinely distinct Class-A human custodian; rotate the invalid Resend credential; explicitly designate the human safety recipient; separately decide any new disclosure exception or PHI-stage off-ramp authority.
- **In motion:** #1716 custody enforcement; #1709/#1724 admission-exception evidence; #1714 register reconciliation; #1713 S4 technical candidate under Class-A hold; #1718 governed production-cut readiness; disclosure/relationship/identity prerequisites.
- **Watching:** production-vs-canonical drift, human-receipt evidence, S1/S2 reachability, false positives, multi-turn privacy, sharing-semantics collapse, and remaining non-delivery/infra seams.

Nothing here authorizes execution, merge, deployment, or disclosure.

## Release discipline

When the relevant PRs merge or are superseded, regenerate the Field Library from the resulting programme corpus.

If the programme state changes, update this record or supersede it; do not let Kelly's World preserve an obsolete open-state as if it were current.

## Standing

**PROPAGATED AS ORIENTATION · no member data copied · no new safety authority · no new execution mechanism.**
