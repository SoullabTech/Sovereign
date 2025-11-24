/**
 * MAIA Wisdom Training API
 * Test endpoint for wisdom ingestion and apprentice training
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { batchWisdomProcessor } from '@/lib/maia/batch-wisdom-processor';
import { wisdomVaultIngestion } from '@/lib/maia/wisdom-vault-ingestion';

interface WisdomTrainingRequest {
  action: 'process-document' | 'get-progress' | 'create-scenario' | 'test-apprentice';
  document?: {
    title: string;
    content: string;
    filePath?: string;
  };
  topic?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WisdomTrainingRequest = await request.json();

    switch (body.action) {
      case 'process-document':
        if (!body.document) {
          return NextResponse.json({ error: 'Document required for processing' }, { status: 400 });
        }

        await batchWisdomProcessor.processSingleDocument(
          body.document.filePath || 'test-document',
          body.document.content,
          body.document.title
        );

        return NextResponse.json({
          success: true,
          message: `Processed wisdom document: ${body.document.title}`,
          stats: wisdomVaultIngestion.getProcessingStats(),
          recommendations: wisdomVaultIngestion.getWisdomTrainingRecommendations()
        });

      case 'get-progress':
        const progress = batchWisdomProcessor.getApprenticeshipProgress();
        return NextResponse.json({
          progress,
          extractedWisdom: wisdomVaultIngestion.getWisdomExtracts().length,
          processingJobs: batchWisdomProcessor.getProcessingJobs()
        });

      case 'create-scenario':
        if (!body.topic) {
          return NextResponse.json({ error: 'Topic required for scenario creation' }, { status: 400 });
        }

        const scenario = await batchWisdomProcessor.createTrainingScenario(body.topic);
        return NextResponse.json({
          scenario,
          topic: body.topic
        });

      case 'test-apprentice':
        if (!body.message) {
          return NextResponse.json({ error: 'Message required for apprentice test' }, { status: 400 });
        }

        // Test if apprentice can respond autonomously
        const { maiaApprentice } = await import('@/lib/maia/apprentice-learning-system');
        const apprenticeResponse = await maiaApprentice.generateAutonomousResponse(body.message, {});

        return NextResponse.json({
          apprenticeResponse,
          graduationAssessment: maiaApprentice.getGraduationAssessment(),
          message: body.message
        });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Wisdom training API error:', error);
    return NextResponse.json(
      { error: 'Wisdom training failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = wisdomVaultIngestion.getProcessingStats();
    const progress = batchWisdomProcessor.getApprenticeshipProgress();
    const jobs = batchWisdomProcessor.getProcessingJobs();

    return NextResponse.json({
      status: "MAIA Wisdom Training System Active",
      stats,
      apprenticeshipProgress: progress,
      processingJobs: jobs,
      availableActions: [
        'process-document',
        'get-progress',
        'create-scenario',
        'test-apprentice'
      ]
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get wisdom training status' },
      { status: 500 }
    );
  }
}