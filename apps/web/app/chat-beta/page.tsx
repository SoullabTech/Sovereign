'use client'

import { useState } from 'react'
import { Send, Mic } from 'lucide-react'

export default function ChatBetaPage() {
  const [messages, setMessages] = useState<Array<{id: string, role: string, content: string}>>([
    {
      id: '1',
      role: 'maya',
      content: "Welcome to Sacred Mirror Beta. I&apos;m Maya, your guide for inner exploration. What&apos;s on your mind today?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/maya-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentInput
        })
      })

      const data = await response.json()
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'maya',
        content: data.response || data.message || "I&apos;m here, listening deeply to what you&apos;re sharing."
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'maya',
        content: "I'm having trouble connecting. Please try again."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sacred-cosmic">
      {/* Header */}
      <div className="bg-sacred-navy/80 backdrop-blur-xl border-b border-gold-divine/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-sacred text-gold-divine">
            Sacred Mirror Beta
          </h1>
          <p className="text-sm text-neutral-silver">Maya - Your Consciousness Guide</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="sacred-card min-h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-sacred p-4 ${
                    msg.role === 'user'
                      ? 'bg-gold-divine text-sacred-cosmic font-medium'
                      : 'bg-sacred-blue/50 text-neutral-pure border border-gold-divine/10'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-sacred-blue/50 text-neutral-pure rounded-sacred p-4 border border-gold-divine/10">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gold-divine rounded-full animate-sacred-pulse"></div>
                    <div className="w-2 h-2 bg-gold-divine rounded-full animate-sacred-pulse" style={{animationDelay: '0.3s'}}></div>
                    <div className="w-2 h-2 bg-gold-divine rounded-full animate-sacred-pulse" style={{animationDelay: '0.6s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gold-divine/20 p-4">
            <div className="flex items-center space-x-3">
              <button
                className="p-3 rounded-sacred hover:bg-sacred-blue/30 transition-colors"
                title="Voice input coming soon"
              >
                <Mic className="w-5 h-5 text-gold-divine/70" />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Share what&apos;s on your mind..."
                className="flex-1 px-4 py-3 bg-sacred-blue/50 text-neutral-pure rounded-sacred focus:outline-none focus:ring-1 focus:ring-gold-divine/50 focus:border-gold-divine placeholder-neutral-mystic"
                disabled={isLoading}
              />
              
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="sacred-button p-3 rounded-sacred disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Beta Notice */}
        <div className="mt-4 text-center text-sm text-neutral-mystic">
          <p>🔮 Sacred Mirror Beta - Your consciousness shapes our evolution</p>
        </div>
      </div>
    </div>
  )
}