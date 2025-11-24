import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Streaming transcription endpoint for voice recording
export async function POST(request: NextRequest) {
  try {
    
    // Get the audio blob from the request body
    const audioBuffer = await request.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    

    if (audioBlob.size === 0) {
      console.error('[TRANSCRIBE STREAM] Empty audio blob received');
      const encoder = new TextEncoder();
      return new NextResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('data: {"type":"error","message":"Empty audio received"}\n\n'));
            controller.close();
          }
        }),
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    // Create streaming response
    const encoder = new TextEncoder();
    return new NextResponse(
      new ReadableStream({
        async start(controller) {
          try {
            // Send interim processing message
            controller.enqueue(encoder.encode('data: {"type":"interim","transcript":"Processing audio...","confidence":0.1}\n\n'));
            
            // Create form data for OpenAI Whisper
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-1');
            formData.append('language', 'en');
            formData.append('response_format', 'json');


            // Call OpenAI Whisper API
            const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              },
              body: formData
            });

            if (!whisperResponse.ok) {
              const error = await whisperResponse.text();
              console.error('[TRANSCRIBE STREAM] Whisper API error:', error);
              throw new Error(`Whisper API failed: ${whisperResponse.status}`);
            }

            const transcriptionData = await whisperResponse.json();

            // Send final result
            const finalMessage = {
              type: 'final',
              transcript: transcriptionData.text || '',
              confidence: 0.95, // Whisper doesn't provide confidence
              language: transcriptionData.language || 'en',
              duration: transcriptionData.duration
            };

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalMessage)}\n\n`));
            controller.close();

          } catch (error) {
            console.error('[TRANSCRIBE STREAM] Processing error:', error);
            const errorMessage = {
              type: 'error',
              message: error instanceof Error ? error.message : 'Transcription failed',
              details: 'Check OpenAI API key and audio format'
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
            controller.close();
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );

  } catch (error) {
    console.error('[TRANSCRIBE STREAM] Request error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process audio stream',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}