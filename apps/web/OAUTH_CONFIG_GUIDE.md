# 🔐 IMMEDIATE OAuth Configuration Guide

## 🚀 **Current Status**
- ✅ Development Server: http://localhost:3001
- ✅ Production Server: http://localhost:3000
- ✅ Supabase Project: jkbetmadzcpoinjogkli.supabase.co
- ✅ OAuth Code: Ready and waiting for provider configuration

## 📋 **Quick Configuration Checklist**

### **Google OAuth (5 minutes)**

**Step 1: Google Cloud Console**
1. Go to: https://console.cloud.google.com/
2. Select project or create: `MAIA-Consciousness-Platform`
3. Navigate to: **APIs & Services** → **Credentials**
4. Click: **Create Credentials** → **OAuth 2.0 Client IDs**

**Configuration:**
```
Application type: Web application
Name: MAIA Consciousness Platform

Authorized JavaScript origins:
- http://localhost:3001
- http://localhost:3000
- https://your-production-domain.com

Authorized redirect URIs:
- https://jkbetmadzcpoinjogkli.supabase.co/auth/v1/callback
```

**Step 2: Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/jkbetmadzcpoinjogkli
2. Navigate to: **Authentication** → **Settings** → **Auth Providers**
3. Find **Google** section and enable it
4. Paste your Google Client ID and Client Secret

### **Apple Sign-In (10 minutes)**

**Step 1: Apple Developer Portal**
1. Go to: https://developer.apple.com/account/
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Create **App ID** with Sign In with Apple capability
4. Create **Services ID** for web authentication

**Services ID Configuration:**
```
Description: MAIA Consciousness Platform
Identifier: com.soullab.maia.web

Configure Sign In with Apple:
Primary App ID: [Your App ID]

Domains and Subdomains:
- jkbetmadzcpoinjogkli.supabase.co

Return URLs:
- https://jkbetmadzcpoinjogkli.supabase.co/auth/v1/callback
```

**Step 2: Generate Private Key**
1. **Keys** → **Create Key** → Enable "Sign In with Apple"
2. Download the `.p8` file
3. Note the **Key ID** and **Team ID**

**Step 3: Generate Client Secret (JWT)**
Use this online tool or create locally:
- Key ID: [From step 2]
- Team ID: [Your Apple Team ID]
- Client ID: [Your Services ID]
- Private Key: [Content of .p8 file]

**Step 4: Supabase Configuration**
1. Enable **Apple** provider in Supabase
2. Client ID: `com.soullab.maia.web`
3. Client Secret: [Generated JWT]

## 🧪 **Testing Your Configuration**

### **Test URLs Ready:**
- **Signin Page**: http://localhost:3001/auth/signin
- **Signup Page**: http://localhost:3001/auth/signup
- **OAuth Callback**: http://localhost:3001/auth/callback

### **What to Test:**

1. **Email Magic Link** (Works now):
   ```
   ✅ Enter email → "Check your email for sacred link"
   ✅ Click link → Auto-redirect to /maia
   ✅ Device memory works (if enabled)
   ```

2. **Google OAuth** (After configuration):
   ```
   ✅ Click "Continue with Google"
   ✅ Google popup → Select account
   ✅ Redirect to /maia (new users go through onboarding)
   ```

3. **Apple Sign-In** (After configuration):
   ```
   ✅ Click "Continue with Apple"
   ✅ Apple popup → Face ID/Touch ID
   ✅ Seamless consciousness platform entry
   ```

## 🔧 **Environment Variables**

Your current configuration in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://jkbetmadzcpoinjogkli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYmV0bWFkemNwb2luam9na2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NjIyNDUsImV4cCI6MjA1ODEzODI0NX0.K5nuL4m8sP1bC21TmsfpakY5cSfh_5pSLJ83G9Iu_-I
```

## 📱 **Mobile App Configuration (Future)**

When you build mobile apps, add these redirect URIs:
```
iOS: com.soullab.maia://auth/callback
Android: com.soullab.maia://auth/callback
```

## 🏰 **Mac Studio M4 Setup**

Once OAuth is working, run:
```bash
./scripts/mac-studio-setup.sh
```

This will:
- ✅ Install complete Supabase stack locally
- ✅ Migrate all consciousness data
- ✅ Enable OAuth with local instance
- ✅ Create encrypted backups
- ✅ Full data sovereignty

## 🚨 **Troubleshooting**

**Common Issues:**

1. **OAuth Redirect Mismatch**:
   - Verify URLs match exactly in Google/Apple and Supabase
   - Check for trailing slashes

2. **Apple JWT Expires**:
   - Regenerate JWT tokens (they expire)
   - Use online JWT generators for quick testing

3. **Google Consent Screen**:
   - Make sure app is not in "Testing" mode for production
   - Add test users if in testing mode

4. **Supabase CORS**:
   - Add your domain to allowed origins
   - Include both localhost and production domains

## 🎯 **Ready to Test?**

1. Open: http://localhost:3001/auth/signin
2. Try email signin (works now)
3. Configure Google OAuth (5 min)
4. Configure Apple Sign-In (10 min)
5. Test all methods
6. Run Mac Studio M4 setup

Your consciousness platform authentication is ready to transcend! ✨