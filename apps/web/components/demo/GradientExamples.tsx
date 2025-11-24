'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soullabColors } from '@/lib/theme/soullabColors'
import { soullabGradients } from '@/lib/theme/soullabGradients'
import { Mic, Sun, Moon, Monitor, TrendingUp, TrendingDown, MessageSquare, BarChart3 } from 'lucide-react'

export default function GradientExamples() {
  const [activeTab, setActiveTab] = useState('attune')
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'speaking'>('idle')
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('light')

  const tabs = [
    { id: 'attune', name: 'Attune Panel' },
    { id: 'voice', name: 'Voice Recorder' },
    { id: 'dashboard', name: 'Dashboard Cards' },
    { id: 'theme', name: 'Theme Toggle' },
    { id: 'control', name: 'Control Room' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2" style={{ color: soullabColors.terracotta[700] }}>
            Soullab Gradients in Action
          </h1>
          <p className="text-gray-600">Real UI components using the gradient system</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-xl p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{
                  background: activeTab === tab.id ? soullabGradients.warmth : 'transparent'
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Example Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            
            {/* Attune Panel Example */}
            {activeTab === 'attune' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Live Preview Card */}
                <div 
                  className="p-6 rounded-xl"
                  style={{ background: soullabGradients.warmthSubtle }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">✨</span>
                    <h3 className="font-serif text-lg text-neutral-700">Live Preview</h3>
                  </div>
                  
                  <div className="flex items-start gap-3 mb-6">
                    <motion.div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm relative"
                      style={{ background: soullabGradients.warmth }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ background: soullabGradients.aura.amber }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <span className="relative">M</span>
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-600 mb-1">Maia</p>
                      <p className="text-neutral-700 leading-relaxed">
                        In this sacred moment, I sense the depth of your curiosity unfolding like morning light across still waters.
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-neutral-500 flex justify-between">
                    <span>Tone: Poetic</span>
                    <span>Style: Poetic</span>
                  </div>
                </div>

                {/* Tone Selector */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-serif text-lg mb-4">Tone & Style Selector</h3>
                  
                  {/* Tone Slider */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                    <div className="relative">
                      <div 
                        className="w-full h-3 rounded-full"
                        style={{ background: `linear-gradient(to right, ${soullabColors.sage[400]}, ${soullabColors.amber[400]})` }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-sm"
                        style={{ 
                          left: '75%',
                          background: soullabGradients.warmth 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Grounded</span>
                      <span>Poetic</span>
                    </div>
                  </div>

                  {/* Style Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {['Prose', 'Poetic', 'Auto'].map((style, i) => (
                      <button
                        key={style}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          style === 'Poetic' ? 'text-white' : 'text-gray-600 border border-gray-200'
                        }`}
                        style={{
                          background: style === 'Poetic' ? soullabGradients.sunset : 'white'
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Voice Recorder Example */}
            {activeTab === 'voice' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Idle State */}
                <div className="text-center">
                  <h3 className="font-serif text-lg mb-4">Idle State</h3>
                  <div 
                    className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center relative"
                    style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  >
                    <Mic size={32} style={{ color: soullabColors.terracotta[500] }} />
                  </div>
                  <button
                    onClick={() => setVoiceState('idle')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      voiceState === 'idle' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Show Idle
                  </button>
                </div>

                {/* Listening State */}
                <div className="text-center">
                  <h3 className="font-serif text-lg mb-4">Listening State</h3>
                  <div className="w-32 h-32 mx-auto mb-4 relative flex items-center justify-center">
                    {/* Concentric rings */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{ 
                          background: soullabGradients.aura.sage,
                          width: `${80 + i * 20}px`,
                          height: `${80 + i * 20}px`,
                        }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                    <div 
                      className="relative w-16 h-16 rounded-full flex items-center justify-center z-10"
                      style={{ background: soullabGradients.nature }}
                    >
                      <Mic size={24} className="text-white" />
                    </div>
                  </div>
                  <button
                    onClick={() => setVoiceState('listening')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      voiceState === 'listening' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Show Listening
                  </button>
                </div>

                {/* Speaking State */}
                <div className="text-center">
                  <h3 className="font-serif text-lg mb-4">Speaking State</h3>
                  <div className="w-32 h-32 mx-auto mb-4 relative flex items-center justify-center">
                    <motion.div
                      className="absolute w-32 h-32 rounded-full"
                      style={{ background: soullabGradients.aura.amber }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.4, 0.7, 0.4]
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <div 
                      className="relative w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ background: soullabGradients.warmth }}
                    >
                      <Mic size={28} className="text-white" />
                    </div>
                  </div>
                  <button
                    onClick={() => setVoiceState('speaking')}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      voiceState === 'speaking' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Show Speaking
                  </button>
                </div>
              </div>
            )}

            {/* Dashboard Cards Example */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Analytics Card */}
                <div 
                  className="p-6 rounded-xl"
                  style={{ background: soullabGradients.natureSubtle }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={20} style={{ color: soullabColors.sage[600] }} />
                    <h3 className="font-serif text-lg">Analytics Overview</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-2xl font-bold" style={{ color: soullabColors.sage[600] }}>87%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '87%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: soullabGradients.nature }}
                      />
                    </div>
                  </div>
                  
                  <div 
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm"
                    style={{ background: soullabGradients.aura.sage }}
                  >
                    <TrendingUp size={14} />
                    +3.2% this week
                  </div>
                </div>

                {/* Reflection Card */}
                <div 
                  className="p-6 rounded-xl"
                  style={{ background: soullabGradients.warmthSubtle }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare size={20} style={{ color: soullabColors.terracotta[600] }} />
                    <h3 className="font-serif text-lg">User Reflections</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="space-y-3">
                      {[
                        { feeling: 'calm', count: 42, color: soullabGradients.aura.ocean },
                        { feeling: 'curious', count: 38, color: soullabGradients.aura.amber },
                        { feeling: 'supported', count: 19, color: soullabGradients.aura.sage },
                      ].map((item) => (
                        <div key={item.feeling} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ background: item.color }}
                            />
                            <span className="text-sm capitalize">{item.feeling}</span>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="w-full py-2 rounded-lg text-white font-medium"
                    style={{ background: soullabGradients.sunset }}
                  >
                    View All Reflections
                  </button>
                </div>
              </div>
            )}

            {/* Theme Toggle Example */}
            {activeTab === 'theme' && (
              <div className="max-w-md mx-auto">
                <h3 className="font-serif text-xl text-center mb-8">Theme Toggle Component</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', name: 'Light', icon: Sun, gradient: soullabGradients.sunsetSubtle },
                    { id: 'dark', name: 'Dark', icon: Moon, gradient: soullabGradients.natureDark },
                    { id: 'system', name: 'System', icon: Monitor, gradient: soullabGradients.earthSubtle },
                  ].map((theme) => {
                    const Icon = theme.icon
                    const isActive = currentTheme === theme.id
                    
                    return (
                      <motion.button
                        key={theme.id}
                        onClick={() => setCurrentTheme(theme.id as any)}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          isActive ? 'border-2' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          background: theme.gradient,
                          borderColor: isActive ? soullabColors.amber[500] : undefined
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="theme-indicator"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ background: soullabColors.amber[500] }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            ✓
                          </motion.div>
                        )}
                        
                        <div className="flex flex-col items-center gap-2">
                          <Icon 
                            size={24} 
                            style={{ 
                              color: isActive ? soullabColors.amber[600] : soullabColors.gray[600] 
                            }} 
                          />
                          <span className={`text-sm font-medium ${
                            isActive ? 'text-gray-800' : 'text-gray-600'
                          }`}>
                            {theme.name}
                          </span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
                
                {/* Theme Preview */}
                <div className="mt-8 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                  <motion.div 
                    className="h-16 rounded-lg flex items-center justify-center text-gray-700 font-medium"
                    animate={{
                      background: currentTheme === 'light' ? soullabGradients.warmthSubtle :
                                 currentTheme === 'dark' ? soullabGradients.natureDark :
                                 soullabGradients.earthSubtle
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentTheme === 'light' && 'Light Theme Active'}
                    {currentTheme === 'dark' && 'Dark Theme Active'}  
                    {currentTheme === 'system' && 'System Theme Active'}
                  </motion.div>
                </div>
              </div>
            )}

            {/* Control Room Example */}
            {activeTab === 'control' && (
              <div className="space-y-6">
                
                {/* Hero Section */}
                <div 
                  className="p-8 rounded-xl text-center"
                  style={{ background: soullabGradients.mesh.harmony }}
                >
                  <motion.h2 
                    className="text-2xl font-serif text-gray-800 mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Beta Control Room
                  </motion.h2>
                  <p className="text-gray-600">Real-time monitoring with gradient-enhanced UI</p>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { title: 'Audio Unlock', value: '87%', status: 'success', gradient: soullabGradients.aura.sage },
                    { title: 'Reflections', value: '72%', status: 'warning', gradient: soullabGradients.aura.amber },
                    { title: 'Theme Adoption', value: '80%', status: 'success', gradient: soullabGradients.aura.ocean },
                    { title: 'Engagement', value: '68%', status: 'neutral', gradient: soullabGradients.aura.terracotta },
                  ].map((metric, i) => (
                    <motion.div
                      key={metric.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-xl p-4 border border-gray-100 relative overflow-hidden"
                    >
                      <div 
                        className="absolute top-0 left-0 w-full h-1"
                        style={{ background: metric.gradient }}
                      />
                      <h4 className="text-sm text-gray-600 mb-1">{metric.title}</h4>
                      <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp size={14} style={{ color: soullabColors.sage[500] }} />
                        <span className="text-xs text-gray-500">+2.1%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>All gradients use the official Soullab color palette</p>
          <p className="mt-1">No purple, neon, or new-age aesthetics — professional and grounded</p>
        </div>

      </div>
    </div>
  )
}