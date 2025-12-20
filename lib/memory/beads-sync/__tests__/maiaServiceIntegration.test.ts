/**
 * Integration Tests for Beads ↔ MAIA Service Integration
 *
 * Tests:
 * - Somatic tension detection → task creation
 * - Phase transition detection → integration tasks
 * - Task readiness queries
 * - Practice completion detection
 * - Cognitive gating (Bloom's taxonomy)
 * - Error handling (Beads service failures)
 */

import {
  processConsciousnessEventsForBeads,
  handleTaskReadinessQuery,
  detectAndLogPracticeCompletion,
} from '../maiaServiceIntegration';
import { maiaBeadsPlugin } from '../MaiaBeadsPlugin';
import type { CognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';

// Mock the Beads plugin
jest.mock('../MaiaBeadsPlugin', () => ({
  maiaBeadsPlugin: {
    onSomaticTensionSpike: jest.fn(),
    onPhaseTransition: jest.fn(),
    onFieldImbalance: jest.fn(),
    onAchievementUnlock: jest.fn(),
    getReadyTasksForUser: jest.fn(),
    completeTask: jest.fn(),
  },
}));

describe('maiaServiceIntegration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==============================================================================
  // SOMATIC TENSION DETECTION
  // ==============================================================================

  describe('processConsciousnessEventsForBeads - Somatic Tension', () => {
    it('creates grounding task when high shoulder tension detected', async () => {
      const mockBeadsId = 'maia-shoulder-task-123';
      (maiaBeadsPlugin.onSomaticTensionSpike as jest.Mock).mockResolvedValue(mockBeadsId);

      const result = await processConsciousnessEventsForBeads({
        userId: 'user-123',
        sessionId: 'session-456',
        userInput: 'My shoulders are really tense today',
        maiaResponse: "I'm sensing significant tension in your shoulders",
        meta: {
          processingProfile: 'CORE',
          cognitiveProfile: {
            currentLevel: 4,
            rollingAverage: 3.8,
          } as CognitiveProfile,
        },
      });

      expect(maiaBeadsPlugin.onSomaticTensionSpike).toHaveBeenCalledWith(
        'user-123',
        'session-456',
        expect.objectContaining({
          bodyRegion: 'shoulders',
          tensionLevel: expect.any(Number),
        })
      );

      expect(result.tasksCreated).toBe(1);
      expect(result.taskIds).toContain(mockBeadsId);
      expect(result.suggestions[0]).toMatch(/grounding practice/i);
    });

    it('detects multiple body regions and chooses most prominent', async () => {
      const mockBeadsId = 'maia-neck-task-456';
      (maiaBeadsPlugin.onSomaticTensionSpike as jest.Mock).mockResolvedValue(mockBeadsId);

      const result = await processConsciousnessEventsForBeads({
        userId: 'user-123',
        sessionId: 'session-456',
        userInput: 'My neck is extremely tight and my shoulders are slightly tense',
        maiaResponse: 'I notice your neck is carrying a lot of tension',
        meta: {
          processingProfile: 'DEEP',
        },
      });

      expect(maiaBeadsPlugin.onSomaticTensionSpike).toHaveBeenCalledWith(
        'user-123',
        'session-456',
        expect.objectContaining({
          bodyRegion: 'neck',
          tensionLevel: expect.any(Number),
        })
      );

      expect(result.tasksCreated).toBe(1);
    });

    it('does not create task for low tension levels', async () => {
      const result = await processConsciousnessEventsForBeads({
        userId: 'user-123',
        sessionId: 'session-456',
        userInput: 'My shoulders are slightly tense',
        maiaResponse: 'I notice a little tension',
        meta: {
          processingProfile: 'CORE',
        },
      });

      expect(maiaBeadsPlugin.onSomaticTensionSpike).not.toHaveBeenCalled();
      expect(result.tasksCreated).toBe(0);
    });

    it('skips task creation for FAST path', async () => {
      const result = await processConsciousnessEventsForBeads({
        userId: 'user-123',
        sessionId: 'session-456',
        userInput: 'My shoulders are really tense',
        maiaResponse: 'I understand',
        meta: {
          processingProfile: 'FAST',
        },
      });

      expect(maiaBeadsPlugin.onSomaticTensionSpike).not.toHaveBeenCalled();
      expect(result.tasksCreated).toBe(0);
    });
  });

  // ==============================================================================
  // FIELD IMBALANCE DETECTION
  // ==============================================================================

  describe('processConsciousnessEventsForBeads - Field Imbalance', () => {
    it('creates restoration task when field work is unsafe', async () => {
      const mockBeadsId = 'maia-field-task-789';
      (maiaBeadsPlugin.onFieldImbalance as jest.Mock).mockResolvedValue(mockBeadsId);

      const result = await processConsciousnessEventsForBeads({
        userId: 'user-123',
        sessionId: 'session-456',
        userInput: 'I feel scattered and ungrounded',
        maiaResponse: 'Let me help you find stability',
        meta: {
          processingProfile: 'CORE',
          fieldRouting: {
            fieldWorkSafe: false,
            realm: 'MIDDLEWORLD',
          },
          mythicAtlas: {
            element: 'earth',
          },
        },
      });

      expect(maiaBeadsPlugin.onFieldImbalance).toHaveBeenCalledWith(
        'user-123',
        'session-456',
        expect.objectContaining({
          element: 'earth',
          severity: 6,
          type: 'deficient',
          recommendedProtocols: expect.arrayContaining(['earth-grounding']),
        })
      );

      expect(result.tasksCreated).toBe(1);
      expect(result.taskIds).toContain(mockBeadsId);
    });

    it('does not create task when field is safe', async () => {
      const result = await processConsciousnessEventsForBeads({
        userId: 'user-123',
        sessionId: 'session-456',
        userInput: 'I feel grounded and centered',
        maiaResponse: 'Beautiful',
        meta: {
          processingProfile: 'CORE',
          fieldRouting: {
            fieldWorkSafe: true,
            realm: 'UPPERWORLD_SYMBOLIC',
          },
        },
      });

      expect(maiaBeadsPlugin.onFieldImbalance).not.toHaveBeenCalled();
      expect(result.tasksCreated).toBe(0);
    });
  });

  // ==============================================================================
  // TASK READINESS QUERIES
  // ==============================================================================

  describe('handleTaskReadinessQuery', () => {
    it('detects "What should I work on?" queries', async () => {
      const mockTasks = [
        {
          beadsId: 'task-1',
          title: 'Ground shoulder tension',
          element: 'earth',
          phase: 1,
        },
        {
          beadsId: 'task-2',
          title: 'Water phase integration',
          element: 'water',
          phase: 2,
        },
      ];

      (maiaBeadsPlugin.getReadyTasksForUser as jest.Mock).mockResolvedValue(mockTasks);

      const result = await handleTaskReadinessQuery({
        userId: 'user-123',
        userInput: 'What should I work on?',
        meta: {
          spiralMeta: {
            element: 'earth',
            phase: 1,
            injected: true,
          },
        },
      });

      expect(result.isTaskQuery).toBe(true);
      expect(result.response).toMatch(/Ground shoulder tension/);
      expect(result.response).toMatch(/earth phase/i);
    });

    it('prioritizes tasks aligned with current element', async () => {
      const mockTasks = [
        { beadsId: 'task-1', title: 'Fire task', element: 'fire' },
        { beadsId: 'task-2', title: 'Earth grounding', element: 'earth' },
        { beadsId: 'task-3', title: 'Water flow', element: 'water' },
      ];

      (maiaBeadsPlugin.getReadyTasksForUser as jest.Mock).mockResolvedValue(mockTasks);

      const result = await handleTaskReadinessQuery({
        userId: 'user-123',
        userInput: "What's next?",
        meta: {
          spiralMeta: {
            element: 'earth',
            injected: true,
          },
        },
      });

      expect(result.isTaskQuery).toBe(true);
      expect(result.response).toMatch(/Earth grounding/);
      // Earth task should appear before Water task
      const earthIndex = result.response!.indexOf('Earth grounding');
      const waterIndex = result.response!.indexOf('Water flow');
      expect(earthIndex).toBeLessThan(waterIndex);
    });

    it('returns graceful message when no tasks ready', async () => {
      (maiaBeadsPlugin.getReadyTasksForUser as jest.Mock).mockResolvedValue([]);

      const result = await handleTaskReadinessQuery({
        userId: 'user-123',
        userInput: 'Any practices ready?',
        meta: {},
      });

      expect(result.isTaskQuery).toBe(true);
      expect(result.response).toMatch(/beautiful place of integration/i);
    });

    it('does not trigger on non-task queries', async () => {
      const result = await handleTaskReadinessQuery({
        userId: 'user-123',
        userInput: 'How are you today?',
        meta: {},
      });

      expect(result.isTaskQuery).toBe(false);
      expect(maiaBeadsPlugin.getReadyTasksForUser).not.toHaveBeenCalled();
    });
  });

  // ==============================================================================
  // PRACTICE COMPLETION DETECTION
  // ==============================================================================

  describe('detectAndLogPracticeCompletion', () => {
    it('detects completion statements', async () => {
      const result = await detectAndLogPracticeCompletion({
        userId: 'user-123',
        userInput: 'I just did the breathing practice',
        conversationHistory: [
          {
            userMessage: 'What should I work on?',
            maiaResponse: 'Try the breathing practice',
          },
        ],
      });

      expect(result.completionDetected).toBe(true);
      expect(result.followUpQuestion).toMatch(/how effective/i);
    });

    it('extracts practice name from previous MAIA response', async () => {
      const result = await detectAndLogPracticeCompletion({
        userId: 'user-123',
        userInput: 'Done with that',
        conversationHistory: [
          {
            userMessage: 'What should I work on?',
            maiaResponse: "I've created a grounding practice for you",
          },
        ],
      });

      expect(result.completionDetected).toBe(true);
      expect(result.followUpQuestion).toMatch(/grounding practice/i);
    });

    it('does not trigger on non-completion statements', async () => {
      const result = await detectAndLogPracticeCompletion({
        userId: 'user-123',
        userInput: 'I want to try a practice',
        conversationHistory: [],
      });

      expect(result.completionDetected).toBe(false);
      expect(result.followUpQuestion).toBeUndefined();
    });
  });

  // ==============================================================================
  // ERROR HANDLING
  // ==============================================================================

  describe('Error Handling', () => {
    it('handles Beads plugin failures gracefully', async () => {
      (maiaBeadsPlugin.onSomaticTensionSpike as jest.Mock).mockRejectedValue(
        new Error('Beads service unavailable')
      );

      const result = await processConsciousnessEventsForBeads({
        userId: 'user-123',
        sessionId: 'session-456',
        userInput: 'My shoulders are really tense',
        maiaResponse: 'I sense tension',
        meta: {
          processingProfile: 'CORE',
        },
      });

      // Should not throw - error handled gracefully
      expect(result.tasksCreated).toBe(0);
      expect(result.taskIds).toEqual([]);
    });

    it('handles getReadyTasksForUser failures gracefully', async () => {
      (maiaBeadsPlugin.getReadyTasksForUser as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await handleTaskReadinessQuery({
        userId: 'user-123',
        userInput: 'What should I work on?',
        meta: {},
      });

      expect(result.isTaskQuery).toBe(true);
      expect(result.response).toMatch(/having trouble accessing/i);
    });
  });

  // ==============================================================================
  // COGNITIVE GATING
  // ==============================================================================

  describe('Cognitive Gating', () => {
    it('passes cognitive profile to getReadyTasksForUser', async () => {
      (maiaBeadsPlugin.getReadyTasksForUser as jest.Mock).mockResolvedValue([]);

      const cognitiveProfile: CognitiveProfile = {
        currentLevel: 4,
        rollingAverage: 3.8,
        stability: 'stable',
        bypassingFrequency: {
          spiritual: 0.1,
          intellectual: 0.2,
        },
        communityCommonsEligible: true,
        deepWorkRecommended: true,
        fieldWorkSafe: true,
      };

      await handleTaskReadinessQuery({
        userId: 'user-123',
        userInput: 'What should I work on?',
        meta: {
          cognitiveProfile,
        },
      });

      expect(maiaBeadsPlugin.getReadyTasksForUser).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          cognitive: expect.objectContaining({
            currentLevel: 4,
            averageLevel: 3.8,
          }),
        })
      );
    });
  });
});
