# 🚨 Spiralogic Incident Response Runbook

> **One-page emergency procedures for Spiralogic Oracle System**

## 🔴 EMERGENCY CONTACTS

| Role | Contact | When to Use |
|------|---------|-------------|
| **Engineering Oncall** | #eng-oncall, @oncall-eng | System errors, performance issues |
| **DevOps Lead** | #infrastructure, @devops-lead | Infrastructure, deployment issues |  
| **Product Owner** | @spiralogic-product | User impact, business decisions |
| **Crisis Response** | crisis@company.com | Mental health escalations |

**Escalation Path:** Eng Oncall → DevOps → Product → Leadership

---

## ⚡ QUICK DIAGNOSTIC

### 1. Check System Health (30 seconds)
```bash
# API health check
curl https://your-domain/api/oracle/chat -I

# Database connectivity  
# Check consciousness_turn_meta table for recent entries

# Current orchestrator mode
grep "orchestrator.*initialized" /var/log/app.log | tail -1
```

### 2. Key Metrics Dashboard
- **Latency:** P95 should be <700ms  
- **Error Rate:** Should be <0.75%
- **Mode Distribution:** ~70% full, 25% lite, 5% fallback
- **Cache Hit Rate:** Should be >40%

---

## 🚨 CRITICAL SCENARIOS

### SCENARIO 1: High Error Rate (>2%)

**Symptoms:**
- Dashboard shows error_rate > 2% for 5+ minutes
- Users reporting "Oracle not responding"  
- Logs showing orchestrator failures

**IMMEDIATE ACTIONS (Priority Order):**
```bash
# 1. Enable global baseline mode (30 seconds)
export ORCHESTRATOR=baseline
pm2 restart spiralogic-api

# 2. Check external dependencies
curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_KEY"
curl https://api.elevenlabs.io/v1/voices -H "xi-api-key: $ELEVENLABS_KEY"

# 3. Verify database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM consciousness_turn_meta WHERE created_at > NOW() - INTERVAL '5 minutes';"

# 4. Alert team
echo "🚨 Spiralogic error spike detected - switched to baseline mode" | slack-notify #eng-oncall
```

**Root Cause Investigation:**
1. Check recent deployments in last 2 hours
2. Review external API status pages  
3. Examine database connection pool metrics
4. Look for memory/CPU spikes

**Recovery:** Monitor error rate for 15 minutes. If stable <1%, gradually re-enable Spiralogic.

---

### SCENARIO 2: Extreme Latency (P95 >1000ms)

**Symptoms:**
- Response times >1s consistently
- Users reporting "Oracle is very slow"
- Timeout errors in logs

**IMMEDIATE ACTIONS:**
```bash
# 1. Increase soft budget temporarily (buy time)
export SPIRALOGIC_SOFT_BUDGET_MS=200  # Force most requests to lite mode
pm2 restart spiralogic-api

# 2. Clear archetype cache (may be corrupted/oversized)
redis-cli FLUSHDB  # If using Redis
# OR restart app to clear in-memory cache

# 3. Reduce TTS load
export TTS_MAX_TEXT_CHARS=800  # Shorter voice synthesis
export TTS_QUEUE_MAX_CONCURRENT=2  # Reduce concurrent synthesis

# 4. Monitor improvements
watch "curl -w '@curl-format.txt' -s -o /dev/null https://your-domain/api/oracle/chat"
```

**Escalation:** If latency doesn't improve in 10 minutes, switch to baseline mode.

---

### SCENARIO 3: Fallback Storm (>15% fallback rate)

**Symptoms:**
- Most requests hitting fallback mode
- Spiralogic orchestrator consistently failing
- Simple responses only

**IMMEDIATE ACTIONS:**
```bash
# 1. Check Spiralogic dependencies
# Look for import errors, missing files, memory issues
tail -f /var/log/app.log | grep -i spiralogic

# 2. Verify environment variables
env | grep SPIRALOGIC
env | grep ORCHESTRATOR

# 3. Test orchestrator directly
curl -X POST localhost:3000/internal/health/orchestrator

# 4. If failing, force baseline
export ORCHESTRATOR=baseline
pm2 restart spiralogic-api
```

**Follow-up:** This usually indicates a bug in Spiralogic code or missing dependencies. Full investigation required.

---

### SCENARIO 4: Voice Queue Backup (TTS P95 >60s)

**Symptoms:**
- Voice responses arriving very late or not at all
- TTS queue growing
- ElevenLabs timeout errors

**IMMEDIATE ACTIONS:**
```bash
# 1. Reduce TTS load immediately
export TTS_MAX_TEXT_CHARS=600  # Very short responses
export TTS_QUEUE_MAX_CONCURRENT=1  # Single concurrent job

# 2. Clear TTS queue
redis-cli DEL voice_queue:*  # Clear pending jobs

# 3. Check ElevenLabs status
curl -I https://api.elevenlabs.io/v1/user

# 4. Temporary disable voice for critical users only
export FEATURE_VOICE_SYNTHESIS=false  # Emergency only
```

**Alternative:** Switch to faster TTS model or disable voice synthesis temporarily.

---

### SCENARIO 5: Cost Spike (>3x normal)

**Symptoms:**
- API costs suddenly much higher
- Unusually long responses
- High token usage

**IMMEDIATE ACTIONS:**
```bash
# 1. Reduce response length immediately
export RESPONSE_MAX_WORDS=50
export TTS_MAX_TEXT_CHARS=400

# 2. Disable expensive features temporarily
export SHADOW_CHALLENGE_INTENSITY=low  # Shorter challenges
export ARCHETYPE_MEMO_TTL=3600  # More aggressive caching (1hr)

# 3. Check for abuse/spam
grep -c "k6-user\|test-user\|bot" /var/log/access.log

# 4. Enable emergency rate limiting
export RATE_LIMIT_MAX_REQUESTS=10  # Very restrictive
export RATE_LIMIT_WINDOW_MS=60000
```

**Escalation:** Alert finance team if costs >5x normal.

---

## 🛠️ COMMON FIXES

### Fix 1: Restart Services
```bash
# Graceful restart
pm2 restart spiralogic-api --update-env

# Force restart if hanging  
pm2 kill && pm2 start ecosystem.config.js
```

### Fix 2: Clear Caches
```bash
# Redis (if used)
redis-cli FLUSHALL

# File system cache
rm -rf /tmp/spiralogic-cache/*

# Application restart (clears in-memory cache)
pm2 restart spiralogic-api
```

### Fix 3: Database Cleanup
```sql
-- Remove old consciousness metadata (if table growing too large)
DELETE FROM consciousness_turn_meta 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Check for locked connections
SELECT * FROM pg_stat_activity WHERE application_name = 'spiralogic';
```

### Fix 4: Resource Cleanup
```bash
# Check disk space
df -h

# Check memory usage
free -h
ps aux | grep -E 'node|pm2' | sort -k 4 -nr

# Check file descriptors
lsof | wc -l
```

---

## 📋 POST-INCIDENT CHECKLIST

### Immediate (0-1 hour)
- [ ] System stable and metrics normal
- [ ] Team notified of resolution
- [ ] Temporary fixes documented
- [ ] User communication sent (if needed)

### Short-term (1-24 hours)
- [ ] Root cause identified
- [ ] Permanent fix deployed
- [ ] Monitoring adjusted to catch similar issues
- [ ] Incident timeline documented

### Long-term (1-7 days)  
- [ ] Post-mortem meeting held
- [ ] Process improvements identified
- [ ] Code changes for prevention
- [ ] Updated runbooks/alerts

---

## 🔍 LOG LOCATIONS

```bash
# Application logs
tail -f /var/log/spiralogic/app.log

# PM2 logs
pm2 logs spiralogic-api --lines 100

# Error logs specifically
pm2 logs spiralogic-api --err --lines 50

# Database logs (PostgreSQL)
tail -f /var/log/postgresql/postgresql-*.log

# Nginx access logs
tail -f /var/log/nginx/access.log
```

---

## 📞 ESCALATION MATRIX

| Severity | Response Time | Who | Action |
|----------|---------------|-----|---------|
| **Critical** | 5 minutes | Eng Oncall | Immediate fix, page team |
| **High** | 15 minutes | Eng Oncall | Fix within 1 hour, notify stakeholders |
| **Medium** | 30 minutes | Team Lead | Fix within 4 hours, plan deployment |
| **Low** | 1 hour | Assigned Dev | Fix in next sprint, document |

### Severity Definitions:
- **Critical:** >50% users affected, system down, data loss
- **High:** >10% users affected, major feature broken
- **Medium:** <10% users affected, degraded performance  
- **Low:** Minor issues, workarounds available

---

## 🎯 SUCCESS METRICS FOR RESOLUTION

**Incident Resolved When:**
- Error rate <0.5% for 15 consecutive minutes
- P95 latency <700ms for 15 consecutive minutes  
- Mode distribution returns to normal (>60% full mode)
- No user complaints for 30 minutes
- All alerts cleared

**Next Steps After Resolution:**
1. Remove any temporary environment overrides
2. Restore normal configuration gradually
3. Monitor for 2 hours minimum
4. Schedule post-mortem within 48 hours

---

**🎯 Remember:** Better safe than sorry. When in doubt, switch to baseline mode and debug from there.