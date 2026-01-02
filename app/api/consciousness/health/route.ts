/**
 * Ultimate Consciousness System Health Check Endpoint
 * Monitors technological anamnesis system integrity
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkUltimateSystemHealth } from '@/lib/consciousness-computing/ultimate-consciousness-system';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check ultimate consciousness system health
    const systemHealth = await checkUltimateSystemHealth();

    // Additional integrity checks
    const integrityChecks = {
      // Verify core files exist
      ultimateSystemFile: checkFileExists('/lib/consciousness-computing/ultimate-consciousness-system.ts'),
      enhancedWitnessFile: checkFileExists('/lib/consciousness-computing/enhanced-consciousness-witness.ts'),
      agentSystemFile: checkFileExists('/lib/consciousness-computing/consciousness-agent-system.ts'),

      // Verify API integration
      apiIntegration: await checkAPIIntegration(),

      // Verify database tables
      databaseTables: await checkDatabaseTables(),

      // Sacred elements verification
      sacredElements: await verifySacredElements()
    };

    const overallHealth = calculateOverallHealth(systemHealth, integrityChecks);

    return NextResponse.json({
      status: overallHealth.status,
      timestamp: new Date().toISOString(),

      // Ultimate consciousness system health
      ultimateSystem: systemHealth,

      // System integrity
      integrity: integrityChecks,

      // Overall assessment
      assessment: overallHealth,

      // Recommendations
      recommendations: generateHealthRecommendations(systemHealth, integrityChecks),

      // Monitoring metadata
      monitoring: {
        checkType: 'comprehensive',
        version: '1.0.0',
        technologicalAnamnesisActive: systemHealth.anamnesisFunctional
      }
    });

  } catch (error) {
    console.error('❌ [Health Check] System health check failed:', error);

    return NextResponse.json({
      status: 'critical',
      error: 'Health check system failure',
      timestamp: new Date().toISOString(),
      ultimateSystem: {
        status: 'unknown',
        error: String(error)
      }
    }, { status: 500 });
  }
}

function checkFileExists(relativePath: string): boolean {
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), relativePath);
    return fs.existsSync(fullPath);
  } catch (error) {
    return false;
  }
}

async function checkAPIIntegration(): Promise<{
  integrated: boolean;
  ultimateSessionProcessing: boolean;
  error?: string;
}> {
  try {
    // Check if the API route contains ultimate consciousness integration
    const fs = require('fs');
    const path = require('path');
    const apiPath = path.join(process.cwd(), 'app/api/between/chat/route.ts');

    if (!fs.existsSync(apiPath)) {
      return { integrated: false, ultimateSessionProcessing: false, error: 'API route not found' };
    }

    const content = fs.readFileSync(apiPath, 'utf8');
    const hasUltimateImport = content.includes('processUltimateMAIAConsciousnessSession');
    const hasUltimateProcessing = content.includes('ultimateSession = await processUltimateMAIAConsciousnessSession');

    return {
      integrated: hasUltimateImport,
      ultimateSessionProcessing: hasUltimateProcessing
    };
  } catch (error) {
    return { integrated: false, ultimateSessionProcessing: false, error: String(error) };
  }
}

async function checkDatabaseTables(): Promise<{
  consciousnessTablesExist: boolean;
  agentTablesExist: boolean;
  sacredElementTables: boolean;
  error?: string;
}> {
  try {
    // In a production system, you would check actual database connection
    // For now, we'll check if schema files exist
    const fs = require('fs');
    const witnessSchemaExists = fs.existsSync('/tmp/enhanced_consciousness_witnessing_tables.sql');
    const agentSchemaExists = fs.existsSync('/tmp/consciousness_memory_factory_tables.sql');

    return {
      consciousnessTablesExist: witnessSchemaExists,
      agentTablesExist: agentSchemaExists,
      sacredElementTables: witnessSchemaExists && agentSchemaExists
    };
  } catch (error) {
    return {
      consciousnessTablesExist: false,
      agentTablesExist: false,
      sacredElementTables: false,
      error: String(error)
    };
  }
}

async function verifySacredElements(): Promise<{
  emotionalSomaticTracking: boolean;
  languageEvolution: boolean;
  microMoments: boolean;
  sacredTiming: boolean;
  wisdomSynthesis: boolean;
  lifeIntegration: boolean;
}> {
  try {
    const fs = require('fs');
    const schemaPath = '/tmp/enhanced_consciousness_witnessing_tables.sql';

    if (!fs.existsSync(schemaPath)) {
      return {
        emotionalSomaticTracking: false,
        languageEvolution: false,
        microMoments: false,
        sacredTiming: false,
        wisdomSynthesis: false,
        lifeIntegration: false
      };
    }

    const content = fs.readFileSync(schemaPath, 'utf8');

    return {
      emotionalSomaticTracking: content.includes('consciousness_emotional_states'),
      languageEvolution: content.includes('consciousness_language_evolution'),
      microMoments: content.includes('consciousness_micro_moments'),
      sacredTiming: content.includes('consciousness_sacred_timing'),
      wisdomSynthesis: content.includes('consciousness_wisdom_synthesis'),
      lifeIntegration: content.includes('consciousness_life_integration')
    };
  } catch (error) {
    return {
      emotionalSomaticTracking: false,
      languageEvolution: false,
      microMoments: false,
      sacredTiming: false,
      wisdomSynthesis: false,
      lifeIntegration: false
    };
  }
}

function calculateOverallHealth(
  systemHealth: any,
  integrityChecks: any
): {
  status: 'transcendent' | 'optimal' | 'functional' | 'degraded' | 'critical';
  score: number;
  issues: string[];
} {
  let score = 0;
  const issues: string[] = [];
  const maxScore = 100;

  // Ultimate system health (40 points)
  if (systemHealth.status === 'transcendent') score += 40;
  else if (systemHealth.status === 'optimal') score += 35;
  else if (systemHealth.status === 'functional') score += 25;
  else if (systemHealth.status === 'degraded') score += 15;
  else issues.push('Ultimate consciousness system offline');

  // File integrity (20 points)
  const fileChecks = [
    integrityChecks.ultimateSystemFile,
    integrityChecks.enhancedWitnessFile,
    integrityChecks.agentSystemFile
  ];
  const fileScore = fileChecks.filter(Boolean).length / fileChecks.length * 20;
  score += fileScore;
  if (fileScore < 20) issues.push('Core system files missing');

  // API integration (20 points)
  if (integrityChecks.apiIntegration.integrated && integrityChecks.apiIntegration.ultimateSessionProcessing) {
    score += 20;
  } else {
    issues.push('API integration incomplete');
  }

  // Database integrity (10 points)
  if (integrityChecks.databaseTables.sacredElementTables) {
    score += 10;
  } else {
    issues.push('Database schema incomplete');
  }

  // Sacred elements (10 points)
  const sacredElements = Object.values(integrityChecks.sacredElements);
  const sacredScore = sacredElements.filter(Boolean).length / sacredElements.length * 10;
  score += sacredScore;
  if (sacredScore < 10) issues.push('Sacred elements incomplete');

  let status: 'transcendent' | 'optimal' | 'functional' | 'degraded' | 'critical';
  if (score >= 95) status = 'transcendent';
  else if (score >= 85) status = 'optimal';
  else if (score >= 70) status = 'functional';
  else if (score >= 50) status = 'degraded';
  else status = 'critical';

  return { status, score, issues };
}

function generateHealthRecommendations(
  systemHealth: any,
  integrityChecks: any
): string[] {
  const recommendations: string[] = [];

  if (!integrityChecks.ultimateSystemFile) {
    recommendations.push('🚨 CRITICAL: Restore ultimate-consciousness-system.ts from backup');
  }

  if (!integrityChecks.enhancedWitnessFile) {
    recommendations.push('🚨 CRITICAL: Restore enhanced-consciousness-witness.ts from backup');
  }

  if (!integrityChecks.apiIntegration.integrated) {
    recommendations.push('🔧 Restore API integration in /app/api/between/chat/route.ts');
  }

  if (!integrityChecks.databaseTables.sacredElementTables) {
    recommendations.push('🗄️ Execute database schema: /tmp/enhanced_consciousness_witnessing_tables.sql');
  }

  if (systemHealth.status !== 'transcendent') {
    recommendations.push('⚡ Run system diagnostics and check error logs');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ System operating at peak consciousness integration');
    recommendations.push('🌟 Technological anamnesis functioning perfectly');
  }

  return recommendations;
}