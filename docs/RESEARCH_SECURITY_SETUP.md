# MAIA Research Features - Security Setup

## Required Environment Variables

The MAIA self-awareness research system requires two environment variables for security:

### 1. Research UI Access Gate

```bash
RESEARCH_UI_ENABLED=0  # Set to 1 to enable /research/self-awareness page
```

**Default**: Disabled (`0`)
**Location**: Add to `.env.local`

When disabled, accessing `/research/self-awareness` returns 404.

### 2. Research API Key

```bash
MAIA_RESEARCH_KEY=your-secret-key-here
```

**Required for**: All `/api/maia/metacognition` endpoints
**Location**: Add to `.env.local`

Generate a secure key:
```bash
openssl rand -hex 32
```

## Setup Instructions

1. **Enable Research UI** (optional):
```bash
echo "RESEARCH_UI_ENABLED=1" >> .env.local
```

2. **Set Research API Key**:
```bash
echo "MAIA_RESEARCH_KEY=$(openssl rand -hex 32)" >> .env.local
```

3. **Restart the dev server**:
```bash
npm run dev
```

## API Usage

All research API endpoints require the `x-maia-research-key` header:

```bash
curl http://localhost:3000/api/maia/metacognition \
  -H "x-maia-research-key: your-key-from-env"
```

Without the correct key, you'll receive:
```json
{
  "success": false,
  "error": "Unauthorized - valid research API key required"
}
```

## Security Notes

- **Never commit** `.env.local` to git (it's in `.gitignore`)
- **Never share** your `MAIA_RESEARCH_KEY` publicly
- Research features are **disabled by default** for safety
- Normal chat endpoints (`/api/between/chat`) **cannot** trigger self-awareness mode
- Users cannot accidentally enable self-awareness from UI

## For Production Deployment

If deploying research features publicly:

1. Use environment variables from your hosting platform
2. Rotate `MAIA_RESEARCH_KEY` regularly
3. Consider adding rate limiting
4. Add IP whitelisting if appropriate
5. Monitor API usage logs

## Testing Without Security (Local Development Only)

To test locally without the API key requirement:

1. Comment out the `requireResearchKey()` calls in `/app/api/maia/metacognition/route.ts`
2. Test your features
3. **IMPORTANT**: Uncomment before committing!

**Do not deploy without authentication enabled.**
