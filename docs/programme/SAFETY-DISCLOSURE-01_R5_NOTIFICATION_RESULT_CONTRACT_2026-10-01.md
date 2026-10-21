# SAFETY-DISCLOSURE-01 · R5 — Notification Result Contract

**Date:** 2026-10-01
**Status:** CONTRACT + pure projector · no send-path wiring

## Governing law

A stored message, a safety log, provider acceptance, practitioner read, and practitioner acknowledgment are different facts.

Strongest truthful states:

- `message_persisted` — the member-authored message row exists;
- `safety_logged` — the safety concern audit row exists;
- `notification_attempting` — provider outcome not yet settled;
- `provider_accepted` — provider issued a message id and accepted responsibility;
- `notification_indeterminate` — provider outcome genuinely unknown;
- `notification_refused` — known terminal non-send;
- `practitioner_read` — practitioner read witness exists;
- `safety_acknowledged` — practitioner explicitly acknowledged the safety concern.

Provider acceptance is **not** human receipt.

The first human-receipt witness is practitioner read. The stronger safety witness is explicit acknowledgment.

## Existing evidence mapping

`email_delivery_attempts.state='accepted'` maps to `provider_accepted`, never `practitioner_read`.

Legacy `safety_concern_logs.email_status='sent'` may only be interpreted as provider-send success/acceptance. It must not justify copy claiming a human received or saw the concern.

`client_messages.read_at` is a practitioner-read witness.

`safety_concern_logs.acknowledged_at` is an explicit safety acknowledgment witness.

## Dormant copy debt

`components/portal/NoteConfirmation.tsx` and helper copy currently contain phrases such as `Your practitioner has been notified` and `Your message has been delivered to ...`.

The component is exported but no live mount was found in the current app tree, so this is dormant copy debt rather than proven live member-facing misstatement.

Before that surface is mounted, its language must consume this result contract or use weaker truthful copy such as `Your message was saved for your practitioner`.

## Pure projector

`lib/safety/safetyDeliveryStanding.ts` derives the strongest truthful standing from existing evidence only.

It performs no I/O, sends nothing, and grants no disclosure authority.

## Falsifiers

R5 fails if provider acceptance sets `humanReceiptWitnessed=true`, if persistence is described as human delivery, or if notification failure is hidden behind generic success copy.

## Standing

**RESULT SEMANTICS FROZEN · PROVIDER ACCEPTANCE ≠ HUMAN RECEIPT · HUMAN READ/ACK ARE SEPARATE WITNESSES · NO SEND PATH CHANGED.**
