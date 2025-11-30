# MAIA-SOVEREIGN Project Structure

## ⚠️ CRITICAL: Correct Working Directory

**THE CORRECT PROJECT IS:** `/Users/soullab/MAIA-SOVEREIGN/`

**❌ DO NOT WORK IN:** `/Users/soullab/MAIA-PAI-SOVEREIGN/` (This is a different project)

## Current Working Directory
```bash
pwd  # Should show: /Users/soullab/MAIA-SOVEREIGN
```

## Key Files Fixed

### 🎯 Sign-Out Flow
- **File:** `/app/maia/page.tsx:241-245`
- **Fix:** Changed redirect from `/` to `/welcome` for proper sage/teal experience

### 🎨 Intro Page
- **File:** `/app/intro/page.tsx`
- **Fix:** Replaced philosophical mantras with `SageTealDaimonWelcome` component
- **Component:** `/components/onboarding/SageTealDaimonWelcome.tsx`

## Design Standards

### ✅ Approved Colors (Sage/Teal + Dark Navy)
- Sage: `#A0C4C7`, `#7FB5B3`
- Teal: `#6EE7B7`, `#4DB6AC`
- Amber accents: `#FEF3C7`, `#F59E0B`
- Dark Navy: For sign-up forms

### ❌ Banned Colors
- **NO PURPLE** anywhere in the application
- Remove any `purple`, `violet`, `indigo` color references

## Language Guidelines

### ✅ Authentic Language
- Use "soulful" or "soul" - authentic and genuine
- "Conscious technology" - direct and honest
- "Reflective AI" - clear about what MAIA does
- Focus on what we DO, not performative claims

### ❌ Banned Language (No Cringe)
- **NO "sacred"** - sacred is what we do, not what we say
- **NO mystical/performative language**
- **NO "chosen" or "transmission"**
- **NO ceremonial/ritual language in copy**

## User Flow (Production)

1. **www.soullab.life** → Sage/teal welcome experience
2. **Sign up** → Dark navy sign-up form
3. **Welcome back** → Sage/teal welcome back page
4. **Sign out** → Redirects to `/welcome` (sage/teal experience)

## Architecture Notes

- Use `SageTealDaimonWelcome` component for all welcome experiences
- No philosophical mantras or wisdom quote cycling
- Clean, consistent sage/teal branding throughout
- All popups and microphone interference removed

---
**Last Updated:** 2024-11-29 - Fixed intro/onboarding sign-out loop issue