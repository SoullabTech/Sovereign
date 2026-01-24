#!/bin/bash

echo "Testing MAIA Sovereign Production Stack"
echo "========================================"

echo -e "\n1. Checking Docker containers..."
docker ps --format "table {{.Names}}\t{{.Status}}" | head -12

echo -e "\n2. Testing local Caddy (http://localhost/api/health)..."
RESP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null)
if [ "$RESP" = "200" ]; then
    echo "   Local Caddy: HTTP $RESP"
else
    echo "   Local Caddy: HTTP $RESP (check if maia-caddy is running)"
fi

echo -e "\n3. Testing domain access (https://soullab.life/api/health)..."
RESP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://soullab.life/api/health 2>/dev/null)
if [ "$RESP" = "200" ]; then
    echo "   soullab.life: HTTP $RESP"
else
    echo "   soullab.life: HTTP $RESP (check DNS/router config)"
fi

echo -e "\n4. Testing API subdomain (https://api.soullab.life/v1/health)..."
RESP=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://api.soullab.life/v1/health 2>/dev/null)
if [ "$RESP" = "200" ]; then
    echo "   api.soullab.life: HTTP $RESP"
else
    echo "   api.soullab.life: HTTP $RESP"
fi

echo -e "\n5. TLS Certificate..."
echo | openssl s_client -connect soullab.life:443 -servername soullab.life 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null

echo -e "\nShare these URLs with testers:"
echo "   https://soullab.life/"
echo "   https://soullab.life/labtools/"
echo "   https://api.soullab.life/v1/health"
