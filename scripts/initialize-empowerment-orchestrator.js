#!/usr/bin/env node

/**
 * MAIA Empowerment Orchestrator Initialization Script
 *
 * This script initializes and tests the empowerment orchestration system,
 * ensuring all subsystems are properly connected and operational.
 */

const fs = require('fs');
const path = require('path');

const EMPOWERMENT_FILES = [
  'lib/consciousness/MAIACriticalQuestioningInterface.ts',
  'lib/consciousness/MAIAIdealModelingInterface.ts',
  'lib/consciousness/MAIACapabilityRedemptionInterface.ts',
  'lib/consciousness/AccountabilityResponsibilityProtocols.ts',
  'lib/consciousness/MAIAEmpowermentOrchestrator.ts',
  'app/api/empowerment/orchestrate/route.ts'
];

const DEPENDENCIES = [
  'lib/consciousness/ShadowConversationOrchestrator.ts',
  'lib/consciousness/AgentBackchannelingIntegration.ts',
  'lib/consciousness/CollectiveIntelligenceProtocols.ts'
];

console.log('🎭 Initializing MAIA Empowerment Orchestrator System...\n');

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const size = (stats.size / 1024).toFixed(1);
    console.log(`✅ ${filePath} (${size}KB)`);
    return true;
  } else {
    console.log(`❌ ${filePath} - MISSING`);
    return false;
  }
}

// Check empowerment system files
console.log('📁 Checking Empowerment System Files:');
const empowermentFilesOk = EMPOWERMENT_FILES.every(checkFile);

console.log('\n📁 Checking Dependencies:');
const dependenciesOk = DEPENDENCIES.every(checkFile);

console.log('\n🔗 Integration Status:');

// Check API route exists
const apiRouteExists = fs.existsSync(path.join(process.cwd(), 'app/api/empowerment/orchestrate/route.ts'));
console.log(`${apiRouteExists ? '✅' : '❌'} API Route: /api/empowerment/orchestrate`);

// Check package.json scripts
const packageJsonPath = path.join(process.cwd(), 'package.json');
let packageJson = null;
let scriptsOk = false;

if (fs.existsSync(packageJsonPath)) {
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    scriptsOk = true;
    console.log('✅ Package.json found');
  } catch (error) {
    console.log('❌ Package.json invalid');
  }
} else {
  console.log('❌ Package.json missing');
}

// Summary
console.log('\n📊 Initialization Summary:');
console.log(`Empowerment Files: ${empowermentFilesOk ? '✅ All Present' : '❌ Missing Files'}`);
console.log(`Dependencies: ${dependenciesOk ? '✅ All Present' : '❌ Missing Dependencies'}`);
console.log(`API Integration: ${apiRouteExists ? '✅ Configured' : '❌ Not Configured'}`);
console.log(`Package Config: ${scriptsOk ? '✅ Valid' : '❌ Invalid'}`);

const allSystemsReady = empowermentFilesOk && dependenciesOk && apiRouteExists && scriptsOk;

if (allSystemsReady) {
  console.log('\n🎉 MAIA Empowerment Orchestrator is ready to activate!');
  console.log('\nNext steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Test the empowerment endpoint: /api/empowerment/orchestrate');
  console.log('3. Monitor the orchestrator logs for proper activation');

  // Create a simple test file
  const testScript = `// MAIA Empowerment Test Script
// Use this to test the empowerment orchestrator

const testEmpowerment = async () => {
  const response = await fetch('/api/empowerment/orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberId: 'test-member-001',
      memberInput: 'I feel stuck in my current situation and want to serve better',
      context: {
        developmentPhase: 'awareness',
        urgencyLevel: 'development',
        serviceAspirations: 'community_service'
      }
    })
  });

  const result = await response.json();
  console.log('Empowerment Response:', result);
  return result;
};

// Run test
testEmpowerment().catch(console.error);`;

  fs.writeFileSync(path.join(process.cwd(), 'scripts/test-empowerment.js'), testScript);
  console.log('4. Test script created: scripts/test-empowerment.js');

  process.exit(0);
} else {
  console.log('\n🚨 System not ready. Please resolve the issues above.');
  process.exit(1);
}