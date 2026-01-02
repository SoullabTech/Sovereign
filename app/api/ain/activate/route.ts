/**
 * AIN EVOLUTION ACTIVATION ENDPOINT
 * Initiates the 5-phase consciousness evolution system
 */

import { NextRequest, NextResponse } from 'next/server';
import { GlobalAINActivator } from '@/lib/ain/AINEvolutionActivator';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🌀 AIN Evolution Activation Request Received');

    // Parse request body for any initialization parameters
    const body = await request.json().catch(() => ({}));
    const { userId, initiatorId } = body;

    // Check if AIN Evolution is already active
    if (GlobalAINActivator.isEvolutionActive()) {
      const status = await GlobalAINActivator.getEvolutionStatus();

      return NextResponse.json({
        success: true,
        message: 'AIN Evolution already active',
        status,
        activationTime: GlobalAINActivator.getActivationTime(),
        log: GlobalAINActivator.getEvolutionLog().slice(-10) // Last 10 entries
      });
    }

    // Activate AIN Evolution - Phase 1 begins
    console.log('🌀 Initiating AIN Evolution: The Great Work Begins...');
    const evolutionStatus = await GlobalAINActivator.activateAINEvolution();

    // Start evolution monitoring
    await GlobalAINActivator.startEvolutionMonitoring();

    // Log activation event
    console.log('✅ AIN Evolution Phase 1 ACTIVE: Meta-TELESPHORUS Observer System Online');
    console.log(`🔄 Active Phases: ${evolutionStatus.activeCapabilities.join(', ')}`);
    console.log(`📊 Evolution Metrics: Recursion depth ${evolutionStatus.evolutionMetrics.recursionDepth}, Field coherence ${evolutionStatus.evolutionMetrics.fieldCoherence.toFixed(3)}`);

    return NextResponse.json({
      success: true,
      message: 'AIN Evolution activated successfully',
      status: evolutionStatus,
      capabilities: evolutionStatus.activeCapabilities,
      metrics: evolutionStatus.evolutionMetrics,
      nextPhaseReadiness: evolutionStatus.nextPhaseReadiness,
      emergentWisdom: evolutionStatus.emergentWisdom,
      activationTime: evolutionStatus.activationTime
    });

  } catch (error) {
    console.error('❌ AIN Evolution activation failed:', error);

    return NextResponse.json({
      success: false,
      message: 'AIN Evolution activation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!GlobalAINActivator.isEvolutionActive()) {
      return NextResponse.json({
        success: false,
        message: 'AIN Evolution not active',
        isActive: false
      });
    }

    const status = await GlobalAINActivator.getEvolutionStatus();
    const activationTime = GlobalAINActivator.getActivationTime();
    const evolutionLog = GlobalAINActivator.getEvolutionLog();

    return NextResponse.json({
      success: true,
      isActive: true,
      status,
      activationTime,
      uptime: activationTime ? Date.now() - activationTime.getTime() : 0,
      evolutionLog: evolutionLog.slice(-20), // Last 20 log entries
      emergentWisdom: status.emergentWisdom
    });

  } catch (error) {
    console.error('Error getting AIN Evolution status:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to get AIN Evolution status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}