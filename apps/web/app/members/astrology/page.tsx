"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stars,
  Calendar,
  Clock,
  MapPin,
  Moon,
  Sun,
  ArrowRight,
  ArrowLeft,
  Save,
  Edit,
  Check,
  Globe
} from 'lucide-react';
import { useMemberAuth } from '@/lib/auth/memberAuth';
import Link from 'next/link';

interface AstrologyFormData {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  notes: string;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export default function AstrologyPage() {
  const { member, updateAstrologyProfile, isMember } = useMemberAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AstrologyFormData>({
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    sunSign: '',
    moonSign: '',
    risingSign: '',
    notes: ''
  });

  useEffect(() => {
    if (!isMember) return;

    if (member?.astrology && member.astrology.birthDate) {
      setHasExistingData(true);
      setFormData({
        birthDate: member.astrology.birthDate || '',
        birthTime: member.astrology.birthTime || '',
        birthLocation: member.astrology.birthLocation || '',
        sunSign: member.astrology.sunSign || '',
        moonSign: member.astrology.moonSign || '',
        risingSign: member.astrology.risingSign || '',
        notes: member.astrology.notes || ''
      });
    } else {
      setIsEditing(true);
    }
  }, [member, isMember]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await updateAstrologyProfile({
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthLocation: formData.birthLocation,
        sunSign: formData.sunSign,
        moonSign: formData.moonSign,
        risingSign: formData.risingSign,
        notes: formData.notes
      });

      setHasExistingData(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving astrology profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return formData.birthDate && formData.birthTime && formData.birthLocation;
      case 2: return formData.sunSign;
      case 3: return formData.moonSign && formData.risingSign;
      default: return true;
    }
  };

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-light text-jade-whisper mb-4">Member Access Required</h1>
          <p className="text-jade-moss/80 mb-6">Please sign in to access your astrology profile.</p>
          <Link
            href="/auth/signin"
            className="bg-jade-glow text-jade-night px-6 py-3 rounded-lg hover:bg-jade-ocean transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const renderExistingProfile = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-jade-sage to-jade-seafoam rounded-full flex items-center justify-center mx-auto mb-6">
          <Stars className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-light text-jade-whisper mb-4">
          Your Celestial Blueprint
        </h1>
        <p className="text-xl text-jade-moss/80 max-w-2xl mx-auto">
          Your astrological profile helps us understand the cosmic influences that shape your consciousness
        </p>
        {member?.astrology?.lastUpdated && (
          <p className="text-sm text-jade-moss/60 mt-4">
            Last updated: {new Date(member.astrology.lastUpdated).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Birth Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-8 border border-jade-whisper/10"
        >
          <h3 className="text-2xl font-light text-jade-whisper mb-6 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-jade-glow" />
            Birth Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-jade-moss/80">Birth Date</label>
              <div className="text-jade-whisper text-lg">
                {new Date(formData.birthDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-jade-moss/80">Birth Time</label>
              <div className="text-jade-whisper text-lg">{formData.birthTime}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-jade-moss/80">Birth Location</label>
              <div className="text-jade-whisper text-lg">{formData.birthLocation}</div>
            </div>
          </div>
        </motion.div>

        {/* Astrological Signs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-8 border border-jade-whisper/10"
        >
          <h3 className="text-2xl font-light text-jade-whisper mb-6 flex items-center gap-3">
            <Stars className="w-6 h-6 text-jade-glow" />
            Your Trinity
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Sun className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-sm font-medium text-jade-moss/80">Sun Sign</div>
                <div className="text-jade-whisper text-xl font-light">{formData.sunSign}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Moon className="w-8 h-8 text-jade-seafoam" />
              <div>
                <div className="text-sm font-medium text-jade-moss/80">Moon Sign</div>
                <div className="text-jade-whisper text-xl font-light">{formData.moonSign}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ArrowRight className="w-8 h-8 text-jade-sage" />
              <div>
                <div className="text-sm font-medium text-jade-moss/80">Rising Sign</div>
                <div className="text-jade-whisper text-xl font-light">{formData.risingSign}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notes Section */}
      {formData.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-8 border border-jade-whisper/10"
        >
          <h3 className="text-2xl font-light text-jade-whisper mb-4">Personal Notes</h3>
          <p className="text-jade-moss/80 leading-relaxed">{formData.notes}</p>
        </motion.div>
      )}

      {/* Edit Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mt-12"
      >
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 bg-jade-glow text-jade-night px-8 py-3 rounded-xl hover:bg-jade-ocean
                   transition-all duration-200 font-medium shadow-lg shadow-jade-glow/20 mx-auto"
        >
          <Edit className="w-5 h-5" />
          Update Information
        </button>
      </motion.div>
    </motion.div>
  );

  const renderForm = () => {
    const totalSteps = 3;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-jade-sage to-jade-seafoam rounded-full flex items-center justify-center mx-auto mb-6">
            <Stars className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-light text-jade-whisper mb-4">
            {hasExistingData ? 'Update Your' : 'Create Your'} Cosmic Profile
          </h1>
          <p className="text-xl text-jade-moss/80 max-w-2xl mx-auto">
            Your birth chart holds the keys to understanding your deepest patterns and potentials
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNumber = i + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep || (stepNumber === currentStep && isStepValid(stepNumber));

              return (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-200 ${
                    isCompleted
                      ? 'bg-jade-glow text-jade-night'
                      : isActive
                        ? 'bg-jade-sage/20 text-jade-seafoam border-2 border-jade-seafoam'
                        : 'bg-jade-shadow text-jade-moss/60'
                  }`}>
                    {isCompleted && stepNumber < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  {stepNumber < totalSteps && (
                    <div className={`w-20 h-1 mx-4 transition-all duration-200 ${
                      stepNumber < currentStep ? 'bg-jade-glow' : 'bg-jade-shadow'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-8 border border-jade-whisper/10"
            >
              <h3 className="text-2xl font-light text-jade-whisper mb-8 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-jade-glow" />
                Birth Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-jade-moss/80 mb-3">
                    Birth Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jade-moss/60" />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full bg-jade-shadow/50 border border-jade-moss/30 rounded-lg px-10 py-3 text-jade-whisper
                               focus:border-jade-glow focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-jade-moss/80 mb-3">
                    Birth Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jade-moss/60" />
                    <input
                      type="time"
                      value={formData.birthTime}
                      onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                      className="w-full bg-jade-shadow/50 border border-jade-moss/30 rounded-lg px-10 py-3 text-jade-whisper
                               focus:border-jade-glow focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-jade-moss/80 mb-3">
                  Birth Location (City, State/Country)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jade-moss/60" />
                  <input
                    type="text"
                    value={formData.birthLocation}
                    onChange={(e) => setFormData({ ...formData, birthLocation: e.target.value })}
                    placeholder="e.g., New York, NY or London, UK"
                    className="w-full bg-jade-shadow/50 border border-jade-moss/30 rounded-lg px-10 py-3 text-jade-whisper
                             focus:border-jade-glow focus:outline-none transition-colors placeholder-jade-moss/50"
                  />
                </div>
              </div>

              <div className="mt-8 bg-jade-moss/10 rounded-lg p-4 border border-jade-moss/20">
                <p className="text-sm text-jade-moss/80">
                  <strong>Tip:</strong> Exact birth time is important for accurate rising sign calculation.
                  If you're unsure, check your birth certificate or ask family members.
                </p>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-8 border border-jade-whisper/10"
            >
              <h3 className="text-2xl font-light text-jade-whisper mb-8 flex items-center gap-3">
                <Sun className="w-6 h-6 text-yellow-400" />
                Sun Sign - Your Core Self
              </h3>

              <p className="text-jade-moss/80 mb-8">
                Your Sun sign represents your core essence, ego, and conscious identity.
                It's the foundation of your personality and how you express your life force.
              </p>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {ZODIAC_SIGNS.map((sign) => (
                  <button
                    key={sign}
                    onClick={() => setFormData({ ...formData, sunSign: sign })}
                    className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                      formData.sunSign === sign
                        ? 'bg-jade-glow text-jade-night border-jade-glow shadow-lg'
                        : 'bg-jade-shadow/50 text-jade-whisper border-jade-moss/30 hover:border-jade-sage/50'
                    }`}
                  >
                    {sign}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-8 border border-jade-whisper/10 space-y-8"
            >
              <div>
                <h3 className="text-2xl font-light text-jade-whisper mb-4 flex items-center gap-3">
                  <Moon className="w-6 h-6 text-jade-seafoam" />
                  Moon Sign - Your Inner World
                </h3>
                <p className="text-jade-moss/80 mb-6">
                  Your Moon sign governs your emotional nature, instincts, and subconscious patterns.
                </p>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                  {ZODIAC_SIGNS.map((sign) => (
                    <button
                      key={sign}
                      onClick={() => setFormData({ ...formData, moonSign: sign })}
                      className={`p-3 rounded-lg border transition-all duration-200 text-center text-sm ${
                        formData.moonSign === sign
                          ? 'bg-jade-seafoam text-jade-night border-jade-seafoam shadow-lg'
                          : 'bg-jade-shadow/50 text-jade-whisper border-jade-moss/30 hover:border-jade-sage/50'
                      }`}
                    >
                      {sign}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-light text-jade-whisper mb-4 flex items-center gap-3">
                  <ArrowRight className="w-6 h-6 text-jade-sage" />
                  Rising Sign - Your Outer Expression
                </h3>
                <p className="text-jade-moss/80 mb-6">
                  Your Rising (Ascendant) sign influences how others see you and how you present yourself to the world.
                </p>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {ZODIAC_SIGNS.map((sign) => (
                    <button
                      key={sign}
                      onClick={() => setFormData({ ...formData, risingSign: sign })}
                      className={`p-3 rounded-lg border transition-all duration-200 text-center text-sm ${
                        formData.risingSign === sign
                          ? 'bg-jade-sage text-jade-night border-jade-sage shadow-lg'
                          : 'bg-jade-shadow/50 text-jade-whisper border-jade-moss/30 hover:border-jade-sage/50'
                      }`}
                    >
                      {sign}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-sm font-medium text-jade-moss/80 mb-3">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional astrological information, aspects, or personal insights you'd like to share..."
                  rows={4}
                  className="w-full bg-jade-shadow/50 border border-jade-moss/30 rounded-lg px-4 py-3 text-jade-whisper
                           focus:border-jade-glow focus:outline-none transition-colors placeholder-jade-moss/50 resize-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-2 px-6 py-3 bg-jade-shadow/60 text-jade-whisper border border-jade-moss/30
                         rounded-lg hover:bg-jade-dusk/60 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {hasExistingData && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-jade-shadow/60 text-jade-whisper border border-jade-moss/30
                         rounded-lg hover:bg-jade-dusk/60 transition-all duration-200"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid(currentStep)}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isStepValid(currentStep)
                    ? 'bg-jade-glow text-jade-night hover:bg-jade-ocean shadow-lg shadow-jade-glow/20'
                    : 'bg-jade-shadow/40 text-jade-moss/60 cursor-not-allowed'
                }`}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!isStepValid(currentStep) || isSaving}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isStepValid(currentStep) && !isSaving
                    ? 'bg-jade-glow text-jade-night hover:bg-jade-ocean shadow-lg shadow-jade-glow/20'
                    : 'bg-jade-shadow/40 text-jade-moss/60 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-jade-night/20 border-t-jade-night animate-spin rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night">
      <div className="container mx-auto px-4 py-16">
        <AnimatePresence mode="wait">
          {isEditing || !hasExistingData ? renderForm() : renderExistingProfile()}
        </AnimatePresence>

        {/* Back to Dashboard Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/members/dashboard"
            className="text-jade-moss/70 hover:text-jade-glow transition-colors text-sm"
          >
            ← Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}