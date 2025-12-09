#!/usr/bin/env node
/**
 * Validates that critical files exist before build
 */

const fs = require('fs');
const path = require('path');

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
  'components/onboarding/TealWelcomeFlow.tsx',
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
];

let allFilesExist = true;

console.log('🔍 Validating critical files...\n');

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);

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
