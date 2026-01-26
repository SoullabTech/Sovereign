import { loadSelfletContext } from '../lib/memory/selflet';

async function test() {
  try {
    console.log('Loading selflet context for smoke-test-2f...');
    const result = await loadSelfletContext('smoke-test-2f', [], 'test message');
    console.log('===== RESULT =====');
    console.log('surfacedMessageId:', result.surfacedMessageId);
    console.log('surfacedMessagePrompt:', result.surfacedMessagePrompt?.slice(0, 200));
    console.log('requiredAcknowledgment:', result.requiredAcknowledgment);
    console.log('promptInjection:', result.promptInjection?.slice(0, 100));
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}
test();
