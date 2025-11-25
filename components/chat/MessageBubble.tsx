'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplets, Mountain, Wind, Sparkles, Edit3 } from 'lucide-react';
import { Message, ElementalHint } from './types';

interface MessageBubbleProps {
  message: Message;
  showBreathingAura?: boolean;
  isLastInGroup?: boolean;
  onJournalTag?: (messageId: string) => void;
}

const elementIcons = {
  fire: Flame,
  water: Droplets,
  earth: Mountain,
  air: Wind,
  aether: Sparkles
};

const elementColors = {
  fire: { bg: 'rgba(239, 68, 68, 0.1)', color: '#DC2626' },
  water: { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' },
  earth: { bg: 'rgba(34, 197, 94, 0.1)', color: '#16A34A' },
  air: { bg: 'rgba(255, 215, 0, 0.1)', color: '#D97706' },
  aether: { bg: 'rgba(147, 51, 234, 0.1)', color: '#7C3AED' }
};

export default function MessageBubble({ 
  message, 
  showBreathingAura = true,
  isLastInGroup = false,
  onJournalTag
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isMaia = message.sender === 'maia';
  const hasElementalHints = message.elementalHints && message.elementalHints.length > 0;
  
  // Split message into paragraphs for cascade animation
  const paragraphs = message.content.split('\n\n').filter(p => p.trim());
  
  const renderElementalIndicators = () => {
    if (!hasElementalHints || !message.elementalHints) return null;
    
    return (
      <motion.div 
        className="elemental-indicators"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {message.elementalHints.map((hint, index) => {
          const IconComponent = elementIcons[hint];
          const colors = elementColors[hint];
          
          return (
            <motion.div
              key={`${hint}-${index}`}
              className="elemental-hint"
              style={{
                backgroundColor: colors.bg,
                color: colors.color
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <IconComponent size={12} />
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const renderJournalShimmer = () => {
    if (!message.isJournalTagged) return null;
    
    return (
      <motion.div
        className="journal-shimmer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Edit3 size={12} />
      </motion.div>
    );
  };

  return (
    <>
      <style jsx>{`
        .message-bubble {
          position: relative;
          margin-bottom: ${isLastInGroup ? '8px' : '6px'};
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .message-bubble.user {
          justify-content: flex-end;
        }
        
        .message-content {
          position: relative;
          max-width: ${isMaia ? '80%' : '70%'};
          padding: 16px 20px;
          border-radius: 24px;
          font-family: 'Lato', sans-serif;
          line-height: 1.6;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .message-content.user {
          background: linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%);
          border: 1px solid #d4d4d4;
          color: #404040;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        
        .message-content.maia {
          background: linear-gradient(135deg, rgba(181, 126, 220, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%);
          border: 1px solid rgba(181, 126, 220, 0.2);
          color: #374151;
          box-shadow: 0 2px 12px rgba(181, 126, 220, 0.08);
        }
        
        .message-content.maia.breathing {
          position: relative;
          overflow: visible;
        }
        
        .message-content.maia.breathing::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, 
            rgba(181, 126, 220, 0.3), 
            transparent, 
            rgba(181, 126, 220, 0.3)
          );
          border-radius: 26px;
          opacity: 0.6;
          animation: breathing-aura 6s ease-in-out infinite;
          z-index: -1;
          pointer-events: none;
        }
        
        @keyframes breathing-aura {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.02);
          }
        }
        
        .message-paragraph {
          margin-bottom: 12px;
        }
        
        .message-paragraph:last-child {
          margin-bottom: 0;
        }
        
        .elemental-indicators {
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 6px;
          pointer-events: none;
        }
        
        .elemental-hint {
          width: 24px;
          height: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: gentle-pulse 3s ease-in-out infinite;
        }
        
        @keyframes gentle-pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.9;
          }
        }
        
        .journal-shimmer {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          background: linear-gradient(45deg, rgba(255, 215, 0, 0.8), rgba(255, 165, 0, 0.9));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          animation: shimmer-pulse 2s ease-in-out infinite;
          cursor: pointer;
        }
        
        @keyframes shimmer-pulse {
          0%, 100% { 
            opacity: 0.7;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        .timestamp {
          font-size: 11px;
          color: #9CA3AF;
          margin-top: 4px;
          text-align: ${isMaia ? 'left' : 'right'};
        }
        
        /* Mobile adjustments */
        @media (max-width: 768px) {
          .elemental-indicators {
            display: none;
          }
          
          .message-content {
            max-width: 85%;
          }
        }
      `}</style>
      
      <motion.div
        className={`message-bubble ${message.sender}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className={`message-content ${message.sender} ${
            isMaia && showBreathingAura ? 'breathing' : ''
          }`}
        >
          {/* Elemental Indicators */}
          {renderElementalIndicators()}
          
          {/* Journal Shimmer */}
          {renderJournalShimmer()}
          
          {/* Message Content with Cascade Animation */}
          {paragraphs.length > 1 ? (
            paragraphs.map((paragraph, index) => (
              <motion.div
                key={index}
                className="message-paragraph"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.3, 
                  duration: 0.4,
                  ease: "easeOut" 
                }}
              >
                {paragraph}
              </motion.div>
            ))
          ) : (
            <div>{message.content}</div>
          )}
          
          {/* Timestamp */}
          <div className="timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}