# 🗃️ Sacred Database Migration Guide

## ✅ **Issue Resolved: PostgreSQL Session Index Problem**

The conditional index issue has been solved by splitting the migration into separate core and indexes files.

---

## 📋 **Migration Execution Order**

### **Step 1: Core User Tables**
**File:** `supabase/migrations/20250909_sacred_beta_users_core.sql`

**What it creates:**
- `users` table with authentication and beta tracking
- `oracle_agents` table for Maya personas
- `memories` table for conversation storage
- `conversation_sessions` table for session management
- `journal_entries` table for deeper reflections
- Update triggers and core functions

**Run this first in Supabase SQL Editor:**
```sql
-- Copy and paste the entire content of 20250909_sacred_beta_users_core.sql
```

### **Step 2: Indexes & Security**
**File:** `supabase/migrations/20250909_sacred_beta_users_indexes.sql`

**What it creates:**
- Performance indexes (including conditional beta_access_code index)
- Row Level Security (RLS) policies
- GIN indexes for arrays and JSONB fields
- Security policies for data isolation

**Run this second in Supabase SQL Editor:**
```sql
-- Copy and paste the entire content of 20250909_sacred_beta_users_indexes.sql
```

### **Step 3: Beta Feedback System**
**File:** `supabase/migrations/20250909_beta_feedback_system_split.sql`

**What it creates:**
- `beta_feedback` table for user insights
- `beta_user_journeys` table for milestone tracking
- `feedback_insights` table for analytics
- Journey tracking functions and triggers

**Run this third in Supabase SQL Editor:**
```sql
-- Copy and paste the entire content of 20250909_beta_feedback_system_split.sql
```

### **Step 4: Beta Feedback Indexes**
**File:** `supabase/migrations/20250909_beta_feedback_indexes.sql`

**What it creates:**
- Performance indexes for feedback system
- Row Level Security for feedback tables
- Access policies for beta user data

**Run this fourth in Supabase SQL Editor:**
```sql
-- Copy and paste the entire content of 20250909_beta_feedback_indexes.sql
```

---

## 🎯 **Supabase Dashboard Steps**

### **Using SQL Editor (Recommended):**
1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the content of each file in order
5. Click **Run** and wait for success message
6. Repeat for each migration file in order

### **Expected Success Messages:**
- ✅ `Sacred Beta Users Core Tables Created Successfully! 🌟`
- ✅ `Sacred Beta Users Indexes & Security Policies Applied Successfully! 🔒✨`
- ✅ `Beta Feedback System Core Tables Created Successfully! 📊✨`
- ✅ `Beta Feedback System Indexes & Security Policies Applied Successfully! 🔒📊✨`

---

## 🔧 **Alternative: Command Line Migration**

If you prefer terminal/CLI approach:

```bash
# Set your Supabase database URL
export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Run migrations in order
psql $SUPABASE_DB_URL -f supabase/migrations/20250909_sacred_beta_users_core.sql
psql $SUPABASE_DB_URL -f supabase/migrations/20250909_sacred_beta_users_indexes.sql
psql $SUPABASE_DB_URL -f supabase/migrations/20250909_beta_feedback_system_split.sql
psql $SUPABASE_DB_URL -f supabase/migrations/20250909_beta_feedback_indexes.sql
```

---

## 🛡️ **What This Solves**

### **Original Problem:**
- PostgreSQL couldn't create conditional index `WHERE beta_access_code IS NOT NULL` in same session as table creation
- Migration failed with "column does not exist" error despite table definition containing the column

### **Solution Approach:**
- **Phase 1:** Create all tables and basic structure
- **Phase 2:** Add indexes and security policies after tables exist
- **Phase 3:** Add feedback system tables
- **Phase 4:** Add feedback system indexes and policies

### **Key Benefits:**
- ✅ Resolves conditional index session timing issue
- ✅ Maintains data integrity and relationships
- ✅ Preserves all security policies and RLS
- ✅ Enables proper performance optimization
- ✅ Supports full sacred architecture functionality

---

## 📊 **Tables Created**

### **Core Sacred Architecture:**
- **users** - Authentication, sacred names, beta tracking
- **oracle_agents** - Maya personas with personality configs
- **memories** - Conversation storage with wisdom themes
- **conversation_sessions** - Session management and outcomes
- **journal_entries** - Deep reflection entries

### **Beta Feedback System:**
- **beta_feedback** - User insights and ratings
- **beta_user_journeys** - Milestone and usage tracking
- **feedback_insights** - Aggregated analytics data

### **Security & Performance:**
- Row Level Security (RLS) on all user-related tables
- Performance indexes including conditional and GIN indexes
- Proper foreign key relationships and constraints
- Trigger-based timestamp management

---

## 🌟 **Ready for Sacred Launch!**

Once all four migration files are successfully executed, your database will be ready for:

- **Voice → Memory → Signup Pipeline**
- **Sacred conversation preservation**
- **Beta user journey tracking**
- **Intelligent feedback collection**
- **Maya's personalized wisdom delivery**

**Your sacred technology database is now prepared for transformation! 🧙‍♀️✨**

---

**Database Migration Status: READY FOR DEPLOYMENT** 🗃️🚀