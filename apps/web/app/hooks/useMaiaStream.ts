// app/hooks/useMayaStream.ts
// Optimized streaming hook with phrase-based voice synthesis

import { useEffect, useRef, useState } from "react";
import { Analytics } from "../../lib/analytics/supabaseAnalytics";

type StreamOptions = {
  backendUrl: string; // e.g., NEXT_PUBLIC_BACKEND_URL
  element: string;
  userId: string;
  lang?: string;
  voiceEnabled: boolean;
  minPhraseLen?: number; // ~20 chars
};

export function useMayaStream() {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  
  const speakQueue = useRef<string[]>([]);
  const speaking = useRef(false);
  const currentEventSource = useRef<EventSource | null>(null);

  const cancelSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    speakQueue.current = [];
    speaking.current = false;
  };

  const enqueueSpeech = (phrase: string, lang: string) => {
    // ❌ DISABLED: Browser TTS causes "robo voice" interference with OpenAI TTS
    // The backend sends OpenAI TTS audio via /api/voice/openai-tts
    // OracleVoicePlayer component handles playback
    // Browser speechSynthesis was playing simultaneously, creating double voices
    return;

    /* ORIGINAL BROWSER TTS CODE - COMMENTED OUT
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return; // Skip speech on server-side
    }

    speakQueue.current.push(phrase);
    if (!speaking.current) {
      speaking.current = true;
      const pump = () => {
        const next = speakQueue.current.shift();
        if (!next) {
          speaking.current = false;
          return;
        }
        const utterance = new SpeechSynthesisUtterance(next);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = pump;
        utterance.onerror = pump;
        window.speechSynthesis.speak(utterance);
      };
      pump();
    }
    */
  };

  const stream = (opts: StreamOptions, userText: string) => {
    const { backendUrl, element, userId, lang = "en-US", voiceEnabled, minPhraseLen = 20 } = opts;
    const streamStartTime = Date.now();
    
    // Track Maya response start
    Analytics.startMayaResponse({
      input_text: userText,
      input_length: userText.length,
      element,
      voice_enabled: voiceEnabled,
      backend_url: backendUrl
    });
    
    // Cancel any existing stream and speech
    if (currentEventSource.current) {
      currentEventSource.current.close();
    }
    cancelSpeech();
    setText("");
    setMetadata(null);
    setIsStreaming(true);

    // Build streaming URL with query parameters (use proxy in dev, direct URL in prod)
    const url = new URL(`/api/backend/v1/converse/stream`, window.location.origin);
    url.searchParams.set("element", element);
    url.searchParams.set("userId", userId);
    url.searchParams.set("lang", lang);
    url.searchParams.set("q", userText);

    const eventSource = new EventSource(url.toString());
    currentEventSource.current = eventSource;

    let buffer = "";
    const boundary = /([.!?…]|—|,|\n)/; // phrase-ish punctuation

    eventSource.addEventListener("meta", (e: MessageEvent) => {
      const meta = JSON.parse(e.data);
      setMetadata(meta);
    });

    eventSource.addEventListener("delta", (e: MessageEvent) => {
      const { text: chunk } = JSON.parse(e.data);
      buffer += chunk;
      setText(prev => prev + chunk);

      // Phrase segmentation: speak at punctuation or length threshold
      let spoken = false;
      while (true) {
        const idx = buffer.search(boundary);
        if (idx === -1 && buffer.length < minPhraseLen) break;
        
        const cut = idx !== -1 ? idx + 1 : buffer.length;
        const phrase = buffer.slice(0, cut).trim();
        buffer = buffer.slice(cut);
        
        if (voiceEnabled && phrase) {
          enqueueSpeech(phrase, lang);
        }
        spoken = true;
      }

      // Optional: flush long buffers even without punctuation
      if (!spoken && buffer.length > 80 && voiceEnabled) {
        const tail = buffer.slice(0, 60);
        buffer = buffer.slice(60);
        enqueueSpeech(tail, lang);
      }
    });

    eventSource.addEventListener("done", (e: MessageEvent) => {
      const doneData = JSON.parse(e.data);
      const streamDuration = Date.now() - streamStartTime;
      
      // Flush any remaining buffer
      const tail = buffer.trim();
      if (tail && voiceEnabled) {
        enqueueSpeech(tail, lang);
      }
      
      buffer = "";
      setIsStreaming(false);
      setMetadata((prev: any) => ({ ...prev, ...doneData }));
      
      // Track successful Maya response completion
      Analytics.completeMayaResponse({
        response_length: text.length,
        response_duration_ms: streamDuration,
        element,
        voice_enabled: voiceEnabled,
        success: true,
        metadata: doneData
      });
      
      eventSource.close();
      currentEventSource.current = null;
      
    });

    eventSource.addEventListener("heartbeat", () => {
      // Keep connection alive
    });

    eventSource.onerror = (error) => {
      console.error('Maya stream error:', error);
      const streamDuration = Date.now() - streamStartTime;
      
      // Track Maya response error
      Analytics.mayaResponseError({
        error_type: 'stream_error',
        error_message: 'EventSource connection failed',
        duration_ms: streamDuration,
        element,
        voice_enabled: voiceEnabled
      });
      
      eventSource.close();
      currentEventSource.current = null;
      setIsStreaming(false);
      
      // Add error message to text if nothing was received
      if (!text) {
        setText("I'm having trouble connecting right now. Please try again in a moment.");
      }
    };

    // Return cleanup function for barge-in
    return () => {
      eventSource.close();
      currentEventSource.current = null;
      cancelSpeech();
      setIsStreaming(false);
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentEventSource.current) {
        currentEventSource.current.close();
      }
      cancelSpeech();
    };
  }, []);

  return { 
    text, 
    isStreaming, 
    metadata,
    stream, 
    cancelSpeech 
  };
}

// Example usage in MayaChat component:
export const MayaChatWithStreaming = () => {
  const backendUrl = '/api/backend'; // Use proxy endpoint
  const { text, isStreaming, metadata, stream, cancelSpeech } = useMayaStream();
  
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [element, setElement] = useState<"air"|"fire"|"water"|"earth"|"aether">("earth");
  const [userInput, setUserInput] = useState("");

  const handleSend = () => {
    if (!userInput.trim() || isStreaming) return;
    
    const stopStream = stream(
      { 
        backendUrl, 
        element, 
        userId: "web-user", 
        voiceEnabled, 
        lang: "en-US" 
      },
      userInput
    );
    
    setUserInput("");
    
    // Save stop function for potential barge-in
    // You could store this in a ref for interruption capability
  };

  const handleBargeIn = () => {
    cancelSpeech();
    // If you saved the stop function, call it here for true barge-in
    if (currentEventSource.current) {
      currentEventSource.current.close();
      currentEventSource.current = null;
      setIsStreaming(false);
    }
  };

  // Return hook values and functions, not JSX
  return {
    text,
    isStreaming,
    metadata,
    element,
    voiceEnabled,
    userInput,
    setElement,
    setVoiceEnabled,
    setUserInput,
    handleSend,
    handleBargeIn,
    streamMessage
  };
}