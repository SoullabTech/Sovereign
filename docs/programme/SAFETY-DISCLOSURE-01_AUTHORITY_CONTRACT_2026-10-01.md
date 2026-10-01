# SAFETY-DISCLOSURE-01 — Authority Contract

**Date:** 2026-10-01
**Evidence base:** commit:`7973d9eb667c0787296835f865483a9517a09b88`
**Stage:** authority law + pure resolver
**Production disclosure changed:** no

## Purpose

Define when a safety concern may cross from private member context to another human or service.

This record does not create an emergency-dispatch system. It reconciles the current safety work with already-existing Soullab disclosure law.

## Existing law carried forward

### Disclosure boundary

`lib/disclosure/disclosureBoundary.ts` already makes the order structural:

authority first → accountability receipt → content crossing by the caller.

The boundary explicitly does not execute the crossing itself. A permission seam that also sends content would collapse authority and action into one unauditable event.

### Existing practitioner safety message

The deployed practitioner-message safety lane is member-initiated. The member composes the message and chooses its urgency, including `safety_concern`.

The prior Now What? safety reconciliation correctly ruled that this is not automatic system disclosure. It is a member pulling a cord they chose to pull.

That pattern is the existing lawful precedent.

## Governing law

### L1 — Concern never manufactures authority

A crisis recognizer, risk classification, model judgment, practitioner relationship, or safety label does not by itself authorize disclosure.

Recognition changes the system's obligation to respond safely to the member. It does not automatically increase authority over the member.

### L2 — Member act is the only currently executable basis

A present explicit member act may authorize a bounded disclosure when it names:

- the recipient class;
- the scope of content to cross;
- the present act itself.

The authority resolver returns `may_cross` only for that case.

`may_cross` is still not the disclosure. The caller must then establish the existing disclosure boundary and accountability receipt before content crosses.

### L3 — Candidate exceptions are not executable authority

The following cases are represented as `review_required`, not permission:

- imminent-danger exception;
- legal compulsion;
- minors or vulnerable adults.

Those cases may carry real legal or professional duties, but this repository has not established one universal cross-jurisdiction rule. The software must not invent one.

### L4 — No standing preauthorization is created here

This unit does not introduce an emergency-contact checkbox, standing guardian grant, practitioner blanket consent, or durable safety-sharing preference.

A future preauthorization mechanism would need its own explicit scope, recipient identity, revocation semantics, expiry/standing, member-facing trust copy, and disclosure receipt.

### L5 — Private reflection remains private by default

No private reflection reaches a coach, practitioner, family member, trusted contact, crisis service, emergency service, or Soullab operator merely because the system became concerned.

## Executable seam

`lib/safety/safetyDisclosureAuthority.ts`

The resolver is pure. It:

- does not import the crisis recognizer;
- does not accept severity or a risk score;
- performs no recipient lookup;
- performs no network or database operation;
- cannot send content;
- returns `may_cross` only for a present explicit member act;
- returns `review_required` for unresolved exception classes.

## Falsifiers

The contract is defeated if any of the following becomes possible:

1. increasing crisis severity changes `none` into `may_cross` without a member act;
2. the resolver imports a crisis detector or risk score;
3. the resolver looks up a practitioner, guardian, emergency contact, or service;
4. the resolver sends, persists, or performs the crossing;
5. an imminent-danger, legal, minor, or vulnerable-adult label directly returns permission;
6. `may_cross` bypasses the repository's disclosure-boundary / receipt discipline.

## Relation to SAFETY-DELIVERY-01

SAFETY-DELIVERY-01 may recognize explicit active/NSSI/imminent language and provide a deterministic member-facing safety floor.

That recognition remains independent of this authority resolver.

`disclosureAuthorized: false` on the safety response is therefore not temporary copy. It expresses the standing law unless and until a separate witnessed authority event exists.

## Relation to the Now What? reconciliation

The prior reconciliation already established:

- no third-party disclosure from private reflection without member act;
- existing practitioner `safety_concern` messaging is member-initiated and therefore not a conflicting automatic notification path;
- the imminent-danger exception is unresolved and requires qualified legal/clinical review;
- safety state must not become member-model memory or developmental interpretation.

SAFETY-DISCLOSURE-01 makes the authority portion of that design mechanically representable without pretending the unresolved exception has been settled.

## Kelly's World standing

**Needs Kelly:** whether Soullab wants to commission and eventually support a separately reviewed imminent-danger / legal-duty mechanism at all.

**In motion:** member-act disclosure authority can reuse existing disclosure-boundary and practitioner-message patterns.

**Watching:** trust-copy implications, jurisdiction, minors/vulnerable adults, recipient availability, and any attempt to turn severity into authority.

## Standing

**DEFAULT PRIVATE · MEMBER ACT IS THE ONLY CURRENT EXECUTABLE DISCLOSURE BASIS · EXCEPTIONS REVIEW-REQUIRED · NO DISCLOSURE TRANSPORT ADDED.**
