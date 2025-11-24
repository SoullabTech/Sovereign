# Vercel Deployment Instructions

## Current Status ✅

- **Production URL**: https://spiralogic-oracle-system.vercel.app
- **Status**: HTTP/2 200 OK (Deployment Protection disabled)
- **Framework**: Next.js 13 App Router
- **CSS**: Tailwind CSS (compiled in production)

## Custom Domain Setup

### Via Vercel Dashboard:

1. Go to https://vercel.com/spiralogic-oracle-system/spiralogic-oracle-system/settings/domains
2. Add domains:
   - `soullab.life`
   - `oracle.soullab.life`
3. Follow DNS configuration instructions

### Via CLI:

```bash
# Add root domain
npx vercel domains add soullab.life

# Add subdomain
npx vercel domains add oracle.soullab.life

# Link to production deployment
npx vercel alias set spiralogic-oracle-system.vercel.app soullab.life
npx vercel alias set spiralogic-oracle-system.vercel.app oracle.soullab.life
```

## DNS Configuration

Add these records to your DNS provider:

### For soullab.life:

- Type: A
- Name: @
- Value: 76.76.21.21

### For oracle.soullab.life:

- Type: CNAME
- Name: oracle
- Value: cname.vercel-dns.com

## Build Configuration

- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.next` (default)

## Environment Variables

Add any required environment variables in:
https://vercel.com/spiralogic-oracle-system/spiralogic-oracle-system/settings/environment-variables

## Deployment Commands

```bash
# Deploy to production
npx vercel --prod

# Deploy with force rebuild
npx vercel --prod --force

# Check deployment status
npx vercel ls
```

## Troubleshooting

1. **CSS not loading**: Ensure `app/globals.css` imports Tailwind directives
2. **404 errors**: Check `.vercelignore` isn't excluding app files
3. **Build failures**: Run `npm run build` locally first
4. **401 errors**: Deployment Protection should be disabled (currently is)
