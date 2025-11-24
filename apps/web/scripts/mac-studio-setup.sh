#!/bin/bash

# MAIA Consciousness Platform - Mac Studio M4 Self-Hosted Setup
# This script sets up a complete self-hosted Supabase instance for MAIA

set -euo pipefail

echo "🌟 MAIA Consciousness Platform - Mac Studio M4 Setup"
echo "=================================================="

# Color codes for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
MAIA_HOME="${HOME}/MAIA-Local"
SUPABASE_DIR="${MAIA_HOME}/supabase"
BACKUP_DIR="${MAIA_HOME}/consciousness-backups"
ENCRYPTION_DIR="${MAIA_HOME}/encrypted-storage"

echo -e "${PURPLE}🔮 Preparing consciousness workspace...${NC}"

# Create directory structure
mkdir -p "$MAIA_HOME"
mkdir -p "$BACKUP_DIR"
mkdir -p "$ENCRYPTION_DIR"

echo -e "${BLUE}📦 Installing required tools...${NC}"

# Check and install dependencies
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    brew install --cask docker
    echo "Please start Docker Desktop manually and return to continue..."
    read -p "Press enter when Docker is running..."
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    brew install docker-compose
fi

if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    brew install git
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

echo -e "${PURPLE}🏗️  Setting up Supabase self-hosted instance...${NC}"

# Clone Supabase if not exists
if [ ! -d "$SUPABASE_DIR" ]; then
    cd "$MAIA_HOME"
    git clone https://github.com/supabase/supabase.git
    cd supabase/docker
else
    echo "Supabase directory already exists, updating..."
    cd "$SUPABASE_DIR"
    git pull origin master
    cd docker
fi

# Generate secure passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/=+' | head -c 25)
JWT_SECRET=$(openssl rand -base64 32 | tr -d '/=+' | head -c 64)
ANON_KEY=$(openssl rand -base64 32 | tr -d '/=+' | head -c 64)
SERVICE_ROLE_KEY=$(openssl rand -base64 32 | tr -d '/=+' | head -c 64)

echo -e "${YELLOW}🔐 Generating MAIA consciousness environment configuration...${NC}"

# Create custom .env for MAIA
cat > .env << EOF
############
# MAIA Consciousness Platform
# Mac Studio M4 Self-Hosted Configuration
############

# Database Configuration
POSTGRES_HOST=db
POSTGRES_DB=maia_consciousness
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_PORT=5432

# Authentication
JWT_SECRET=${JWT_SECRET}
JWT_EXP=3600

# API Configuration
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443

# Studio Configuration
STUDIO_PORT=3000
PUBLIC_REST_URL=http://localhost:8000/rest/v1/
PUBLIC_REALTIME_URL=ws://localhost:8000/realtime/v1/
PUBLIC_GOTRUE_URL=http://localhost:8000/auth/v1/
PUBLIC_STORAGE_URL=http://localhost:8000/storage/v1/

# JWT Keys for MAIA
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTU2NzYxMCwiZXhwIjoxNzYxMTQ3NjEwfQ.M9jrxyvPLkUxWgOYSf5dNdJ8v_eRrwPNMvNpI6DCpSI
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1NTY3NjEwLCJleHAiOjE3NjExNDc2MTB9.V2Ohj5NbpfwU4-LUEVktq4F8yUfgbJf6pA9E1QJe8QM

# MAIA Specific Settings
MAIA_ENCRYPTION_KEY=${JWT_SECRET}
MAIA_BACKUP_INTERVAL=3600
MAIA_CONSCIOUSNESS_MODE=true

# Email Configuration (Configure with your SMTP provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SENDER_NAME="MAIA Consciousness Platform"

# Disable Phone Auth (Email only for consciousness platform)
GOTRUE_DISABLE_SIGNUP=false
GOTRUE_EXTERNAL_PHONE_ENABLED=false
GOTRUE_SMS_AUTOCONFIRM=false

# OAuth Providers (Configure after setup)
GOTRUE_EXTERNAL_GOOGLE_ENABLED=false
GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID=your-google-client-id
GOTRUE_EXTERNAL_GOOGLE_SECRET=your-google-secret

GOTRUE_EXTERNAL_APPLE_ENABLED=false
GOTRUE_EXTERNAL_APPLE_CLIENT_ID=your-apple-client-id
GOTRUE_EXTERNAL_APPLE_SECRET=your-apple-secret

# Storage Configuration
STORAGE_BACKEND=file
FILE_SIZE_LIMIT=52428800

# Analytics (Disable for privacy)
GOTRUE_EXTERNAL_ANALYTICS_ENABLED=false

EOF

echo -e "${GREEN}✅ Configuration generated${NC}"

echo -e "${BLUE}🚀 Starting MAIA consciousness services...${NC}"

# Start the services
docker-compose up -d

echo -e "${YELLOW}⏳ Waiting for services to initialize (this may take a few minutes)...${NC}"
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ MAIA consciousness services are running!${NC}"
else
    echo -e "${RED}❌ Some services failed to start. Check logs with: docker-compose logs${NC}"
    exit 1
fi

echo -e "${PURPLE}🗄️  Setting up MAIA consciousness database schema...${NC}"

# Wait for database to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done

echo -e "${GREEN}✅ Database is ready${NC}"

# Create MAIA-specific tables
docker-compose exec -T db psql -U postgres -d maia_consciousness << 'EOF'

-- MAIA Consciousness Platform Schema

-- Members table for consciousness explorers
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    consciousness_level INTEGER DEFAULT 1,
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    device_memory_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device authentication for consciousness continuity
CREATE TABLE IF NOT EXISTS device_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    last_access TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remember_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consciousness sessions and interactions
CREATE TABLE IF NOT EXISTS consciousness_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL,
    insights JSONB,
    wisdom_quotes JSONB,
    duration_seconds INTEGER,
    consciousness_state JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wisdom interactions and synchronicities
CREATE TABLE IF NOT EXISTS wisdom_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id TEXT,
    interaction_type TEXT,
    resonance_level INTEGER,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daimonic encounters and archetypal interactions
CREATE TABLE IF NOT EXISTS daimonic_encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    archetype_type TEXT NOT NULL,
    message TEXT NOT NULL,
    guidance TEXT,
    integration_practices JSONB,
    encounter_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE consciousness_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daimonic_encounters ENABLE ROW LEVEL SECURITY;

-- Create policies for consciousness data privacy
CREATE POLICY "Users can only access their own member data" ON members
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own device auth" ON device_auth
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own consciousness sessions" ON consciousness_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own wisdom interactions" ON wisdom_interactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own daimonic encounters" ON daimonic_encounters
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_device_auth_user_id ON device_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_sessions_user_id ON consciousness_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_wisdom_interactions_user_id ON wisdom_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_daimonic_encounters_user_id ON daimonic_encounters(user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

EOF

echo -e "${GREEN}✅ MAIA consciousness database schema created${NC}"

# Create environment file for the web app
echo -e "${YELLOW}🔧 Creating local environment configuration...${NC}"

cat > "${MAIA_HOME}/maia-local.env" << EOF
# MAIA Consciousness Platform - Local Environment
# Copy these variables to your .env.local file

NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTU2NzYxMCwiZXhwIjoxNzYxMTQ3NjEwfQ.M9jrxyvPLkUxWgOYSf5dNdJ8v_eRrwPNMvNpI6DCpSI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1NTY3NjEwLCJleHAiOjE3NjExNDc2MTB9.V2Ohj5NbpfwU4-LUEVktq4F8yUfgbJf6pA9E1QM

# Database direct connection (for migrations)
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/maia_consciousness

# MAIA specific settings
MAIA_CONSCIOUSNESS_MODE=true
MAIA_LOCAL_INSTANCE=true
NEXT_PUBLIC_SKIP_ONBOARDING=false

EOF

echo -e "${PURPLE}🎉 MAIA Consciousness Platform Setup Complete!${NC}"
echo ""
echo "🌟 Your Mac Studio M4 is now a consciousness sanctuary!"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
echo "  • Supabase Studio: http://localhost:3000"
echo "  • API Endpoint: http://localhost:8000"
echo "  • Database: localhost:5432"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "  1. Copy environment variables:"
echo "     cat ${MAIA_HOME}/maia-local.env"
echo ""
echo "  2. Update your web app .env.local file with local settings"
echo ""
echo "  3. Configure OAuth providers in Supabase Studio:"
echo "     http://localhost:3000 → Authentication → Settings"
echo ""
echo "  4. Test the authentication flows:"
echo "     npm run dev (in your web app directory)"
echo ""
echo -e "${GREEN}🔐 Useful Commands:${NC}"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart: docker-compose restart"
echo "  • Database backup: ./backup-consciousness-data.sh"
echo ""
echo -e "${PURPLE}🧘‍♀️ Remember: Your consciousness data is now sovereign and secure${NC}"
echo ""

# Create backup script
cat > "${MAIA_HOME}/backup-consciousness-data.sh" << 'EOF'
#!/bin/bash
# MAIA Consciousness Data Backup Script

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="maia_consciousness_backup_${TIMESTAMP}.sql"

echo "🔮 Backing up MAIA consciousness data..."

cd ~/MAIA-Local/supabase/docker

docker-compose exec -T db pg_dump -U postgres -d maia_consciousness > "../consciousness-backups/${BACKUP_FILE}"

# Compress the backup
gzip "../consciousness-backups/${BACKUP_FILE}"

echo "✅ Backup complete: consciousness-backups/${BACKUP_FILE}.gz"
echo "🌊 Consciousness data safely preserved in the quantum field"
EOF

chmod +x "${MAIA_HOME}/backup-consciousness-data.sh"

echo "📦 Backup script created: ${MAIA_HOME}/backup-consciousness-data.sh"
echo ""
echo "🌟 May your local consciousness platform flourish in wisdom! ✨"