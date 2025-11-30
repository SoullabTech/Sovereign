'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Download,
  Share2,
  FileText,
  TrendingUp,
  TrendingDown,
  Target,
  Heart,
  Brain,
  Zap,
  Wind,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface IPPResultsProps {
  assessmentId: string;
  clientId: string;
  results: AssessmentResults;
  comparisonData?: AssessmentResults[];
  onGenerateReport?: () => void;
  onShareResults?: () => void;
}

interface AssessmentResults {
  assessmentId: string;
  assessmentDate: string;
  clientName: string;
  practitionerName: string;
  elementalScores: ElementalScores;
  clinicalInterpretations: ClinicalInterpretation[];
  attachmentAnalysis: AttachmentAnalysis;
  traumaAssessment: TraumaAssessment;
  treatmentRecommendations: TreatmentRecommendation[];
  overallProfile: OverallProfile;
  riskFactors: RiskFactor[];
  strengths: Strength[];
  progressComparison?: ProgressComparison;
}

interface ElementalScores {
  earth: ElementScore;
  water: ElementScore;
  fire: ElementScore;
  air: ElementScore;
  aether: ElementScore;
}

interface ElementScore {
  raw: number;
  percentile: number;
  level: 'very-low' | 'low' | 'average' | 'high' | 'very-high';
  description: string;
  subscaleScores: { [key: string]: number };
}

interface ClinicalInterpretation {
  domain: string;
  interpretation: string;
  significance: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
}

interface AttachmentAnalysis {
  primaryStyle: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  securityLevel: number;
  elementalBasis: string[];
  caregivingCapacity: number;
  insights: string[];
}

interface TraumaAssessment {
  overallRisk: 'low' | 'moderate' | 'high' | 'severe';
  traumaTypes: string[];
  elementalImpact: { [key: string]: string };
  resilienceFactors: string[];
  treatmentPriorities: string[];
}

interface TreatmentRecommendation {
  priority: 'immediate' | 'high' | 'medium' | 'low';
  intervention: string;
  rationale: string;
  timeline: string;
  expectedOutcome: string;
}

interface OverallProfile {
  dominantPattern: string;
  balanceScore: number;
  adaptabilityIndex: number;
  resilienceCapacity: number;
  developmentalStage: string;
}

const ELEMENT_CONFIG = {
  earth: {
    name: 'Earth',
    icon: Heart,
    color: '#16a34a',
    lightColor: '#dcfce7',
    description: 'Grounding & Stability'
  },
  water: {
    name: 'Water',
    icon: Brain,
    color: '#2563eb',
    lightColor: '#dbeafe',
    description: 'Emotional Flow & Empathy'
  },
  fire: {
    name: 'Fire',
    icon: Zap,
    color: '#dc2626',
    lightColor: '#fee2e2',
    description: 'Passion & Motivation'
  },
  air: {
    name: 'Air',
    icon: Wind,
    color: '#0891b2',
    lightColor: '#cffafe',
    description: 'Clarity & Communication'
  },
  aether: {
    name: 'Aether',
    icon: Sparkles,
    color: '#7c3aed',
    lightColor: '#ede9fe',
    description: 'Spiritual Connection'
  }
};

export function IPPResults({
  assessmentId,
  clientId,
  results,
  comparisonData,
  onGenerateReport,
  onShareResults
}: IPPResultsProps) {
  const [selectedElement, setSelectedElement] = useState<string>('overview');
  const [showComparison, setShowComparison] = useState(false);

  // Transform data for charts
  const radarData = Object.entries(results.elementalScores).map(([element, score]) => ({
    element: ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG].name,
    percentile: score.percentile,
    fullMark: 100
  }));

  const barData = Object.entries(results.elementalScores).map(([element, score]) => ({
    element: ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG].name,
    percentile: score.percentile,
    color: ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG].color
  }));

  const balanceData = [
    { name: 'Balanced', value: results.overallProfile.balanceScore },
    { name: 'Imbalanced', value: 100 - results.overallProfile.balanceScore }
  ];

  const getElementIcon = (element: string) => {
    const IconComponent = ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG]?.icon || Info;
    return IconComponent;
  };

  const getScoreBadgeColor = (level: string) => {
    switch (level) {
      case 'very-high': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-gray-100 text-gray-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'very-low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IPP Assessment Results</h1>
              <p className="text-gray-600 mt-1">
                {results.clientName} | {results.assessmentDate} | {results.practitionerName}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onShareResults}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={onGenerateReport}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{results.overallProfile.dominantPattern}</p>
                  <p className="text-gray-600 text-sm">Dominant Pattern</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{results.overallProfile.balanceScore}%</p>
                  <p className="text-gray-600 text-sm">Elemental Balance</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{results.overallProfile.resilienceCapacity}%</p>
                  <p className="text-gray-600 text-sm">Resilience Capacity</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{results.attachmentAnalysis.securityLevel}%</p>
                  <p className="text-gray-600 text-sm">Attachment Security</p>
                </div>
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="clinical">Clinical</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Elemental Profile Overview</CardTitle>
                  <CardDescription>
                    Visual representation of elemental strengths and areas for growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="element" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Percentile"
                        dataKey="percentile"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Elemental Scores</CardTitle>
                  <CardDescription>
                    Percentile scores for each elemental domain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="element" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="percentile" fill="#8884d8">
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">{strength.title}</h4>
                          <p className="text-green-700 text-sm">{strength.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Areas for Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-orange-900">{risk.factor}</h4>
                          <p className="text-orange-700 text-sm">{risk.description}</p>
                          <Badge className={getRiskBadgeColor(risk.severity)} variant="secondary">
                            {risk.severity} priority
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Elements Tab */}
          <TabsContent value="elements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {Object.entries(results.elementalScores).map(([element, score]) => {
                const config = ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG];
                const IconComponent = config.icon;

                return (
                  <Card
                    key={element}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedElement === element ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedElement(element)}
                  >
                    <CardContent className="p-4 text-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: config.lightColor }}
                      >
                        <IconComponent className="w-8 h-8" style={{ color: config.color }} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{config.name}</h3>
                      <p className="text-2xl font-bold mb-1" style={{ color: config.color }}>
                        {score.percentile}%
                      </p>
                      <Badge className={getScoreBadgeColor(score.level)}>
                        {score.level}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Element Details */}
            {selectedElement !== 'overview' && results.elementalScores[selectedElement as keyof ElementalScores] && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {React.createElement(
                      getElementIcon(selectedElement),
                      { className: "w-6 h-6", style: { color: ELEMENT_CONFIG[selectedElement as keyof typeof ELEMENT_CONFIG]?.color } }
                    )}
                    {ELEMENT_CONFIG[selectedElement as keyof typeof ELEMENT_CONFIG]?.name} Element Analysis
                  </CardTitle>
                  <CardDescription>
                    {ELEMENT_CONFIG[selectedElement as keyof typeof ELEMENT_CONFIG]?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Current Level</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Raw Score:</span>
                          <span className="font-medium">{results.elementalScores[selectedElement as keyof ElementalScores].raw}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Percentile:</span>
                          <span className="font-medium">{results.elementalScores[selectedElement as keyof ElementalScores].percentile}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Level:</span>
                          <Badge className={getScoreBadgeColor(results.elementalScores[selectedElement as keyof ElementalScores].level)}>
                            {results.elementalScores[selectedElement as keyof ElementalScores].level}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Subscale Scores</h4>
                      <div className="space-y-2">
                        {Object.entries(results.elementalScores[selectedElement as keyof ElementalScores].subscaleScores).map(([subscale, score]) => (
                          <div key={subscale} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{subscale.replace('_', ' ')}</span>
                              <span>{score}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${score}%`,
                                  backgroundColor: ELEMENT_CONFIG[selectedElement as keyof typeof ELEMENT_CONFIG]?.color
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Clinical Notes</h4>
                      <p className="text-sm text-gray-600">
                        {results.elementalScores[selectedElement as keyof ElementalScores].description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attachment Analysis</CardTitle>
                  <CardDescription>
                    Assessment of attachment style and security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-blue-900">Primary Attachment Style</h4>
                        <p className="text-blue-700 capitalize">{results.attachmentAnalysis.primaryStyle}</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {results.attachmentAnalysis.securityLevel}%
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Caregiving Capacity</h4>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${results.attachmentAnalysis.caregivingCapacity}%` }}
                        >
                          {results.attachmentAnalysis.caregivingCapacity}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Key Insights</h4>
                      <ul className="space-y-2">
                        {results.attachmentAnalysis.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trauma Assessment</CardTitle>
                  <CardDescription>
                    Risk factors and resilience indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-orange-900">Overall Risk Level</h4>
                        <Badge className={getRiskBadgeColor(results.traumaAssessment.overallRisk)}>
                          {results.traumaAssessment.overallRisk} risk
                        </Badge>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Elemental Impact</h4>
                      <div className="space-y-2">
                        {Object.entries(results.traumaAssessment.elementalImpact).map(([element, impact]) => (
                          <div key={element} className="flex justify-between items-center">
                            <span className="capitalize">{element}</span>
                            <Badge className={getRiskBadgeColor(impact)}>
                              {impact}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Resilience Factors</h4>
                      <ul className="space-y-1">
                        {results.traumaAssessment.resilienceFactors.map((factor, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clinical Tab */}
          <TabsContent value="clinical" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {results.clinicalInterpretations.map((interpretation, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{interpretation.domain} Analysis</CardTitle>
                      <Badge className={getRiskBadgeColor(interpretation.significance)}>
                        {interpretation.significance} significance
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700">{interpretation.interpretation}</p>

                      <div>
                        <h4 className="font-semibold mb-2">Clinical Recommendations</h4>
                        <ul className="space-y-2">
                          {interpretation.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start gap-2">
                              <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Treatment Tab */}
          <TabsContent value="treatment" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {results.treatmentRecommendations.map((treatment, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{treatment.intervention}</h3>
                          <Badge variant={treatment.priority === 'immediate' ? 'destructive' : treatment.priority === 'high' ? 'default' : 'secondary'}>
                            {treatment.priority} priority
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{treatment.rationale}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Timeline:</span>
                            <span className="ml-2">{treatment.timeline}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Expected Outcome:</span>
                            <span className="ml-2">{treatment.expectedOutcome}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {comparisonData && comparisonData.length > 0 ? (
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Over Time</CardTitle>
                    <CardDescription>
                      Comparison of elemental scores across assessments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="assessmentDate" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        {Object.keys(ELEMENT_CONFIG).map((element) => (
                          <Line
                            key={element}
                            type="monotone"
                            dataKey={`elementalScores.${element}.percentile`}
                            stroke={ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG].color}
                            strokeWidth={2}
                            name={ELEMENT_CONFIG[element as keyof typeof ELEMENT_CONFIG].name}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Previous Assessments</h3>
                  <p className="text-gray-600">
                    Progress tracking will be available after multiple assessments are completed.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Mock data interfaces for compilation
interface RiskFactor {
  factor: string;
  severity: string;
  description: string;
}

interface Strength {
  title: string;
  description: string;
}

interface ProgressComparison {
  previousScore: number;
  currentScore: number;
  change: number;
}

export default IPPResults;