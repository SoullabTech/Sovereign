import { NextRequest, NextResponse } from 'next/server';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { journalStorage } from '@/lib/storage/journal-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatChunk {
  type: 'text' | 'audio' | 'metadata' | 'complete' | 'error';
  data?: any;
  text?: string;
  audioData?: string;
  audioFormat?: string;
  metadata?: any;
  error?: string;
}

function sendSSE(controller: ReadableStreamDefaultController, chunk: ChatChunk) {
  const data = `data: ${JSON.stringify(chunk)}\n\n`;
  controller.enqueue(new TextEncoder().encode(data));
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { message, userId = 'beta-user', sessionId, element = 'aether' } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          sendSSE(controller, {
            type: 'metadata',
            metadata: {
              sessionId,
              element,
              startTime: new Date().toISOString()
            }
          });

          const recentEntries = journalStorage.getEntries(userId).slice(0, 5);

          console.log('🌀 Starting streaming chat for:', { userId, messageLength: message.length });

          try {
            const agent = await PersonalOracleAgent.loadAgent(userId);
            const agentResponse = await agent.processInteraction(message, {
              currentMood: { type: 'peaceful' } as any,
              currentEnergy: 'balanced' as any,
              journalEntries: recentEntries
            } as any);

            const responseText = agentResponse.response || "I hear you. Tell me more.";
            const responseElement = agentResponse.element || element;

            sendSSE(controller, {
              type: 'text',
              text: responseText,
              metadata: {
                element: responseElement,
                archetype: agentResponse.metadata?.archetypes?.[0] || 'maia',
                confidence: agentResponse.metadata?.confidence || 0.8
              }
            });

            try {
              const voiceResponse = await fetch(new URL('/api/oracle/voice', request.url).toString(), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  text: responseText,
                  characterId: 'maya-default',
                  element: responseElement,
                  userId,
                  format: 'mp3'
                })
              });

              if (voiceResponse.ok) {
                const voiceData = await voiceResponse.json();

                if (voiceData.success && voiceData.audioData) {
                  sendSSE(controller, {
                    type: 'audio',
                    audioData: voiceData.audioData,
                    audioFormat: voiceData.format || 'mp3',
                    metadata: {
                      duration: voiceData.duration,
                      characterId: voiceData.characterId
                    }
                  });
                }
              } else {
                console.warn('Voice generation failed, continuing without audio');
              }
            } catch (voiceError) {
              console.error('Voice generation error:', voiceError);
            }

            sendSSE(controller, {
              type: 'complete',
              metadata: {
                responseTime: Date.now() - startTime,
                element: responseElement
              }
            });

          } catch (agentError: any) {
            console.error('Agent error:', agentError);

            const fallbackText = "I'm here with you. Tell me more about what's on your mind.";

            sendSSE(controller, {
              type: 'text',
              text: fallbackText,
              metadata: {
                element: 'aether',
                archetype: 'maia',
                fallback: true
              }
            });

            sendSSE(controller, {
              type: 'complete',
              metadata: {
                responseTime: Date.now() - startTime,
                fallback: true
              }
            });
          }

          controller.close();

        } catch (error: any) {
          console.error('Stream error:', error);

          sendSSE(controller, {
            type: 'error',
            error: error.message || 'Streaming failed'
          });

          controller.close();
        }
      },

      cancel() {
        console.log('Stream cancelled by client');
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Chat stream error:', error);
    return NextResponse.json(
      {
        error: 'Failed to start chat stream',
        details: error.message
      },
      { status: 500 }
    );
  }
}