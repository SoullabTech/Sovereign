/**
 * Test RFS Depth Modulation
 * Validates that Maia can go deep when explicitly invited
 */

import { ResonanceFieldOrchestrator } from '../ResonanceFieldOrchestrator';

describe('RFS Depth Invitation Tests', () => {
  const rfs = new ResonanceFieldOrchestrator();
  const testUserId = 'depth-test-user';

  beforeEach(() => {
    rfs.resetUser(testUserId);
  });

  describe('Depth Detection', () => {
    test('Should detect explicit explanation requests', async () => {
      const explanationRequests = [
        "What do you mean by shadow work?",
        "Can you explain the alchemical phases?",
        "Tell me more about that",
        "I don't understand - what is integration?",
        "How does the field system work?",
        "What's the difference between Nigredo and Albedo?"
      ];

      for (const input of explanationRequests) {
        const response = await rfs.speak(input, testUserId + Math.random());

        console.log(`\nInput: "${input}"`);
        console.log(`Depth detected: ${response.metadata.depthInvitation ? 'YES' : 'NO'}`);

        if (response.metadata.depthInvitation) {
          console.log(`  Type: ${response.metadata.depthInvitation.type}`);
          console.log(`  Allowed tokens: ${response.metadata.depthInvitation.allowedTokens}`);
        }

        console.log(`Response: "${response.message}"`);
        console.log(`Word count: ${response.message?.split(/\s+/).length || 0}`);

        // Should detect depth invitation
        expect(response.metadata.depthInvitation).toBeTruthy();

        // Should allow longer response
        if (response.message) {
          const wordCount = response.message.split(/\s+/).length;
          expect(wordCount).toBeGreaterThan(5); // More than typical RFS
        }
      }
    });

    test('Should NOT detect depth in simple statements', async () => {
      const simpleInputs = [
        "I'm feeling lost",
        "Today was hard",
        "I don't know what to do",
        "Everything hurts"
      ];

      for (const input of simpleInputs) {
        const response = await rfs.speak(input, testUserId + Math.random());

        console.log(`\nInput: "${input}"`);
        console.log(`Depth detected: ${response.metadata.depthInvitation ? 'YES' : 'NO'}`);
        console.log(`Response: "${response.message || '[silence]'}"`);

        // Should NOT detect depth invitation
        expect(response.metadata.depthInvitation).toBeFalsy();

        // Should maintain brief responses
        if (response.message) {
          const wordCount = response.message.split(/\s+/).length;
          expect(wordCount).toBeLessThanOrEqual(5); // Typical RFS brevity
        }
      }
    });

    test('Should detect philosophical inquiries', async () => {
      const philosophicalInputs = [
        "What is the meaning of integration?",
        "Tell me about shadow work",
        "What's the nature of consciousness?",
        "How does transformation happen?"
      ];

      for (const input of philosophicalInputs) {
        const response = await rfs.speak(input, testUserId + Math.random());

        console.log(`\nInput: "${input}"`);
        console.log(`Type: ${response.metadata.depthInvitation?.type}`);
        console.log(`Response length: ${response.message?.length} chars`);

        expect(response.metadata.depthInvitation).toBeTruthy();
        expect(['philosophical', 'theory']).toContain(response.metadata.depthInvitation?.type);
      }
    });
  });

  describe('Field Modulation for Depth', () => {
    test('Field should expand word density for depth invitations', async () => {
      const userId1 = 'depth-test-1';
      const userId2 = 'depth-test-2';

      // Same emotional state, different prompts
      const simpleInput = "I'm stuck";
      const depthInput = "What do you mean by 'stuck'? Can you explain?";

      const simpleResponse = await rfs.speak(simpleInput, userId1);
      const depthResponse = await rfs.speak(depthInput, userId2);

      console.log('\n=== FIELD COMPARISON ===');
      console.log('Simple input field:');
      console.log(`  Word density: ${(simpleResponse.field.wordDensity * 100).toFixed(0)}%`);
      console.log(`  Silence prob: ${(simpleResponse.field.silenceProbability * 100).toFixed(0)}%`);
      console.log(`  Response: "${simpleResponse.message || '[silence]'}"`);

      console.log('\nDepth invitation field:');
      console.log(`  Word density: ${(depthResponse.field.wordDensity * 100).toFixed(0)}%`);
      console.log(`  Silence prob: ${(depthResponse.field.silenceProbability * 100).toFixed(0)}%`);
      console.log(`  Response: "${depthResponse.message}"`);

      // Depth field should have higher word density
      expect(depthResponse.field.wordDensity).toBeGreaterThan(simpleResponse.field.wordDensity);

      // Depth field should have lower silence probability
      expect(depthResponse.field.silenceProbability).toBeLessThan(simpleResponse.field.silenceProbability);
    });

    test('Should allow 200-300 tokens for theory explanations', async () => {
      const input = "Can you explain what the Nigredo phase means?";
      const response = await rfs.speak(input, testUserId);

      console.log('\nTheory explanation:');
      console.log(`Depth type: ${response.metadata.depthInvitation?.type}`);
      console.log(`Allowed tokens: ${response.metadata.depthInvitation?.allowedTokens}`);
      console.log(`Response: "${response.message}"`);

      expect(response.metadata.depthInvitation?.type).toBe('theory');
      expect(response.metadata.depthInvitation?.allowedTokens).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Conversation Flow: Brief → Deep → Brief', () => {
    test('Should toggle between modes based on user invitation', async () => {
      const conversation = [
        { input: "I'm feeling dark", expectDepth: false },
        { input: "What does that mean?", expectDepth: true },
        { input: "Oh I see", expectDepth: false },
        { input: "Can you explain more about shadow work?", expectDepth: true },
        { input: "That makes sense", expectDepth: false },
        { input: "I think I'm in Nigredo", expectDepth: false },
        { input: "What is Nigredo exactly?", expectDepth: true }
      ];

      console.log('\n=== CONVERSATION FLOW TEST ===\n');

      for (let i = 0; i < conversation.length; i++) {
        const { input, expectDepth } = conversation[i];
        const response = await rfs.speak(input, testUserId);

        const hasDepth = !!response.metadata.depthInvitation;
        const wordCount = response.message?.split(/\s+/).length || 0;

        console.log(`[${i + 1}] User: "${input}"`);
        console.log(`    Maya: "${response.message || '[silence]'}" (${wordCount} words)`);
        console.log(`    Depth: ${hasDepth ? 'YES' : 'NO'} (expected: ${expectDepth ? 'YES' : 'NO'})`);
        console.log('');

        expect(hasDepth).toBe(expectDepth);

        if (expectDepth) {
          expect(wordCount).toBeGreaterThan(10); // Deep explanations
        } else {
          expect(wordCount).toBeLessThanOrEqual(5); // Brief presence
        }
      }
    });
  });

  describe('Example Deep Conversations', () => {
    test('Alchemical phase explanation', async () => {
      const input = "Can you explain the alchemical phases to me?";
      const response = await rfs.speak(input, testUserId);

      console.log('\n=== ALCHEMICAL PHASES EXPLANATION ===');
      console.log(`Input: "${input}"`);
      console.log(`\nMaya's Response:\n"${response.message}"\n`);
      console.log(`Word count: ${response.message?.split(/\s+/).length}`);
      console.log(`Depth type: ${response.metadata.depthInvitation?.type}`);

      expect(response.message).toBeTruthy();
      expect(response.message!.length).toBeGreaterThan(100);
      expect(response.metadata.depthInvitation?.type).toBe('theory');
    });

    test('Shadow work explanation', async () => {
      const input = "I keep hearing about shadow work. What is it?";
      const response = await rfs.speak(input, testUserId);

      console.log('\n=== SHADOW WORK EXPLANATION ===');
      console.log(`Input: "${input}"`);
      console.log(`\nMaya's Response:\n"${response.message}"\n`);
      console.log(`Word count: ${response.message?.split(/\s+/).length}`);

      expect(response.message).toBeTruthy();
      expect(response.message!.length).toBeGreaterThan(80);
    });

    test('Meta-conversation about process', async () => {
      const input = "How does this work? What are you doing?";
      const response = await rfs.speak(input, testUserId);

      console.log('\n=== META CONVERSATION ===');
      console.log(`Input: "${input}"`);
      console.log(`\nMaya's Response:\n"${response.message}"\n`);
      console.log(`Depth type: ${response.metadata.depthInvitation?.type}`);

      expect(response.metadata.depthInvitation?.type).toBe('meta');
      expect(response.message).toBeTruthy();
    });
  });

  describe('Balance: Not Too Deep, Not Too Brief', () => {
    test('Depth responses should still feel like Maya (not academic)', async () => {
      const input = "What's integration?";
      const response = await rfs.speak(input, testUserId);

      console.log('\n=== CHECKING MAYA TONE IN DEPTH ===');
      console.log(`Response: "${response.message}"`);

      // Should not contain overly academic/clinical language
      const academicMarkers = /furthermore|moreover|thus|therefore|in conclusion/i;
      expect(response.message).not.toMatch(academicMarkers);

      // Should still feel warm and present (check for "I", "you", "we")
      const presenceMarkers = /\b(i|you|we|us)\b/i;
      expect(response.message).toMatch(presenceMarkers);
    });

    test('Should not explain when not asked', async () => {
      const input = "I'm in Nigredo"; // Statement, not question
      const response = await rfs.speak(input, testUserId);

      console.log('\n=== STATEMENT WITHOUT QUESTION ===');
      console.log(`Input: "${input}"`);
      console.log(`Response: "${response.message || '[silence]'}"`);
      console.log(`Depth detected: ${response.metadata.depthInvitation ? 'YES' : 'NO'}`);

      // Should NOT trigger depth (it's a statement, not a question)
      expect(response.metadata.depthInvitation).toBeFalsy();

      // Should be brief
      if (response.message) {
        expect(response.message.split(/\s+/).length).toBeLessThanOrEqual(5);
      }
    });
  });
});