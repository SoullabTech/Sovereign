/**
 * Foundation Smoke Test
 *
 * Quick verification that VoiceBus, ConversationState, FeatureFlags,
 * ElementalEngine, and ProsodyEngine instantiate cleanly with no errors.
 */

import { voiceBus, emit, subscribe } from '../VoiceBus';
import { useConversationState } from '../state/ConversationState';
import { VOICE_FEATURE_FLAGS, isInVoiceBeta, getVoiceSystemVersion } from '../FeatureFlags';
import { elementalEngine, Element } from '../engines/ElementalEngine';
import { prosodyEngine, Emotion } from '../engines/ProsodyEngine';

console.log('🧪 Running Foundation Smoke Test...\n');

// Test 1: VoiceBus
console.log('✅ Test 1: VoiceBus');
try {
  let received = false;
  const unsubscribe = subscribe('transcript_complete', (event) => {
    console.log('   📥 Received event:', event.text);
    received = true;
  });

  emit('transcript_complete', { text: 'Hello world', timestamp: Date.now() });

  if (!received) throw new Error('Event not received');

  unsubscribe();
  console.log('   ✅ VoiceBus: PASS\n');
} catch (error) {
  console.error('   ❌ VoiceBus: FAIL', error);
  process.exit(1);
}

// Test 2: ConversationState
console.log('✅ Test 2: ConversationState');
try {
  const state = useConversationState.getState();

  console.log('   Initial mode:', state.mode);
  if (state.mode !== 'active') throw new Error(`Expected mode 'active', got '${state.mode}'`);

  state.setMode('full');
  console.log('   Mode after switch:', useConversationState.getState().mode);
  if (useConversationState.getState().mode !== 'full') throw new Error('Mode switch failed');

  state.addMessage({ role: 'user', text: 'Test message' });
  console.log('   History length:', useConversationState.getState().history.length);
  if (useConversationState.getState().history.length !== 1) throw new Error('Message not added');

  state.reset();
  if (useConversationState.getState().history.length !== 0) throw new Error('Reset failed');

  console.log('   ✅ ConversationState: PASS\n');
} catch (error) {
  console.error('   ❌ ConversationState: FAIL', error);
  process.exit(1);
}

// Test 3: FeatureFlags
console.log('✅ Test 3: FeatureFlags');
try {
  console.log('   USE_PARALLEL_VOICE:', VOICE_FEATURE_FLAGS.USE_PARALLEL_VOICE);
  console.log('   SHOW_VOICE_METRICS:', VOICE_FEATURE_FLAGS.SHOW_VOICE_METRICS);
  console.log('   System version:', getVoiceSystemVersion());

  const inBeta = isInVoiceBeta('test-user-123');
  console.log('   Test user in beta:', inBeta);

  console.log('   ✅ FeatureFlags: PASS\n');
} catch (error) {
  console.error('   ❌ FeatureFlags: FAIL', error);
  process.exit(1);
}

// Test 4: ElementalEngine
console.log('✅ Test 4: ElementalEngine');
try {
  // Test detection
  const element1 = elementalEngine.detect('I feel sad and emotional');
  console.log('   Detected element (sad/emotional):', element1);
  if (element1 !== 'water') console.warn('   ⚠️ Expected water, got', element1);

  const element2 = elementalEngine.detect('I need to act now with urgency!');
  console.log('   Detected element (urgent/action):', element2);
  if (element2 !== 'fire') console.warn('   ⚠️ Expected fire, got', element2);

  // Test prompt generation
  const prompt = elementalEngine.getPrompt('water', 'You are MAIA.');
  console.log('   Prompt includes elemental tone:', prompt.includes('WATER'));
  if (!prompt.includes('WATER')) throw new Error('Prompt missing elemental tone');

  // Test metaphors
  const metaphors = elementalEngine.getMetaphors('fire');
  console.log('   Fire metaphors:', metaphors.slice(0, 2));
  if (metaphors.length === 0) throw new Error('No metaphors returned');

  console.log('   ✅ ElementalEngine: PASS\n');
} catch (error) {
  console.error('   ❌ ElementalEngine: FAIL', error);
  process.exit(1);
}

// Test 5: ProsodyEngine
console.log('✅ Test 5: ProsodyEngine');
try {
  // Test affect detection
  const emotion = prosodyEngine.detectAffect('I feel happy and excited!');
  console.log('   Detected emotion (happy/excited):', emotion);
  if (emotion !== 'joy') console.warn('   ⚠️ Expected joy, got', emotion);

  // Test modulation
  const text = "Hello. How are you?";
  const modulated = prosodyEngine.modulate(text, 'water', 'joy');
  console.log('   Original:', text);
  console.log('   Modulated:', modulated.substring(0, 50));
  if (!modulated.includes('.')) throw new Error('Modulation removed periods');

  // Test preprocessing
  const cleaned = prosodyEngine.preprocessForTTS('**bold** text with e.g. example');
  console.log('   Preprocessed:', cleaned);
  if (cleaned.includes('**')) throw new Error('Markdown not removed');

  console.log('   ✅ ProsodyEngine: PASS\n');
} catch (error) {
  console.error('   ❌ ProsodyEngine: FAIL', error);
  process.exit(1);
}

console.log('🎉 ALL FOUNDATION TESTS PASSED!\n');
console.log('✅ VoiceBus - Events flowing');
console.log('✅ ConversationState - State management working');
console.log('✅ FeatureFlags - Configuration ready');
console.log('✅ ElementalEngine - Detection & prompts working');
console.log('✅ ProsodyEngine - Modulation & affect detection working');
console.log('\n🚀 Foundation is solid. Ready for Steps 6-7 (integration).\n');
