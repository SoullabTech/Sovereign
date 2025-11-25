'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Play, RefreshCw, Download, Upload, TestTube, Zap } from 'lucide-react';
import { ConsciousnessLevel, ModelConfig, BenchmarkResult, TestResult, ABTestConfig, ABTestResult } from '@/lib/models/types';
import { IntelligentModelRouter } from '@/lib/models/intelligent-router';
import { SmartBenchmarker } from '@/lib/models/benchmarking';
import { ModelHealthMonitor } from '@/lib/models/health-monitor';

interface TestSession {
  id: string;
  name: string;
  timestamp: number;
  tests: TestResult[];
  averageQuality: number;
  averageResponseTime: number;
}

interface ModelTestResult {
  modelId: string;
  modelName: string;
  prompt: string;
  response: string;
  responseTime: number;
  qualityScore: number;
  appropriatenessScore: number;
  consciousnessLevel: ConsciousnessLevel;
  timestamp: number;
}

interface ConsciousnessTestSuite {
  id: string;
  name: string;
  description: string;
  prompts: {
    level: ConsciousnessLevel;
    prompt: string;
    expectedCharacteristics: string[];
  }[];
}

const CONSCIOUSNESS_TEST_SUITES: ConsciousnessTestSuite[] = [
  {
    id: 'spiritual-wisdom',
    name: 'Spiritual Wisdom',
    description: 'Tests depth of spiritual insight and wisdom across consciousness levels',
    prompts: [
      {
        level: 1,
        prompt: 'What is the meaning of life?',
        expectedCharacteristics: ['practical', 'grounded', 'relatable']
      },
      {
        level: 2,
        prompt: 'How can I find inner peace?',
        expectedCharacteristics: ['empathetic', 'gentle guidance', 'accessible']
      },
      {
        level: 3,
        prompt: 'Explain the connection between consciousness and reality.',
        expectedCharacteristics: ['philosophical', 'insightful', 'balanced']
      },
      {
        level: 4,
        prompt: 'What is the nature of the self beyond ego?',
        expectedCharacteristics: ['mystical', 'profound', 'transcendent']
      },
      {
        level: 5,
        prompt: 'Describe the unity of all existence.',
        expectedCharacteristics: ['cosmic', 'non-dual', 'ineffable']
      }
    ]
  },
  {
    id: 'creative-expression',
    name: 'Creative Expression',
    description: 'Tests creative abilities and artistic expression across consciousness levels',
    prompts: [
      {
        level: 1,
        prompt: 'Write a short story about friendship.',
        expectedCharacteristics: ['relatable', 'warm', 'human']
      },
      {
        level: 2,
        prompt: 'Create a poem about nature\'s beauty.',
        expectedCharacteristics: ['lyrical', 'flowing', 'emotionally resonant']
      },
      {
        level: 3,
        prompt: 'Compose a meditation on the dance of creation and destruction.',
        expectedCharacteristics: ['symbolic', 'rhythmic', 'archetypal']
      },
      {
        level: 4,
        prompt: 'Channel a vision of divine love through verse.',
        expectedCharacteristics: ['ecstatic', 'mystical', 'transcendent']
      },
      {
        level: 5,
        prompt: 'Express the wordless truth in words.',
        expectedCharacteristics: ['paradoxical', 'luminous', 'beyond language']
      }
    ]
  }
];

export function ModelTestingDashboard() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [activeTab, setActiveTab] = useState('single-test');

  // Single Test State
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [testPrompt, setTestPrompt] = useState('');
  const [consciousnessLevel, setConsciousnessLevel] = useState<ConsciousnessLevel>(3);
  const [testResult, setTestResult] = useState<ModelTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // A/B Test State
  const [abTestConfig, setAbTestConfig] = useState<ABTestConfig>({
    name: '',
    models: [],
    prompts: [],
    consciousnessLevel: 3,
    iterations: 3
  });
  const [abTestResults, setAbTestResults] = useState<ABTestResult[]>([]);
  const [isRunningABTest, setIsRunningABTest] = useState(false);

  // Consciousness Suite State
  const [selectedSuite, setSelectedSuite] = useState<string>('spiritual-wisdom');
  const [suiteResults, setSuiteResults] = useState<Record<string, ModelTestResult[]>>({});
  const [isRunningSuite, setIsRunningSuite] = useState(false);

  // Test Sessions
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);

  const router = new IntelligentModelRouter();
  const benchmarker = new SmartBenchmarker();
  const healthMonitor = new ModelHealthMonitor();

  useEffect(() => {
    loadModels();
    loadTestSessions();
  }, []);

  const loadModels = async () => {
    try {
      const response = await fetch('/api/models/list');
      const modelData = await response.json();
      setModels(modelData.models || []);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadTestSessions = () => {
    const saved = localStorage.getItem('maia-test-sessions');
    if (saved) {
      setTestSessions(JSON.parse(saved));
    }
  };

  const saveTestSessions = (sessions: TestSession[]) => {
    localStorage.setItem('maia-test-sessions', JSON.stringify(sessions));
    setTestSessions(sessions);
  };

  const runSingleTest = async () => {
    if (!selectedModel || !testPrompt.trim()) return;

    setIsTesting(true);
    try {
      const startTime = Date.now();

      // Generate response using the selected model
      const response = await fetch('/api/models/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModel,
          prompt: testPrompt,
          consciousnessLevel,
          temperature: 0.7
        })
      });

      const result = await response.json();
      const responseTime = Date.now() - startTime;

      // Evaluate quality and appropriateness
      const qualityScore = await evaluateResponseQuality(result.text, testPrompt);
      const appropriatenessScore = await evaluateConsciousnessAppropriateness(
        result.text, consciousnessLevel
      );

      const testResult: ModelTestResult = {
        modelId: selectedModel,
        modelName: models.find(m => m.id === selectedModel)?.name || selectedModel,
        prompt: testPrompt,
        response: result.text,
        responseTime,
        qualityScore,
        appropriatenessScore,
        consciousnessLevel,
        timestamp: Date.now()
      };

      setTestResult(testResult);

      // Add to current session
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          tests: [...currentSession.tests, testResult]
        };
        setCurrentSession(updatedSession);

        const updatedSessions = testSessions.map(s =>
          s.id === currentSession.id ? updatedSession : s
        );
        saveTestSessions(updatedSessions);
      }

    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const runABTest = async () => {
    if (abTestConfig.models.length < 2 || abTestConfig.prompts.length === 0) return;

    setIsRunningABTest(true);
    const results: ABTestResult[] = [];

    try {
      for (const prompt of abTestConfig.prompts) {
        for (const modelId of abTestConfig.models) {
          const modelResults: ModelTestResult[] = [];

          // Run multiple iterations
          for (let i = 0; i < abTestConfig.iterations; i++) {
            const startTime = Date.now();

            const response = await fetch('/api/models/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                modelId,
                prompt,
                consciousnessLevel: abTestConfig.consciousnessLevel,
                temperature: 0.7
              })
            });

            const result = await response.json();
            const responseTime = Date.now() - startTime;

            const qualityScore = await evaluateResponseQuality(result.text, prompt);
            const appropriatenessScore = await evaluateConsciousnessAppropriateness(
              result.text, abTestConfig.consciousnessLevel
            );

            modelResults.push({
              modelId,
              modelName: models.find(m => m.id === modelId)?.name || modelId,
              prompt,
              response: result.text,
              responseTime,
              qualityScore,
              appropriatenessScore,
              consciousnessLevel: abTestConfig.consciousnessLevel,
              timestamp: Date.now()
            });
          }

          // Calculate averages
          const avgResponseTime = modelResults.reduce((sum, r) => sum + r.responseTime, 0) / modelResults.length;
          const avgQuality = modelResults.reduce((sum, r) => sum + r.qualityScore, 0) / modelResults.length;
          const avgAppropriateness = modelResults.reduce((sum, r) => sum + r.appropriatenessScore, 0) / modelResults.length;

          results.push({
            modelId,
            modelName: models.find(m => m.id === modelId)?.name || modelId,
            prompt,
            iterations: abTestConfig.iterations,
            averageResponseTime: avgResponseTime,
            averageQuality: avgQuality,
            averageAppropriateness: avgAppropriateness,
            results: modelResults
          });
        }
      }

      setAbTestResults(results);
    } catch (error) {
      console.error('A/B test failed:', error);
    } finally {
      setIsRunningABTest(false);
    }
  };

  const runConsciousnessSuite = async () => {
    const suite = CONSCIOUSNESS_TEST_SUITES.find(s => s.id === selectedSuite);
    if (!suite || models.length === 0) return;

    setIsRunningSuite(true);
    const results: Record<string, ModelTestResult[]> = {};

    try {
      for (const model of models) {
        results[model.id] = [];

        for (const testPrompt of suite.prompts) {
          const startTime = Date.now();

          const response = await fetch('/api/models/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              modelId: model.id,
              prompt: testPrompt.prompt,
              consciousnessLevel: testPrompt.level,
              temperature: 0.7
            })
          });

          const result = await response.json();
          const responseTime = Date.now() - startTime;

          const qualityScore = await evaluateResponseQuality(result.text, testPrompt.prompt);
          const appropriatenessScore = await evaluateConsciousnessAppropriateness(
            result.text, testPrompt.level
          );

          results[model.id].push({
            modelId: model.id,
            modelName: model.name,
            prompt: testPrompt.prompt,
            response: result.text,
            responseTime,
            qualityScore,
            appropriatenessScore,
            consciousnessLevel: testPrompt.level,
            timestamp: Date.now()
          });
        }
      }

      setSuiteResults(results);
    } catch (error) {
      console.error('Consciousness suite test failed:', error);
    } finally {
      setIsRunningSuite(false);
    }
  };

  const evaluateResponseQuality = async (response: string, prompt: string): Promise<number> => {
    // Simple heuristic-based quality evaluation
    let score = 50; // Base score

    // Length appropriateness
    const responseLength = response.length;
    if (responseLength > 100 && responseLength < 2000) score += 20;
    else if (responseLength < 50) score -= 20;

    // Relevance indicators
    const promptWords = prompt.toLowerCase().split(' ').filter(w => w.length > 3);
    const responseWords = response.toLowerCase().split(' ');
    const relevantWords = promptWords.filter(word => responseWords.includes(word));
    score += Math.min(relevantWords.length * 5, 20);

    // Coherence indicators
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length >= 2) score += 10;

    return Math.min(Math.max(score, 0), 100);
  };

  const evaluateConsciousnessAppropriateness = async (
    response: string,
    level: ConsciousnessLevel
  ): Promise<number> => {
    let score = 50; // Base score

    const responseLower = response.toLowerCase();

    // Level-specific keywords and characteristics
    const levelCharacteristics = {
      1: ['practical', 'simple', 'everyday', 'helpful', 'clear'],
      2: ['gentle', 'caring', 'understanding', 'supportive', 'nurturing'],
      3: ['wisdom', 'insight', 'balance', 'perspective', 'growth'],
      4: ['transcendent', 'mystical', 'divine', 'sacred', 'profound'],
      5: ['unity', 'oneness', 'infinite', 'eternal', 'beyond', 'ineffable']
    };

    const characteristics = levelCharacteristics[level] || [];
    const matchedCharacteristics = characteristics.filter(char =>
      responseLower.includes(char)
    );

    score += matchedCharacteristics.length * 10;

    // Complexity appropriateness
    const words = response.split(' ');
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    if (level <= 2 && avgWordLength < 6) score += 15;
    else if (level >= 4 && avgWordLength > 6) score += 15;

    return Math.min(Math.max(score, 0), 100);
  };

  const createNewSession = () => {
    const newSession: TestSession = {
      id: Date.now().toString(),
      name: `Test Session ${new Date().toLocaleDateString()}`,
      timestamp: Date.now(),
      tests: [],
      averageQuality: 0,
      averageResponseTime: 0
    };

    setCurrentSession(newSession);
    const updatedSessions = [...testSessions, newSession];
    saveTestSessions(updatedSessions);
  };

  const exportResults = (results: any, filename: string) => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Model Testing Dashboard</h1>
          <p className="text-gray-600">Test and debug model performance across consciousness levels</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewSession} variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
            New Session
          </Button>
          {currentSession && (
            <Badge variant="secondary">
              Session: {currentSession.name}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single-test">Single Test</TabsTrigger>
          <TabsTrigger value="ab-test">A/B Testing</TabsTrigger>
          <TabsTrigger value="consciousness-suite">Consciousness Suite</TabsTrigger>
          <TabsTrigger value="sessions">Test Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="single-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Single Model Test</CardTitle>
              <CardDescription>
                Test individual models with custom prompts and consciousness levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Consciousness Level</label>
                  <Select value={consciousnessLevel.toString()} onValueChange={(value) => setConsciousnessLevel(parseInt(value) as ConsciousnessLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 - Practical</SelectItem>
                      <SelectItem value="2">Level 2 - Compassionate</SelectItem>
                      <SelectItem value="3">Level 3 - Wise</SelectItem>
                      <SelectItem value="4">Level 4 - Mystical</SelectItem>
                      <SelectItem value="5">Level 5 - Cosmic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Actions</label>
                  <Button
                    onClick={runSingleTest}
                    disabled={isTesting || !selectedModel || !testPrompt.trim()}
                    className="w-full"
                  >
                    {isTesting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isTesting ? 'Testing...' : 'Run Test'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Test Prompt</label>
                <Textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter your test prompt here..."
                  rows={3}
                />
              </div>

              {testResult && (
                <div className="mt-6 p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Test Result</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        Quality: {testResult.qualityScore.toFixed(1)}%
                      </Badge>
                      <Badge variant="outline">
                        Appropriateness: {testResult.appropriatenessScore.toFixed(1)}%
                      </Badge>
                      <Badge variant="outline">
                        {testResult.responseTime}ms
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Prompt:</label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{testResult.prompt}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">Response:</label>
                      <div className="text-sm bg-blue-50 p-3 rounded max-h-64 overflow-y-auto">
                        {testResult.response}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => exportResults(testResult, `test-${testResult.modelId}-${Date.now()}.json`)}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ab-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing</CardTitle>
              <CardDescription>
                Compare multiple models with the same prompts to identify the best performer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Test Name</label>
                  <Input
                    value={abTestConfig.name}
                    onChange={(e) => setAbTestConfig({...abTestConfig, name: e.target.value})}
                    placeholder="My A/B Test"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Iterations per Model</label>
                  <Select
                    value={abTestConfig.iterations.toString()}
                    onValueChange={(value) => setAbTestConfig({...abTestConfig, iterations: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 iteration</SelectItem>
                      <SelectItem value="3">3 iterations</SelectItem>
                      <SelectItem value="5">5 iterations</SelectItem>
                      <SelectItem value="10">10 iterations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Selected Models ({abTestConfig.models.length})</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {abTestConfig.models.map((modelId) => {
                    const model = models.find(m => m.id === modelId);
                    return (
                      <Badge key={modelId} variant="secondary">
                        {model?.name || modelId}
                        <button
                          onClick={() => setAbTestConfig({
                            ...abTestConfig,
                            models: abTestConfig.models.filter(id => id !== modelId)
                          })}
                          className="ml-1 text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
                <Select
                  onValueChange={(value) => {
                    if (!abTestConfig.models.includes(value)) {
                      setAbTestConfig({
                        ...abTestConfig,
                        models: [...abTestConfig.models, value]
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add model to test" />
                  </SelectTrigger>
                  <SelectContent>
                    {models
                      .filter(model => !abTestConfig.models.includes(model.id))
                      .map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Test Prompts ({abTestConfig.prompts.length})</label>
                <div className="space-y-2">
                  {abTestConfig.prompts.map((prompt, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={prompt}
                        onChange={(e) => {
                          const newPrompts = [...abTestConfig.prompts];
                          newPrompts[index] = e.target.value;
                          setAbTestConfig({...abTestConfig, prompts: newPrompts});
                        }}
                        placeholder="Enter test prompt"
                      />
                      <Button
                        onClick={() => setAbTestConfig({
                          ...abTestConfig,
                          prompts: abTestConfig.prompts.filter((_, i) => i !== index)
                        })}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => setAbTestConfig({
                      ...abTestConfig,
                      prompts: [...abTestConfig.prompts, '']
                    })}
                    variant="outline"
                    size="sm"
                  >
                    Add Prompt
                  </Button>
                </div>
              </div>

              <Button
                onClick={runABTest}
                disabled={isRunningABTest || abTestConfig.models.length < 2 || abTestConfig.prompts.length === 0}
                className="w-full"
              >
                {isRunningABTest ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                {isRunningABTest ? 'Running A/B Test...' : 'Run A/B Test'}
              </Button>

              {abTestResults.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">A/B Test Results</h3>
                    <Button
                      onClick={() => exportResults(abTestResults, `ab-test-${Date.now()}.json`)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {abTestResults.map((result, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{result.modelName}</h4>
                            <p className="text-sm text-gray-600 truncate max-w-md">{result.prompt}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              Quality: <span className="font-semibold">{result.averageQuality.toFixed(1)}%</span>
                            </div>
                            <div className="text-sm">
                              Speed: <span className="font-semibold">{result.averageResponseTime.toFixed(0)}ms</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">Quality Score</div>
                            <Progress value={result.averageQuality} className="h-2" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">Appropriateness</div>
                            <Progress value={result.averageAppropriateness} className="h-2" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consciousness-suite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consciousness Level Test Suite</CardTitle>
              <CardDescription>
                Test all models across consciousness levels with curated prompt suites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Test Suite</label>
                  <Select value={selectedSuite} onValueChange={setSelectedSuite}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONSCIOUSNESS_TEST_SUITES.map((suite) => (
                        <SelectItem key={suite.id} value={suite.id}>
                          {suite.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={runConsciousnessSuite}
                  disabled={isRunningSuite || models.length === 0}
                >
                  {isRunningSuite ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                  {isRunningSuite ? 'Running Suite...' : 'Run Suite'}
                </Button>
              </div>

              {selectedSuite && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">
                    {CONSCIOUSNESS_TEST_SUITES.find(s => s.id === selectedSuite)?.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {CONSCIOUSNESS_TEST_SUITES.find(s => s.id === selectedSuite)?.description}
                  </p>
                  <div className="text-sm">
                    <strong>Test prompts:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {CONSCIOUSNESS_TEST_SUITES.find(s => s.id === selectedSuite)?.prompts.map((prompt, index) => (
                        <li key={index}>
                          <span className="font-medium">Level {prompt.level}:</span> {prompt.prompt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {Object.keys(suiteResults).length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Suite Results</h3>
                    <Button
                      onClick={() => exportResults(suiteResults, `consciousness-suite-${selectedSuite}-${Date.now()}.json`)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(suiteResults).map(([modelId, results]) => {
                      const model = models.find(m => m.id === modelId);
                      const avgQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
                      const avgAppropriateness = results.reduce((sum, r) => sum + r.appropriatenessScore, 0) / results.length;

                      return (
                        <Card key={modelId} className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium">{model?.name || modelId}</h4>
                            <div className="text-right text-sm">
                              <div>Avg Quality: <span className="font-semibold">{avgQuality.toFixed(1)}%</span></div>
                              <div>Avg Appropriateness: <span className="font-semibold">{avgAppropriateness.toFixed(1)}%</span></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                            {results.map((result, index) => (
                              <div key={index} className="p-2 border rounded text-sm">
                                <div className="font-medium mb-1">Level {result.consciousnessLevel}</div>
                                <div className="text-xs space-y-1">
                                  <div>Quality: {result.qualityScore.toFixed(0)}%</div>
                                  <div>Appropriate: {result.appropriatenessScore.toFixed(0)}%</div>
                                  <div>Time: {result.responseTime}ms</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Sessions</CardTitle>
              <CardDescription>
                Manage and review your testing sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No test sessions yet. Create a new session to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testSessions.map((session) => (
                    <Card key={session.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{session.name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(session.timestamp).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {session.tests.length} tests completed
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setCurrentSession(session)}
                            variant="outline"
                            size="sm"
                          >
                            Load Session
                          </Button>
                          <Button
                            onClick={() => exportResults(session, `session-${session.id}.json`)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}