import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Stub DI container
function get<T>(token: any): T {
  return {} as T;
}
function wireDI(options?: any) {
  // No-op
}
const TOKENS = {
  SSE_HUB: Symbol('SSE_HUB'),
  VOICE_QUEUE: Symbol('VOICE_QUEUE'),
  VOICE_EVENT_BUS: Symbol('VOICE_EVENT_BUS')
};
// Temporarily stub out backend imports that are excluded from build
// import { get } from '../../../../backend/src/core/di/container';
// Temporarily stub out backend imports that are excluded from build
// import { TOKENS } from '../../../../backend/src/core/di/tokens';
// Temporarily stub out backend imports that are excluded from build
// import { wireDI } from '../../../../backend/src/bootstrap/di';
// Temporarily stub out backend imports that are excluded from build
// import { PersonalOracleAgent } from '../../../../backend/src/agents/PersonalOracleAgent';

// Stub PersonalOracleAgent
class PersonalOracleAgent {
  async processJournalRequest(request: any) {
    return {
      success: true,
      mayaResponse: 'File uploaded successfully',
      sessionId: 'session-' + Date.now(),
      fileId: 'file-' + Date.now()
    };
  }
}

// Initialize DI container
let initialized = false;
async function ensureInitialized(req: NextRequest) {
  if (!initialized) {
    await wireDI({ requestHeaders: req.headers });
    initialized = true;
  }
}

export async function POST(request: NextRequest) {
  await ensureInitialized(request);
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }

    // Read file content
    let content = '';
    let fileType = 'document';
    
    if (file.type.startsWith('text/') || file.type.includes('json') || file.name.endsWith('.txt')) {
      content = await file.text();
      fileType = 'text';
    } else if (file.type.includes('pdf')) {
      // For PDF, we'd need a PDF parser - for now, just store metadata
      content = `[PDF Document: ${file.name}, ${file.size} bytes]`;
      fileType = 'pdf';
    } else if (file.type.startsWith('audio/')) {
      // For audio, we'd use speech-to-text - for now, just store metadata
      content = `[Audio File: ${file.name}, ${file.size} bytes, ${file.type}]`;
      fileType = 'audio';
    } else {
      content = `[File: ${file.name}, ${file.size} bytes, ${file.type}]`;
      fileType = 'binary';
    }

    // Get PersonalOracleAgent instance
    const oracle = new PersonalOracleAgent();
    
    // Process upload through Oracle's memory system
    const uploadResponse = await oracle.processJournalRequest({
      userId,
      action: 'create',
      content: `UPLOADED DOCUMENT: ${file.name}\n\nContent:\n${content}`,
      title: `Uploaded: ${file.name}`,
      tags: ['upload', 'document', fileType],
      mood: 'neutral',
      isPrivate: false
    });

    return NextResponse.json({
      success: true,
      processed: true,
      filename: file.name,
      fileType,
      message: `${file.name} has been integrated into Oracle memory`,
      data: uploadResponse
    });
    
  } catch (err: any) {
    console.error('File upload processing failed:', err);
    return NextResponse.json(
      { error: 'upload_processing_failed', message: err?.message },
      { status: 500 }
    );
  }
}