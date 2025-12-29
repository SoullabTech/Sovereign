#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereign - Server Bootstrap Script
# ═══════════════════════════════════════════════════════════════════════════════
# Run this on a fresh Ubuntu 22.04/24.04 VPS as root
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/SoullabTech/Sovereign/main/scripts/server-bootstrap.sh | bash
#   
#   Or after cloning:
#   ./scripts/server-bootstrap.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════════════"
echo "MAIA Sovereign - Server Bootstrap"
echo "═══════════════════════════════════════════════════════════════════════════"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root: sudo ./scripts/server-bootstrap.sh"
    exit 1
fi

echo ""
echo "1️⃣  Installing dependencies..."
apt-get update -y
apt-get install -y git ca-certificates curl ufw

echo ""
echo "2️⃣  Installing Docker..."
if command -v docker &> /dev/null; then
    echo "   Docker already installed: $(docker --version)"
else
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "   ✅ Docker installed: $(docker --version)"
fi

echo ""
echo "3️⃣  Configuring firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "   ✅ Firewall configured (SSH, HTTP, HTTPS)"

echo ""
echo "4️⃣  Creating MAIA directory..."
mkdir -p /opt/maia/backups
cd /opt/maia

# Check if repo already cloned
if [ -f "docker-compose.production.yml" ]; then
    echo "   Repo already exists, pulling latest..."
    git pull origin main
else
    echo "   Cloning repository..."
    git clone https://github.com/SoullabTech/Sovereign.git .
fi

echo ""
echo "5️⃣  Generating secrets..."
FINGERPRINT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 32)

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "✅ Bootstrap Complete!"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. Create your .env.production:"
echo "   cp .env.production.template .env.production"
echo "   nano .env.production"
echo ""
echo "2. Set these values in .env.production:"
echo "   DOMAIN=staging.soullab.life"
echo "   MAIA_AUDIT_FINGERPRINT_SECRET=$FINGERPRINT_SECRET"
echo "   POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "   MAIA_INCLUDE_PROVIDER_META=1"
echo ""
echo "3. Start the stack:"
echo "   docker compose -f docker-compose.production.yml up -d --build"
echo ""
echo "4. Run migrations:"
echo "   docker compose -f docker-compose.production.yml --profile migrate run --rm migrate"
echo ""
echo "5. Verify:"
echo "   ./scripts/verify-sovereignty.sh staging.soullab.life"
echo ""
