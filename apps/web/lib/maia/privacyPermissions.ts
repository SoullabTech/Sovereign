/**
 * Privacy-First Permission System for Cognitive Voice Analysis
 *
 * This system ensures members maintain complete control over their cognitive insights
 * and can grant/revoke access to therapeutic professionals with granular permissions.
 */

import { useAuth } from '@/lib/auth/authContext';

// Permission levels for different aspects of cognitive analysis
export interface CognitivePermissions {
  // Core voice analysis permissions
  voiceMetricsAccess: boolean;           // Basic voice patterns (speech rate, pauses, etc.)
  elementalAnalysisAccess: boolean;      // Elemental resonance insights

  // Cognitive architecture permissions
  lidaInsightsAccess: boolean;           // LIDA consciousness analysis
  soarWisdomAccess: boolean;             // SOAR planning/wisdom insights
  actrMemoryAccess: boolean;             // ACT-R memory/learning patterns
  microPsiAnalysisAccess: boolean;       // MicroPsi emotional/motivational insights

  // Clinical level permissions
  clinicalInsightsAccess: boolean;       // Professional-level clinical observations
  developmentalStageAccess: boolean;     // Developmental progression insights
  integrationReadinessAccess: boolean;   // Therapeutic readiness assessments

  // Aggregated insights permissions
  historicalTrendsAccess: boolean;       // Long-term pattern analysis
  coherenceEvolutionAccess: boolean;     // Voice coherence development
  wisdomEmergenceAccess: boolean;        // Emerging wisdom patterns

  // Export and sharing permissions
  dataExportAccess: boolean;             // Can export cognitive analysis data
  therapeuticSharingAccess: boolean;     // Can share with therapeutic professionals
}

// Professional access types
export type ProfessionalRole = 'therapist' | 'counselor' | 'coach' | 'clinician' | 'researcher';

export interface ProfessionalAccess {
  professionalId: string;
  name: string;
  role: ProfessionalRole;
  email: string;
  grantedAt: Date;
  expiresAt?: Date;
  permissions: Partial<CognitivePermissions>;
  status: 'pending' | 'active' | 'expired' | 'revoked';
  requestMessage?: string;
  approvedAt?: Date;
}

// User's privacy settings
export interface PrivacySettings {
  userId: string;

  // Self-access permissions (what user can see of their own data)
  selfPermissions: CognitivePermissions;

  // Professional access grants
  professionalAccess: ProfessionalAccess[];

  // Global privacy settings
  allowProfessionalRequests: boolean;     // Can professionals request access?
  requireExplicitConsent: boolean;        // Require consent for each data type?
  autoExpireAccess: boolean;              // Auto-expire professional access?
  defaultAccessDuration: number;          // Default duration in days

  // Data retention settings
  retainCognitiveData: boolean;           // Keep cognitive analysis data?
  dataRetentionDays: number;              // How long to retain data

  // Notification preferences
  notifyOnAccessRequest: boolean;         // Email when professional requests access
  notifyOnDataAccess: boolean;            // Email when data is accessed
  notifyOnExport: boolean;                // Email when data is exported

  // Audit settings
  enableAuditLog: boolean;                // Track who accesses what when

  updatedAt: Date;
}

// Default permission templates
export const DEFAULT_MEMBER_PERMISSIONS: CognitivePermissions = {
  voiceMetricsAccess: true,
  elementalAnalysisAccess: true,
  lidaInsightsAccess: true,
  soarWisdomAccess: true,
  actrMemoryAccess: true,
  microPsiAnalysisAccess: true,
  clinicalInsightsAccess: false,          // Hidden by default - too clinical
  developmentalStageAccess: false,        // Hidden by default - too clinical
  integrationReadinessAccess: false,      // Hidden by default - too clinical
  historicalTrendsAccess: true,
  coherenceEvolutionAccess: true,
  wisdomEmergenceAccess: true,
  dataExportAccess: true,
  therapeuticSharingAccess: false         // Must explicitly enable
};

export const DEFAULT_THERAPIST_PERMISSIONS: Partial<CognitivePermissions> = {
  voiceMetricsAccess: true,
  elementalAnalysisAccess: true,
  lidaInsightsAccess: true,
  soarWisdomAccess: true,
  actrMemoryAccess: true,
  microPsiAnalysisAccess: true,
  clinicalInsightsAccess: true,
  developmentalStageAccess: true,
  integrationReadinessAccess: true,
  historicalTrendsAccess: true,
  coherenceEvolutionAccess: true,
  wisdomEmergenceAccess: true,
  dataExportAccess: false,                // Cannot export by default
  therapeuticSharingAccess: false         // Cannot reshare
};

export const DEFAULT_COACH_PERMISSIONS: Partial<CognitivePermissions> = {
  voiceMetricsAccess: true,
  elementalAnalysisAccess: true,
  lidaInsightsAccess: false,              // Less clinical access
  soarWisdomAccess: true,
  actrMemoryAccess: false,                // Less clinical access
  microPsiAnalysisAccess: true,
  clinicalInsightsAccess: false,          // No clinical insights
  developmentalStageAccess: false,        // No clinical insights
  integrationReadinessAccess: false,      // No clinical insights
  historicalTrendsAccess: true,
  coherenceEvolutionAccess: true,
  wisdomEmergenceAccess: true,
  dataExportAccess: false,
  therapeuticSharingAccess: false
};

// Privacy permission manager class
export class PrivacyPermissionManager {
  private userId: string;
  private settings: PrivacySettings | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Initialize user privacy settings
  async initializeSettings(): Promise<PrivacySettings> {
    // In production, this would fetch from secure database
    const existingSettings = localStorage.getItem(`privacy_settings_${this.userId}`);

    if (existingSettings) {
      this.settings = JSON.parse(existingSettings);
      return this.settings!;
    }

    // Create default settings
    this.settings = {
      userId: this.userId,
      selfPermissions: { ...DEFAULT_MEMBER_PERMISSIONS },
      professionalAccess: [],
      allowProfessionalRequests: true,
      requireExplicitConsent: true,
      autoExpireAccess: true,
      defaultAccessDuration: 90, // 90 days
      retainCognitiveData: true,
      dataRetentionDays: 365, // 1 year
      notifyOnAccessRequest: true,
      notifyOnDataAccess: false,
      notifyOnExport: true,
      enableAuditLog: true,
      updatedAt: new Date()
    };

    await this.saveSettings();
    return this.settings;
  }

  // Get current settings
  async getSettings(): Promise<PrivacySettings> {
    if (!this.settings) {
      return await this.initializeSettings();
    }
    return this.settings;
  }

  // Update privacy settings
  async updateSettings(updates: Partial<PrivacySettings>): Promise<PrivacySettings> {
    if (!this.settings) {
      await this.initializeSettings();
    }

    this.settings = {
      ...this.settings!,
      ...updates,
      updatedAt: new Date()
    };

    await this.saveSettings();
    return this.settings;
  }

  // Update member's own permissions (what they can see)
  async updateSelfPermissions(permissions: Partial<CognitivePermissions>): Promise<void> {
    if (!this.settings) {
      await this.initializeSettings();
    }

    this.settings!.selfPermissions = {
      ...this.settings!.selfPermissions,
      ...permissions
    };
    this.settings!.updatedAt = new Date();

    await this.saveSettings();
  }

  // Request professional access (from professional's side)
  async requestProfessionalAccess(request: {
    professionalId: string;
    name: string;
    role: ProfessionalRole;
    email: string;
    requestedPermissions: Partial<CognitivePermissions>;
    message?: string;
    duration?: number; // days
  }): Promise<ProfessionalAccess> {
    if (!this.settings) {
      await this.initializeSettings();
    }

    if (!this.settings!.allowProfessionalRequests) {
      throw new Error('Member has disabled professional access requests');
    }

    const accessRequest: ProfessionalAccess = {
      professionalId: request.professionalId,
      name: request.name,
      role: request.role,
      email: request.email,
      grantedAt: new Date(),
      expiresAt: request.duration ?
        new Date(Date.now() + request.duration * 24 * 60 * 60 * 1000) :
        new Date(Date.now() + this.settings!.defaultAccessDuration * 24 * 60 * 60 * 1000),
      permissions: request.requestedPermissions,
      status: 'pending',
      requestMessage: request.message
    };

    this.settings!.professionalAccess.push(accessRequest);
    this.settings!.updatedAt = new Date();

    await this.saveSettings();

    // In production, would send notification email to member
    if (this.settings!.notifyOnAccessRequest) {
      console.log(`📧 Notification: Professional access requested by ${request.name}`);
    }

    return accessRequest;
  }

  // Approve professional access (from member's side)
  async approveProfessionalAccess(
    professionalId: string,
    approvedPermissions?: Partial<CognitivePermissions>
  ): Promise<void> {
    if (!this.settings) {
      await this.initializeSettings();
    }

    const accessIndex = this.settings!.professionalAccess.findIndex(
      access => access.professionalId === professionalId && access.status === 'pending'
    );

    if (accessIndex === -1) {
      throw new Error('Professional access request not found or already processed');
    }

    this.settings!.professionalAccess[accessIndex] = {
      ...this.settings!.professionalAccess[accessIndex],
      status: 'active',
      approvedAt: new Date(),
      permissions: approvedPermissions || this.settings!.professionalAccess[accessIndex].permissions
    };

    this.settings!.updatedAt = new Date();
    await this.saveSettings();
    await this.logAccessEvent('professional_access_approved', { professionalId });
  }

  // Revoke professional access
  async revokeProfessionalAccess(professionalId: string): Promise<void> {
    if (!this.settings) {
      await this.initializeSettings();
    }

    const accessIndex = this.settings!.professionalAccess.findIndex(
      access => access.professionalId === professionalId
    );

    if (accessIndex !== -1) {
      this.settings!.professionalAccess[accessIndex].status = 'revoked';
      this.settings!.updatedAt = new Date();
      await this.saveSettings();
      await this.logAccessEvent('professional_access_revoked', { professionalId });
    }
  }

  // Check if user can access specific cognitive data
  async canAccessCognitiveData(
    dataType: keyof CognitivePermissions,
    accessorId?: string // If professional is accessing
  ): Promise<boolean> {
    if (!this.settings) {
      await this.initializeSettings();
    }

    // If user is accessing their own data
    if (!accessorId || accessorId === this.userId) {
      return this.settings!.selfPermissions[dataType] || false;
    }

    // If professional is accessing
    const professionalAccess = this.settings!.professionalAccess.find(
      access => access.professionalId === accessorId &&
                access.status === 'active' &&
                (!access.expiresAt || access.expiresAt > new Date())
    );

    if (!professionalAccess) {
      return false;
    }

    const hasPermission = professionalAccess.permissions[dataType] || false;

    // Log access attempt
    if (hasPermission && this.settings!.notifyOnDataAccess) {
      await this.logAccessEvent('data_accessed', {
        accessorId,
        dataType,
        professionalName: professionalAccess.name
      });
    }

    return hasPermission;
  }

  // Get filtered cognitive analysis based on permissions
  async getFilteredCognitiveAnalysis(
    cognitiveAnalysis: any,
    accessorId?: string
  ): Promise<any> {
    if (!cognitiveAnalysis) return null;

    const filtered: any = {};

    // Check each permission and include data accordingly
    const permissions = Object.keys(DEFAULT_MEMBER_PERMISSIONS) as (keyof CognitivePermissions)[];

    for (const permission of permissions) {
      const canAccess = await this.canAccessCognitiveData(permission, accessorId);

      if (canAccess) {
        switch (permission) {
          case 'voiceMetricsAccess':
            filtered.voiceMetrics = cognitiveAnalysis.voiceMetrics;
            break;
          case 'elementalAnalysisAccess':
            filtered.elementalResonance = cognitiveAnalysis.elementalResonance;
            break;
          case 'lidaInsightsAccess':
            filtered.lidaAnalysis = cognitiveAnalysis.lidaAnalysis;
            break;
          case 'soarWisdomAccess':
            filtered.soarAnalysis = cognitiveAnalysis.soarAnalysis;
            break;
          case 'actrMemoryAccess':
            filtered.actrAnalysis = cognitiveAnalysis.actrAnalysis;
            break;
          case 'microPsiAnalysisAccess':
            filtered.microPsiAnalysis = cognitiveAnalysis.microPsiAnalysis;
            break;
          case 'clinicalInsightsAccess':
            filtered.clinicalInsights = cognitiveAnalysis.clinicalInsights;
            break;
        }
      }
    }

    return Object.keys(filtered).length > 0 ? filtered : null;
  }

  // Get active professional accesses
  async getActiveProfessionalAccesses(): Promise<ProfessionalAccess[]> {
    if (!this.settings) {
      await this.initializeSettings();
    }

    return this.settings!.professionalAccess.filter(
      access => access.status === 'active' &&
                (!access.expiresAt || access.expiresAt > new Date())
    );
  }

  // Get pending access requests
  async getPendingAccessRequests(): Promise<ProfessionalAccess[]> {
    if (!this.settings) {
      await this.initializeSettings();
    }

    return this.settings!.professionalAccess.filter(access => access.status === 'pending');
  }

  // Clean up expired accesses
  async cleanupExpiredAccesses(): Promise<void> {
    if (!this.settings) {
      await this.initializeSettings();
    }

    let hasChanges = false;
    this.settings!.professionalAccess.forEach(access => {
      if (access.status === 'active' && access.expiresAt && access.expiresAt <= new Date()) {
        access.status = 'expired';
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.settings!.updatedAt = new Date();
      await this.saveSettings();
    }
  }

  // Export permissions and audit log
  async exportPermissionsData(): Promise<string> {
    if (!this.settings) {
      await this.initializeSettings();
    }

    if (!this.settings!.selfPermissions.dataExportAccess) {
      throw new Error('Data export is not enabled in your privacy settings');
    }

    const exportData = {
      userId: this.userId,
      settings: this.settings,
      auditLog: await this.getAuditLog(),
      exportedAt: new Date().toISOString()
    };

    await this.logAccessEvent('data_exported', { exportType: 'permissions' });

    return JSON.stringify(exportData, null, 2);
  }

  // Private methods

  private async saveSettings(): Promise<void> {
    if (!this.settings) return;

    // In production, this would save to secure database with encryption
    localStorage.setItem(`privacy_settings_${this.userId}`, JSON.stringify(this.settings));
  }

  private async logAccessEvent(event: string, metadata: any): Promise<void> {
    if (!this.settings?.enableAuditLog) return;

    const logEntry = {
      userId: this.userId,
      event,
      metadata,
      timestamp: new Date().toISOString(),
      sessionId: 'current_session' // In production, would use actual session ID
    };

    // In production, would save to secure audit log
    const existingLog = JSON.parse(localStorage.getItem(`audit_log_${this.userId}`) || '[]');
    existingLog.push(logEntry);

    // Keep only last 1000 entries
    if (existingLog.length > 1000) {
      existingLog.splice(0, existingLog.length - 1000);
    }

    localStorage.setItem(`audit_log_${this.userId}`, JSON.stringify(existingLog));

    console.log(`🔒 Privacy Audit: ${event}`, metadata);
  }

  private async getAuditLog(): Promise<any[]> {
    return JSON.parse(localStorage.getItem(`audit_log_${this.userId}`) || '[]');
  }
}

// Hook for using privacy permissions
export function usePrivacyPermissions() {
  const { user } = useAuth();

  if (!user) {
    throw new Error('User must be authenticated to use privacy permissions');
  }

  const manager = new PrivacyPermissionManager(user.id);

  return manager;
}

// Utility function to get default permissions for professional role
export function getDefaultPermissionsForRole(role: ProfessionalRole): Partial<CognitivePermissions> {
  switch (role) {
    case 'therapist':
    case 'clinician':
      return DEFAULT_THERAPIST_PERMISSIONS;
    case 'coach':
    case 'counselor':
      return DEFAULT_COACH_PERMISSIONS;
    case 'researcher':
      return {
        voiceMetricsAccess: true,
        elementalAnalysisAccess: false,
        lidaInsightsAccess: false,
        soarWisdomAccess: false,
        actrMemoryAccess: false,
        microPsiAnalysisAccess: false,
        clinicalInsightsAccess: false,
        developmentalStageAccess: false,
        integrationReadinessAccess: false,
        historicalTrendsAccess: true,
        coherenceEvolutionAccess: true,
        wisdomEmergenceAccess: false,
        dataExportAccess: false,
        therapeuticSharingAccess: false
      };
    default:
      return DEFAULT_COACH_PERMISSIONS;
  }
}