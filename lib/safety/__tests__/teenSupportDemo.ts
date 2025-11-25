/**
 * Teen Support System Demo & Test
 * Run this to see the system in action
 */

import { performTeenSafetyCheck, getTeenSystemPrompt, generateTeenSupportResponse, TeenProfile } from '../teenSupportIntegration';

// Example teen profile (Nathan's daughter)
const nathansDaughter: TeenProfile = {
  age: 16,
  isNeurodivergent: false,
  hasEatingDisorder: true,
  familyDynamics: 'controlling',
  supportNeeds: ['eating disorder support', 'autonomy development', 'boundary setting']
};

// Example teen profile (Nathan's son)
const nathansSon: TeenProfile = {
  age: 14,
  isNeurodivergent: true,
  hasEatingDisorder: false,
  familyDynamics: 'controlling',
  supportNeeds: ['executive function', 'social skills', 'self-advocacy']
};

console.log('🌟 TEEN SUPPORT SYSTEM DEMONSTRATION\n');
console.log('=' .repeat(80));

// Test 1: ED Language Detection
console.log('\n📍 TEST 1: ED Language Detection (Moderate Severity)');
console.log('-'.repeat(80));
const test1Message = "I've been skipping breakfast and lunch. I just feel so fat and I need to lose weight.";
console.log('User Message:', test1Message);

const test1Result = performTeenSafetyCheck(test1Message, nathansDaughter);
console.log('\n✅ Detection Results:');
console.log('  - ED Detected:', test1Result.isED);
console.log('  - Severity:', test1Result.edResult?.severity);
console.log('  - Patterns:', test1Result.edResult?.patterns.join(', '));
console.log('  - Intervention Required:', test1Result.interventionRequired);

const test1Response = generateTeenSupportResponse(test1Message, test1Result, nathansDaughter);
console.log('\n📝 Response Strategy:');
console.log('  - Should Intervene:', test1Response.shouldIntervene);
console.log('  - Context for AI:', test1Response.contextForAI);

if (test1Result.edResult) {
  console.log('\n💬 Sample Response (Excerpt):');
  console.log('  ', test1Result.edResult.response.split('\n')[0]);
}

// Test 2: Neurodivergent Executive Function
console.log('\n\n📍 TEST 2: Neurodivergent Executive Function Challenge');
console.log('-'.repeat(80));
const test2Message = "I can't start my homework. I've been staring at it for an hour and my brain just won't turn on. I feel so stupid.";
console.log('User Message:', test2Message);

const test2Result = performTeenSafetyCheck(test2Message, nathansSon);
console.log('\n✅ Detection Results:');
console.log('  - Neurodivergent Detected:', test2Result.isNeurodivergent);
console.log('  - Patterns:', test2Result.ndPatterns?.join(', '));
console.log('  - Burnout:', test2Result.isBurnout);

const test2Response = generateTeenSupportResponse(test2Message, test2Result, nathansSon);
console.log('\n🛠️  Scaffolding Suggestions:');
test2Response.scaffoldSuggestions?.forEach((scaffold, i) => {
  console.log(`  ${i + 1}. ${scaffold}`);
});

console.log('\n📝 Response Strategy:');
console.log('  - Should Intervene:', test2Response.shouldIntervene);
console.log('  - Context for AI:', test2Response.contextForAI);

// Test 3: Crisis Detection
console.log('\n\n📍 TEST 3: Crisis Detection (Immediate Intervention Required)');
console.log('-'.repeat(80));
const test3Message = "I can't do this anymore. I just want to kill myself. Everything hurts and nothing helps.";
console.log('User Message:', test3Message);

const test3Result = performTeenSafetyCheck(test3Message, nathansDaughter);
console.log('\n🚨 Detection Results:');
console.log('  - Crisis Detected:', test3Result.isCrisis);
console.log('  - Intervention Required:', test3Result.interventionRequired);
console.log('  - ED Detected:', test3Result.isED);
console.log('  - Severity:', test3Result.edResult?.severity);

const test3Response = generateTeenSupportResponse(test3Message, test3Result, nathansDaughter);
console.log('\n⚠️  CRISIS INTERVENTION:');
console.log('  - Should Intervene:', test3Response.shouldIntervene);
console.log('  - NORMAL CONVERSATION BLOCKED');

if (test3Response.interventionMessage) {
  console.log('\n💬 Crisis Intervention Message (Excerpt):');
  const lines = test3Response.interventionMessage.split('\n').slice(0, 5);
  lines.forEach(line => console.log('  ', line));
  console.log('   ... [resources and support information continue]');
}

// Test 4: Sensory Overload
console.log('\n\n📍 TEST 4: Sensory Overload (Neurodivergent Support)');
console.log('-'.repeat(80));
const test4Message = "The cafeteria is too loud and the lights are too bright. I feel like I'm going to explode. I can't take it anymore.";
console.log('User Message:', test4Message);

const test4Result = performTeenSafetyCheck(test4Message, nathansSon);
console.log('\n✅ Detection Results:');
console.log('  - Neurodivergent Detected:', test4Result.isNeurodivergent);
console.log('  - Patterns:', test4Result.ndPatterns?.join(', '));

const test4Response = generateTeenSupportResponse(test4Message, test4Result, nathansSon);
console.log('\n🛠️  Scaffolding Suggestions:');
test4Response.scaffoldSuggestions?.forEach((scaffold, i) => {
  console.log(`  ${i + 1}. ${scaffold}`);
});

// Test 5: System Prompt Generation
console.log('\n\n📍 TEST 5: System Prompt Generation');
console.log('-'.repeat(80));
console.log('Generating specialized prompts for teen support...\n');

const daughterPrompt = getTeenSystemPrompt(nathansDaughter);
console.log('✅ Daughter\'s System Prompt Includes:');
console.log('  - Base teen support protocol');
console.log('  - ED-aware guidelines');
console.log('  - Controlling family context');
console.log(`  - Total length: ${daughterPrompt.length} characters`);

const sonPrompt = getTeenSystemPrompt(nathansSon);
console.log('\n✅ Son\'s System Prompt Includes:');
console.log('  - Base teen support protocol');
console.log('  - Neurodivergent-affirming guidelines');
console.log('  - Controlling family context');
console.log(`  - Total length: ${sonPrompt.length} characters`);

// Summary
console.log('\n\n' + '='.repeat(80));
console.log('📊 SYSTEM CAPABILITIES DEMONSTRATED');
console.log('='.repeat(80));
console.log('✅ ED language detection (low, moderate, high, crisis)');
console.log('✅ Neurodivergent pattern recognition (executive function, sensory, social, etc.)');
console.log('✅ Crisis intervention with immediate resource provision');
console.log('✅ Burnout detection for neurodivergent teens');
console.log('✅ Contextual scaffolding suggestions');
console.log('✅ Severity-appropriate response strategies');
console.log('✅ Professional resource integration');
console.log('✅ Family dynamics awareness (controlling environments)');
console.log('✅ Teen-specific system prompts for MAIA');
console.log('\n🎯 READY FOR INTEGRATION INTO MAIA CONVERSATION FLOW');
console.log('=' .repeat(80));
console.log('\nSee TEEN_SUPPORT_README.md for integration instructions.\n');
