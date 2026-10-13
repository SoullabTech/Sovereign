-- G2-3-A: ISOLATED SCHEMA CANDIDATE. NOT APPROVED, NOT INSTALLED.
-- Parent for comparison: G2-2 ea0e778ecb4dd1ac04754d6e8d23751d3dfe09c2
-- Human security, deletion/restore, old-reader, lock-budget, and PostgreSQL
-- fixture review MUST pass before installing anywhere other than synthetic PG.
-- No legacy primary keys, practitioner ownership values, team assignments,
-- old FKs, old indexes, historical rows, or subscriptions are changed.
-- This migration deliberately performs NO backfill and NO member-data reads.
-- A member-native row has personal_member_id, not practitioner_id or team_id.
-- Existing practitioner-origin rows remain practitioner-origin.
-- If the user deletes their member identity, member-native records cascade;
-- review against signed deletion-tombstone and recovery controls before release.
-- Existing practitioner FK cascading deletion remains and MUST be separately
-- fenced by approved deletion/recovery protections; this migration does NOT fix it.

BEGIN;
SET LOCAL lock_timeout = '1500ms';

ALTER TABLE public.field_notes ADD COLUMN IF NOT EXISTS personal_member_id UUID;
ALTER TABLE public.field_notes ALTER COLUMN practitioner_id DROP NOT NULL;
DO $guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.field_notes'::regclass AND conname='field_notes_personal_member_fk') THEN
    ALTER TABLE public.field_notes ADD CONSTRAINT field_notes_personal_member_fk
      FOREIGN KEY (personal_member_id) REFERENCES public.members(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.field_notes'::regclass AND conname='field_notes_exactly_one_owner_ck') THEN
    ALTER TABLE public.field_notes ADD CONSTRAINT field_notes_exactly_one_owner_ck
      CHECK ((practitioner_id IS NOT NULL AND personal_member_id IS NULL) OR
             (practitioner_id IS NULL AND personal_member_id IS NOT NULL AND team_id IS NULL)) NOT VALID;
  END IF;
END
$guard$;

ALTER TABLE public.field_attention ADD COLUMN IF NOT EXISTS personal_member_id UUID;
ALTER TABLE public.field_attention ALTER COLUMN practitioner_id DROP NOT NULL;
DO $guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.field_attention'::regclass AND conname='field_attention_personal_member_fk') THEN
    ALTER TABLE public.field_attention ADD CONSTRAINT field_attention_personal_member_fk
      FOREIGN KEY (personal_member_id) REFERENCES public.members(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.field_attention'::regclass AND conname='field_attention_exactly_one_owner_ck') THEN
    ALTER TABLE public.field_attention ADD CONSTRAINT field_attention_exactly_one_owner_ck
      CHECK ((practitioner_id IS NOT NULL AND personal_member_id IS NULL) OR
             (practitioner_id IS NULL AND personal_member_id IS NOT NULL AND team_id IS NULL)) NOT VALID;
  END IF;
END
$guard$;

ALTER TABLE public.field_events ADD COLUMN IF NOT EXISTS personal_member_id UUID;
ALTER TABLE public.field_events ALTER COLUMN practitioner_id DROP NOT NULL;
DO $guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.field_events'::regclass AND conname='field_events_personal_member_fk') THEN
    ALTER TABLE public.field_events ADD CONSTRAINT field_events_personal_member_fk
      FOREIGN KEY (personal_member_id) REFERENCES public.members(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.field_events'::regclass AND conname='field_events_exactly_one_owner_ck') THEN
    ALTER TABLE public.field_events ADD CONSTRAINT field_events_exactly_one_owner_ck
      CHECK ((practitioner_id IS NOT NULL AND personal_member_id IS NULL) OR
             (practitioner_id IS NULL AND personal_member_id IS NOT NULL AND team_id IS NULL)) NOT VALID;
  END IF;
END
$guard$;

ALTER TABLE public.field_people ADD COLUMN IF NOT EXISTS personal_member_id UUID;
ALTER TABLE public.field_people ALTER COLUMN practitioner_id DROP NOT NULL;
DO $guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.field_people'::regclass AND conname='field_people_personal_member_fk') THEN
    ALTER TABLE public.field_people ADD CONSTRAINT field_people_personal_member_fk
      FOREIGN KEY (personal_member_id) REFERENCES public.members(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.field_people'::regclass AND conname='field_people_exactly_one_owner_ck') THEN
    ALTER TABLE public.field_people ADD CONSTRAINT field_people_exactly_one_owner_ck
      CHECK ((practitioner_id IS NOT NULL AND personal_member_id IS NULL) OR
             (practitioner_id IS NULL AND personal_member_id IS NOT NULL AND team_id IS NULL)) NOT VALID;
  END IF;
END
$guard$;

-- Index DDL is included for fixture completeness. For installed deployments,
-- split large-table indexing into approved, separately scheduled CONCURRENTLY
-- operations; lock budget and actual installed index census remain unverified.
CREATE INDEX IF NOT EXISTS idx_field_notes_personal_member
  ON public.field_notes (personal_member_id, created_at DESC)
  WHERE personal_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_field_events_personal_member
  ON public.field_events (personal_member_id, event_at)
  WHERE personal_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_field_people_personal_member
  ON public.field_people (personal_member_id, created_at DESC)
  WHERE personal_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_field_attention_personal_member
  ON public.field_attention (personal_member_id, field, position)
  WHERE personal_member_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_field_attention_member_reference
  ON public.field_attention (personal_member_id, field, kind, ref_id)
  WHERE personal_member_id IS NOT NULL AND ref_id IS NOT NULL;

-- Deliberately do not VALIDATE CONSTRAINT here. Existing row compatibility and
-- a safe maintenance window must be independently determined. NOT VALID still
-- enforces both FK and owner CHECK for new inserts and updates.
COMMIT;
