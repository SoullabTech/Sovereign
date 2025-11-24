/**
 * Voice Settings Component
 * Allows users to customize MAIA's voice characteristics and options
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Volume2, Mic, Settings, Play, Pause } from 'lucide-react';

export interface VoiceConfiguration {
  provider: 'openai' | 'neural' | 'web_speech';
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  elementalProsody: boolean;
  voicePresets: Record<string, any>;
}

interface VoiceSettingsProps {
  currentConfig: VoiceConfiguration;
  onConfigChange: (config: VoiceConfiguration) => void;
  onTestVoice: (text: string) => Promise<void>;
}

const VOICE_PROVIDERS = {
  openai: {
    name: 'OpenAI TTS (Recommended)',
    description: 'Natural, human-like voices with emotional range',
    voices: {
      alloy: 'Alloy - Neutral, balanced (MAIA Default)',
      echo: 'Echo - Male, clear and direct',
      fable: 'Fable - British accent, warm',
      onyx: 'Onyx - Deep, authoritative male',
      nova: 'Nova - Young, energetic female',
      shimmer: 'Shimmer - Soft, gentle, soothing'
    }
  },
  neural: {
    name: 'Neural TTS (Local)',
    description: 'High-performance local synthesis, completely private',
    voices: {
      tacotron2: 'Tacotron2 - Professional neural synthesis',
      fastspeech: 'FastSpeech - Efficient local synthesis'
    }
  },
  web_speech: {
    name: 'Browser Speech',
    description: 'System voices, instant but basic quality',
    voices: {
      system: 'System Default Voice'
    }
  }
};

const ELEMENTAL_PRESETS = {
  fire: {
    name: '🔥 Fire - Passionate & Energetic',
    speed: 1.1,
    pitch: 1.05,
    description: 'Dynamic, inspiring, catalytic energy'
  },
  water: {
    name: '💧 Water - Flowing & Empathetic',
    speed: 0.9,
    pitch: 0.95,
    description: 'Emotional depth, fluid, healing'
  },
  earth: {
    name: '🌍 Earth - Grounded & Stable',
    speed: 0.85,
    pitch: 0.9,
    description: 'Practical, stable, nurturing foundation'
  },
  air: {
    name: '💨 Air - Light & Intellectual',
    speed: 1.05,
    pitch: 1.1,
    description: 'Quick thinking, communicative, clear'
  },
  aether: {
    name: '🌌 Aether - Transcendent & Wise',
    speed: 0.95,
    pitch: 1.0,
    description: 'Sacred emergence, unified consciousness'
  }
};

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  currentConfig,
  onConfigChange,
  onTestVoice
}) => {
  const [config, setConfig] = useState<VoiceConfiguration>(currentConfig);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Update local config when props change
  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  const updateConfig = (updates: Partial<VoiceConfiguration>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const applyElementalPreset = (elementKey: string) => {
    const preset = ELEMENTAL_PRESETS[elementKey as keyof typeof ELEMENTAL_PRESETS];
    if (preset) {
      updateConfig({
        speed: preset.speed,
        pitch: preset.pitch,
        elementalProsody: true
      });
      setSelectedPreset(elementKey);
    }
  };

  const testVoice = async () => {
    setIsPlaying(true);
    try {
      const testText = selectedPreset
        ? `This is how MAIA sounds with ${ELEMENTAL_PRESETS[selectedPreset as keyof typeof ELEMENTAL_PRESETS]?.name} characteristics.`
        : "Hello, this is MAIA. How does my voice sound to you?";

      await onTestVoice(testText);
    } catch (error) {
      console.error('Voice test failed:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const resetToDefaults = () => {
    updateConfig({
      provider: 'openai',
      voice: 'alloy',
      speed: 0.95,
      pitch: 1.0,
      volume: 0.8,
      elementalProsody: true,
      voicePresets: {}
    });
    setSelectedPreset('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            MAIA Voice Configuration
          </CardTitle>
          <CardDescription>
            Customize MAIA's voice characteristics for your optimal experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Voice Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Voice Provider</Label>
            <Select
              value={config.provider}
              onValueChange={(value) => updateConfig({ provider: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select voice provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VOICE_PROVIDERS).map(([key, provider]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-xs text-gray-500">{provider.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <Label htmlFor="voice">Voice Character</Label>
            <Select
              value={config.voice}
              onValueChange={(value) => updateConfig({ voice: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VOICE_PROVIDERS[config.provider]?.voices || {}).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Speech Speed: {config.speed}x</Label>
              <Slider
                value={[config.speed]}
                onValueChange={(value) => updateConfig({ speed: value[0] })}
                min={0.5}
                max={2.0}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Pitch: {config.pitch}x</Label>
              <Slider
                value={[config.pitch]}
                onValueChange={(value) => updateConfig({ pitch: value[0] })}
                min={0.5}
                max={1.5}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Volume: {Math.round(config.volume * 100)}%</Label>
              <Slider
                value={[config.volume]}
                onValueChange={(value) => updateConfig({ volume: value[0] })}
                min={0.1}
                max={1.0}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="elemental-prosody"
                checked={config.elementalProsody}
                onCheckedChange={(checked) => updateConfig({ elementalProsody: checked })}
              />
              <Label htmlFor="elemental-prosody">Elemental Prosody</Label>
            </div>
          </div>

          {/* Test Voice */}
          <div className="flex gap-2">
            <Button
              onClick={testVoice}
              disabled={isPlaying}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Playing...' : 'Test Voice'}
            </Button>

            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Elemental Voice Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Elemental Voice Presets
          </CardTitle>
          <CardDescription>
            Apply elemental characteristics to MAIA's voice based on the four spheres + aether
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(ELEMENTAL_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant={selectedPreset === key ? 'default' : 'outline'}
                onClick={() => applyElementalPreset(key)}
                className="h-auto p-3 flex flex-col items-start text-left"
              >
                <div className="font-medium text-sm">{preset.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {preset.description}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Speed: {preset.speed}x, Pitch: {preset.pitch}x
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceSettings;