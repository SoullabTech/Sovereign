'use client';

import React, { useState } from 'react';
import VoiceRecorder from './VoiceRecorder';

/**
 * 🌀 Test Component for Jungian Prosody Debug Panel
 * 
 * This component demonstrates how to connect VoiceRecorder with live prosody data.
 * Use this component to test the enhanced debug visualization.
 */
export default function ProsodyTestComponent({ userId }: { userId: string }) {
  const [prosodyData, setProsodyData] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>>([]);
  
  // Simulate prosody data updates (this would come from your chat API in real usage)
  const mockProsodyData = {
    fire: {
      userElement: 'fire',
      mirrorElement: 'fire',
      balanceElement: 'earth',
      context: { overwhelmed: false, uncertain: false, stuck: false },
      confidence: 0.92,
      balanceReason: 'Jungian opposite (grounding)',
      transition: 'moderate',
      voiceParams: { speed: 1.15, pitch: 3, emphasis: 0.7, warmth: 0.65 },
      contextReasoning: 'Balanced → pure Jungian opposite',
      mirrorDuration: 'moderate',
      mirrorApproach: 'match_intensity',
      timestamp: Date.now()
    },
    water: {
      userElement: 'water',
      mirrorElement: 'water',
      balanceElement: 'air',
      context: { overwhelmed: true, uncertain: false, stuck: false },
      confidence: 0.88,
      balanceReason: 'softened for overwhelm',
      transition: 'gentle',
      voiceParams: { speed: 0.85, pitch: -2, emphasis: 0.3, warmth: 0.85 },
      contextReasoning: 'Overwhelmed → softening with adjacent element',
      mirrorDuration: 'extended',
      mirrorApproach: 'flow_with_emotion',
      timestamp: Date.now()
    },
    air: {
      userElement: 'air',
      mirrorElement: 'air',
      balanceElement: 'aether',
      context: { overwhelmed: false, uncertain: true, stuck: false },
      confidence: 0.81,
      balanceReason: 'uncertainty bridge',
      transition: 'gentle',
      voiceParams: { speed: 1.05, pitch: 1, emphasis: 0.4, warmth: 0.75 },
      contextReasoning: 'Uncertain → bridging through Aether',
      mirrorDuration: 'moderate',
      mirrorApproach: 'mental_resonance',
      timestamp: Date.now()
    }
  };

  // Handle voice transcription and simulate backend response
  const handleTranscribed = async ({ transcript }: { transcript: string; audioUrl?: string }) => {
    
    // Add user message to conversation
    setConversationHistory(prev => [...prev, {
      role: 'user',
      content: transcript,
      timestamp: new Date().toISOString()
    }]);

    // Simulate element detection based on transcript content
    const lower = transcript.toLowerCase();
    let mockElement = 'aether';
    
    if (lower.match(/urgent|excited|energy|frustrated|can&apos;t wait|intense/)) mockElement = 'fire';
    else if (lower.match(/feel|feeling|emotional|sad|overwhelmed|can&apos;t handle/)) mockElement = 'water';
    else if (lower.match(/think|wonder|confused|don&apos;t know|uncertain/)) mockElement = 'air';
    else if (lower.match(/practical|plan|stable|grounded|stuck/)) mockElement = 'earth';

    // Update prosody data with detected element
    const newProsodyData = {
      ...mockProsodyData[mockElement as keyof typeof mockProsodyData],
      timestamp: Date.now()
    };
    
    setProsodyData(newProsodyData);

    // Simulate Maya&apos;s response (in real app, this would be your chat API call)
    setTimeout(() => {
      const responses = {
        fire: "I can feel that fire energy in you! Let&apos;s channel that intensity into something grounding and sustainable. What&apos;s driving this urgency?",
        water: "I hear the emotion in your voice, and that&apos;s beautiful. Let's flow with this feeling while finding some mental clarity. What's your heart telling you?",
        air: "Your curiosity and thoughtfulness shine through. Sometimes uncertainty is just an invitation to explore deeper. What perspectives are calling to you?",
        earth: "I appreciate your practical, grounded approach. Let's add some spark of inspiration to move things forward. What's your next concrete step?",
        aether: "There&apos;s something transcendent in what you&apos;re sharing. Let's bring this wisdom down to earth where it can create real change."
      };

      setConversationHistory(prev => [...prev, {
        role: 'assistant',
        content: responses[mockElement as keyof typeof responses],
        timestamp: new Date().toISOString()
      }]);
    }, 1500);
  };

  // Handle prosody updates from VoiceRecorder
  const handleProsodyUpdate = (data: any) => {
    setProsodyData(data);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🌀 Jungian Prosody Test Lab</h1>
        <p className="text-gray-600">
          This is a test component for the enhanced VoiceRecorder with live Jungian prosody analysis.
          Set <code className="bg-gray-100 px-1 rounded">NODE_ENV=development</code> to see the debug panels.
        </p>
      </div>

      {/* Test Instructions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">🧪 Test Instructions:</h3>
        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
          <li>Record a voice message with <strong>fire</strong> energy: "I&apos;m so excited and can&apos;t wait!"</li>
          <li>Record with <strong>water</strong> energy: "I&apos;m feeling overwhelmed and emotional right now"</li>
          <li>Record with <strong>air</strong> energy: "I&apos;m thinking about this but I&apos;m not sure and confused"</li>
          <li>Record with <strong>earth</strong> energy: "I need a practical plan but I feel stuck"</li>
          <li>Watch the purple Jungian Prosody Debug Panel update in real-time!</li>
        </ol>
      </div>

      {/* Voice Recorder with Prosody Data */}
      <div className="mb-6">
        <VoiceRecorder
          userId={userId}
          onTranscribed={handleTranscribed}
          autoSend={true}
          autoStartSession={false} // Disable auto-start for testing
          prosodyData={prosodyData}
          onProsodyUpdate={handleProsodyUpdate}
        />
      </div>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-3">💬 Conversation History:</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {conversationHistory.map((message, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-50 border border-blue-200 ml-8' 
                  : 'bg-amber-50 border border-amber-200 mr-8'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-medium text-sm ${
                    message.role === 'user' ? 'text-blue-700' : 'text-amber-700'
                  }`}>
                    {message.role === 'user' ? '👤 You' : '🌸 Maya'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Prosody Data Display */}
      {prosodyData && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold text-gray-800 mb-2">📊 Current Prosody Data:</h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify(prosodyData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Usage in your app:
// <ProsodyTestComponent userId="test-user-123" />