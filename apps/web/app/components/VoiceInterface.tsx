"use client";

import { useState } from "react";
import HybridMicIndicator from "./HybridMicIndicator";
import InterimTranscriptDisplay from "./InterimTranscriptDisplay";
import { useVoiceManager } from "../hooks/useVoiceManager";

interface VoiceInterfaceProps {
  onTranscriptComplete: (transcript: string) => Promise<void>;
  isProcessingResponse?: boolean;
}

export default function VoiceInterface({ 
  onTranscriptComplete,
  isProcessingResponse = false
}: VoiceInterfaceProps) {
  const {
    micState,
    interimTranscript,
    finalTranscript,
    confidence,
    startRecording,
    stopRecording,
    resetTranscripts
  } = useVoiceManager(onTranscriptComplete);

  const [lastTranscript, setLastTranscript] = useState("");

  // Handle recording state changes
  const handleStateChange = async (newState: "idle" | "recording" | "processing") => {
    if (newState === "recording") {
      await startRecording();
      setLastTranscript("");
      resetTranscripts();
    } else if (newState === "idle" && micState === "recording") {
      stopRecording();
    }
  };

  // Handle audio blob from HybridMicIndicator (fallback method)
  const handleRecordingComplete = async (blob: Blob) => {
    // This is handled automatically by useVoiceManager, but keeping for compatibility
  };

  // Clear final transcript after a delay (for clean UX)
  const clearFinalTranscript = () => {
    setLastTranscript(finalTranscript);
    setTimeout(() => {
      resetTranscripts();
    }, 3000);
  };

  return (
    <div className="voice-interface space-y-6">
      
      {/* Tesla-style Mic Indicator with Waveform */}
      <div className="flex justify-center">
        <HybridMicIndicator
          micState={micState}
          onRecordingComplete={handleRecordingComplete}
          onStateChange={handleStateChange}
        />
      </div>

      {/* Live Interim Transcript Display */}
      <InterimTranscriptDisplay
        interimText={interimTranscript}
        finalText={finalTranscript}
        isListening={micState === "recording"}
        confidence={confidence}
      />

      {/* Status Messages */}
      <div className="text-center space-y-2">
        {micState === "error" && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
            ⚠️ Voice recording error. Please try again.
          </div>
        )}
        
        {micState === "processing" && (
          <div className="text-amber-400 text-sm animate-pulse">
            🔄 Processing your message...
          </div>
        )}
        
        {isProcessingResponse && (
          <div className="text-blue-400 text-sm animate-pulse">
            🧠 Maya is thinking...
          </div>
        )}
        
        {finalTranscript && !isProcessingResponse && (
          <button
            onClick={clearFinalTranscript}
            className="text-green-400 text-xs hover:text-green-300 transition-colors"
          >
            ✓ Message sent • Click to clear
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-3 text-xs text-slate-400">
        <button
          onClick={() => resetTranscripts()}
          disabled={micState === "recording"}
          className="hover:text-white transition-colors disabled:opacity-50"
        >
          🧹 Clear
        </button>
        
        <span className="opacity-50">•</span>
        
        <div className="opacity-70">
          {micState === "idle" 
            ? "Click mic to start" 
            : micState === "recording" 
            ? "Click again to stop" 
            : "Processing..."}
        </div>
      </div>
      
      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-slate-500 bg-slate-900/50 rounded p-2">
          <summary className="cursor-pointer">Debug Info</summary>
          <div className="mt-2 space-y-1">
            <div>State: {micState}</div>
            <div>Interim: "{interimTranscript}"</div>
            <div>Final: "{finalTranscript}"</div>
            <div>Confidence: {Math.round(confidence * 100)}%</div>
            <div>Last: "{lastTranscript}"</div>
          </div>
        </details>
      )}
    </div>
  );
}