'use client';

import {
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  CheckCheck,
  Mail,
  Phone,
  Bell,
  MessageSquare,
} from 'lucide-react';
import type { Message } from '@/lib/studio/mockMessages';

const typeConfig = {
  email: { icon: Mail, label: 'Email', color: 'blue' },
  sms: { icon: Phone, label: 'SMS', color: 'emerald' },
  notification: { icon: Bell, label: 'Notification', color: 'amber' },
  internal: { icon: MessageSquare, label: 'Internal', color: 'purple' },
};

interface Props {
  message: Message;
  onToggleStar?: (id: string) => void;
  onArchive?: (id: string) => void;
  onTrash?: (id: string) => void;
  onReply?: (id: string) => void;
  onForward?: (id: string) => void;
}

export function CommsMessageDetail({
  message,
  onToggleStar,
  onArchive,
  onTrash,
  onReply,
  onForward,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      {/* Message Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {message.type === 'sms' && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs font-medium">
                  SMS
                </span>
              )}
              <h2 className="text-lg font-semibold text-white">{message.subject}</h2>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
              <span>
                {message.status === 'sent' ? 'To' : 'From'}:{' '}
                {message.status === 'sent' && message.to ? message.to : message.from}
              </span>
              <span>•</span>
              <span>{message.timestamp}</span>
              {message.status === 'sent' && (
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
              onClick={() => onToggleStar?.(message.id)}
              className={`p-2 rounded-lg transition-colors ${
                message.starred ? 'text-amber-400' : 'text-slate-400 hover:bg-slate-800'
              }`}
              type="button"
            >
              <Star className={`w-4 h-4 ${message.starred ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => onArchive?.(message.id)}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
              type="button"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={() => onTrash?.(message.id)}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-slate-900 rounded-xl p-6">
          <p className="text-slate-300 leading-relaxed">
            {message.preview}
          </p>
          {message.content && (
            <p className="text-slate-400 mt-4 leading-relaxed">
              {message.content}
            </p>
          )}
        </div>
      </div>

      {/* Reply Area */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onReply?.(message.id)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors"
            type="button"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>
          <button
            onClick={() => onForward?.(message.id)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            type="button"
          >
            <Forward className="w-4 h-4" />
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
