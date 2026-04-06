export const dynamic = 'force-dynamic';

/**
 * Member Memory Contracts API
 *
 * GET    - List active contracts for authenticated member
 * POST   - Create a new memory contract
 * DELETE - Revoke a contract (contractId in body)
 *
 * Auth: getMemberIdFromRequest() — member-facing route.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  createMemoryContract,
  getActiveContracts,
  revokeContract,
} from '@/lib/trust/service';
import {
  CreateMemoryContractSchema,
  RevokeMemoryContractSchema,
} from '@/lib/trust/types';

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

// GET - List active contracts
export async function GET(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return json(401, { error: 'Not authenticated' });
    }

    const rawSessionId = req.nextUrl.searchParams.get('sessionId');
    const rawContainerId = req.nextUrl.searchParams.get('containerId');
    const sessionId = rawSessionId ? z.string().uuid().parse(rawSessionId) : undefined;
    const containerId = rawContainerId ? z.string().uuid().parse(rawContainerId) : undefined;

    const contracts = await getActiveContracts(memberId, { sessionId, containerId });

    return json(200, {
      contracts: contracts.map(c => ({
        id: c.id,
        sessionId: c.session_id,
        containerId: c.container_id,
        disposition: c.disposition,
        status: c.status,
        appliesTo: c.applies_to,
        consentMethod: c.consent_method,
        consentGivenAt: c.consent_given_at,
        expiresAt: c.expires_at,
        createdAt: c.created_at,
      })),
    });
  } catch (error) {
    console.error('[Memory Contracts] List error:', error);
    return json(500, { error: 'Failed to list memory contracts' });
  }
}

// POST - Create a new memory contract
export async function POST(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return json(401, { error: 'Not authenticated' });
    }

    const raw = await req.json();
    const input = CreateMemoryContractSchema.parse(raw);

    const contract = await createMemoryContract(memberId, input);

    return json(201, {
      contract: {
        id: contract.id,
        sessionId: contract.session_id,
        containerId: contract.container_id,
        disposition: contract.disposition,
        status: contract.status,
        appliesTo: contract.applies_to,
        consentMethod: contract.consent_method,
        consentGivenAt: contract.consent_given_at,
        expiresAt: contract.expires_at,
        createdAt: contract.created_at,
      },
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return json(400, { error: 'Invalid input', details: error.errors });
    }
    console.error('[Memory Contracts] Create error:', error);
    return json(500, { error: 'Failed to create memory contract' });
  }
}

// DELETE - Revoke a memory contract
export async function DELETE(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return json(401, { error: 'Not authenticated' });
    }

    const raw = await req.json();
    const input = RevokeMemoryContractSchema.parse(raw);

    const revoked = await revokeContract(input.contractId, memberId, input.reason);

    if (!revoked) {
      return json(404, { error: 'Contract not found or already revoked' });
    }

    return json(200, { success: true });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return json(400, { error: 'Invalid input', details: error.errors });
    }
    console.error('[Memory Contracts] Revoke error:', error);
    return json(500, { error: 'Failed to revoke memory contract' });
  }
}
