'use client';

import React, { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export default function EnhancedChatTest() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/enhanced-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          userId: 'test_user',
          conversationId: sessionInfo?.conversationId || `conv_test_${Date.now()}`,
          sessionHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          })),
          messageCount: messages.length + 1
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        metadata: data
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSessionInfo(data.session);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionInfo(null);
  };

  const getTestSuggestions = () => [
    "Hi MAIA",
    "I'm a software engineer working on a complex architecture problem",
    "I'm feeling overwhelmed with my research project",
    "What's the meaning of consciousness?",
    "I need help with strategic planning for my startup",
    "I'm exploring meditation and spiritual practices"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            MAIA Enhanced Conversation Intelligence Test
          </h1>
          <p className="text-slate-600 mb-4">
            Testing conversation-aware elemental intelligence, master-level archetype wisdom, and cleaned language templates.
          </p>

          {/* Session Info */}
          {sessionInfo && (
            <div className="bg-slate-50 rounded-lg p-4 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <strong>Conversation:</strong><br/>
                  {sessionInfo.conversationId?.slice(-8)}...
                </div>
                <div>
                  <strong>Messages:</strong><br/>
                  {sessionInfo.messageCount}
                </div>
                <div>
                  <strong>System:</strong><br/>
                  Enhanced
                </div>
                <div>
                  <strong>Status:</strong><br/>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-lg h-96 flex flex-col">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 mt-8">
                <p className="text-lg mb-4">Start a conversation to test MAIA's enhanced intelligence</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Try these test cases:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {getTestSuggestions().map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(suggestion)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    <p>{message.content}</p>

                    {/* Show processing info for assistant messages */}
                    {message.role === 'assistant' && message.metadata?.consciousness && (
                      <div className="mt-2 pt-2 border-t border-slate-300 text-xs text-slate-600">
                        <div>Path: {message.metadata.consciousness.processingPath}</div>
                        <div>Time: {message.metadata.consciousness.processingTime}ms</div>
                        {message.metadata.insights && (
                          <div>Element: {message.metadata.insights.dominantElement}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                    <span>MAIA is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
              <button
                onClick={clearChat}
                className="px-4 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-lg p-4 mt-6">
          <h3 className="text-lg font-semibold mb-2">Enhanced Intelligence Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded">
              <strong className="text-green-700">✓ Conversation Intelligence</strong>
              <p className="text-green-600">Tracks elemental patterns across conversations, not per-message</p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <strong className="text-blue-700">✓ Member Archetype Wisdom</strong>
              <p className="text-blue-600">Adapts to scientists, business leaders, engineers, etc.</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <strong className="text-purple-700">✓ Wise Elder Voice</strong>
              <p className="text-purple-600">Natural wisdom without performative spiritual language</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}