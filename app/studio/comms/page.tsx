'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  MessageSquare,
  Mail,
  Bell,
  Send,
  Search,
  Filter,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreHorizontal,
  Check,
  CheckCheck,
  Clock,
  User,
  Phone,
  Plus,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Message {
  id: string;
  type: 'email' | 'sms' | 'notification' | 'internal';
  from: string;
  to?: string;
  subject: string;
  preview: string;
  content?: string;
  status: 'unread' | 'read' | 'replied' | 'archived' | 'sent';
  starred: boolean;
  timestamp: string;
  priority?: 'normal' | 'high';
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'email',
    from: 'Sarah Chen',
    subject: 'Re: Q1 Strategy Session Follow-up',
    preview: 'Thanks for the session yesterday! I had a few follow-up thoughts on the delegation framework we discussed...',
    status: 'unread',
    starred: true,
    timestamp: '10:32 AM',
    priority: 'high',
  },
  {
    id: '2',
    type: 'sms',
    from: 'You',
    to: '+1 (555) 123-4567',
    subject: 'Session Reminder',
    preview: 'Hi Sarah, this is a reminder about your session tomorrow at 2pm. Reply YES to confirm.',
    status: 'sent',
    starred: false,
    timestamp: '9:45 AM',
  },
  {
    id: '3',
    type: 'notification',
    from: 'MAIA',
    subject: 'Agent task completed',
    preview: 'The voice mode initialization fix has been completed and is ready for review.',
    status: 'unread',
    starred: false,
    timestamp: '9:30 AM',
  },
  {
    id: '4',
    type: 'email',
    from: 'Marcus Johnson',
    subject: 'Rescheduling Friday session',
    preview: 'Hi, I need to move our Friday session to next week if possible. Does Tuesday work?',
    status: 'read',
    starred: false,
    timestamp: 'Yesterday',
  },
  {
    id: '5',
    type: 'sms',
    from: '+1 (555) 987-6543',
    subject: 'Incoming SMS',
    preview: 'Yes, confirmed! See you tomorrow.',
    status: 'unread',
    starred: false,
    timestamp: 'Yesterday',
  },
  {
    id: '6',
    type: 'notification',
    from: 'System',
    subject: 'New client registration',
    preview: 'A new user has completed onboarding: Elena Rodriguez',
    status: 'read',
    starred: false,
    timestamp: 'Yesterday',
  },
  {
    id: '7',
    type: 'internal',
    from: 'Triage Queue',
    subject: 'High priority item needs attention',
    preview: 'iOS build failing on TestFlight upload has been marked as urgent.',
    status: 'replied',
    starred: true,
    timestamp: '2 days ago',
  },
];

const typeConfig = {
  email: { icon: Mail, label: 'Email', color: 'blue' },
  sms: { icon: Phone, label: 'SMS', color: 'emerald' },
  notification: { icon: Bell, label: 'Notification', color: 'amber' },
  internal: { icon: MessageSquare, label: 'Internal', color: 'purple' },
};

export default function CommsPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>('1');
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsTo, setSmsTo] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

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
        // Add sent SMS to messages list
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

  return (
    <div className="min-h-screen bg-slate-950">
      <PanelGroup direction="horizontal" className="h-screen">
        {/* Message List Panel */}
        <Panel defaultSize={30} minSize={15} maxSize={50}>
          <div className="h-full border-r border-slate-800 flex flex-col">
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

        {/* Message List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map((message) => {
            const type = typeConfig[message.type];
            const TypeIcon = type.icon;
            const isSelected = selectedMessage === message.id;

            return (
              <button
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message.id);
                  markAsRead(message.id);
                }}
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
          })}
        </div>
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-2 bg-slate-800 hover:bg-teal-500/50 transition-colors flex items-center justify-center group cursor-col-resize">
          <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-teal-400 transition-colors" />
        </PanelResizeHandle>

        {/* Message Detail Panel */}
        <Panel defaultSize={70} minSize={30}>
          <div className="h-full flex flex-col">
        {selected ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {selected.type === 'sms' && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                        SMS
                      </span>
                    )}
                    <h2 className="text-lg font-semibold text-white">{selected.subject}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <span>{selected.status === 'sent' ? 'To' : 'From'}: {selected.status === 'sent' && selected.to ? selected.to : selected.from}</span>
                    <span>•</span>
                    <span>{selected.timestamp}</span>
                    {selected.status === 'sent' && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCheck className="w-3 h-3" />
                          Sent
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStar(selected.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      selected.starred ? 'text-amber-400' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${selected.starred ? 'fill-amber-400' : ''}`} />
                  </button>
                  <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="bg-slate-900 rounded-xl p-6">
                <p className="text-slate-300 leading-relaxed">
                  {selected.preview}
                </p>
                <p className="text-slate-400 mt-4 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
              </div>
            </div>

            {/* Reply Area */}
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors">
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                  <Forward className="w-4 h-4" />
                  Forward
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div>Select a message to view</div>
            </div>
          </div>
        )}
          </div>
        </Panel>
      </PanelGroup>

      {/* SMS Compose Modal */}
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
              {/* Modal Header */}
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

              {/* Modal Body */}
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

              {/* Modal Footer */}
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
    </div>
  );
}
