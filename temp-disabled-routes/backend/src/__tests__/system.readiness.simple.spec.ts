/**
 * Simple System Readiness Tests
 * Basic integration tests to verify system functionality
 */

import { personalOracleAgentSimplified } from '../agents/PersonalOracleAgentSimplified';

describe('AIN System Readiness - Basic Tests', () => {
  const testUserId = `test-${Date.now()}`;

  it('should initialize PersonalOracleAgent without errors', () => {
    // This test passes if the import and initialization worked
    expect(personalOracleAgentSimplified).toBeDefined();
  });

  it('should handle basic consultation requests', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'Hello, this is a test message'
    });

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.message).toBeDefined();
    expect(typeof response.data.message).toBe('string');
    expect(response.data.message.length).toBeGreaterThan(0);
  }, 10000);

  it('should detect and handle crisis inputs', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'I want to end it all, I can\'t go on anymore'
    });

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.data.element).toBe('earth');
    expect(response.data.archetype).toBe('Protector');
    expect(response.data.metadata.safetyProtocol).toBe('crisis_grounding');
  }, 10000);

  it('should handle overwhelm inputs appropriately', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'Everything is too much, I can\'t handle this anymore'
    });

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.data.element).toBe('water');
    expect(response.data.archetype).toBe('Healer');
  }, 10000);

  it('should adapt tone for hesitant users', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'I\'m not sure if I should be doing this... maybe this isn\'t for me',
      context: { previousInteractions: 1 }
    });

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.data.message.toLowerCase()).toMatch(/(gentle|uncertain|slowly|pressure)/);
  }, 10000);

  it('should adapt tone for enthusiastic users', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'This is amazing! I can\'t wait to dive in and explore everything!',
      context: { previousInteractions: 1 }
    });

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.data.message.toLowerCase()).toMatch(/(energy|enthusiasm|beautiful|alive)/);
  }, 10000);

  it('should progress through different stages based on session count', async () => {
    // Test structured guide stage (early sessions)
    const earlyResponse = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'I need help figuring out my next steps',
      context: { previousInteractions: 2 }
    });

    expect(earlyResponse.data.metadata.oracleStage).toBe('structured_guide');

    // Test dialogical companion stage (mid sessions)  
    const midResponse = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'I need help figuring out my next steps',
      context: { previousInteractions: 10 }
    });

    expect(midResponse.data.metadata.oracleStage).toBe('dialogical_companion');

    // Test transparent prism stage (late sessions)
    const lateResponse = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'I need help figuring out my next steps',
      context: { previousInteractions: 30 }
    });

    expect(lateResponse.data.metadata.oracleStage).toBe('transparent_prism');
  }, 15000);

  it('should provide consistent response structure', async () => {
    const response = await personalOracleAgentSimplified.consult({
      userId: testUserId,
      input: 'What should I focus on today?'
    });

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    
    // Check required fields
    expect(response.data.message).toBeDefined();
    expect(response.data.element).toBeDefined();
    expect(response.data.archetype).toBeDefined();
    expect(response.data.confidence).toBeDefined();
    expect(response.data.metadata).toBeDefined();
    
    // Check metadata structure
    expect(response.data.metadata.oracleStage).toBeDefined();
    expect(response.data.metadata.phase).toBeDefined();
    expect(Array.isArray(response.data.metadata.symbols)).toBe(true);
    expect(Array.isArray(response.data.metadata.recommendations)).toBe(true);
    expect(Array.isArray(response.data.metadata.nextSteps)).toBe(true);
  }, 10000);

  it('should handle settings updates', async () => {
    const settingsResponse = await personalOracleAgentSimplified.updateSettings(testUserId, {
      name: 'Test Oracle',
      persona: 'formal',
      interactionStyle: 'brief'
    });

    expect(settingsResponse).toBeDefined();
    expect(settingsResponse.success).toBe(true);
    expect(settingsResponse.data.name).toBe('Test Oracle');
    expect(settingsResponse.data.persona).toBe('formal');

    // Verify settings persist
    const getSettingsResponse = await personalOracleAgentSimplified.getSettings(testUserId);
    expect(getSettingsResponse.success).toBe(true);
    expect(getSettingsResponse.data.name).toBe('Test Oracle');
  }, 10000);

  it('should complete performance benchmark', async () => {
    const startTime = Date.now();
    
    const promises = Array.from({ length: 3 }, (_, i) =>
      personalOracleAgentSimplified.consult({
        userId: `${testUserId}-perf-${i}`,
        input: `Performance test message ${i + 1}`
      })
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / responses.length;

    // Verify all responses succeeded
    responses.forEach((response, i) => {
      expect(response.success).toBe(true);
      expect(response.data.message.length).toBeGreaterThan(0);
    });

    // Performance check - should be reasonably fast
    expect(averageTime).toBeLessThan(5000); // 5 seconds average
    expect(totalTime).toBeLessThan(15000); // 15 seconds total

    console.log(`Performance Test: ${responses.length} requests in ${totalTime}ms (avg: ${Math.round(averageTime)}ms)`);
  }, 20000);
});