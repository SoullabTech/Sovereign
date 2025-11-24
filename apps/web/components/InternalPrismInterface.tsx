"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertCircle, Brain, Heart, Shield, Lightbulb, Zap, Eye } from 'lucide-react';

interface InternalAspectFacet {
  id: string;
  name: string;
  qualities: {
    perspective: string;
    gifts: string[];
    blindSpots: string[];
    needsMet: string[];
    cognitiveStyle: string;
  };
  expression: {
    whenBalanced: string;
    whenOveractive: string;
    whenSuppressed: string;
  };
  framing: {
    introduction: string;
  };
}

interface InternalPerspective {
  aspectName: string;
  viewpoint: string;
  gifts: string;
  limits: string;
  needMet: string;
  whenActive: string;
}

interface InternalDialogue {
  introduction: string;
  perspectives: InternalPerspective[];
  tensions: any[];
  integration: string;
  grounding: string;
  safetyCheck: boolean;
}

const aspectIcons: Record<string, React.ReactNode> = {
  analytical: <Brain className="h-4 w-4" />,
  creative: <Lightbulb className="h-4 w-4" />,
  protective: <Shield className="h-4 w-4" />,
  intuitive: <Eye className="h-4 w-4" />,
  somatic: <Zap className="h-4 w-4" />,
  heart: <Heart className="h-4 w-4" />
};

export default function InternalPrismInterface() {
  const [query, setQuery] = useState('');
  const [selectedAspects, setSelectedAspects] = useState<string[]>([]);
  const [availableAspects, setAvailableAspects] = useState<Record<string, InternalAspectFacet>>({});
  const [dialogue, setDialogue] = useState<InternalDialogue | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAspectDetails, setShowAspectDetails] = useState(false);

  useEffect(() => {
    // Fetch available aspects
    fetch('/api/oracle/prism')
      .then(res => res.json())
      .then(data => {
        if (data.aspects) {
          setAvailableAspects(data.aspects);
        }
      })
      .catch(console.error);
  }, []);

  const handleAspectToggle = (aspectId: string) => {
    setSelectedAspects(prev => 
      prev.includes(aspectId)
        ? prev.filter(id => id !== aspectId)
        : [...prev, aspectId]
    );
  };

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/oracle/prism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          selectedAspects: selectedAspects.length > 0 ? selectedAspects : undefined,
          userProfile: {} // Could be enhanced with actual user profile
        })
      });

      const data = await response.json();
      
      if (data.type === 'internal_dialogue') {
        setDialogue(data.dialogue);
      } else if (data.type === 'safety_redirect') {
        setDialogue({
          introduction: data.message,
          perspectives: [],
          tensions: [],
          integration: data.recommendation,
          grounding: data.grounding,
          safetyCheck: false
        });
      }
    } catch (error) {
      console.error('Error querying prism:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Internal Prism - Multi-Aspect Dialogue
          </CardTitle>
          <CardDescription>
            Explore different internal perspectives on your situation. All voices are aspects of your own wisdom.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              What would you like to explore from multiple perspectives?
            </label>
            <Textarea
              placeholder="e.g., 'I'm considering a career change but feel conflicted about the risks..'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">
                Select Aspects (optional - leave empty for automatic selection)
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAspectDetails(!showAspectDetails)}
              >
                {showAspectDetails ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(availableAspects).map(([id, aspect]) => (
                <Badge
                  key={id}
                  variant={selectedAspects.includes(id) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 text-sm"
                  onClick={() => handleAspectToggle(id)}
                >
                  <span className="mr-2">{aspectIcons[id]}</span>
                  {aspect.name}
                </Badge>
              ))}
            </div>

            {showAspectDetails && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(availableAspects).map(([id, aspect]) => (
                  <Card key={id} className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {aspectIcons[id]}
                      <h4 className="font-medium">{aspect.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {aspect.framing.introduction}
                    </p>
                    <div className="text-xs space-y-1">
                      <p><strong>Perspective:</strong> {aspect.qualities.perspective}</p>
                      <p><strong>Gifts:</strong> {aspect.qualities.gifts.slice(0, 3).join(', ')}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Button 
            onClick={handleQuery}
            disabled={loading || !query.trim()}
            className="w-full"
          >
            {loading ? 'Gathering Perspectives...' : 'Explore Multiple Perspectives'}
          </Button>
        </CardContent>
      </Card>

      {dialogue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Internal Dialogue
            </CardTitle>
            {!dialogue.safetyCheck && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Grounding recommended</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">{dialogue.introduction}</p>
            </div>

            {dialogue.perspectives.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Perspectives</h3>
                {dialogue.perspectives.map((perspective, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {aspectIcons[Object.keys(availableAspects).find(
                        key => availableAspects[key].name === perspective.aspectName
                      ) || 'analytical']}
                      <h4 className="font-medium">{perspective.aspectName}</h4>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <p className="bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                        {perspective.viewpoint}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-green-800"><strong>Offers:</strong> {perspective.gifts}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded">
                          <p className="text-orange-800"><strong>May miss:</strong> {perspective.limits}</p>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground">
                        <strong>Serves your need for:</strong> {perspective.needMet}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {dialogue.tensions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-lg">Creative Tensions</h3>
                {dialogue.tensions.map((tension, index) => (
                  <div key={index} className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-200">
                    <p className="font-medium text-amber-800 mb-2">{tension.nature}</p>
                    <p className="text-sm text-amber-700 mb-2">{tension.creativeEdge}</p>
                    <p className="text-sm text-amber-600">{tension.integration}</p>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-200">
                <h3 className="font-medium text-emerald-800 mb-2">Integration</h3>
                <p className="text-sm text-emerald-700">{dialogue.integration}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-200">
                <h3 className="font-medium text-slate-800 mb-2">Grounding</h3>
                <p className="text-sm text-slate-700">{dialogue.grounding}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}