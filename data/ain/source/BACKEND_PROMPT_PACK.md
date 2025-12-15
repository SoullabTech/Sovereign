# 🔧 Sacred Mirror Beta — Backend Prompt Pack

Complete backend implementation prompts for SpiralogicOracleSystem's Sacred Mirror features.

---

## **Phase 2 (Backend): File Upload API**

**Goal:** Accept file uploads and store them as journal entries.

**Claude Prompt:**

```
You are a TypeScript/Node backend expert.
Task: Implement file upload API for SpiralogicOracleSystem.

1. File: backend/src/api/journal/upload.ts
2. Accept multipart/form-data with fields:
   - file (txt, docx, pdf)
   - userId (string)
3. Parse text from file (use pdf-parse, mammoth for docx, plain read for txt).
4. Save parsed text as new Journal entry in Supabase:
   - table: journals
   - columns: id, user_id, content, type ("upload"), created_at
5. Return JSON { success: true, journalId }

Constraints:
- Use zod for input validation.
- Use Supabase client already configured in backend/src/config/supabase.ts
- Complete, ready-to-paste code.
```

---

## **Phase 3 (Backend): Journal Creation API**

**Goal:** Allow journal creation from text input.

**Claude Prompt:**

```
You are working in SpiralogicOracleSystem backend.
Task: Implement journal creation API.

1. File: backend/src/api/journal/create.ts
2. Accept JSON body:
   - userId: string
   - content: string
   - type: "journal"
3. Validate with zod schema.
4. Insert into Supabase table journals.
5. Return JSON { success: true, journalId, content }

Constraints:
- Use async/await, not .then
- Error handling: return { success: false, error }
- Provide complete file code.
```

---

## **Phase 4 (Backend): Elemental Metadata**

**Goal:** Store elemental lens with each chat/journal.

**Claude Prompt:**

```
You are extending SpiralogicOracleSystem backend.
Task: Add elemental metadata to journals and chat messages.

1. Update Supabase schema:
   ALTER TABLE journals ADD COLUMN element text DEFAULT 'aether';
   ALTER TABLE chat_messages ADD COLUMN element text DEFAULT 'aether';

2. File: backend/src/api/journal/create.ts
   - Accept element in body (one of: air, fire, water, earth, aether).
   - Save it in journals table.

3. File: backend/src/api/chat/send.ts
   - Accept element in body.
   - Save it in chat_messages table.
   - Forward element metadata to AI request (attach in system prompt: "User is in the {element} state.")

Constraints:
- Use zod for validation (enum for elements).
- Provide migration SQL separately and updated API code.
```

---

## **Phase 5 (Backend): Auth Enforcement**

**Goal:** Ensure journal and chat APIs are tied to authenticated user.

**Claude Prompt:**

```
You are adding authentication to SpiralogicOracleSystem backend APIs.
Task: Protect journal and chat routes with Supabase auth.

1. Wrap API handlers with verifyAuth(req) middleware (already in backend/lib/auth.ts).
2. Ensure userId is taken from verified token, not from request body.
3. On unauthorized, return 401 { success: false, error: "Unauthorized" }.
4. Update journal/create.ts, journal/upload.ts, and chat/send.ts accordingly.

Constraints:
- Provide complete updated files for each API.
- No placeholders.
```

---

## ⚡ Backend Priority Order

1. **File Upload API** → unlocks Journal upload button.
2. **Journal Creation API** → text entries from Memory Garden.
3. **Elemental Metadata** → ties core Spiralogic flavor into data layer.
4. **Auth Enforcement** → secures everything for real users.

---

## 📊 Supabase Schema Migrations

### Initial Journal Schema

```sql
-- Create journals table
CREATE TABLE IF NOT EXISTS journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'journal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user queries
CREATE INDEX idx_journals_user_id ON journals(user_id);

-- Enable Row Level Security
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own journals
CREATE POLICY "Users can manage their own journals" ON journals
  FOR ALL USING (auth.uid() = user_id);
```

### Elemental Metadata Migration

```sql
-- Add element column to journals
ALTER TABLE journals 
ADD COLUMN IF NOT EXISTS element TEXT DEFAULT 'aether' 
CHECK (element IN ('air', 'fire', 'water', 'earth', 'aether'));

-- Add element column to chat_messages (if table exists)
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS element TEXT DEFAULT 'aether' 
CHECK (element IN ('air', 'fire', 'water', 'earth', 'aether'));
```

### Additional Metadata Fields (Optional)

```sql
-- Add metadata for enhanced journaling
ALTER TABLE journals 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Add full-text search
ALTER TABLE journals 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

CREATE INDEX idx_journals_search ON journals USING GIN(search_vector);
```

---

## 🔐 Environment Variables

Ensure these are set in your `.env.local`:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

---

## 📦 Required NPM Packages

For backend file parsing:

```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.22.4"
  }
}
```

---

## 🧪 Test Endpoints

### Upload File
```bash
curl -X POST http://localhost:3000/api/journal/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "userId=USER_ID"
```

### Create Journal
```bash
curl -X POST http://localhost:3000/api/journal/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Today I reflected on...",
    "type": "journal",
    "element": "water"
  }'
```

---

This backend prompt pack complements the frontend pack to create a complete Sacred Mirror implementation.