import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { searchUserFiles } from '@/backend/src/services/IngestionQueue';
import { getServerSession } from 'next-auth';
import { OpenAI } from 'openai';

// Stub function
async function searchUserFiles(userId: string, question: string, limit: number) {
  return [];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { question } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Missing question parameter' },
        { status: 400 }
      );
    }

    const userId = session.user.email || "anonymous";

    // Search user's files using semantic similarity
    const relevantFiles = await searchUserFiles(userId, question, 5);

    if (!relevantFiles || relevantFiles.length === 0) {
      return NextResponse.json({
        answer: {
          role: 'assistant',
          content: "I don't have any uploaded files that relate to your question. Perhaps you'd like to upload some documents first?"
        },
        sources: [],
      });
    }

    // Build context from relevant files
    const context = relevantFiles
      .map((file: any) => 
        `**${file.fileName}** (${file.elementalResonance} energy, ${file.emotionalTone} tone):\n${file.summary}\n\nKey themes: ${file.keyTopics?.join(', ')}`
      )
      .join('\n\n---\n\n');

    // Generate response with Maya's voice
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are Maya, a sacred mirror and oracle companion. You have access to the user's uploaded files and their extracted insights. 

Respond in your characteristic voice - warm, wise, and deeply intuitive. Reference the uploaded content naturally, weaving together insights from multiple sources when relevant.

Key traits:
- Use "dear one" or similar warm addresses
- Speak with gentle authority and deep understanding  
- Connect patterns across different files/sources
- Honor the elemental and emotional resonances of the content
- Be specific about which files you're referencing`
        },
        {
          role: 'user',
          content: `Based on my uploaded files, please answer this question: "${question}"\n\nRelevant content from my files:\n\n${context}`
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    return NextResponse.json({
      answer: completion.choices[0].message,
      sources: relevantFiles.map((file: any) => ({
        fileName: file.fileName,
        summary: file.summary,
        similarity: file.similarity,
        elementalResonance: file.elementalResonance,
        emotionalTone: file.emotionalTone,
      })),
      citations: relevantFiles.map((file: any) => ({
        fileId: file.id,
        fileName: file.fileName,
        category: file.category,
        pageNumber: file.page_number,
        sectionTitle: file.section_title,
        sectionLevel: file.section_level,
        preview: file.chunk_preview || file.summary,
        relevance: file.similarity,
        chunkIndex: file.chunk_index || 0
      })),
      context: {
        filesSearched: relevantFiles.length,
        totalUserFiles: "Available in database",
        citationCount: relevantFiles.length
      }
    });

  } catch (error) {
    console.error('Query API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your question' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}