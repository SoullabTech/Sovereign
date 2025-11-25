'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface EmergencyChatInterfaceProps {
  onSendMessage?: (message: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
}

export function EmergencyChatInterface({
  onSendMessage,
  onClose,
  isOpen = false,
  className = ''
}: EmergencyChatInterfaceProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message.trim());
      setMessage('');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`
      fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg
      z-50 ${className}
    `}>
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-gray-900">Emergency Chat</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}