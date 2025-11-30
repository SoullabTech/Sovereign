import { NextRequest, NextResponse } from 'next/server';

/**
 * Professional Dashboard API
 * Provides dashboard data and insights for professional users
 */

interface DashboardData {
  userId: string;
  userProfile: UserProfile;
  subscriptions: SubscriptionSummary[];
  frameworks: FrameworkSummary[];
  credentials: CredentialSummary[];
  usage: UsageMetrics;
  alerts: Alert[];
  recentActivity: Activity[];
  upcomingTasks: Task[];
}

interface UserProfile {
  name: string;
  email?: string;
  roles: string[];
  verificationStatus: string;
  professionalLevel: string;
  joinDate: Date;
}

interface SubscriptionSummary {
  subscriptionId: string;
  tier: string;
  status: string;
  monthlyFee: number;
  nextBillingDate: Date;
  features: string[];
}

interface FrameworkSummary {
  frameworkId: string;
  frameworkName: string;
  accessLevel: string;
  subscriptionStatus: string;
  lastUsed?: Date;
  usageStats: FrameworkUsageStats;
}

interface FrameworkUsageStats {
  totalSessions: number;
  totalClients: number;
  avgSessionDuration: number;
  completionRate: number;
}

interface CredentialSummary {
  credentialType: string;
  licenseNumber: string;
  status: string;
  expirationDate: Date;
  daysUntilExpiry: number;
}

interface UsageMetrics {
  monthlyStats: MonthlyStats;
  weeklyTrend: WeeklyTrend;
  topFeatures: FeatureUsage[];
}

interface MonthlyStats {
  totalSessions: number;
  totalClients: number;
  avgSessionDuration: number;
  completionRate: number;
  outcomeImprovement: number;
}

interface WeeklyTrend {
  week1: number;
  week2: number;
  week3: number;
  week4: number;
}

interface FeatureUsage {
  featureName: string;
  usageCount: number;
  percentage: number;
}

interface Alert {
  alertId: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  actionRequired: boolean;
  actionUrl?: string;
  createdDate: Date;
}

interface Activity {
  activityId: string;
  type: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

interface Task {
  taskId: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId === 'guest') {
      return NextResponse.json(
        { success: false, error: 'Professional dashboard requires authentication' },
        { status: 401 }
      );
    }

    // Check if user has professional access
    const accessCheck = await checkProfessionalAccess(userId);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { success: false, error: accessCheck.reason },
        { status: 403 }
      );
    }

    // Gather dashboard data
    const dashboardData = await compileDashboardData(userId);

    return NextResponse.json({
      success: true,
      dashboard: dashboardData,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [PROFESSIONAL-DASHBOARD] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    if (!userId || userId === 'guest') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const accessCheck = await checkProfessionalAccess(userId);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { success: false, error: accessCheck.reason },
        { status: 403 }
      );
    }

    switch (action) {
      case 'dismiss_alert':
        return await dismissAlert(userId, data.alertId);

      case 'complete_task':
        return await completeTask(userId, data.taskId);

      case 'update_preferences':
        return await updateDashboardPreferences(userId, data.preferences);

      case 'export_data':
        return await exportProfessionalData(userId, data.format);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [PROFESSIONAL-DASHBOARD] Error processing action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process dashboard action' },
      { status: 500 }
    );
  }
}

async function checkProfessionalAccess(userId: string) {
  try {
    const rolesResponse = await fetch(`/api/auth/roles?userId=${userId}`);
    if (!rolesResponse.ok) {
      return { authorized: false, reason: 'Unable to verify professional status' };
    }

    const rolesData = await rolesResponse.json();

    // Check if user has professional-level roles
    const professionalRoles = [
      'licensed_professional',
      'ipp_practitioner',
      'emdr_therapist',
      'dbt_specialist',
      'ifs_therapist',
      'clinical_supervisor'
    ];

    const hasProfessionalRole = rolesData.roles?.some((role: string) =>
      professionalRoles.includes(role)
    );

    if (!hasProfessionalRole) {
      return { authorized: false, reason: 'Professional credentials required' };
    }

    return { authorized: true, roles: rolesData.roles };

  } catch (error) {
    return { authorized: false, reason: 'Access verification failed' };
  }
}

async function compileDashboardData(userId: string): Promise<DashboardData> {
  // Gather data from various APIs
  const [userProfile, subscriptions, frameworks, credentials] = await Promise.all([
    getUserProfile(userId),
    getUserSubscriptions(userId),
    getUserFrameworks(userId),
    getUserCredentials(userId)
  ]);

  // Calculate usage metrics
  const usage = await calculateUsageMetrics(userId);

  // Get alerts and notifications
  const alerts = await getAlertsForUser(userId);

  // Get recent activity
  const recentActivity = await getRecentActivity(userId);

  // Get upcoming tasks
  const upcomingTasks = await getUpcomingTasks(userId);

  return {
    userId,
    userProfile,
    subscriptions,
    frameworks,
    credentials,
    usage,
    alerts,
    recentActivity,
    upcomingTasks
  };
}

async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const profileResponse = await fetch(`/api/user/profile?userId=${userId}`);
    const rolesResponse = await fetch(`/api/auth/roles?userId=${userId}`);

    const profileData = await profileResponse.json();
    const rolesData = await rolesResponse.json();

    return {
      name: profileData.user?.name || 'Professional User',
      roles: rolesData.roles || ['consumer'],
      verificationStatus: rolesData.verification?.professionalLicense ? 'verified' : 'pending',
      professionalLevel: determineProfessionalLevel(rolesData.roles),
      joinDate: new Date(profileData.user?.created || Date.now())
    };
  } catch (error) {
    return {
      name: 'Professional User',
      roles: ['consumer'],
      verificationStatus: 'pending',
      professionalLevel: 'basic',
      joinDate: new Date()
    };
  }
}

async function getUserSubscriptions(userId: string): Promise<SubscriptionSummary[]> {
  try {
    const response = await fetch(`/api/billing/subscriptions?userId=${userId}`);
    const data = await response.json();

    return data.subscriptions?.map((sub: any) => ({
      subscriptionId: sub.subscriptionId,
      tier: sub.tier,
      status: sub.status,
      monthlyFee: sub.currentPrice,
      nextBillingDate: new Date(sub.nextBillingDate),
      features: sub.features?.map((f: any) => f.featureName) || []
    })) || [];
  } catch (error) {
    return [];
  }
}

async function getUserFrameworks(userId: string): Promise<FrameworkSummary[]> {
  try {
    const response = await fetch(`/api/clinical/frameworks?userId=${userId}`);
    const data = await response.json();

    return data.frameworks?.map((fw: any) => ({
      frameworkId: fw.framework.frameworkId,
      frameworkName: fw.framework.frameworkName,
      accessLevel: fw.access.accessLevel || 'none',
      subscriptionStatus: fw.access.authorized ? 'active' : 'inactive',
      lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Mock data
      usageStats: {
        totalSessions: Math.floor(Math.random() * 50),
        totalClients: Math.floor(Math.random() * 20),
        avgSessionDuration: 45 + Math.random() * 30,
        completionRate: 0.8 + Math.random() * 0.2
      }
    })) || [];
  } catch (error) {
    return [];
  }
}

async function getUserCredentials(userId: string): Promise<CredentialSummary[]> {
  try {
    const response = await fetch(`/api/auth/credentials?userId=${userId}`);
    const data = await response.json();

    return data.verifications?.map((verif: any) => {
      const expirationDate = new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000); // Mock
      const daysUntilExpiry = Math.ceil((expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

      return {
        credentialType: verif.request.credentialType,
        licenseNumber: verif.request.licenseNumber,
        status: verif.result.status,
        expirationDate,
        daysUntilExpiry
      };
    }) || [];
  } catch (error) {
    return [];
  }
}

async function calculateUsageMetrics(userId: string): Promise<UsageMetrics> {
  // Mock usage data - in production, this would aggregate from actual usage logs
  return {
    monthlyStats: {
      totalSessions: Math.floor(Math.random() * 100) + 20,
      totalClients: Math.floor(Math.random() * 30) + 5,
      avgSessionDuration: 45 + Math.random() * 30,
      completionRate: 0.85 + Math.random() * 0.1,
      outcomeImprovement: 0.15 + Math.random() * 0.15
    },
    weeklyTrend: {
      week1: Math.floor(Math.random() * 25) + 5,
      week2: Math.floor(Math.random() * 25) + 5,
      week3: Math.floor(Math.random() * 25) + 5,
      week4: Math.floor(Math.random() * 25) + 5
    },
    topFeatures: [
      { featureName: 'IPP Assessment', usageCount: Math.floor(Math.random() * 50), percentage: Math.random() * 30 + 20 },
      { featureName: 'Treatment Planning', usageCount: Math.floor(Math.random() * 40), percentage: Math.random() * 25 + 15 },
      { featureName: 'Progress Tracking', usageCount: Math.floor(Math.random() * 30), percentage: Math.random() * 20 + 10 }
    ]
  };
}

async function getAlertsForUser(userId: string): Promise<Alert[]> {
  // Mock alerts - in production, these would be dynamically generated based on user state
  const alerts: Alert[] = [];

  // Check for credential expiration
  const credentials = await getUserCredentials(userId);
  credentials.forEach(cred => {
    if (cred.daysUntilExpiry < 30) {
      alerts.push({
        alertId: `cred_expiry_${cred.licenseNumber}`,
        type: cred.daysUntilExpiry < 7 ? 'error' : 'warning',
        title: 'Credential Expiring Soon',
        message: `Your ${cred.credentialType} (${cred.licenseNumber}) expires in ${cred.daysUntilExpiry} days`,
        actionRequired: true,
        actionUrl: '/professional/credentials',
        createdDate: new Date()
      });
    }
  });

  // Check for pending verifications
  const pendingVerifications = credentials.filter(cred => cred.status === 'pending');
  if (pendingVerifications.length > 0) {
    alerts.push({
      alertId: 'pending_verifications',
      type: 'info',
      title: 'Verification In Progress',
      message: `You have ${pendingVerifications.length} credentials pending verification`,
      actionRequired: false,
      createdDate: new Date()
    });
  }

  return alerts;
}

async function getRecentActivity(userId: string): Promise<Activity[]> {
  // Mock recent activity - in production, this would come from activity logs
  return [
    {
      activityId: 'activity_1',
      type: 'assessment',
      description: 'Completed IPP assessment for client',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      activityId: 'activity_2',
      type: 'subscription',
      description: 'Upgraded to IPP Clinical subscription',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      activityId: 'activity_3',
      type: 'verification',
      description: 'Professional license verified',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];
}

async function getUpcomingTasks(userId: string): Promise<Task[]> {
  // Mock upcoming tasks - in production, these would be generated based on user state
  return [
    {
      taskId: 'task_1',
      title: 'Complete Continuing Education',
      description: '8 hours required for license renewal',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: 'medium',
      category: 'Professional Development'
    },
    {
      taskId: 'task_2',
      title: 'Review Supervision Notes',
      description: 'Monthly supervision meeting preparation',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'high',
      category: 'Clinical Supervision'
    }
  ];
}

function determineProfessionalLevel(roles: string[]): string {
  if (roles.includes('clinical_supervisor')) return 'supervisor';
  if (roles.includes('ipp_practitioner') || roles.includes('emdr_therapist')) return 'advanced';
  if (roles.includes('licensed_professional')) return 'professional';
  return 'basic';
}

async function dismissAlert(userId: string, alertId: string) {
  // In production, this would mark the alert as dismissed in the database
  return NextResponse.json({
    success: true,
    message: 'Alert dismissed'
  });
}

async function completeTask(userId: string, taskId: string) {
  // In production, this would mark the task as completed
  return NextResponse.json({
    success: true,
    message: 'Task completed'
  });
}

async function updateDashboardPreferences(userId: string, preferences: any) {
  // In production, this would update user dashboard preferences
  return NextResponse.json({
    success: true,
    message: 'Dashboard preferences updated',
    preferences
  });
}

async function exportProfessionalData(userId: string, format: string) {
  // In production, this would generate and return professional data export
  return NextResponse.json({
    success: true,
    message: 'Data export initiated',
    exportFormat: format,
    downloadUrl: `/api/professional/export/${userId}/${format}`
  });
}