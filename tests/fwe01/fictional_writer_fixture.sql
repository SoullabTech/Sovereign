-- SOULLAB-FWE-01 Stage 1: synthetic, disposable PostgreSQL 17 schema only.
-- This is NOT a migration. Use ONLY with c0_fwe_fictional on a Unix socket,
-- never the running Soullab database or a copied account/manuscript.
DO $$
BEGIN
  IF current_database() <> 'c0_fwe_fictional' OR inet_server_addr() IS NOT NULL THEN
    RAISE EXCEPTION 'REFUSE: FWE-01 fixture requires isolated Unix-socket fictional DB';
  END IF;
END $$;
CREATE TABLE members (
  id UUID PRIMARY KEY, username TEXT NOT NULL, name TEXT,
  tier TEXT NOT NULL DEFAULT 'free', roles TEXT[] NOT NULL DEFAULT ARRAY['member']::TEXT[]
);
CREATE TABLE auth_sessions (
  member_id UUID NOT NULL REFERENCES members(id),
  session_token TEXT PRIMARY KEY, expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE living_works (
  id UUID PRIMARY KEY, member_id UUID NOT NULL REFERENCES members(id),
  title TEXT, purpose TEXT, form TEXT, stage TEXT,
  manuscript_state TEXT, created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE living_work_expressions (
  living_work_id UUID NOT NULL REFERENCES living_works(id),
  expression_type TEXT NOT NULL, expression_id UUID NOT NULL,
  declared_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE living_work_materials (
  living_work_id UUID NOT NULL REFERENCES living_works(id),
  material_type TEXT NOT NULL, material_id UUID NOT NULL,
  relationship_sentence TEXT, declared_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE house_member_preferences (
  member_id UUID PRIMARY KEY REFERENCES members(id), version INTEGER NOT NULL DEFAULT 1,
  center_ids TEXT[], shortcut_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  passing_through BOOLEAN, revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE member_manuscripts (
  id UUID PRIMARY KEY, member_id UUID NOT NULL REFERENCES members(id),
  title TEXT, created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE manuscript_sections (
  id UUID PRIMARY KEY, manuscript_id UUID NOT NULL REFERENCES member_manuscripts(id),
  position INTEGER NOT NULL, heading TEXT, heading_depth INTEGER,
  heading_signal TEXT, body TEXT NOT NULL DEFAULT ''
);
CREATE TABLE manuscript_keeps (
  id UUID PRIMARY KEY, manuscript_id UUID NOT NULL REFERENCES member_manuscripts(id),
  member_id UUID NOT NULL REFERENCES members(id), verbatim_text TEXT
);
CREATE TABLE manuscript_working_drafts (
  id UUID PRIMARY KEY, manuscript_id UUID NOT NULL REFERENCES member_manuscripts(id),
  member_id UUID NOT NULL REFERENCES members(id),
  content TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
  section_addressable_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE manuscript_draft_sections (
  id UUID PRIMARY KEY, draft_id UUID NOT NULL REFERENCES manuscript_working_drafts(id),
  position INTEGER NOT NULL, text TEXT NOT NULL,
  source_section_id UUID REFERENCES manuscript_sections(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE working_draft_revisions (
  id UUID PRIMARY KEY, draft_id UUID NOT NULL REFERENCES manuscript_working_drafts(id),
  revision_number INTEGER NOT NULL, content TEXT NOT NULL,
  saved_by UUID REFERENCES members(id), note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(draft_id, revision_number)
);
INSERT INTO members(id,username,name,tier,roles) VALUES
 ('11111111-1111-4111-8111-111111111111','fictional_writer_a','Fictional Writer A','free',ARRAY['member']),
 ('22222222-2222-4222-8222-222222222222','fictional_writer_b','Fictional Writer B','free',ARRAY['member']);
INSERT INTO auth_sessions(member_id,session_token,expires_at) VALUES
 ('11111111-1111-4111-8111-111111111111','FWE01_FICTIONAL_A_SESSION',now()+interval '2 hours'),
 ('22222222-2222-4222-8222-222222222222','FWE01_FICTIONAL_B_SESSION',now()+interval '2 hours');
INSERT INTO living_works(id,member_id,title,purpose) VALUES
 ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','An entirely fictional book','Testing author-owned return');
INSERT INTO member_manuscripts(id,member_id,title) VALUES
 ('44444444-4444-4444-8444-444444444444','11111111-1111-4111-8111-111111111111','Fictional Manuscript');
INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id) VALUES
 ('33333333-3333-4333-8333-333333333333','manuscript','44444444-4444-4444-8444-444444444444');
INSERT INTO manuscript_working_drafts(id,manuscript_id,member_id,content,version,section_addressable_at) VALUES
 ('55555555-5555-4555-8555-555555555555',
  '44444444-4444-4444-8444-444444444444',
  '11111111-1111-4111-8111-111111111111',
  'A fictional opening passage.',1,now());
INSERT INTO manuscript_draft_sections(id,draft_id,position,text,source_section_id) VALUES
 ('66666666-6666-4666-8666-666666666666',
  '55555555-5555-4555-8555-555555555555',
  0,'A fictional opening passage.',NULL);
INSERT INTO working_draft_revisions(id,draft_id,revision_number,content,saved_by,note) VALUES
 ('77777777-7777-4777-8777-777777777777',
  '55555555-5555-4555-8555-555555555555',
  1,'A fictional opening passage.','11111111-1111-4111-8111-111111111111',
  'Synthetic baseline only');
