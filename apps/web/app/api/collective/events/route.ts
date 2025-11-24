/**
 * GET /api/collective/events
 * 
 * Server-Sent Events endpoint for live collective dashboard updates.
 * Streams real-time changes in coherence, patterns, and timing windows.
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || undefined;
  const expertMode = searchParams.get('expert') === 'true';

  // Create a TransformStream for SSE
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Send initial connection message
  writer.write(encoder.encode(': connected\n\n'));

  // Set up periodic updates (every 30 seconds)
  const interval = setInterval(async () => {
    try {
      // In production, this would check for actual changes
      // For now, send a heartbeat with current timestamp
      const event = {
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
        coherenceUpdate: Math.random() > 0.7, // 30% chance of update
        patternUpdate: Math.random() > 0.8,   // 20% chance of update
        userId,
        expertMode
      };

      const message = `data: ${JSON.stringify(event)}\n\n`;
      await writer.write(encoder.encode(message));

      // Simulate occasional pattern updates
      if (event.patternUpdate) {
        const patternEvent = {
          type: 'pattern',
          id: `pattern_${Date.now()}`,
          label: 'New shift detected',
          momentum: 'rising',
          timestamp: new Date().toISOString()
        };
        
        const patternMessage = `data: ${JSON.stringify(patternEvent)}\n\n`;
        await writer.write(encoder.encode(patternMessage));
      }

    } catch (error) {
      console.error('SSE write error:', error);
      clearInterval(interval);
      writer.close();
    }
  }, 30000); // 30 second intervals

  // Clean up on client disconnect
  request.signal.addEventListener('abort', () => {
    clearInterval(interval);
    writer.close();
  });

  // Return SSE response
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}