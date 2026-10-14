# ASTRO-R4e — Member-owned chart / MAIA conversation consent

**Founder-approved governing rule, October 13, 2026**

> A member's chart belongs to them. MAIA may calculate and display it with their consent, but must not carry its contents into a conversation without their explicit authorization.

## Two different permissions

1. **Chart use:** existing opt-in `astrology_consent='opted_in'` permits calculating and displaying a private, self-owned chart through the dedicated view. It is not a general invitation for MAIA to read the member's chart or receive it on unrelated turns.
2. **Conversation crossing:** a member must see exactly what will be sent, choose **Send to MAIA**, and have current session, allowed member identity and chart consent rechecked. Only the approved text becomes a user-authored MAIA utterance. **Keep it here** does not send it.

## Immediate safe implementation (isolated R4e source)

Until a separately reviewed, server-verifiable, one-turn transfer authority is designed, **all hidden/system astrology context addenda are forbidden**. No ordinary MAIA route, shared identity/voice loader, Between chat, stale client metadata, broad beta flag or standing opt-in can re-enable them. The prompt append path must refuse even caller-supplied `astrologicalContextAddendum`.

The member's authored Send message remains allowed. The disclosure UI states that selected text becomes part of the conversation and may be retained under MAIA conversation settings. A preview cannot secretly provide additional birth information outside that text.

No external model permission, persistence rule, billing tier, practitioner-client grant or public rollout authorization is created by this canon.

## Future server-mediated transfer, separate acceptance

If Soullab later needs an automatic factual/chart addendum for a member-approved conversation, design a separately audited per-turn receipt tied to the verified account, session, exact selected content digest, intended MAIA recipient/provider/classification, current standing chart consent, time/expiry, scope, revocation and single-use semantics. Neither a client boolean nor localStorage nor an environment flag counts as the receipt. Disclose whether the chosen context leaves the local system for a cloud model.

## Critical retention hold

A member-approved Send may be persisted in that conversation and later retrieved by cross-session memory. The present R4e bounded patch does **not** prove that such approved chart text cannot be passively recalled in another conversation; source provenance/recall filtration and member deletion/recovery controls need their own acceptance. Do not claim complete future-recall isolation before that test passes.

**Release status:** Founder rule accepted in this development conversation; isolated R4e implementation and automated tests are review evidence only. Canonical merge, security/privacy sign-off and beta deployment remain HOLD.
