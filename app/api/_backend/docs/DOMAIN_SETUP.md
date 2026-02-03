# Custom Domain Setup Instructions

## Current Status ✅

- **Production URL**: https://spiralogic-oracle-system.vercel.app
- **Status**: HTTP/2 200 OK
- **Build**: Next.js 13 App Router with Tailwind CSS ✅
- **Deployment Protection**: Disabled for production domain

## Add Custom Domains via Vercel Dashboard

### Step 1: Access Domain Settings

1. Go to: https://vercel.com/spiralogic-oracle-system/spiralogic-oracle-system/settings/domains
2. Click "Add Domain"

### Step 2: Add Domains

Add these domains one by one:

- `soullab.life`
- `oracle.soullab.life`

### Step 3: Configure DNS

After adding domains, Vercel will provide DNS configuration instructions.

**For soullab.life (root domain):**

- Type: A Record
- Name: @
- Value: 76.76.21.21

**For oracle.soullab.life (subdomain):**

- Type: CNAME
- Name: oracle
- Value: cname.vercel-dns.com

### Step 4: Verify Setup

Once DNS propagates (up to 24 hours), test:

```bash
curl -I https://soullab.life/
curl -I https://oracle.soullab.life/
```

Both should return: `HTTP/2 200`

## Alternative: Transfer Domain Access

If domains are registered elsewhere:

1. In Vercel Dashboard → Domains → Import Domain
2. Follow ownership verification steps
3. Update nameservers to Vercel's NS records

## Current Working URLs

- Production: https://spiralogic-oracle-system.vercel.app ✅
- Preview: https://spiralogic-oracle-system-68d600k6q-spiralogic-oracle-system.vercel.app (401 - protected)
