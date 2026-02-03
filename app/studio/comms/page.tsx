'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';

interface Message {
  id: string;
  type: 'email' | 'notification' | 'internal';
  from: string;
  subject: string;
  preview: string;
  content?: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
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
    type: 'notification',
    from: 'MAIA',
    subject: 'Agent task completed',
    preview: 'The voice mode initialization fix has been completed and is ready for review.',
    status: 'unread',
    starred: false,
    timestamp: '9:45 AM',
  },
  {
    id: '3',
    type: 'email',
    from: 'Marcus Johnson',
    subject: 'Rescheduling Friday session',
    preview: 'Hi, I need to move our Friday session to next week if possible. Does Tuesday work?',
    status: 'read',
    starred: false,
    timestamp: 'Yesterday',
  },
  {
    id: '4',
    type: 'notification',
    from: 'System',
    subject: 'New client registration',
    preview: 'A new user has completed onboarding: Elena Rodriguez',
    status: 'read',
    starred: false,
    timestamp: 'Yesterday',
  },
  {
    id: '5',
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
  notification: { icon: Bell, label: 'Notification', color: 'amber' },
  internal: { icon: MessageSquare, label: 'Internal', color: 'purple' },
};

export default function CommsPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>('1');

  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const starredCount = messages.filter(m => m.starred).length;

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

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Message List */}
      <div className="w-96 border-r border-slate-800 flex flex-col">
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
              <Star className="w-3 h-3" />
              {starredCount} starred
            </span>
          </div>
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
          {['all', 'unread', 'starred', 'email', 'notification'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
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
                    ${type.color === 'amber' ? 'bg-amber-500/20' : ''}
                    ${type.color === 'purple' ? 'bg-purple-500/20' : ''}
                  `}>
                    <TypeIcon className={`w-4 h-4
                      ${type.color === 'blue' ? 'text-blue-400' : ''}
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
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {message.preview}
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

      {/* Message Detail */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{selected.subject}</h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <span>From: {selected.from}</span>
                    <span>•</span>
                    <span>{selected.timestamp}</span>
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
    </div>
  );
}
