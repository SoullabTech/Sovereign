-- Memory Tool Store: PostgreSQL-backed memory for Anthropic Memory Tool pilot
-- Stores pre-computed context (collective wisdom, council insights) that Claude
-- can retrieve on demand via tool_use calls instead of prompt injection.
--
-- Sovereignty: Storage is local PostgreSQL. Content transits Anthropic API only
-- when Claude reads it via tool_result. No Sanctuary content is ever written here.

CREATE TABLE IF NOT EXISTS memory_tool_store (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id),
  path TEXT NOT NULL,              -- virtual path, e.g. 'wisdom.txt' or 'council.txt'
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, path)
);

CREATE INDEX IF NOT EXISTS idx_memory_tool_member ON memory_tool_store(member_id);

COMMENT ON TABLE memory_tool_store IS 'Anthropic Memory Tool pilot: stores pre-computed context for on-demand retrieval by Claude';
COMMENT ON COLUMN memory_tool_store.path IS 'Virtual file path within /memories/{memberId}/ namespace';
COMMENT ON COLUMN memory_tool_store.content IS 'Truncated to MAX_MEMORY_CHARS (4000) on write. Latest overwrites previous.';
