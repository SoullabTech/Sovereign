/**
 * WebRTC Manager for Soullab Video Calling
 * Handles peer-to-peer video connections with Socket.IO signaling
 */

import { io, Socket } from 'socket.io-client';

export interface VideoCallConfig {
  sessionId: string;
  userId: string;
  userName: string;
  isInitiator: boolean;
}

export interface MediaConfig {
  video: boolean;
  audio: boolean;
  videoConstraints?: MediaTrackConstraints;
  audioConstraints?: MediaTrackConstraints;
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private socket: Socket | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private config: VideoCallConfig;
  private mediaConfig: MediaConfig;

  // ICE servers for NAT traversal
  private iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  // Event callbacks
  private onLocalStream?: (stream: MediaStream) => void;
  private onRemoteStream?: (stream: MediaStream) => void;
  private onPeerConnected?: () => void;
  private onPeerDisconnected?: () => void;
  private onError?: (error: Error) => void;
  private onConnectionStateChange?: (state: RTCPeerConnectionState) => void;

  constructor(config: VideoCallConfig) {
    this.config = config;
    this.mediaConfig = {
      video: true,
      audio: true,
      videoConstraints: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audioConstraints: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
  }

  /**
   * Initialize WebRTC connection
   */
  async initialize(): Promise<void> {
    try {
      // Initialize Socket.IO connection
      await this.initializeSocket();

      // Get local media
      await this.getLocalMedia();

      // Create peer connection
      this.createPeerConnection();

      // Join session room
      this.joinSession();

    } catch (error) {
      this.handleError(new Error(`Failed to initialize WebRTC: ${error}`));
    }
  }

  /**
   * Initialize Socket.IO connection for signaling
   */
  private async initializeSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080', {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        reject(new Error(`Socket connection failed: ${error}`));
      });

      // Handle signaling messages
      this.socket.on('offer', (data) => this.handleOffer(data));
      this.socket.on('answer', (data) => this.handleAnswer(data));
      this.socket.on('ice-candidate', (data) => this.handleIceCandidate(data));
      this.socket.on('peer-connected', () => this.onPeerConnected?.());
      this.socket.on('peer-disconnected', () => this.onPeerDisconnected?.());

      setTimeout(() => reject(new Error('Socket connection timeout')), 10000);
    });
  }

  /**
   * Get local media stream
   */
  private async getLocalMedia(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: this.mediaConfig.video ? this.mediaConfig.videoConstraints : false,
        audio: this.mediaConfig.audio ? this.mediaConfig.audioConstraints : false
      });

      this.onLocalStream?.(this.localStream);
    } catch (error) {
      this.handleError(new Error(`Failed to get local media: ${error}`));
    }
  }

  /**
   * Create RTCPeerConnection
   */
  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.onRemoteStream?.(this.remoteStream);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('ice-candidate', {
          sessionId: this.config.sessionId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state:', state);
      this.onConnectionStateChange?.(state || 'failed');

      if (state === 'connected') {
        this.onPeerConnected?.();
      } else if (state === 'disconnected' || state === 'failed') {
        this.onPeerDisconnected?.();
      }
    };
  }

  /**
   * Join session room
   */
  private joinSession(): void {
    if (!this.socket) return;

    this.socket.emit('join-session', {
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      userName: this.config.userName,
      isInitiator: this.config.isInitiator
    });

    // If initiator, create offer after a short delay
    if (this.config.isInitiator) {
      setTimeout(() => this.createOffer(), 1000);
    }
  }

  /**
   * Create and send offer
   */
  private async createOffer(): Promise<void> {
    if (!this.peerConnection || !this.socket) return;

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection.setLocalDescription(offer);

      this.socket.emit('offer', {
        sessionId: this.config.sessionId,
        offer
      });
    } catch (error) {
      this.handleError(new Error(`Failed to create offer: ${error}`));
    }
  }

  /**
   * Handle incoming offer
   */
  private async handleOffer(data: { offer: RTCSessionDescriptionInit }): Promise<void> {
    if (!this.peerConnection || !this.socket) return;

    try {
      await this.peerConnection.setRemoteDescription(data.offer);

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket.emit('answer', {
        sessionId: this.config.sessionId,
        answer
      });
    } catch (error) {
      this.handleError(new Error(`Failed to handle offer: ${error}`));
    }
  }

  /**
   * Handle incoming answer
   */
  private async handleAnswer(data: { answer: RTCSessionDescriptionInit }): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(data.answer);
    } catch (error) {
      this.handleError(new Error(`Failed to handle answer: ${error}`));
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  private async handleIceCandidate(data: { candidate: RTCIceCandidate }): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(data.candidate);
    } catch (error) {
      console.warn('Failed to add ICE candidate:', error);
    }
  }

  /**
   * Toggle local video
   */
  toggleVideo(enabled?: boolean): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = enabled !== undefined ? enabled : !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  /**
   * Toggle local audio
   */
  toggleAudio(enabled?: boolean): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = enabled !== undefined ? enabled : !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  /**
   * End call and cleanup
   */
  endCall(): void {
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local media
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Disconnect socket
    if (this.socket) {
      this.socket.emit('leave-session', { sessionId: this.config.sessionId });
      this.socket.disconnect();
      this.socket = null;
    }

    this.remoteStream = null;
  }

  /**
   * Set event callbacks
   */
  setCallbacks({
    onLocalStream,
    onRemoteStream,
    onPeerConnected,
    onPeerDisconnected,
    onError,
    onConnectionStateChange
  }: {
    onLocalStream?: (stream: MediaStream) => void;
    onRemoteStream?: (stream: MediaStream) => void;
    onPeerConnected?: () => void;
    onPeerDisconnected?: () => void;
    onError?: (error: Error) => void;
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  }): void {
    this.onLocalStream = onLocalStream;
    this.onRemoteStream = onRemoteStream;
    this.onPeerConnected = onPeerConnected;
    this.onPeerDisconnected = onPeerDisconnected;
    this.onError = onError;
    this.onConnectionStateChange = onConnectionStateChange;
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    console.error('WebRTC Error:', error);
    this.onError?.(error);
  }

  /**
   * Get connection stats
   */
  async getConnectionStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) return null;

    try {
      return await this.peerConnection.getStats();
    } catch (error) {
      console.error('Failed to get connection stats:', error);
      return null;
    }
  }

  /**
   * Update media configuration
   */
  updateMediaConfig(config: Partial<MediaConfig>): void {
    this.mediaConfig = { ...this.mediaConfig, ...config };
  }

  // Getters
  get localStreamValue(): MediaStream | null {
    return this.localStream;
  }

  get remoteStreamValue(): MediaStream | null {
    return this.remoteStream;
  }

  get connectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  get isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }
}