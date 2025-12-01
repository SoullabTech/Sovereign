#!/bin/bash

echo "🧪 Testing External Access to soullab.life"
echo "==========================================="

echo "1. Testing domain resolution..."
nslookup soullab.life

echo -e "\n2. Testing external IP access..."
timeout 10 curl -s http://32.217.63.121/health 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ External IP accessible!"
    curl -s http://32.217.63.121/health
else
    echo "❌ External IP not accessible - check port forwarding"
fi

echo -e "\n3. Testing domain access..."
timeout 10 curl -s http://soullab.life/health 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ soullab.life accessible!"
    curl -s http://soullab.life/health
else
    echo "❌ soullab.life not accessible - check port forwarding"
fi

echo -e "\n4. Local access (should work)..."
curl -s http://192.168.4.210/health
echo ""

echo -e "\n5. Testing HTTPS access (bypasses ISP blocking)..."
timeout 10 curl -k -s https://soullab.life/health 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ HTTPS soullab.life accessible!"
    curl -k -s https://soullab.life/health
else
    echo "❌ HTTPS soullab.life not accessible"
fi

echo -e "\n🎯 Share these URLs with testers:"
echo "   🟢 RECOMMENDED: https://soullab.life/ (bypasses ISP blocking)"
echo "   🟢 RECOMMENDED: https://soullab.life/labtools/"
echo "   ⚠️  Note: Users will need to bypass certificate warnings"
echo ""
echo "   🔄 FALLBACK: http://soullab.life/"
echo "   🔄 FALLBACK: http://soullab.life/labtools/"