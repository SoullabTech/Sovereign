'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  Flag,
  FileText,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

interface IPPAssessmentProps {
  clientId: string;
  practitionerId: string;
  onComplete?: (results: AssessmentResults) => void;
  onSave?: (progress: AssessmentProgress) => void;
  existingProgress?: AssessmentProgress;
}

interface AssessmentQuestion {
  questionId: number;
  element: Element;
  questionText: string;
  category: string;
  responseType: 'likert_5' | 'yes_no' | 'multiple_choice';
  options: ResponseOption[];
  clinicalNotes?: string;
  traumaIndicator?: boolean;
  attachmentRelevant?: boolean;
}

interface ResponseOption {
  value: number;
  label: string;
  description?: string;
}

interface QuestionResponse {
  questionId: number;
  response: number;
  notes?: string;
  responseTime?: number;
  flagged?: boolean;
}

interface AssessmentProgress {
  assessmentId: string;
  clientId: string;
  currentQuestion: number;
  responses: QuestionResponse[];
  startTime: Date;
  lastUpdated: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
}

interface AssessmentResults {
  assessmentId: string;
  elementalScores: ElementalScores;
  totalScore: number;
  completionTime: number;
  flaggedResponses: number[];
  clinicalNotes: string;
  recommendations: string[];
}

interface ElementalScores {
  earth: { raw: number; percentile: number; level: string };
  water: { raw: number; percentile: number; level: string };
  fire: { raw: number; percentile: number; level: string };
  air: { raw: number; percentile: number; level: string };
  aether: { raw: number; percentile: number; level: string };
}

type Element = 'earth' | 'water' | 'fire' | 'air' | 'aether';

const ELEMENT_INFO = {
  earth: {
    name: 'Earth',
    description: 'Stability, grounding, structure, material security',
    color: 'bg-green-100 text-green-800',
    icon: '🌍'
  },
  water: {
    name: 'Water',
    description: 'Emotional flow, intuition, empathy, adaptation',
    color: 'bg-blue-100 text-blue-800',
    icon: '🌊'
  },
  fire: {
    name: 'Fire',
    description: 'Passion, motivation, transformation, creativity',
    color: 'bg-red-100 text-red-800',
    icon: '🔥'
  },
  air: {
    name: 'Air',
    description: 'Mental clarity, communication, perspective',
    color: 'bg-sky-100 text-sky-800',
    icon: '💨'
  },
  aether: {
    name: 'Aether',
    description: 'Spiritual connection, meaning, integration',
    color: 'bg-purple-100 text-purple-800',
    icon: '✨'
  }
};

export function IPPAssessment({
  clientId,
  practitionerId,
  onComplete,
  onSave,
  existingProgress
}: IPPAssessmentProps) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [flagged, setFlagged] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(new Date());

  useEffect(() => {
    loadAssessmentQuestions();
    if (existingProgress) {
      loadExistingProgress();
    }
  }, []);

  const loadAssessmentQuestions = async () => {
    setLoading(true);
    try {
      // Load IPP questions from API
      const response = await fetch(`/api/clinical/ipp/assessment?action=getQuestions`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
        if (!existingProgress) {
          setAssessmentId(`ipp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
          setStartTime(new Date());
        }
      }
    } catch (error) {
      console.error('Error loading assessment questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingProgress = () => {
    if (existingProgress) {
      setCurrentQuestionIndex(existingProgress.currentQuestion);
      setResponses(existingProgress.responses);
      setAssessmentId(existingProgress.assessmentId);
      setStartTime(existingProgress.startTime);
    }
  };

  const handleResponseChange = (value: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const responseValue = parseInt(value);

    const newResponse: QuestionResponse = {
      questionId: currentQuestion.questionId,
      response: responseValue,
      notes: notes,
      flagged: flagged,
      responseTime: Date.now() - startTime.getTime()
    };

    // Update or add response
    const existingIndex = responses.findIndex(r => r.questionId === currentQuestion.questionId);
    let newResponses;

    if (existingIndex >= 0) {
      newResponses = [...responses];
      newResponses[existingIndex] = newResponse;
    } else {
      newResponses = [...responses, newResponse];
    }

    setResponses(newResponses);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setNotes('');
      setFlagged(false);
    } else {
      handleCompleteAssessment();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Load existing response data for this question
      const existingResponse = responses.find(r => r.questionId === questions[currentQuestionIndex - 1].questionId);
      if (existingResponse) {
        setNotes(existingResponse.notes || '');
        setFlagged(existingResponse.flagged || false);
      }
    }
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      const progress: AssessmentProgress = {
        assessmentId,
        clientId,
        currentQuestion: currentQuestionIndex,
        responses,
        startTime,
        lastUpdated: new Date(),
        status: 'in_progress'
      };

      const response = await fetch('/api/clinical/ipp/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveProgress',
          progress,
          practitionerId
        })
      });

      if (response.ok) {
        onSave?.(progress);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteAssessment = async () => {
    setLoading(true);
    try {
      // Submit final assessment
      const response = await fetch('/api/clinical/ipp/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          assessmentId,
          clientId,
          practitionerId,
          responses,
          completionTime: Date.now() - startTime.getTime()
        })
      });

      const data = await response.json();
      if (data.success) {
        onComplete?.(data.results);
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentResponse = () => {
    const currentQuestion = questions[currentQuestionIndex];
    return responses.find(r => r.questionId === currentQuestion?.questionId);
  };

  const getElementProgress = () => {
    const elementCounts = {
      earth: { answered: 0, total: 8 },
      water: { answered: 0, total: 8 },
      fire: { answered: 0, total: 8 },
      air: { answered: 0, total: 8 },
      aether: { answered: 0, total: 8 }
    };

    questions.forEach((q, index) => {
      if (index <= currentQuestionIndex) {
        const hasResponse = responses.some(r => r.questionId === q.questionId);
        if (hasResponse) {
          elementCounts[q.element].answered++;
        }
      }
    });

    return elementCounts;
  };

  if (loading || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading IPP Assessment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = getCurrentResponse();
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const elementProgress = getElementProgress();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IPP Assessment</h1>
              <p className="text-gray-600">Client ID: {clientId} | Assessment ID: {assessmentId}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveProgress} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Progress'}
              </Button>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Client Info
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                {Math.floor((Date.now() - startTime.getTime()) / 60000)} minutes
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Element Progress */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {Object.entries(elementProgress).map(([element, counts]) => {
              const elementInfo = ELEMENT_INFO[element as Element];
              const elementProgress = (counts.answered / counts.total) * 100;

              return (
                <div key={element} className="text-center">
                  <div className={`p-2 rounded-lg ${elementInfo.color} mb-2`}>
                    <div className="text-lg">{elementInfo.icon}</div>
                    <div className="text-xs font-medium">{elementInfo.name}</div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {counts.answered}/{counts.total}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${elementProgress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={ELEMENT_INFO[currentQuestion.element].color}>
                  {ELEMENT_INFO[currentQuestion.element].icon} {ELEMENT_INFO[currentQuestion.element].name}
                </Badge>
                <Badge variant="outline">{currentQuestion.category}</Badge>
                {currentQuestion.traumaIndicator && (
                  <Badge variant="destructive">Trauma Indicator</Badge>
                )}
                {currentQuestion.attachmentRelevant && (
                  <Badge className="bg-pink-100 text-pink-800">Attachment</Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlagged(!flagged)}
                className={flagged ? 'bg-yellow-100 text-yellow-800' : ''}
              >
                <Flag className="w-4 h-4 mr-1" />
                {flagged ? 'Flagged' : 'Flag'}
              </Button>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.questionText}
            </CardTitle>
            <CardDescription>
              {ELEMENT_INFO[currentQuestion.element].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={currentResponse?.response?.toString() || ''}
              onValueChange={handleResponseChange}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                  <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Clinical Notes */}
            <div className="mt-6">
              <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                Clinical Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any clinical observations, client comments, or relevant notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {responses.length} of {questions.length} answered
            </span>
            {responses.filter(r => r.flagged).length > 0 && (
              <Badge variant="outline" className="text-yellow-800 bg-yellow-100">
                <Flag className="w-3 h-3 mr-1" />
                {responses.filter(r => r.flagged).length} flagged
              </Badge>
            )}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleCompleteAssessment}
              disabled={!currentResponse}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Assessment
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={!currentResponse}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Assessment Guidelines */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900 mb-2">Assessment Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Encourage honest, spontaneous responses</li>
              <li>• Allow client to ask for clarification if needed</li>
              <li>• Flag any responses that seem inconsistent or concerning</li>
              <li>• Take note of emotional reactions or significant client comments</li>
              <li>• Remember this is about patterns, not individual questions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default IPPAssessment;