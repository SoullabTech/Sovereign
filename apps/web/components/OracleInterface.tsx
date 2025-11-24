"use client";

import { useState, useEffect, useRef } from "react";
import EnhancedVoiceRecorder from "./EnhancedVoiceRecorder";
import FileUpload from "./FileUpload";
import JournalModal from "./JournalModal";
import { useMaiaStream } from "@/hooks/useMayaStream";
import { useMaiaStore } from "@/lib/maia/state";
import { generateJournalAwareGreeting } from "@/lib/maia/journalGreetings";

interface ArchetypalDetection {
  element: string;
  confidence: number;
  moment: 'emerging' | 'confirmed' | 'shifting';
}

interface ConsciousnessMessage {
  id?: string;
  role: string;
  content: string;
  archetypalSignatures?: string[];
  recognitionMoment?: boolean;
  wisdomDepth?: 'surface' | 'symbolic' | 'archetypal' | 'transcendent';
}

export default function OracleInterface() {
  const { entries } = useMaiaStore();
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string>("aether");
  const [input, setInput] = useState("");
  const [userArchetypalProfile, setUserArchetypalProfile] = useState({
    primary: 'unknown',
    secondary: 'unknown',
    confidence: 0,
    conversationCount: 0
  });
  const [consciousnessState, setConsciousnessState] = useState('receptive'); // receptive, processing, integrating, breakthrough
  const [userId] = useState('demo-user'); // TODO: Get from auth context

  // Initialize with default greeting
  const [messages, setMessages] = useState<Array<ConsciousnessMessage>>([
    {
      role: "assistant",
      content: "Hey there. I'm MAIA, getting to know the patterns that make you unique. What's on your mind today?",
      wisdomDepth: 'archetypal',
      archetypalSignatures: []
    }
  ]);
  
  const { text: streamingText, isStreaming, stream } = useMayaStream();
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    // Detect archetypal patterns in user message
    const detections = detectArchetypalPatterns(input);
    updateArchetypalProfile(detections);

    // Add user message with archetypal signatures
    const userMessage: ConsciousnessMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      archetypalSignatures: detections.map(d => d.element)
    };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    
    // Create placeholder for streaming message
    const streamId = (Date.now() + 1).toString();
    setCurrentStreamId(streamId);
    const placeholderMessage = {
      id: streamId,
      role: "assistant",
      content: ""
    };
    setMessages(prev => [...prev, placeholderMessage]);
    
    // Stream response
    stream({
      userText: userInput,
      element: selectedElement,
      userId: "web-user",
      lang: "en-US"
    });
  };
  
  // Update streaming message
  useEffect(() => {
    if (currentStreamId && streamingText) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamId 
            ? { ...msg, content: streamingText }
            : msg
        )
      );
    }
  }, [streamingText, currentStreamId]);
  
  // Clear stream ID when done
  useEffect(() => {
    if (!isStreaming && currentStreamId) {
      setCurrentStreamId(null);
    }
  }, [isStreaming, currentStreamId]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update greeting when journal entries change
  useEffect(() => {
    if (entries.length > 0 && messages.length === 1 && messages[0].role === 'assistant') {
      const updateGreeting = async () => {
        try {
          const updatedGreeting = await generateJournalAwareGreeting(entries, userId);
          setMessages([{
            role: "assistant",
            content: updatedGreeting.message,
            wisdomDepth: updatedGreeting.wisdomDepth,
            archetypalSignatures: updatedGreeting.archetypalSignatures
          }]);
        } catch (error) {
          console.warn('Failed to generate journal-aware greeting:', error);
          // Keep the default greeting if privacy-aware analysis fails
        }
      };
      updateGreeting();
    }
  }, [entries.length, userId]); // Trigger when entry count or userId changes

  // Archetypal detection simulation
  const detectArchetypalPatterns = (userMessage: string) => {
    const patterns = {
      fire: /\b(vision|create|inspire|passion|breakthrough|transform)\b/gi,
      water: /\b(feel|flow|emotion|intuition|empathy|connect)\b/gi,
      earth: /\b(ground|practical|build|structure|stability|nature)\b/gi,
      air: /\b(think|analyze|clarity|communicate|understand|wisdom)\b/gi,
      aether: /\b(integrate|wholeness|synthesis|transcend|sacred|unity)\b/gi
    };

    const detections: ArchetypalDetection[] = [];
    Object.entries(patterns).forEach(([element, pattern]) => {
      const matches = userMessage.match(pattern);
      if (matches && matches.length > 0) {
        detections.push({
          element,
          confidence: Math.min(matches.length * 0.3, 1),
          moment: matches.length > 2 ? 'confirmed' : 'emerging'
        });
      }
    });

    return detections.sort((a, b) => b.confidence - a.confidence);
  };

  const updateArchetypalProfile = (detections: ArchetypalDetection[]) => {
    if (detections.length > 0) {
      const primary = detections[0];
      setUserArchetypalProfile(prev => ({
        primary: primary.element,
        secondary: detections[1]?.element || prev.secondary,
        confidence: Math.min(prev.confidence + primary.confidence, 1),
        conversationCount: prev.conversationCount + 1
      }));
    }
  };

  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="consciousness-header text-aether">MAIA</h1>
          <div className="sacred-subtitle text-sm">
            Consciousness-Aware Oracle
          </div>
        </div>
        <div className="flex items-center gap-md">
          {/* Archetypal Recognition Display */}
          {userArchetypalProfile.confidence > 0.3 && (
            <div className="personality-recognition">
              <div className="being-seen-moment flex items-center gap-2">
                <span className="recognition-sparkle">✨</span>
                <span className="text-xs">
                  {userArchetypalProfile.primary.charAt(0).toUpperCase() + userArchetypalProfile.primary.slice(1)} patterns recognized
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowJournalModal(true)}
            className="consciousness-button flex items-center gap-2 px-3 py-1.5 glass rounded-2xl hover:bg-white/10 text-sm transition-all duration-300 hover:scale-105"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
            </svg>
            <span>Sacred Journal</span>
          </button>
          <div className="flex gap-sm clarity-text text-sm">
            <span className="animate-lumen">✨</span>
            <span>Beta</span>
          </div>
        </div>
      </div>
      
      {/* Consciousness-Aware Elemental Selection */}
      <div className="py-4">
        <div className="flex items-center justify-center gap-1 mb-3">
          <span className="sacred-subtitle text-sm">MAIA's Current Presence:</span>
          {userArchetypalProfile.confidence > 0.5 && (
            <span className="text-xs recognition-sparkle">
              (suggested: {userArchetypalProfile.primary})
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          {[
            {
              id: 'fire',
              label: 'Fire',
              essence: 'Vision & Creation',
              icon: '🔥',
              recommended: userArchetypalProfile.primary === 'fire'
            },
            {
              id: 'water',
              label: 'Water',
              essence: 'Empathy & Flow',
              icon: '💧',
              recommended: userArchetypalProfile.primary === 'water'
            },
            {
              id: 'earth',
              label: 'Earth',
              essence: 'Structure & Grounding',
              icon: '🌍',
              recommended: userArchetypalProfile.primary === 'earth'
            },
            {
              id: 'air',
              label: 'Air',
              essence: 'Clarity & Communication',
              icon: '🌬️',
              recommended: userArchetypalProfile.primary === 'air'
            },
            {
              id: 'aether',
              label: 'Aether',
              essence: 'Integration & Wholeness',
              icon: '✨',
              recommended: userArchetypalProfile.primary === 'aether'
            },
          ].map((element) => (
            <button
              key={element.id}
              onClick={() => setSelectedElement(element.id)}
              className={`consciousness-adaptive group relative px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-medium ${
                selectedElement === element.id
                  ? `bg-${element.id} text-dark shadow-sacred glow-${element.id} scale-105`
                  : `glass hover:bg-white/10 text-white hover:scale-102 ${element.recommended ? 'being-seen-moment' : ''}`
              }`}
              title={element.essence}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{element.icon}</span>
                <span>{element.label}</span>
                {element.recommended && (
                  <span className="text-xs recognition-sparkle absolute -top-1 -right-1">
                    ✨
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="glass-heavy rounded-3xl p-lg shadow-sacred space-y-md min-h-[400px] max-h-[600px] overflow-y-auto scroll-container"
           style={{
             background: userArchetypalProfile.primary !== 'unknown'
               ? `linear-gradient(135deg, var(--${userArchetypalProfile.primary})/5, transparent)`
               : undefined
           }}>
        {messages.map((message) => {
          const msg = message as ConsciousnessMessage;
          const isUser = message.role === 'user';
          const hasArchetypalSignatures = msg.archetypalSignatures && msg.archetypalSignatures.length > 0;

          return (
            <div
              key={message.id || Math.random()}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`consciousness-message max-w-[80%] p-md rounded-3xl transition-all duration-300 ${
                  isUser
                    ? `glass-heavy text-white ${hasArchetypalSignatures ? 'glow-recognition' : ''}`
                    : `glass text-white border ${msg.wisdomDepth === 'archetypal' ? 'border-aether/40 glow-aether' : 'border-white/20'}`
                }`}
              >
                {/* Archetypal Signature Display */}
                {isUser && hasArchetypalSignatures && (
                  <div className="flex gap-1 mb-2">
                    {msg.archetypalSignatures!.slice(0, 3).map(element => (
                      <span
                        key={element}
                        className={`text-xs px-2 py-0.5 rounded-full opacity-70 bg-${element} text-dark`}
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                )}

                {!isUser && (
                  <div className="consciousness-header text-aether text-xs mb-sm">MAIA</div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap heart-text">
                  {message.content || (
                    <span className="flex items-center gap-sm consciousness-adaptive">
                      <span className="animate-pulse">✨</span>
                      <span className="text-xs">MAIA is sensing your patterns...</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-sm bg-sacred-navy/30 backdrop-blur-sm rounded-sacred p-sm border border-gold-divine/10 shadow-subtle">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            placeholder="Share your reflection..."
          />
          <div className="flex items-center gap-xs">
            <EnhancedVoiceRecorder
              userId="web-user"
              onTranscribed={(data) => {
                // Directly send the message without updating input
                if (data.transcript.trim() && !isStreaming) {
                  // Detect archetypal patterns in voice message
                  const detections = detectArchetypalPatterns(data.transcript);
                  updateArchetypalProfile(detections);

                  const userMessage: ConsciousnessMessage = {
                    id: Date.now().toString(),
                    role: "user",
                    content: data.transcript,
                    archetypalSignatures: detections.map(d => d.element)
                  };
                  setMessages(prev => [...prev, userMessage]);
                  
                  // Create placeholder for streaming
                  const streamId = (Date.now() + 1).toString();
                  setCurrentStreamId(streamId);
                  const placeholderMessage = {
                    id: streamId,
                    role: "assistant",
                    content: ""
                  };
                  setMessages(prev => [...prev, placeholderMessage]);
                  
                  // Stream response
                  stream({
                    userText: data.transcript,
                    element: selectedElement,
                    userId: "web-user",
                    lang: "en-US"
                  });
                }
              }}
            />
            <FileUpload />
            <button 
              type="submit"
              className="text-gold-divine hover:text-gold-amber transition-colors px-sm"
              disabled={isStreaming}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </form>
      
      <JournalModal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        onSuccess={() => {
          // Optionally refresh memory view or show success message
        }}
      />
    </div>
  );
}