/**
 * RLM Health Check API
 *
 * Checks the health of the RLM Python microservice.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const RLM_SERVICE_URL = process.env.RLM_SERVICE_URL || 'http://rlm:8080';

export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(`${RLM_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          error: 'RLM service returned non-200',
        },
        { status: 503 }
      );
    }

    const health = await response.json();

    return NextResponse.json({
      status: 'healthy',
      service: 'rlm',
      version: health.version,
      model: health.model,
    });
  } catch (error) {
    console.error('[RLM Health] Error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'RLM service unreachable',
        hint: 'Ensure RLM container is running',
      },
      { status: 503 }
    );
  }
}
