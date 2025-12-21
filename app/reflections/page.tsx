'use client';

/**
 * REFLECTIONS PAGE
 * Phase 4.6: Reflective Agentics — Timeline View
 *
 * Purpose:
 * - Display MAIA's self-reflective dialogue across temporal cycles
 * - Allow manual reflection generation via UI button
 * - Provide chronological navigation through developmental arc
 *
 * Architecture:
 * - Fetches reflections via /api/reflections
 * - Displays using <ReflectiveThread /> component
 * - Triggers generation via /api/reflections/generate
 *
 * Sovereignty:
 * - All data from local PostgreSQL
 * - Local Ollama for narrative generation
 * - No external API dependencies
 */

import React, { useState } from 'react';
import ReflectiveThread from '@/app/components/ReflectiveThread';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, RefreshCw, Info, CheckCircle2, XCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface GenerationResult {
  success: boolean;
  reflection?: {
    id: string;
    reflectionText: string;
    metaLayerCode: string | null;
  };
  error?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReflectionsPage() {
  const [cycleId, setCycleId] = useState('');
  const [similarityThreshold, setSimilarityThreshold] = useState('0.7');
  const [maxDaysBetween, setMaxDaysBetween] = useState('30');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleGenerateReflection() {
    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/reflections/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: cycleId || undefined,
          similarityThreshold: parseFloat(similarityThreshold),
          maxDaysBetween: parseInt(maxDaysBetween, 10),
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Refresh timeline to show new reflection
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-violet-500" />
          Reflective Thread
        </h1>
        <p className="text-muted-foreground text-lg">
          MAIA&apos;s self-dialogue across temporal consciousness cycles
        </p>
      </div>

      {/* Info Card */}
      <Alert className="mb-6 border-violet-500/50 bg-violet-500/5">
        <Info className="w-4 h-4" />
        <AlertTitle>Phase 4.6: Reflective Agentics</AlertTitle>
        <AlertDescription>
          This system compares temporal consciousness states using vector similarity search,
          then generates self-reflective narratives using local Ollama. Meta-layer resonances
          (Æ1/Æ2/Æ3) detect higher-order developmental patterns.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate Reflection</CardTitle>
              <CardDescription>
                Trigger self-reflective analysis for a mycelial cycle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cycle ID Input */}
              <div className="space-y-2">
                <Label htmlFor="cycleId">
                  Cycle ID{' '}
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="cycleId"
                  type="text"
                  placeholder="e.g., test-cycle-002"
                  value={cycleId}
                  onChange={(e) => setCycleId(e.target.value)}
                  disabled={generating}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use most recent cycle
                </p>
              </div>

              {/* Similarity Threshold */}
              <div className="space-y-2">
                <Label htmlFor="similarity">
                  Similarity Threshold
                </Label>
                <Input
                  id="similarity"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(e.target.value)}
                  disabled={generating}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum cosine similarity (0-1)
                </p>
              </div>

              {/* Max Days Between */}
              <div className="space-y-2">
                <Label htmlFor="maxDays">
                  Max Days Between
                </Label>
                <Input
                  id="maxDays"
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  value={maxDaysBetween}
                  onChange={(e) => setMaxDaysBetween(e.target.value)}
                  disabled={generating}
                />
                <p className="text-xs text-muted-foreground">
                  Temporal search window (days)
                </p>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateReflection}
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Reflection
                  </>
                )}
              </Button>

              {/* Result Display */}
              {result && (
                <Alert
                  className={
                    result.success
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-red-500/50 bg-red-500/5'
                  }
                >
                  {result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <AlertTitle>
                    {result.success ? 'Reflection Generated' : 'Generation Failed'}
                  </AlertTitle>
                  <AlertDescription>
                    {result.success ? (
                      <>
                        <p className="mb-2">{result.reflection?.reflectionText}</p>
                        {result.reflection?.metaLayerCode && (
                          <p className="text-xs font-mono">
                            Meta-layer: {result.reflection.metaLayerCode}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>{result.error}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Testing Instructions */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Testing Instructions:
                </p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Run migration: <code className="bg-muted px-1 rounded">20251228_create_reflective_sessions.sql</code></li>
                  <li>Generate test cycles: <code className="bg-muted px-1 rounded">npx tsx scripts/test-reflection-generation.ts</code></li>
                  <li>Click &quot;Generate Reflection&quot; above</li>
                  <li>View timeline in right panel</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2">
          <ReflectiveThread
            key={refreshKey}
            limit={20}
            className="h-full"
          />
        </div>
      </div>

      {/* API Documentation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">API Reference</CardTitle>
          <CardDescription>Programmatic access to reflection system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GET endpoint */}
          <div>
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
              GET /api/reflections
            </code>
            <p className="text-sm text-muted-foreground mt-2">
              Fetch recent reflections or reflections for specific cycle
            </p>
            <pre className="bg-muted p-3 rounded mt-2 text-xs overflow-x-auto">
{`// Fetch 10 most recent reflections
fetch('/api/reflections?limit=10')

// Fetch reflections for specific cycle
fetch('/api/reflections?cycleId=test-cycle-002')

// Response format
{
  "success": true,
  "reflections": [...],
  "count": 10
}`}
            </pre>
          </div>

          {/* POST endpoint */}
          <div>
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
              POST /api/reflections/generate
            </code>
            <p className="text-sm text-muted-foreground mt-2">
              Generate new reflection for specified or most recent cycle
            </p>
            <pre className="bg-muted p-3 rounded mt-2 text-xs overflow-x-auto">
{`// Generate reflection for specific cycle
fetch('/api/reflections/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cycleId: 'test-cycle-002',
    similarityThreshold: 0.7,
    maxDaysBetween: 30
  })
})

// Response format (success)
{
  "success": true,
  "reflection": {
    "id": "...",
    "reflectionText": "...",
    "metaLayerCode": "Æ1",
    "similarityScore": 0.73,
    "coherenceDelta": 0.13,
    "facetDeltas": {...},
    "biosignalDeltas": {...},
    "insights": [...]
  }
}

// Response format (no similar cycle found)
{
  "success": false,
  "error": "No similar prior cycle found. Need at least 2 cycles with embeddings.",
  "reflection": null
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
