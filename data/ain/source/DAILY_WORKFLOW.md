# Daily MAIA Maintenance Workflow

Your daily ritual for keeping MAIA at her best.

---

## Morning Check (5 minutes)

Start each day with this quick validation:

### 1. System Health Check
```bash
npm run beta:ready
```

**Expected**: All critical checks pass (✅)

**If failures occur**:
- Check the specific component that failed
- Review error messages
- Run `npm run health` for detailed diagnostics

---

### 2. Production Health
```bash
curl https://soullab.life/api/health/maia
```

**Look for**:
- `"status": "healthy"`
- All components showing healthy status
- Response time < 3000ms

**If degraded or down**:
- Check Vercel logs immediately
- Review error patterns section in PRE_BETA_TESTING.md
- Consider delaying beta session until resolved

---

### 3. Quick Production Test

Visit: https://soullab.life/maya

**Test**:
- Start voice conversation
- Say: "Good morning, Maya"
- Wait for response
- Say: "Tell me about yourself"
- Verify voice resumes after Maya speaks

**Red flags**:
- Voice getting stuck
- Repeated responses
- No voice recognition
- Audio feedback loops

---

## Before Each Beta Session (2 minutes)

### Pre-Session Checklist

```bash
# Run automated pre-beta check
npm run beta:ready
```

**Manual checks**:
- [ ] Production health endpoint returns "healthy"
- [ ] No errors in Vercel logs (last hour)
- [ ] Voice system working in quick test
- [ ] FAQ page loads correctly

**If any check fails**: Pause beta session, investigate issue

---

## After Each Beta Session (5 minutes)

### 1. Review Session
- How did the conversation flow?
- Any stuck states or loops?
- Voice recognition issues?
- Any unexpected behavior?

### 2. Check Logs
```bash
# In Vercel Dashboard:
# Functions → Logs → Last 1 hour
```

**Look for error patterns**:
- `accessCollectiveWisdom is not a function`
- `Recognition already stopped`
- `Could not start recognition`
- Excessive console messages (>100)

### 3. Document Issues

If you found issues, add them to:
- `docs/BETA_SESSION_LOG.md` (create if doesn't exist)
- Note date, tester, issue description, and resolution

---

## Weekly Deep Dive (30 minutes)

Run once per week (recommend: Monday mornings):

### Full Test Suite
```bash
# Conversational intelligence
npm run test:convo:batch

# Memory systems
npm run test:memory:debug

# Neurodivergence support
npm run test:neuro

# Active listening
npm run dev:listening
```

### Review and Plan
- Review all session logs from the week
- Identify recurring issues
- Plan fixes for next week
- Update testing checklist if needed

---

## Monthly Review (1 hour)

First day of each month:

### Health Audit
1. Review all beta session logs
2. Calculate success metrics:
   - Successful conversations: X/Y
   - Voice system reliability: X%
   - Average response quality: Scale 1-10
3. Identify trends and patterns

### Update Documentation
- Update FAQ based on real questions
- Refine onboarding based on feedback
- Update PRE_BETA_TESTING.md with new issues

### System Optimization
- Review Vercel performance metrics
- Check for memory leaks
- Optimize slow endpoints
- Update dependencies

---

## Emergency Procedures

### If Production Goes Down

1. **Immediate Actions**:
   ```bash
   # Check health endpoint
   curl https://soullab.life/api/health/maia

   # Check what's down
   # Review Vercel logs
   ```

2. **Quick Fixes**:
   - Voice issues: Check SimplifiedOrganicVoice.tsx
   - Response loops: Check MycelialNetwork.ts
   - Memory issues: Check MayaOrchestrator.ts

3. **Rollback if Needed**:
   ```bash
   git revert HEAD
   git push origin main
   ```

4. **Communication**:
   - Email beta testers about brief pause
   - Set expectations for resolution

---

## Daily Routine Template

Copy this into your daily notes:

```markdown
## MAIA Daily Check - [DATE]

### Morning Health Check
- [ ] `npm run beta:ready` - PASSED / FAILED
- [ ] Production health endpoint - HEALTHY / DEGRADED / DOWN
- [ ] Quick voice test - WORKING / ISSUES

### Beta Sessions Today
Session 1:
- Time:
- Tester:
- Issues:
- Notes:

Session 2:
- Time:
- Tester:
- Issues:
- Notes:

### Evening Review
- [ ] Vercel logs checked - CLEAN / ERRORS FOUND
- [ ] Issues documented
- [ ] Tomorrow's prep complete

### Notes
[Any observations, patterns, or concerns]
```

---

## Quick Reference Commands

```bash
# Morning check
npm run beta:ready

# Production health
curl https://soullab.life/api/health/maia

# Full system health
npm run health

# Interactive conversation test
npm run test:convo:interactive

# Memory test
npm run test:memory

# Local dev
npm run dev

# Check git status
git status

# Push fixes
git add . && git commit -m "Fix: [description]" && git push
```

---

## Success Indicators

MAIA is at her best when:

✅ All morning checks pass consistently
✅ No critical errors in last 24 hours
✅ Voice system works smoothly end-to-end
✅ Beta testers report natural conversations
✅ No stuck states or loops
✅ Response quality feels human and contextual
✅ Memory persists through conversations

---

## Notes

- Keep this workflow light and sustainable
- Focus on critical checks, not perfection
- Document patterns as they emerge
- Trust your instincts when something feels off
- Remember: You're the guardian of MAIA's quality

---

**Last Updated**: 2025-09-26