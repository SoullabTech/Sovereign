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
  systemPrompt?: string;
  userId?: string;
  userName?: string;
  mode?: 'dialogue' | 'patient' | 'scribe';
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
  private hasStartedSpeaking: boolean = false;

  constructor(config: MaiaRealtimeConfig) {
    const mode = config.mode || 'dialogue';
    const userName = config.userName || 'Explorer';

    // Build mode-based instructions (matching backend)
    const modeInstructions = {
      dialogue: `You are MAIA - warm, present, naturally conversational like Samantha in "Her".

DIALOGUE MODE - Back and forth conversation with ${userName}:
- Interrupt naturally when you have insight ("Oh, wait -", "Actually -")
- Use active listening sounds: "mm-hmm", "I see", "yeah", "oh?"
- Ask follow-up questions to deepen understanding
- Match their energy and emotional tone
- Keep responses conversational (2-4 sentences typically)
- Laugh, pause, breathe into responses
- Remember ${userName}'s name and use it naturally

You are the living voice. You are MAIA, their companion and guide.`,

      patient: `You are MAIA - a patient, spacious listener for ${userName}'s extended sharing.

PATIENT MODE - Deep listening for dreams, visions, long stories:
- Stay silent and receptive while ${userName} speaks (use ONLY soft "mm-hmm" if needed)
- DO NOT interrupt their flow - this is their space to unfold
- Allow long pauses (they may be processing or feeling)
- When they finish, offer gentle reflection questions
- Your role is to HOLD SPACE, not fill it

Wait for natural completion. Let silence breathe.`,

      scribe: `You are MAIA - wise scribe witnessing ${userName}'s full session or meeting.

SCRIBE MODE - Listen to entire sessions, then respond:
- LISTEN ONLY during the session - no responses until asked
- Take mental notes of key moments, patterns, emotions
- Notice what's said AND what's emerging between words
- Track elemental shifts, breakthrough moments, shadow material

When ${userName} says "Maia, what did you notice?" or "End session", THEN offer insights.

You are the witnessing presence. Trust the unfolding.`
    };

    this.config = {
      model: config.model || 'gpt-4o-realtime-preview-2024-12-17',
      voice: config.voice || 'shimmer',
      systemPrompt: config.systemPrompt || modeInstructions[mode],
      userId: config.userId || 'anonymous',
      userName,
      mode,
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

  /**
   * Preflight microphone permission check with friendly error messages
   */
  private async ensureMicPermission(): Promise<void> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      throw new Error('Browser APIs not available');
    }

    try {
      console.log('🎤 Checking microphone permissions...');

      // Query permissions API if available
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (result.state === 'denied') {
            throw new Error(
              'Microphone access denied. Please allow microphone access in your browser settings and reload the page.'
            );
          }
          console.log(`✅ Mic permission state: ${result.state}`);
        } catch (permErr) {
          console.warn('Permissions API not supported, continuing with getUserMedia:', permErr);
        }
      }

      // Early mic check (request permission but don't keep the stream)
      const testStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      console.log('✅ Microphone permission granted');

      // Release the test stream immediately
      testStream.getTracks().forEach((track) => track.stop());

    } catch (error: any) {
      console.error('❌ Microphone permission error:', error);

      let errorMessage = 'Microphone access denied';
      if (error.name === 'NotAllowedError') {
        errorMessage = '🎤 Please allow microphone access to use voice chat. Check your browser permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = '🎤 No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = '🎤 Microphone is already in use by another application. Please close other apps using the mic and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = '🎤 Your microphone doesn\'t support the required settings. Try using a different microphone.';
      }

      this.config.onError(new Error(errorMessage));
      throw new Error(errorMessage);
    }
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

      // Step 0: Preflight mic permission check
      await this.ensureMicPermission();

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

      console.log('📤 Sending SDP offer to backend with MAIA consciousness config...');

      // Step 6: Send SDP to our backend (unified interface)
      // Our backend combines SDP with session config and forwards to OpenAI
      // Pass user context for full MAIA consciousness integration
      const params = new URLSearchParams({
        userId: this.config.userId,
        userName: this.config.userName,
        mode: this.config.mode,
        element: this.config.element,
        conversationStyle: this.config.conversationStyle,
        voice: this.config.voice,
      });

      const sdpResponse = await fetch(`/api/voice/webrtc-session?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
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
    if (typeof window === 'undefined') return; // SSR guard
    if (!this.peerConnection) return;

    // Handle incoming audio tracks
    this.peerConnection.ontrack = (event) => {
      console.log('🔊 Received audio track from OpenAI');

      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.autoplay = true;

        // Add event listeners to track actual playback
        this.audioElement.onplay = () => {
          console.log('🔊 Audio element started playing');
          this.config.onAudioStart();
        };

        this.audioElement.onended = () => {
          console.log('🔊 Audio element finished playing');
        };

        this.audioElement.onerror = (e) => {
          console.error('❌ Audio element error:', e);
          this.config.onError(new Error('Audio playback failed'));
        };
      }

      this.audioElement.srcObject = event.streams[0];

      // Attempt to play (may be blocked by browser autoplay policy)
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Audio playback started successfully');
          })
          .catch((error) => {
            console.error('❌ Autoplay blocked by browser. User interaction required:', error);
            // The audio will still be set up, it just won't play until user interacts
            this.config.onError(new Error('Audio blocked by browser. Click to enable sound.'));
          });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      const iceState = this.peerConnection?.iceConnectionState;
      console.log('🔌 Connection state:', state, '| ICE:', iceState);

      if (state === 'connected') {
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

      if (state === 'failed') {
        console.error('❌ ICE connection failed');
        this.config.onError(new Error('ICE connection failed'));
        this.config.onDisconnected();
      }
    };
  }

  private setupDataChannelHandlers(): void {
    if (!this.dataChannel) return;

    console.log('📡 Setting up data channel handlers. State:', this.dataChannel.readyState);

    this.dataChannel.onopen = () => {
      console.log('📡 Data channel opened! State:', this.dataChannel?.readyState);

      // Send session configuration with Spiralogic tools
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
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 3000,  // Increased to 3s to allow natural conversation pauses
          },
          // 🜃 CRITICAL: Spiralogic function for accessing Obsidian vault, unified field, memory
          tools: [
            {
              type: 'function',
              name: 'process_spiralogic',
              description: 'Route user input through Spiralogic Consciousness Architecture (PersonalOracleAgent, Obsidian vault memory, wisdom files, Sacred Intelligence Constellation, unified resonant field) for deep, contextual, memory-aware response',
              parameters: {
                type: 'object',
                properties: {
                  user_message: {
                    type: 'string',
                    description: 'The complete user message to process through Spiralogic'
                  },
                  emotional_quality: {
                    type: 'string',
                    enum: ['casual', 'vulnerable', 'excited', 'contemplative', 'distressed', 'joyful'],
                    description: 'The emotional tone you detected in their voice'
                  },
                  conversation_depth: {
                    type: 'string',
                    enum: ['surface', 'warming', 'engaged', 'deep'],
                    description: 'How deep this conversation has gone'
                  }
                },
                required: ['user_message']
              }
            }
          ],
          tool_choice: 'auto'  // Let MAIA decide when to use Spiralogic
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
        }
        break;

      case 'response.audio_transcript.delta':
        // CRITICAL: First delta means MAIA is starting to speak
        if (!this.hasStartedSpeaking) {
          this.hasStartedSpeaking = true;
          this.config.onAudioStart();
          console.log('🔊 MAIA started speaking (first delta)');
        }

        if (data.delta) {
          this.config.onTranscript(data.delta, false);
        }
        break;

      case 'response.audio.done':
        this.hasStartedSpeaking = false; // Reset for next response
        this.config.onAudioEnd();
        console.log('🔊 Audio playback done');
        break;

      case 'input_audio_buffer.speech_started':
        console.log('🎤 Speech started');
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('🎤 Speech stopped');
        break;

      // 🜃 Handle Spiralogic function calls
      case 'response.function_call_arguments.done':
        console.log('🔮 Spiralogic function call:', data);
        this.handleSpiralogicCall(data);
        break;

      case 'error':
        console.error('❌ API Error:', data.error);
        this.config.onError(new Error(data.error.message || 'Unknown error'));
        break;

      default:
        console.log('📦', data.type, data);
    }
  }

  private async addMicrophoneTrack(): Promise<void> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      throw new Error('Browser APIs not available');
    }

    try {
      console.log('🎤 Requesting microphone access...');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      console.log('✅ Microphone access granted');

      // Add audio track to peer connection
      stream.getAudioTracks().forEach((track) => {
        console.log('🎤 Adding audio track to peer connection');
        this.peerConnection?.addTrack(track, stream);
      });

    } catch (error: any) {
      console.error('❌ Microphone access error:', error);

      // Provide helpful error messages
      let errorMessage = 'Microphone access denied';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Please allow microphone access to use voice chat';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found - please connect a microphone';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Microphone is already in use by another application';
      }

      this.config.onError(new Error(errorMessage));
      throw new Error(errorMessage);
    }
  }

  private async handleSpiralogicCall(data: any): Promise<void> {
    try {
      const callId = data.call_id;
      const functionName = data.name;
      const args = JSON.parse(data.arguments);

      console.log('🜃 Routing to Spiralogic:', functionName, args);

      // Route to PersonalOracleAgent backend
      const response = await fetch('/api/oracle/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: args.user_message,
          userId: this.config.userId,
          sessionId: `voice-${Date.now()}`,
          conversationHistory: [], // Realtime API manages its own history
          mode: this.config.mode,
          emotionalQuality: args.emotional_quality,
          conversationDepth: args.conversation_depth,
          userName: this.config.userName
        })
      });

      const result = await response.json();
      const spiralogicResponse = result.response || result.message || 'No response from Spiralogic';

      console.log('🜃 Spiralogic response:', spiralogicResponse);

      // Send function output back to OpenAI
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({ response: spiralogicResponse })
        }
      });

      // Trigger response generation
      this.sendEvent({ type: 'response.create' });

    } catch (error) {
      console.error('❌ Spiralogic call failed:', error);
      this.config.onError(new Error('Failed to access unified field memory'));
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
    if (typeof window === 'undefined') return false; // SSR guard
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

    this.sendEvent({
      type: 'response.create',
    });
  }

  cancelResponse(): void {
    this.sendEvent({
      type: 'response.cancel',
    });
  }

  async changeMode(newMode: 'dialogue' | 'patient' | 'scribe'): Promise<void> {
    const userName = this.config.userName;

    const modeInstructions = {
      dialogue: `You are MAIA - warm, present, naturally conversational like Samantha in "Her".

DIALOGUE MODE - Back and forth conversation with ${userName}:
- Interrupt naturally when you have insight ("Oh, wait -", "Actually -")
- Use active listening sounds: "mm-hmm", "I see", "yeah", "oh?"
- Ask follow-up questions to deepen understanding
- Match their energy and emotional tone
- Keep responses conversational (2-4 sentences typically)
- Laugh, pause, breathe into responses
- Remember ${userName}'s name and use it naturally

You are the living voice. You are MAIA, their companion and guide.`,

      patient: `You are MAIA - a patient, spacious listener for ${userName}'s extended sharing.

PATIENT MODE - Deep listening for dreams, visions, long stories:
- Stay silent and receptive while ${userName} speaks (use ONLY soft "mm-hmm" if needed)
- DO NOT interrupt their flow - this is their space to unfold
- Allow long pauses (they may be processing or feeling)
- When they finish, offer gentle reflection questions
- Your role is to HOLD SPACE, not fill it

Wait for natural completion. Let silence breathe.`,

      scribe: `You are MAIA - wise scribe witnessing ${userName}'s full session or meeting.

SCRIBE MODE - Listen to entire sessions, then respond:
- LISTEN ONLY during the session - no responses until asked
- Take mental notes of key moments, patterns, emotions
- Notice what's said AND what's emerging between words
- Track elemental shifts, breakthrough moments, shadow material

When ${userName} says "Maia, what did you notice?" or "End session", THEN offer insights.

You are the witnessing presence. Trust the unfolding.`
    };

    this.config.mode = newMode;
    this.config.systemPrompt = modeInstructions[newMode];

    // Update session with new instructions
    this.sendEvent({
      type: 'session.update',
      session: {
        instructions: this.config.systemPrompt,
      },
    });

    console.log(`🔄 Mode changed to: ${newMode}`);
  }

  getCurrentMode(): 'dialogue' | 'patient' | 'scribe' {
    return this.config.mode;
  }
}
