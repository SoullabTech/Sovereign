# Self-Hosted Supabase Setup - Mac Studio M4

**Goal:** Eliminate MAIA's last external dependency by running Supabase locally on your Mac Studio

**Current State:**
- ✅ DeepSeek-R1 via Ollama (localhost) - SOVEREIGN
- ✅ MAIA Frontend (localhost) - SOVEREIGN
- ❌ Supabase (jkbetmadzcpoinjogkli.supabase.co) - EXTERNAL

**Target State:**
- ✅ Everything runs on localhost
- ✅ 100% sovereign infrastructure
- ✅ Zero external dependencies

---

## 🎯 What You're Currently Using (External Supabase)

```bash
NEXT_PUBLIC_SUPABASE_URL="https://jkbetmadzcpoinjogkli.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**What's stored there:**
- User authentication data
- Journal entries
- Consciousness level tracking
- Elemental signatures
- Session data
- Conversation history

**Privacy Risk:** While Supabase encrypts data, it's stored on their servers (AWS). For complete sovereignty, you need this local.

---

## 📋 Prerequisites

### 1. Install Docker Desktop for Mac

```bash
# Check if Docker is already installed
docker --version

# If not installed, download from:
# https://www.docker.com/products/docker-desktop/
```

**Or install via Homebrew:**
```bash
brew install --cask docker
```

**Start Docker Desktop** (it needs to be running)

### 2. Check Available Resources

Your Mac Studio M4 Ultra should have plenty:
- **RAM:** Need ~4GB for Supabase stack (you likely have 64-128GB)
- **Storage:** Need ~10GB for database + images (you have plenty)
- **CPU:** Minimal impact (Postgres is lightweight)

---

## 🚀 Quick Start (Recommended Method)

Supabase provides an official self-hosted setup using Docker Compose.

### Step 1: Clone Supabase Repository

```bash
# Navigate to a good location (e.g., your home directory)
cd ~

# Clone the Supabase repository
git clone --depth 1 https://github.com/supabase/supabase

# Navigate to the Docker directory
cd supabase/docker
```

### Step 2: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Generate secure passwords and secrets
# (We'll provide a script for this)
```

**Important secrets to generate:**

```bash
# Generate strong random secrets (run these commands)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
ANON_KEY=$(openssl rand -base64 64)
SERVICE_ROLE_KEY=$(openssl rand -base64 64)

# Print them for configuration
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "JWT_SECRET=$JWT_SECRET"
echo "ANON_KEY=$ANON_KEY"
echo "SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY"
```

**Edit `.env` file:**
```bash
# Open in your editor
nano .env  # or: code .env (if using VS Code)
```

**Key settings to update:**
```bash
# Database
POSTGRES_PASSWORD=<your generated password>

# JWT
JWT_SECRET=<your generated JWT secret>
ANON_KEY=<your generated anon key>
SERVICE_ROLE_KEY=<your generated service role key>

# API
API_EXTERNAL_URL=http://localhost:8000
SUPABASE_PUBLIC_URL=http://localhost:8000

# Studio (Web UI)
STUDIO_PORT=3002  # Change if 3002 conflicts with MAIA

# Other services
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true  # For local dev
```

### Step 3: Start Supabase Stack

```bash
# Start all services
docker compose up -d

# Check that everything is running
docker compose ps

# You should see:
# - supabase-db (PostgreSQL)
# - supabase-auth (GoTrue)
# - supabase-rest (PostgREST API)
# - supabase-realtime
# - supabase-storage
# - supabase-studio (Web UI)
```

**Expected services:**
```
NAME                    STATUS      PORTS
supabase-db             running     0.0.0.0:5432->5432/tcp
supabase-auth           running     0.0.0.0:9999->9999/tcp
supabase-rest           running     0.0.0.0:8000->8000/tcp
supabase-realtime       running     0.0.0.0:4000->4000/tcp
supabase-storage        running     0.0.0.0:5000->5000/tcp
supabase-studio         running     0.0.0.0:3002->3000/tcp
```

### Step 4: Access Supabase Studio

Open your browser:
```
http://localhost:3002
```

**Default credentials:**
- URL: `http://localhost:8000`
- Service Role Key: `<your SERVICE_ROLE_KEY from .env>`

You now have a local Supabase instance with full web UI! 🎉

---

## 🗄️ Migrating Data from Cloud Supabase

### Option 1: Export from Cloud Dashboard (Recommended)

**Step 1: Export schema from cloud Supabase**

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login to your cloud project
supabase login

# Link to your cloud project
supabase link --project-ref jkbetmadzcpoinjogkli

# Pull schema and migrations
supabase db pull
```

**Step 2: Export data**

From your cloud Supabase dashboard (https://supabase.com):
1. Go to Database → Backups
2. Click "Download Backup"
3. Save the `.sql` file locally

**Step 3: Import to local Supabase**

```bash
# Connect to your local Postgres
psql -h localhost -p 5432 -U postgres

# Inside psql:
\c postgres
\i /path/to/your/backup.sql
```

### Option 2: Manual Table Export/Import

If you have specific tables to migrate:

**Export from cloud:**
```bash
# Export specific tables as CSV from Supabase dashboard
# Database → [table name] → Export → CSV
```

**Import to local:**
```bash
# Use the Supabase Studio at http://localhost:3002
# Or use SQL:
psql -h localhost -p 5432 -U postgres -d postgres

COPY journal_entries FROM '/path/to/journal_entries.csv' CSV HEADER;
COPY users FROM '/path/to/users.csv' CSV HEADER;
# etc...
```

### Option 3: pg_dump (Advanced)

**From your cloud Supabase:**
```bash
# Get connection string from cloud dashboard
# Database → Connection string → Direct connection

pg_dump "postgresql://postgres:[password]@db.jkbetmadzcpoinjogkli.supabase.co:5432/postgres" \
  > maia_backup.sql

# Import to local
psql -h localhost -p 5432 -U postgres -d postgres < maia_backup.sql
```

---

## 🔧 Update MAIA Configuration

### Step 1: Update Environment Variables

Edit `apps/web/.env.local`:

```bash
# OLD (external Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://jkbetmadzcpoinjogkli.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_URL="https://jkbetmadzcpoinjogkli.supabase.co"

# NEW (local Supabase)
NEXT_PUBLIC_SUPABASE_URL="http://localhost:8000"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your new ANON_KEY from Supabase .env>"
SUPABASE_SERVICE_ROLE_KEY="<your new SERVICE_ROLE_KEY from Supabase .env>"
SUPABASE_URL="http://localhost:8000"
```

### Step 2: Restart MAIA

```bash
cd /Users/soullab/MAIA-PAI/apps/web

# Restart the dev server
npm run dev
```

### Step 3: Test Connection

```bash
# Create a test script to verify connection
cat > test-supabase-local.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testConnection() {
  const { data, error } = await supabase.from('users').select('count');

  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connected to local Supabase!');
    console.log('Data:', data);
  }
}

testConnection();
EOF

# Run the test
npx tsx test-supabase-local.ts
```

---

## 🔐 Security Best Practices

### 1. Use Strong Passwords

```bash
# Generate secure passwords for all services
openssl rand -base64 32
```

### 2. Backup Your Data Regularly

```bash
# Create automated backup script
cat > ~/backup-supabase.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/supabase-backups
mkdir -p $BACKUP_DIR

DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -p 5432 -U postgres postgres > $BACKUP_DIR/maia_backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "maia_backup_*.sql" -mtime +30 -delete

echo "✅ Backup completed: maia_backup_$DATE.sql"
EOF

chmod +x ~/backup-supabase.sh

# Run it
~/backup-supabase.sh

# Add to cron for daily backups
crontab -e
# Add line: 0 2 * * * ~/backup-supabase.sh  # 2 AM daily
```

### 3. Firewall Configuration (Optional)

Your Mac Studio should already be protected, but you can verify:

```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Enable if needed
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on

# Postgres (5432) and Supabase API (8000) should ONLY be localhost
# They won't be accessible from outside your Mac by default
```

---

## ⚙️ Managing Self-Hosted Supabase

### Start/Stop Services

```bash
# Start all services
cd ~/supabase/docker
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Restart a specific service
docker compose restart supabase-db
```

### Monitor Resource Usage

```bash
# Check Docker resource usage
docker stats

# Expected usage:
# supabase-db: ~500MB RAM (lightweight!)
# supabase-rest: ~100MB RAM
# supabase-auth: ~100MB RAM
# Total: ~1GB RAM (nothing for your Mac Studio)
```

### Auto-Start on Boot (Optional)

**Option 1: Docker Desktop Settings**
- Open Docker Desktop
- Settings → General → "Start Docker Desktop when you log in" ✅

**Option 2: LaunchAgent (more reliable)**

```bash
# Create LaunchAgent
cat > ~/Library/LaunchAgents/com.maia.supabase.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.maia.supabase</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/docker</string>
        <string>compose</string>
        <string>-f</string>
        <string>/Users/soullab/supabase/docker/docker-compose.yml</string>
        <string>up</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/Users/soullab/supabase/docker</string>
</dict>
</plist>
EOF

# Load it
launchctl load ~/Library/LaunchAgents/com.maia.supabase.plist
```

---

## 🆘 Troubleshooting

### Issue: Port Already in Use

**Error:** `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution:** Change port in `docker-compose.yml`:
```yaml
# Change from:
ports:
  - "5432:5432"

# To:
ports:
  - "5433:5432"  # Use 5433 externally
```

### Issue: MAIA Can't Connect

**Check:**
```bash
# 1. Is Supabase running?
docker compose ps

# 2. Can you reach the API?
curl http://localhost:8000/rest/v1/

# 3. Are credentials correct?
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Issue: Data Not Appearing

**Solution:** Check if schema was migrated:
```bash
psql -h localhost -p 5432 -U postgres -d postgres

# List tables
\dt

# Should see:
# - users
# - journal_entries
# - consciousness_levels
# - etc.
```

### Issue: Docker Desktop Using Too Much RAM

**Solution:** Limit Docker resources:
- Docker Desktop → Settings → Resources
- Set Memory limit to 4GB (plenty for Supabase)

---

## 📊 Performance Comparison

### Cloud Supabase
- Latency: 50-200ms (network roundtrip)
- Managed backups: ✅
- Automatic updates: ✅
- Cost: $0-25/month
- Privacy: ❌ Data on AWS

### Self-Hosted Supabase
- Latency: <5ms (localhost!)
- Managed backups: ❌ (you handle it)
- Automatic updates: ❌ (you update manually)
- Cost: $0
- Privacy: ✅ Data on YOUR Mac Studio

**For MAIA:** Self-hosted is FASTER and more private. The tradeoff is you manage backups/updates.

---

## 🎯 Final Configuration

### Complete Sovereignty Stack

```
┌─────────────────────────────────────────┐
│         Mac Studio M4 Ultra             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  MAIA Frontend (Next.js)        │   │
│  │  http://localhost:3000          │   │
│  └─────────────────────────────────┘   │
│           ↓ ↓ ↓                         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   Ollama     │  │  Supabase    │    │
│  │ (DeepSeek-R1)│  │  (Postgres)  │    │
│  │ :11434       │  │  :8000       │    │
│  └──────────────┘  └──────────────┘    │
│                                         │
│  ✅ 100% Local                          │
│  ✅ 100% Private                        │
│  ✅ $0 Operating Cost                   │
└─────────────────────────────────────────┘

❌ NO EXTERNAL DEPENDENCIES
✅ COMPLETE SOVEREIGNTY
```

### Environment Summary

```bash
# MAIA Frontend
PORT=3000

# Ollama (LLM)
OLLAMA_BASE_URL="http://localhost:11434"
ENABLE_CLAUDE_FALLBACK="false"

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL="http://localhost:8000"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your local key>"
SUPABASE_SERVICE_ROLE_KEY="<your local key>"

# Result: 100% sovereign infrastructure
```

---

## 🚀 Next Steps

### 1. Set Up Automated Backups

```bash
# Daily backup at 2 AM
crontab -e
# Add: 0 2 * * * ~/backup-supabase.sh
```

### 2. Create Restore Process

```bash
# Test restore process
cat > ~/restore-supabase.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./restore-supabase.sh <backup_file.sql>"
  exit 1
fi

psql -h localhost -p 5432 -U postgres -d postgres < $1
echo "✅ Restore completed"
EOF

chmod +x ~/restore-supabase.sh

# Test it
~/restore-supabase.sh ~/supabase-backups/latest.sql
```

### 3. Update Documentation

Add to your MAIA setup docs:
- How to start Supabase on Mac restart
- Backup schedule and verification
- Emergency restore process

---

## 🏆 Sovereignty Achievement Checklist

Once completed, you'll have:

- [x] Self-hosted LLM (DeepSeek-R1 via Ollama)
- [ ] Self-hosted Database (Supabase via Docker)
- [x] Self-hosted Frontend (Next.js on localhost)
- [ ] Automated backups configured
- [ ] Restore process tested
- [ ] Auto-start on boot configured

**When all checked:** ✅ **COMPLETE SOVEREIGNTY ACHIEVED**

---

## 📚 Resources

- [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)

---

**Last Updated:** November 15, 2025
**Difficulty:** Intermediate (requires Docker knowledge)
**Time Required:** 1-2 hours for initial setup
**Ongoing Maintenance:** ~15 minutes/month for updates and backup verification

✨ **Complete sovereignty is within reach!** ✨
