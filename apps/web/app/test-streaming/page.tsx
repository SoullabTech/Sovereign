'use client';

import { StreamingOracleVoicePlayer } from '@/components/voice/StreamingOracleVoicePlayer';
import { useState } from 'react';

export default function TestStreamingPage() {
  const [conversationState, setConversationState] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Streaming Conversation Test
        </h1>
        <p className="text-white/70 text-center mb-8">
          Real-time streaming with chunked TTS for natural conversation flow
        </p>

        <div className="max-w-3xl mx-auto">
          <StreamingOracleVoicePlayer
            userId="test-user"
            sessionId={`test-session-${Date.now()}`}
            element="aether"
            onStateChange={setConversationState}
            className="shadow-2xl"
          />

          {/* Debug State Display */}
          {conversationState && (
            <div className="mt-8 p-4 rounded-lg bg-black/30 backdrop-blur text-white/80">
              <h3 className="text-lg font-semibold mb-2">Debug State:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(conversationState, null, 2)}
              </pre>
            </div>
          )}

          {/* Features List */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-white/10 backdrop-blur">
              <h3 className="text-xl font-bold text-white mb-3">
                🚀 Streaming Features
              </h3>
              <ul className="space-y-2 text-white/80">
                <li>✅ Real-time text streaming from Maya</li>
                <li>✅ Chunked TTS generation in parallel</li>
                <li>✅ Seamless audio queue playback</li>
                <li>✅ 2-3 second latency (vs 6-9s before)</li>
                <li>✅ Auto-resume listening after Maya speaks</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-white/10 backdrop-blur">
              <h3 className="text-xl font-bold text-white mb-3">
                🎤 Conversation Flow
              </h3>
              <ul className="space-y-2 text-white/80">
                <li>1. Click mic to start listening</li>
                <li>2. Speak naturally, pause to send</li>
                <li>3. See Maya&apos;s response stream in</li>
                <li>4. Hear audio chunks as they&apos;re ready</li>
                <li>5. Auto-listens when Maya finishes</li>
              </ul>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mt-8 p-6 rounded-lg bg-white/5 backdrop-blur">
            <h3 className="text-lg font-bold text-white mb-3">
              Technical Implementation:
            </h3>
            <div className="space-y-2 text-white/70 text-sm">
              <p>• Backend: SSE streaming with OpenAI GPT-4 Turbo</p>
              <p>• Chunk Detection: Punctuation-based sentence splitting</p>
              <p>• TTS: Parallel processing with Sesame/ElevenLabs</p>
              <p>• Audio Queue: Web Audio API with preloading</p>
              <p>• Voice Input: MediaRecorder API with Whisper transcription</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}