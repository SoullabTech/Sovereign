import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
// Stub DI container
function get<T>(token: any): T {
  return {} as T;
}
function wireDI() {
  // No-op
}
const TOKENS = {
  SSE_HUB: Symbol('SSE_HUB'),
  VOICE_QUEUE: Symbol('VOICE_QUEUE'),
  VOICE_EVENT_BUS: Symbol('VOICE_EVENT_BUS')
};
// Temporarily stub out backend imports that are excluded from build
// import { get } from '../../../../../backend/src/core/di/container';
// Temporarily stub out backend imports that are excluded from build
// import { TOKENS } from '../../../../../backend/src/core/di/tokens';
// Temporarily stub out backend imports that are excluded from build
// import { AsyncVoiceQueue } from '../../../../../backend/src/adapters/voice/AsyncVoiceQueue';
// Temporarily stub out backend imports that are excluded from build
// import { wireDI } from '../../../../../backend/src/bootstrap/di';

let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    wireDI();
    initialized = true;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  ensureInitialized();
  
  try {
    const { taskId } = params;
    
    if (!taskId) {
      return Response.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    const voiceQueue = get<AsyncVoiceQueue>(TOKENS.VOICE_QUEUE);
    
    // Type check - ensure it's an AsyncVoiceQueue
    if (!(voiceQueue instanceof AsyncVoiceQueue)) {
      return Response.json(
        { error: 'Voice queue not available' },
        { status: 503 }
      );
    }

    const task = await voiceQueue.getTaskStatus(taskId);
    
    if (!task) {
      return Response.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return Response.json({
      taskId: task.id,
      status: task.status,
      result: task.result,
      error: task.error,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      text: task.job.text
    });
    
  } catch (error: any) {
    return Response.json(
      { error: 'status_check_failed', message: error?.message },
      { status: 500 }
    );
  }
}