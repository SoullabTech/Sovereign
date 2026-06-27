# Practitioner Contacts Layer — Implementation Spec

**Status:** [DESIGNED] — not built. No code applied.
**Date:** 2026-06-27
**Origin:** Studio Groups "Add Member" only reads `practitioner_clients`; Gmail import writes people in *as clients*. So teammates, guests, collaborators, mentors, and referral partners get mislabeled "clients" just so the UI can find them.

## Domain rule

**A person is a `contact` (identity). "Client" is a *relationship role*, not the person's type.** A flag on `practitioner_clients` is rejected — it keeps the wrong table at the center (the person still *is* a client). The contact is the stable identity; relationships attach to it.

## Decision — contacts-first + bridge (NOT a one-slice "client→relationship" refactor)

Grounded in blast radius: `practitioner_clients.id` is referenced by **28 FK tables** (`sessions`, `revenue_records`, `safety_concern_logs`, `comms_*`, `client_portal_*`, `scribe_sessions`, `studio_*`, `academy_enrollments`, …) and **61 code files**. Changing `client_id` semantics in one slice is unacceptable blast radius into billing/safety/sessions.

Instead:
- Introduce **`practitioner_contacts`** as the person/identity layer (the address book).
- Keep **`practitioner_clients`** as the **client relationship**, now linked to a contact via `contact_id`. Its structure/semantics are otherwise unchanged → **all 28 FK tables and 61 files keep working**.
- Future relationship tables (`teammate`, `guest`, `mentor`, …) point at a `contact_id` the same way. "Client as relationship on contact" thus emerges incrementally.

## Schema (slice 1)

- `practitioner_contacts` (id, practitioner_id, name, email, phone, `source` [manual|gmail|csv|…], `member_id` nullable — link to a MAIA member **only if one exists; never auto-created**, labels jsonb, notes, timestamps). Unique per (practitioner_id, lower(email)).
- `practitioner_clients` **+`contact_id`** → `practitioner_contacts(id)` (nullable; structure otherwise untouched).
- **Bridge backfill:** every existing client's *person* becomes a contact, and the client links to it (idempotent; reuses an existing contact on matching email).
- `client_group_members` **+`contact_id`**, `client_id` made nullable, CHECK (client_id IS NOT NULL OR contact_id IS NOT NULL) → a group member is a client **or** a contact.

## Behavior changes

- **Gmail import** (`app/api/studio/clients/import/gmail`) writes to **`practitioner_contacts`** (`source='gmail'`), not `practitioner_clients`. Imported people are contacts, not clients.
- **Add-Member picker** (`/api/studio/clients` → the modal at `app/studio/groups/[groupId]/page.tsx`): returns clients **∪** contacts, each tagged `{ source: 'client' | 'contact', id, name, email }`.
- **Group add** (`/api/studio/groups/members`): accepts `contactId` **or** `clientId`; writes the matching column in `client_group_members`.

## Backward-compatibility guarantees

- `practitioner_clients` only *gains* a nullable `contact_id` → the 28 FK tables and existing client flows are untouched.
- Existing clients still appear in the picker and behave exactly as before.
- **No client is auto-created from a contact. No MAIA member account is auto-created** (`member_id` stays null unless explicitly linked).
- A contact is **promotable/linkable later** to client / guest / teammate / practitioner / MAIA member **without duplicating the person** (the contact is the stable identity; relationships attach).

## Acceptance criteria

1. Jondi imports Gmail contacts → they become **contacts, not clients**.
2. Add-Member can search **both clients and contacts**.
3. Nathan / team members can be added to a group **without being mislabeled as clients**.
4. Existing clients still appear and behave as before.

## Build increments (each verifiable; production gated)

1. **Schema migration** — `practitioner_contacts` + `contact_id` on `practitioner_clients` + `contact_id` on `client_group_members` + bridge backfill. *(draft → local apply → prod on go)*
2. **Gmail import retarget** → `practitioner_contacts`.
3. **Picker union** — `/api/studio/clients` returns clients ∪ contacts (tagged source).
4. **Group add accepts `contactId`**.
5. **Minimal contacts UI** — list / add / import surface (and the modal label widened beyond "clients").
6. *(later)* promote-contact-to-{client,teammate,…}; eventually migrate `client_group_members` to reference `contact_id` uniformly.

## Notes
- The bridge backfill is the part to validate locally first (matching clients↔contacts by email/name). Run on local DB, eyeball, before production.
- Does NOT touch the Personal Wisdom Library thread (separate, paused).
