/**
 * Adaptive Generational UI
 * Automatically adjusts interface based on user generation and culture
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Send, Settings, Home, ArrowLeft, Menu,
  Volume2, VolumeX, HelpCircle, ChevronUp, ChevronDown,
  MessageSquare, Phone, Video, Plus, Search
} from 'lucide-react';
import { GenerationalCulturalAdaptation } from '@/lib/oracle/GenerationalCulturalAdaptation';

interface AdaptiveGenerationalUIProps {
  userGeneration?: string;
  userCulture?: string;
  onSendMessage: (message: string) => void;
}

export const AdaptiveGenerationalUI: React.FC<AdaptiveGenerationalUIProps> = ({
  userGeneration = 'genZ',
  userCulture = 'usEnglish',
  onSendMessage
}) => {
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [buttonSize, setButtonSize] = useState(48);
  const [interfaceMode, setInterfaceMode] = useState<'simple' | 'standard' | 'advanced'>('standard');

  // Get profile-based configuration
  const profile = GenerationalCulturalAdaptation.profiles[userGeneration];
  const cultural = GenerationalCulturalAdaptation.culturalContexts[userCulture];
  const config = GenerationalCulturalAdaptation.getInterfaceConfig(userGeneration);

  useEffect(() => {
    // Apply configuration
    setFontSize(config.fontSize);
    setButtonSize(config.buttonSize);

    // Set interface mode based on complexity
    switch (config.complexity) {
      case 'minimal':
        setInterfaceMode('simple');
        break;
      case 'rich':
        setInterfaceMode('advanced');
        break;
      default:
        setInterfaceMode('standard');
    }

    // Show help for certain generations
    if (profile.interfacePreferences.tutorialLevel === 'extensive') {
      setShowHelp(true);
    }
  }, [userGeneration]);

  // GEN ALPHA (Under 14) - Colorful, gamified, visual
  if (userGeneration === 'genAlpha') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-400 via-pink-400 to-blue-400 p-4">
        <div className="max-w-md mx-auto">
          {/* Fun animated character */}
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center mb-8"
          >
            <span className="text-8xl">🤖</span>
            <h1 className="text-white text-2xl font-bold mt-2">Maya Friend!</h1>
          </motion.div>

          {/* Big colorful buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-400 p-8 rounded-3xl shadow-lg"
              onClick={() => onSendMessage("I'm happy!")}
            >
              <span className="text-6xl">😊</span>
              <p className="text-lg font-bold mt-2">Happy</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-400 p-8 rounded-3xl shadow-lg"
              onClick={() => onSendMessage("I'm sad")}
            >
              <span className="text-6xl">😢</span>
              <p className="text-lg font-bold mt-2">Sad</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-400 p-8 rounded-3xl shadow-lg"
              onClick={() => onSendMessage("I'm angry")}
            >
              <span className="text-6xl">😠</span>
              <p className="text-lg font-bold mt-2">Angry</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-400 p-8 rounded-3xl shadow-lg"
              onClick={() => onSendMessage("I'm scared")}
            >
              <span className="text-6xl">😨</span>
              <p className="text-lg font-bold mt-2">Scared</p>
            </motion.button>
          </div>

          {/* Simple voice button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-full bg-amber-500 text-white p-6 rounded-full flex items-center justify-center gap-3"
          >
            <Mic className="w-8 h-8" />
            <span className="text-xl font-bold">Press to Talk!</span>
          </motion.button>
        </div>
      </div>
    );
  }

  // GEN Z (14-27) - Clean, dark mode, minimal
  if (userGeneration === 'genZ') {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-md mx-auto">
          {/* Minimal header */}
          <div className="mb-8">
            <h1 className="text-xl font-light">{cultural.preferredGreetings[0]}</h1>
          </div>

          {/* Clean input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="type here..."
              className="w-full bg-gray-900 border border-gray-800 rounded-full px-4 py-3 pr-12 focus:outline-none focus:border-amber-500 lowercase"
              style={{ fontSize }}
            />
            <button className="absolute right-2 top-2 p-2">
              <Send className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Quick responses */}
          <div className="flex gap-2 flex-wrap">
            {['mood', 'anxious', 'relationships', 'school'].map(topic => (
              <button
                key={topic}
                className="px-4 py-2 bg-gray-900 rounded-full text-sm hover:bg-gray-800"
                onClick={() => onSendMessage(`let's talk about ${topic}`)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // MILLENNIAL (28-43) - Friendly, organized, emoji-friendly
  if (userGeneration === 'millennial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 p-4">
        <div className="max-w-md mx-auto">
          {/* Friendly header with emoji */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h1 className="text-2xl font-medium flex items-center gap-2">
              <span>👋</span> {cultural.preferredGreetings[0]}!
            </h1>
            <p className="text-gray-600 mt-2">How can I support you today?</p>
          </div>

          {/* Topic cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: '💼', label: 'Work/Career' },
              { icon: '❤️', label: 'Relationships' },
              { icon: '🧠', label: 'Mental Health' },
              { icon: '👨‍👩‍👧', label: 'Family' }
            ].map(topic => (
              <button
                key={topic.label}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                onClick={() => onSendMessage(`I want to talk about ${topic.label}`)}
              >
                <span className="text-3xl">{topic.icon}</span>
                <p className="text-sm mt-2">{topic.label}</p>
              </button>
            ))}
          </div>

          {/* Message input */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share what's on your mind..."
              className="w-full resize-none p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
              style={{ fontSize }}
            />
            <div className="flex justify-between items-center mt-3">
              <button className="text-gray-500">
                <Plus className="w-5 h-5" />
              </button>
              <button className="bg-amber-500 text-white px-6 py-2 rounded-full hover:bg-amber-600">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GEN X (44-59) - Professional, structured, clear navigation
  if (userGeneration === 'genX') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Clear navigation bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Menu className="w-6 h-6" />
              <h1 className="text-lg font-semibold">Maya Wellness Assistant</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Clear sections */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">How can I help you today?</h2>

            {/* Structured options */}
            <div className="space-y-3">
              {[
                'Stress Management',
                'Work-Life Balance',
                'Family Relationships',
                'Health Concerns',
                'Life Transitions'
              ].map(option => (
                <button
                  key={option}
                  className="w-full text-left p-4 border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => onSendMessage(`I need help with ${option}`)}
                >
                  <span style={{ fontSize }}>{option}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Traditional message area */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or type your message:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              style={{ fontSize }}
            />
            <div className="mt-4 flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BOOMER (60-78) - Large text, simple layout, clear instructions
  if (userGeneration === 'boomer') {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Clear title and instructions */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Maya Health Companion</h1>
            <p className="text-lg text-gray-700">
              Click a button below to start a conversation, or type your message in the box.
            </p>
          </div>

          {/* Large, clear buttons */}
          <div className="space-y-4 mb-8">
            {[
              { icon: Phone, label: 'Talk About Health', color: 'green' },
              { icon: MessageSquare, label: 'Family Concerns', color: 'blue' },
              { icon: HelpCircle, label: 'Get Help', color: 'purple' }
            ].map(item => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-4 p-6 bg-${item.color}-50 hover:bg-${item.color}-100 border-2 border-${item.color}-200 rounded-lg`}
                onClick={() => onSendMessage(item.label)}
              >
                <item.icon className="w-8 h-8" />
                <span className="text-xl font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Simple text input */}
          <div className="border-2 border-gray-300 rounded-lg p-6">
            <label className="block text-lg font-medium mb-3">
              Type your message here:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 text-lg border-2 border-gray-300 rounded"
              rows={4}
              style={{ fontSize: fontSize + 4 }}
            />
            <button
              className="mt-4 bg-blue-600 text-white text-lg px-8 py-4 rounded hover:bg-blue-700"
              onClick={() => onSendMessage(message)}
            >
              Send Message
            </button>
          </div>

          {/* Help section */}
          {showHelp && (
            <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p>Click any button above to start, or type your question in the box.</p>
              <p className="mt-2">For technical help, call: 1-800-MAYA-HELP</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default/fallback interface
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold mb-4">{cultural.preferredGreetings[0]}</h1>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 border rounded"
          rows={4}
          style={{ fontSize }}
        />
        <button
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
          onClick={() => onSendMessage(message)}
        >
          Send
        </button>
      </div>
    </div>
  );
};

// Missing import
import { ChevronRight } from 'lucide-react';