/**
 * Daily Reflection Ritual Component
 * Subtle introduction of elemental wisdom through accessible language
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Droplets, Mountain, Wind, Sparkles } from 'lucide-react';

interface ElementalPrompt {
  element: string;
  icon: React.ReactNode;
  prompt: string;
  color: string;
  bgGradient: string;
}

const elementalPrompts: ElementalPrompt[] = [
  {
    element: 'fire',
    icon: <Flame className="w-5 h-5" />,
    prompt: "What lit you up today?",
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-red-50'
  },
  {
    element: 'water',
    icon: <Droplets className="w-5 h-5" />,
    prompt: "What moved you emotionally?",
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-cyan-50'
  },
  {
    element: 'earth',
    icon: <Mountain className="w-5 h-5" />,
    prompt: "What grounded you?",
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50'
  },
  {
    element: 'air',
    icon: <Wind className="w-5 h-5" />,
    prompt: "What thoughts kept returning?",
    color: 'text-slate-600',
    bgGradient: 'from-slate-50 to-gray-50'
  },
  {
    element: 'aether',
    icon: <Sparkles className="w-5 h-5" />,
    prompt: "What felt magical or connected?",
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-pink-50'
  }
];

interface DailyReflectionRitualProps {
  userLevel: number;
  onComplete: (reflections: Record<string, string>) => void;
  previousReflections?: Record<string, string>;
}

export function DailyReflectionRitual({ 
  userLevel, 
  onComplete,
  previousReflections = {}
}: DailyReflectionRitualProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>(previousReflections);
  const [inputValue, setInputValue] = useState('');
  const [showElemental, setShowElemental] = useState(userLevel >= 7);
  const [ritualMode, setRitualMode] = useState<'quick' | 'elemental' | 'deep'>('quick');

  const currentPrompt = elementalPrompts[currentPromptIndex];

  // Progressive unlocking of ritual depth
  useEffect(() => {
    if (userLevel >= 7 && !showElemental) {
      setShowElemental(true);
    }
  }, [userLevel, showElemental]);

  const handleResponse = () => {
    if (!inputValue.trim()) return;

    const newResponses = {
      ...responses,
      [currentPrompt.element]: inputValue
    };
    setResponses(newResponses);
    setInputValue('');

    if (currentPromptIndex < elementalPrompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else {
      onComplete(newResponses);
    }
  };

  const handleQuickReflection = () => {
    const quickPrompt = "How are you feeling right now?";
    // Quick reflection flow
  };

  const renderModeSelection = () => (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-medium mb-4">Morning Reflection</h3>
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setRitualMode('quick')}
        >
          <div className="w-2 h-2 rounded-full bg-gray-400 mr-3" />
          Quick Check-in (30 seconds)
        </Button>
        
        {showElemental && (
          <Button
            variant="outline"
            className="w-full justify-start border-amber-200 hover:bg-amber-50"
            onClick={() => setRitualMode('elemental')}
          >
            <div className="w-2 h-2 rounded-full bg-amber-400 mr-3 animate-pulse" />
            Elemental Scan (2 minutes)
            <span className="ml-auto text-xs text-amber-600">NEW</span>
          </Button>
        )}
        
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setRitualMode('deep')}
        >
          <div className="w-2 h-2 rounded-full bg-gray-600 mr-3" />
          Deep Dive (5+ minutes)
        </Button>
      </div>
    </Card>
  );

  const renderElementalReflection = () => (
    <Card className={`p-6 max-w-md mx-auto  ${currentPrompt.bgGradient}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`${currentPrompt.color}`}>
            {currentPrompt.icon}
          </div>
          <h3 className={`text-lg font-medium ${currentPrompt.color}`}>
            {currentPrompt.prompt}
          </h3>
        </div>
        
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Share what comes up for you..."
          className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.shiftKey === false) {
              e.preventDefault();
              handleResponse();
            }
          }}
        />
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {elementalPrompts.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentPromptIndex ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={handleResponse}
            disabled={!inputValue.trim()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {currentPromptIndex < elementalPrompts.length - 1 ? 'Next' : 'Complete'}
          </Button>
        </div>
      </div>
    </Card>
  );

  if (!ritualMode) {
    return renderModeSelection();
  }

  if (ritualMode === 'elemental') {
    return renderElementalReflection();
  }

  // Placeholder for other modes
  return (
    <Card className="p-6 max-w-md mx-auto">
      <p>Other reflection modes coming soon...</p>
      <Button onClick={() => setRitualMode(null)}>Back</Button>
    </Card>
  );
}