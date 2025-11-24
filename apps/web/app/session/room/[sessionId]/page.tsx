"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, Phone } from 'lucide-react';
import VideoCallInterface from '@/components/video/VideoCallInterface';

interface SessionData {
  id: string;
  type: string;
  startTime: string;
  duration: number;
  clientName: string;
  practitionerName: string;
  status: 'waiting' | 'active' | 'ended';
}

export default function SessionRoomPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Mock user data - in real app, get from auth
  const userId = 'user-123';
  const userName = 'Sarah Johnson';
  const isInitiator = false; // Practitioner would be initiator

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid session ID');
      setIsLoading(false);
      return;
    }

    fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSessionData({
        id: sessionId,
        type: 'Personal Growth Session',
        startTime: '2024-11-20T14:00:00Z',
        duration: 60,
        clientName: 'Sarah Johnson',
        practitionerName: 'Kelly',
        status: 'waiting'
      });
    } catch (err) {
      setError('Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  };

  const joinSession = () => {
    setIsJoining(true);
    // Small delay to show loading state
    setTimeout(() => {
      setHasJoined(true);
      setIsJoining(false);
    }, 1500);
  };

  const handleCallEnd = () => {
    setHasJoined(false);
    router.push('/members/dashboard');
  };

  const handleError = (error: Error) => {
    console.error('Video call error:', error);
    setError(error.message);
    setHasJoined(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-jade-glow animate-spin mx-auto mb-4" />
          <p className="text-jade-whisper/80">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-jade-whisper mb-4">Session Error</h1>
          <p className="text-jade-whisper/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/members/dashboard')}
            className="bg-jade-glow text-jade-night px-6 py-3 rounded-lg hover:bg-jade-ocean transition-colors font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night flex items-center justify-center">
        <div className="text-center">
          <p className="text-jade-whisper/80">Session not found</p>
        </div>
      </div>
    );
  }

  // If user has joined the call, show the video interface
  if (hasJoined) {
    return (
      <VideoCallInterface
        sessionId={sessionId}
        userId={userId}
        userName={userName}
        isInitiator={isInitiator}
        onCallEnd={handleCallEnd}
        onError={handleError}
      />
    );
  }

  // Pre-session waiting room
  return (
    <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-jade-whisper mb-4">Session Ready</h1>
            <p className="text-xl text-jade-whisper/80">
              Your sacred space awaits
            </p>
          </motion.div>

          {/* Session Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-8 border border-jade-whisper/10 mb-8"
          >
            <h2 className="text-2xl font-bold text-jade-whisper mb-6">Session Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-jade-whisper mb-3">Session Information</h3>
                <div className="space-y-2 text-jade-whisper/80">
                  <div><strong>Type:</strong> {sessionData.type}</div>
                  <div><strong>Duration:</strong> {sessionData.duration} minutes</div>
                  <div><strong>Session ID:</strong> {sessionData.id}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-jade-whisper mb-3">Participants</h3>
                <div className="space-y-2 text-jade-whisper/80">
                  <div><strong>You:</strong> {sessionData.clientName}</div>
                  <div><strong>Practitioner:</strong> {sessionData.practitionerName}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pre-session Preparation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-8 border border-jade-whisper/10 mb-8"
          >
            <h2 className="text-2xl font-bold text-jade-whisper mb-6">Before We Begin</h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-jade-glow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-jade-night text-sm font-bold">1</span>
                </div>
                <div>
                  <div className="font-semibold text-jade-whisper">Check Your Connection</div>
                  <div className="text-jade-whisper/70 text-sm">
                    Ensure you have a stable internet connection and your camera/microphone are working.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-jade-glow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-jade-night text-sm font-bold">2</span>
                </div>
                <div>
                  <div className="font-semibold text-jade-whisper">Create Sacred Space</div>
                  <div className="text-jade-whisper/70 text-sm">
                    Find a quiet, private space where you won't be interrupted. Light a candle or prepare anything that helps you feel centered.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-jade-glow rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-jade-night text-sm font-bold">3</span>
                </div>
                <div>
                  <div className="font-semibold text-jade-whisper">Set Your Intention</div>
                  <div className="text-jade-whisper/70 text-sm">
                    Take a moment to connect with what you'd like to explore or heal in today's session.
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Check */}
            <div className="bg-jade-whisper/10 rounded-lg p-4 border border-jade-whisper/20">
              <h3 className="font-semibold text-jade-whisper mb-3">Technical Check</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 bg-jade-glow rounded-full mx-auto mb-2 flex items-center justify-center">
                    ✓
                  </div>
                  <div className="text-jade-whisper/80">Camera Ready</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-jade-glow rounded-full mx-auto mb-2 flex items-center justify-center">
                    ✓
                  </div>
                  <div className="text-jade-whisper/80">Microphone Ready</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-jade-glow rounded-full mx-auto mb-2 flex items-center justify-center">
                    ✓
                  </div>
                  <div className="text-jade-whisper/80">Connection Stable</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Join Session Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={joinSession}
              disabled={isJoining}
              className="bg-gradient-to-r from-jade-glow to-jade-ocean text-jade-night px-12 py-4 rounded-xl
                       font-bold text-xl hover:from-jade-ocean hover:to-jade-glow transform hover:scale-105
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:transform-none shadow-2xl flex items-center gap-3 mx-auto"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Entering Sacred Space...
                </>
              ) : (
                <>
                  <Phone className="w-6 h-6" />
                  Join Session
                </>
              )}
            </button>

            <p className="mt-4 text-jade-whisper/60">
              Your practitioner will be notified when you join
            </p>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center text-jade-whisper/50"
          >
            <p className="text-sm">
              Having technical issues?{' '}
              <button className="text-jade-glow hover:text-jade-ocean transition-colors">
                Contact Support
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}