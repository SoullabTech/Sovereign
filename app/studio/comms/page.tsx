'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Mail, Send, Search, Plus, X, Loader2,
  ChevronLeft, User, Clock, Check, CheckCheck, AlertCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Thread {
  thread_id: string;
  domain: string;
  thread_type: string;
  client_id: string | null;
  client_name: string;
  client_email: string | null;
  subject: string | null;
  status: string;
  unread_count: number;
  latest_message: string | null;
  latest_sender: string | null;
  latest_message_at: string | null;
  latest_channel: string | null;
}

interface Message {
  id: string;
  senderType: string;
  channelType: string;
  body: string;
  deliveryStatus: string;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
}

interface ThreadDetail {
  thread: {
    id: string;
    clientName: string;
    clientEmail: string | null;
    subject: string | null;
    domain: string;
  };
  messages: Message[];
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function DeliveryIcon({ status }: { status: string }) {
  if (status === 'sent') return <Check size={12} className="text-slate-500" />;
  if (status === 'delivered') return <CheckCheck size={12} className="text-blue-400" />;
  if (status === 'read') return <CheckCheck size={12} className="text-emerald-400" />;
  if (status === 'failed') return <AlertCircle size={12} className="text-red-400" />;
  return <Clock size={12} className="text-slate-600" />;
}

export default function CommsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadDetail, setThreadDetail] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  // Compose state
  const [composeTo, setComposeTo] = useState('');
  const [composeToName, setComposeToName] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch inbox
  useEffect(() => {
    apiFetch('/api/studio/comms')
      .then(r => r.json())
      .then(data => setThreads(data.threads || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch thread detail
  useEffect(() => {
    if (!selectedThread) { setThreadDetail(null); return; }
    setLoadingThread(true);
    apiFetch(`/api/studio/comms/threads/${selectedThread}`)
      .then(r => r.json())
      .then(data => {
        setThreadDetail(data);
        // Mark as read in local state
        setThreads(prev => prev.map(t =>
          t.thread_id === selectedThread ? { ...t, unread_count: 0 } : t
        ));
      })
      .catch(console.error)
      .finally(() => setLoadingThread(false));
  }, [selectedThread]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadDetail?.messages]);

  // Send new message (compose)
  async function handleCompose() {
    if (!composeTo || !composeMessage.trim()) return;
    setSending(true);
    try {
      const res = await apiFetch('/api/studio/comms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: composeTo,
          recipientName: composeToName || undefined,
          subject: composeSubject || undefined,
          message: composeMessage,
          channelType: 'email',
          domain: 'ops',
          threadType: 'logistics',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCompose(false);
        setComposeTo('');
        setComposeToName('');
        setComposeSubject('');
        setComposeMessage('');
        // Refresh inbox
        const inboxRes = await apiFetch('/api/studio/comms');
        const inboxData = await inboxRes.json();
        setThreads(inboxData.threads || []);
        setSelectedThread(data.threadId);
      }
    } catch (err) {
      console.error('Compose failed:', err);
    } finally {
      setSending(false);
    }
  }

  // Reply to thread
  async function handleReply() {
    if (!selectedThread || !replyText.trim()) return;
    setReplying(true);
    try {
      const res = await apiFetch(`/api/studio/comms/threads/${selectedThread}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText, channelType: 'email' }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        // Refresh thread
        const threadRes = await apiFetch(`/api/studio/comms/threads/${selectedThread}`);
        const threadData = await threadRes.json();
        setThreadDetail(threadData);
        // Update inbox preview
        const inboxRes = await apiFetch('/api/studio/comms');
        const inboxData = await inboxRes.json();
        setThreads(inboxData.threads || []);
      }
    } catch (err) {
      console.error('Reply failed:', err);
    } finally {
      setReplying(false);
    }
  }

  const filteredThreads = threads.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.client_name?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.latest_message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar: Thread list */}
      <div className={`${selectedThread ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-slate-800/50 bg-[#0d0d1a]`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-white">Messages</h1>
            <button
              onClick={() => setShowCompose(true)}
              className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={20} className="animate-spin text-slate-600" />
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare size={32} className="mx-auto mb-3 text-slate-700" />
              <p className="text-sm text-slate-500">No messages yet</p>
              <p className="text-xs text-slate-600 mt-1">Start a conversation with the compose button</p>
            </div>
          ) : (
            filteredThreads.map(thread => (
              <button
                key={thread.thread_id}
                onClick={() => setSelectedThread(thread.thread_id)}
                className={`w-full text-left p-4 border-b border-slate-800/30 hover:bg-slate-900/50 transition-colors ${
                  selectedThread === thread.thread_id ? 'bg-slate-900/70' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${thread.unread_count > 0 ? 'text-white' : 'text-slate-300'}`}>
                          {thread.client_name}
                        </span>
                        {thread.unread_count > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      {thread.subject && (
                        <div className="text-xs text-slate-500 truncate">{thread.subject}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600 flex-shrink-0 ml-2">
                    {formatTime(thread.latest_message_at)}
                  </span>
                </div>
                {thread.latest_message && (
                  <p className={`text-xs truncate ml-10 ${thread.unread_count > 0 ? 'text-slate-400' : 'text-slate-600'}`}>
                    {thread.latest_sender === 'practitioner' && <span className="text-slate-500">You: </span>}
                    {thread.latest_message}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Thread detail or empty state */}
      <div className="flex-1 flex flex-col bg-[#09090F]">
        {selectedThread && threadDetail ? (
          <>
            {/* Thread header */}
            <div className="p-4 border-b border-slate-800/50 flex items-center gap-3">
              <button
                onClick={() => setSelectedThread(null)}
                className="md:hidden p-1.5 text-slate-500 hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center">
                <User size={16} className="text-slate-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">{threadDetail.thread.clientName}</div>
                <div className="text-xs text-slate-500">
                  {threadDetail.thread.clientEmail}
                  {threadDetail.thread.subject && ` · ${threadDetail.thread.subject}`}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingThread ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-slate-600" />
                </div>
              ) : (
                <>
                  {threadDetail.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === 'practitioner' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          msg.senderType === 'practitioner'
                            ? 'bg-amber-500/10 text-amber-100 rounded-br-md'
                            : 'bg-slate-800 text-slate-200 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-500">
                            {formatTime(msg.createdAt)}
                          </span>
                          {msg.senderType === 'practitioner' && (
                            <DeliveryIcon status={msg.deliveryStatus} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Reply input */}
            <div className="p-4 border-t border-slate-800/50">
              <div className="flex items-end gap-2">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white
                             placeholder:text-slate-600 focus:outline-none focus:border-slate-700 resize-none"
                />
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30
                             disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {replying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={40} className="mx-auto mb-3 text-slate-800" />
              <p className="text-sm text-slate-500">Select a conversation</p>
              <p className="text-xs text-slate-600 mt-1">or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#16162a] rounded-xl border border-slate-800 w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
                <h2 className="text-sm font-medium text-white">New message</h2>
                <button onClick={() => setShowCompose(false)} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={composeTo}
                    onChange={e => setComposeTo(e.target.value)}
                    placeholder="Recipient email"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-700"
                  />
                  <input
                    type="text"
                    value={composeToName}
                    onChange={e => setComposeToName(e.target.value)}
                    placeholder="Name"
                    className="w-32 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-700"
                  />
                </div>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  placeholder="Subject (optional)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-700"
                />
                <textarea
                  value={composeMessage}
                  onChange={e => setComposeMessage(e.target.value)}
                  placeholder="Write your message..."
                  rows={6}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-700 resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Mail size={12} />
                  Sends via email
                </div>
                <button
                  onClick={handleCompose}
                  disabled={sending || !composeTo || !composeMessage.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium
                             hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
