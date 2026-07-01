# Beta Dry Run — Jondi's First Client Journey

Pre-beta gate for the complete practitioner-to-client experience.
Run this before any real client invitations.

---

## Stage 1 — Invitation

**Action**
- Complete Practice Field in `/maia/vision-studio?tab=practice`
- Confirm status changes to **LIVE**
- Send invitation to a secondary email address

**Pass**
- Email arrives
- Link opens `/join/[token]`

**If it fails**
- Check Resend delivery logs
- Verify Practice Field status is LIVE (not PENDING)
- Inspect `POST /api/practitioner/practice-field/invite`

---

## Stage 2 — Join

**Action**
- Create a new account (or sign in if already a member)

**Pass**
- Registration succeeds
- Session established
- User reaches the invitation acceptance flow

**If it fails**
- Inspect `POST /api/members/register`
- Verify session creation in `auth_sessions`
- Confirm token remains valid (not consumed prematurely)

---

## Stage 3 — Threshold

**Action**
- Review relationship information
- Accept consent
- Continue

**Pass**
- Threshold completes
- Relationship activated
- User enters the Relationship Space

**If it fails**
- Check `POST /api/join/[token]/accept`
- Verify `participant_member_id` written to `relationship_spaces`
- Inspect `POST /api/relationship-spaces/[spaceId]/consent`

---

## Stage 4 — Member Portal

**Action**
- Open `/maia/portal`

**Pass**
- Practitioner relationship appears
- Correct practitioner name displayed
- Relationship opens successfully

**If it fails**
- Check `GET /api/member/portal` query
- Verify portal authorization (session → member → space membership)
- Confirm `consent_status = 'accepted'` and `status = 'active'` on the space

---

## Stage 5 — MAIA

**Action**
- Begin a conversation as the invited member

**Pass**
- Docker logs contain:
  ```
  [Route] Practice Field context injected
  ```
- MAIA's responses naturally reflect the practitioner's welcome, way of working, and accompaniment style — without sounding scripted or exposing internal prompt content

**This is the most important qualitative test.**

**If it fails**
- Confirm `relationship_spaces` row has `status = 'active'` and `consent_status = 'accepted'`
- Check `buildPracticeFieldContext` in `lib/practiceField/practiceFieldService.ts`
- Confirm `practice_field_snapshots` row exists for the space

---

## Stage 6 — Encounter (Recommended)

Not required for the invitation flow, but run immediately after if Stages 1–5 pass.

**Path**
```
Session Room
  → Create Encounter
  → Transcript
  → Extract Moments
  → Save Reflection
  → Ask MAIA
  → Return later
```

**Pass criterion**
Does the Encounter feel like a place that continues teaching after the conversation has ended?

---

## Post-Dry-Run Hardening

After first successful acceptance, apply the defensive token cleanup:

```typescript
// app/api/join/[token]/accept/route.ts — after the UPDATE
await query(
  `UPDATE relationship_spaces SET invite_token = NULL WHERE id = $1`,
  [space.id]
);
```

This is not fixing a bug — `participant_member_id IS NOT NULL` already prevents re-claim. It completes the invitation lifecycle by removing a token that no longer has any legitimate purpose.

Deploy after dry run confirms the full flow works.

---

## Beta Success Criteria

At the end of the dry run, the complete relational architecture has been exercised:

- [ ] Practice Field authored in Vision Studio
- [ ] Invitation carries the practitioner's field into the relationship
- [ ] Threshold establishes consent before participation
- [ ] Relationship Space becomes the shared environment
- [ ] Member Portal presents the relationship from the client's perspective
- [ ] MAIA accompanies the relationship using the Practice Field as context rather than replacing the practitioner's way of working
- [ ] Encounter preserves the work as a living source of ongoing reflection

If all pass: the practitioner-to-client experience the architecture was designed to support is validated — not just individual features, but the complete arc.
