# 🔑 Soullab Beta Environment Variables Setup Guide

## ⚠️ Current Issues Identified

1. **Duplicate Supabase Variables**: Both `NEXT_PUBLIC_SUPABASE_*` and `VITE_SUPABASE_*` exist (VITE vars are still in use in backend)
2. **Missing Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY` is required by 58+ files but not visible in Vercel
3. **Security**: Sensitive keys should be marked as "Sensitive" in Vercel
4. **Environment Segregation**: All vars are in "All Environments" - should be split by environment

---

## 🎯 Recommended Environment Variable Setup

### 🚀 **Production Environment** (Vercel Production)

```env
# Public Variables (safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
NEXT_PUBLIC_ENV_NAME=production

# Server-only Variables (mark as Sensitive ⚠️)
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
RUNPOD_API_KEY=your-prod-runpod-key
RUNPOD_ENDPOINT_ID=your-prod-endpoint-id
VOICE_PROVIDER=runpod

# Legacy Support (keep until backend migration complete)
VITE_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
VITE_SUPABASE_KEY=your-prod-anon-key
```

### 🧪 **Preview/Staging Environment** (Vercel Preview)

```env
# Public Variables
NEXT_PUBLIC_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
NEXT_PUBLIC_ENV_NAME=staging
NEXT_PUBLIC_SKIP_ONBOARDING=true

# Server-only Variables (mark as Sensitive ⚠️)
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key
RUNPOD_API_KEY=your-staging-runpod-key
RUNPOD_ENDPOINT_ID=your-staging-endpoint-id
VOICE_PROVIDER=runpod

# Legacy Support
VITE_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
VITE_SUPABASE_KEY=your-staging-anon-key
```

### 💻 **Local Development** (.env.local)

```env
# Public Variables
NEXT_PUBLIC_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
NEXT_PUBLIC_ENV_NAME=development
NEXT_PUBLIC_SKIP_ONBOARDING=true

# Server-only Variables
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key
RUNPOD_API_KEY=your-dev-runpod-key
RUNPOD_ENDPOINT_ID=your-dev-endpoint-id
VOICE_PROVIDER=runpod

# Legacy Support
VITE_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
VITE_SUPABASE_KEY=your-dev-anon-key
```

---

## 🔐 Security Checklist

### Mark as "Sensitive" in Vercel:
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ⚠️ CRITICAL
- [ ] `RUNPOD_API_KEY`
- [ ] `RUNPOD_ENDPOINT_ID`

### Never Expose Publicly:
- ❌ Never prefix service role keys with `NEXT_PUBLIC_`
- ❌ Never commit `.env.local` to git
- ❌ Never share service role keys in logs/errors

---

## 📋 Migration Steps

1. **Add Missing Service Role Key** (CRITICAL)
   ```bash
   # Get from Supabase Dashboard → Settings → API
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

2. **Split Environments in Vercel**
   - Go to Settings → Environment Variables
   - Move Production vars to "Production" scope
   - Move staging vars to "Preview" scope
   - Remove from "All Environments"

3. **Mark Sensitive Variables**
   - Click edit on each sensitive var
   - Check "Sensitive" checkbox
   - Save changes

4. **Test Deployment**
   ```bash
   # Trigger a preview deployment
   git push origin feature/test-env-vars
   
   # Check logs for any missing var errors
   vercel logs
   ```

5. **Future: Remove VITE_ Variables**
   - Once backend is fully migrated from Vite
   - Update backend files to use `NEXT_PUBLIC_` or direct env vars
   - Remove `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`

---

## 🚨 Common Issues & Solutions

### Issue: "Missing SUPABASE_SERVICE_ROLE_KEY"
**Solution**: This key is required for server-side operations. Add it to Vercel immediately.

### Issue: "VITE_SUPABASE_URL is undefined"
**Solution**: Keep VITE_ variables until backend migration is complete.

### Issue: "Environment variable not available in production"
**Solution**: Check if variable is scoped correctly in Vercel (Production vs Preview vs Development).

---

## 📝 Notes

- The VITE_ prefixed variables are legacy from a previous Vite setup
- 13 files still reference VITE_SUPABASE variables (mainly in backend)
- 58 files require SUPABASE_SERVICE_ROLE_KEY (critical for API routes)
- Consider using Vercel's environment variable pull feature for local dev:
  ```bash
  vercel env pull .env.local
  ```

---

✅ **Action Items**:
1. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel immediately
2. Mark sensitive variables as "Sensitive"
3. Split variables by environment scope
4. Test deployment after changes
5. Plan migration away from VITE_ variables