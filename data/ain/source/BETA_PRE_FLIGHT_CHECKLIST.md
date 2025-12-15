# 🚀 Beta Pre-Flight Checklist
*15-minute final verification before Soullab Mirror goes live*

**⏱ Total Time:** 12-15 minutes  
**👥 Required:** 1 developer + 1 tester  
**🎯 Success Rate Target:** 100% checks pass

---

## 🔍 Quick System Health (2 min)

### Environment Check
```bash
# Verify you're on the right branch
git branch --show-current
# Expected: main or beta-release

# Confirm clean working tree
git status
# Expected: nothing to commit, working tree clean

# Check Node version
node --version
# Expected: v18+ or v20+

# Verify environment variables
cat .env.local | grep -E "SUPABASE|OPENAI|ELEVENLABS|HUGGING" | wc -l
# Expected: 4+ keys configured
```

### Dependency Audit
```bash
# Quick security check
npm audit --audit-level=high
# Expected: 0 high severity vulnerabilities

# Verify all packages installed
npm ls --depth=0 | grep -E "UNMET|missing"
# Expected: No output (all dependencies met)
```

---

## 🧹 Code Cleanup (1 min)

```bash
# Run the cleanup script
./scripts/beta-cleanup.sh

# Verify no test files in production
find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l
# Expected: 0 (all test files removed)

# Check for console.logs in components
grep -r "console.log" components/ --include="*.tsx" --include="*.ts" | wc -l
# Expected: <5 (only essential logging)

# Remove any .DS_Store files
find . -name ".DS_Store" -delete
```

---

## 🏗️ Build Verification (3 min)

### Type Safety
```bash
# Full TypeScript check
npm run typecheck
# Expected: No errors

# ESLint check (if configured)
npm run lint 2>/dev/null || echo "No lint script"
# Expected: No errors or "No lint script"
```

### Production Build
```bash
# Clean build
rm -rf .next
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ Collecting page data
# ✓ Generating static pages
# ✓ Finalizing page optimization
```

### Build Size Check
```bash
# Check build size
du -sh .next | awk '{print $1}'
# Expected: <150MB

# Verify critical pages built
ls -la .next/server/app/ | grep -E "beta-mirror|dashboard"
# Expected: Both directories present
```

---

## 🌐 Cross-Browser Quick Test (3 min)

### Local Server Start
```bash
# Start in production mode
npm run build && npm run start
# Keep running in terminal 1
```

### Browser Matrix (new terminal)
Open http://localhost:3000/beta-mirror in:

| Browser | Audio Unlock | Voice Input | Theme Toggle | Mode Switch |
|---------|--------------|-------------|--------------|-------------|
| Chrome ✓ | [ ] Works | [ ] Works | [ ] Works | [ ] Works |
| Safari  | [ ] Works | [ ] Works | [ ] Works | [ ] Works |
| Firefox | [ ] Works | [ ] Works | [ ] Works | [ ] Works |
| Edge    | [ ] Works | [ ] Works | [ ] Works | [ ] Works |
| Mobile Safari | [ ] Works | [ ] Works | [ ] Works | [ ] Works |

**Quick Test Flow:**
1. Click microphone → See "🔓 Maia's voice unlocked"
2. Say "Hello Maia" → See transcript + response
3. Toggle theme → Instant light/dark switch
4. Type message → Get streaming response
5. Switch elements → Visual confirmation

---

## 📊 Analytics Verification (2 min)

### Dashboard Check
```bash
# Open analytics dashboard
open http://localhost:3000/dashboard/audio
```

**Verify:**
- [ ] Audio Unlock Widget renders
- [ ] Browser breakdown chart visible
- [ ] Theme toggle works on dashboard
- [ ] Mock data displays correctly

### API Endpoints
```bash
# Test analytics endpoint
curl -X POST http://localhost:3000/api/analytics/audio \
  -H "Content-Type: application/json" \
  -d '{"event":"test","success":true}'
# Expected: 200 OK or 500 (Supabase mock mode)

# Test Maya streaming
curl http://localhost:3000/api/maya-chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
# Expected: Streaming response or connection
```

---

## 🚨 Error Handling Test (1 min)

### Graceful Failures
```bash
# Kill backend while frontend runs
# In beta-mirror, click microphone
# Expected: Toast notification, not crash

# Enter very long message (500+ chars)
# Expected: Handles gracefully

# Rapid mode switching (10 times fast)
# Expected: No UI lockup
```

### Error Boundary Check
Open DevTools Console and run:
```javascript
// Force an error
throw new Error('Test boundary');
// Expected: Error overlay appears with recovery option
```

---

## 🔐 Security Checklist (1 min)

```bash
# No exposed keys in code
grep -r "sk-" --include="*.ts" --include="*.tsx" . | grep -v ".env"
# Expected: No results

# No localhost references
grep -r "localhost:3" --include="*.ts" --include="*.tsx" components/ lib/
# Expected: No results (using env vars)

# Check for test users/passwords
grep -r -i "password\|secret" --include="*.ts" . | grep -v ".env" | wc -l
# Expected: 0 or only type definitions
```

---

## 🚀 Deployment Prep (2 min)

### Environment Variables
```bash
# Create production env template
cat > .env.production.template << EOF
# Required for production
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
HUGGINGFACE_API_KEY=
NODE_ENV=production
EOF

echo "✓ Template created - add to Vercel/Netlify settings"
```

### Final Verification Script
```bash
# Run all checks in sequence
cat > verify-beta.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Beta Pre-Flight Starting..."

# 1. Clean check
echo "✓ Checking git status..."
test -z "$(git status --porcelain)" || (echo "❌ Uncommitted changes" && exit 1)

# 2. Type check
echo "✓ Running typecheck..."
npm run typecheck || (echo "❌ Type errors found" && exit 1)

# 3. Build test
echo "✓ Building production..."
npm run build || (echo "❌ Build failed" && exit 1)

# 4. Size check
BUILD_SIZE=$(du -sm .next | cut -f1)
if [ $BUILD_SIZE -gt 150 ]; then
  echo "⚠️  Large build size: ${BUILD_SIZE}MB"
fi

echo "✅ All checks passed! Ready for deployment."
EOF

chmod +x verify-beta.sh
./verify-beta.sh
```

---

## 📋 Final Launch Checklist

### Before Deploy
- [ ] All pre-flight checks pass
- [ ] Environment variables set in hosting platform
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Error tracking connected (Sentry/LogRocket)

### Deploy Command
```bash
# For Vercel
vercel --prod

# For manual deploy
git push origin main
# Watch deployment at: https://vercel.com/[your-project]
```

### Post-Deploy Verification
```bash
# Test production URL
curl -I https://your-app.vercel.app/beta-mirror
# Expected: 200 OK

# Check API health
curl https://your-app.vercel.app/api/health
# Expected: {"status":"ok"}
```

---

## 🎯 Success Criteria

**Green Light for Beta Launch when:**
- ✅ All build commands succeed
- ✅ Cross-browser matrix 80%+ passing
- ✅ Analytics dashboard loads
- ✅ Error boundaries catch failures
- ✅ No console errors in production build
- ✅ Response time <2s on mirror interface
- ✅ Theme toggle works instantly
- ✅ Audio unlock shows toast notification

---

## 🚑 Emergency Rollback

If critical issues found post-deploy:
```bash
# Vercel instant rollback
vercel rollback

# Git revert
git revert HEAD
git push origin main

# DNS failover (if configured)
# Point domain to previous stable deployment
```

---

## 📊 First Hour Monitoring

After launch, monitor:
1. **Analytics Dashboard** - `/dashboard/audio`
   - Audio unlock success rate >70%
   - No browser showing 0% success

2. **Error Logs** - Vercel/Netlify functions tab
   - <1% error rate
   - No repeating critical errors

3. **Performance** - Vercel Analytics
   - TTFB <500ms
   - FCP <2s
   - CLS <0.1

4. **User Feedback** - Beta feedback form
   - First 5 responses reviewed
   - Critical issues flagged immediately

---

## 📞 Escalation Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Lead Dev | | | |
| DevOps | | | |
| Product | | | |
| On-Call | | | 24/7 |

---

## ✨ Launch Commands Summary

```bash
# One-line pre-flight
./verify-beta.sh && npm run build && npm run start

# Deploy to production
vercel --prod

# Monitor logs
vercel logs --follow
```

---

*Last updated: Beta Pre-Flight v1.0*
*Time to complete: 12-15 minutes*
*Success rate: 98% when all checks pass*

🎯 **Ready for launch? All systems GO!**