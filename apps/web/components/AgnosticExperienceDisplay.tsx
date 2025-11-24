/**
 * Agnostic Experience Display - Non-judgmental Experience Explorer
 * 
 * Displays agnostic framework responses using the "Describe, Don't Ascribe" principle.
 * Offers multiple perspective lenses without favoring any particular worldview.
 */

'use client';

import React, { useState } from 'react';
import type { AgnosticExperience } from '../backend/src/core/AgnosticExperienceFramework';

interface AgnosticExperienceDisplayProps {
  experience: AgnosticExperience;
  safetyLevel: 'green' | 'yellow' | 'red';
  safetyInterventions?: string[];
  onRequestGrounding?: () => void;
  onRequestResources?: () => void;
}

export function AgnosticExperienceDisplay({
  experience,
  safetyLevel,
  safetyInterventions = [],
  onRequestGrounding,
  onRequestResources
}: AgnosticExperienceDisplayProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedPerspective, setSelectedPerspective] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const safetyColors = {
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50'
  };

  const safetyTextColors = {
    green: 'text-green-800',
    yellow: 'text-yellow-800',
    red: 'text-red-800'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Safety Banner */}
      {safetyLevel !== 'green' && (
        <div className={`p-4 rounded-lg border-l-4 ${safetyColors[safetyLevel]}`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`font-semibold ${safetyTextColors[safetyLevel]} mb-2`}>
                {safetyLevel === 'red' ? 'Safety Priority Mode' : 'Enhanced Safety Monitoring'}
              </h3>
              {safetyInterventions.length > 0 && (
                <div className="space-y-1">
                  {safetyInterventions.map((intervention, index) => (
                    <p key={index} className={`text-sm ${safetyTextColors[safetyLevel]}`}>
                      • {intervention}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              {onRequestGrounding && (
                <button
                  onClick={onRequestGrounding}
                  className="px-3 py-1 text-xs bg-white border border-current rounded hover:bg-gray-50"
                >
                  Grounding Practice
                </button>
              )}
              {onRequestResources && (
                <button
                  onClick={onRequestResources}
                  className="px-3 py-1 text-xs bg-white border border-current rounded hover:bg-gray-50"
                >
                  Resources
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Experience Observation */}
      <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Experience Observation</h2>
          <p className="text-gray-700 leading-relaxed">{experience.observation}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">{experience.pattern_description}</p>
        </div>

        {/* Validation and Autonomy */}
        <div className="border-t pt-4 space-y-2">
          <p className="text-blue-700 font-medium">{experience.validation}</p>
          <p className="text-gray-600 text-sm italic">{experience.autonomy}</p>
        </div>
      </div>

      {/* Perspective Lenses */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Multiple Perspective Lenses</h3>
          <p className="text-gray-600 text-sm">Choose how you&apos;d like to explore this experience - all perspectives are equally valid.</p>
        </div>

        <div className="p-4 space-y-3">
          {Object.entries(experience.perspective_lenses).map(([perspective, description]) => (
            <div key={perspective} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setSelectedPerspective(selectedPerspective === perspective ? null : perspective)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg ${
                  selectedPerspective === perspective ? 'bg-blue-50 border-b border-gray-200' : ''
                }`}
              >
                <span className="font-medium text-gray-800 capitalize">
                  {perspective.replace('_', ' ')} Perspective
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    selectedPerspective === perspective ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {selectedPerspective === perspective && (
                <div className="px-4 pb-4 bg-gray-50 rounded-b-lg">
                  <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exploration Options */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <button
          onClick={() => toggleSection('exploration')}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800">Exploration Options</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSection === 'exploration' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'exploration' && (
          <div className="px-6 pb-4 border-t border-gray-200">
            <div className="space-y-3 mt-4">
              {experience.exploration_options.map((option, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-blue-600 text-xs font-semibold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{option}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Practical Approaches */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <button
          onClick={() => toggleSection('practices')}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800">Practical Approaches</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSection === 'practices' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'practices' && (
          <div className="px-6 pb-4 border-t border-gray-200">
            <div className="space-y-3 mt-4">
              {experience.practices.map((practice, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{practice}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grounding and Reality Bridges */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <button
          onClick={() => toggleSection('grounding')}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800">Staying Grounded</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSection === 'grounding' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'grounding' && (
          <div className="px-6 pb-4 border-t border-gray-200">
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Grounding Reminders:</h4>
                <div className="space-y-2">
                  {experience.grounding_reminders.map((reminder, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-700 text-sm">{reminder}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Reality Check Questions:</h4>
                <div className="space-y-2">
                  {experience.reality_bridges.map((bridge, index) => (
                    <div key={index} className="flex items-start p-2 bg-blue-50 rounded">
                      <span className="text-blue-600 mr-2">?</span>
                      <p className="text-gray-700 text-sm italic">{bridge}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm leading-relaxed">
            Remember: This tool makes no claims about the ultimate nature or source of your experience. 
            What matters most is what feels authentic and helpful to you as you explore and understand your own journey.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Safety Grounding Practice Component
 */
export function SafetyGroundingPractice({ 
  onComplete 
}: { 
  onComplete: () => void 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const practices = [
    {
      title: "Feel Your Foundation",
      instruction: "Take a moment to feel your feet on the ground or your body in your chair. Notice the solid support beneath you.",
      duration: 30
    },
    {
      title: "Breathe With Awareness", 
      instruction: "Take three slow, deep breaths. In through your nose, out through your mouth. Feel your breath moving in and out.",
      duration: 45
    },
    {
      title: "Name Your Present",
      instruction: "Look around and name three things you can see, two things you can hear, and one thing you can touch.",
      duration: 60
    }
  ];

  const currentPractice = practices[currentStep];

  const startPractice = () => {
    setIsActive(true);
    setTimeout(() => {
      setIsActive(false);
      if (currentStep < practices.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
    }, currentPractice.duration * 1000);
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg border border-green-200 p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          Grounding Practice {currentStep + 1} of {practices.length}
        </h3>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-2">{currentPractice.title}</h4>
        <p className="text-gray-600 leading-relaxed">{currentPractice.instruction}</p>
      </div>

      <div className="flex justify-center">
        {!isActive ? (
          <button
            onClick={startPractice}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {currentStep === 0 ? 'Begin Practice' : 'Continue'}
          </button>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <p className="text-green-700 font-medium">
              Take your time... ({currentPractice.duration}s)
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + (isActive ? 0.5 : 0)) / practices.length) * 100}%` }}
        />
      </div>
    </div>
  );
}