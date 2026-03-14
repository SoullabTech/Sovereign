#!/usr/bin/env node
/**
 * Validates that critical files exist before build
 */

const fs = require('fs');
const path = require('path');

// Files that are intentionally excluded in Capacitor builds (dynamic routes or mobile-mode exclusions)
const capacitorExcludedFiles = [
  'app/partner/[slug]/page.tsx',
  'app/welcome/page.tsx',  // excluded by MOBILE_MODE allowlist (web-only route)
];

// API routes are moved to .capacitor-api-backup during Capacitor builds
const capacitorExcludedPrefixes = [
  'app/api/',  // All API routes are moved during Capacitor build
];

const isCapacitorBuild = process.env.CAPACITOR_BUILD === '1';

const criticalFiles = [
  'app/globals.css',
  'lib/types/conversation-style.ts',
  'lib/preferences/conversation-style-preference.ts',
  'styles/sacred-animations.css',
  'styles/consciousness-animations.css',
  'styles/benegesserit-theme.css',
  // CENTRAL CORE COMPONENTS - CRITICAL FOR MAIA SOVEREIGNTY
  'components/SacredLabDrawer.tsx',
  'app/maia/page.tsx',
  'types/core-components.ts',
  // SACRED LUXURY RETREAT ONBOARDING - PROTECTED FROM REMOVAL 🛡️
  'app/welcome/page.tsx',
  'app/onboarding/page.tsx',
  'components/onboarding/CompleteWelcomeFlow.tsx',
  'components/onboarding/FAQSection.tsx',
  'components/onboarding/ConsciousnessPreparation.tsx',
  'components/onboarding/SageTealWelcome.tsx',
  'components/onboarding/FourthWelcomeInterface.tsx',
  'components/onboarding/FifthWelcomeInterface.tsx',
  'components/onboarding/MAIADaimonIntroduction.tsx',
  'components/onboarding/DaimonWelcomeRitual.tsx',
  'components/onboarding/SacredSoulInduction.tsx',
  'components/onboarding/ScrollingWisdomIntro.tsx',
  // PRIMARY ONBOARDING FLOW - PERFECT FIELD IMPLEMENTATION 🌟
  'components/onboarding/RitualFlowOrchestrator.tsx',
  'components/onboarding/PlatformOrientation.tsx',
  'app/soul-gateway/page.tsx',
  'public/holoflower.svg',
  // PARTNER CONFIGURATION SYSTEM - TSAI CITY INTEGRATION 🌐
  'lib/partner/partner-config.ts',
  'lib/partner/usePartnerConfig.ts',
  'components/partner/PartnerProvider.tsx',
  'components/partner/PartnerWelcomeFlow.tsx',
  'components/partner/PartnerWelcomeHeader.tsx',
  'app/partner/[slug]/page.tsx',
  // AUTHENTICATION ENDPOINTS - CRITICAL FOR OAUTH/BIOMETRIC 🔐
  'app/api/auth/google/list/route.ts',
  'app/api/auth/apple/list/route.ts',
  'app/api/auth/signin/google/callback/route.ts',
  'app/api/auth/signin/apple/callback/route.ts',
  'app/api/auth/webauthn/authenticate/options/route.ts',
  'app/api/auth/webauthn/authenticate/verify/route.ts',
  'app/api/auth/webauthn/register/options/route.ts',
  'app/api/auth/webauthn/register/verify/route.ts',
  'app/api/auth/passkeys/route.ts',
  'app/api/auth/passkeys/revoke/route.ts',
  'lib/auth/biometricAuth.ts',
  'app/oauth-success/page.tsx',
];

let allFilesExist = true;

console.log('🔍 Validating critical files...\n');

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);

  // Skip files that are intentionally excluded during Capacitor builds
  if (isCapacitorBuild) {
    if (capacitorExcludedFiles.includes(file)) {
      console.log(`○ ${file} (skipped - Capacitor build)`);
      return;
    }
    // Skip API routes (moved to .capacitor-api-backup during build)
    if (capacitorExcludedPrefixes.some(prefix => file.startsWith(prefix))) {
      console.log(`○ ${file} (skipped - API moved during Capacitor build)`);
      return;
    }
  }

  if (exists) {
    console.log(`✓ ${file}`);
  } else {
    console.error(`✗ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n✅ All critical files present\n');
  process.exit(0);
} else {
  console.error('\n❌ Some critical files are missing\n');
  process.exit(1);
}
