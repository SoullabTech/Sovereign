import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_LEARNING_CONFIG, LearningOrchestrator,
  R4H_UNATTENDED_TRAINING_APPROVED,
} from '@/lib/learning/learning-orchestrator';
import {
  storeTrainingExample, generateTeacherExample, loadTrainingExamples,
} from '@/lib/learning/claude-teacher-service';

jest.mock('@/lib/learning/claude-teacher-service', () => ({
  storeTrainingExample: jest.fn(),
  generateTeacherExample: jest.fn(),
  loadTrainingExamples: jest.fn(),
  getTeacherFeedback: jest.fn(),
}));
jest.mock('@/lib/ai/modelService', () => ({ generateText: jest.fn() }));
const store = storeTrainingExample as jest.Mock;
const teacher = generateTeacherExample as jest.Mock;
const load = loadTrainingExamples as jest.Mock;
const read = (f: string) => fs.readFileSync(path.join(process.cwd(), f), 'utf8');

beforeEach(() => {
  store.mockReset(); teacher.mockReset(); load.mockReset();
  load.mockResolvedValue([]);
});

describe('R4H no involuntary model-training or corpus retrieval', () => {
  it('is globally hard-off, including opt-in config supplied by internal caller', async () => {
    expect(DEFAULT_LEARNING_CONFIG.collectTrainingData).toBe(false);
    expect(R4H_UNATTENDED_TRAINING_APPROVED).toBe(false);
    const orchestrator = new LearningOrchestrator({
      ...DEFAULT_LEARNING_CONFIG, collectTrainingData: true,
      enableTeacherFeedback: true, feedbackSampleRate: 1,
    });
    (orchestrator as any).decideModel = jest.fn().mockResolvedValue({
      useModel: 'claude', confidence: 0.95,
      collectAsTraining: true,
    });
    (orchestrator as any).generateClaudeResponse = jest.fn().mockResolvedValue('FICTIONAL_SAFE_RESPONSE');
    const result = await orchestrator.generateMaiaResponse(
      'FICTIONAL_MEMBER_QUESTION', [], 'FICTIONAL_SESSION',
    );
    expect(result.text).toBe('FICTIONAL_SAFE_RESPONSE');
    expect(store).not.toHaveBeenCalled();
    expect(teacher).not.toHaveBeenCalled();
    expect(load).not.toHaveBeenCalled();
  });

  it('quarantines old training-example retrieval and backstage feedback before the model', () => {
    const source = read('lib/learning/learning-orchestrator.ts');
    expect(source).toContain('R4H_UNATTENDED_TRAINING_APPROVED ? await loadTrainingExamples');
    expect(source).toContain('if (!R4H_UNATTENDED_TRAINING_APPROVED) return;');
    expect(source).toContain('R4H_UNATTENDED_TRAINING_APPROVED && this.config.enableTeacherFeedback');
  });

  it('does not reinstate the separate DEEP-path JSONL writer', () => {
    const deep = read('lib/consultation/deep-path-with-consultation.ts');
    expect(deep).not.toContain('appendFileSync(');
    expect(deep).not.toContain('consultation-examples.jsonl');
    const enhanced = read('lib/learning/enhanced-maia-service.ts');
    expect(enhanced).toContain('if (collectTraining || forceTeacher)');
    expect(enhanced).toContain('R4H_TRAINING_OR_TEACHER_MODE_NOT_AUTHORIZED');
  });
});
