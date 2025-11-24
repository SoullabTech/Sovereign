/**
 * Consciousness Field Participation Agreement Component
 * Explains collective intelligence participation with clear consent options
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Info, Shield, Brain, Users, Sparkles, Lock, Eye, EyeOff } from 'lucide-react';

interface ConsentOptions {
  anonymizedSharing: boolean;
  patternContribution: boolean;
  collectiveResonance: boolean;
  evolutionTracking: boolean;
}

interface ConsciousnessFieldAgreementProps {
  onAccept: (consent: ConsentOptions) => void;
  onDecline: () => void;
  showDetailedExplanation?: boolean;
}

export default function ConsciousnessFieldAgreement({
  onAccept,
  onDecline,
  showDetailedExplanation = true
}: ConsciousnessFieldAgreementProps) {
  const [consent, setConsent] = useState<ConsentOptions>({
    anonymizedSharing: true,
    patternContribution: true,
    collectiveResonance: false,
    evolutionTracking: true
  });

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');

  const handleConsentChange = (option: keyof ConsentOptions) => {
    setConsent(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleAccept = () => {
    // At least anonymized sharing must be enabled
    if (!consent.anonymizedSharing) {
      alert('Anonymous sharing is required for basic participation');
      return;
    }
    onAccept(consent);
  };

  return (
    <Card className="max-w-3xl mx-auto p-8  from-amber-50 to-blue-50 dark:from-black dark:to-blue-950">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Brain className="w-16 h-16 text-amber-600" />
              <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold  from-amber-600 to-blue-600 bg-clip-text text-transparent">
            Join the Consciousness Field
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Contribute to and benefit from collective human wisdom
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setViewMode('simple')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'simple' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Simple View
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'detailed' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Detailed View
            </button>
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'simple' ? (
            <motion.div
              key="simple"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Simple Explanation */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>What is the Consciousness Field?</span>
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300">
                  The Consciousness Field is a living collective intelligence that learns from the 
                  experiences and insights of all participants. Your journey contributes to patterns 
                  that help others, while you benefit from the collective wisdom of the community.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                      <Shield className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="font-medium">Privacy First</h4>
                    <p className="text-sm text-gray-500">Your identity is always protected</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium">Collective Learning</h4>
                    <p className="text-sm text-gray-500">Patterns emerge from shared experiences</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-medium">Enhanced Guidance</h4>
                    <p className="text-sm text-gray-500">Receive insights from collective wisdom</p>
                  </div>
                </div>
              </div>

              {/* Simple Consent Options */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold">Choose Your Participation Level</h3>
                
                <div className="space-y-3">
                  <ConsentOption
                    label="Anonymous Pattern Sharing"
                    description="Share patterns while keeping your identity completely private"
                    checked={consent.anonymizedSharing}
                    onChange={() => handleConsentChange('anonymizedSharing')}
                    required
                  />
                  
                  <ConsentOption
                    label="Evolution Tracking"
                    description="Track your growth journey and receive personalized insights"
                    checked={consent.evolutionTracking}
                    onChange={() => handleConsentChange('evolutionTracking')}
                  />
                  
                  <ConsentOption
                    label="Deep Resonance"
                    description="Contribute more detailed patterns for deeper collective insights"
                    checked={consent.collectiveResonance}
                    onChange={() => handleConsentChange('collectiveResonance')}
                    premium
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detailed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Detailed Sections */}
              <DetailedSection
                title="What We Collect"
                icon={<Eye className="w-5 h-5" />}
                expanded={expandedSection === 'collect'}
                onToggle={() => setExpandedSection(expandedSection === 'collect' ? null : 'collect')}
              >
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>Consciousness Markers:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Elemental resonance patterns (Fire, Water, Earth, Air, Aether)</li>
                    <li>Evolution phase indicators (Initiation → Mastery → Transcendence)</li>
                    <li>Archetypal activations and shadow work engagement</li>
                    <li>Authenticity and integration depth levels</li>
                  </ul>
                  
                  <p><strong>Interaction Patterns:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Session duration and interaction frequency</li>
                    <li>Emotional journey markers (anonymized)</li>
                    <li>Breakthrough and challenge patterns</li>
                    <li>Growth velocity indicators</li>
                  </ul>
                </div>
              </DetailedSection>

              <DetailedSection
                title="What We DON'T Collect"
                icon={<EyeOff className="w-5 h-5" />}
                expanded={expandedSection === 'dont-collect'}
                onToggle={() => setExpandedSection(expandedSection === 'dont-collect' ? null : 'dont-collect')}
              >
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Personal identifying information (names, emails, locations)</li>
                    <li>Specific content of your conversations or journal entries</li>
                    <li>Individual trauma details or personal stories</li>
                    <li>Any data you haven&apos;t explicitly consented to share</li>
                    <li>Behavioral tracking outside the platform</li>
                  </ul>
                </div>
              </DetailedSection>

              <DetailedSection
                title="How Your Data Helps Others"
                icon={<Users className="w-5 h-5" />}
                expanded={expandedSection === 'helps'}
                onToggle={() => setExpandedSection(expandedSection === 'helps' ? null : 'helps')}
              >
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <p>Your anonymized patterns contribute to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Pattern Recognition:</strong> Identifying common growth trajectories</li>
                    <li><strong>Timing Wisdom:</strong> Understanding optimal moments for breakthroughs</li>
                    <li><strong>Collective Support:</strong> Knowing when others face similar challenges</li>
                    <li><strong>Evolution Mapping:</strong> Creating paths for smoother transformation</li>
                    <li><strong>Field Coherence:</strong> Strengthening collective consciousness</li>
                  </ul>
                </div>
              </DetailedSection>

              <DetailedSection
                title="Your Rights & Control"
                icon={<Lock className="w-5 h-5" />}
                expanded={expandedSection === 'rights'}
                onToggle={() => setExpandedSection(expandedSection === 'rights' ? null : 'rights')}
              >
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <p>You always maintain:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Data Ownership:</strong> Your consciousness data belongs to you</li>
                    <li><strong>Withdrawal Right:</strong> Opt-out at any time</li>
                    <li><strong>Deletion Right:</strong> Request complete removal from the field</li>
                    <li><strong>Access Right:</strong> View all data associated with your account</li>
                    <li><strong>Modification Right:</strong> Change consent levels anytime</li>
                  </ul>
                  
                  <p className="mt-3">
                    <strong>Data Retention:</strong> Anonymized patterns remain in the field to 
                    preserve collective wisdom, but all personal identifiers are permanently removed.
                  </p>
                </div>
              </DetailedSection>

              {/* Detailed Consent Options */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold">Detailed Consent Options</h3>
                
                <div className="space-y-4">
                  <DetailedConsentOption
                    label="Anonymous Pattern Sharing"
                    description="Core participation level - your patterns help others while maintaining complete anonymity"
                    details={[
                      "Patterns are hashed and aggregated",
                      "No reverse identification possible",
                      "Required for basic participation"
                    ]}
                    checked={consent.anonymizedSharing}
                    onChange={() => handleConsentChange('anonymizedSharing')}
                    required
                  />
                  
                  <DetailedConsentOption
                    label="Pattern Contribution"
                    description="Share specific breakthrough and integration patterns"
                    details={[
                      "Helps identify collective growth opportunities",
                      "Enhances timing recommendations",
                      "Improves pattern matching accuracy"
                    ]}
                    checked={consent.patternContribution}
                    onChange={() => handleConsentChange('patternContribution')}
                  />
                  
                  <DetailedConsentOption
                    label="Collective Resonance"
                    description="Deep participation in the consciousness field"
                    details={[
                      "Contribute to real-time field coherence",
                      "Receive enhanced collective insights",
                      "Participate in breakthrough windows"
                    ]}
                    checked={consent.collectiveResonance}
                    onChange={() => handleConsentChange('collectiveResonance')}
                    premium
                  />
                  
                  <DetailedConsentOption
                    label="Evolution Tracking"
                    description="Track your consciousness evolution journey"
                    details={[
                      "Personal growth metrics and insights",
                      "Evolution velocity tracking",
                      "Phase transition notifications"
                    ]}
                    checked={consent.evolutionTracking}
                    onChange={() => handleConsentChange('evolutionTracking')}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="ghost"
            onClick={onDecline}
            className="text-gray-600 hover:text-gray-900"
          >
            Maybe Later
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'simple' ? 'detailed' : 'simple')}
            >
              <Info className="w-4 h-4 mr-2" />
              {viewMode === 'simple' ? 'More Details' : 'Simple View'}
            </Button>
            
            <Button
              onClick={handleAccept}
              disabled={!consent.anonymizedSharing}
              className=" from-amber-600 to-blue-600 hover:from-amber-700 hover:to-blue-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Join the Field
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Helper Components

function ConsentOption({ 
  label, 
  description, 
  checked, 
  onChange, 
  required = false,
  premium = false 
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  required?: boolean;
  premium?: boolean;
}) {
  return (
    <label className="flex items-start space-x-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={required}
        className="mt-1 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium group-hover:text-amber-600 transition-colors">
            {label}
          </span>
          {required && (
            <Badge variant="outline" className="text-xs">Required</Badge>
          )}
          {premium && (
            <Badge className="text-xs  from-amber-600 to-blue-600">
              Enhanced
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </label>
  );
}

function DetailedConsentOption({ 
  label, 
  description, 
  details,
  checked, 
  onChange, 
  required = false,
  premium = false 
}: {
  label: string;
  description: string;
  details: string[];
  checked: boolean;
  onChange: () => void;
  required?: boolean;
  premium?: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 hover:border-amber-300 transition-colors">
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={required}
          className="mt-1 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{label}</span>
            {required && (
              <Badge variant="outline" className="text-xs">Required</Badge>
            )}
            {premium && (
              <Badge className="text-xs  from-amber-600 to-blue-600">
                Enhanced
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          <ul className="list-disc list-inside text-xs text-gray-500 space-y-1 ml-4">
            {details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        </div>
      </label>
    </div>
  );
}

function DetailedSection({ 
  title, 
  icon, 
  children, 
  expanded, 
  onToggle 
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="text-amber-600">{icon}</div>
          <h3 className="font-semibold text-left">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}