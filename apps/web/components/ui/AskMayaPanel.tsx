"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Brain, Heart, Users, ExternalLink, ArrowRight, Lightbulb, Shield } from 'lucide-react';
import { askMayaInsights } from '@/lib/oracle/AskMayaInsights';
import type { MayaInsightResponse, LifeContext } from '@/lib/oracle/AskMayaInsights';

interface AskMayaPanelProps {
  className?: string;
}

export function AskMayaPanel({ className }: AskMayaPanelProps) {
  const [step, setStep] = useState<'input' | 'results'>('input');
  const [socialMediaTrigger, setSocialMediaTrigger] = useState('');
  const [personalResonance, setPersonalResonance] = useState('');
  const [seekingType, setSeekingType] = useState<'understanding' | 'resources' | 'validation' | 'next-steps' | 'coping-strategies'>('understanding');
  const [context, setContext] = useState<Partial<LifeContext>>({});
  const [insights, setInsights] = useState<MayaInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!socialMediaTrigger.trim() || !personalResonance.trim()) return;

    setIsLoading(true);
    try {
      const response = askMayaInsights.processQuery(
        socialMediaTrigger,
        personalResonance,
        context,
        seekingType
      );
      setInsights(response);
      setStep('results');
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setSocialMediaTrigger('');
    setPersonalResonance('');
    setContext({});
    setInsights(null);
  };

  if (step === 'results' && insights) {
    return (
      <Card className={`w-full max-w-4xl mx-auto ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="w-6 h-6 text-amber-600" />
              Maya's Insights
            </CardTitle>
            <Button onClick={handleReset} variant="outline" size="sm">
              Ask Another Question
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Validation Message */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-amber-800 font-medium">{insights.validationMessage}</p>
            </div>
          </div>

          <Accordion type="multiple" defaultValue={["clinical", "everyday", "resources"]} className="space-y-4">
            {/* Clinical Context */}
            <AccordionItem value="clinical" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">🧠 Clinical Context</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Primary Consideration</h4>
                    <p className="text-gray-700">{insights.clinicalContext.primaryConsideration}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Also Consider</h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.clinicalContext.differentialFactors.map((factor, index) => (
                        <Badge key={index} variant="secondary">{factor}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Evidence Base</h4>
                    <p className="text-gray-700 text-sm">{insights.clinicalContext.evidenceBase}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Important Limitations</h4>
                    <p className="text-gray-600 text-sm italic">{insights.clinicalContext.limitations}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Everyday Applications */}
            <AccordionItem value="everyday" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold">💡 Everyday Applications</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Try Right Now</h4>
                    <ul className="space-y-1">
                      {insights.everydayApplications.immediateStrategies.map((strategy, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Longer-Term Approaches</h4>
                    <ul className="space-y-1">
                      {insights.everydayApplications.longTermApproaches.map((approach, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{approach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {insights.everydayApplications.workplaceApplications && (
                    <div>
                      <h4 className="font-medium mb-2">At Work/School</h4>
                      <ul className="space-y-1">
                        {insights.everydayApplications.workplaceApplications.map((application, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{application}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Self-Care Adaptations</h4>
                    <ul className="space-y-1">
                      {insights.everydayApplications.selfCareAdaptations.map((adaptation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{adaptation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Resources */}
            <AccordionItem value="resources" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">🔗 Resources & Support</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-4">
                  {insights.resources.map((resource, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={resource.identityAffirming ? "default" : "secondary"}>
                              {resource.type.replace('-', ' ')}
                            </Badge>
                            {resource.identityAffirming && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Identity-Affirming
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold mb-1">{resource.title}</h4>
                          <p className="text-gray-700 text-sm mb-2">{resource.description}</p>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p><strong>Accessibility:</strong> {resource.accessibilityNotes}</p>
                            <p><strong>Cost:</strong> {resource.costInfo}</p>
                          </div>
                        </div>
                        {resource.url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Identity Factors */}
            {insights.intersectionalFactors.length > 0 && (
              <AccordionItem value="identity" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold">🌈 Identity & Context Factors</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ul className="space-y-2">
                    {insights.intersectionalFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Next Steps */}
            <AccordionItem value="next-steps" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold">🎯 Suggested Next Steps</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  {insights.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Brain className="w-6 h-6 text-amber-600" />
          Ask Maya
        </CardTitle>
        <p className="text-gray-600">
          Bridge social media insights with clinical understanding and everyday applications
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              💭 What did you see/read that made you wonder about yourself?
            </label>
            <Textarea
              placeholder="I saw this TikTok about ADHD and how people mask at work..."
              value={socialMediaTrigger}
              onChange={(e) => setSocialMediaTrigger(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              🎯 What specifically resonated with you?
            </label>
            <Textarea
              placeholder="I do that exact thing - I write everything down obsessively and set 15 alarms..."
              value={personalResonance}
              onChange={(e) => setPersonalResonance(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              🔍 What kind of insight are you looking for?
            </label>
            <Select value={seekingType} onValueChange={(value: any) => setSeekingType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="understanding">Understanding - Help me make sense of this</SelectItem>
                <SelectItem value="validation">Validation - Is my experience valid?</SelectItem>
                <SelectItem value="coping-strategies">Coping Strategies - What can I do about it?</SelectItem>
                <SelectItem value="resources">Resources - Where can I get help?</SelectItem>
                <SelectItem value="next-steps">Next Steps - What should I do next?</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional Context */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3 text-gray-700">
              🌍 Optional: Help Maya understand your context
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Age Range</label>
                <Select onValueChange={(value) => setContext(prev => ({ ...prev, ageRange: value as any }))}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teen">Teen</SelectItem>
                    <SelectItem value="young-adult">Young Adult</SelectItem>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="middle-age">Middle Age</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">Work Situation</label>
                <Select onValueChange={(value) => setContext(prev => ({ ...prev, workSituation: value as any }))}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="employed">Employed</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="caregiver">Caregiver</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">Financial Stress</label>
                <Select onValueChange={(value) => setContext(prev => ({ ...prev, financialStress: value as any }))}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">Previous Therapy</label>
                <Select onValueChange={(value) => setContext(prev => ({ ...prev, previousTherapy: value === 'yes' }))}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!socialMediaTrigger.trim() || !personalResonance.trim() || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Analyzing...' : 'Ask Maya'}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Maya provides educational insights, not professional diagnosis or treatment
        </div>
      </CardContent>
    </Card>
  );
}