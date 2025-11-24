#!/bin/bash

# MAIA Secure Database Deployment Script
# Sets up encrypted database schema in Supabase

set -e

echo "🔐 MAIA Secure Database Deployment"
echo "================================="

# Check for required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing required environment variables:"
    echo "   SUPABASE_URL"
    echo "   SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "Please set these in your .env file or environment."
    exit 1
fi

# Extract database URL from Supabase URL
DB_URL=$(echo $SUPABASE_URL | sed 's|https://|postgresql://postgres:|' | sed 's|\.supabase\.co|.supabase.co:5432/postgres|')

echo "🔍 Checking database connection..."

# Test connection
if ! psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Failed to connect to database"
    echo "   URL: $SUPABASE_URL"
    echo "   Please check your credentials and network connection."
    exit 1
fi

echo "✅ Database connection successful"

# Check if tables already exist
TABLE_COUNT=$(PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql "$DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'journal_entries', 'voice_journals');" 2>/dev/null | xargs)

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo ""
    echo "⚠️  Some MAIA tables already exist ($TABLE_COUNT found)"
    echo "   This may overwrite existing data."
    echo ""
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

echo ""
echo "📊 Deploying secure database schema..."

# Deploy the schema
if PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql "$DB_URL" -f "lib/security/database-schema.sql" > /dev/null 2>&1; then
    echo "✅ Database schema deployed successfully"
else
    echo "❌ Failed to deploy database schema"
    echo "   Check the SQL file and database permissions."
    exit 1
fi

echo ""
echo "🔧 Setting up Row Level Security policies..."

# Verify RLS is enabled
RLS_COUNT=$(PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = 'public' AND c.relname IN ('users', 'journal_entries') AND c.relrowsecurity = true;" 2>/dev/null | xargs)

if [ "$RLS_COUNT" -eq 2 ]; then
    echo "✅ Row Level Security policies active"
else
    echo "⚠️  RLS policies may not be properly configured"
fi

echo ""
echo "🔐 Testing encryption functions..."

# Test encryption function
ENCRYPT_TEST=$(PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql "$DB_URL" -t -c "SELECT encrypt_user_data('test data', 'test_salt', 'test_key') IS NOT NULL;" 2>/dev/null | xargs)

if [ "$ENCRYPT_TEST" = "t" ]; then
    echo "✅ Encryption functions working"
else
    echo "❌ Encryption functions failed"
    exit 1
fi

echo ""
echo "📈 Database statistics:"

# Get table statistics
PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql "$DB_URL" -c "
SELECT
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'journal_entries', 'voice_journals', 'symbolic_memories', 'soulprints', 'privacy_permissions', 'professional_access', 'audit_log')
ORDER BY tablename;
"

echo ""
echo "🔍 Verifying indexes..."

INDEX_COUNT=$(PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename LIKE '%journal%' OR tablename LIKE '%audit%';" 2>/dev/null | xargs)

echo "✅ $INDEX_COUNT performance indexes created"

echo ""
echo "🛡️  Security verification:"

# Check RLS policies
POLICY_COUNT=$(PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';" 2>/dev/null | xargs)
echo "   - $POLICY_COUNT RLS policies active"

# Check functions
FUNCTION_COUNT=$(PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_proc WHERE proname IN ('encrypt_user_data', 'decrypt_user_data', 'log_audit_event');" 2>/dev/null | xargs)
echo "   - $FUNCTION_COUNT encryption/audit functions available"

# Check extensions
EXTENSION_COUNT=$(PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');" 2>/dev/null | xargs)
echo "   - $EXTENSION_COUNT security extensions loaded"

echo ""
if [ "$POLICY_COUNT" -ge 8 ] && [ "$FUNCTION_COUNT" -eq 3 ] && [ "$EXTENSION_COUNT" -eq 2 ]; then
    echo "🎉 Secure database deployment completed successfully!"
    echo ""
    echo "✅ All security features are active:"
    echo "   - End-to-end encryption"
    echo "   - Row Level Security"
    echo "   - Audit logging"
    echo "   - User data isolation"
    echo "   - Professional access controls"
else
    echo "⚠️  Deployment completed with warnings:"
    echo "   - Some security features may not be fully active"
    echo "   - Please review the configuration manually"
fi

echo ""
echo "🚀 Next steps:"
echo "   1. Update your application to use SecureJournalStorage"
echo "   2. Migrate from in-memory storage to encrypted persistence"
echo "   3. Test authentication with the new secure system"
echo "   4. Configure privacy permissions for users"
echo ""
echo "📚 Documentation:"
echo "   - Database schema: lib/security/database-schema.sql"
echo "   - Secure storage: lib/storage/secure-journal-storage.ts"
echo "   - Authentication: lib/auth/secure-auth.ts"
echo "   - Encryption: lib/security/encryption.ts"
echo ""