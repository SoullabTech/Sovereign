-- Additive relationship roles on the practitioner↔person link.
-- Artifact type: Implementation pattern. Additive + reversible; NOT a normalization.
--
-- Models the RELATIONSHIP (what a person is to the practitioner), not a person type.
-- A single practitioner_clients row may carry several roles at once, e.g.
-- {client}, {client,guest}, {colleague}, {mentor,trusted-contact}, {referral-partner}.
--
-- Distinct axis from client_types (which is work/domain: leadership, executive, ...).
-- Do NOT overload client_types or tags with relationship nature.
--
-- "Guest" = a row whose roles include 'guest' with member_id LEFT NULL — no member
-- record is auto-created; promotion to member is an explicit later act.
--
-- Reversible: DROP COLUMN relationship_roles (+ index) restores prior state.
-- Promote a role into its own child table ONLY if it later needs its own
-- consent / lifecycle / audit trail / authority rules (separate-by-authority-source).

ALTER TABLE practitioner_clients
  ADD COLUMN IF NOT EXISTS relationship_roles TEXT[] NOT NULL DEFAULT ARRAY['client'];

-- Belt-and-suspenders: the NOT NULL DEFAULT already backfills existing rows to
-- {client}; this also normalizes any pre-existing empty/null arrays.
UPDATE practitioner_clients
  SET relationship_roles = ARRAY['client']
  WHERE relationship_roles IS NULL OR cardinality(relationship_roles) = 0;

-- Support role filtering ("all guests", "all clients") via array containment.
CREATE INDEX IF NOT EXISTS idx_practitioner_clients_relationship_roles
  ON practitioner_clients USING GIN (relationship_roles);

COMMENT ON COLUMN practitioner_clients.relationship_roles IS
  'Additive relationship roles for this practitioner<->person link (client, colleague, mentor, trusted-contact, referral-partner, guest, future-practitioner, ...). Models the relationship, not a person type. Distinct from client_types (work/domain). Guest = role present with member_id NULL (no member auto-created). Reversible; promote a role to its own table only if it needs its own consent/lifecycle/audit/authority.';

-- ── Email becomes optional ───────────────────────────────────────────────────
-- Same generalization: stop assuming every saved person is a client. A client needs
-- an email (billing, portal, reminders); a mentor, family member, or trusted contact
-- may have only a phone — or neither. Relaxing NOT NULL is strictly backward-compatible:
-- every existing row already has an email, and the existing UNIQUE(practitioner_id, email)
-- treats NULLs as DISTINCT, so multiple emailless contacts coexist with no placeholder
-- hack. Client-creation paths keep requiring email at the application layer; the lean
-- /api/studio/people path allows name + (email OR phone).
ALTER TABLE practitioner_clients ALTER COLUMN email DROP NOT NULL;

-- Same reasoning for name: an email-only invite (or a session participant added by
-- email) has no name yet. Required to satisfy "email-only guest accepted." Client
-- creation keeps requiring name at the APP layer; guest creation allows name-only OR
-- email-only. Backward-compatible: every existing row already has a name.
ALTER TABLE practitioner_clients ALTER COLUMN name DROP NOT NULL;
