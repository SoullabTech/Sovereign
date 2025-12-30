# Domain Transfer Instructions

## 🎯 Current Status

✅ **DNS Records**: Correctly configured

- `soullab.life` → `76.76.21.21` (Vercel A-record)
- `oracle.soullab.life` → `cname.vercel-dns.com` (Vercel CNAME)

✅ **Production App**: Working perfectly

- https://spiralogic-oracle-system.vercel.app/ (HTTP/2 200)

❌ **Domain Assignment**: Domains assigned to different Vercel project

- Error: "Cannot add soullab.life since it's already assigned to another project"

## 🔧 Resolution Steps

### Option 1: Transfer Domains (Recommended)

1. **Find the current project**:

   - Go to: https://vercel.com/dashboard
   - Check all teams/accounts in dropdown:
     - soullab's projects
     - soullab-025ab39a
     - soullab-badc0d59
     - Spiralogic Oracle System

2. **Locate domains in old project**:

   - Search each team for projects containing `soullab.life`
   - Go to Project → Settings → Domains

3. **Remove from old project**:

   - Click the domain → Remove/Delete
   - Confirm removal

4. **Add to current project**:
   - Go to: https://vercel.com/spiralogic-oracle-system/spiralogic-oracle-system/settings/domains
   - Add domain: `soullab.life`
   - Add domain: `oracle.soullab.life`

### Option 2: CLI Domain Transfer

```bash
# Switch to the team that owns the domains
npx vercel switch

# Remove domains from old project (if you have access)
npx vercel domains rm soullab.life
npx vercel domains rm oracle.soullab.life

# Switch back to current project
npx vercel switch spiralogic-oracle-system

# Add domains to current project
npx vercel domains add soullab.life
npx vercel domains add oracle.soullab.life
```

### Option 3: Contact Support

If you can't access the old project:

- Email: support@vercel.com
- Subject: "Transfer domains between projects"
- Include: Domain names and both project URLs

## 🧪 Verification Commands

After transferring domains, test with:

```bash
# Should return HTTP/2 200 for all:
curl -I https://spiralogic-oracle-system.vercel.app/
curl -I https://soullab.life/
curl -I https://oracle.soullab.life/

# Or run the automated checker:
./setup-domains.sh
```

## 📋 Quick Checklist

- [ ] DNS records configured (✅ DONE)
- [ ] Find old project with domains
- [ ] Remove domains from old project
- [ ] Add domains to current project
- [ ] Verify all URLs return HTTP/2 200
- [ ] 🎉 Celebrate complete deployment!

## 🚀 Once Complete

All three URLs will serve your SpiralogicOracleSystem:

- Production: https://spiralogic-oracle-system.vercel.app/
- Primary: https://soullab.life/
- Oracle: https://oracle.soullab.life/
