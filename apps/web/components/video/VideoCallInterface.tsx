"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Settings,
  Maximize,
  Minimize,
  Users,
  Heart,
  Sparkles,
  Waves
} from 'lucide-react';
import { WebRTCManager, VideoCallConfig } from '@/lib/video/WebRTCManager';

interface VideoCallInterfaceProps {
  sessionId: string;
  userId: string;
  userName: string;
  isInitiator: boolean;
  onCallEnd?: () => void;
  onError?: (error: Error) => void;
}

interface CallState {
  isConnected: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  connectionState: RTCPeerConnectionState | null;
  showSettings: boolean;
  isFullscreen: boolean;
}

export default function VideoCallInterface({
  sessionId,
  userId,
  userName,
  isInitiator,
  onCallEnd,
  onError
}: VideoCallInterfaceProps) {
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
    connectionState: null,
    showSettings: false,
    isFullscreen: false
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);

  useEffect(() => {
    initializeCall();
    return () => {
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.endCall();
      }
    };
  }, []);

  const initializeCall = async () => {
    try {
      const config: VideoCallConfig = {
        sessionId,
        userId,
        userName,
        isInitiator
      };

      const manager = new WebRTCManager(config);
      webrtcManagerRef.current = manager;

      // Set up event callbacks
      manager.setCallbacks({
        onLocalStream: (stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        },
        onRemoteStream: (stream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        },
        onPeerConnected: () => {
          setCallState(prev => ({ ...prev, isConnected: true }));
        },
        onPeerDisconnected: () => {
          setCallState(prev => ({ ...prev, isConnected: false }));
        },
        onConnectionStateChange: (state) => {
          setCallState(prev => ({ ...prev, connectionState: state }));
        },
        onError: (error) => {
          console.error('WebRTC Error:', error);
          onError?.(error);
        }
      });

      await manager.initialize();
    } catch (error) {
      console.error('Failed to initialize call:', error);
      onError?.(error as Error);
    }
  };

  const toggleVideo = () => {
    if (webrtcManagerRef.current) {
      const enabled = webrtcManagerRef.current.toggleVideo();
      setCallState(prev => ({ ...prev, isVideoEnabled: enabled }));
    }
  };

  const toggleAudio = () => {
    if (webrtcManagerRef.current) {
      const enabled = webrtcManagerRef.current.toggleAudio();
      setCallState(prev => ({ ...prev, isAudioEnabled: enabled }));
    }
  };

  const endCall = () => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.endCall();
    }
    onCallEnd?.();
  };

  const toggleFullscreen = () => {
    setCallState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  const getConnectionStatusColor = () => {
    switch (callState.connectionState) {
      case 'connected':
        return 'text-jade-glow';
      case 'connecting':
        return 'text-yellow-400';
      case 'disconnected':
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-jade-whisper/60';
    }
  };

  const getConnectionStatusText = () => {
    if (callState.isConnected) return 'Connected';
    switch (callState.connectionState) {
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Initializing...';
    }
  };

  return (
    <div className={`relative bg-jade-night ${callState.isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'}`}>
      {/* Connection Status Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 bg-jade-abyss/90 backdrop-blur-md border-b border-jade-whisper/10 px-6 py-4 z-10"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${callState.isConnected ? 'bg-jade-glow animate-pulse' : 'bg-jade-whisper/30'}`} />
              <span className={`font-medium ${getConnectionStatusColor()}`}>
                {getConnectionStatusText()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-jade-whisper/70">
              <Users className="w-4 h-4" />
              <span className="text-sm">Session {sessionId}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-jade-whisper/70">
              <Heart className="w-4 h-4 text-jade-glow" />
              <span className="text-sm">Sacred Space Active</span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-jade-whisper/10 rounded-lg hover:bg-jade-whisper/20 transition-colors"
            >
              {callState.isFullscreen ? (
                <Minimize className="w-4 h-4 text-jade-whisper" />
              ) : (
                <Maximize className="w-4 h-4 text-jade-whisper" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Video Container */}
      <div className="relative h-full pt-16">
        {/* Remote Video (Main) */}
        <div className="relative w-full h-full bg-jade-shadow/50">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Remote Video Overlay */}
          {!callState.isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-jade-shadow/80">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-jade-glow to-jade-ocean rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-jade-whisper" />
                </div>
                <h3 className="text-xl font-semibold text-jade-whisper mb-2">
                  Preparing Sacred Space
                </h3>
                <p className="text-jade-whisper/70">
                  Waiting for your practitioner to join...
                </p>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mt-4"
                >
                  <Waves className="w-8 h-8 text-jade-glow mx-auto" />
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-6 right-6 w-64 h-48 bg-jade-shadow rounded-2xl overflow-hidden border-2 border-jade-whisper/20 shadow-xl"
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!callState.isVideoEnabled && (
            <div className="absolute inset-0 bg-jade-shadow flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-8 h-8 text-jade-whisper/70 mx-auto mb-2" />
                <span className="text-sm text-jade-whisper/70">Video Off</span>
              </div>
            </div>
          )}

          {/* Local Video Label */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-jade-night/80 to-transparent p-3">
            <span className="text-jade-whisper text-sm font-medium">You</span>
          </div>
        </motion.div>

        {/* Call Controls */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-jade-abyss/90 backdrop-blur-xl rounded-2xl p-6 border border-jade-whisper/20 shadow-2xl">
            <div className="flex items-center gap-4">
              {/* Audio Toggle */}
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-all duration-200 ${
                  callState.isAudioEnabled
                    ? 'bg-jade-whisper/20 hover:bg-jade-whisper/30 text-jade-whisper'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                }`}
              >
                {callState.isAudioEnabled ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </button>

              {/* Video Toggle */}
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all duration-200 ${
                  callState.isVideoEnabled
                    ? 'bg-jade-whisper/20 hover:bg-jade-whisper/30 text-jade-whisper'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                }`}
              >
                {callState.isVideoEnabled ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </button>

              {/* Settings */}
              <button
                onClick={() => setCallState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
                className="p-4 rounded-full bg-jade-whisper/20 hover:bg-jade-whisper/30 text-jade-whisper transition-all duration-200"
              >
                <Settings className="w-6 h-6" />
              </button>

              {/* End Call */}
              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 transform hover:scale-105"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>

            {/* Call Duration */}
            <div className="mt-4 text-center">
              <span className="text-jade-whisper/70 text-sm">
                Sacred Session • {getConnectionStatusText()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {callState.showSettings && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute top-16 right-0 w-80 h-full bg-jade-abyss/95 backdrop-blur-xl border-l border-jade-whisper/20 p-6 overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-jade-whisper mb-6">Session Settings</h3>

              <div className="space-y-6">
                {/* Media Settings */}
                <div>
                  <h4 className="font-semibold text-jade-whisper mb-3">Media</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-jade-whisper/80">Camera</span>
                      <button
                        onClick={toggleVideo}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          callState.isVideoEnabled ? 'bg-jade-glow' : 'bg-jade-whisper/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          callState.isVideoEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-jade-whisper/80">Microphone</span>
                      <button
                        onClick={toggleAudio}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          callState.isAudioEnabled ? 'bg-jade-glow' : 'bg-jade-whisper/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          callState.isAudioEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* MAIA Integration */}
                <div>
                  <h4 className="font-semibold text-jade-whisper mb-3">MAIA Integration</h4>
                  <div className="p-4 bg-jade-whisper/10 rounded-lg border border-jade-whisper/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-jade-glow" />
                      <span className="font-medium text-jade-whisper">Consciousness Monitor</span>
                    </div>
                    <p className="text-jade-whisper/70 text-sm">
                      Real-time biometric and consciousness field analysis available during session.
                    </p>
                    <button className="mt-3 w-full bg-jade-glow text-jade-night px-4 py-2 rounded-lg hover:bg-jade-ocean transition-colors text-sm font-medium">
                      Activate MAIA Presence
                    </button>
                  </div>
                </div>

                {/* Session Quality */}
                <div>
                  <h4 className="font-semibold text-jade-whisper mb-3">Connection Quality</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-jade-whisper/80">Status:</span>
                      <span className={getConnectionStatusColor()}>
                        {getConnectionStatusText()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-jade-whisper/80">Video Quality:</span>
                      <span className="text-jade-glow">HD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-jade-whisper/80">Audio Quality:</span>
                      <span className="text-jade-glow">Clear</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}