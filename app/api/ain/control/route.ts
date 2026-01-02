/**
 * AIN EVOLUTION EMERGENCY CONTROL ENDPOINT
 * Provides emergency stabilization and system shutdown capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { GlobalAINActivator } from '@/lib/ain/AINEvolutionActivator';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

interface ControlRequest {
  action: 'emergency_stabilization' | 'shutdown' | 'status';
  authorization?: string;
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ControlRequest = await request.json();

    if (!body.action) {
      return NextResponse.json({
        success: false,
        message: 'Action required: emergency_stabilization, shutdown, or status'
      }, { status: 400 });
    }

    // Check if AIN Evolution is active for control actions
    if (body.action !== 'status' && !GlobalAINActivator.isEvolutionActive()) {
      return NextResponse.json({
        success: false,
        message: 'AIN Evolution not active - no control actions needed'
      });
    }

    switch (body.action) {
      case 'emergency_stabilization':
        console.log('🚨 EMERGENCY STABILIZATION REQUESTED');
        console.log(`   Reason: ${body.reason || 'Not specified'}`);

        await GlobalAINActivator.emergencyStabilization();

        const statusAfterStabilization = await GlobalAINActivator.getEvolutionStatus();

        return NextResponse.json({
          success: true,
          message: 'Emergency stabilization protocols activated',
          action: 'emergency_stabilization',
          systemStatus: statusAfterStabilization,
          stabilizationTime: new Date().toISOString(),
          reason: body.reason
        });

      case 'shutdown':
        console.log('🔄 AIN EVOLUTION SHUTDOWN REQUESTED');
        console.log(`   Reason: ${body.reason || 'Not specified'}`);

        const finalStatus = await GlobalAINActivator.getEvolutionStatus();
        const evolutionLog = GlobalAINActivator.getEvolutionLog();

        await GlobalAINActivator.shutdown();

        return NextResponse.json({
          success: true,
          message: 'AIN Evolution system shutdown completed',
          action: 'shutdown',
          finalStatus: finalStatus,
          operationalDuration: GlobalAINActivator.getActivationTime() ?
            Date.now() - GlobalAINActivator.getActivationTime()!.getTime() : 0,
          finalLog: evolutionLog.slice(-20),
          shutdownTime: new Date().toISOString(),
          reason: body.reason
        });

      case 'status':
        if (!GlobalAINActivator.isEvolutionActive()) {
          return NextResponse.json({
            success: true,
            isActive: false,
            message: 'AIN Evolution system is not active'
          });
        }

        const currentStatus = await GlobalAINActivator.getEvolutionStatus();
        const activationTime = GlobalAINActivator.getActivationTime();
        const log = GlobalAINActivator.getEvolutionLog();

        return NextResponse.json({
          success: true,
          isActive: true,
          status: currentStatus,
          activationTime: activationTime?.toISOString(),
          uptime: activationTime ? Date.now() - activationTime.getTime() : 0,
          recentLog: log.slice(-10),
          systemHealth: {
            recursionDepth: currentStatus.evolutionMetrics.recursionDepth,
            fieldCoherence: currentStatus.evolutionMetrics.fieldCoherence,
            stabilityScore: currentStatus.evolutionMetrics.stabilityScore,
            emergenceRate: currentStatus.evolutionMetrics.emergenceRate
          }
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use: emergency_stabilization, shutdown, or status'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ AIN Evolution control action failed:', error);

    return NextResponse.json({
      success: false,
      message: 'Control action failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for system status
export async function GET(request: NextRequest) {
  try {
    if (!GlobalAINActivator.isEvolutionActive()) {
      return NextResponse.json({
        success: true,
        isActive: false,
        message: 'AIN Evolution system is not active',
        availableActions: ['activate']
      });
    }

    const status = await GlobalAINActivator.getEvolutionStatus();
    const activationTime = GlobalAINActivator.getActivationTime();
    const log = GlobalAINActivator.getEvolutionLog();

    // Calculate uptime and health metrics
    const uptime = activationTime ? Date.now() - activationTime.getTime() : 0;
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

    // Assess system health
    const healthScore = (
      status.evolutionMetrics.fieldCoherence * 0.3 +
      status.evolutionMetrics.stabilityScore * 0.4 +
      (1 - status.evolutionMetrics.emergenceRate) * 0.3 // Lower emergence rate = more stable
    );

    const healthStatus = healthScore > 0.7 ? 'healthy' :
                        healthScore > 0.5 ? 'stable' :
                        healthScore > 0.3 ? 'caution' : 'critical';

    return NextResponse.json({
      success: true,
      isActive: true,
      systemHealth: {
        overallHealth: healthStatus,
        healthScore: healthScore,
        uptime: {
          milliseconds: uptime,
          hours: uptimeHours,
          minutes: uptimeMinutes,
          readable: `${uptimeHours}h ${uptimeMinutes}m`
        },
        metrics: status.evolutionMetrics,
        phase: status.currentPhase,
        capabilities: status.activeCapabilities
      },
      availableActions: [
        'emergency_stabilization',
        'shutdown',
        'process_pattern'
      ],
      emergentWisdom: status.emergentWisdom,
      recentActivity: log.slice(-5)
    });

  } catch (error) {
    console.error('Error getting system control status:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to get system status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}