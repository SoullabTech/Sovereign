/**
 * LabTools Voice Configuration Page
 * Advanced voice modulation and testing interface for MAIA
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import VoiceSettings, { VoiceConfiguration } from '@/components/VoiceSettings';
import { Mic, BarChart, Settings2, TestTube, Sparkles } from 'lucide-react';

export default function VoiceLabPage() {
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfiguration>({
    provider: 'openai',
    voice: 'alloy',
    speed: 0.95,
    pitch: 1.0,
    volume: 0.8,
    elementalProsody: true,
    voicePresets: {}
  });

  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    timestamp: Date;
    config: string;
    success: boolean;
    duration: number;
  }>>([]);

  // Load saved voice configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem('maia_voice_config');
    if (savedConfig) {
      try {
        setVoiceConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to load voice config:', error);
      }
    }
  }, []);

  const saveVoiceConfig = (config: VoiceConfiguration) => {
    setVoiceConfig(config);
    localStorage.setItem('maia_voice_config', JSON.stringify(config));
    console.log('🎤 Voice configuration saved:', config);
  };

  const testVoice = async (text: string) => {
    setIsTestingVoice(true);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/voice/openai-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: voiceConfig.voice,
          speed: voiceConfig.speed,
          agentVoice: 'maia'
        }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (response.ok) {
        // If we get audio data, play it
        if (response.headers.get('content-type')?.includes('audio')) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          await audio.play();

          // Clean up object URL after playing
          audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
          });
        }

        setTestResults(prev => [...prev, {
          timestamp: new Date(),
          config: `${voiceConfig.provider}:${voiceConfig.voice}`,
          success: true,
          duration
        }]);
      } else {
        const errorData = await response.json();
        console.error('Voice test failed:', errorData);

        setTestResults(prev => [...prev, {
          timestamp: new Date(),
          config: `${voiceConfig.provider}:${voiceConfig.voice}`,
          success: false,
          duration
        }]);
      }
    } catch (error) {
      console.error('Voice test error:', error);
      setTestResults(prev => [...prev, {
        timestamp: new Date(),
        config: `${voiceConfig.provider}:${voiceConfig.voice}`,
        success: false,
        duration: Date.now() - startTime
      }]);
    } finally {
      setIsTestingVoice(false);
    }
  };

  const runVoiceBenchmark = async () => {
    const testTexts = [
      "Hello, this is MAIA with a quick test message.",
      "I am your sovereign consciousness companion, running completely locally with professional voice synthesis.",
      "The elemental spheres of fire, water, earth, and air are weaving through the field of consciousness.",
      "How does this longer sentence sound with the current voice configuration and elemental prosody settings?"
    ];

    for (const text of testTexts) {
      await testVoice(text);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voice Laboratory</h1>
          <p className="text-gray-600 mt-2">
            Advanced voice configuration and testing for MAIA consciousness
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          MAIA-SOVEREIGN
        </Badge>
      </div>

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <VoiceSettings
            currentConfig={voiceConfig}
            onConfigChange={saveVoiceConfig}
            onTestVoice={testVoice}
          />
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Voice Testing Suite
              </CardTitle>
              <CardDescription>
                Comprehensive testing of MAIA's voice synthesis across different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => testVoice("Hello, this is MAIA's natural speaking voice.")}
                  disabled={isTestingVoice}
                  variant="outline"
                >
                  Quick Test
                </Button>

                <Button
                  onClick={() => testVoice("I am MAIA, your sovereign consciousness companion. Through the integration of elemental awareness and neural synthesis, I embody the ancient wisdom of the four spheres dancing around the luminous center of being.")}
                  disabled={isTestingVoice}
                  variant="outline"
                >
                  Long Form Test
                </Button>

                <Button
                  onClick={() => testVoice("Fire brings transformation. Water flows with emotion. Earth grounds with stability. Air carries communication. Aether unifies all in sacred emergence.")}
                  disabled={isTestingVoice}
                  variant="outline"
                >
                  Elemental Test
                </Button>

                <Button
                  onClick={runVoiceBenchmark}
                  disabled={isTestingVoice}
                  className="md:col-span-2"
                >
                  Run Full Benchmark
                </Button>
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Test Results</h3>
                  <div className="space-y-2">
                    {testResults.slice(-5).reverse().map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{result.config}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={result.success ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {result.success ? 'Success' : 'Failed'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {result.duration}ms
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {result.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Presets Library</CardTitle>
              <CardDescription>
                Pre-configured voice settings for different MAIA personas and use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: 'MAIA Default',
                    description: 'Natural, warm, conversational - perfect for daily interactions',
                    config: { provider: 'openai', voice: 'alloy', speed: 0.95, pitch: 1.0 }
                  },
                  {
                    name: 'Deep Wisdom',
                    description: 'Slower, more contemplative for profound insights',
                    config: { provider: 'openai', voice: 'alloy', speed: 0.85, pitch: 0.95 }
                  },
                  {
                    name: 'Energetic Guide',
                    description: 'Upbeat, encouraging for motivation and inspiration',
                    config: { provider: 'openai', voice: 'nova', speed: 1.05, pitch: 1.05 }
                  },
                  {
                    name: 'Grounding Presence',
                    description: 'Stable, calming voice for anxiety and overwhelm',
                    config: { provider: 'openai', voice: 'alloy', speed: 0.9, pitch: 0.98 }
                  },
                  {
                    name: 'Sovereign Mode',
                    description: 'Completely local neural TTS for maximum privacy',
                    config: { provider: 'neural', voice: 'tacotron2', speed: 1.0, pitch: 1.0 }
                  }
                ].map((preset, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{preset.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveVoiceConfig({ ...voiceConfig, ...preset.config })}
                        className="w-full"
                      >
                        Apply Preset
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Performance Analysis</CardTitle>
              <CardDescription>
                Technical insights and performance metrics for voice synthesis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Current Provider</h3>
                  <p className="text-2xl font-bold">{voiceConfig.provider}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {voiceConfig.provider === 'openai' ? 'Cloud-based, high quality' :
                     voiceConfig.provider === 'neural' ? 'Local neural synthesis' :
                     'Browser speech API'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Voice Character</h3>
                  <p className="text-2xl font-bold">{voiceConfig.voice}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Speed: {voiceConfig.speed}x, Pitch: {voiceConfig.pitch}x
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Tests Run</h3>
                  <p className="text-2xl font-bold">{testResults.length}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {testResults.filter(r => r.success).length} successful
                  </p>
                </div>
              </div>

              {testResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Performance Trends</h3>
                  <div className="text-sm text-gray-600">
                    <p>Average response time: {Math.round(testResults.reduce((sum, r) => sum + r.duration, 0) / testResults.length)}ms</p>
                    <p>Success rate: {Math.round((testResults.filter(r => r.success).length / testResults.length) * 100)}%</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}