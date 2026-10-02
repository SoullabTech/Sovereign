# SAFETY-DISCLOSURE-01 · R6 — Truthful Confirmation Language

**Date:** 2026-10-01
**Status:** COPY CONTRACT · non-executing
**Parent:** R5 Notification Result Contract

## Rule

Member-facing copy may claim no more than the strongest witnessed R5 standing.

## Allowed language

| R5 standing | Strongest allowed member-facing claim | Forbidden stronger claim |
|---|---|---|
| `message_persisted` | `Your message was saved for your practitioner.` | delivered, notified, seen |
| `safety_logged` | `Your message was saved with the safety flag you selected.` | practitioner notified/received |
| `notification_attempting` | `Your message is saved. We are attempting the email notification.` | notification sent/delivered |
| `provider_accepted` | `Your message is saved. The email provider accepted the notification for delivery.` | practitioner received/saw it |
| `notification_indeterminate` | `Your message is saved. We could not confirm the email notification outcome.` | sent, delivered, notified |
| `notification_refused` | `Your message is saved, but the email notification could not be sent.` | practitioner notified |
| `practitioner_read` | `Your practitioner opened your message.` | acknowledged/took action |
| `safety_acknowledged` | `Your practitioner acknowledged your safety concern.` | resolved, safe, intervention complete |

## Safety resource independence

Failure or uncertainty in practitioner notification must never suppress immediate crisis-resource guidance.

## Dormant component hold

`NoteConfirmation.tsx` must not be mounted with its current unconditional `delivered` / `notified` language.

Mounting requires either:

1. wiring the component to an R5 standing; or
2. using the weakest truthful persisted-only wording until stronger evidence exists.

## Standing

**COPY CLAIMS BOUND TO EVIDENCE · NO RUNTIME UI CHANGE · NO DELIVERY AUTHORITY ADDED.**
