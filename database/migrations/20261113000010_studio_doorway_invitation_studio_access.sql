-- Studio doorway invitations: an invitation may carry Writer's Studio access itself.
--
-- Founder authorization 2026-11-13 (ledger #1938, College Essay controlled beta: "Yes, build it").
-- Without this, an invited person who signs up at the Writer's Studio door lands on
-- "invitation required" until an owner ticks them onto the beta roster at /studio/settings.
--
-- When true, redeeming the invitation applies exactly that owner act, in the sign-up
-- transaction: the legacy Writer's Studio roster row (lib/admin/memberPermissions.ts
-- applyChange, permission 'writers_studio') and its audit_logs row, with the invitation's
-- founder/CTO issuer as the actor. It works in WS_BETA_GRANT_MODE 'legacy' and grants no
-- dated grant.
--
-- Additive and defaulted: existing invitations are unchanged (false). Only a Writer's
-- Studio invitation with a named founder/CTO issuer may carry it.

BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE studio_doorway_invitations
  ADD COLUMN IF NOT EXISTS grants_writers_studio boolean NOT NULL DEFAULT false;
ALTER TABLE studio_doorway_invitations
  DROP CONSTRAINT IF EXISTS studio_doorway_invitation_studio_access_shape;
ALTER TABLE studio_doorway_invitations
  ADD CONSTRAINT studio_doorway_invitation_studio_access_shape
  CHECK (NOT grants_writers_studio OR (studio = 'writer' AND issuer_member_id IS NOT NULL));
COMMIT;
