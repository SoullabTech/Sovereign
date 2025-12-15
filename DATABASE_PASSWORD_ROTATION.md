# Database Password Rotation Guide

## ⚠️ CRITICAL SECURITY ISSUE

**Issue Identified**: Database password was exposed in git history (from previous conversation session)

**Risk Level**: HIGH
**Action Required**: IMMEDIATE password rotation
**Estimated Time**: 30 minutes

---

## Why This Matters

When database credentials are committed to git history, they become permanently accessible even after being removed from current files. Anyone with access to the repository history can retrieve the password and potentially access the database.

**Impact**:
- Unauthorized access to user data
- Potential data breach
- Compliance violations (GDPR, CCPA)
- Reputational damage

---

## Pre-Rotation Checklist

Before rotating the password, ensure you have:

- [ ] Direct access to PostgreSQL database server
- [ ] Admin/superuser credentials for PostgreSQL
- [ ] List of all applications/services using this database
- [ ] Ability to update environment variables in production
- [ ] Backup of current database (just in case)
- [ ] Maintenance window scheduled (or ability to handle brief downtime)

---

## Step 1: Generate New Password

Create a strong, secure password:

```bash
# Option A: Generate cryptographically secure password (recommended)
openssl rand -base64 32

# Option B: Use password generator
# Install: brew install pwgen
pwgen -s 32 1

# Option C: Use 1Password or LastPass generator
```

**Password Requirements**:
- Minimum 24 characters
- Mix of uppercase, lowercase, numbers, special characters
- No dictionary words
- Not reused from other services

**Save the new password securely** in 1Password or equivalent password manager.

---

## Step 2: Identify All Database Connection Points

Find all places where the current password is used:

```bash
# Search for database connection strings in codebase
grep -r "DATABASE_PASSWORD" .
grep -r "POSTGRES_PASSWORD" .
grep -r "SUPABASE_PASSWORD" .

# Check .env files (these should NOT be in git)
ls -la .env*

# Common locations:
# - .env.local (local development)
# - .env.production (production env vars)
# - Vercel environment variables (if using Vercel)
# - Supabase dashboard (if using Supabase managed DB)
# - Docker compose files
# - Kubernetes secrets
```

**Create a checklist of all locations** found.

---

## Step 3: Update PostgreSQL User Password

### If Using Supabase:

1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to Settings → Database
4. Click "Reset Database Password"
5. Enter the new password generated in Step 1
6. Confirm the reset
7. **IMPORTANT**: Save the new connection string provided

### If Using Self-Hosted PostgreSQL:

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Or if using specific database:
psql -U postgres -d maia_sovereign

# Change password for the application user
ALTER USER maia_user WITH PASSWORD 'YOUR_NEW_PASSWORD_HERE';

# Verify the change
\du

# Exit psql
\q
```

Replace:
- `maia_user` with your actual database username
- `YOUR_NEW_PASSWORD_HERE` with the password from Step 1

---

## Step 4: Update Environment Variables

### Local Development (.env.local)

```bash
# Edit .env.local
nano .env.local

# Or use your preferred editor
code .env.local
```

Update the following variables:
```env
# PostgreSQL Direct Connection
DATABASE_PASSWORD=your_new_password_here
POSTGRES_PASSWORD=your_new_password_here

# Or full connection string format
DATABASE_URL=postgresql://maia_user:your_new_password_here@localhost:5432/maia_sovereign

# Supabase format (if using Supabase)
SUPABASE_DB_PASSWORD=your_new_password_here
```

**VERIFY** that .env.local is in .gitignore:
```bash
grep -E "^\.env" .gitignore
# Should show: .env, .env.local, .env*.local, etc.
```

### Production Environment (Vercel)

If deploying to Vercel:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Update environment variable
vercel env rm DATABASE_PASSWORD production
vercel env add DATABASE_PASSWORD production
# Paste new password when prompted

# Or update via Vercel Dashboard:
# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Settings → Environment Variables
# 4. Find DATABASE_PASSWORD → Edit → Update → Save
```

### Other Hosting Platforms

**Netlify**:
- Dashboard → Site settings → Environment variables
- Update DATABASE_PASSWORD

**Railway**:
- Dashboard → Variables tab
- Update DATABASE_PASSWORD

**Docker/Docker Compose**:
```bash
# Edit docker-compose.yml or .env file used by compose
nano docker-compose.yml

# Update POSTGRES_PASSWORD in environment section
environment:
  POSTGRES_PASSWORD: your_new_password_here

# Restart containers
docker-compose down
docker-compose up -d
```

**Kubernetes**:
```bash
# Update secret
kubectl create secret generic db-credentials \
  --from-literal=password='your_new_password_here' \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart affected pods
kubectl rollout restart deployment/maia-app
```

---

## Step 5: Update Application Code (if needed)

**Check if any code hardcodes credentials**:

```bash
# Search for hardcoded passwords (should return nothing!)
grep -r "password.*=" --include="*.ts" --include="*.js" .
grep -r "maia_dev_password" .
```

If found, **remove hardcoded credentials immediately** and use environment variables:

```typescript
// BAD - DO NOT DO THIS
const password = 'maia_dev_password';

// GOOD - Use environment variables
const password = process.env.DATABASE_PASSWORD;
```

---

## Step 6: Test Database Connection

### Test Local Connection

```bash
# Test PostgreSQL connection with new password
PGPASSWORD=your_new_password_here psql -U maia_user -d maia_sovereign -c "SELECT 1;"

# Should return:
#  ?column?
# ----------
#         1
# (1 row)
```

### Test Application Connection

```bash
# Start development server
npm run dev

# Check logs for database connection errors
# Look for successful connection or error messages

# Test a database-dependent feature (e.g., login, data fetch)
```

### Test Production Connection

```bash
# If using Vercel, redeploy with new env vars
vercel --prod

# Check deployment logs
vercel logs --follow

# Test production app functionality
curl https://your-app.vercel.app/api/health
```

---

## Step 7: Update Pool Configuration (MAIA-Specific)

Since MAIA has a centralized database pool in `lib/database/pool.ts`:

```bash
# Read current pool configuration
cat lib/database/pool.ts
```

**Verify it's using environment variables** (should look like this):

```typescript
import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD, // ✅ Uses env var
  port: parseInt(process.env.DATABASE_PORT || '5432'),
});
```

If it's **not** using environment variables, update it:

```typescript
// Create lib/database/pool.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
```

---

## Step 8: Verify All Services

Create a checklist and test each service:

- [ ] Web application (Next.js dev server)
- [ ] API routes (`/api/*`)
- [ ] Background jobs (if any)
- [ ] Database migrations
- [ ] Learning services (conversationTurnService, goldResponseService, etc.)
- [ ] Authentication (Supabase Auth)

**Test each one** to ensure database connectivity works:

```bash
# Run any database-dependent tests
npm test -- --grep database

# Or run full test suite
npm test
```

---

## Step 9: Clean Git History (Optional but Recommended)

**WARNING**: This is a destructive operation. Only do this if:
- You have full control over the repository
- All collaborators are aware and coordinated
- You have backups

### Option A: BFG Repo-Cleaner (Recommended)

```bash
# Install BFG
brew install bfg

# Clone a fresh copy of the repo
git clone --mirror git@github.com:yourusername/MAIA-SOVEREIGN.git

# Remove password from history
cd MAIA-SOVEREIGN.git
bfg --replace-text passwords.txt

# Create passwords.txt with:
# maia_dev_password==>REDACTED

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: Destructive!)
git push --force
```

### Option B: Rotate and Move Forward

If cleaning git history is too risky:

1. ✅ Rotate password (Steps 1-8 above)
2. ✅ Document the incident
3. ✅ Monitor for unauthorized access
4. ⚠️ Assume the old password is compromised
5. ✅ Add additional security layers (IP allowlisting, 2FA)

---

## Step 10: Add Additional Security Layers

### PostgreSQL IP Allowlisting

```sql
-- Connect as superuser
psql -U postgres

-- Check current pg_hba.conf rules
SHOW hba_file;

-- Edit pg_hba.conf (location from above command)
-- Change from:
# host    all    all    0.0.0.0/0    md5

-- To specific IPs only:
# host    all    all    YOUR_SERVER_IP/32    md5
# host    all    all    YOUR_OFFICE_IP/32    md5

-- Reload PostgreSQL config
SELECT pg_reload_conf();
```

### Enable Database Audit Logging

```sql
-- Enable connection logging
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';

-- Log all queries (for investigation period)
ALTER SYSTEM SET log_statement = 'all';

-- Reload config
SELECT pg_reload_conf();

-- Monitor logs
tail -f /var/log/postgresql/postgresql-*.log
```

### Use Connection Pooling with Authentication

If using Supabase:
- Enable Row Level Security (RLS) on all tables
- Use service_role key only for admin operations
- Use anon/authenticated keys for client operations

---

## Step 11: Post-Rotation Monitoring

Monitor for the next 7 days:

### Database Access Logs

```bash
# Check for failed login attempts (old password)
grep "password authentication failed" /var/log/postgresql/*.log

# Check for successful logins from unexpected IPs
grep "connection authorized" /var/log/postgresql/*.log | grep -v "YOUR_KNOWN_IPS"
```

### Application Error Logs

```bash
# Check Vercel logs for database connection errors
vercel logs --since 24h | grep -i "database\|password\|authentication"

# Check local logs
npm run dev 2>&1 | grep -i "database\|password\|authentication"
```

### Supabase Dashboard Monitoring

If using Supabase:
1. Go to Dashboard → Logs
2. Check for unusual query patterns
3. Monitor connection count

---

## Completion Checklist

Before marking this task complete, verify:

- [ ] New password generated and stored securely
- [ ] PostgreSQL user password updated
- [ ] .env.local updated with new password
- [ ] Production environment variables updated
- [ ] All deployment platforms updated
- [ ] Database connection tested locally
- [ ] Database connection tested in production
- [ ] All application features tested
- [ ] No hardcoded credentials in code
- [ ] .env files confirmed in .gitignore
- [ ] Monitoring enabled for next 7 days
- [ ] Old password documented as compromised
- [ ] Incident logged for security audit trail

---

## Rollback Plan (If Something Goes Wrong)

If you need to rollback:

1. **Revert PostgreSQL password**:
```sql
ALTER USER maia_user WITH PASSWORD 'old_password_here';
```

2. **Revert environment variables** to old values

3. **Redeploy** applications

4. **Investigate** what went wrong before retrying

---

## MAIA-Specific Notes

### Current Database Setup

Based on the codebase:
- Database pool: `lib/database/pool.ts`
- Services using pool:
  - `lib/learning/conversationTurnService.ts`
  - `lib/learning/goldResponseService.ts`
  - `lib/learning/interactionFeedbackService.ts`
  - `lib/learning/misattunementTrackingService.ts`
  - `lib/learning/engineComparisonService.ts`

### Environment Variables Used

```env
# Core database connection (if using PostgreSQL directly)
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=maia_sovereign
DATABASE_USER=maia_user
DATABASE_PASSWORD=<NEEDS ROTATION>

# Supabase (if using Supabase managed DB)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
SUPABASE_DB_PASSWORD=<NEEDS ROTATION>
```

---

## Timeline

**Total Estimated Time**: 30-60 minutes

- Step 1 (Generate password): 2 minutes
- Step 2 (Identify locations): 5 minutes
- Step 3 (Update PostgreSQL): 5 minutes
- Step 4 (Update env vars): 10 minutes
- Step 5 (Check code): 5 minutes
- Step 6 (Test connections): 10 minutes
- Step 7 (Update pool config): 5 minutes
- Step 8 (Verify services): 10 minutes
- Step 9 (Git cleanup): 30 minutes (optional)
- Step 10 (Additional security): 15 minutes (optional)
- Step 11 (Setup monitoring): 10 minutes

---

## Next Actions

**IMMEDIATE**:
1. Generate new password
2. Update PostgreSQL user
3. Update .env.local
4. Test local connection

**BEFORE PRODUCTION DEPLOY**:
5. Update production environment variables
6. Test in staging environment (if available)
7. Deploy to production
8. Verify production functionality

**ONGOING**:
9. Monitor logs for 7 days
10. Review security practices
11. Document incident for audit trail

---

**Status**: Documentation Complete ✅
**Action Required**: User must execute rotation steps
**Priority**: HIGH (Security Issue)
**Blocker**: Must complete before production launch
