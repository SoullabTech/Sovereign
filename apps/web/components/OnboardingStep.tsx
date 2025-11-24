"use client";

import { ElementIcon } from "./ElementIcon";

interface OnboardingData {
  name: string;
  email: string;
  spiritualBackground: "beginner" | "intermediate" | "advanced" | "";
  guidanceAreas: string[];
  guidanceTypes: string[];
  elementalPreferences: ("fire" | "water" | "earth" | "air" | "aether")[];
  intentions: string;
  communicationStyle: "direct" | "gentle" | "ceremonial" | "conversational" | "";
}

interface Props {
  step: string;
  stepIndex: number;
  data: OnboardingData;
  onNext: () => void;
  onPrev: () => void;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onComplete: () => void;
  isLastStep: boolean;
}

export default function OnboardingStep({ 
  step, 
  stepIndex, 
  data, 
  onNext, 
  onPrev, 
  onUpdate, 
  onComplete, 
  isLastStep 
}: Props) {

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const renderStepContent = () => {
    switch (stepIndex) {
      case 0: // Welcome
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Your Journey</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We&apos;ll help you create a personalized oracle experience that grows with your needs. 
              This process takes about 5 minutes and helps us understand your preferences.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={data.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email address"
                value={data.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 1: // Background
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Spiritual Background</h2>
            <p className="text-gray-600 mb-6">What best describes your experience with spiritual or personal development practices?</p>
            <div className="space-y-3">
              {[
                { value: "beginner", label: "New to spiritual practices", desc: "Just starting to explore" },
                { value: "intermediate", label: "Some experience", desc: "Have tried various approaches" },
                { value: "advanced", label: "Experienced practitioner", desc: "Regular practice for years" }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => onUpdate({ spiritualBackground: option.value as any })}
                  className={`w-full p-4 text-left border rounded-lg transition ${
                    data.spiritualBackground === option.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2: // Areas for Guidance
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Areas for Guidance</h2>
            <p className="text-gray-600 mb-6">Which life areas would you most like guidance on? (Select all that apply)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Relationships", "Career & Purpose", "Personal Growth", "Decision Making",
                "Emotional Healing", "Creativity", "Life Transitions", "Spiritual Development"
              ].map(area => (
                <button
                  key={area}
                  onClick={() => onUpdate({ guidanceAreas: toggleArrayItem(data.guidanceAreas, area) })}
                  className={`p-3 text-left border rounded-lg transition ${
                    data.guidanceAreas.includes(area)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        );

      case 3: // Types of Guidance
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Types of Guidance</h2>
            <p className="text-gray-600 mb-6">What styles of guidance resonate most with you?</p>
            <div className="space-y-3">
              {[
                { value: "direct", label: "Direct & Clear", desc: "Straightforward advice and insights" },
                { value: "gentle", label: "Gentle & Supportive", desc: "Nurturing and encouraging approach" },
                { value: "ceremonial", label: "Ceremonial & Ritual", desc: "Sacred, formal guidance style" },
                { value: "conversational", label: "Conversational", desc: "Natural dialogue and exploration" }
              ].map(style => (
                <button
                  key={style.value}
                  onClick={() => onUpdate({ communicationStyle: style.value as any })}
                  className={`w-full p-4 text-left border rounded-lg transition ${
                    data.communicationStyle === style.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{style.label}</div>
                  <div className="text-sm text-gray-500">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4: // Elemental Preferences
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Elemental Preferences</h2>
            <p className="text-gray-600 mb-6">Which elements do you feel drawn to? These influence your oracle&apos;s perspective.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { value: "fire", label: "Fire", desc: "Passion, transformation, action", color: "text-red-500" },
                { value: "water", label: "Water", desc: "Emotion, intuition, flow", color: "text-blue-500" },
                { value: "earth", label: "Earth", desc: "Grounding, stability, growth", color: "text-green-500" },
                { value: "air", label: "Air", desc: "Clarity, communication, ideas", color: "text-indigo-500" },
                { value: "aether", label: "Spirit", desc: "Unity, transcendence, wisdom", color: "text-amber-500" }
              ].map(element => (
                <button
                  key={element.value}
                  onClick={() => onUpdate({ 
                    elementalPreferences: toggleArrayItem(data.elementalPreferences, element.value as any) 
                  })}
                  className={`p-4 border rounded-lg transition text-left ${
                    data.elementalPreferences.includes(element.value as any)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <ElementIcon type={element.value as any} />
                    <span className={`ml-2 font-medium ${element.color}`}>{element.label}</span>
                  </div>
                  <div className="text-sm text-gray-500">{element.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5: // Intentions
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Intentions</h2>
            <p className="text-gray-600 mb-6">What do you hope to gain from working with your oracle?</p>
            <textarea
              value={data.intentions}
              onChange={(e) => onUpdate({ intentions: e.target.value })}
              placeholder="Share your intentions, hopes, or what brought you here..."
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Your Oracle Profile</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Background:</strong> {data.spiritualBackground || 'Not selected'}</div>
                <div><strong>Communication:</strong> {data.communicationStyle || 'Not selected'}</div>
                <div><strong>Elements:</strong> {data.elementalPreferences.join(', ') || 'None selected'}</div>
                <div><strong>Guidance Areas:</strong> {data.guidanceAreas.slice(0, 3).join(', ')}{data.guidanceAreas.length > 3 ? '...' : ''}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (stepIndex) {
      case 0: return data.name.trim() && data.email.trim();
      case 1: return data.spiritualBackground !== "";
      case 2: return data.guidanceAreas.length > 0;
      case 3: return data.communicationStyle !== "";
      case 4: return data.elementalPreferences.length > 0;
      case 5: return data.intentions.trim() !== "";
      default: return true;
    }
  };

  return (
    <div className="p-6 border rounded-xl shadow-lg bg-white">
      {renderStepContent()}

      <div className="mt-8 flex justify-between">
        <button
          onClick={onPrev}
          disabled={stepIndex === 0}
          className={`px-4 py-2 rounded-lg transition ${
            stepIndex === 0 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Back
        </button>
        
        {isLastStep ? (
          <button
            onClick={onComplete}
            disabled={!canProceed()}
            className={`px-6 py-2 rounded-lg transition ${
              canProceed()
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Complete Setup
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!canProceed()}
            className={`px-4 py-2 rounded-lg transition ${
              canProceed()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}