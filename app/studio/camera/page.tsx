'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Video,
  VideoOff,
  Settings,
  RefreshCw,
  Circle,
  Square,
  Download,
  Monitor,
  Smartphone,
  Check,
  AlertCircle,
  Maximize2,
  Minimize2,
  User,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface CameraDevice {
  deviceId: string;
  label: string;
  isCamo: boolean;
}

// Camo device ID provided by user
const CAMO_DEVICE_ID = '3CF6E9DF41838044F459';

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [camoDetected, setCamoDetected] = useState(false);

  // Video quality settings
  const [quality, setQuality] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [frameRate, setFrameRate] = useState<30 | 60>(30);

  const qualityConstraints = {
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '4k': { width: 3840, height: 2160 },
  };

  // Enumerate available cameras
  const enumerateCameras = useCallback(async () => {
    try {
      // Request permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => {
          const isCamo = device.deviceId.includes(CAMO_DEVICE_ID) ||
            device.label.toLowerCase().includes('camo');
          return {
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
            isCamo,
          };
        });

      setCameras(videoDevices);

      // Check if Camo is detected
      const camoDevice = videoDevices.find(d => d.isCamo);
      setCamoDetected(!!camoDevice);

      // Auto-select Camo if available, otherwise first camera
      if (!selectedCamera) {
        const preferredCamera = camoDevice || videoDevices[0];
        if (preferredCamera) {
          setSelectedCamera(preferredCamera.deviceId);
        }
      }
    } catch (err) {
      console.error('Failed to enumerate cameras:', err);
      setError('Unable to access cameras. Please grant permission.');
    }
  }, [selectedCamera]);

  // Start camera stream
  const startCamera = useCallback(async (deviceId: string) => {
    try {
      setError(null);

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: qualityConstraints[quality].width },
          height: { ideal: qualityConstraints[quality].height },
          frameRate: { ideal: frameRate },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setIsConnected(true);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError('Failed to connect to camera. It may be in use by another app.');
      setIsConnected(false);
    }
  }, [stream, quality, frameRate]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsConnected(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!stream) return;

    chunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp9' };

    try {
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `soullab-recording-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Recording not supported in this browser.');
    }
  }, [stream]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Initial camera enumeration
  useEffect(() => {
    enumerateCameras();

    // Listen for device changes (e.g., Camo connected/disconnected)
    navigator.mediaDevices.addEventListener('devicechange', enumerateCameras);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateCameras);
    };
  }, [enumerateCameras]);

  // Auto-start camera when selected
  useEffect(() => {
    if (selectedCamera && !isConnected) {
      startCamera(selectedCamera);
    }
  }, [selectedCamera, isConnected, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedCameraInfo = cameras.find(c => c.deviceId === selectedCamera);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Camera className="w-7 h-7 text-teal-400" />
            Live Camera
          </h1>
          <p className="text-slate-400 mt-1">
            {camoDetected ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                Camo Studio detected
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Connect Camo Studio for iPhone camera
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={enumerateCameras}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showSettings
                ? 'bg-teal-500/20 text-teal-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
            {/* Video Preview */}
            <div className="aspect-video bg-black relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />

              {/* Recording Indicator */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500/90 rounded-lg"
                  >
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                    <span className="text-white text-sm font-medium">
                      REC {formatDuration(recordingDuration)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Connection Status Overlay */}
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {error || 'Select a camera to begin'}
                    </p>
                  </div>
                </div>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="absolute bottom-4 right-4 p-2 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-center gap-4">
              {/* Camera Toggle */}
              <button
                onClick={isConnected ? stopCamera : () => startCamera(selectedCamera)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                  isConnected
                    ? 'bg-slate-700 text-white hover:bg-slate-600'
                    : 'bg-teal-500 text-white hover:bg-teal-400'
                }`}
              >
                {isConnected ? (
                  <>
                    <VideoOff className="w-5 h-5" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    Start Camera
                  </>
                )}
              </button>

              {/* Record Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isConnected}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                  !isConnected
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isRecording
                    ? 'bg-red-500 text-white hover:bg-red-400'
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Circle className="w-5 h-5" />
                    Record
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Camera Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Camera Source
            </h3>

            <div className="space-y-2">
              {cameras.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">No cameras found</p>
              ) : (
                cameras.map((camera) => (
                  <button
                    key={camera.deviceId}
                    onClick={() => {
                      setSelectedCamera(camera.deviceId);
                      startCamera(camera.deviceId);
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedCamera === camera.deviceId
                        ? 'bg-teal-500/20 border border-teal-500/50'
                        : 'bg-slate-800 border border-transparent hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {camera.isCamo ? (
                        <Smartphone className="w-4 h-4 text-teal-400" />
                      ) : (
                        <Monitor className="w-4 h-4 text-slate-400" />
                      )}
                      <span className={`text-sm truncate ${
                        selectedCamera === camera.deviceId
                          ? 'text-teal-400'
                          : 'text-white'
                      }`}>
                        {camera.label}
                      </span>
                    </div>
                    {camera.isCamo && (
                      <span className="text-xs text-teal-400 mt-1 block">
                        Camo Studio
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden"
              >
                <h3 className="text-sm font-medium text-slate-300 mb-4">
                  Video Settings
                </h3>

                {/* Quality */}
                <div className="mb-4">
                  <label className="text-xs text-slate-500 block mb-2">Resolution</label>
                  <div className="flex gap-2">
                    {(['720p', '1080p', '4k'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                          quality === q
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Rate */}
                <div>
                  <label className="text-xs text-slate-500 block mb-2">Frame Rate</label>
                  <div className="flex gap-2">
                    {([30, 60] as const).map((fps) => (
                      <button
                        key={fps}
                        onClick={() => setFrameRate(fps)}
                        className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                          frameRate === fps
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {fps} fps
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-4">
                  Changes apply when camera restarts
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connection Info */}
          {selectedCameraInfo && isConnected && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3">
                Connection Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Connected
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source</span>
                  <span className="text-white">
                    {selectedCameraInfo.isCamo ? 'Camo' : 'Local'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quality</span>
                  <span className="text-white">{quality} @ {frameRate}fps</span>
                </div>
              </div>
            </div>
          )}

          {/* Camo Instructions */}
          {!camoDetected && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-teal-400" />
                Connect Camo
              </h3>
              <ol className="text-xs text-slate-400 space-y-2">
                <li>1. Open Camo Studio on your Mac</li>
                <li>2. Connect your iPhone via USB or WiFi</li>
                <li>3. Click Refresh to detect the camera</li>
              </ol>
              <div className="mt-3 p-2 bg-slate-800 rounded text-xs font-mono text-slate-500">
                Device ID: {CAMO_DEVICE_ID}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
