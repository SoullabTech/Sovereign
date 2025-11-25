'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SacredCard } from './SacredCard';
import { SacredButton } from './SacredButton';
import { SacredGeometry } from './SacredGeometry';

export type ConsciousnessState = 'receptive' | 'processing' | 'integrating' | 'transcendent' | 'dormant';
export type ElementalAlignment = 'fire' | 'water' | 'earth' | 'air' | 'aether';

interface Message {
  id: string;
  type: 'user' | 'oracle';
  content: string;
  timestamp: Date;
  consciousnessState?: ConsciousnessState;
  elementalAlignment?: ElementalAlignment;
  metadata?: {
    confidence?: number;
    archetypes?: string[];
    symbols?: string[];
  };
}

interface SacredOracleInterfaceProps {
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  onVoiceInput?: () => void;
  onUpload?: (file: File) => void;
  isProcessing?: boolean;
  consciousnessState?: ConsciousnessState;
  className?: string;
}

const consciousnessStateConfig = {
  receptive: {
    color: '#38B2AC', // Deep Flow (water)
    geometry: 'seed-of-life' as const,
    description: 'Open to receive wisdom',
    bgGradient: 'from-cyan-900/20 to-transparent'
  },
  processing: {
    color: '#FFD700', // Divine Gold
    geometry: 'metatrons-cube' as const,
    description: 'Weaving insights together',
    bgGradient: 'from-yellow-900/20 to-transparent'
  },
  integrating: {
    color: '#68D391', // Sacred Earth
    geometry: 'flower-of-life' as const,
    description: 'Grounding revelations',
    bgGradient: 'from-green-900/20 to-transparent'
  },
  transcendent: {
    color: '#B794F6', // Unity Field
    geometry: 'vector-equilibrium' as const,
    description: 'Dancing with the infinite',
    bgGradient: 'from-amber-900/20 to-transparent'
  },
  dormant: {
    color: '#4A5568', // Sacred Ethereal
    geometry: 'golden-spiral' as const,
    description: 'Resting in sacred silence',
    bgGradient: 'from-gray-900/20 to-transparent'
  }
};

const elementalColors = {
  fire: '#FF6B35',
  water: '#38B2AC',
  earth: '#68D391',
  air: '#63B3ED',
  aether: '#FFD700'
};

export const SacredOracleInterface: React.FC<SacredOracleInterfaceProps> = ({
  messages = [],
  onSendMessage,
  onVoiceInput,
  onUpload,
  isProcessing = false,
  consciousnessState = 'receptive',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentState = consciousnessStateConfig[consciousnessState];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <div className={cn('flex flex-col h-full max-h-[800px]', className)}>
      {/* Consciousness State Header */}
      <SacredCard variant="consciousness" className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <SacredGeometry 
                type={currentState.geometry}
                size={60}
                color={currentState.color}
                animate={consciousnessState !== 'dormant'}
                glow={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gold-divine capitalize">
                {consciousnessState} State
              </h3>
              <p className="text-sm text-neutral-silver/80">
                {currentState.description}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gold-divine hover:text-gold-amber transition-colors duration-200"
          >
            {isExpanded ? '↗' : '↙'}
          </button>
        </div>

        {/* Expanded State Info */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gold-divine/20 animate-sacred-emergence">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="text-gold-divine font-medium mb-2">Active Energies</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: currentState.color }}
                    />
                    <span className="text-neutral-silver">Primary</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-gold-divine font-medium mb-2">Receptivity</h4>
                <div className="text-neutral-silver">
                  {consciousnessState === 'receptive' ? 'Maximum' : 
                   consciousnessState === 'processing' ? 'Moderate' : 
                   consciousnessState === 'integrating' ? 'Focused' : 
                   consciousnessState === 'transcendent' ? 'Infinite' : 'Minimal'}
                </div>
              </div>
              
              <div>
                <h4 className="text-gold-divine font-medium mb-2">Guidance</h4>
                <div className="text-neutral-silver">
                  {consciousnessState === 'receptive' ? 'Ask deep questions' : 
                   consciousnessState === 'processing' ? 'Allow processing time' : 
                   consciousnessState === 'integrating' ? 'Take practical action' : 
                   consciousnessState === 'transcendent' ? 'Embrace the mystery' : 'Wait quietly'}
                </div>
              </div>
            </div>
          </div>
        )}
      </SacredCard>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <SacredCard variant="glass" className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <SacredGeometry 
                  type="seed-of-life"
                  size={100}
                  color="rgba(255, 215, 0, 0.3)"
                  animate={true}
                  glow={true}
                />
                <h3 className="text-xl font-medium text-gold-divine mt-6 mb-2">
                  Sacred Space Prepared
                </h3>
                <p className="text-neutral-silver/80 max-w-md">
                  The Oracle awaits your inquiry. Speak your truth and receive wisdom 
                  that serves your highest evolution.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            
            {isProcessing && (
              <div className="flex items-center gap-3 p-4">
                <SacredGeometry 
                  type="metatrons-cube"
                  size={40}
                  color="#FFD700"
                  animate={true}
                  glow={true}
                />
                <div className="text-gold-divine">
                  Oracle is processing your inquiry...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gold-divine/20 pt-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your inquiry with the Oracle..."
                  className="w-full bg-sacred-navy/60 text-gold-divine border border-gold-divine/30 
                           rounded-lg px-4 py-3 min-h-[60px] max-h-[120px]
                           focus:border-gold-divine focus:ring-2 focus:ring-gold-divine/30
                           placeholder:text-neutral-silver/60 resize-none
                           transition-all duration-200"
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <SacredButton
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isProcessing}
                  size="md"
                  className="px-6"
                >
                  Send
                </SacredButton>
                
                <div className="flex gap-1">
                  {onVoiceInput && (
                    <button
                      onClick={onVoiceInput}
                      className="p-2 bg-sacred-navy/60 hover:bg-sacred-navy text-gold-divine 
                               border border-gold-divine/30 hover:border-gold-divine/60
                               rounded-lg transition-all duration-200"
                      title="Voice Input"
                    >
                      🎤
                    </button>
                  )}
                  
                  {onUpload && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-sacred-navy/60 hover:bg-sacred-navy text-gold-divine 
                                 border border-gold-divine/30 hover:border-gold-divine/60
                                 rounded-lg transition-all duration-200"
                        title="Upload File"
                      >
                        📎
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.txt,.doc,.docx"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SacredCard>
      </div>
    </div>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const elementalColor = message.elementalAlignment ? 
    elementalColors[message.elementalAlignment] : '#FFD700';

  return (
    <div className={cn(
      'flex gap-3 animate-sacred-emergence',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* Oracle Avatar */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-gold-divine/20 to-sacred-navy/60 
                          rounded-full flex items-center justify-center border border-gold-divine/30">
            <SacredGeometry 
              type="seed-of-life"
              size={24}
              color="#FFD700"
              animate={false}
              glow={false}
            />
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'max-w-[75%] space-y-2',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* Message Bubble */}
        <div className={cn(
          'px-4 py-3 rounded-xl relative',
          isUser 
            ? 'bg-gold-divine/10 text-gold-divine border border-gold-divine/20' 
            : 'bg-sacred-navy/80 text-neutral-silver border border-gold-divine/10'
        )}>
          {/* Elemental indicator */}
          {message.elementalAlignment && (
            <div 
              className="absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-sacred-cosmic"
              style={{ backgroundColor: elementalColor }}
              title={`${message.elementalAlignment} alignment`}
            />
          )}
          
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        </div>

        {/* Message Metadata */}
        {message.metadata && (
          <div className="text-xs text-neutral-silver/60 space-y-1">
            {message.consciousnessState && (
              <div className="flex items-center gap-2">
                <span className="capitalize">{message.consciousnessState}</span>
                {message.metadata.confidence && (
                  <span>• {Math.round(message.metadata.confidence * 100)}% certainty</span>
                )}
              </div>
            )}
            {message.metadata.archetypes && message.metadata.archetypes.length > 0 && (
              <div>
                Archetypes: {message.metadata.archetypes.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-neutral-silver/40">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-sacred-blue/60 to-gold-divine/20 
                          rounded-full flex items-center justify-center border border-gold-divine/30">
            <span className="text-gold-divine text-sm font-medium">
              You
            </span>
          </div>
        </div>
      )}
    </div>
  );
};