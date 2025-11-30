'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Calendar,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';

interface IPPDashboardProps {
  userId: string;
  userProfile: ProfessionalProfile;
}

interface ProfessionalProfile {
  name: string;
  credentials: string[];
  specializations: string[];
  caseload: number;
  activeClients: number;
}

interface ClientSummary {
  clientId: string;
  name: string;
  lastAssessment: string;
  currentPhase: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  nextSession: string;
  progress: 'improving' | 'stable' | 'declining';
}

interface AssessmentSummary {
  assessmentId: string;
  clientName: string;
  assessmentDate: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  dominantElement: string;
  overallScore: number;
}

interface Alert {
  alertId: string;
  type: 'safety' | 'progress' | 'scheduling' | 'clinical';
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  clientName?: string;
  actionRequired: boolean;
}

export function IPPDashboard({ userId, userProfile }: IPPDashboardProps) {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<AssessmentSummary[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load dashboard data from API
      const response = await fetch(`/api/professional/dashboard?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setClients(data.dashboard.clients || []);
        setRecentAssessments(data.dashboard.recentAssessments || []);
        setAlerts(data.dashboard.alerts || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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

  const getProgressBadgeColor = (progress: string) => {
    switch (progress) {
      case 'improving': return 'bg-green-100 text-green-800';
      case 'stable': return 'bg-blue-100 text-blue-800';
      case 'declining': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your professional dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">IPP Professional Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {userProfile.name} | {userProfile.credentials.join(', ')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button>
              <ClipboardList className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{userProfile.activeClients}</p>
                <p className="text-gray-600 text-sm">Active Clients</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{recentAssessments.length}</p>
                <p className="text-gray-600 text-sm">Recent Assessments</p>
              </div>
              <ClipboardList className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{alerts.filter(a => a.urgency === 'high' || a.urgency === 'critical').length}</p>
                <p className="text-gray-600 text-sm">Priority Alerts</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-gray-600 text-sm">Success Rate</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Clients</CardTitle>
              <CardDescription>
                Overview of your current caseload and their treatment progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.clientId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{client.name}</h3>
                        <Badge className={getRiskBadgeColor(client.riskLevel)}>
                          {client.riskLevel} risk
                        </Badge>
                        <Badge className={getProgressBadgeColor(client.progress)}>
                          {client.progress}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Phase: {client.currentPhase}</p>
                        <p>Last Assessment: {client.lastAssessment}</p>
                        <p>Next Session: {client.nextSession}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        View Plan
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent IPP Assessments</CardTitle>
              <CardDescription>
                Latest assessments and their elemental profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAssessments.map((assessment) => (
                  <div key={assessment.assessmentId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{assessment.clientName}</h3>
                        <Badge variant="outline">{assessment.status}</Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {assessment.dominantElement} dominant
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Assessment Date: {assessment.assessmentDate}</p>
                        <p>Overall Score: {assessment.overallScore}%</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        View Results
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Alerts</CardTitle>
              <CardDescription>
                Important notifications requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.alertId} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className={`w-5 h-5 ${alert.urgency === 'critical' ? 'text-red-600' : alert.urgency === 'high' ? 'text-orange-600' : 'text-yellow-600'}`} />
                        <Badge className={getUrgencyBadgeColor(alert.urgency)}>
                          {alert.urgency}
                        </Badge>
                        <span className="text-sm text-gray-600">{alert.type}</span>
                        {alert.clientName && (
                          <span className="text-sm font-medium">{alert.clientName}</span>
                        )}
                      </div>
                      <p className="text-gray-800">{alert.message}</p>
                    </div>
                    {alert.actionRequired && (
                      <Button size="sm" variant={alert.urgency === 'critical' ? 'destructive' : 'default'}>
                        Take Action
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Treatment Outcomes</CardTitle>
                <CardDescription>Success rates across your caseload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Success Rate</span>
                    <span className="text-2xl font-bold text-green-600">87%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Earth Element Focus</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Water Element Focus</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fire Element Focus</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Practice Insights</CardTitle>
                <CardDescription>Your professional development metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">156</div>
                    <div className="text-sm text-gray-600">Total IPP Assessments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">23</div>
                    <div className="text-sm text-gray-600">Active Treatment Plans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">94%</div>
                    <div className="text-sm text-gray-600">Client Retention Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IPPDashboard;