# 🤖 CLAUDE CODE - START HERE

## 🚨 **CRITICAL: This is the CORRECT MAIA Project**

### ✅ **You are in the RIGHT place:**
```
/Users/soullab/MAIA-SOVEREIGN/
```

### ❌ **NEVER work in these directories:**
- `/Users/soullab/MAIA-PAI-SOVEREIGN/` (Uses Vercel/Cloudflare - WRONG PROJECT)
- Any `/apps/web/app/` subdirectories (Legacy - should be deleted)

---

## 🎯 **Quick Verification Commands**

```bash
# Always run this first to confirm you're in the right place:
pwd  # Should output: /Users/soullab/MAIA-SOVEREIGN

# Check for the Claude project identifier:
ls -la .claude-project  # Should exist

# Verify MAIA app structure:
ls app/maia/page.tsx  # Should exist
ls app/intro/page.tsx  # Should exist (with SageTealDaimonWelcome)
```

---

## 🏗️ **Architecture Summary**

### **Main MAIA Interface:**
- **File:** `app/maia/page.tsx`
- **Route:** `/maia`
- **Sign-out redirect:** Fixed to go to `/welcome` (not `/`)

### **Intro/Welcome:**
- **File:** `app/intro/page.tsx`
- **Component:** `components/onboarding/SageTealDaimonWelcome.tsx`
- **Fixed:** No more philosophical mantras or loops

### **Design System:**
- ✅ **Sage/Teal:** `#A0C4C7`, `#7FB5B3`, `#6EE7B7`, `#4DB6AC`
- ✅ **Amber accents:** `#FEF3C7`, `#F59E0B`
- ✅ **Dark navy:** For forms
- ❌ **NO PURPLE** anywhere

---

## 🚀 **Development Commands**

```bash
# Start development server:
npm run dev

# Build for production:
npm run build

# Deploy (when ready):
npm run deploy
```

---

## 📞 **Key Fixed Issues**

1. **Sign-out loop:** Fixed redirect from `/` to `/welcome`
2. **Intro mantras:** Replaced with SageTealDaimonWelcome component
3. **Purple elements:** Converted to sage/teal colors
4. **Directory confusion:** This document prevents future confusion

---

**Last Updated:** 2024-11-29
**Status:** Sign-out loop issue RESOLVED ✅