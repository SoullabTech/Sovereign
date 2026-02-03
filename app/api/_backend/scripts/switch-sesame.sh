#!/bin/bash

# ========================================
# Sesame Environment Switcher
# Easily switch between local and cloud Sesame configurations
# ========================================

set -e

echo "🌀 Sesame Environment Switcher"
echo "=============================="
echo ""

# Check current environment
if grep -q "SESAME_URL=http://localhost:8000" ../.env 2>/dev/null; then
    CURRENT_ENV="local"
elif grep -q "huggingface.co" ../.env 2>/dev/null; then
    CURRENT_ENV="huggingface"
else
    CURRENT_ENV="unknown"
fi

echo "Current environment: $CURRENT_ENV"
echo ""

# Show options
echo "Select Sesame environment:"
echo "1) Local Docker (localhost:8000)"
echo "2) Hugging Face Cloud" 
echo "3) Show current config"
echo "4) Test current connection"
echo "5) Exit"
echo ""

read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo "🐳 Switching to Local Docker..."
        
        # Check if local Sesame is running
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            echo "✅ Local Sesame container is running"
        else
            echo "⚠️  Warning: Local Sesame not detected on port 8000"
            echo "   Start it with: docker run -p 8000:8000 sesame-csm:latest"
        fi
        
        # Update .env
        if [ -f "../.env.sesame.local" ]; then
            echo "Applying local configuration..."
            grep "^SESAME_" ../.env.sesame.local > /tmp/sesame_config.tmp
            
            # Backup current .env
            cp ../.env ../.env.backup
            
            # Remove old Sesame config and add new
            grep -v "^SESAME_" ../.env > /tmp/env_without_sesame.tmp
            cat /tmp/env_without_sesame.tmp > ../.env
            echo "" >> ../.env
            echo "# Sesame Configuration (LOCAL)" >> ../.env
            cat /tmp/sesame_config.tmp >> ../.env
            
            echo "✅ Switched to LOCAL Sesame"
            echo "   No authentication required"
        else
            echo "❌ Error: .env.sesame.local not found"
        fi
        ;;
        
    2)
        echo "☁️  Switching to Hugging Face Cloud..."
        
        # Check for HF token
        read -p "Enter your Hugging Face API token (or press Enter to skip): " hf_token
        
        if [ -f "../.env.sesame.huggingface" ]; then
            echo "Applying Hugging Face configuration..."
            grep "^SESAME_" ../.env.sesame.huggingface > /tmp/sesame_config.tmp
            
            # Update token if provided
            if [ ! -z "$hf_token" ]; then
                sed -i.bak "s/SESAME_TOKEN=.*/SESAME_TOKEN=$hf_token/" /tmp/sesame_config.tmp
            fi
            
            # Backup current .env
            cp ../.env ../.env.backup
            
            # Remove old Sesame config and add new
            grep -v "^SESAME_" ../.env > /tmp/env_without_sesame.tmp
            cat /tmp/env_without_sesame.tmp > ../.env
            echo "" >> ../.env
            echo "# Sesame Configuration (HUGGING FACE)" >> ../.env
            cat /tmp/sesame_config.tmp >> ../.env
            
            echo "✅ Switched to HUGGING FACE Sesame"
            echo "   Token required for authentication"
        else
            echo "❌ Error: .env.sesame.huggingface not found"
        fi
        ;;
        
    3)
        echo "📋 Current Sesame Configuration:"
        echo "--------------------------------"
        grep "^SESAME_" ../.env || echo "No Sesame configuration found"
        ;;
        
    4)
        echo "🧪 Testing current Sesame connection..."
        
        # Get current URL from .env
        SESAME_URL=$(grep "^SESAME_URL=" ../.env | cut -d'=' -f2)
        
        if [ -z "$SESAME_URL" ]; then
            echo "❌ No SESAME_URL found in .env"
            exit 1
        fi
        
        echo "Testing: $SESAME_URL"
        
        # Test health endpoint
        if curl -s "$SESAME_URL/health" > /dev/null 2>&1; then
            echo "✅ Sesame is reachable"
            
            # Test TTS
            echo "Testing TTS endpoint..."
            RESPONSE=$(curl -s -X POST "$SESAME_URL/tts" \
                -H "Content-Type: application/json" \
                -d '{"text":"Test"}' 2>&1)
            
            if echo "$RESPONSE" | grep -q "audio"; then
                echo "✅ TTS endpoint working"
            else
                echo "⚠️  TTS endpoint returned unexpected response"
            fi
            
            # Test CI shaping (if enabled)
            if grep -q "SESAME_CI_ENABLED=true" ../.env; then
                echo "Testing CI shaping endpoint..."
                CI_RESPONSE=$(curl -s -X POST "$SESAME_URL/ci/shape" \
                    -H "Content-Type: application/json" \
                    -d '{"text":"Test","style":"aether"}' 2>&1)
                
                if echo "$CI_RESPONSE" | grep -q "Not Found"; then
                    echo "⚠️  CI shaping not available (404)"
                elif echo "$CI_RESPONSE" | grep -q "text"; then
                    echo "✅ CI shaping endpoint working"
                else
                    echo "⚠️  CI shaping returned unexpected response"
                fi
            fi
        else
            echo "❌ Sesame is not reachable at $SESAME_URL"
        fi
        ;;
        
    5)
        echo "👋 Exiting..."
        exit 0
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎯 Done! Remember to restart your backend for changes to take effect."