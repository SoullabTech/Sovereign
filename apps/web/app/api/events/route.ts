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
// import { get } from '../../../backend/src/core/di/container';
// import { TOKENS } from '../../../backend/src/core/di/tokens';
// import { wireDI } from '../../../backend/src/bootstrap/di';
// import { SseHub } from '../../../backend/src/core/events/SseHub';

// Stub the SSE Hub
class SseHub {
  private clients: Map<string, any> = new Map();
  
  addClient(userId: string, client: any) {
    this.clients.set(userId, client);
    return () => this.clients.delete(userId);
  }
  
  emit(event: any) {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    this.clients.forEach(client => {
      try {
        client.send(data);
      } catch (error) {
        console.error('Failed to send to client:', error);
      }
    });
  }
}

const hub = new SseHub();

let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    // wireDI();
    initialized = true;
  }
}

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  ensureInitialized();
  
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'anonymous';

    if (!userId || userId === 'anonymous') {
      return Response.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // const hub = get<SseHub>(TOKENS.SSE_HUB);
    // hub is now defined globally above
    
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const send = (chunk: string) => {
          try {
            controller.enqueue(encoder.encode(chunk));
          } catch (error) {
            console.error('SSE send error:', error);
          }
        };
        
        // Send initial connection event
        send(`: SSE connected for user ${userId} at ${new Date().toISOString()}\n\n`);
        
        // Create client
        const client = {
          userId,
          send,
          close: () => {
            try {
              controller.close();
            } catch (error) {
              // Already closed
            }
          }
        };

        const unsubscribe = hub.addClient(userId, client);

        // Send welcome message
        hub.emit({
          type: 'connection',
          userId,
          message: 'SSE connection established',
          timestamp: new Date()
        });

        // Keep-alive ping every 25 seconds
        const keepAlive = setInterval(() => {
          try {
            send(`: heartbeat ${Date.now()}\n\n`);
          } catch (error) {
            clearInterval(keepAlive);
            unsubscribe();
          }
        }, 25000);

        // Cleanup on client disconnect
        const cleanup = () => {
          clearInterval(keepAlive);
          unsubscribe();
          try {
            controller.close();
          } catch (error) {
            // Already closed
          }
        };

        // Handle client disconnect
        req.signal?.addEventListener('abort', cleanup);
        
        // Return cleanup function
        return cleanup;
      },
      
      cancel() {
        // Stream cancelled by client
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'X-Accel-Buffering': 'no', // for nginx
      },
    });
    
  } catch (error: any) {
    console.error('SSE route error:', error);
    return Response.json(
      { error: 'sse_failed', message: error?.message },
      { status: 500 }
    );
  }
}