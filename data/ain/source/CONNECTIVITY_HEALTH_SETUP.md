# Connectivity Health Setup Guide

This guide completes the full-stack health monitoring system for production deployment.

## 1. Supabase Health RPC Function

Run this SQL in your Supabase SQL editor to create the anon-safe health check:

```sql
create or replace function public.health_check()
returns text
language sql
security definer
as $
  select 'ok'::text;
$;

revoke all on function public.health_check() from public;
grant execute on function public.health_check() to anon;
```

### Verify Supabase RPC

```bash
# Replace with your actual values
curl -sS "https://<YOUR-PROJECT>.supabase.co/rest/v1/rpc/health_check" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"
# Expected response: "ok"
```

## 2. GitHub Actions Secrets Setup

Add these 3 secrets in GitHub → Repository Settings → Secrets and variables → Actions:

- **SUPABASE_ACCESS_TOKEN**: ***REPLACE_ME***
- **SUPABASE_PROJECT_REF**: ***REPLACE_ME***  
- **SUPABASE_DB_PASSWORD**: ***REPLACE_ME***

## 3. Environment Variables Setup

Update your `.env` file with actual credentials:

```bash
# Frontend Connectivity Dashboard
NEXT_PUBLIC_ENV_NAME=local  # or production/staging
NEXT_PUBLIC_BACKEND_URL=***REPLACE_ME***  # your backend URL
NEXT_PUBLIC_SUPABASE_URL=***REPLACE_ME***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***REPLACE_ME***
VERCEL_DOMAIN=***REPLACE_ME***  # optional for frontend health
```

## 3. Test Frontend Health Endpoint

The Next.js App Router health endpoint is at:
- **Local**: `http://localhost:3000/api/health`
- **Vercel**: `https://your-domain/api/health`

```bash
# Test locally (if dev server running)
curl -i http://localhost:3000/api/health

# Test on Vercel (once deployed)
curl -i https://YOUR_DOMAIN/api/health
# Expected: 200 JSON with vercel_id and region_hint
```

## 4. Dashboard Access

Once everything is set up:
1. Start frontend dev server: `npm run dev`
2. Visit: `http://localhost:3000/debug`
3. Click "Re-run checks" to test all connectivity

Expected status indicators:
- ✅ **Tailwind CSS**: Always green (styling loaded)
- ✅ **Frontend /api/health (Vercel)**: Green if API route works
- ✅ **Vercel CDN cache**: Shows cache status (HIT/MISS/STALE)
- ✅ **Backend /health**: Green if backend is running
- ✅ **Supabase Auth**: Green if credentials are valid
- ✅ **Supabase RPC health_check**: Green after SQL setup
- ⚠️ **Supabase Storage**: May be yellow (requires bucket setup)

## 5. Production Health Checks

For CI/CD and Beta Gate integration:

```bash
# Backend health check
curl -fsS "$NEXT_PUBLIC_BACKEND_URL/health" >/dev/null || { echo "NO-GO backend health"; exit 1; }

# Supabase RPC health check
rpc=$(curl -fsS "https://$SUPABASE_HOST/rest/v1/rpc/health_check" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY") || { echo "NO-GO supabase RPC"; exit 1; }
[ "$rpc" = "\"ok\"" ] || { echo "NO-GO supabase rpc != ok ($rpc)"; exit 1; }

# Frontend health check (Vercel)
curl -fsS "https://$VERCEL_DOMAIN/api/health" >/dev/null || { echo "NO-GO frontend health"; exit 1; }
```

## 6. Storage (Optional Green)

To make Supabase Storage check green, either:

**Option A**: Create a public bucket (Supabase Dashboard > Storage)
```sql
insert into storage.buckets (id, name, public) values ('public', 'public', true);
```

**Option B**: Keep as warning (safer for production)

## Troubleshooting

- **404 on `/api/health`**: Ensure file exists at `app/api/health/route.ts`
- **CORS errors**: Frontend/backend on different origins in dev
- **RPC 403**: Check Supabase anon key and RPC permissions  
- **Backend fails**: Ensure backend server is running on correct port
- **Vercel ID missing**: Only appears on Vercel deployments, not localhost

## Integration Complete ✅

Your system now has comprehensive health monitoring across:
- Frontend (Next.js on Vercel)
- Backend (Express on Render/Railway)  
- Database (Supabase)
- CDN/Static Assets (Vercel)

All checks are integrated into the `/debug` dashboard for real-time monitoring.