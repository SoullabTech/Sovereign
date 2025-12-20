// Direct test of Talk mode voice module
import { getTalkModeVoiceInstructions, TALK_MODE_VOICE_CORE, TALK_MODE_GREETING_OVERRIDE } from './lib/maia/talkModeVoice';

console.log('🧪 Testing Talk Mode Voice Module\n');

console.log('='.repeat(70));
console.log('TALK_MODE_VOICE_CORE:');
console.log('='.repeat(70));
console.log(TALK_MODE_VOICE_CORE);
console.log('\n');

console.log('='.repeat(70));
console.log('TALK_MODE_GREETING_OVERRIDE:');
console.log('='.repeat(70));
console.log(TALK_MODE_GREETING_OVERRIDE);
console.log('\n');

console.log('='.repeat(70));
console.log('Full Instructions with userName and water element:');
console.log('='.repeat(70));
const instructions = getTalkModeVoiceInstructions('Kelly', { element: 'water' });
console.log(instructions);
console.log('\n');

console.log('✅ Module loaded successfully!');
console.log('\nKey checks:');
console.log('- Has principles section:', TALK_MODE_VOICE_CORE.includes('Core Principles'));
console.log('- Has situational guidance:', TALK_MODE_VOICE_CORE.includes('When they ask a question'));
console.log('- Has examples:', TALK_MODE_VOICE_CORE.includes('Hi, can you hear me?'));
console.log('- Warns against "Mm" for questions:', TALK_MODE_VOICE_CORE.includes('NOT for questions'));
