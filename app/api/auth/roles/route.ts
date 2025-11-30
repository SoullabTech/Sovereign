import { NextRequest, NextResponse } from 'next/server';

/**
 * User Role Management API
 * Handles multi-tier user roles and professional verification
 */

export enum UserRole {
  CONSUMER = "consumer",
  LICENSED_PROFESSIONAL = "licensed_professional",
  IPP_PRACTITIONER = "ipp_practitioner",
  EMDR_THERAPIST = "emdr_therapist",
  DBT_SPECIALIST = "dbt_specialist",
  IFS_THERAPIST = "ifs_therapist",
  CLINICAL_SUPERVISOR = "clinical_supervisor",
  RESEARCH_PARTICIPANT = "research_participant"
}

export enum SubscriptionTier {
  FREE = "free",
  PLUS = "plus", // $9.99/month
  PREMIUM = "premium", // $19.99/month
  PROFESSIONAL = "professional", // $49.99/month
  CLINICAL_IPP = "clinical_ipp", // $149.99/month
  CLINICAL_EMDR = "clinical_emdr", // $99.99/month
  CLINICAL_DBT = "clinical_dbt" // $79.99/month
}

interface UserRoleData {
  userId: string;
  roles: UserRole[];
  subscriptions: SubscriptionTier[];
  credentials: ProfessionalCredential[];
  frameworks: FrameworkAccess[];
  verification: VerificationStatus;
}

interface ProfessionalCredential {
  type: string;
  licenseNumber: string;
  licensingBoard: string;
  state: string;
  expirationDate: Date;
  verificationStatus: 'pending' | 'verified' | 'expired' | 'invalid';
  verifiedDate?: Date;
}

interface FrameworkAccess {
  frameworkId: string;
  accessLevel: 'basic' | 'standard' | 'advanced' | 'supervisor';
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  certification: CertificationStatus;
  expirationDate: Date;
}

interface CertificationStatus {
  required: boolean;
  certified: boolean;
  certificationBody?: string;
  certificationNumber?: string;
  expirationDate?: Date;
}

interface VerificationStatus {
  professionalLicense: boolean;
  malpracticeInsurance: boolean;
  backgroundCheck: boolean;
  continuingEducation: boolean;
  supervision: boolean;
}

// In-memory storage for MVP (will be replaced with database)
const userRoles: Map<string, UserRoleData> = new Map();

// Default role for new users
function getDefaultUserRole(userId: string): UserRoleData {
  return {
    userId,
    roles: [UserRole.CONSUMER],
    subscriptions: [SubscriptionTier.FREE],
    credentials: [],
    frameworks: [],
    verification: {
      professionalLicense: false,
      malpracticeInsurance: false,
      backgroundCheck: false,
      continuingEducation: false,
      supervision: false
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId === 'guest') {
      return NextResponse.json({
        success: true,
        roles: [UserRole.CONSUMER],
        subscriptions: [SubscriptionTier.FREE],
        access: {
          coreMaia: true,
          professional: false,
          clinical: false,
          frameworks: []
        }
      });
    }

    // Get or create user role data
    let roleData = userRoles.get(userId);
    if (!roleData) {
      roleData = getDefaultUserRole(userId);
      userRoles.set(userId, roleData);
    }

    // Calculate access levels
    const access = {
      coreMaia: true, // Everyone has access to core MAIA
      professional: roleData.roles.some(role =>
        role !== UserRole.CONSUMER && role !== UserRole.RESEARCH_PARTICIPANT
      ),
      clinical: roleData.subscriptions.some(sub =>
        sub.includes('clinical_')
      ),
      frameworks: roleData.frameworks.filter(fw => fw.subscriptionStatus === 'active')
    };

    return NextResponse.json({
      success: true,
      userId: roleData.userId,
      roles: roleData.roles,
      subscriptions: roleData.subscriptions,
      credentials: roleData.credentials,
      frameworks: roleData.frameworks,
      verification: roleData.verification,
      access
    });

  } catch (error) {
    console.error('❌ [USER-ROLES] Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || userId === 'guest') {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get or create user role data
    let roleData = userRoles.get(userId);
    if (!roleData) {
      roleData = getDefaultUserRole(userId);
    }

    switch (action) {
      case 'upgrade_subscription':
        const newTier = data.tier as SubscriptionTier;
        if (!roleData.subscriptions.includes(newTier)) {
          roleData.subscriptions.push(newTier);
        }
        break;

      case 'add_credential':
        const credential = data.credential as ProfessionalCredential;
        roleData.credentials.push(credential);
        // Add professional role if first credential
        if (!roleData.roles.includes(UserRole.LICENSED_PROFESSIONAL)) {
          roleData.roles.push(UserRole.LICENSED_PROFESSIONAL);
        }
        break;

      case 'add_framework_access':
        const frameworkAccess = data.framework as FrameworkAccess;
        // Remove existing access for same framework
        roleData.frameworks = roleData.frameworks.filter(
          fw => fw.frameworkId !== frameworkAccess.frameworkId
        );
        roleData.frameworks.push(frameworkAccess);

        // Add specialized role based on framework
        if (frameworkAccess.frameworkId === 'ipp' &&
            !roleData.roles.includes(UserRole.IPP_PRACTITIONER)) {
          roleData.roles.push(UserRole.IPP_PRACTITIONER);
        }
        break;

      case 'verify_credential':
        const licenseNumber = data.licenseNumber;
        const credentialIndex = roleData.credentials.findIndex(
          cred => cred.licenseNumber === licenseNumber
        );
        if (credentialIndex >= 0) {
          roleData.credentials[credentialIndex].verificationStatus = 'verified';
          roleData.credentials[credentialIndex].verifiedDate = new Date();
          roleData.verification.professionalLicense = true;
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Save updated role data
    userRoles.set(userId, roleData);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${action}`,
      roleData
    });

  } catch (error) {
    console.error('❌ [USER-ROLES] Error updating roles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user roles' },
      { status: 500 }
    );
  }
}

// Helper function to check user access
export async function checkUserAccess(
  userId: string,
  requiredRole?: UserRole,
  requiredFramework?: string
): Promise<{ authorized: boolean; reason?: string }> {

  if (!userId || userId === 'guest') {
    return { authorized: false, reason: 'Guest users not authorized' };
  }

  const roleData = userRoles.get(userId);
  if (!roleData) {
    return { authorized: false, reason: 'User not found' };
  }

  // Check role requirement
  if (requiredRole && !roleData.roles.includes(requiredRole)) {
    return { authorized: false, reason: `Missing required role: ${requiredRole}` };
  }

  // Check framework access requirement
  if (requiredFramework) {
    const frameworkAccess = roleData.frameworks.find(
      fw => fw.frameworkId === requiredFramework && fw.subscriptionStatus === 'active'
    );
    if (!frameworkAccess) {
      return { authorized: false, reason: `No active access to framework: ${requiredFramework}` };
    }
  }

  return { authorized: true };
}