// backend: lib/learning/claude-teacher-service.ts

/**
 * CLAUDE AS EXTERNAL TEACHER
 *
 * Claude generates gold-standard MAIA responses and training examples
 * for local models to learn from. This creates a progressive handoff
 * where local models handle more conversations over time.
 */

import { generateText } from '../ai/modelService';
import { MAIA_RUNTIME_PROMPT, MAIA_RELATIONAL_SPEC, MAIA_LINEAGES_AND_FIELD } from '../consciousness/MAIA_RUNTIME_PROMPT';

export interface TrainingExample {
  id: string;
  userMessage: string;
  claudeResponse: string;
  reasoningTrace: string;
  situationType: 'greeting' | 'check-in' | 'complex-emotion' | 'rupture' | 'depth-work';
  confidence: number;
  timestamp: Date;
}

export interface TeacherFeedback {
  localResponse: string;
  claudeEvaluation: string;
  improvements: string[];
  score: number; // 1-10
  shouldUseClaudeInstead: boolean;
}

/**
 * Claude generates a gold-standard response WITH reasoning trace
 * This becomes training data for local models
 */
export async function generateTeacherExample(
  userMessage: string,
  conversationHistory: any[],
  sessionId: string
): Promise<TrainingExample> {

  const teacherPrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_RUNTIME_PROMPT}

TEACHER MODE: Generate a MAIA response with detailed reasoning trace.

User message: "${userMessage}"
Recent conversation: ${JSON.stringify(conversationHistory.slice(-3))}

Please provide:
1. Your MAIA response (natural, relational, following all guidelines)
2. REASONING TRACE: Explain your choices:
   - What did you notice in their message?
   - Which lineages/approaches influenced your response?
   - What relational moves are you making and why?
   - What are you avoiding and why?

Format:
RESPONSE: [your MAIA response]

REASONING: [detailed trace]`;

  const rawOutput = await generateText({
    systemPrompt: teacherPrompt,
    userInput: userMessage,
    meta: {
      engine: 'claude',
      teacherMode: true,
      sessionId
    }
  });

  // Parse Claude's output
  const [responsePart, reasoningPart] = rawOutput.split('REASONING:');
  const claudeResponse = responsePart.replace('RESPONSE:', '').trim();
  const reasoningTrace = reasoningPart?.trim() || '';

  // Classify situation type based on content
  const situationType = classifyInteraction(userMessage, claudeResponse);

  return {
    id: `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userMessage,
    claudeResponse,
    reasoningTrace,
    situationType,
    confidence: 0.95, // Claude teacher examples are high confidence
    timestamp: new Date()
  };
}

/**
 * Claude evaluates a local model's response and provides feedback
 */
export async function getTeacherFeedback(
  userMessage: string,
  localResponse: string,
  conversationHistory: any[]
): Promise<TeacherFeedback> {

  const feedbackPrompt = `${MAIA_RELATIONAL_SPEC}

You are evaluating a local AI model's attempt at being MAIA.

User said: "${userMessage}"
Local model responded: "${localResponse}"

As MAIA's teacher, evaluate this response:

1. SCORE (1-10): How well does this match MAIA's relational intelligence?
2. WHAT WORKED: What aspects were good?
3. IMPROVEMENTS: What specific changes would make this better?
4. SHOULD_USE_CLAUDE: Is this situation too complex for the local model right now?

Focus on:
- Relational stance (user-centered vs self-focused)
- Repair if needed (did they miss a rupture?)
- Voice/tone (warm but not therapeutic)
- Micro-skills (attunement, reframing, next steps)

Format:
SCORE: [1-10]
WHAT_WORKED: [specific strengths]
IMPROVEMENTS: [specific changes needed]
SHOULD_USE_CLAUDE: [yes/no with reason]`;

  const evaluation = await generateText({
    systemPrompt: feedbackPrompt,
    userInput: `User: ${userMessage}\nLocal: ${localResponse}`,
    meta: {
      engine: 'claude',
      evaluationMode: true
    }
  });

  // Parse evaluation (simplified for now)
  const scoreMatch = evaluation.match(/SCORE:\s*(\d+)/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

  const shouldUseClaudeMatch = evaluation.match(/SHOULD_USE_CLAUDE:\s*(yes|no)/i);
  const shouldUseClaudeInstead = shouldUseClaudeMatch ?
    shouldUseClaudeMatch[1].toLowerCase() === 'yes' : score < 7;

  return {
    localResponse,
    claudeEvaluation: evaluation,
    improvements: extractImprovements(evaluation),
    score,
    shouldUseClaudeInstead
  };
}

/**
 * Store successful interactions as training data
 */
export async function storeTrainingExample(example: TrainingExample): Promise<void> {
  // Store in local file system for now (could be database later)
  const fs = await import('fs').then(m => m.promises);
  const path = `/Users/soullab/MAIA-SOVEREIGN/training-data/${example.situationType}/${example.id}.json`;

  try {
    await fs.mkdir(`/Users/soullab/MAIA-SOVEREIGN/training-data/${example.situationType}`, { recursive: true });
    await fs.writeFile(path, JSON.stringify(example, null, 2));
    console.log(`📚 Stored training example: ${example.id} (${example.situationType})`);
  } catch (error) {
    console.error('Failed to store training example:', error);
  }
}

/**
 * Load existing training examples for a situation type
 */
export async function loadTrainingExamples(situationType?: string): Promise<TrainingExample[]> {
  const fs = await import('fs').then(m => m.promises);
  const baseDir = '/Users/soullab/MAIA-SOVEREIGN/training-data';

  try {
    const dirs = situationType ? [situationType] : await fs.readdir(baseDir);
    const examples: TrainingExample[] = [];

    for (const dir of dirs) {
      try {
        const files = await fs.readdir(`${baseDir}/${dir}`);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const content = await fs.readFile(`${baseDir}/${dir}/${file}`, 'utf8');
            examples.push(JSON.parse(content));
          }
        }
      } catch (e) {
        // Directory might not exist yet
      }
    }

    return examples.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Failed to load training examples:', error);
    return [];
  }
}

// Helper functions
function classifyInteraction(userMessage: string, response: string): TrainingExample['situationType'] {
  const msg = userMessage.toLowerCase();

  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) return 'greeting';
  if (msg.includes('fucked up') || msg.includes('bullshit') || msg.includes('not listening')) return 'rupture';
  if (msg.includes('struggling') || msg.includes('overwhelmed') || msg.includes('lost')) return 'complex-emotion';
  if (msg.includes('how are you') || msg.includes('doing well') || msg.includes('checking in')) return 'check-in';

  // Default to depth-work for longer, more complex messages
  return userMessage.length > 50 ? 'depth-work' : 'check-in';
}

function extractImprovements(evaluation: string): string[] {
  const improvementsMatch = evaluation.match(/IMPROVEMENTS:\s*(.+?)(?=\n[A-Z_]+:|$)/s);
  if (!improvementsMatch) return [];

  return improvementsMatch[1]
    .split(/[•\-\*]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}