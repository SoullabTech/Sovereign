'use client';

/**
 * MAIA Configuration Router
 *
 * Intelligently routes users to optimal MAIA experience:
 * 1. Mobile-optimized for phones (MobileMaia)
 * 2. Desktop deep dive for larger screens (DesktopDeepDive)
 * 3. Standalone partner mode when configured
 *
 * Integrates with existing sophisticated MAIA system
 */

import { useState, useEffect } from 'react';
import { MobileMaia } from '@/components/mobile/MobileMaia';
import { DesktopDeepDive } from '@/components/desktop/DesktopDeepDive';
import { StandaloneMaia, enhanceWithPartnerMode } from '@/components/partner/StandaloneMaia';
import { PersonalVoiceExperience } from '@/components/voice/PersonalVoiceExperience';
import { TransformationalExperience } from '@/components/consciousness/TransformationalExperience';
import { useVoicePersonalization, enhanceWithVoicePersonalization } from '@/hooks/useVoicePersonalization';

interface MAIAConfigurationRouterProps {
  userId: string;
  userName: string;
  maiaMode: 'normal' | 'patient' | 'session';
  voiceEnabled: boolean;
  selectedVoice: string;
  onConversationStart?: () => void;
  onVoicePersonalization?: (config: any) => void;
  onLayoutChange?: (layout: any) => void;
  className?: string;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';
type MAIAExperience = 'default' | 'mobile' | 'desktop' | 'partner';

export function MAIAConfigurationRouter({
  userId,
  userName,
  maiaMode,
  voiceEnabled,
  selectedVoice,
  onConversationStart,
  onVoicePersonalization,
  onLayoutChange,
  className = ''
}: MAIAConfigurationRouterProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [preferredExperience, setPreferredExperience] = useState<MAIAExperience>('default');
  const [partnerModeActive, setPartnerModeActive] = useState(false);
  const [showExperienceSelector, setShowExperienceSelector] = useState(false);

  // Voice personalization integration
  const voicePersonalization = useVoicePersonalization(userId, userName, selectedVoice);

  // Device detection
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024 && isTouchDevice) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Check for partner mode preference
  useEffect(() => {
    const partnerProfile = localStorage.getItem('maia_partner_profile');
    const userPreference = localStorage.getItem('maia_experience_preference');

    if (partnerProfile) {
      setPartnerModeActive(true);
    }

    if (userPreference) {
      setPreferredExperience(userPreference as MAIAExperience);
    }
  }, []);

  // Determine which experience to show
  const getActiveExperience = (): MAIAExperience => {
    if (preferredExperience !== 'default') {
      return preferredExperience;
    }

    // Auto-select based on device and context
    if (partnerModeActive) {
      return 'partner';
    }

    if (deviceType === 'mobile') {
      return 'mobile';
    }

    if (deviceType === 'desktop' && (maiaMode === 'session' || voiceEnabled)) {
      return 'desktop';
    }

    return 'default';
  };

  const activeExperience = getActiveExperience();

  // Experience selector options
  const experienceOptions = [
    {
      id: 'mobile' as const,
      name: 'Mobile Experience',
      description: 'Voice-first, quick interactions optimized for phones',
      icon: '📱',
      recommended: deviceType === 'mobile'
    },
    {
      id: 'desktop' as const,
      name: 'Desktop Deep Dive',
      description: 'Multi-panel consciousness exploration with analytics',
      icon: '🖥️',
      recommended: deviceType === 'desktop' && maiaMode === 'session'
    },
    {
      id: 'partner' as const,
      name: 'Partner Mode',
      description: 'Persistent AI companion with memory and personalization',
      icon: '🤝',
      recommended: partnerModeActive
    },
    {
      id: 'default' as const,
      name: 'Classic MAIA',
      description: 'Original beautiful interface with all features',
      icon: '✨',
      recommended: false
    }
  ];

  const handleExperienceChange = (experience: MAIAExperience) => {
    setPreferredExperience(experience);
    localStorage.setItem('maia_experience_preference', experience);
    setShowExperienceSelector(false);
  };

  // Enhanced props with partner awareness and voice personalization
  const partnerEnhancedProps = enhanceWithPartnerMode({
    userId,
    userName,
    maiaMode,
    voiceEnabled,
    selectedVoice,
    onConversationStart
  });

  const enhancedProps = enhanceWithVoicePersonalization(partnerEnhancedProps, voicePersonalization);

  // If default experience, return null to let parent render original interface
  if (activeExperience === 'default') {
    return (
      <div className={`maia-configuration-router ${className}`}>
        {/* Experience selector toggle */}
        <button
          onClick={() => setShowExperienceSelector(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-black/20 hover:bg-black/30
                     rounded-lg backdrop-blur-sm transition-colors"
          title="Switch MAIA experience"
        >
          <span className="text-amber-400 text-sm">⚙️</span>
        </button>

        {/* Transformational enhancements for default mode */}
        <div className="fixed top-16 left-4 z-40">
          <TransformationalExperience
            currentMode={maiaMode}
            onWisdomPrompt={(prompt) => {
              console.log('Wisdom prompt:', prompt);
              // Could trigger conversation with prompt
            }}
          />
        </div>

        {/* Voice personalization toggle for default mode */}
        {voiceEnabled && (
          <button
            onClick={() => voicePersonalization.analyzeCurrentContext()}
            disabled={voicePersonalization.isAnalyzing}
            className="fixed top-4 right-16 z-50 p-2 bg-black/20 hover:bg-black/30
                       rounded-lg backdrop-blur-sm transition-colors"
            title={voicePersonalization.config ?
              `Voice personalized (${voicePersonalization.config.intimacyLevel.connection}% connection)` :
              'Personalize voice interaction'
            }
          >
            <span className="text-amber-400 text-sm">
              {voicePersonalization.config ? '🎵' : '🎤'}
            </span>
          </button>
        )}

        {/* Experience selector overlay */}
        {showExperienceSelector && (
          <ExperienceSelector
            options={experienceOptions}
            currentExperience={activeExperience}
            deviceType={deviceType}
            onSelect={handleExperienceChange}
            onClose={() => setShowExperienceSelector(false)}
          />
        )}
      </div>
    );
  }

  // Render specialized experience
  return (
    <div className={`maia-configuration-router ${className}`}>
      {/* Experience selector for switching */}
      <button
        onClick={() => setShowExperienceSelector(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-black/20 hover:bg-black/30
                   rounded-lg backdrop-blur-sm transition-colors"
        title="Switch MAIA experience"
      >
        <span className="text-amber-400 text-sm">⚙️</span>
      </button>

      {/* Specialized experiences */}
      {activeExperience === 'mobile' && (
        <MobileMaia
          userId={enhancedProps.userId}
          userName={enhancedProps.userName}
          onConversationStart={onConversationStart}
        />
      )}

      {activeExperience === 'desktop' && (
        <DesktopDeepDive
          userId={enhancedProps.userId}
          userName={enhancedProps.userName}
          onLayoutChange={onLayoutChange}
        />
      )}

      {activeExperience === 'partner' && (
        <>
          <StandaloneMaia
            onProfileUpdate={(profile) => {
              console.log('Partner profile updated:', profile);
              // Could trigger voice personalization update
              onVoicePersonalization?.(profile);
            }}
          />

          {/* Voice personalization overlay for partner mode */}
          <div className="fixed bottom-4 right-4 z-40">
            <PersonalVoiceExperience
              onConfigUpdate={(config) => {
                console.log('Voice config updated:', config);
                onVoicePersonalization?.(config);
              }}
            />
          </div>
        </>
      )}

      {/* Experience selector overlay */}
      {showExperienceSelector && (
        <ExperienceSelector
          options={experienceOptions}
          currentExperience={activeExperience}
          deviceType={deviceType}
          onSelect={handleExperienceChange}
          onClose={() => setShowExperienceSelector(false)}
        />
      )}
    </div>
  );
}

// Experience selector component
function ExperienceSelector({
  options,
  currentExperience,
  deviceType,
  onSelect,
  onClose
}: {
  options: any[];
  currentExperience: MAIAExperience;
  deviceType: DeviceType;
  onSelect: (experience: MAIAExperience) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-stone-900/90 to-stone-800/90
                      rounded-2xl border border-amber-500/20 p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light text-white">Choose Your MAIA Experience</h2>
          <button
            onClick={onClose}
            className="p-1 text-amber-400/60 hover:text-amber-300"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                currentExperience === option.id
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${
                      currentExperience === option.id ? 'text-amber-300' : 'text-white'
                    }`}>
                      {option.name}
                    </h3>
                    {option.recommended && (
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/70 mt-1">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-white/50">
            Detected: {deviceType} • Current: {currentExperience}
          </p>
        </div>
      </div>
    </div>
  );
}