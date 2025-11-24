'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import SacredInputBar from './SacredInputBar';
import LogoThinkingIndicator from './LogoThinkingIndicator';
import ConversationFlow from './ConversationFlow';
import { Message, ThinkingState } from './types';

interface MirrorInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  thinkingState: ThinkingState;
  onSendMessage: (message: string) => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  isVoiceActive: boolean;
  isMobile?: boolean;
}

export default function MirrorInterface({
  messages,
  isTyping,
  thinkingState,
  onSendMessage,
  onStartVoice,
  onStopVoice,
  isVoiceActive,
  isMobile = false
}: MirrorInterfaceProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = conversationRef.current;
      const isNearBottom = scrollHeight - scrollTop <= clientHeight + 100;
      
      if (isNearBottom) {
        conversationRef.current.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'journal':
        // Navigate to journal or open journal modal
        break;
      case 'spiral':
        // Navigate to spiral view
        break;
      case 'tone':
        // Open tone adjustment
        break;
    }
    setShowQuickActions(false);
  };

  return (
    <>
      <style jsx global>{`
        .mirror-interface {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          font-family: 'Lato', sans-serif;
        }
        
        .mirror-interface-desktop {
          display: grid;
          grid-template-columns: 1fr 300px;
        }
        
        .main-conversation {
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .conversation-container {
          flex: 1;
          overflow-y: auto;
          scroll-behavior: smooth;
          padding: ${isMobile ? '80px 16px 120px' : '80px 32px 120px'};
        }
        
        .conversation-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .conversation-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .conversation-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        
        .conversation-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        
        .sidebar-preview {
          background: rgba(248, 250, 252, 0.95);
          border-left: 1px solid #E5E7EB;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .journal-snippets {
          background: white;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #E5E7EB;
        }
        
        .journal-snippets h3 {
          font-family: 'Blair', serif;
          font-size: 16px;
          color: #374151;
          margin: 0 0 12px 0;
        }
        
        .journal-snippet {
          font-size: 14px;
          color: #6B7280;
          line-height: 1.4;
          padding: 8px 0;
          border-bottom: 1px solid #F3F4F6;
        }
        
        .journal-snippet:last-child {
          border-bottom: none;
        }
        
        .spiral-preview {
          height: 200px;
          border-radius: 12px;
          background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6B7280;
          font-size: 14px;
          font-style: italic;
        }
        
        .input-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: ${isMobile ? '0' : '300px'};
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid #E5E7EB;
          padding: 20px;
        }
        
        @media (max-width: 1024px) {
          .mirror-interface-desktop {
            display: block;
          }
          
          .sidebar-preview {
            display: none;
          }
          
          .input-container {
            right: 0;
          }
        }
        
        /* Sacred Breathing Background */
        .mirror-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(181, 126, 220, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(78, 205, 196, 0.02) 0%, transparent 50%);
          animation: sacred-breathing-bg 8s ease-in-out infinite;
          pointer-events: none;
          z-index: -1;
        }
        
        @keyframes sacred-breathing-bg {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
      
      <div className={`mirror-interface ${!isMobile ? 'mirror-interface-desktop' : ''}`}>
        {/* Sacred Breathing Background */}
        <div className="mirror-background" />
        
        {/* Logo Thinking Indicator */}
        <LogoThinkingIndicator 
          state={thinkingState}
          isMobile={isMobile}
        />
        
        <div className="main-conversation">
          {/* Conversation Area */}
          <div 
            ref={conversationRef}
            className="conversation-container"
          >
            <ConversationFlow 
              messages={messages}
              isTyping={isTyping}
            />
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 mb-6 px-4"
                >
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-neutral-500 italic">
                    Maia is reflecting...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Sacred Input Bar */}
          <div className="input-container">
            <SacredInputBar
              onSendMessage={onSendMessage}
              onStartVoice={onStartVoice}
              onStopVoice={onStopVoice}
              isVoiceActive={isVoiceActive}
              showQuickActions={showQuickActions}
              onToggleQuickActions={() => setShowQuickActions(!showQuickActions)}
              onQuickAction={handleQuickAction}
              disabled={isTyping}
            />
          </div>
        </div>
        
        {/* Desktop Sidebar Preview */}
        {!isMobile && (
          <div className="sidebar-preview">
            {/* Journal Snippets */}
            <div className="journal-snippets">
              <h3>Recent Reflections</h3>
              <div className="journal-snippet">
                "I noticed a pattern in my resistance to change..."
              </div>
              <div className="journal-snippet">
                "The spiral teaches us that growth isn&apos;t linear"
              </div>
              <div className="journal-snippet">
                "Fire energy emerged during our discussion about courage"
              </div>
            </div>
            
            {/* Spiral Preview */}
            <div className="spiral-preview">
              <span>Your spiral journey visualization</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}