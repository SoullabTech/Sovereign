'use client';

/**
 * MODEL STUDIO - Communications Page
 *
 * Demo messaging hub with sample conversations
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Star,
  Archive,
  Filter,
} from 'lucide-react';

const demoConversations = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    avatar: 'SM',
    lastMessage: 'Thank you for the session yesterday. The breathing exercises really helped!',
    time: '10 min ago',
    unread: 2,
    status: 'online',
  },
  {
    id: '2',
    name: 'James Roberts',
    avatar: 'JR',
    lastMessage: 'Can we reschedule Thursday to Friday? I have a work conflict.',
    time: '1 hr ago',
    unread: 1,
    status: 'offline',
  },
  {
    id: '3',
    name: 'Emily Chen',
    avatar: 'EC',
    lastMessage: 'The homework exercises are really helping! I wanted to share...',
    time: '3 hr ago',
    unread: 0,
    status: 'offline',
  },
  {
    id: '4',
    name: 'Michael Thompson',
    avatar: 'MT',
    lastMessage: 'Looking forward to our first session on Friday.',
    time: 'Yesterday',
    unread: 0,
    status: 'offline',
  },
  {
    id: '5',
    name: 'David Kim',
    avatar: 'DK',
    lastMessage: 'I completed the journaling assignment you suggested.',
    time: '2 days ago',
    unread: 0,
    status: 'offline',
  },
];

const demoMessages = [
  {
    id: '1',
    sender: 'client',
    text: 'Hi! I wanted to thank you for yesterday\'s session.',
    time: '2:15 PM',
    status: 'read',
  },
  {
    id: '2',
    sender: 'client',
    text: 'The breathing exercises you taught me really helped when I felt anxious this morning.',
    time: '2:16 PM',
    status: 'read',
  },
  {
    id: '3',
    sender: 'practitioner',
    text: 'That\'s wonderful to hear, Sarah! I\'m so glad they\'re helping. Remember, consistency is key - try to practice them at least once a day, even when you\'re not feeling anxious.',
    time: '2:30 PM',
    status: 'read',
  },
  {
    id: '4',
    sender: 'client',
    text: 'I will! I\'ve been setting reminders on my phone.',
    time: '2:32 PM',
    status: 'read',
  },
  {
    id: '5',
    sender: 'client',
    text: 'Also, I wanted to ask about the journaling exercise - should I focus more on the feelings or the situations?',
    time: '2:45 PM',
    status: 'read',
  },
  {
    id: '6',
    sender: 'practitioner',
    text: 'Great question! For now, focus on both - describe the situation briefly, then spend more time exploring the feelings that came up. We\'ll discuss your entries in our next session.',
    time: '3:00 PM',
    status: 'delivered',
  },
];

export default function ModelCommsPage() {
  const [selectedConvo, setSelectedConvo] = useState(demoConversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConvos = demoConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = demoConversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex">
      {/* Conversations List */}
      <div className="w-80 border-r border-slate-800/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">Messages</h1>
              <p className="text-sm text-slate-500">{totalUnread} unread</p>
            </div>
            <button className="p-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvos.map((convo) => (
            <button
              key={convo.id}
              onClick={() => setSelectedConvo(convo)}
              className={`w-full p-4 flex items-center gap-3 border-b border-slate-800/30 transition-colors ${
                selectedConvo.id === convo.id ? 'bg-amber-500/10' : 'hover:bg-slate-800/30'
              }`}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium ${
                  convo.unread > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'
                }`}>
                  {convo.avatar}
                </div>
                {convo.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1a1a2e]" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${convo.unread > 0 ? 'text-white' : 'text-slate-300'}`}>
                    {convo.name}
                  </span>
                  <span className="text-xs text-slate-500">{convo.time}</span>
                </div>
                <p className={`text-sm truncate ${convo.unread > 0 ? 'text-slate-300' : 'text-slate-500'}`}>
                  {convo.lastMessage}
                </p>
              </div>
              {convo.unread > 0 && (
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                  {convo.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-medium">
              {selectedConvo.avatar}
            </div>
            <div>
              <h2 className="font-medium text-white">{selectedConvo.name}</h2>
              <p className="text-xs text-slate-500">
                {selectedConvo.status === 'online' ? 'Online' : 'Last seen ' + selectedConvo.time}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Star className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-center text-xs text-slate-500 py-4">Today</div>
          {demoMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'practitioner' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-3 rounded-2xl ${
                msg.sender === 'practitioner'
                  ? 'bg-amber-500/20 text-white rounded-br-sm'
                  : 'bg-slate-800 text-slate-200 rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${
                  msg.sender === 'practitioner' ? 'justify-end' : 'justify-start'
                }`}>
                  <span className="text-xs text-slate-500">{msg.time}</span>
                  {msg.sender === 'practitioner' && (
                    msg.status === 'read' ? (
                      <CheckCheck className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Check className="w-3 h-3 text-slate-500" />
                    )
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            <button className="p-3 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
