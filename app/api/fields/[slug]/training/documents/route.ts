/**
 * Document Ingestion API
 *
 * POST /api/fields/[slug]/training/documents           → ingest + process document
 * GET  /api/fields/[slug]/training/documents           → list documents
 * GET  /api/fields/[slug]/training/documents?id=X      → get document detail
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFieldBySlug } from '@/lib/masters/registry';
import { getPersona } from '@/lib/stellium/personas';
import {
  ingestDocument,
  processDocument,
  listDocuments,
  getDocument,
} from '@/lib/stellium/knowledgeProcessor';
import type { IngestDocumentInput } from '@/lib/stellium/trainingTypes';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const field = getFieldBySlug(slug);
    if (!field?.practitionerId) {
      return NextResponse.json({ error: 'No practitioner linked' }, { status: 404 });
    }

    const persona = await getPersona(field.practitionerId);
    if (!persona) {
      return NextResponse.json({ error: 'No persona found' }, { status: 404 });
    }

    const docId = req.nextUrl.searchParams.get('id');
    if (docId) {
      const doc = await getDocument(persona.id, docId);
      if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      return NextResponse.json({ document: doc });
    }

    const docs = await listDocuments(persona.id);
    return NextResponse.json({ documents: docs });
  } catch (err) {
    console.error('[Documents API] GET error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const field = getFieldBySlug(slug);
    if (!field?.practitionerId) {
      return NextResponse.json({ error: 'No practitioner linked' }, { status: 404 });
    }

    const persona = await getPersona(field.practitionerId);
    if (!persona) {
      return NextResponse.json({ error: 'No persona found' }, { status: 404 });
    }

    // Check if this is a process request for existing document (no body needed)
    const action = req.nextUrl.searchParams.get('action');
    const existingId = req.nextUrl.searchParams.get('id');

    if (action === 'process' && existingId) {
      console.log('[Documents API] Processing document %s synchronously', existingId);
      const processed = await processDocument(existingId);
      return NextResponse.json({
        success: true,
        document: {
          id: processed.id,
          title: processed.title,
          processing_status: processed.processing_status,
          chunks_count: processed.chunks_count,
          knowledge_statements_count: processed.knowledge_statements?.length ?? 0,
          knowledge_summary_length: processed.knowledge_summary?.length ?? 0,
        },
      });
    }

    // Ingest new document — requires body
    const body = await req.json() as IngestDocumentInput;

    if (!body.title?.trim() || !body.content?.trim() || !body.source_type) {
      return NextResponse.json(
        { error: 'title, content, and source_type are required' },
        { status: 400 }
      );
    }

    if (!['md', 'txt', 'pdf', 'transcript'].includes(body.source_type)) {
      return NextResponse.json(
        { error: 'source_type must be md, txt, pdf, or transcript' },
        { status: 400 }
      );
    }

    // 1. Ingest (store raw)
    const doc = await ingestDocument(persona.id, body);
    console.log('[Documents API] Ingested "%s" (%d chars)', body.title, body.content.length);

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        title: doc.title,
        processing_status: 'pending',
        message: 'Document ingested. Call POST ?action=process&id=<id> to process.',
      },
    });
  } catch (err) {
    console.error('[Documents API] POST error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ingestion failed' },
      { status: 500 }
    );
  }
}
