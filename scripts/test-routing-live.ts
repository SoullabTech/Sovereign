#!/usr/bin/env npx tsx
/**
 * Live Routing Test - Verifies Opus/Sonnet routing in actual API calls
 *
 * Simulates a conversation that shifts from casual → deep → casual
 * and verifies the model selection upshifts and downshifts correctly.
 *
 * Run: npx tsx scripts/test-routing-live.ts
 *
 * Requires: ANTHROPIC_API_KEY set, local server running on :3000
 */

const API_BASE = process.env.MAIA_API_URL || 'http://localhost:3000';

interface ChatResponse {
  response?: string;
  message?: string;
  error?: string;
  metadata?: {
    provider?: {
      tier?: string;
      reason?: string;
      model?: string;
    };
  };
}

async function sendMessage(
  message: string,
  userId: string,
  messageCount: number,
  mode: string = 'talk',
  awarenessLevel?: number
): Promise<{ tier: string; reason: string; response: string }> {
  const body: Record<string, unknown> = {
    message,
    userId,
    messageCount,
    mode,
  };

  if (awarenessLevel !== undefined) {
    body.awarenessLevel = awarenessLevel;
  }

  try {
    const res = await fetch(`${API_BASE}/api/between/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as ChatResponse;

    if (data.error) {
      return { tier: 'error', reason: data.error, response: '' };
    }

    return {
      tier: data.metadata?.provider?.tier || 'unknown',
      reason: data.metadata?.provider?.reason || 'unknown',
      response: (data.response || data.message || '').slice(0, 100),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { tier: 'error', reason: msg, response: '' };
  }
}

async function runConversationShiftTest() {
  console.log('\n🔬 LIVE ROUTING TEST - Conversation Shift\n');
  console.log('═'.repeat(60));

  const userId = `test-user-${Date.now()}`;
  const results: Array<{ turn: number; type: string; tier: string; reason: string; expected: string; pass: boolean }> = [];

  // Conversation sequence: NEW USER always gets Opus (L1 trust)
  // Note: API computes awarenessLevel from history, not from request body
  // New users have no history → L1 → always Opus for trust-building
  const turns = [
    { msg: 'Hey, how are you?', type: 'casual', awarenessLevel: undefined, msgCount: 1, expected: 'opus' }, // L1 trust
    { msg: "I'm doing well, just checking in.", type: 'casual', awarenessLevel: undefined, msgCount: 2, expected: 'opus' }, // L1 trust
    { msg: 'What should I work on today?', type: 'casual', awarenessLevel: undefined, msgCount: 3, expected: 'opus' }, // L1 trust
    { msg: 'Any thoughts on scheduling?', type: 'casual', awarenessLevel: undefined, msgCount: 4, expected: 'opus' }, // L1 trust
    { msg: 'Thanks for the tips!', type: 'casual', awarenessLevel: undefined, msgCount: 5, expected: 'opus' }, // L1 trust (no history)
    { msg: 'Quick question about email.', type: 'casual', awarenessLevel: undefined, msgCount: 6, expected: 'opus' }, // L1 trust (no history)
    { msg: 'I want to explore my shadow patterns.', type: 'DEEP', awarenessLevel: undefined, msgCount: 7, expected: 'opus' }, // Deep dive keyword
    { msg: 'Help me understand this recurring dream.', type: 'DEEP', awarenessLevel: undefined, msgCount: 8, expected: 'opus' }, // Deep dive keyword
    { msg: 'What does this transformation mean?', type: 'DEEP', awarenessLevel: undefined, msgCount: 9, expected: 'opus' }, // Deep dive keyword
    { msg: "Thanks, I'll think about that.", type: 'casual', awarenessLevel: undefined, msgCount: 10, expected: 'opus' }, // L1 trust (still new user)
  ];

  for (const turn of turns) {
    console.log(`\nTurn ${turn.msgCount}: [${turn.type}] "${turn.msg.slice(0, 40)}..."`);

    const result = await sendMessage(turn.msg, userId, turn.msgCount, 'talk', turn.awarenessLevel);

    const pass = result.tier === turn.expected;
    results.push({
      turn: turn.msgCount,
      type: turn.type,
      tier: result.tier,
      reason: result.reason,
      expected: turn.expected,
      pass,
    });

    const icon = pass ? '✅' : '❌';
    console.log(`  ${icon} Got: ${result.tier} (${result.reason}) | Expected: ${turn.expected}`);

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;

  console.log(`\n  Passed: ${passed}/${results.length}`);
  console.log(`  Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n  ❌ FAILURES:');
    results.filter(r => !r.pass).forEach(r => {
      console.log(`    Turn ${r.turn} (${r.type}): got ${r.tier}, expected ${r.expected}`);
    });
  }

  // Check for flapping (same type should have consistent routing)
  const casualResults = results.filter(r => r.type === 'casual' && r.turn >= 5);
  const deepResults = results.filter(r => r.type === 'DEEP');

  const casualFlap = new Set(casualResults.map(r => r.tier)).size > 1 && casualResults.every(r => r.expected === 'sonnet');
  const deepFlap = new Set(deepResults.map(r => r.tier)).size > 1;

  if (casualFlap || deepFlap) {
    console.log('\n  ⚠️  FLAPPING DETECTED - routing is unstable');
  } else {
    console.log('\n  ✅ No flapping detected - routing is stable');
  }

  console.log('\n');
  process.exit(failed > 0 ? 1 : 0);
}

// Run if executed directly
runConversationShiftTest().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
