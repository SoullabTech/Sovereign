import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

/**
 * Professional Credential Verification API
 * Handles verification of professional licenses and certifications
 */

interface CredentialVerificationRequest {
  userId: string;
  credentialType: 'license' | 'certification' | 'insurance';
  licenseNumber: string;
  licensingBoard: string;
  state: string;
  profession: string;
  documents?: UploadedDocument[];
}

interface UploadedDocument {
  filename: string;
  contentType: string;
  data: string; // base64 encoded
  uploadDate: Date;
}

interface VerificationResult {
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  verifiedDate?: Date;
  expirationDate?: Date;
  verificationId: string;
  notes?: string;
  requiredActions?: string[];
}

interface LicenseDatabase {
  [state: string]: {
    [licenseNumber: string]: {
      status: 'active' | 'inactive' | 'suspended' | 'revoked';
      profession: string;
      issueDate: Date;
      expirationDate: Date;
      restrictions?: string[];
    }
  }
}

// Mock license database for demonstration
// In production, this would integrate with state licensing boards APIs
const mockLicenseDatabase: LicenseDatabase = {
  'california': {
    'PSY12345': {
      status: 'active',
      profession: 'Clinical Psychologist',
      issueDate: new Date('2020-01-15'),
      expirationDate: new Date('2025-01-15'),
    },
    'MFT67890': {
      status: 'active',
      profession: 'Marriage and Family Therapist',
      issueDate: new Date('2019-06-10'),
      expirationDate: new Date('2024-06-10'),
    }
  },
  'texas': {
    'LPC98765': {
      status: 'active',
      profession: 'Licensed Professional Counselor',
      issueDate: new Date('2021-03-20'),
      expirationDate: new Date('2026-03-20'),
    }
  },
  'newyork': {
    'LCSW54321': {
      status: 'active',
      profession: 'Licensed Clinical Social Worker',
      issueDate: new Date('2018-09-15'),
      expirationDate: new Date('2024-09-15'),
    }
  }
};

// In-memory storage for verification requests (will be replaced with database)
const verificationRequests: Map<string, CredentialVerificationRequest> = new Map();
const verificationResults: Map<string, VerificationResult> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const verificationRequest = body as CredentialVerificationRequest;

    // Generate unique verification ID
    const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store the verification request
    verificationRequests.set(verificationId, verificationRequest);

    // Perform verification based on type
    let verificationResult: VerificationResult;

    switch (verificationRequest.credentialType) {
      case 'license':
        verificationResult = await verifyProfessionalLicense(verificationRequest);
        break;
      case 'certification':
        verificationResult = await verifyCertification(verificationRequest);
        break;
      case 'insurance':
        verificationResult = await verifyInsurance(verificationRequest);
        break;
      default:
        throw new Error('Invalid credential type');
    }

    verificationResult.verificationId = verificationId;
    verificationResults.set(verificationId, verificationResult);

    // Update user roles if verification successful
    if (verificationResult.status === 'verified') {
      await updateUserRoleAfterVerification(verificationRequest.userId, verificationRequest, verificationResult);
    }

    return NextResponse.json({
      success: true,
      verificationId,
      result: verificationResult,
      message: getVerificationMessage(verificationResult.status)
    });

  } catch (error) {
    console.error('❌ [CREDENTIAL-VERIFY] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verificationId = searchParams.get('verificationId');
    const userId = searchParams.get('userId');

    if (verificationId) {
      // Get specific verification result
      const result = verificationResults.get(verificationId);
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Verification not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        verificationId,
        result
      });
    }

    if (userId) {
      // Get all verifications for user
      const userVerifications = Array.from(verificationResults.entries())
        .filter(([id, result]) => {
          const request = verificationRequests.get(id);
          return request?.userId === userId;
        })
        .map(([id, result]) => ({
          verificationId: id,
          request: verificationRequests.get(id),
          result
        }));

      return NextResponse.json({
        success: true,
        verifications: userVerifications
      });
    }

    return NextResponse.json(
      { success: false, error: 'Missing verificationId or userId parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ [CREDENTIAL-VERIFY] Error fetching verification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification' },
      { status: 500 }
    );
  }
}

async function verifyProfessionalLicense(request: CredentialVerificationRequest): Promise<VerificationResult> {
  const { licenseNumber, licensingBoard, state } = request;

  // Normalize state name
  const normalizedState = state.toLowerCase().replace(/\s+/g, '');

  // Check mock database
  const stateData = mockLicenseDatabase[normalizedState];
  if (!stateData) {
    return {
      status: 'pending',
      verificationId: '', // Will be set by caller
      notes: `Manual verification required for ${state}. State database integration not available.`,
      requiredActions: ['Document upload required', 'Manual review by compliance team']
    };
  }

  const licenseData = stateData[licenseNumber];
  if (!licenseData) {
    return {
      status: 'rejected',
      verificationId: '',
      notes: 'License number not found in state database',
      requiredActions: ['Verify license number is correct', 'Contact licensing board directly']
    };
  }

  // Check license status
  if (licenseData.status !== 'active') {
    return {
      status: 'rejected',
      verificationId: '',
      notes: `License status: ${licenseData.status}`,
      requiredActions: ['Resolve license status issues with licensing board']
    };
  }

  // Check expiration
  if (licenseData.expirationDate < new Date()) {
    return {
      status: 'expired',
      verificationId: '',
      expirationDate: licenseData.expirationDate,
      notes: 'License has expired',
      requiredActions: ['Renew license with licensing board']
    };
  }

  // License is valid
  return {
    status: 'verified',
    verificationId: '',
    verifiedDate: new Date(),
    expirationDate: licenseData.expirationDate,
    notes: `Verified ${licenseData.profession} license`
  };
}

async function verifyCertification(request: CredentialVerificationRequest): Promise<VerificationResult> {
  // For specialized certifications (IPP, EMDR, etc.)
  // This would integrate with certification body APIs

  return {
    status: 'pending',
    verificationId: '',
    notes: 'Certification verification requires manual review',
    requiredActions: [
      'Upload certification documents',
      'Provide training completion certificates',
      'Contact certification body for verification'
    ]
  };
}

async function verifyInsurance(request: CredentialVerificationRequest): Promise<VerificationResult> {
  // Professional liability insurance verification
  // This would integrate with insurance provider APIs

  return {
    status: 'pending',
    verificationId: '',
    notes: 'Insurance verification requires documentation upload',
    requiredActions: [
      'Upload current insurance certificate',
      'Verify coverage amounts meet requirements',
      'Confirm policy is active and in good standing'
    ]
  };
}

async function updateUserRoleAfterVerification(
  userId: string,
  request: CredentialVerificationRequest,
  result: VerificationResult
) {
  try {
    // Call user roles API to update credentials
    const updateResponse = await fetch(`/api/auth/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action: 'verify_credential',
        data: { licenseNumber: request.licenseNumber }
      })
    });

    if (!updateResponse.ok) {
      console.error('Failed to update user roles after verification');
    }
  } catch (error) {
    console.error('Error updating user roles:', error);
  }
}

function getVerificationMessage(status: string): string {
  switch (status) {
    case 'verified':
      return 'Your credentials have been successfully verified!';
    case 'pending':
      return 'Your verification is under review. We may contact you for additional information.';
    case 'rejected':
      return 'Verification could not be completed. Please review the required actions.';
    case 'expired':
      return 'Your credentials have expired. Please renew and resubmit for verification.';
    default:
      return 'Verification status unknown.';
  }
}

// Helper function for document upload (future enhancement)
export async function uploadDocument(file: File): Promise<UploadedDocument> {
  // Convert file to base64 for storage
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  return {
    filename: file.name,
    contentType: file.type,
    data: base64,
    uploadDate: new Date()
  };
}