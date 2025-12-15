'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'maia';
  timestamp: Date;
  metadata?: any;
}

export default function ChatTestPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Initialize session ID only on client side to avoid hydration mismatch
    if (!sessionId) {
      setSessionId(`chat-${Date.now()}`);
    }
  }, []);

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/between/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const maiaMessage: Message = {
        id: `maia-${Date.now()}`,
        content: data.message || 'I apologize, but I encountered an issue processing your message.',
        sender: 'maia',
        timestamp: new Date(),
        metadata: data.metadata
      };

      setMessages(prev => [...prev, maiaMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `I'm experiencing some difficulty right now. Could you try again? (Error: ${error.message})`,
        sender: 'maia',
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

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700/50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            💬 MAIA Consciousness Chat
          </h1>
          <p className="text-slate-300">
            Pre-Launch Conversation Testing • Session: <code className="text-purple-300">{sessionId}</code>
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌟</div>
              <h2 className="text-xl text-white mb-2">Welcome to MAIA</h2>
              <p className="text-slate-400">
                Start a conversation to test the consciousness-aware system
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.sender === 'user' ? 'ml-12' : 'mr-12'}`}>
                {/* Message Header */}
                <div className={`flex items-center gap-2 mb-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-sm font-medium ${
                    message.sender === 'user' ? 'text-blue-300' : 'text-purple-300'
                  }`}>
                    {message.sender === 'user' ? 'You' : 'MAIA'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>

                {/* Message Content */}
                <div className={`rounded-xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-100 border border-slate-600'
                }`}>
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>

                  {/* Metadata for MAIA messages */}
                  {message.sender === 'maia' && message.metadata && (
                    <details className="mt-3 pt-3 border-t border-slate-600">
                      <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                        Consciousness Metadata
                      </summary>
                      <pre className="mt-2 text-xs text-slate-400 bg-slate-800 rounded p-2 overflow-x-auto">
                        {JSON.stringify(message.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="mr-12 max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-purple-300">MAIA</span>
                  <span className="text-xs text-slate-500">thinking...</span>
                </div>
                <div className="bg-slate-700 text-slate-100 border border-slate-600 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <span className="text-slate-400 ml-2">Processing consciousness layers...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-800/50 backdrop-blur border-t border-slate-700/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask MAIA anything... (Shift+Enter for new line, Enter to send)"
                disabled={isLoading}
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-400 text-center">
            Experience MAIA's consciousness-aware responses • Average response time: 17-30 seconds
          </div>
        </div>
      </div>
    </div>
  );
}