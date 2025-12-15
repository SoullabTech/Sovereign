# Journal Setup Instructions

## Option 1: Quick Setup (Without Supabase)
The journal already works! It saves to your browser's local storage automatically. No setup needed.

## Option 2: With Supabase (For Persistent Storage)

### If you have Supabase set up:

1. **Find your Supabase project URL**
   - Go to https://app.supabase.com
   - Click on your project
   - Look for the URL (something like: https://xxxxx.supabase.co)

2. **Go to SQL Editor**
   - In your Supabase dashboard, find "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste this SQL:**

```sql
-- Beta Journal Entries Table
CREATE TABLE IF NOT EXISTS beta_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  explorer_id TEXT NOT NULL,
  explorer_name TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt TEXT,
  word_count INT GENERATED ALWAYS AS (array_length(string_to_array(trim(content), ' '), 1)) STORED,
  session_id TEXT,
  message_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_beta_journal_explorer ON beta_journal_entries(explorer_id, created_at DESC);
CREATE INDEX idx_beta_journal_session ON beta_journal_entries(session_id);
CREATE INDEX idx_beta_journal_created ON beta_journal_entries(created_at DESC);

-- Grant permissions
GRANT ALL ON beta_journal_entries TO authenticated;
GRANT ALL ON beta_journal_entries TO anon;
```

4. **Click "Run" button**
   - You should see "Success" message

5. **Verify it worked**
   - Go to "Table Editor" in sidebar
   - You should see `beta_journal_entries` table

### If you DON'T have Supabase:

**That's fine!** The journal will work perfectly with just local storage. Your journal entries will be saved in your browser.

## Testing the Journal

1. Go to your Maya interface
2. Click the journal icon (📖) in the header
3. Write a reflection
4. Click "Save Reflection"

Your entries are being saved locally even without Supabase!

## Checking Your Journal Entries

### Local Storage (Always Works)
Open browser console (F12) and type:
```javascript
JSON.parse(localStorage.getItem('maya-journal'))
```

### Supabase (If Set Up)
Go to Table Editor > beta_journal_entries in your Supabase dashboard

---

**Note:** The journal works great without Supabase. Supabase just adds the ability to see all explorers' journals in one place for your beta analytics.