import React, { useState } from 'react';

interface EmergencyChatInterfaceProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export const EmergencyChatInterface: React.FC<EmergencyChatInterfaceProps> = ({
  onSendMessage,
  isProcessing
}) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            {isProcessing ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};