/**
 * File Processing API - Text Extraction & Embedding Pipeline
 * Converts uploaded files into searchable memory chunks for Maya
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { parsePDF } from '@/lib/pdf-parse-wrapper';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Optimal chunk size for text-embedding-3-small model
const CHUNK_SIZE = 600; // tokens (~800 characters)
const CHUNK_OVERLAP = 100; // token overlap between chunks

interface ProcessingRequest {
  fileId: string;
  userId: string;
  mimeType: string;
  storagePath: string;
}

export async function POST(request: NextRequest) {
  try {
    const { fileId, userId, mimeType, storagePath }: ProcessingRequest = await request.json();


    // Update file status to processing
    await updateFileStatus(fileId, 'processing', 'Extracting text content...');

    // 1. Download file from storage
    const fileContent = await downloadFile(storagePath);
    if (!fileContent) {
      await updateFileStatus(fileId, 'error', 'Failed to download file from storage');
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // 2. Extract text based on file type
    let extractedText: string;
    try {
      extractedText = await extractText(fileContent, mimeType);
    } catch (error) {
      console.error('Text extraction failed:', error);
      await updateFileStatus(fileId, 'error', 'Failed to extract text from file');
      return NextResponse.json({ error: 'Text extraction failed' }, { status: 500 });
    }

    if (!extractedText.trim()) {
      await updateFileStatus(fileId, 'error', 'No text content found in file');
      return NextResponse.json({ error: 'No text content found' }, { status: 400 });
    }

    // Update status
    await updateFileStatus(fileId, 'processing', 'Creating memory chunks...');

    // 3. Smart chunking - preserve sentence boundaries
    const chunks = await intelligentChunking(extractedText, fileId);

    // Update status
    await updateFileStatus(fileId, 'processing', 'Generating embeddings...');

    // 4. Generate embeddings for each chunk
    const embeddingPromises = chunks.map(async (chunk, index) => {
      try {
        const embedding = await generateEmbedding(chunk.text);
        
        return {
          id: uuidv4(),
          file_id: fileId,
          user_id: userId,
          chunk_index: index,
          text_content: chunk.text,
          token_count: chunk.tokens,
          start_index: chunk.startIndex,
          end_index: chunk.endIndex,
          embedding: embedding,
          created_at: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Failed to process chunk ${index}:`, error);
        return null; // Skip failed chunks
      }
    });

    const embeddingResults = await Promise.all(embeddingPromises);
    const validEmbeddings = embeddingResults.filter(r => r !== null);

    if (validEmbeddings.length === 0) {
      await updateFileStatus(fileId, 'error', 'Failed to generate embeddings');
      return NextResponse.json({ error: 'Failed to generate embeddings' }, { status: 500 });
    }

    // Update status
    await updateFileStatus(fileId, 'processing', 'Storing in memory system...');

    // 5. Store embeddings in database
    const { error: embeddingError } = await supabase
      .from('file_embeddings')
      .insert(validEmbeddings);

    if (embeddingError) {
      console.error('Failed to store embeddings:', embeddingError);
      await updateFileStatus(fileId, 'error', 'Failed to store embeddings in memory');
      return NextResponse.json({ error: 'Failed to store embeddings' }, { status: 500 });
    }

    // 6. Update file record with completion
    const { error: updateError } = await supabase
      .from('user_files')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        text_preview: extractedText.slice(0, 500) + (extractedText.length > 500 ? '...' : ''),
        total_chunks: validEmbeddings.length,
        total_tokens: validEmbeddings.reduce((sum, e) => sum + e.token_count, 0),
        processing_notes: 'Successfully integrated into Maya\'s memory system'
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Failed to update file status:', updateError);
    }

    console.log('File processing completed:', {
      fileId,
      chunks: validEmbeddings.length,
      tokens: validEmbeddings.reduce((sum, e) => sum + e.token_count, 0)
    });

    return NextResponse.json({
      success: true,
      fileId,
      chunksCreated: validEmbeddings.length,
      tokensProcessed: validEmbeddings.reduce((sum, e) => sum + e.token_count, 0),
      status: 'completed',
      message: 'File successfully integrated into Maya\'s memory'
    });

  } catch (error) {
    console.error('File processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

// Download file from Supabase storage
async function downloadFile(storagePath: string): Promise<Buffer | null> {
  try {
    const { data, error } = await supabase.storage
      .from('maya-files')
      .download(storagePath);

    if (error || !data) {
      console.error('Storage download error:', error);
      return null;
    }

    return Buffer.from(await data.arrayBuffer());
  } catch (error) {
    console.error('Failed to download file:', error);
    return null;
  }
}

// Extract text from different file types
async function extractText(fileBuffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case 'text/plain':
    case 'text/markdown':
      return fileBuffer.toString('utf-8');

    case 'application/json':
      const jsonData = JSON.parse(fileBuffer.toString('utf-8'));
      return JSON.stringify(jsonData, null, 2);

    case 'application/pdf':
      const pdfData = await parsePDF(fileBuffer);
      return pdfData.text;

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      // TODO: Implement DOCX parsing with mammoth.js or similar
      throw new Error('DOCX support not implemented yet');

    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

// Smart chunking that preserves sentence boundaries
async function intelligentChunking(text: string, fileId: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks = [];
  let currentChunk = '';
  let currentTokens = 0;
  let startIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim() + (i < sentences.length - 1 ? '.' : '');
    const sentenceTokens = estimateTokens(sentence);

    // If adding this sentence would exceed chunk size, save current chunk
    if (currentTokens + sentenceTokens > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        tokens: currentTokens,
        startIndex,
        endIndex: startIndex + currentChunk.length,
      });

      // Start new chunk with overlap
      const overlapText = getOverlapText(currentChunk, CHUNK_OVERLAP);
      currentChunk = overlapText + sentence;
      currentTokens = estimateTokens(overlapText) + sentenceTokens;
      startIndex = startIndex + currentChunk.length - overlapText.length;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
      currentTokens += sentenceTokens;
    }
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      tokens: currentTokens,
      startIndex,
      endIndex: startIndex + currentChunk.length,
    });
  }

  return chunks;
}

// Estimate token count (rough approximation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // Approximate: 1 token ≈ 4 characters
}

// Get overlap text from end of chunk
function getOverlapText(text: string, maxTokens: number): string {
  const words = text.split(' ');
  const overlapWords = words.slice(-Math.floor(maxTokens / 2)); // Rough token-to-word conversion
  return overlapWords.join(' ');
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.trim(),
    encoding_format: 'float',
  });

  return response.data[0].embedding;
}

// Update file processing status
async function updateFileStatus(fileId: string, status: string, notes?: string) {
  const { error } = await supabase
    .from('user_files')
    .update({
      status,
      processing_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', fileId);

  if (error) {
    console.error('Failed to update file status:', error);
  }
}