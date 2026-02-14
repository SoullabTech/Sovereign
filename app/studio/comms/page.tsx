'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Mail,
  Bell,
  Send,
  Search,
  Star,
  Phone,
  Plus,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { mockMessages as initialMessages, type Message } from '@/lib/studio/mockMessages';
import { CommsMessageDetail } from '@/components/studio/CommsMessageDetail';

const typeConfig = {
  email: { icon: Mail, label: 'Email', color: 'blue' },
  sms: { icon: Phone, label: 'SMS', color: 'emerald' },
  notification: { icon: Bell, label: 'Notification', color: 'amber' },
  internal: { icon: MessageSquare, label: 'Internal', color: 'purple' },
};

export default function CommsPage() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>('1');
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsTo, setSmsTo] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Resizable panel state (desktop only)
  const [panelWidth, setPanelWidth] = useState(420);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      setPanelWidth(Math.min(600, Math.max(280, newWidth)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const starredCount = messages.filter(m => m.starred).length;
  const smsCount = messages.filter(m => m.type === 'sms').length;

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.from.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && m.status === 'unread') ||
      (filter === 'starred' && m.starred) ||
      (filter === m.type);
    return matchesSearch && matchesFilter;
  });

  const selected = messages.find(m => m.id === selectedMessage);

  const toggleStar = (id: string) => {
    setMessages(messages.map(m =>
      m.id === id ? { ...m, starred: !m.starred } : m
    ));
  };

  const markAsRead = (id: string) => {
    setMessages(messages.map(m =>
      m.id === id && m.status === 'unread' ? { ...m, status: 'read' as const } : m
    ));
  };

  // Mobile: navigate to detail route. Desktop: set local state.
  const onSelectMessage = (message: Message) => {
    markAsRead(message.id);
    if (isMobile) {
      router.push(`/studio/comms/${message.id}`);
      return;
    }
    setSelectedMessage(message.id);
  };

  const sendSms = async () => {
    if (!smsTo.trim() || !smsMessage.trim()) {
      setSmsError('Phone number and message are required');
      return;
    }

    setSendingSms(true);
    setSmsError(null);

    try {
      const response = await apiFetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: smsTo.trim(),
          message: smsMessage.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newMessage: Message = {
          id: `sms-${Date.now()}`,
          type: 'sms',
          from: 'You',
          to: smsTo.trim(),
          subject: 'Sent SMS',
          preview: smsMessage.trim(),
          status: 'sent',
          starred: false,
          timestamp: 'Just now',
        };
        setMessages([newMessage, ...messages]);
        setShowSmsModal(false);
        setSmsTo('');
        setSmsMessage('');
      } else {
        setSmsError(data.error || 'Failed to send SMS');
      }
    } catch {
      setSmsError('Failed to send SMS. Please try again.');
    } finally {
      setSendingSms(false);
    }
  };

  // ─── Shared: Message List Item ────────────────────────────
  const renderMessageItem = (message: Message) => {
    const type = typeConfig[message.type];
    const TypeIcon = type.icon;
    const isSelected = !isMobile && selectedMessage === message.id;

    return (
      <button
        key={message.id}
        onClick={() => onSelectMessage(message)}
        className={`
          w-full p-3 border-b border-slate-800/50 text-left transition-colors
          ${isSelected ? 'bg-slate-800' : 'hover:bg-slate-900'}
          ${message.status === 'unread' ? 'bg-slate-900/50' : ''}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Type Icon */}
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            ${type.color === 'blue' ? 'bg-blue-500/20' : ''}
            ${type.color === 'emerald' ? 'bg-emerald-500/20' : ''}
            ${type.color === 'amber' ? 'bg-amber-500/20' : ''}
            ${type.color === 'purple' ? 'bg-purple-500/20' : ''}
          `}>
            <TypeIcon className={`w-4 h-4
              ${type.color === 'blue' ? 'text-blue-400' : ''}
              ${type.color === 'emerald' ? 'text-emerald-400' : ''}
              ${type.color === 'amber' ? 'text-amber-400' : ''}
              ${type.color === 'purple' ? 'text-purple-400' : ''}
            `} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-sm ${message.status === 'unread' ? 'font-semibold text-white' : 'text-slate-300'}`}>
                {message.from}
              </span>
              <span className="text-xs text-slate-500">{message.timestamp}</span>
            </div>
            <div className={`text-sm truncate ${message.status === 'unread' ? 'text-white' : 'text-slate-400'}`}>
              {message.subject}
            </div>
            <div className="mt-0.5">
              <div className={`text-xs text-slate-500 ${expandedMessage === message.id ? '' : 'truncate'}`}>
                {message.preview}
              </div>
              {message.preview.length > 60 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedMessage(expandedMessage === message.id ? null : message.id);
                  }}
                  className="flex items-center gap-0.5 text-[10px] text-teal-500 hover:text-teal-400 mt-0.5"
                >
                  {expandedMessage === message.id ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      More
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Indicators */}
          <div className="flex flex-col items-center gap-1">
            {message.starred && (
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            )}
            {message.status === 'unread' && (
              <div className="w-2 h-2 rounded-full bg-teal-400" />
            )}
            {message.priority === 'high' && (
              <div className="w-2 h-2 rounded-full bg-red-400" />
            )}
          </div>
        </div>
      </button>
    );
  };

  // ─── Shared: List Header + Search + Filters ───────────────
  const renderListHeader = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Comms
        </h1>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {unreadCount} unread
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {smsCount} SMS
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {starredCount} starred
          </span>
        </div>
        <button
          onClick={() => setShowSmsModal(true)}
          className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-xs font-medium"
        >
          <Plus className="w-3 h-3" />
          Compose SMS
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="p-2 border-b border-slate-800 flex items-center gap-1 overflow-x-auto">
        {['all', 'unread', 'starred', 'email', 'sms', 'notification'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-teal-500/20 text-teal-400'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {f === 'sms' ? 'SMS' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    </>
  );

  // ─── Shared: SMS Modal ────────────────────────────────────
  const renderSmsModal = () => (
    <AnimatePresence>
      {showSmsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowSmsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-400" />
                Compose SMS
              </h3>
              <button
                onClick={() => setShowSmsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {smsError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {smsError}
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  To (Phone Number)
                </label>
                <input
                  type="tel"
                  value={smsTo}
                  onChange={(e) => setSmsTo(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Message
                </label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                  maxLength={160}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
                <div className="text-xs text-slate-500 mt-1 text-right">
                  {smsMessage.length}/160 characters
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
              <button
                onClick={() => setShowSmsModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendSms}
                disabled={sendingSms || !smsTo.trim() || !smsMessage.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingSms ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send SMS
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── MOBILE: List only (detail is a separate route) ───────
  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {renderListHeader()}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map(renderMessageItem)}
        </div>
        {renderSmsModal()}
      </div>
    );
  }

  // ─── DESKTOP: Split pane (existing behavior preserved) ────
  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 flex">
      {/* Message List Panel */}
      <div
        className="flex-shrink-0 border-r border-slate-800 flex flex-col overflow-hidden"
        style={{ width: panelWidth }}
      >
        {renderListHeader()}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map(renderMessageItem)}
        </div>
      </div>

      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-2 flex-shrink-0 cursor-col-resize flex items-center justify-center transition-colors ${
          isDragging ? 'bg-teal-500' : 'bg-slate-800 hover:bg-teal-500/50'
        }`}
      >
        <GripVertical className={`w-3 h-3 ${isDragging ? 'text-white' : 'text-slate-600'}`} />
      </div>

      {/* Message Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <CommsMessageDetail
            message={selected}
            onToggleStar={toggleStar}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div>Select a message to view</div>
            </div>
          </div>
        )}
      </div>

      {renderSmsModal()}
    </div>
  );
}
