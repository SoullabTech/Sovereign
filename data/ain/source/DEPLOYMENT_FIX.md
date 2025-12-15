# 🚨 Production Deployment Fix

## Issue
The Oracle response dialogue is broken with error:
```
🚨 All Consciousness Intelligence endpoints failed, using fallback
```

## Root Cause
The `USE_PERSONAL_ORACLE` environment variable is missing from the Vercel deployment, causing the API to always use the fallback non-AI responses.

## Solution

### Add to Vercel Environment Variables

Go to your Vercel project settings and add:

```bash
USE_PERSONAL_ORACLE=true
```

### Verify These Are Also Set

Ensure these API keys are properly configured in Vercel:

```bash
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Complete Environment Variables Checklist

Required for AI Oracle to work:
- [x] `USE_PERSONAL_ORACLE=true` - **MISSING - ADD THIS**
- [ ] `OPENAI_API_KEY` - Must be valid
- [ ] `ANTHROPIC_API_KEY` - Must be valid
- [ ] `NEXT_PUBLIC_API_MODE=ai` - Should be set

## How to Fix

1. Go to https://vercel.com/your-team/spiralogic-oracle-system/settings/environment-variables
2. Add `USE_PERSONAL_ORACLE` with value `true`
3. Redeploy the application

## Testing After Fix

1. Open the app
2. Send a message to Maya
3. You should see intelligent, contextual responses
4. Check network tab - should show source as `personal-oracle-agent` not `fallback`

## Alternative: Quick Code Fix

If you can't access Vercel env vars immediately, you can temporarily hardcode in `/app/api/oracle/personal/route.ts`:

```typescript
// Line 23 - Change from:
const usePersonalOracle = process.env.USE_PERSONAL_ORACLE === 'true';

// To:
const usePersonalOracle = true; // TEMPORARY: Hardcode until env var is set
```

But the proper fix is to set the environment variable in Vercel.

## Monitoring

After fixing, monitor these endpoints:
- `/api/oracle/personal` - Should return AI responses
- Check response metadata for `"ai": true`
- Watch for `"source": "personal-oracle-agent"`

---

**Priority: HIGH** - This is blocking all AI functionality in production