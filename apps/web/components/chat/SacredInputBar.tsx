'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Edit3, Spiral, Settings } from 'lucide-react';

interface SacredInputBarProps {
  onSendMessage: (message: string) => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  isVoiceActive: boolean;
  showQuickActions: boolean;
  onToggleQuickActions: () => void;
  onQuickAction: (action: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function SacredInputBar({
  onSendMessage,
  onStartVoice,
  onStopVoice,
  isVoiceActive,
  showQuickActions,
  onToggleQuickActions,
  onQuickAction,
  disabled = false,
  placeholder = "Offer your reflection..."
}: SacredInputBarProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceToggle = () => {
    if (isVoiceActive) {
      onStopVoice();
    } else {
      onStartVoice();
    }
  };

  const quickActions = [
    { id: 'journal', icon: Edit3, label: 'Journal this', emoji: '✍️' },
    { id: 'spiral', icon: Spiral, label: 'Show Spiral', emoji: '🌀' },
    { id: 'tone', icon: Settings, label: 'Shift Tone', emoji: '🎚' }
  ];

  return (
    <>
      <style jsx>{`
        .sacred-input-container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 28px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .sacred-input-container.focused {
          border-color: rgba(255, 215, 0, 0.5);
          box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
        }
        
        .sacred-input-container.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .input-content {
          padding: 16px 20px;
        }
        
        .sacred-textarea {
          width: 100%;
          border: none;
          outline: none;
          resize: none;
          font-family: 'Lato', sans-serif;
          font-size: 16px;
          line-height: 1.5;
          background: transparent;
          color: #374151;
          min-height: 24px;
          max-height: 120px;
          overflow-y: auto;
          margin-bottom: 12px;
        }
        
        .sacred-textarea::placeholder {
          color: #9CA3AF;
          font-style: italic;
        }
        
        .sacred-textarea::-webkit-scrollbar {
          width: 4px;
        }
        
        .sacred-textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .sacred-textarea::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
        
        .input-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        
        .control-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .send-button {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
        }
        
        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
        }
        
        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .mic-button {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          background: transparent;
          border: 1px solid #D1D5DB;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .mic-button:hover {
          border-color: #9CA3AF;
          background: rgba(0, 0, 0, 0.02);
        }
        
        .mic-button.active {
          background: rgba(239, 68, 68, 0.1);
          border-color: #EF4444;
          color: #EF4444;
        }
        
        .mic-button.active::before {
          content: '';
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 30px;
          background: rgba(239, 68, 68, 0.2);
          animation: mic-ripple 2s infinite;
          z-index: -1;
        }
        
        @keyframes mic-ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        
        .quick-actions-toggle {
          width: 32px;
          height: 32px;
          border-radius: 16px;
          background: transparent;
          border: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        
        .quick-actions-toggle:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.3);
        }
        
        .quick-actions {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          background: inherit;
          backdrop-filter: inherit;
          border-top: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 28px 28px 0 0;
          animation: chips-fade-in 0.3s ease-out;
        }
        
        .action-chip {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          font-size: 14px;
          font-family: 'Lato', sans-serif;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        
        .action-chip:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.3);
          color: #92400E;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes chips-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Mobile adjustments */
        @media (max-width: 768px) {
          .sacred-input-container {
            margin: 0 16px;
          }
          
          .input-content {
            padding: 12px 16px;
          }
          
          .quick-actions {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .action-chip {
            font-size: 13px;
            padding: 6px 12px;
          }
        }
        
        /* Sacred glow effect on focus */
        .sacred-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, 
            rgba(255, 215, 0, 0.3), 
            transparent, 
            rgba(255, 215, 0, 0.3)
          );
          border-radius: 30px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          pointer-events: none;
        }
        
        .sacred-input-container.focused .sacred-glow {
          opacity: 1;
        }
      `}</style>
      
      <form onSubmit={handleSubmit}>
        <div className={`sacred-input-container ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}>
          {/* Sacred Glow Effect */}
          <div className="sacred-glow" />
          
          {/* Quick Actions */}
          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                className="quick-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    type="button"
                    onClick={() => onQuickAction(action.id)}
                    className="action-chip"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span>{action.emoji}</span>
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="input-content">
            {/* Sacred Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="sacred-textarea"
              disabled={disabled}
              rows={1}
            />
            
            {/* Input Controls */}
            <div className="input-controls">
              {/* Quick Actions Toggle */}
              <motion.button
                type="button"
                onClick={onToggleQuickActions}
                className="quick-actions-toggle"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showQuickActions ? '−' : '+'}
              </motion.button>
              
              <div className="control-buttons">
                {/* Voice Button */}
                <motion.button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`mic-button ${isVoiceActive ? 'active' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={disabled}
                >
                  {isVoiceActive ? (
                    <MicOff size={18} />
                  ) : (
                    <Mic size={18} />
                  )}
                </motion.button>
                
                {/* Send Button */}
                <motion.button
                  type="submit"
                  className="send-button"
                  disabled={!message.trim() || disabled}
                  whileHover={!disabled && message.trim() ? { scale: 1.05 } : {}}
                  whileTap={!disabled && message.trim() ? { scale: 0.95 } : {}}
                >
                  <Send size={18} color="white" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}