/**
 * MAIA SDK - Complete Usage Example
 *
 * This shows you exactly how to use the SDK in your MAIA app.
 * Copy this into your OracleConversation.tsx and adapt as needed.
 */

import { MAIARealtimeSDK } from './index';

// ============================================
// Configuration
// ============================================

const sdk = new MAIARealtimeSDK({
  // List all available providers
  providers: [
    // Local Whisper - FREE speech-to-text
    {
      name: 'local-whisper',
      endpoint: 'http://localhost:8001',
      priority: 100, // Highest priority
      capabilities: ['stt'],
      config: {
        model: 'base.en' // or 'small', 'medium', 'large-v3'
      }
    },

    // Local XTTS - FREE text-to-speech with YOUR voices
    {
      name: 'local-xtts',
      endpoint: 'http://localhost:8000',
      priority: 100,
      capabilities: ['tts'],
      config: {
        voice: 'maya', // Your custom-trained voice
        language: 'en'
      }
    },

    // Claude (Anthropic) - CHEAPER LLM ($0.003 vs $0.006 per 1K tokens)
    {
      name: 'anthropic',
      endpoint: 'https://api.anthropic.com',
      apiKey: process.env.ANTHROPIC_API_KEY,
      priority: 90,
      capabilities: ['llm'],
      config: {
        model: 'claude-sonnet-4-20250514',
        maxTokens: 4096
      }
    },

    // OpenAI - FALLBACK for everything
    {
      name: 'openai',
      endpoint: 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY,
      priority: 50, // Lower priority (fallback)
      capabilities: ['stt', 'llm', 'tts']
    }
  ],

  // If a provider fails, try these in order
  fallbackChain: ['local-whisper', 'openai', 'anthropic'],

  // Always use cheapest available provider
  costOptimization: true,

  // Show detailed logs
  debug: true
});

// ============================================
// Event Listeners (Track Everything)
// ============================================

sdk.on('session.started', (data) => {
  console.log('🎙️ Session started:', data.sessionId);
  console.log('📊 Using providers:', data.providers);
});

sdk.on('stt.completed', (data) => {
  console.log('👤 User said:', data.text);
  // Update UI: show user message
});

sdk.on('llm.completed', (data) => {
  console.log('🤖 Maya responds:', data.text);
  // Update UI: show Maya's text response
});

sdk.on('tts.completed', (data) => {
  console.log('🔊 Audio ready, playing...');
  // Play audio: playAudioSamples(data.audio)
});

sdk.on('response.complete', (data) => {
  console.log(`⚡ Response in ${data.latency}ms`);
  console.log('Full exchange:', {
    user: data.userText,
    assistant: data.assistantText
  });
});

sdk.on('cost.update', (data) => {
  console.log(`💰 Cost: $${data.total.toFixed(4)} (${data.type}: +$${data.cost.toFixed(4)})`);
  // Update UI: show running cost
});

sdk.on('failover', (data) => {
  console.warn(`🔄 Failover: ${data.from} → ${data.to}`);
  console.warn(`   Reason: ${data.reason}`);
  // Show toast: "Switched to backup provider"
});

sdk.on('error', (error) => {
  console.error('❌ Error:', error);
  // Show error to user
});

// ============================================
// Usage in React Component
// ============================================

export async function exampleUsageInReact() {

  // 1. Start a session
  await sdk.startSession(
    'You are Maya, a wise oracle guide...',
    'maya' // voice name
  );

  // 2. Capture microphone audio
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext({ sampleRate: 24000 });
  const source = audioContext.createMediaStreamSource(stream);

  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = async (e) => {
    const audioData = e.inputBuffer.getChannelData(0);

    // Send to SDK for processing
    await sdk.processAudio(audioData);
  };

  source.connect(processor);
  processor.connect(audioContext.destination);

  // 3. Let it run... SDK handles everything!
  // - Transcribes speech
  // - Gets LLM response
  // - Synthesizes speech
  // - Tracks costs
  // - Handles failovers

  // 4. When done, end session
  setTimeout(async () => {
    const session = await sdk.endSession();

    console.log('📊 Session Summary:');
    console.log('   Duration:', (Date.now() - session.startTime) / 1000, 'seconds');
    console.log('   Messages:', session.transcript.length);
    console.log('   Total Cost: $' + session.cost.total.toFixed(4));
    console.log('   Avg Latency:',
      session.metrics.latency.reduce((a, b) => a + b, 0) / session.metrics.latency.length,
      'ms'
    );
  }, 60000); // End after 1 minute
}

// ============================================
// Simple One-Off Usage
// ============================================

export async function simpleExample() {
  await sdk.startSession('You are a helpful assistant');

  // Process some audio
  const audioChunk = new Float32Array(24000); // 1 second of silence
  await sdk.processAudio(audioChunk);

  // End session
  const summary = await sdk.endSession();
  console.log('Total cost:', summary.cost.total);
}

// ============================================
// Cost Comparison Example
// ============================================

export async function compareCosts() {
  console.log('💰 Cost Comparison for 10-minute conversation:');
  console.log('');

  // Scenario 1: All OpenAI
  console.log('Scenario 1: All OpenAI');
  console.log('  STT: 10 min × $0.006/min = $0.06');
  console.log('  LLM: 5K tokens × $0.006/1K = $0.03');
  console.log('  TTS: 2K chars × $0.015/1K = $0.03');
  console.log('  TOTAL: $0.12');
  console.log('');

  // Scenario 2: Hybrid (Your SDK)
  console.log('Scenario 2: Hybrid (MAIA SDK)');
  console.log('  STT: Local Whisper = $0.00 (FREE!)');
  console.log('  LLM: Claude = 5K tokens × $0.003/1K = $0.015');
  console.log('  TTS: Local XTTS = $0.00 (FREE!)');
  console.log('  TOTAL: $0.015');
  console.log('');

  console.log('💰 SAVINGS: $0.105 per conversation (87.5%)');
  console.log('💰 At 100 conversations/day:');
  console.log('  OpenAI: $12/day = $360/month');
  console.log('  MAIA SDK: $1.50/day = $45/month');
  console.log('  SAVINGS: $315/month = $3,780/year');
}

// ============================================
// Health Check Example
// ============================================

export async function checkProviderHealth() {
  console.log('🏥 Checking provider health...\n');

  const health = await sdk.healthCheck();

  for (const [provider, isHealthy] of Object.entries(health)) {
    console.log(`${isHealthy ? '✅' : '❌'} ${provider}`);
  }

  // If local providers are down, will automatically use OpenAI
  if (!health['local-whisper'] || !health['local-xtts']) {
    console.log('\n⚠️  Local providers unavailable, will use OpenAI fallback');
  }
}

// ============================================
// Integration with Existing MAIA Code
// ============================================

/**
 * Drop-in replacement for your current voice handling
 */
export class MAIAVoiceHandler {
  private sdk: MAIARealtimeSDK;
  private isRecording = false;

  constructor() {
    this.sdk = new MAIARealtimeSDK({
      providers: [/* ... see above ... */],
      fallbackChain: ['local-whisper', 'openai'],
      costOptimization: true
    });

    // Connect to your existing event system
    this.sdk.on('stt.completed', (data) => {
      this.onUserMessage(data.text);
    });

    this.sdk.on('tts.completed', (data) => {
      this.playAudio(data.audio);
    });

    this.sdk.on('cost.update', (data) => {
      this.updateCostDisplay(data.total);
    });
  }

  async startConversation() {
    await this.sdk.startSession('You are Maya...');
    this.isRecording = true;
    // Start capturing mic...
  }

  async stopConversation() {
    this.isRecording = false;
    const summary = await this.sdk.endSession();
    return summary;
  }

  // Existing methods you already have
  private onUserMessage(text: string) {
    // Update UI with user message
  }

  private playAudio(samples: Float32Array) {
    // Play audio (you already have this code)
  }

  private updateCostDisplay(cost: number) {
    // Update cost counter in UI
  }
}

// ============================================
// Export for use
// ============================================

export default sdk;
