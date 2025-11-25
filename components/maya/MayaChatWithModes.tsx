/**
 * MAIA Chat with Mode Support
 * Simple integration of witness/muse modes without complicating voice
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useMayaStream } from '@/hooks/useMayaStream';
import HybridInput from '@/components/chat/HybridInput';
import { MayaModeToggle, MayaModeStatus, MaiaMode } from './MayaModeToggle';

export default function MayaChatWithModes() {
  const { messages, isStreaming, sendMessage } = useMayaStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mode state
  const [currentMode, setCurrentMode] = useState<MaiaMode>('interactive');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // For witness/muse modes - accumulate content
  const [sessionContent, setSessionContent] = useState<string[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handle mode change
   */
  const handleModeChange = async (newMode: MaiaMode) => {
    // If switching from a special mode, end that session first
    if (isSessionActive && currentMode !== 'interactive') {
      await handleEndSession();
    }

    setCurrentMode(newMode);

    // Start session for special modes
    if (newMode !== 'interactive') {
      await startSpecialSession(newMode);
    }
  };

  /**
   * Start a witness/muse/creative session
   */
  const startSpecialSession = async (mode: MaiaMode) => {
    const userId = sessionStorage.getItem('explorerId') || 'anonymous';

    try {
      let endpoint = '/api/oracle/witness';
      let action = '';

      switch (mode) {
        case 'witness':
          action = 'start';
          break;
        case 'muse':
          action = 'start-muse';
          break;
        case 'creative':
          // Creative mode uses witness endpoint but different handling
          action = 'start';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId,
          sessionId: `${mode}_${Date.now()}`,
          type: mode === 'muse' ? 'walk' : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsSessionActive(true);
        setSessionId(data.sessionId || data.streamId);
        setSessionContent([]); // Clear session content
      }
    } catch (error) {
      console.error(`Failed to start ${mode} session:`, error);
    }
  };

  /**
   * Handle sending message based on mode
   */
  const handleSendMessage = async (content: string) => {
    const userId = sessionStorage.getItem('explorerId') || 'anonymous';

    if (currentMode === 'interactive') {
      // Normal interactive mode
      sendMessage(content);
    } else if (isSessionActive) {
      // In special mode - accumulate content
      setSessionContent(prev => [...prev, content]);

      // Send to appropriate endpoint
      try {
        let endpoint = '/api/oracle/witness';
        let payload: any = {
          userId,
          sessionId
        };

        switch (currentMode) {
          case 'witness':
            payload.action = 'observe';
            payload.speaker = sessionStorage.getItem('explorerName') || 'User';
            payload.content = content;
            break;

          case 'muse':
            payload.action = 'receive-muse';
            payload.streamId = sessionId;
            payload.content = content;
            break;

          case 'creative':
            payload.action = 'creative';
            payload.type = 'poetry'; // Could make this selectable
            payload.content = content;
            payload.artistName = sessionStorage.getItem('explorerName') || 'User';
            break;
        }

        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Show user's input in the chat (MAIA won't respond immediately)
        // This is just for visual feedback
        if (currentMode !== 'interactive') {
          // Could add a visual indicator that content was received
        }

      } catch (error) {
        console.error(`Failed to send ${currentMode} content:`, error);
      }
    }
  };

  /**
   * End special session and get synthesis
   */
  const handleEndSession = async () => {
    if (!isSessionActive || !sessionId) return;

    const userId = sessionStorage.getItem('explorerId') || 'anonymous';

    try {
      let endpoint = '/api/oracle/witness';
      let action = currentMode === 'muse' ? 'end-muse' : 'end';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId,
          sessionId,
          streamId: sessionId // For muse mode
        })
      });

      const data = await response.json();

      // Get synthesis/reflection
      if (data.success && data.synthesis) {
        // Display MAIA's synthesis as a message
        const synthesisMessage = formatSynthesis(data.synthesis, currentMode);
        sendMessage(`[MAIA's ${currentMode} synthesis]: ${synthesisMessage}`);
      }

      // Reset session state
      setIsSessionActive(false);
      setSessionId(null);
      setSessionContent([]);
      setCurrentMode('interactive');

    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  /**
   * Format synthesis response for display
   */
  const formatSynthesis = (synthesis: any, mode: MaiaMode): string => {
    if (mode === 'muse' && synthesis) {
      return `
✨ What I heard in your stream:

**The Heart of It:**
${synthesis.heartOfIt}

**Gold Nuggets:**
${synthesis.goldNuggets?.join('\n• ') || ''}

**What Keeps Returning:**
${synthesis.whatKeepsReturning}

**Your Medicine:**
${synthesis.yourMedicine}

**Elemental Message:**
${synthesis.elementalMessage?.message || ''}

**Next Steps:**
${synthesis.nextSteps?.join('\n• ') || ''}
      `.trim();
    }

    // Default format for other modes
    return JSON.stringify(synthesis, null, 2);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1f3a] relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Mode Toggle */}
        <div className="border-b border-amber-500/20 px-4 py-3 backdrop-blur-sm bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 animate-pulse" />
                <div className="absolute inset-1 rounded-full bg-[#1a1f3a]" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-400/40 to-amber-600/40" />
              </div>
              <div>
                <h2 className="text-amber-50 font-light tracking-wider">MAIA</h2>
                <p className="text-xs text-amber-200/40">
                  {currentMode === 'interactive'
                    ? `Conversing with ${sessionStorage.getItem('explorerName')}`
                    : `${currentMode} mode active`
                  }
                </p>
              </div>
            </div>

            {/* Mode Toggle */}
            <MayaModeToggle
              currentMode={currentMode}
              onModeChange={handleModeChange}
              isActive={isSessionActive}
            />
          </div>
        </div>

        {/* Mode Status Bar */}
        <MayaModeStatus
          mode={currentMode}
          isActive={isSessionActive}
          onEndSession={handleEndSession}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-[#1a1f3a]" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/30" />
                </div>
              </div>

              {currentMode === 'interactive' ? (
                <>
                  <p className="text-amber-200/40 text-sm font-light tracking-wide">
                    Welcome, {sessionStorage.getItem('explorerName')}
                  </p>
                  <p className="text-amber-200/70 mt-3 text-lg font-light">
                    How can I support your journey today?
                  </p>
                </>
              ) : (
                <p className="text-amber-200/70 text-lg font-light">
                  {currentMode === 'witness' && "I'm listening silently. Share freely."}
                  {currentMode === 'muse' && "Stream your consciousness. I'm receiving."}
                  {currentMode === 'creative' && "Share your creative expression."}
                </p>
              )}
            </div>
          )}

          {/* Show messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] px-5 py-4 rounded-2xl backdrop-blur-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500/15 to-amber-600/10 text-amber-50 border border-amber-500/30'
                    : 'bg-gradient-to-r from-black/50 to-black/40 text-amber-100/90 border border-amber-500/20'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className="text-xs text-amber-200/40 mt-2 font-light">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {/* Show session content in special modes */}
          {isSessionActive && sessionContent.length > 0 && (
            <div className="opacity-60">
              <p className="text-xs text-amber-200/40 mb-2">
                {currentMode === 'witness' && "Witnessing..."}
                {currentMode === 'muse' && "Receiving your stream..."}
                {currentMode === 'creative' && "Receiving your expression..."}
              </p>
              {sessionContent.map((content, i) => (
                <div key={i} className="flex justify-end mb-2">
                  <div className="max-w-[80%] px-4 py-2 rounded-lg bg-amber-500/10 text-amber-50/70 text-sm">
                    {content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isStreaming && (
            <div className="flex justify-start">
              <div className="px-5 py-4 rounded-2xl bg-gradient-to-r from-black/50 to-black/40 border border-amber-500/20">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-amber-400/80 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-amber-500/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-amber-600/80 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-amber-500/20 p-4 backdrop-blur-sm bg-black/30">
          <HybridInput
            onSend={handleSendMessage}
            disabled={isStreaming && currentMode === 'interactive'}
            placeholder={
              currentMode === 'interactive'
                ? "Share your thoughts..."
                : currentMode === 'witness'
                ? "MAIA is witnessing..."
                : currentMode === 'muse'
                ? "Stream your consciousness..."
                : "Share your creative expression..."
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}