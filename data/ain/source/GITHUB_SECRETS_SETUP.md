# GitHub Secrets Setup Guide

## 🔐 Required Secrets for CI/CD

### 📁 **Monorepo Secrets** (SpiralogicOracleSystem)

Navigate to: `Settings → Secrets and variables → Actions`

| Secret Name    | Description             | Where to get it            |
| -------------- | ----------------------- | -------------------------- |
| `GITHUB_TOKEN` | Auto-provided by GitHub | ✅ Automatically available |

### 🎨 **Frontend Secrets** (oracle-frontend)

Navigate to: `Settings → Secrets and variables → Actions`

| Secret Name         | Description             | Where to get it             |
| ------------------- | ----------------------- | --------------------------- |
| `VERCEL_TOKEN`      | Vercel deployment token | Vercel → Settings → Tokens  |
| `VERCEL_ORG_ID`     | Vercel organization ID  | Vercel → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel project ID       | Vercel → Project Settings   |
| `VITE_SUPABASE_URL` | Supabase project URL    | Supabase → Settings → API   |
| `VITE_SUPABASE_KEY` | Supabase anon key       | Supabase → Settings → API   |

### ⚙️ **Backend Secrets** (oracle-backend)

Navigate to: `Settings → Secrets and variables → Actions`

| Secret Name              | Description               | Where to get it                            |
| ------------------------ | ------------------------- | ------------------------------------------ |
| `RENDER_DEPLOY_HOOK_URL` | Render deploy hook        | Render → Service → Settings → Deploy Hooks |
| `SUPABASE_URL`           | Supabase project URL      | Supabase → Settings → API                  |
| `SUPABASE_KEY`           | Supabase service role key | Supabase → Settings → API                  |
| `OPENAI_API_KEY`         | OpenAI API key            | OpenAI → API Keys                          |

## 🚀 Setup Instructions

### 1. **Get Vercel Deployment Info**

```bash
npx vercel link
# Follow prompts to link your project
# Copy the project ID from .vercel/project.json
```

### 2. **Get Render Deploy Hook**

1. Go to Render Dashboard
2. Select your backend service
3. Navigate to `Settings → Deploy Hooks`
4. Create new deploy hook
5. Copy the webhook URL

### 3. **Get Supabase Credentials**

1. Go to your Supabase project
2. Navigate to `Settings → API`
3. Copy Project URL and API Keys

### 4. **Add Secrets to GitHub**

1. Go to each repository
2. Navigate to `Settings → Secrets and variables → Actions`
3. Click "New repository secret"
4. Add each secret with exact name matches

## ✅ Verification

Once secrets are added, pushing to `main` will trigger:

- ✅ Monorepo → Auto-sync to subrepos
- ✅ Frontend → Deploy to Vercel
- ✅ Backend → Deploy to Render

---

🔒 **Security Note**: Never commit actual secret values to repositories.
