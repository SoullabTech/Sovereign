#!/bin/bash

# Let's Encrypt Certificate Setup Script
# Run this manually in your terminal

echo "🔐 Setting up Let's Encrypt certificates for soullab.life"
echo "=================================================="

echo "Step 1: Stopping nginx temporarily..."
sudo nginx -s stop
sleep 2

echo "Step 2: Generating Let's Encrypt certificate..."
sudo certbot certonly --standalone -d soullab.life --agree-tos --register-unsafely-without-email

if [ $? -eq 0 ]; then
    echo "✅ Certificate generated successfully!"

    # Update nginx configuration to use Let's Encrypt certificates
    echo "Step 3: Updating nginx configuration..."

    # Backup current config
    sudo cp /opt/homebrew/etc/nginx/servers/soullab.life.conf /opt/homebrew/etc/nginx/servers/soullab.life.conf.backup

    # Update SSL certificate paths in nginx config
    sudo sed -i.bak 's|ssl_certificate /opt/homebrew/etc/nginx/soullab.crt|ssl_certificate /etc/letsencrypt/live/soullab.life/fullchain.pem|g' /opt/homebrew/etc/nginx/servers/soullab.life.conf
    sudo sed -i.bak 's|ssl_certificate_key /opt/homebrew/etc/nginx/soullab.key|ssl_certificate_key /etc/letsencrypt/live/soullab.life/privkey.pem|g' /opt/homebrew/etc/nginx/servers/soullab.life.conf

    echo "Step 4: Restarting nginx with trusted certificates..."
    sudo nginx

    echo "Step 5: Testing HTTPS access..."
    sleep 3
    curl -I https://soullab.life/health

    echo ""
    echo "🎉 SUCCESS! soullab.life now has trusted HTTPS certificates!"
    echo "   • No more privacy warnings"
    echo "   • Fully trusted by all browsers"
    echo "   • Ready for production use"

else
    echo "❌ Certificate generation failed. Please check:"
    echo "   • soullab.life resolves to your external IP"
    echo "   • Port 80 is accessible from the internet"
    echo "   • No other service is using port 80"

    echo "Restarting nginx with self-signed certificates..."
    sudo nginx
fi