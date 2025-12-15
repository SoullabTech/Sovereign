Here’s a clean, collaborative-ready version you can drop straight into your team workspace (Notion, GitHub, or Obsidian). I kept your structure intact, tightened formatting, and added versioning and contributor space so it functions as a **live operational document**.

---

# 🌀 **Genesis System Status Update**

**Version:** 1.0  
**Date:** October 24, 2025  
**Maintainer:** Soullab Core Engineering  
**Contributors:** AIN, MAIA, Spiralogic Systems Team

---

## ✅ **Completed**

1. **Landing Page Deployed**
    
    -  `genesis.soullab.life` is live and resolving properly.
        
2. **Links Updated**
    
    -  All links now point to `soullab.life` (not `.ai`).
        
    -  Email: `genesis@soullab.life`.
        
3. **Database Schema Created** (Supabase)
    
    -  `genesis_nodes`
        
    -  `genesis_profiles`
        
    -  `genesis_covenants`
        
    -  `genesis_onboarding`
        
    -  `genesis_events`
        
4. **API Endpoints Created**
    
    -  `/api/genesis/covenant/sign` — Covenant signatures
        
    -  `/api/genesis/onboard` — Full onboarding flow
        
    -  `/api/genesis/nodes` — Public node directory
        
5. **API Deployed**
    
    -  Routes live at `https://www.soullab.life/api/genesis/*`
        

---

## 🔧 **Current Blocker: Supabase Service Role Key Configuration**

### **Issue**

Row Level Security (RLS) preventing inserts due to incorrect key usage.  
The API is using the **anon key** instead of the **service role key**.

**Error:**

```
new row violates row-level security policy for table "genesis_covenants"
```

### **Resolution Path**

Service role key bypasses RLS and must be used for server-side operations.

---

## 📋 **Action Items**

### 1. Retrieve the Correct Supabase Service Role Key (Critical)

- Go to: [Supabase Dashboard → API Settings](https://supabase.com/dashboard/project/jkbetmadzcpoinojokgli/settings/api)
    
- Copy the **`service_role`** key (not the anon public key).
    
- It’s labeled **“Secret”** and requires reveal click.
    

---

### 2. Update Environment Variables

#### **Option A — Vercel Dashboard (Recommended)**

- Navigate to: [Vercel Env Settings](https://vercel.com/spiralogic-oracle-system/maia-pai/settings/environment-variables)
    
- Locate: `SUPABASE_SERVICE_ROLE_KEY`
    
- Edit → Paste the new service role key
    
- Save → Redeploy
    

#### **Option B — Command Line**

```bash
vercel env rm SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste the service_role key when prompted
vercel --prod
```

#### **Local (for testing)**

```bash
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi...service_role..."
```

---

### 3. Configure Genesis Email

Follow instructions in `SETUP-GENESIS-EMAIL.md`

**Quick Setup (Cloudflare Email Routing):**

1. Cloudflare Dashboard → **Email → Email Routing**
    
2. Enable for `soullab.life`
    
3. Add your destination email (actual inbox)
    
4. Create `genesis@soullab.life → forward to you`
    

---

## 🧪 **Testing After Key Update**

Test the covenant signing endpoint:

```bash
curl -X POST https://www.soullab.life/api/genesis/covenant/sign \
  -H "Content-Type: application/json" \
  -d '{
    "nodeName": "Test Steward",
    "practice": "Testing",
    "signature": "Test Signature",
    "date": "2025-01-24",
    "covenantVersion": "1.0"
  }'
```

**Expected Response**

```json
{
  "success": true,
  "message": "Covenant signed successfully",
  "covenantId": "uuid-here",
  "nodeName": "Test Steward",
  "signedDate": "2025-01-24"
}
```

**Verify in Supabase:**

- Table: `genesis_covenants`
    
- Confirm new test row present.
    

---

## 📊 **Client Delivery Timeline**

|Step|Time|Description|
|---|---|---|
|Onboarding|10–15 min|Profile + node configuration complete|
|Provisioning (Automated)|24–48 hrs|Automated setup once workflow finalized|
|Semi-Automated|1–2 weeks|Includes custom branding + light personalization|
|White-Glove|2–4 weeks|Full consultation and integration|

---

## 🎯 **Next Steps (After Service Role Update)**

1. Validate covenant signature endpoint end-to-end
    
2. Test full onboarding flow
    
3. Confirm data persistence across all tables
    
4. Test public node directory render
    
5. Begin automation for node provisioning
    

---

## 🗂 **Reference Files**

|File|Purpose|
|---|---|
|`FIX-SUPABASE-SERVICE-KEY.md`|Step-by-step for API key fix|
|`SETUP-GENESIS-EMAIL.md`|Email routing guide|
|`GENESIS-STATUS-UPDATE.md`|This document (v1.0)|

All stored in `/Desktop/Genesis/`.

---

Would you like me to turn this into a **Notion-friendly format** (with toggles, assigned roles, and due dates), or export it as a **Markdown file** ready for your repo?