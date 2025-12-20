/**
 * Unit Tests for MaiaBeadsPlugin
 *
 * Tests:
 * - Task creation with consciousness metadata
 * - Cognitive/field gating
 * - Task filtering by readiness
 * - Effectiveness tracking
 */

import { MaiaBeadsPlugin } from '../MaiaBeadsPlugin';
import type { ConsciousnessMatrixV2 } from '@/lib/consciousness/memory/MAIAMemoryArchitecture';

// Mock Beads sync client
const mockBeadsSyncClient = {
  createTask: jest.fn(),
  completeTask: jest.fn(),
  getReadyTasks: jest.fn(),
};

describe('MaiaBeadsPlugin', () => {
  let plugin: MaiaBeadsPlugin;

  beforeEach(() => {
    jest.clearAllMocks();
    plugin = new MaiaBeadsPlugin('http://localhost:3100');
    // Inject mock client
    (plugin as any).client = mockBeadsSyncClient;
  });

  const mockMatrix: ConsciousnessMatrixV2 = {
    elementalField: {
      fire: 0.5,
      water: 0.5,
      earth: 0.7,
      air: 0.5,
      aether: 0.3,
    },
    spiralPosition: {
      currentElement: 'earth',
      currentPhase: 1,
      depth: 1,
    },
    coherence: {
      overall: 0.7,
      byElement: {
        fire: 0.6,
        water: 0.6,
        earth: 0.8,
        air: 0.6,
        aether: 0.5,
      },
    },
    cognitive: {
      currentLevel: 4,
      averageLevel: 3.8,
      bypassingFrequency: {
        spiritual: 0.1,
        intellectual: 0.15,
      },
    },
  } as ConsciousnessMatrixV2;

  // ==============================================================================
  // SOMATIC TENSION → TASK CREATION
  // ==============================================================================

  describe('onSomaticTensionSpike', () => {
    it('creates grounding task for high shoulder tension', async () => {
      mockBeadsSyncClient.createTask.mockResolvedValue({
        beadsId: 'maia-shoulder-123',
      });

      const beadsId = await plugin.onSomaticTensionSpike('user-123', 'session-456', {
        bodyRegion: 'shoulders',
        tensionLevel: 8,
        matrix: mockMatrix,
      });

      expect(mockBeadsSyncClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('shoulder'),
          priority: 'high',
          maiaMeta: expect.objectContaining({
            userId: 'user-123',
            sessionId: 'session-456',
            element: 'earth',
            somatic: expect.objectContaining({
              bodyRegion: 'shoulders',
              tensionLevel: 8,
            }),
          }),
        })
      );

      expect(beadsId).toBe('maia-shoulder-123');
    });

    it('escalates to urgent priority for severe tension', async () => {
      mockBeadsSyncClient.createTask.mockResolvedValue({
        beadsId: 'maia-urgent-456',
      });

      await plugin.onSomaticTensionSpike('user-123', 'session-456', {
        bodyRegion: 'jaw',
        tensionLevel: 9,
        matrix: mockMatrix,
      });

      expect(mockBeadsSyncClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'urgent',
        })
      );
    });

    it('returns null for low tension (below threshold)', async () => {
      const beadsId = await plugin.onSomaticTensionSpike('user-123', 'session-456', {
        bodyRegion: 'shoulders',
        tensionLevel: 4,
        matrix: mockMatrix,
      });

      expect(mockBeadsSyncClient.createTask).not.toHaveBeenCalled();
      expect(beadsId).toBeNull();
    });

    it('includes cognitive requirements in task metadata', async () => {
      mockBeadsSyncClient.createTask.mockResolvedValue({
        beadsId: 'maia-cognitive-789',
      });

      await plugin.onSomaticTensionSpike('user-123', 'session-456', {
        bodyRegion: 'shoulders',
        tensionLevel: 7,
        matrix: mockMatrix,
      });

      expect(mockBeadsSyncClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          maiaMeta: expect.objectContaining({
            cognitive: expect.objectContaining({
              requiredLevel: expect.any(Number),
            }),
          }),
        })
      );
    });
  });

  // ==============================================================================
  // PHASE TRANSITION → INTEGRATION TASKS
  // ==============================================================================

  describe('onPhaseTransition', () => {
    it('creates completion and initiation tasks', async () => {
      mockBeadsSyncClient.createTask
        .mockResolvedValueOnce({ beadsId: 'maia-completion-123' })
        .mockResolvedValueOnce({ beadsId: 'maia-initiation-456' });

      const taskIds = await plugin.onPhaseTransition('user-123', 'session-456', {
        fromElement: 'water',
        fromPhase: 2,
        toElement: 'fire',
        toPhase: 1,
        matrix: mockMatrix,
      });

      expect(mockBeadsSyncClient.createTask).toHaveBeenCalledTimes(2);

      // Completion task for previous phase
      expect(mockBeadsSyncClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/complete.*water.*2/i),
          maiaMeta: expect.objectContaining({
            element: 'water',
            phase: 2,
          }),
        })
      );

      // Initiation task for new phase
      expect(mockBeadsSyncClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/initiate.*fire.*1/i),
          maiaMeta: expect.objectContaining({
            element: 'fire',
            phase: 1,
          }),
        })
      );

      expect(taskIds).toEqual(['maia-completion-123', 'maia-initiation-456']);
    });
  });

  // ==============================================================================
  // FIELD IMBALANCE → RESTORATION TASKS
  // ==============================================================================

  describe('onFieldImbalance', () => {
    it('creates restoration task for deficient earth element', async () => {
      mockBeadsSyncClient.createTask.mockResolvedValue({
        beadsId: 'maia-earth-restore-123',
      });

      const beadsId = await plugin.onFieldImbalance('user-123', 'session-456', {
        element: 'earth',
        severity: 7,
        type: 'deficient',
        recommendedProtocols: ['earth-grounding', 'embodiment-practice'],
        matrix: mockMatrix,
      });

      expect(mockBeadsSyncClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/restore.*earth/i),
          maiaMeta: expect.objectContaining({
            element: 'earth',
            field: expect.objectContaining({
              intensity: 7,
              safetyCheck: true,
            }),
          }),
        })
      );

      expect(beadsId).toBe('maia-earth-restore-123');
    });

    it('returns null for minor imbalances (below threshold)', async () => {
      const beadsId = await plugin.onFieldImbalance('user-123', 'session-456', {
        element: 'air',
        severity: 3,
        type: 'deficient',
        recommendedProtocols: [],
        matrix: mockMatrix,
      });

      expect(mockBeadsSyncClient.createTask).not.toHaveBeenCalled();
      expect(beadsId).toBeNull();
    });
  });

  // ==============================================================================
  // ACHIEVEMENT UNLOCKS
  // ==============================================================================

  describe('onAchievementUnlock', () => {
    it('creates celebration task for achievement', async () => {
      mockBeadsSyncClient.createTask.mockResolvedValue({
        beadsId: 'maia-achievement-789',
      });

      const beadsId = await plugin.onAchievementUnlock('user-123', {
        achievementId: 'first_shoulders_drop',
        title: 'First Shoulders Drop',
        description: 'Released shoulder tension below 3/10 for first time',
        rarity: 'common',
      });

      expect(mockBeadsSyncClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/First Shoulders Drop/),
          priority: 'low',
          tags: expect.arrayContaining(['achievement', 'celebration']),
        })
      );

      expect(beadsId).toBe('maia-achievement-789');
    });

    it('escalates priority for rare achievements', async () => {
      mockBeadsSyncClient.createTask.mockResolvedValue({
        beadsId: 'maia-rare-achievement',
      });

      await plugin.onAchievementUnlock('user-123', {
        achievementId: 'legendary_integration',
        title: 'Complete Element Cycle',
        description: 'Completed full spiral through all 5 elements',
        rarity: 'legendary',
      });

      expect(mockBeadsSyncClient.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'high',
        })
      );
    });
  });

  // ==============================================================================
  // TASK FILTERING & READINESS
  // ==============================================================================

  describe('getReadyTasksForUser', () => {
    it('filters tasks by cognitive level', async () => {
      mockBeadsSyncClient.getReadyTasks.mockResolvedValue([
        {
          beadsId: 'task-1',
          title: 'Beginner practice',
          requiredLevel: 2,
          element: 'earth',
        },
        {
          beadsId: 'task-2',
          title: 'Advanced practice',
          requiredLevel: 5,
          element: 'fire',
        },
      ]);

      const tasks = await plugin.getReadyTasksForUser('user-123', mockMatrix);

      expect(mockBeadsSyncClient.getReadyTasks).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          cognitiveLevel: 4, // From mockMatrix
          spiritualBypassing: 0.1,
          intellectualBypassing: 0.15,
          coherence: 0.7,
        })
      );

      expect(tasks).toHaveLength(2);
    });

    it('passes field coherence for safety filtering', async () => {
      mockBeadsSyncClient.getReadyTasks.mockResolvedValue([]);

      await plugin.getReadyTasksForUser('user-123', {
        ...mockMatrix,
        coherence: {
          ...mockMatrix.coherence,
          overall: 0.4, // Low coherence
        },
      } as ConsciousnessMatrixV2);

      expect(mockBeadsSyncClient.getReadyTasks).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          coherence: 0.4,
        })
      );
    });
  });

  // ==============================================================================
  // TASK COMPLETION & EFFECTIVENESS
  // ==============================================================================

  describe('completeTask', () => {
    it('records effectiveness and somatic improvement', async () => {
      mockBeadsSyncClient.completeTask.mockResolvedValue({
        success: true,
      });

      await plugin.completeTask('maia-task-123', {
        effectiveness: 8,
        somaticShift: {
          before: 8,
          after: 3,
        },
        insight: 'Deep breathing really helped',
        breakthrough: false,
      });

      expect(mockBeadsSyncClient.completeTask).toHaveBeenCalledWith(
        'maia-task-123',
        expect.objectContaining({
          effectiveness: 8,
          somaticShift: expect.objectContaining({
            before: 8,
            after: 3,
          }),
          insight: 'Deep breathing really helped',
          breakthrough: false,
        })
      );
    });

    it('marks breakthrough moments', async () => {
      mockBeadsSyncClient.completeTask.mockResolvedValue({
        success: true,
      });

      await plugin.completeTask('maia-task-456', {
        effectiveness: 10,
        breakthrough: true,
        insight: 'Profound release - first time shoulders fully relaxed',
      });

      expect(mockBeadsSyncClient.completeTask).toHaveBeenCalledWith(
        'maia-task-456',
        expect.objectContaining({
          breakthrough: true,
        })
      );
    });
  });

  // ==============================================================================
  // ERROR HANDLING
  // ==============================================================================

  describe('Error Handling', () => {
    it('handles sync service failures gracefully', async () => {
      mockBeadsSyncClient.createTask.mockRejectedValue(
        new Error('Connection timeout')
      );

      await expect(
        plugin.onSomaticTensionSpike('user-123', 'session-456', {
          bodyRegion: 'shoulders',
          tensionLevel: 8,
          matrix: mockMatrix,
        })
      ).rejects.toThrow('Connection timeout');
    });

    it('handles malformed task data', async () => {
      mockBeadsSyncClient.createTask.mockResolvedValue({
        beadsId: null, // Malformed response
      });

      const beadsId = await plugin.onSomaticTensionSpike('user-123', 'session-456', {
        bodyRegion: 'shoulders',
        tensionLevel: 8,
        matrix: mockMatrix,
      });

      // Should handle gracefully
      expect(beadsId).toBeNull();
    });
  });
});
