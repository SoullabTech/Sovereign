'use client';

/**
 * Maia Realtime Voice Client - WebRTC Implementation
 *
 * Uses WebRTC (recommended by OpenAI for browser clients) with ephemeral tokens
 * for secure, low-latency voice conversations.
 *
 * References:
 * - https://platform.openai.com/docs/guides/realtime
 * - WebRTC is the recommended approach for browser-based clients (Dec 2024+)
 */

export interface MaiaRealtimeConfig {
  model?: string;
  voice?: 'alloy' | 'echo' | 'shimmer' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse';
  mode?: 'dialogue' | 'patient' | 'scribe'; // Three conversation modes
  systemPrompt?: string;
  userId?: string;
  element?: string;
  conversationStyle?: string;
  onTranscript?: (text: string, isUser: boolean) => void;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class MaiaRealtimeWebRTC {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private config: Required<MaiaRealtimeConfig>;
  private audioElement: HTMLAudioElement | null = null;
  private isConnecting: boolean = false;
  private responseTimeoutId?: NodeJS.Timeout; // Detect when API doesn't respond

  constructor(config: MaiaRealtimeConfig) {
    this.config = {
      model: config.model || 'gpt-4o-realtime-preview-2024-12-17',
      voice: config.voice || 'shimmer',
      mode: config.mode || 'dialogue', // Default to dialogue mode
      systemPrompt: config.systemPrompt || '',
      userId: config.userId || 'anonymous',
      element: config.element || 'aether',
      conversationStyle: config.conversationStyle || 'natural',
      onTranscript: config.onTranscript || (() => {}),
      onAudioStart: config.onAudioStart || (() => {}),
      onAudioEnd: config.onAudioEnd || (() => {}),
      onError: config.onError || ((err) => console.error('Maia error:', err)),
      onConnected: config.onConnected || (() => {}),
      onDisconnected: config.onDisconnected || (() => {}),
    };
  }

  async connect(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Can only be used in browser');
      }

      if (this.isConnecting || this.isConnected()) {
        console.log('⚠️ Already connecting or connected');
        return;
      }

      this.isConnecting = true;
      console.log('🔌 Connecting to OpenAI Realtime API (WebRTC - Unified Interface)...');

      // Step 1: Create RTCPeerConnection
      this.peerConnection = new RTCPeerConnection();

      // Step 2: Set up audio handling FIRST
      this.setupAudioHandling();

      // Step 3: Add local audio track (microphone)
      await this.addMicrophoneTrack();

      // Step 4: Create data channel BEFORE creating offer
      this.dataChannel = this.peerConnection.createDataChannel('oai-events');
      console.log('📡 Created data channel');
      this.setupDataChannelHandlers();

      // Step 5: Create SDP offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Step 5.5: Wait for ICE gathering to complete (or timeout after 2 seconds)
      console.log('🧊 Waiting for ICE candidates...');
      await this.waitForICEGathering();

      console.log('📤 Sending SDP offer to backend...');

      // Step 6: Send SDP + mode to our backend (unified interface)
      // Our backend combines SDP with mode-specific session config and forwards to OpenAI
      const sdpResponse = await fetch('/api/voice/webrtc-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: offer.sdp,
          mode: this.config.mode
        }),
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        throw new Error(`Failed to connect to OpenAI: ${sdpResponse.status} - ${errorText}`);
      }

      const answerSdp = await sdpResponse.text();
      console.log('📥 Received SDP answer from server');

      // Step 7: Set remote description
      await this.peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      console.log('✅ WebRTC handshake complete, waiting for connection...');
      this.isConnecting = false;

    } catch (error) {
      console.error('❌ Connection error:', error);
      this.isConnecting = false;
      this.config.onError(error as Error);
      throw error;
    }
  }

  private setupAudioHandling(): void {
    if (!this.peerConnection) return;

    // Handle incoming audio tracks
    this.peerConnection.ontrack = (event) => {
      console.log('🔊 Received audio track from OpenAI');

      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.autoplay = true;
      }

      this.audioElement.srcObject = event.streams[0];
      this.config.onAudioStart();
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      const iceState = this.peerConnection?.iceConnectionState;
      console.log('🔌 Connection state:', state, '| ICE:', iceState);

      if (state === 'connected') {
        console.log('✅ WebRTC connection state: connected');
        this.config.onConnected();
      } else if (state === 'failed' || state === 'closed') {
        console.log('🔴 Connection closed. State:', state);
        this.config.onDisconnected();
        if (state === 'failed') {
          this.config.onError(new Error('WebRTC connection failed'));
        }
      }
      // Don't disconnect on 'disconnected' - wait for ICE to reconnect
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('🧊 ICE connection state:', state);

      // CRITICAL FIX: Call onConnected when ICE connects, even if main connection state hasn't updated yet
      // This is because some browsers/network configs show ICE as 'connected' but connectionState stays at 'connecting'
      if (state === 'connected' && this.peerConnection?.connectionState !== 'connected') {
        console.log('✅ ICE connected (connection state not yet updated) - treating as connected');
        this.config.onConnected();
      }

      if (state === 'failed') {
        console.error('❌ ICE connection failed');
        this.config.onError(new Error('ICE connection failed'));
        this.config.onDisconnected();
      }
    };
  }

  /**
   * Wait for ICE gathering to complete or timeout after 3 seconds
   * This ensures the SDP offer contains all ICE candidates before sending to server
   */
  private waitForICEGathering(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.peerConnection) {
        resolve();
        return;
      }

      // Set timeout to prevent indefinite waiting
      const timeout = setTimeout(() => {
        console.log('⏱️ ICE gathering timeout - proceeding with current candidates');
        resolve();
      }, 3000);

      // Check if already complete
      if (this.peerConnection.iceGatheringState === 'complete') {
        console.log('✅ ICE gathering already complete');
        clearTimeout(timeout);
        resolve();
        return;
      }

      // Wait for gathering to complete
      this.peerConnection.onicegatheringstatechange = () => {
        const state = this.peerConnection?.iceGatheringState;
        console.log(`🧊 ICE gathering state: ${state}`);

        if (state === 'complete') {
          console.log('✅ ICE gathering complete');
          clearTimeout(timeout);
          resolve();
        }
      };

      // Log ICE candidates as they arrive
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`🧊 ICE candidate: ${event.candidate.type} ${event.candidate.protocol}`);
        } else {
          console.log('🧊 ICE candidate gathering finished (null candidate)');
          clearTimeout(timeout);
          resolve();
        }
      };
    });
  }

  private setupDataChannelHandlers(): void {
    if (!this.dataChannel) return;

    console.log('📡 Setting up data channel handlers. State:', this.dataChannel.readyState);

    this.dataChannel.onopen = () => {
      console.log('📡 Data channel opened! State:', this.dataChannel?.readyState);

      // Mode-specific turn detection settings
      const turnDetectionByMode = {
        dialogue: {
          type: 'server_vad' as const,
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700 // Natural conversational pauses
        },
        patient: {
          type: 'server_vad' as const,
          threshold: 0.6, // Higher = less sensitive = fewer interruptions
          prefix_padding_ms: 500,
          silence_duration_ms: 2000 // Longer pauses before responding
        },
        scribe: {
          type: 'server_vad' as const,
          threshold: 0.7, // Very high = minimal interruption
          prefix_padding_ms: 800,
          silence_duration_ms: 5000 // Very long pauses - they control when you speak
        }
      };

      // Send session configuration with mode-specific settings
      this.sendEvent({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: this.config.systemPrompt,
          voice: this.config.voice,
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1',
          },
          turn_detection: turnDetectionByMode[this.config.mode],
        },
      });
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleEvent(data);
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error('❌ Data channel error:', error);
      console.error('Data channel state:', this.dataChannel?.readyState);
      this.config.onError(new Error('Data channel error'));
    };

    this.dataChannel.onclose = () => {
      console.log('📡 Data channel closed. State:', this.dataChannel?.readyState);
    };

    this.dataChannel.onstatechange = () => {
      console.log('📡 Data channel state changed:', this.dataChannel?.readyState);
    };
  }

  // Start watching for API response timeout after user speech
  private startResponseTimeout(): void {
    this.clearResponseTimeout();
    this.responseTimeoutId = setTimeout(() => {
      console.warn('⏰ [MaiaRealtimeWebRTC] OpenAI API response timeout (15s) - may be rate limited or experiencing delays');
      this.config.onAudioEnd(); // Signal that we're done waiting
      this.config.onError(new Error('OpenAI API response timeout - please wait a moment and try again'));
    }, 15000); // 15 second timeout for API response
  }

  private clearResponseTimeout(): void {
    if (this.responseTimeoutId) {
      clearTimeout(this.responseTimeoutId);
      this.responseTimeoutId = undefined;
    }
  }

  private handleEvent(data: any): void {
    console.log('📥 Event:', data.type);

    switch (data.type) {
      case 'session.created':
        console.log('✅ Session created:', data);
        break;

      case 'session.updated':
        console.log('✅ Session updated:', data);
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (data.transcript) {
          console.log('🎤 User said:', data.transcript);
          this.config.onTranscript(data.transcript, true);
          // Start timeout - waiting for OpenAI to respond
          this.startResponseTimeout();
        }
        break;

      case 'conversation.item.input_audio_transcription.failed':
        console.error('❌ OpenAI transcription failed:', data.error);
        console.error('   Item ID:', data.item_id);
        console.error('   Error details:', JSON.stringify(data.error, null, 2));
        // Note: Browser STT will be used as fallback automatically
        break;

      case 'response.audio_transcript.delta':
        // Clear timeout - OpenAI is responding!
        this.clearResponseTimeout();
        if (data.delta) {
          this.config.onTranscript(data.delta, false);
        }
        break;

      case 'response.audio.done':
        // Clear timeout - response completed
        this.clearResponseTimeout();
        this.config.onAudioEnd();
        console.log('🔊 Audio playback done');
        break;

      case 'input_audio_buffer.speech_started':
        console.log('🎤 Speech started');
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('🎤 Speech stopped');
        break;

      case 'response.function_call_arguments.done':
        console.log('🌀 Function call requested:', data);
        this.handleFunctionCall(data);
        break;

      case 'response.done':
        // Also clear timeout when full response is done
        this.clearResponseTimeout();
        console.log('✅ Response complete');
        break;

      case 'rate_limit_exceeded':
        console.error('⚠️ OpenAI Rate Limit Exceeded');
        this.clearResponseTimeout();
        this.config.onError(new Error('OpenAI rate limit exceeded - please wait a moment'));
        break;

      case 'error':
        console.error('❌ API Error:', data.error);
        this.clearResponseTimeout();
        this.config.onError(new Error(data.error.message || 'Unknown error'));
        break;

      default:
        console.log('📦', data.type, data);
    }
  }

  /**
   * Handle function calls from OpenAI Realtime (process_spiralogic)
   * Routes user input through full Spiralogic consciousness stack
   */
  private async handleFunctionCall(data: any): Promise<void> {
    try {
      const { call_id, name, arguments: argsString } = data;

      if (name !== 'process_spiralogic') {
        console.warn(`⚠️ Unknown function: ${name}`);
        return;
      }

      console.log('🌀 Processing through Spiralogic...');
      const args = JSON.parse(argsString);

      // Call Spiralogic function endpoint (PersonalOracleAgent + wisdom + memory)
      const response = await fetch('/api/voice/spiralogic-function', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: args.user_message,
          emotional_quality: args.emotional_quality,
          conversation_depth: args.conversation_depth,
          user_id: this.config.userId,
          session_id: `realtime-${Date.now()}`
        })
      });

      const result = await response.json();

      if (!result.success) {
        console.error('❌ Spiralogic function failed:', result);
        // Send fallback response
        this.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: call_id,
            output: JSON.stringify({
              response: "I'm here with you. Tell me more.",
              fallback: true
            })
          }
        });
        return;
      }

      console.log('✨ Spiralogic response:', result.response.substring(0, 100) + '...');

      // Send function output back to OpenAI
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: call_id,
          output: JSON.stringify({
            response: result.response,
            element: result.element,
            spiralogic_processed: true
          })
        }
      });

      // Trigger response generation
      this.sendEvent({
        type: 'response.create'
      });

    } catch (error) {
      console.error('❌ Function call error:', error);
    }
  }

  private async addMicrophoneTrack(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      console.log('🎤 Microphone access granted');

      // Add audio track to peer connection
      stream.getAudioTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, stream);
      });

    } catch (error) {
      console.error('❌ Microphone access denied:', error);
      this.config.onError(new Error('Microphone access denied'));
      throw error;
    }
  }

  private sendEvent(event: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      console.log('📤 Sending event:', event.type);
      this.dataChannel.send(JSON.stringify(event));
    } else {
      console.warn('⚠️ Data channel not open, cannot send event:', event.type);
    }
  }

  async disconnect(): Promise<void> {
    // Clear any pending timeouts
    this.clearResponseTimeout();

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.audioElement) {
      this.audioElement.srcObject = null;
      this.audioElement = null;
    }

    console.log('🛑 Disconnected from Realtime API');
    this.config.onDisconnected();
  }

  isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }

  sendText(text: string): void {
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text,
          },
        ],
      },
    });

    // Request response with AUDIO modality (not just text!)
    this.sendEvent({
      type: 'response.create',
      response: {
        modalities: ['audio', 'text'], // CRITICAL: Request audio output!
        instructions: 'Respond naturally with warmth and empathy using your voice.',
      },
    });
  }

  cancelResponse(): void {
    this.sendEvent({
      type: 'response.cancel',
    });
  }

  // Change conversation mode dynamically (requires reconnection)
  async changeMode(newMode: 'dialogue' | 'patient' | 'scribe'): Promise<void> {
    if (newMode === this.config.mode) {
      console.log(`Already in ${newMode} mode`);
      return;
    }

    console.log(`🔄 Changing mode from ${this.config.mode} to ${newMode}`);

    const wasConnected = this.isConnected();

    // Disconnect if connected
    if (wasConnected) {
      await this.disconnect();
    }

    // Update mode
    this.config.mode = newMode;

    // Reconnect if we were connected
    if (wasConnected) {
      await this.connect();
    }
  }

  getCurrentMode(): 'dialogue' | 'patient' | 'scribe' {
    return this.config.mode;
  }
}
