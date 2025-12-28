'use client';

/**
 * MAIA Self-Awareness Research Panel
 *
 * For researchers and therapists to:
 * - Query MAIA about her architecture
 * - Analyze conversation turns for framework usage
 * - Generate transparency reports
 * - Access architectural documentation
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type DetailLevel = 'minimal' | 'standard' | 'comprehensive';

interface FrameworkSignal {
  framework: string;
  confidence: number;
  indicators: string[];
  description: string;
}

interface FrameworkAnalysis {
  primaryFramework: string | null;
  frameworks: FrameworkSignal[];
  integrationScore: number;
  rationale: string;
}

export function SelfAwarenessPanel() {
  const [activeTab, setActiveTab] = useState('architecture');

  // Architecture tab state
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('standard');
  const [architectureData, setArchitectureData] = useState<any>(null);
  const [architectureLoading, setArchitectureLoading] = useState(false);

  // Framework analysis tab state
  const [userInput, setUserInput] = useState('');
  const [maiaResponse, setMaiaResponse] = useState('');
  const [frameworkAnalysis, setFrameworkAnalysis] = useState<FrameworkAnalysis | null>(null);
  const [transparencyReport, setTransparencyReport] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Explanation tab state
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState<any>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);

  // Fetch architecture context
  const fetchArchitecture = async () => {
    setArchitectureLoading(true);
    try {
      const response = await fetch(`/api/maia/metacognition?detail=${detailLevel}`);
      const data = await response.json();
      setArchitectureData(data);
    } catch (error) {
      console.error('Failed to fetch architecture:', error);
    } finally {
      setArchitectureLoading(false);
    }
  };

  // Analyze framework usage
  const analyzeFrameworks = async () => {
    if (!userInput.trim() || !maiaResponse.trim()) {
      alert('Please provide both user input and MAIA response');
      return;
    }

    setAnalysisLoading(true);
    try {
      const response = await fetch('/api/maia/metacognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          maiaResponse,
          includeTransparencyReport: true
        })
      });
      const data = await response.json();
      setFrameworkAnalysis(data.analysis);
      setTransparencyReport(data.transparencyReport);
    } catch (error) {
      console.error('Failed to analyze frameworks:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Get explanation for specific aspect
  const getExplanation = async () => {
    if (!question.trim()) {
      alert('Please provide a question');
      return;
    }

    setExplanationLoading(true);
    try {
      const response = await fetch('/api/maia/metacognition/explain', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      setExplanation(data);
    } catch (error) {
      console.error('Failed to get explanation:', error);
    } finally {
      setExplanationLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">MAIA Self-Awareness Research Panel</h1>
        <p className="text-muted-foreground">
          For researchers and therapists studying MAIA's therapeutic intelligence
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="architecture">Architecture Context</TabsTrigger>
          <TabsTrigger value="frameworks">Framework Analysis</TabsTrigger>
          <TabsTrigger value="explain">Ask MAIA</TabsTrigger>
        </TabsList>

        {/* Architecture Context Tab */}
        <TabsContent value="architecture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Context</CardTitle>
              <CardDescription>
                Retrieve MAIA's self-knowledge about her implementation, frameworks, and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={detailLevel} onValueChange={(v) => setDetailLevel(v as DetailLevel)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Detail level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchArchitecture} disabled={architectureLoading}>
                  {architectureLoading ? 'Loading...' : 'Fetch Architecture'}
                </Button>
              </div>

              {architectureData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(architectureData.architecture).map(([key, value]) => (
                      <Card key={key}>
                        <CardHeader>
                          <CardTitle className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-xs overflow-auto max-h-40 bg-muted p-3 rounded">
                            {typeof value === 'string' ? value.substring(0, 200) + '...' : JSON.stringify(value, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Capabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {architectureData.capabilities.canExplainArchitecture && (
                          <Badge>Can Explain Architecture</Badge>
                        )}
                        {architectureData.capabilities.canTrackFrameworks && (
                          <Badge>Can Track Frameworks</Badge>
                        )}
                        {architectureData.capabilities.canProvideTransparency && (
                          <Badge>Can Provide Transparency</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Framework Analysis Tab */}
        <TabsContent value="frameworks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Therapeutic Framework Analysis</CardTitle>
              <CardDescription>
                Analyze a conversation turn to detect which therapeutic frameworks MAIA is using
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">User Input</label>
                <Textarea
                  placeholder="e.g., I'm feeling anxious about an upcoming meeting"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">MAIA Response</label>
                <Textarea
                  placeholder="e.g., I hear that anxiety. Where do you feel it in your body right now?"
                  value={maiaResponse}
                  onChange={(e) => setMaiaResponse(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={analyzeFrameworks} disabled={analysisLoading}>
                {analysisLoading ? 'Analyzing...' : 'Analyze Frameworks'}
              </Button>

              {frameworkAnalysis && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Primary Framework:</p>
                        <Badge className="text-base">{frameworkAnalysis.primaryFramework || 'None detected'}</Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Integration Score:</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted h-4 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all"
                              style={{ width: `${frameworkAnalysis.integrationScore * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{(frameworkAnalysis.integrationScore * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Detected Frameworks:</p>
                        <div className="space-y-2">
                          {frameworkAnalysis.frameworks.map((fw, i) => (
                            <Card key={i}>
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium capitalize">
                                    {fw.framework.replace(/-/g, ' ')}
                                  </span>
                                  <Badge variant="outline">{(fw.confidence * 100).toFixed(1)}%</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{fw.description}</p>
                                <p className="text-xs">
                                  <strong>Indicators:</strong> {fw.indicators.join(', ')}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Rationale:</p>
                        <p className="text-sm text-muted-foreground">{frameworkAnalysis.rationale}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {transparencyReport && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Transparency Report</CardTitle>
                        <CardDescription>Full analysis for research documentation</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs overflow-auto max-h-96 bg-muted p-4 rounded whitespace-pre-wrap">
                          {transparencyReport}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ask MAIA Tab */}
        <TabsContent value="explain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ask MAIA to Explain</CardTitle>
              <CardDescription>
                Get MAIA's explanation about specific aspects of her architecture or process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Question</label>
                <Textarea
                  placeholder="e.g., How do you decide which processing path to use?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={getExplanation} disabled={explanationLoading}>
                {explanationLoading ? 'Getting Explanation...' : 'Ask MAIA'}
              </Button>

              {explanation && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detected Aspect</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="text-base">{explanation.aspect}</Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Relevant Context</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm overflow-auto max-h-96 bg-muted p-4 rounded whitespace-pre-wrap">
                        {explanation.relevantContext}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{explanation.suggestion}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentation Link */}
      <Card className="bg-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            📚 For full documentation, see:{' '}
            <code className="bg-background px-2 py-1 rounded">
              /docs/MAIA_SELF_AWARENESS_GUIDE.md
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
