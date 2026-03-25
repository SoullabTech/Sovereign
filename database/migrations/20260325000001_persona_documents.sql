-- persona_documents: source materials uploaded by masters to train their Virtual Self.
-- Part of the federated master fields architecture (docs/architecture/federated-master-fields.md).

create table if not exists persona_documents (
  id uuid primary key default gen_random_uuid(),

  practitioner_id uuid not null,
  persona_id uuid not null,

  title text not null,
  source_type text not null check (source_type in ('transcript', 'book', 'class', 'notes')),
  format text not null check (format in ('pdf', 'txt', 'md')),

  original_filename text not null,
  storage_path text not null,

  raw_content text,
  content_chars integer not null default 0,

  method_extractions jsonb,
  perception_extractions jsonb,
  voice_extractions jsonb,

  processing_status text not null default 'pending'
    check (processing_status in ('pending', 'extracting', 'complete', 'failed')),

  processing_error text,

  source_tier text not null default 'primary'
    check (source_tier in ('primary', 'secondary', 'reference')),

  extracted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_persona_documents_practitioner_id
  on persona_documents (practitioner_id);

create index if not exists idx_persona_documents_persona_id
  on persona_documents (persona_id);

create index if not exists idx_persona_documents_processing_status
  on persona_documents (processing_status);

create index if not exists idx_persona_documents_created_at
  on persona_documents (created_at desc);

-- Auto-update updated_at on row modification
create or replace function set_persona_documents_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_persona_documents_updated_at on persona_documents;

create trigger trg_persona_documents_updated_at
before update on persona_documents
for each row
execute function set_persona_documents_updated_at();
