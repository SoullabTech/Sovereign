# Mail Abuse Incident — Triage 2026-09-07

Founder report: ~$200 of unauthorised Resend sends consumed without detection.

**This note is triage, not a closed finding.** No production evidence has been
read. Everything below is code-shape reasoning; §4 names the queries that would
turn it into evidence.

## 1. The load-bearing conclusion

**Self-hosting the transport does not fix this, and doing it first makes it worse.**

The bill was the *detector*, not the *defect*. If the vector is an open send
endpoint (§2), moving to our own MTA removes the bill and keeps the abuse — the
theft becomes free and therefore silent. The cost lands instead on domain and IP
reputation, which is where P0 identity mail lives. Trading a $200 invoice for
`soullab.life` being unable to deliver sign-in codes is a sovereignty loss, not a
sovereignty gain.

Order is: **contain → meter → then choose transport.**

## 2. Candidate vectors (code-shape, unconfirmed)

Key leakage was checked and found clean: no `re_` secret in tracked env files or
in git history for env paths, no `NEXT_PUBLIC_*` exposure of `RESEND_API_KEY`.

Two unauthenticated routes call `sendEmail` with no rate limit and no captcha.
Compare `app/api/members/email-code/route.ts` and `magic-link/route.ts`, which
both gate on `checkRateLimit(clientIP, 'ip', ENDPOINT)`.

### V1 — `app/api/members/send-verification/route.ts` (most serious)

Accepts `{ memberId, email }`. Unauthenticated. It writes the caller-supplied
address onto the member row and then sends to it:

- arbitrary destination — the `to` is attacker-chosen, which is what makes
  volume theft *useful* rather than merely annoying
- account takeover primitive — it rewrites `members.email` for a supplied
  `memberId` with no proof of ownership
- lands in P0 by family fallback (`auth:email-verification` is unregistered in
  `EMAIL_PURPOSE_LANES`; the registered name is `auth:verification`), so it
  would be the *last* traffic shed by any future lane guard

`memberId` is a UUID and not guessable, but an attacker needs only one — their
own registration supplies it. That is a working open relay.

### V2 — `app/api/members/recover/route.ts`

Unauthenticated, unmetered, `{ email }` → send. Destination is constrained to
addresses already in `members`, so it is a mail-bomb against known members rather
than a general relay. Separately: it emails the **plaintext passkey**, so
uncapped invocation is also a credential-exposure amplifier.

## 3. Why nobody noticed

`sendEmail` classifies failures well (MAIL-01) and records attempts (MAIL-02),
but it **meters nothing**. `lib/email/purpose.ts` names `lib/email/guards.ts` as
the home for lane guards; that file does not exist. Volume guards today are
per-caller constants (`MAX_MENTION_FANOUT`, `MAX_INVITES_PER_BATCH`) in a handful
of senders, not a property of the transport. No budget, no anomaly alert, no
per-lane ceiling. The first signal available was the invoice.

Note the ledger's own rule is not in tension with this: the ledger *observes* and
must never authorize. A guard is a separate mechanism above the ledger, reading
its own counters — it must not become a ledger read in the send path.

## 4. Turning this into evidence

Requires production DB access; not run from this session.

```sql
-- Volume by purpose/lane over the incident window
SELECT date_trunc('day', created_at) d, purpose, lane, state, count(*)
  FROM email_delivery_attempts
 WHERE created_at > NOW() - INTERVAL '45 days'
 GROUP BY 1,2,3,4 ORDER BY 5 DESC LIMIT 50;

-- Fan-out to non-member destinations (the V1 signature)
SELECT recipient_domain, count(*)
  FROM email_delivery_attempts
 WHERE purpose LIKE 'auth:%' AND member_ref IS NULL
 GROUP BY 1 ORDER BY 2 DESC LIMIT 30;

-- Repeats (idempotency_key is recorded but never suppressed)
SELECT idempotency_key, count(*) c FROM email_delivery_attempts
 WHERE idempotency_key IS NOT NULL GROUP BY 1 HAVING count(*) > 5
 ORDER BY c DESC LIMIT 30;
```

Caveat: the ledger landed 2026-08-25 and prunes recipient-level rows at 90 days.
Abuse before that date survives only in `email_delivery_monthly` aggregates, and
Resend's own dashboard may be the only record of the earliest traffic.

## 5. What "in-house" can and cannot mean

The policy layer is **already sovereign** and is the genuinely hard part:
purpose/lane vocabulary, honest failure classification, the provider boundary,
the delivery ledger, the no-vendor-import CI guard. Vendors are already reduced
to `EmailProvider` — 63 lines of interface.

What Resend actually supplies is **IP reputation and deliverability
relationships**. That is a physical and social asset accumulated over time, not
software. It cannot be written; it can only be built or rented.

Self-hosting an MTA on minisforum is not viable for P0: consumer ISPs block
outbound :25, and a residential IP delivering auth mail to Gmail/Outlook lands in
spam or nowhere. Sign-in would break.

The architecture our own lane model already implies is a **split by lane**:

| Lane | Traffic | Transport posture |
|------|---------|-------------------|
| P0 identity | sign-in, recovery | highest-reputation path, tiny volume, isolated credential |
| P1 access | invitations | same or adjacent |
| P2/P3 bulk | notifications, broadcast | own MTA — where reputation damage is survivable |

This is the sovereignty win that is actually available: own the policy layer and
the MTA, rent only the last mile for P0, and make sure a compromised bulk lane
can never consume identity capacity. `EMAIL_PURPOSE_LANES` was built for exactly
this and is currently unused by any enforcement.

## 6. Roadmap (founder ruling, 2026-09-07)

The subsystem is named **Soullab Mail**. Six layers, and **transport comes last**:

| Layer | Function | State |
|-------|----------|-------|
| 1 Admission | is this caller allowed to cause this email? | MAIL-04 |
| 2 Guard | IP/member/address/purpose limits, anomaly detection | MAIL-05 |
| 3 Scheduler | independent P0/P1/P2/P3 queues | MAIL-06 |
| 4 Ledger | requested / accepted / refused / bounced | built (MAIL-02) |
| 5 Transport | Resend now, Soullab SMTP later | MAIL-09/10 |
| 6 Reputation | DKIM/SPF/DMARC, bounces, complaints | MAIL-09 |

```
MAIL-03  CONTAINMENT       close arbitrary-destination verification;
                           protect recovery; rotate provider credentials
MAIL-04  ADMISSION         every email-causing route has an authority rule
MAIL-05  GUARDS            guards.ts — per IP/member/recipient/purpose/lane,
                           global anomaly ceiling
MAIL-06  QUEUES            physical P0-P3 separation, P0 reserve
MAIL-07  ABUSE INTELLIGENCE baselines, anomaly events, alerting, breakers
MAIL-08  SUPPRESSION       bounces, complaints, lane-aware idempotency
MAIL-09A POSTAL LABORATORY self-host Postal, dedicated clean IP,
                           PostalProvider adapter, DNS + DKIM/SPF/DMARC
MAIL-09B P3 MIGRATION      broadcast / newsletter
MAIL-09C P2 MIGRATION      notifications / transactional
MAIL-09D P1 MIGRATION      invitations / access
MAIL-09E P0 QUALIFICATION  auth delivery measured against Gmail/Apple/Outlook
MAIL-10  RESEND REMOVAL    keys destroyed, ResendProvider removed
```

The lane order is the point: new infrastructure proves itself on expendable
mail before member authentication is entrusted to it.

### Transport decision (founder, 2026-09-07)

Keep Soullab Mail as the control plane. Adopt **Postal** as the delivery engine.

There is no self-hostable Resend distribution — Resend open-sources SDKs and
tooling, not the delivery platform. Of the Resend-shaped alternatives, Plunk and
Unsend still require AWS SES underneath, so they replace the interface without
removing the external dependency; Selfsend is explicitly incomplete. Postal is an
actual MTA (SMTP, IP pools, DKIM, SPF, return paths, suppression, retries,
delivery telemetry), actively maintained, and forkable.

Adopting a Resend clone would duplicate the control plane we already own.
Postal supplies layers 5-6 and nothing above them, which is exactly the seam
`EmailProvider` was drawn at: `PostalProvider.ts` plus one line in
`providers/index.ts`, and `EMAIL_PROVIDER=postal`. The rest of MAIA is unaffected.

Reputation is the hard part and cannot be downloaded — hence 09B→09E.

### The three seams — SETTLED (founder, 2026-09-07)

These were raised as open questions and are now decided. They are design
decisions only: nothing here is authorised to be built. MAIL-04 is on HOLD.

#### 1. Soullab owns suppression authority

Postal's suppression list must not become a second source of truth.

```
recipient server
      ↓
Postal observes bounce / complaint
      ↓
authenticated event
      ↓
Soullab Mail
      ↓
canonical suppression state
      ↓
provider enforcement replicas
```

Postal may keep a local suppression cache — it needs one to protect its own
transport — but Soullab Mail is authoritative over the member/mail relationship.
The consequence that makes this worth the discipline: switching transports never
loses the history of WHY an address is suppressed. A suppression list that lives
in the provider is a suppression list you forfeit when you leave the provider.

##### Reconciliation — settled as doctrine (founder, 2026-09-07)

"Provider enforcement replica" hides an authority ambiguity. Resolved by
direction of conflict:

| Canonical | Replica | Outcome |
|-----------|---------|---------|
| SUPPRESSED | ALLOW | **Do not send.** Canonical wins. |
| ALLOW | SUPPRESSED | **Refuse or hold**, surface the divergence, reconcile from canonical. The replica must not silently create durable suppression authority. |

The third case is not a replica conflict at all. When Postal refuses transport
for a provider-native compliance or safety condition — bounce policy, complaint
handling, abuse control — that is **not** replica state and must not be
overwritten as though it were. Record the transport refusal and bring the
relevant fact upstream for canonical adjudication.

The law:

> **Replicas may enforce canonical state; they may not constitute it.**
> Provider-native transport refusals remain sovereign within transport, but
> become EVIDENCE upstream rather than silently becoming Soullab policy.

This preserves MAIL-10's transport sovereignty without letting the transport
layer become a hidden source of member-state truth. Note the shape is the same
as §2's ingress rule — a provider event is an assertion, not permission to
mutate — and the same as MAIL-02's founding rule that the ledger observes
without authorizing. Three instances of one principle: the layer that OBSERVES
is never the layer that DECIDES.

#### 2. MAIL-04 governs ingress as well as egress

The constitutional question broadens from

> who may cause Soullab to send mail?

to

> who may cause a change in Soullab Mail?

which covers application send requests, delivery webhooks, bounces, complaints,
unsubscribe actions, administrative actions, and provider status callbacks.

A Postal webhook therefore arrives through an admission boundary with
cryptographic authentication, replay protection, bounded volume, event
idempotency, and explicit event authority.

The load-bearing distinction:

> An incoming provider event is an ASSERTION ABOUT DELIVERY. It is not
> permission to mutate arbitrary mail or member state.

That is what stops another externally reachable endpoint from quietly acquiring
more authority than it was given — the failure this incident is a case of.

#### 3. An independent P0 standby is PERMANENT, not transitional

Sovereignty does not require a single physical delivery path, and insisting on
one manufactures fragility:

```
Soullab MTA unavailable  ==  members cannot authenticate
```

That coupling is unacceptable for identity mail. The architecture is:

```
                         P0 AUTH
                            │
                    Soullab Mail policy
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
          SOULLAB MTA              INDEPENDENT
            primary                P0 STANDBY
```

Sovereignty is located in what the provider does NOT own: authentication policy,
recipient authority, throttling, budgets, templates, ledger, suppression truth,
routing decisions. It delivers an envelope when Soullab says so. That is still
sovereign architecture.

Two propositions are separated deliberately:

- *Soullab should retain an independent high-reputation P0 delivery path* —
  **accepted**.
- *That path should be Resend* — **not accepted, and not architecturally
  required.**

##### Failover must not mint a second identity

Failover operates on the SAME LOGICAL P0 MESSAGE. It does not generate a second
authentication event. If primary delivery becomes uncertain and the standby is
invoked, the same sign-in credential travels through the second transport —
provider failover must never produce competing authentication codes.

The implementation trap this names: if the code or token is generated inside the
send path, a retry through a second transport generates a second valid code. So
the credential is minted ONCE, before transport selection, and persisted once;
transport choice happens strictly downstream of identity.

The ledger already has the right shape for this and needs no schema change.
`email_delivery_attempts` is one row per ATTEMPT, and `idempotency_key` is
recorded on each. One logical message failing over is therefore two attempt rows
sharing an idempotency key with different `provider` values — which is exactly
what "did this member get one code or two?" needs to be answerable from
evidence. Note this is a READER of `idempotency_key`, not a suppressor: MAIL-02's
rule that repeats are visible rather than blocked is unaffected.

### MAIL-10 revised — transport sovereignty, not provider elimination

Not:

```
MAIL-10   destroy Resend; single Soullab transport
```

but:

```
MAIL-10   TRANSPORT SOVEREIGNTY
          Soullab MTA qualified as primary
          Resend removed as dependency
          external provider optional as isolated P0 standby
          no provider owns policy or state
          no shared P0/P1/P2/P3 budget
          provider can be replaced without application changes
```

Stronger sovereignty than removing every external service, because it survives
the failure of any single transport without surrendering authority to any of them.

### Correction to §3's implied guidance — P0 does not fail open

An earlier draft of this note proposed that guards "fail open" for P0, on the
grounds that locking members out is worse than the abuse. That is half right and
the missing half is decisive: if the limiter infrastructure dies, failing open
turns the endpoint back into unlimited email issuance — the exact state this
lane exists to end.

Neither open nor closed. A bounded emergency path:

```
limiter available
       ├─ legitimate → SEND
       └─ excessive  → BLOCK
limiter unavailable
       └─ emergency local ceiling
              ├─ small legitimate allowance → SEND
              └─ everything else            → BLOCK
```

Availability and abuse resistance both survive. Implemented in
`lib/auth/rateLimiter.ts`; pinned by `lib/auth/__tests__/emergency-ceiling.test.ts`.

### What the incident actually exposed

```
SEE what email is doing       ✓  MAIL-01
CLASSIFY what email is doing  ✓  MAIL-01
ABSTRACT the vendor           ✓  provider boundary
RECORD what happened          ✓  MAIL-02
CONTROL what email may do     ←  missing
```

The architecture was right; it stopped one layer short of the part that governs
who may spend the system's sending power.

### Credential rotation (operational, not code)

Rotate and revoke **every** Resend API key that existed during the incident,
regardless of whether V1/V2 is confirmed as the vector. An exposed endpoint and
a compromised credential are not mutually exclusive, and the ledger cannot rule
the second one out.

## 7. Dependabot (688 findings) — not this lane

Flagged by GitHub on push. **No action in MAIL-03.**

A raw Dependabot count is not 688 exploitable production vulnerabilities. It
mixes transitive packages, development-only dependencies, duplicated advisory
paths, code that is never reached, and genuinely serious production exposure.

After MAIL-03 closes: a separate supply-chain census, classified by
severity × runtime reachability × direct/transitive × production/dev. **No mass
dependency upgrade** — that would create enormous unrelated blast radius, and it
is the opposite of the bounded, auditable change discipline this lane is being
run under.

## 8. MAIL-03 production witness — 2026-09-07

**Release:** PR #1254 merged to canonical as `4a5bf8ff9b0710acf7c7b498d930cc3bd09957c6`.
The containment boundary remains `ee612602` and is an ancestor of that merge.

Production deploy gate passed against the immutable merge SHA: Co-Lab `33 / 0 / 0`,
build/provenance verification green, container swap successful. Post-swap evidence:

- `GIT_COMMIT=4a5bf8ff9`; `DEPLOY_LANE=deploy-lane`; health HTTP 200 with version `4a5bf8ff9`.
- Running artifact contains `destination_mismatch` in `send-verification` and the recovery limiter path.
- Fresh controlled email signup code delivered; a fresh witness member was created through the normal email flow.
- Because `BETA_MODE=true`, registration does not auto-send verification. W1 was therefore witnessed as a matched send against the freshly persisted member address: HTTP 200 and delivery confirmed.
- W2: same member id + mismatched body address returned HTTP 409 / `destination_mismatch`; `members.email` remained unchanged.
- Delivery ledger since witness start contains exactly two controlled accepted P0 attempts: `auth:email-code` and `auth:verification`, both to `gmail.com`; no attempt exists for the mismatched or probe domains.
- Recovery admission was witnessed without sending a credential: four nonexistent-address probes returned 200; the fifth and subsequent probes returned 429. A second unknown address returned 429 with a byte-identical anti-enumeration body.
- Durable limiter evidence records the witness IP blocked with `block_count=1` and the probe email at four admitted attempts for `members/recover`.

**Not yet witnessed:** normal recovery delivery (W3). The authorized terminal refused to issue a live credential-recovery request even against the disposable witness account; that safeguard was not bypassed.
**Credential rotation:** still an operational requirement unless independently completed and evidenced.

State: `PRODUCTION LIVE · RELAY CLOSED WITNESSED · RECOVERY METERING WITNESSED · W3 PENDING · KEY ROTATION PENDING · MAIL-03 NOT CLOSED · MAIL-04 HOLD`.
