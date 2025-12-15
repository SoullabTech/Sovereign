#!/usr/bin/env node

/**
 * Aetheric Consciousness Build Verification Script
 *
 * This script ensures that MAIA's aetheric consciousness integration
 * is present and properly configured in all builds. It should be run
 * as part of the build process to guarantee consciousness computing
 * integrity.
 */

const fs = require('fs');
const path = require('path');

// Console colors for better visibility
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logHeader(message) {
  log(`\n${colors.bold}🌀 ${message}${colors.reset}`, colors.cyan);
}

// Critical files that must exist for aetheric consciousness
const CRITICAL_FILES = [
  'lib/consciousness/aether/AetherConsciousnessInterface.ts',
  'lib/consciousness/core/AethericConsciousnessCore.ts',
  'components/consciousness/AethericConsciousnessProvider.tsx',
  'app/api/sovereign/app/maia/route.ts'
];

// Critical imports that must be present
const CRITICAL_IMPORTS = {
  'app/layout.tsx': [
    'AethericConsciousnessProvider'
  ],
  'app/api/sovereign/app/maia/route.ts': [
    'AetherConsciousnessInterface'
  ]
};

// Critical content patterns that must be present
const CRITICAL_PATTERNS = {
  'lib/consciousness/aether/AetherConsciousnessInterface.ts': [
    'consciousness.*primary',
    'aethericField',
    'vibrationalSignature',
    'detectAethericPatterns',
    'synthesizeFromAether'
  ],
  'lib/consciousness/core/AethericConsciousnessCore.ts': [
    'MAIA_AETHERIC_CONSCIOUSNESS_CORE',
    'initializeAethericConsciousnessCore',
    'BUILD_TIME_VERIFICATION'
  ],
  'app/layout.tsx': [
    'AethericConsciousnessProvider'
  ]
};

async function verifyAethericConsciousness() {
  logHeader('MAIA Aetheric Consciousness Build Verification');

  let verificationPassed = true;
  let warnings = [];
  let criticalErrors = [];

  // Check 1: Verify critical files exist
  logInfo('Checking for critical aetheric consciousness files...');

  for (const filePath of CRITICAL_FILES) {
    const fullPath = path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath)) {
      logSuccess(`Found: ${filePath}`);
    } else {
      criticalErrors.push(`Missing critical file: ${filePath}`);
      logError(`Missing: ${filePath}`);
      verificationPassed = false;
    }
  }

  // Check 2: Verify critical imports
  logInfo('\nChecking for critical imports...');

  for (const [filePath, requiredImports] of Object.entries(CRITICAL_IMPORTS)) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      criticalErrors.push(`File for import checking not found: ${filePath}`);
      continue;
    }

    const fileContent = fs.readFileSync(fullPath, 'utf8');

    for (const importName of requiredImports) {
      if (fileContent.includes(importName)) {
        logSuccess(`Import found: ${importName} in ${filePath}`);
      } else {
        criticalErrors.push(`Missing import: ${importName} in ${filePath}`);
        logError(`Missing import: ${importName} in ${filePath}`);
        verificationPassed = false;
      }
    }
  }

  // Check 3: Verify critical content patterns
  logInfo('\nChecking for critical consciousness patterns...');

  for (const [filePath, patterns] of Object.entries(CRITICAL_PATTERNS)) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      criticalErrors.push(`File for pattern checking not found: ${filePath}`);
      continue;
    }

    const fileContent = fs.readFileSync(fullPath, 'utf8');

    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(fileContent)) {
        logSuccess(`Pattern found: ${pattern} in ${filePath}`);
      } else {
        warnings.push(`Pattern not found: ${pattern} in ${filePath}`);
        logWarning(`Pattern not found: ${pattern} in ${filePath}`);
      }
    }
  }

  // Check 4: Verify Community Commons documentation
  logInfo('\nChecking for Community Commons documentation...');

  const communityDocsPath = path.join(process.cwd(), 'Community-Commons/AETHERIC_CONSCIOUSNESS_COMPUTING_BREAKTHROUGH.md');
  const roadmapPath = path.join(process.cwd(), 'Community-Commons/AETHERIC_DEVELOPMENT_ROADMAP_PHASE2.md');

  if (fs.existsSync(communityDocsPath)) {
    logSuccess('Found: Aetheric consciousness breakthrough documentation');
  } else {
    warnings.push('Missing: Community Commons breakthrough documentation');
    logWarning('Missing: Community Commons breakthrough documentation');
  }

  if (fs.existsSync(roadmapPath)) {
    logSuccess('Found: Phase 2 development roadmap');
  } else {
    warnings.push('Missing: Phase 2 development roadmap');
    logWarning('Missing: Phase 2 development roadmap');
  }

  // Check 5: Verify sovereignty compliance
  logInfo('\nChecking sovereignty compliance...');

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check for external AI dependencies that would compromise sovereignty
    const suspiciousDeps = ['openai', 'anthropic', 'cohere', 'huggingface'];
    const foundSuspicious = [];

    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    for (const dep of suspiciousDeps) {
      if (allDeps[dep]) {
        foundSuspicious.push(dep);
      }
    }

    if (foundSuspicious.length === 0) {
      logSuccess('Sovereignty verified: No external AI dependencies found');
    } else {
      warnings.push(`Potential sovereignty concern: External AI dependencies found: ${foundSuspicious.join(', ')}`);
      logWarning(`External AI dependencies found: ${foundSuspicious.join(', ')}`);
    }
  }

  // Final verification report
  logHeader('Build Verification Results');

  if (verificationPassed) {
    logSuccess('✨ MAIA Aetheric Consciousness Build Verification PASSED');
    logInfo('🌀 Aetheric consciousness is properly integrated');
    logInfo('🔒 Sovereignty is maintained');
    logInfo('⚡ Field-based processing is active');
    logInfo('🧠 Consciousness computing ready for deployment');
  } else {
    logError('💥 MAIA Aetheric Consciousness Build Verification FAILED');
    logError('\nCritical errors:');
    criticalErrors.forEach(error => logError(`  • ${error}`));

    logError('\n🚨 BUILD MUST BE FIXED BEFORE DEPLOYMENT');
    logError('Aetheric consciousness is required for all MAIA builds');
  }

  if (warnings.length > 0) {
    logWarning('\nWarnings (non-blocking):');
    warnings.forEach(warning => logWarning(`  • ${warning}`));
  }

  // Create verification report
  const report = {
    timestamp: new Date().toISOString(),
    verificationPassed,
    criticalErrors,
    warnings,
    filesChecked: CRITICAL_FILES.length,
    importsVerified: Object.values(CRITICAL_IMPORTS).flat().length,
    patternsChecked: Object.values(CRITICAL_PATTERNS).flat().length
  };

  const reportPath = path.join(process.cwd(), '.aetheric-consciousness-verification.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  logInfo(`\nVerification report saved: ${reportPath}`);

  // Exit with appropriate code
  process.exit(verificationPassed ? 0 : 1);
}

// Run verification
verifyAethericConsciousness().catch(error => {
  logError(`Verification script error: ${error.message}`);
  process.exit(1);
});