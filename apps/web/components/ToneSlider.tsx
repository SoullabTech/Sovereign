"use client";

import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, BookOpen, Zap } from 'lucide-react';

interface ToneSliderProps {
  value: number; // 0-1 scale
  onChange: (value: number) => void;
  onPreview?: (tone: number) => void;
  showLabels?: boolean;
  showPreview?: boolean;
  disabled?: boolean;
}

export default function ToneSlider({
  value,
  onChange,
  onPreview,
  showLabels = true,
  showPreview = false,
  disabled = false
}: ToneSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    onChange(newValue);
    
    // Debounced preview
    if (showPreview && onPreview) {
      setTimeout(() => onPreview(newValue), 300);
    }
  };

  const getToneLabel = (tone: number): string => {
    if (tone <= 0.2) return "Direct & Clear";
    if (tone <= 0.4) return "Grounded";
    if (tone <= 0.6) return "Balanced";
    if (tone <= 0.8) return "Poetic";
    return "Mythic & Lyrical";
  };

  const getToneColor = (tone: number): string => {
    if (tone <= 0.2) return "from-slate-500 to-slate-600";
    if (tone <= 0.4) return "from-green-500 to-green-600";
    if (tone <= 0.6) return "from-blue-500 to-blue-600";
    if (tone <= 0.8) return "from-amber-500 to-amber-600";
    return "from-pink-500 to-amber-600";
  };

  const getToneIcon = (tone: number) => {
    if (tone <= 0.3) return <BookOpen className="w-4 h-4" />;
    if (tone <= 0.7) return <Volume2 className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  // Sample greetings for each tone level
  const getSampleGreeting = (tone: number): string => {
    if (tone <= 0.2) {
      return "Morning check-in. Your energy is strong. What's present for you?";
    } else if (tone <= 0.4) {
      return "Good morning. Fire is giving you momentum today. How's your energy?";
    } else if (tone <= 0.6) {
      return "Morning light arrives. Your Fire energy stirs with purpose. What needs attention?";
    } else if (tone <= 0.8) {
      return "☀️ Dawn's promise unfolds. 🔥 Sacred fire awakens within. What medicine do you carry?";
    } else {
      return "✨ The spiral greets you. 🔥 Phoenix stirrings — ancient flames remember your name. What sacred work calls?";
    }
  };

  return (
    <div className={`tone-slider-container ${disabled ? 'opacity-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getToneIcon(localValue)}
          <span className="text-sm font-medium text-white">
            Voice Tone
          </span>
        </div>
        <span className={`text-sm font-medium bg-gradient-to-r ${getToneColor(localValue)} bg-clip-text text-transparent`}>
          {getToneLabel(localValue)}
        </span>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Background Track */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          {/* Gradient fill */}
          <div 
            className={`h-full bg-gradient-to-r ${getToneColor(localValue)} transition-all duration-300`}
            style={{ width: `${localValue * 100}%` }}
          />
        </div>

        {/* Slider Input (invisible, for interaction) */}
        <input
          type="range"
          min="0"
          max="100"
          value={localValue * 100}
          onChange={(e) => handleChange(parseInt(e.target.value) / 100)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />

        {/* Custom Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg transition-transform ${
            isDragging ? 'scale-125' : 'scale-100'
          }`}
          style={{ left: `calc(${localValue * 100}% - 8px)` }}
        >
          <div className={`absolute inset-1 rounded-full bg-gradient-to-r ${getToneColor(localValue)}`} />
        </div>
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Grounded</span>
          <span>Balanced</span>
          <span>Poetic</span>
        </div>
      )}

      {/* Preset Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => handleChange(0.1)}
          disabled={disabled}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            localValue <= 0.3
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Direct
        </button>
        <button
          onClick={() => handleChange(0.5)}
          disabled={disabled}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            localValue > 0.3 && localValue <= 0.7
              ? 'bg-blue-700 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Balanced
        </button>
        <button
          onClick={() => handleChange(0.9)}
          disabled={disabled}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            localValue > 0.7
              ? 'bg-amber-700 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Mythic
        </button>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-medium text-slate-400">Sample Greeting</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed italic">
            "{getSampleGreeting(localValue)}"
          </p>
        </div>
      )}

      {/* Adaptive Learning Note */}
      <div className="mt-4 p-2 bg-blue-900/20 rounded-lg border border-blue-800/30">
        <p className="text-xs text-blue-300 leading-relaxed">
          💡 Maya learns your preference over time. If you consistently engage better with one tone, 
          she&apos;ll gradually adjust to match your style.
        </p>
      </div>
    </div>
  );
}