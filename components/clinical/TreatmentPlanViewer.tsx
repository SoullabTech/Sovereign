'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Target,
  AlertTriangle,
  User,
  Edit,
  Save,
  Share2,
  Download,
  Plus,
  Trash2,
  ArrowRight,
  BookOpen,
  Shield,
  TrendingUp,
  Users,
  Brain
} from 'lucide-react';

interface TreatmentPlanViewerProps {
  planId: string;
  clientId: string;
  practitionerId: string;
  editable?: boolean;
  onSave?: (plan: TreatmentPlan) => void;
  onShare?: () => void;
}

interface TreatmentPlan {
  planId: string;
  clientId: string;
  clientName: string;
  practitionerId: string;
  practitionerName: string;
  createdDate: string;
  lastUpdated: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  executiveSummary: ExecutiveSummary;
  treatmentPhases: TreatmentPhase[];
  progressTracking: ProgressTracking;
  safetyPlan: SafetyPlan;
  resources: Resource[];
  notes: Note[];
}

interface ExecutiveSummary {
  clientProfile: string;
  treatmentRationale: string;
  primaryGoals: string[];
  estimatedDuration: string;
  successCriteria: string[];
}

interface TreatmentPhase {
  phaseId: string;
  phaseNumber: number;
  phaseName: string;
  status: 'not-started' | 'in-progress' | 'completed';
  goals: Goal[];
  interventions: Intervention[];
  duration: string;
  completionCriteria: string[];
  notes: string;
  startDate?: string;
  endDate?: string;
}

interface Goal {
  goalId: string;
  description: string;
  targetElement: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not-started' | 'in-progress' | 'completed';
  measurableOutcome: string;
  progress: number;
  notes: string;
}

interface Intervention {
  interventionId: string;
  name: string;
  type: 'individual' | 'family' | 'group' | 'homework' | 'assessment';
  frequency: string;
  duration: string;
  description: string;
  materials: string[];
  status: 'planned' | 'active' | 'completed';
  effectiveness: number;
  notes: string;
}

interface ProgressTracking {
  overallProgress: number;
  phaseProgress: { [phaseId: string]: number };
  goalProgress: { [goalId: string]: number };
  sessionCount: number;
  attendanceRate: number;
  homeworkCompletion: number;
  lastReview: string;
  nextReview: string;
  alertCriteria: AlertCriterion[];
}

interface SafetyPlan {
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  riskFactors: string[];
  protectiveFactors: string[];
  emergencyContacts: EmergencyContact[];
  crisisInterventions: string[];
  monitoringPlan: string;
  lastAssessment: string;
}

interface Resource {
  resourceId: string;
  type: 'book' | 'app' | 'website' | 'worksheet' | 'video' | 'support-group';
  title: string;
  description: string;
  elementRelevance: string[];
  priority: 'essential' | 'recommended' | 'optional';
  status: 'assigned' | 'in-use' | 'completed';
  notes: string;
}

interface Note {
  noteId: string;
  date: string;
  author: string;
  type: 'progress' | 'concern' | 'insight' | 'administrative';
  content: string;
}

const ELEMENT_COLORS = {
  earth: 'bg-green-100 text-green-800',
  water: 'bg-blue-100 text-blue-800',
  fire: 'bg-red-100 text-red-800',
  air: 'bg-sky-100 text-sky-800',
  aether: 'bg-purple-100 text-purple-800'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const STATUS_COLORS = {
  'not-started': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'planned': 'bg-purple-100 text-purple-800',
  'active': 'bg-blue-100 text-blue-800',
  'paused': 'bg-yellow-100 text-yellow-800',
  'draft': 'bg-gray-100 text-gray-800'
};

export function TreatmentPlanViewer({
  planId,
  clientId,
  practitionerId,
  editable = false,
  onSave,
  onShare
}: TreatmentPlanViewerProps) {
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activePhase, setActivePhase] = useState<string>('');

  useEffect(() => {
    loadTreatmentPlan();
  }, [planId]);

  const loadTreatmentPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clinical/ipp/treatment-planning/${planId}`);
      const data = await response.json();

      if (data.success) {
        setTreatmentPlan(data.treatmentPlan);
        if (data.treatmentPlan.treatmentPhases.length > 0) {
          setActivePhase(data.treatmentPlan.treatmentPhases[0].phaseId);
        }
      }
    } catch (error) {
      console.error('Error loading treatment plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!treatmentPlan) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/clinical/ipp/treatment-planning/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentPlan,
          practitionerId
        })
      });

      if (response.ok) {
        setEditMode(false);
        onSave?.(treatmentPlan);
      }
    } catch (error) {
      console.error('Error saving treatment plan:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateGoalProgress = (phaseId: string, goalId: string, progress: number) => {
    if (!treatmentPlan) return;

    const updatedPlan = {
      ...treatmentPlan,
      treatmentPhases: treatmentPlan.treatmentPhases.map(phase =>
        phase.phaseId === phaseId
          ? {
              ...phase,
              goals: phase.goals.map(goal =>
                goal.goalId === goalId
                  ? {
                      ...goal,
                      progress,
                      status: progress === 100 ? 'completed' as const : progress > 0 ? 'in-progress' as const : 'not-started' as const
                    }
                  : goal
              )
            }
          : phase
      )
    };

    setTreatmentPlan(updatedPlan);
  };

  const addNote = (content: string, type: Note['type'] = 'progress') => {
    if (!treatmentPlan) return;

    const newNote: Note = {
      noteId: `note_${Date.now()}`,
      date: new Date().toISOString(),
      author: 'Current User',
      type,
      content
    };

    setTreatmentPlan({
      ...treatmentPlan,
      notes: [newNote, ...treatmentPlan.notes]
    });
  };

  if (loading || !treatmentPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading treatment plan...</p>
        </div>
      </div>
    );
  }

  const overallProgress = treatmentPlan.progressTracking.overallProgress;
  const currentPhase = treatmentPlan.treatmentPhases.find(p => p.phaseId === activePhase);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Treatment Plan</h1>
                <Badge className={STATUS_COLORS[treatmentPlan.status]}>
                  {treatmentPlan.status}
                </Badge>
              </div>
              <p className="text-gray-600">
                {treatmentPlan.clientName} | Created: {new Date(treatmentPlan.createdDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              {editable && (
                <Button
                  variant="outline"
                  onClick={() => setEditMode(!editMode)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
              )}
              {editMode && (
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              )}
              <Button variant="outline" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{overallProgress}%</p>
                    <p className="text-sm text-gray-600">Overall Progress</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <Progress value={overallProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{treatmentPlan.progressTracking.sessionCount}</p>
                    <p className="text-sm text-gray-600">Sessions</p>
                  </div>
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{treatmentPlan.progressTracking.attendanceRate}%</p>
                    <p className="text-sm text-gray-600">Attendance</p>
                  </div>
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{treatmentPlan.safetyPlan.riskLevel}</p>
                    <p className="text-sm text-gray-600">Risk Level</p>
                  </div>
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Client Profile</h4>
                    <p className="text-gray-700">{treatmentPlan.executiveSummary.clientProfile}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Treatment Rationale</h4>
                    <p className="text-gray-700">{treatmentPlan.executiveSummary.treatmentRationale}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Primary Goals</h4>
                      <ul className="space-y-1">
                        {treatmentPlan.executiveSummary.primaryGoals.map((goal, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Success Criteria</h4>
                      <ul className="space-y-1">
                        {treatmentPlan.executiveSummary.successCriteria.map((criterion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{criterion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Estimated Duration</h4>
                    <p className="text-gray-700">{treatmentPlan.executiveSummary.estimatedDuration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phase Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {treatmentPlan.treatmentPhases.map((phase) => (
                <Card key={phase.phaseId} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setActivePhase(phase.phaseId)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Phase {phase.phaseNumber}</h3>
                      <Badge className={STATUS_COLORS[phase.status]}>
                        {phase.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-2">{phase.phaseName}</h4>
                    <p className="text-sm text-gray-600 mb-3">{phase.duration}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{treatmentPlan.progressTracking.phaseProgress[phase.phaseId] || 0}%</span>
                      </div>
                      <Progress value={treatmentPlan.progressTracking.phaseProgress[phase.phaseId] || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value="phases" className="space-y-6">
            <div className="flex gap-4 mb-6">
              {treatmentPlan.treatmentPhases.map((phase) => (
                <Button
                  key={phase.phaseId}
                  variant={activePhase === phase.phaseId ? 'default' : 'outline'}
                  onClick={() => setActivePhase(phase.phaseId)}
                  className="flex items-center gap-2"
                >
                  {phase.phaseNumber}. {phase.phaseName}
                  <Badge className={STATUS_COLORS[phase.status]} variant="secondary">
                    {phase.status}
                  </Badge>
                </Button>
              ))}
            </div>

            {currentPhase && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Phase {currentPhase.phaseNumber}: {currentPhase.phaseName}</CardTitle>
                        <CardDescription>Duration: {currentPhase.duration}</CardDescription>
                      </div>
                      <Badge className={STATUS_COLORS[currentPhase.status]}>
                        {currentPhase.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Goals */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Phase Goals</h4>
                      <div className="space-y-3">
                        {currentPhase.goals.map((goal) => (
                          <div key={goal.goalId} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h5 className="font-medium">{goal.description}</h5>
                                  <Badge className={ELEMENT_COLORS[goal.targetElement as keyof typeof ELEMENT_COLORS]}>
                                    {goal.targetElement}
                                  </Badge>
                                  <Badge className={PRIORITY_COLORS[goal.priority]}>
                                    {goal.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{goal.measurableOutcome}</p>
                              </div>
                              <Badge className={STATUS_COLORS[goal.status]}>
                                {goal.status}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{goal.progress}%</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress value={goal.progress} className="flex-1" />
                                {editMode && (
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={goal.progress}
                                    onChange={(e) => updateGoalProgress(currentPhase.phaseId, goal.goalId, parseInt(e.target.value) || 0)}
                                    className="w-20"
                                  />
                                )}
                              </div>
                            </div>

                            {goal.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                <strong>Notes:</strong> {goal.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interventions */}
                    <div>
                      <h4 className="font-semibold mb-3">Interventions</h4>
                      <div className="space-y-3">
                        {currentPhase.interventions.map((intervention) => (
                          <div key={intervention.interventionId} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h5 className="font-medium mb-1">{intervention.name}</h5>
                                <p className="text-sm text-gray-600">{intervention.description}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge className={STATUS_COLORS[intervention.status]}>
                                  {intervention.status}
                                </Badge>
                                <Badge variant="outline">
                                  {intervention.type}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="font-medium">Frequency:</span>
                                <p>{intervention.frequency}</p>
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span>
                                <p>{intervention.duration}</p>
                              </div>
                              <div>
                                <span className="font-medium">Effectiveness:</span>
                                <p>{intervention.effectiveness}/10</p>
                              </div>
                              <div>
                                <span className="font-medium">Materials:</span>
                                <p>{intervention.materials.join(', ')}</p>
                              </div>
                            </div>

                            {intervention.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                <strong>Notes:</strong> {intervention.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm">{overallProgress}%</span>
                      </div>
                      <Progress value={overallProgress} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Homework Completion</span>
                        <span className="text-sm">{treatmentPlan.progressTracking.homeworkCompletion}%</span>
                      </div>
                      <Progress value={treatmentPlan.progressTracking.homeworkCompletion} />
                    </div>

                    <div className="pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Sessions</span>
                        <span className="font-medium">{treatmentPlan.progressTracking.sessionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Attendance Rate</span>
                        <span className="font-medium">{treatmentPlan.progressTracking.attendanceRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Review</span>
                        <span className="font-medium">{new Date(treatmentPlan.progressTracking.lastReview).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Review</span>
                        <span className="font-medium">{new Date(treatmentPlan.progressTracking.nextReview).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {treatmentPlan.progressTracking.alertCriteria.map((alert, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{alert.criterion}</p>
                          <p className="text-xs text-gray-600">{alert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Safety Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Current Risk Level</span>
                      <Badge className={getRiskLevelColor(treatmentPlan.safetyPlan.riskLevel)}>
                        {treatmentPlan.safetyPlan.riskLevel}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Risk Factors</h4>
                      <ul className="space-y-1">
                        {treatmentPlan.safetyPlan.riskFactors.map((factor, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Protective Factors</h4>
                      <ul className="space-y-1">
                        {treatmentPlan.safetyPlan.protectiveFactors.map((factor, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Protocols</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Emergency Contacts</h4>
                      <div className="space-y-2">
                        {treatmentPlan.safetyPlan.emergencyContacts.map((contact, index) => (
                          <div key={index} className="p-2 border rounded">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-gray-600">{contact.relationship} - {contact.phone}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Crisis Interventions</h4>
                      <ul className="space-y-1">
                        {treatmentPlan.safetyPlan.crisisInterventions.map((intervention, index) => (
                          <li key={index} className="text-sm">• {intervention}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">Monitoring Plan</h4>
                      <p className="text-sm text-gray-600">{treatmentPlan.safetyPlan.monitoringPlan}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatmentPlan.resources.map((resource) => (
                <Card key={resource.resourceId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{resource.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {resource.type}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex flex-wrap gap-1">
                        {resource.elementRelevance.map((element, index) => (
                          <Badge key={index} className={ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS]} variant="secondary">
                            {element}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge className={PRIORITY_COLORS[resource.priority]}>
                          {resource.priority}
                        </Badge>
                        <Badge className={STATUS_COLORS[resource.status]}>
                          {resource.status}
                        </Badge>
                      </div>
                    </div>

                    {resource.notes && (
                      <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        {resource.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {editMode && (
                  <div className="mb-6 p-4 border rounded-lg">
                    <Label htmlFor="newNote" className="text-sm font-medium mb-2 block">
                      Add New Note
                    </Label>
                    <Textarea
                      id="newNote"
                      placeholder="Enter clinical observations, progress updates, or concerns..."
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => addNote('Sample note content', 'progress')}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Note
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {treatmentPlan.notes.map((note) => (
                    <div key={note.noteId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">
                            {note.type}
                          </Badge>
                          <span className="text-sm text-gray-600">{note.author}</span>
                          <span className="text-sm text-gray-500">{new Date(note.date).toLocaleDateString()}</span>
                        </div>
                        {editMode && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-gray-700">{note.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper function
function getRiskLevelColor(riskLevel: string) {
  const colors = {
    low: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    severe: 'bg-red-100 text-red-800'
  };
  return colors[riskLevel as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

// Mock interfaces for compilation
interface AlertCriterion {
  criterion: string;
  description: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export default TreatmentPlanViewer;