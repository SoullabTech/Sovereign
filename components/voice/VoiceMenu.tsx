'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Mic, Settings, Check, Play, User } from 'lucide-react';

interface VoiceProfile {
  id: string;
  name: string;
  baseVoice: string;
  parameters: {
    temperature: number;
    speed: number;
    pitch: number;
    consistency: number;
    emotionalDepth: number;
    resonance: number;
    clarity: number;
    breathiness: number;
  };
}

interface VoiceMask {
  id: string;
  name: string;
  canonicalName: string;
  description?: string;
  status: 'stable' | 'seasonal' | 'experimental' | 'ritual';
  unlockedAt?: Date;
  ritualUnlock?: string;
  elementalAffinity?: string[];
  jungianPhase?: 'mirror' | 'shadow' | 'anima' | 'self';
  emotionalRange?: string[];
  userAlias?: string;
}

interface VoiceMenuProps {
  selectedVoiceId?: string;
  onVoiceSelect: (voiceId: string) => void;
  onVoiceClone?: (file: File, name: string) => void;
  showElements?: boolean;
  currentElement?: string;
  userId?: string;
}

export default function VoiceMenu({
  selectedVoiceId = 'maya-threshold',
  onVoiceSelect,
  onVoiceClone,
  showElements = true,
  currentElement,
  userId
}: VoiceMenuProps) {
  const [voices, setVoices] = useState<{
    characters: VoiceProfile[];
    mayaVariations: VoiceProfile[];
    milesVariations: VoiceProfile[];
    custom: VoiceProfile[];
  }>({
    characters: [],
    mayaVariations: [],
    milesVariations: [],
    custom: []
  });

  const [voiceMasks, setVoiceMasks] = useState<{
    maya: VoiceMask[];
    miles: VoiceMask[];
  }>({
    maya: [
      {
        id: 'maya-threshold',
        name: 'Maya of the Threshold',
        canonicalName: 'Maya',
        description: 'Guide at the liminal edges',
        status: 'stable',
        elementalAffinity: ['aether', 'water'],
        jungianPhase: 'mirror',
        emotionalRange: ['curious', 'inviting', 'mysterious']
      },
      {
        id: 'maya-deep-waters',
        name: 'Maya of Deep Waters',
        canonicalName: 'Maya',
        description: 'Companion in shadow work',
        status: 'stable',
        elementalAffinity: ['water', 'earth'],
        jungianPhase: 'shadow',
        emotionalRange: ['compassionate', 'grounding', 'witnessing']
      },
      {
        id: 'maya-spiral',
        name: 'Maya of the Spiral',
        canonicalName: 'Maya',
        description: 'Dance partner in integration',
        status: 'seasonal',
        ritualUnlock: '2025-03-20',
        elementalAffinity: ['fire', 'air'],
        jungianPhase: 'self',
        emotionalRange: ['playful', 'wise', 'celebratory']
      }
    ],
    miles: [
      {
        id: 'miles-grounded',
        name: 'Miles',
        canonicalName: 'Miles',
        description: 'Steady earth presence',
        status: 'stable',
        elementalAffinity: ['earth'],
        jungianPhase: 'shadow',
        emotionalRange: ['steady', 'direct', 'supportive']
      }
    ]
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'maya' | 'miles' | 'custom'>('maya');
  const [isLoading, setIsLoading] = useState(true);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [userAliases, setUserAliases] = useState<Record<string, string>>({});
  const [editingAlias, setEditingAlias] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/oracle/voice');
      const data = await response.json();
      if (data.success) {
        setVoices(data.voices);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const previewVoice = async (voiceId: string) => {
    setPreviewingVoice(voiceId);
    try {
      const response = await fetch('/api/oracle/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello, I am your guide on this sacred journey.',
          characterId: voiceId,
          element: currentElement,
          enableProsody: true
        })
      });

      const data = await response.json();
      if (data.success && data.audioData) {
        // Play audio preview
        const audio = new Audio(`data:audio/mp3;base64,${data.audioData}`);
        await audio.play();
      }
    } catch (error) {
      console.error('Failed to preview voice:', error);
    } finally {
      setPreviewingVoice(null);
    }
  };

  const handleCloneVoice = async (file: File, name: string) => {
    if (!onVoiceClone) return;

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('name', name);
    formData.append('baseVoice', 'nova');

    try {
      const response = await fetch('/api/oracle/voice', {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        await loadVoices(); // Reload voices
        setShowCloneDialog(false);
      }
    } catch (error) {
      console.error('Failed to clone voice:', error);
    }
  };

  const getSelectedVoice = () => {
    const allMasks = [...voiceMasks.maya, ...voiceMasks.miles];
    const mask = allMasks.find(m => m.id === selectedVoiceId);
    if (mask) {
      return {
        id: mask.id,
        name: userAliases[mask.id] || mask.name,
        canonicalName: mask.canonicalName,
        description: mask.description
      };
    }
    return null;
  };

  const selectedVoice = getSelectedVoice();

  const isMaskUnlocked = (mask: VoiceMask): boolean => {
    if (mask.status === 'stable') return true;
    if (mask.status === 'seasonal' && mask.ritualUnlock) {
      return new Date() >= new Date(mask.ritualUnlock);
    }
    return false;
  };

  const handleAliasChange = (maskId: string, alias: string) => {
    setUserAliases(prev => ({
      ...prev,
      [maskId]: alias
    }));
    // Save to localStorage or backend
    if (typeof window !== 'undefined') {
      localStorage.setItem(`voice-aliases-${userId}`, JSON.stringify({
        ...userAliases,
        [maskId]: alias
      }));
    }
  };

  return (
    <div className="relative">
      {/* Voice Selection Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900
                   border border-neutral-200 dark:border-neutral-700 rounded-lg
                   hover:border-amber-500 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Volume2 className="w-5 h-5 text-amber-600" />
        <span className="text-sm font-medium">
          {selectedVoice?.name || 'Select Voice'}
        </span>
        <Settings className="w-4 h-4 text-neutral-400 ml-2" />
      </motion.button>

      {/* Voice Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 z-50 w-80
                       bg-white dark:bg-neutral-900 rounded-xl shadow-xl
                       border border-neutral-200 dark:border-neutral-700
                       overflow-hidden"
          >
            {/* Category Tabs */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setSelectedCategory('maya')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
                  ${selectedCategory === 'maya'
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
              >
                Maya Masks
              </button>
              <button
                onClick={() => setSelectedCategory('miles')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
                  ${selectedCategory === 'miles'
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
              >
                Miles
              </button>
              <button
                onClick={() => setSelectedCategory('custom')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
                  ${selectedCategory === 'custom'
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
              >
                Custom
              </button>
            </div>

            {/* Voice List */}
            <div className="max-h-96 overflow-y-auto p-2">
              {isLoading ? (
                <div className="p-4 text-center text-neutral-500">Loading voices...</div>
              ) : (
                <>
                  {selectedCategory === 'maya' && voiceMasks.maya.map(mask => (
                    <VoiceMaskOption
                      key={mask.id}
                      mask={mask}
                      isSelected={selectedVoiceId === mask.id}
                      isPreviewing={previewingVoice === mask.id}
                      isUnlocked={isMaskUnlocked(mask)}
                      userAlias={userAliases[mask.id]}
                      isEditingAlias={editingAlias === mask.id}
                      onSelect={() => {
                        if (isMaskUnlocked(mask)) {
                          onVoiceSelect(mask.id);
                          setIsOpen(false);
                        }
                      }}
                      onPreview={() => isMaskUnlocked(mask) && previewVoice(mask.id)}
                      onEditAlias={() => setEditingAlias(mask.id)}
                      onAliasChange={(alias) => handleAliasChange(mask.id, alias)}
                    />
                  ))}

                  {selectedCategory === 'miles' && voiceMasks.miles.map(mask => (
                    <VoiceMaskOption
                      key={mask.id}
                      mask={mask}
                      isSelected={selectedVoiceId === mask.id}
                      isPreviewing={previewingVoice === mask.id}
                      isUnlocked={isMaskUnlocked(mask)}
                      userAlias={userAliases[mask.id]}
                      isEditingAlias={editingAlias === mask.id}
                      onSelect={() => {
                        if (isMaskUnlocked(mask)) {
                          onVoiceSelect(mask.id);
                          setIsOpen(false);
                        }
                      }}
                      onPreview={() => isMaskUnlocked(mask) && previewVoice(mask.id)}
                      onEditAlias={() => setEditingAlias(mask.id)}
                      onAliasChange={(alias) => handleAliasChange(mask.id, alias)}
                    />
                  ))}

                  {selectedCategory === 'custom' && (
                    <>
                      {voices.custom.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-sm text-neutral-500 mb-3">
                            No custom voices yet
                          </p>
                          <button
                            onClick={() => setShowCloneDialog(true)}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg
                                     hover:bg-amber-700 transition-colors text-sm font-medium"
                          >
                            Clone Your Voice
                          </button>
                        </div>
                      ) : (
                        <>
                          {voices.custom.map(voice => (
                            <VoiceOption
                              key={voice.id}
                              voice={voice}
                              isSelected={selectedVoiceId === voice.id}
                              isPreviewing={previewingVoice === voice.id}
                              onSelect={() => {
                                onVoiceSelect(voice.id);
                                setIsOpen(false);
                              }}
                              onPreview={() => previewVoice(voice.id)}
                              isCustom
                            />
                          ))}
                          <button
                            onClick={() => setShowCloneDialog(true)}
                            className="w-full mt-2 px-4 py-2 text-sm text-amber-600
                                     hover:bg-amber-50 dark:hover:bg-amber-900/20
                                     transition-colors rounded-lg"
                          >
                            + Add Another Voice
                          </button>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Clone Dialog */}
      <AnimatePresence>
        {showCloneDialog && (
          <VoiceCloneDialog
            onClose={() => setShowCloneDialog(false)}
            onClone={handleCloneVoice}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Voice Mask Option Component
function VoiceMaskOption({
  mask,
  isSelected,
  isPreviewing,
  isUnlocked,
  userAlias,
  isEditingAlias,
  onSelect,
  onPreview,
  onEditAlias,
  onAliasChange
}: {
  mask: VoiceMask;
  isSelected: boolean;
  isPreviewing: boolean;
  isUnlocked: boolean;
  userAlias?: string;
  isEditingAlias: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onEditAlias: () => void;
  onAliasChange: (alias: string) => void;
}) {
  const [aliasInput, setAliasInput] = useState(userAlias || '');

  const getElementIcons = (affinities: string[] = []) => {
    return affinities.map(e => {
      switch(e) {
        case 'fire': return '🔥';
        case 'water': return '💧';
        case 'earth': return '🌍';
        case 'air': return '💨';
        case 'aether': return '✨';
        default: return '';
      }
    }).join(' ');
  };

  const getPhaseIcon = (phase?: string) => {
    switch(phase) {
      case 'mirror': return '🪞';
      case 'shadow': return '🌑';
      case 'anima': return '🌙';
      case 'self': return '☀️';
      default: return '';
    }
  };

  return (
    <motion.div
      className={`p-3 rounded-lg mb-2 border transition-all duration-200
        ${!isUnlocked ? 'opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-900' : 'cursor-pointer'}
        ${isSelected && isUnlocked
          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
        }`}
      onClick={onSelect}
      whileHover={isUnlocked ? { x: 4 } : {}}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {userAlias || mask.name}
            </p>
            {userAlias && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                ({mask.name})
              </span>
            )}
          </div>

          {mask.description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {mask.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            {mask.elementalAffinity && (
              <span className="text-xs">
                {getElementIcons(mask.elementalAffinity)}
              </span>
            )}
            {mask.jungianPhase && (
              <span className="text-xs">
                {getPhaseIcon(mask.jungianPhase)}
              </span>
            )}
            {!isUnlocked && mask.ritualUnlock && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                🔒 Unlocks {new Date(mask.ritualUnlock).toLocaleDateString()}
              </span>
            )}
            {mask.status === 'seasonal' && isUnlocked && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                ✨ Seasonal
              </span>
            )}
          </div>

          {isEditingAlias ? (
            <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                placeholder="Enter custom name"
                className="px-2 py-1 text-xs border border-amber-300 dark:border-amber-700
                         rounded bg-white dark:bg-neutral-800 focus:outline-none
                         focus:border-amber-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onAliasChange(aliasInput);
                    onEditAlias();
                  }
                  if (e.key === 'Escape') {
                    setAliasInput(userAlias || '');
                    onEditAlias();
                  }
                }}
              />
              <button
                onClick={() => {
                  onAliasChange(aliasInput);
                  onEditAlias();
                }}
                className="text-xs text-amber-600 hover:text-amber-700"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditAlias();
              }}
              className="text-xs text-amber-600 hover:text-amber-700 mt-2"
            >
              {userAlias ? 'Edit Alias' : 'Set Custom Name'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-3">
          {isSelected && isUnlocked && (
            <Check className="w-4 h-4 text-amber-600" />
          )}
          {isUnlocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              disabled={isPreviewing}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700
                       transition-colors disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isPreviewing ? 'text-amber-600 animate-pulse' : 'text-neutral-600'}`} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Voice Option Component
function VoiceOption({
  voice,
  isSelected,
  isPreviewing,
  onSelect,
  onPreview,
  showElement = false,
  isCustom = false
}: {
  voice: VoiceProfile;
  isSelected: boolean;
  isPreviewing: boolean;
  onSelect: () => void;
  onPreview: () => void;
  showElement?: boolean;
  isCustom?: boolean;
}) {
  const getElementFromId = (id: string) => {
    if (id.includes('fire')) return '🔥 Fire';
    if (id.includes('water')) return '💧 Water';
    if (id.includes('earth')) return '🌍 Earth';
    if (id.includes('air')) return '💨 Air';
    if (id.includes('aether')) return '✨ Aether';
    return '';
  };

  return (
    <motion.div
      className={`flex items-center justify-between p-3 rounded-lg mb-1
        ${isSelected
          ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-transparent'
        } transition-all duration-200 cursor-pointer`}
      onClick={onSelect}
      whileHover={{ x: 4 }}
    >
      <div className="flex items-center gap-3">
        {isCustom && <User className="w-4 h-4 text-amber-600" />}
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {voice.name}
          </p>
          {showElement && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {getElementFromId(voice.id)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isSelected && (
          <Check className="w-4 h-4 text-amber-600" />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          disabled={isPreviewing}
          className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700
                   transition-colors disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${isPreviewing ? 'text-amber-600 animate-pulse' : 'text-neutral-600'}`} />
        </button>
      </div>
    </motion.div>
  );
}

// Voice Clone Dialog Component
function VoiceCloneDialog({
  onClose,
  onClone
}: {
  onClose: () => void;
  onClone: (file: File, name: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!file || !name) return;

    setIsUploading(true);
    await onClone(file, name);
    setIsUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl
                   max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Clone Your Voice</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Voice Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Voice"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700
                       rounded-lg focus:outline-none focus:border-amber-500
                       bg-white dark:bg-neutral-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Audio File</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700
                       rounded-lg focus:outline-none focus:border-amber-500
                       bg-white dark:bg-neutral-800"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Upload a clear audio sample (MP3, WAV, etc.)
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700
                     rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800
                     transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || !name || isUploading}
            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg
                     hover:bg-amber-700 transition-colors disabled:opacity-50
                     disabled:cursor-not-allowed"
          >
            {isUploading ? 'Cloning...' : 'Clone Voice'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}