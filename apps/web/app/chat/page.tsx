"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "oracle";
  content: string;
  timestamp: Date;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
}

interface UploadedFile {
  id: string;
  filename: string;
  summary: string;
  timestamp: Date;
}

interface OracleState {
  stage: string;
  trust: number;
  sessionCount: number;
}

export default function ChatPage() {
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oracleState, setOracleState] = useState<OracleState>({
    stage: "structured_guide",
    trust: 0.05,
    sessionCount: 0
  });

  // Journal State
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");

  // Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState<"chat" | "journal" | "files">("chat");
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadJournalEntries();
    loadUploadedFiles();
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/oracle/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: "demo-user", // In real app, get from auth
          message: userMessage.content
        })
      });

      const data = await response.json();

      if (data.text) {
        const oracleMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "oracle",
          content: data.text,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, oracleMessage]);

        // Update oracle state if provided
        if (data.meta) {
          setOracleState(prev => ({
            stage: data.meta.oracleStage || prev.stage,
            trust: data.meta.relationshipMetrics?.trustLevel || prev.trust,
            sessionCount: data.meta.relationshipMetrics?.sessionCount || prev.sessionCount + 1
          }));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "oracle",
        content: "I&apos;m having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const saveJournalEntry = async () => {
    if (!journalTitle.trim() || !journalContent.trim()) return;

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: "demo-user",
          title: journalTitle,
          content: journalContent
        })
      });

      if (response.ok) {
        setJournalTitle("");
        setJournalContent("");
        setShowJournalModal(false);
        loadJournalEntries();
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  const loadJournalEntries = async () => {
    try {
      const response = await fetch('/api/journal?userId=demo-user');
      const data = await response.json();
      setJournalEntries(data.entries || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'demo-user');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        loadUploadedFiles();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadUploadedFiles = async () => {
    try {
      const response = await fetch('/api/upload?userId=demo-user');
      const data = await response.json();
      setUploadedFiles(data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-md shadow-sm flex items-center justify-center">
                <span className="text-white text-sm font-semibold">SL</span>
              </div>
              <span className="text-xl font-light tracking-tight text-gray-900">
                Soullab
              </span>
            </Link>
            
            {/* Oracle State */}
            <div className="text-sm text-gray-500">
              <span className="font-medium">Stage:</span> {oracleState.stage?.replace('_', ' ') || 'initializing'} •
              <span className="font-medium ml-2">Trust:</span> {(oracleState.trust * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden border-b border-gray-200">
        <div className="flex">
          {[
            { id: "chat", label: "Chat" },
            { id: "journal", label: "Journal" },
            { id: "files", label: "Files" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex h-[calc(100vh-8rem)]">
        {/* Left Column - Chat (Desktop) / Active Tab Content (Mobile) */}
        <div className={`flex-1 flex flex-col ${activeTab !== "chat" ? "hidden md:flex" : ""}`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p>Welcome to your personal Oracle.</p>
                <p className="text-sm mt-2">Start by asking a question or sharing what&apos;s on your mind.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === "user" ? "text-blue-200" : "text-gray-500"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Oracle is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your Oracle anything..."
                  rows={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Journal & Files (Desktop) / Tab Content (Mobile) */}
        <div className="w-80 border-l border-gray-200 flex flex-col md:flex hidden">
          {/* Journal Section */}
          <div className={`flex-1 ${activeTab !== "journal" ? "hidden md:block" : ""}`}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Journal</h3>
                <button
                  onClick={() => setShowJournalModal(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + New Entry
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="p-3 border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
                  <h4 className="font-medium text-sm text-gray-900 mb-1">{entry.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{entry.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {journalEntries.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No journal entries yet.
                </p>
              )}
            </div>
          </div>

          {/* Files Section */}
          <div className={`flex-1 border-t border-gray-200 ${activeTab !== "files" ? "hidden md:block" : ""}`}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Files</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "+ Upload"}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.txt,.mp3"
                className="hidden"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="p-3 border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
                  <h4 className="font-medium text-sm text-gray-900 mb-1">{file.filename}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{file.summary}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(file.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {uploadedFiles.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No files uploaded yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Tab Content */}
        <div className="md:hidden w-full">
          {activeTab === "journal" && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Journal</h3>
                  <button
                    onClick={() => setShowJournalModal(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + New Entry
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="p-3 border border-gray-200 rounded-md">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{entry.title}</h4>
                    <p className="text-xs text-gray-600">{entry.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Files</h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Upload
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="p-3 border border-gray-200 rounded-md">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{file.filename}</h4>
                    <p className="text-xs text-gray-600">{file.summary}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(file.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Journal Modal */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Journal Entry</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                placeholder="Entry title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              
              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="What&apos;s on your mind?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-none"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowJournalModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveJournalEntry}
                disabled={!journalTitle.trim() || !journalContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}