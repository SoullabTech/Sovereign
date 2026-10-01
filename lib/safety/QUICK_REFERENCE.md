# Teen Support System - Quick Reference

**Status (2026-10-01): dormant while Soullab beta is adults-first.**

This file describes the current code honestly. It is not authority to reopen teen
registration. Any future youth experience requires a separate founder-approved
safety, consent, guardian, and delivery design.

## Current safety authority

Soullab currently follows **Option A**:

- MAIA provides safety support inside the product.
- Clear crisis signals surface crisis resources.
- Ambiguous signals invite a direct safety check-in.
- There is **no hidden Soullab-team, guardian, Slack, email, or SMS alert** on
  the general MAIA member path.
- Code and copy must never imply that a human was notified unless a separately
  governed delivery channel has actually confirmed that delivery.
- The adults-first admission gate remains the boundary until a youth lane is
  deliberately reopened.

## Teen-path code that remains

### Crisis / distress

`teenSupportIntegration.ts` contains local teen-oriented detection and support
helpers. When the dormant teen client path enters crisis mode,
`OracleConversation.tsx` shows resources and MAIA stays present.

That path does **not** notify a Soullab team member or guardian.

### Abuse disclosure

`abuseDetection.ts` detects language suggesting that a young person may be
experiencing physical, emotional, sexual abuse, or neglect. It is not a
"protect MAIA from an abusive user" moderation system.

When the dormant teen path detects an abuse disclosure, ordinary conversation is
paused for that turn and the member-facing response points toward immediate
support and a trusted adult. No team review, strike, hidden incident record, or
human outreach is claimed.

### Eating-disorder and neurodivergent support

The existing local support helpers can still contribute resources and
age-appropriate framing. Their presence does not authorize youth admission.

## Delivery boundary

The removed functions `alertSoullabTeam` and `alertTeamAboutAbuse` were
non-delivery stubs: they sounded like human alerts but only wrote to a console.
They are intentionally absent under Option A.

If a future youth programme chooses human or guardian notification, it needs all
of the following before any copy can promise it:

1. explicit consent/assent authority;
2. a named, staffed recipient and coverage policy;
3. a delivery mechanism independent of the product it monitors;
4. privacy-minimizing payload rules;
5. a witnessed success and failure path;
6. member-facing wording that matches what actually happens.

A console line, database row, or function name is not delivery.

## Testing checklist

- [ ] Adults cannot enter the teen path through registration.
- [ ] A clear crisis signal shows the intended resources.
- [ ] An ambiguous signal does not falsely escalate.
- [ ] An abuse-disclosure signal surfaces appropriate support.
- [ ] No teen safety path calls `alertSoullabTeam` or
      `alertTeamAboutAbuse`.
- [ ] No member-facing copy says a team member or guardian was notified.
- [ ] No safety diagnostic log contains conversation text.
- [ ] Any future human-delivery mode has an explicit, witnessed authority.

## Primary files

- `components/OracleConversation.tsx` - client safety-flow integration
- `lib/safety/teenSupportIntegration.ts` - teen support helpers
- `lib/safety/abuseDetection.ts` - abuse-disclosure detection and response
- `lib/safety/edAwareSystem.ts` - eating-disorder support
- `lib/safety/neurodivergentAffirming.ts` - neurodivergent support
- `lib/youth/youthAdmissionGate.ts` - adults-first admission boundary
- `docs/programme/SAFETY-CRISIS-01_OPTION_A_AND_SERVER_DETECTOR_2026-10-01.md`
  - current crisis authority and evidence

## Member-facing resources

Resource copy is owned by the current safety implementation and must be tested
as part of the safety corpus. Do not duplicate a promise of human monitoring in
this reference file.

---

**Rule:** the product may say only what it can witness. Under Option A, MAIA can
offer resources and stay present; it does not tell the member that another
person has been alerted.
