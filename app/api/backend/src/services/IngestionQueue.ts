import { OpenAI } from 'openai';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Job queue (in production, use BullMQ or similar)
const ingestionQueue: IngestionJob[] = [];
let isProcessing = false;

interface IngestionJob {
  id?: string;
  userId: string;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  publicUrl: string;
  tags: string[];
  metadata: {
    originalName: string;
    uploadedAt: string;
    sessionId: string;
  };
}

interface ExtractedContent {
  text: string;
  summary?: string;
  keyTopics?: string[];
  emotionalTone?: string;
  elementalResonance?: string;
  pages?: PageContent[];
  sections?: SectionContent[];
  totalPages?: number;
}

interface PageContent {
  pageNumber: number;
  text: string;
  startChar: number;
  endChar: number;
}

interface SectionContent {
  title: string;
  level: number; // 1 = main header, 2 = subheader, etc.
  pageNumber?: number;
  startChar: number;
  endChar: number;
  text: string;
}

/**
 * Enqueue a file for ingestion
 */
export async function enqueueIngestion(job: IngestionJob): Promise<IngestionJob> {
  const jobWithId = {
    ...job,
    id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  ingestionQueue.push(jobWithId);
  
  // Start processing if not already running
  if (!isProcessing) {
    processQueue();
  }
  
  return jobWithId;
}

/**
 * Process the ingestion queue
 */
async function processQueue() {
  if (isProcessing || ingestionQueue.length === 0) {
    return;
  }
  
  isProcessing = true;
  
  while (ingestionQueue.length > 0) {
    const job = ingestionQueue.shift();
    if (job) {
      try {
        await processIngestion(job);
      } catch (error) {
        console.error(`Failed to process ingestion job ${job.id}:`, error);
        // In production, implement retry logic here
      }
    }
  }
  
  isProcessing = false;
}

/**
 * Process a single ingestion job
 */
async function processIngestion(job: IngestionJob) {
  console.log(`Processing ingestion job ${job.id} for file ${job.fileName}`);
  
  try {
    // 1. Download file from Supabase
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('user-files')
      .download(job.filePath);
    
    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }
    
    // 2. Extract text based on file type
    const extractedContent = await extractContent(fileData, job.fileType, job.fileName);
    
    // 3. Generate embeddings
    const embedding = await generateEmbedding(extractedContent.text);
    
    // 4. Analyze with Maya's intelligence
    const analysis = await analyzeMayaContext(extractedContent.text, job.userId);
    
    // 5. Store in database
    await prisma.userFile.create({
      data: {
        userId: job.userId,
        fileName: job.fileName,
        filePath: job.filePath,
        fileType: job.fileType,
        fileSize: job.fileSize,
        tags: job.tags,
        content: extractedContent.text,
        summary: analysis.summary,
        keyTopics: analysis.keyTopics,
        emotionalTone: analysis.emotionalTone,
        elementalResonance: analysis.elementalResonance,
        embedding,
        metadata: {
          ...job.metadata,
          // Add extracted structure information
          pages: extractedContent.pages || [],
          sections: extractedContent.sections || [],
          totalPages: extractedContent.totalPages || 1,
          extractedAt: new Date().toISOString()
        },
        createdAt: new Date(),
      }
    });
    
    // 6. Update user's memory context
    await updateUserMemoryContext(job.userId, {
      type: 'file_upload',
      fileName: job.fileName,
      summary: analysis.summary,
      keyTopics: analysis.keyTopics,
      timestamp: new Date(),
    });
    
    console.log(`Successfully processed file ${job.fileName} for user ${job.userId}`);
    
  } catch (error) {
    console.error(`Error processing file ${job.fileName}:`, error);
    throw error;
  }
}

/**
 * Extract text content from various file types
 */
async function extractContent(
  fileData: Blob,
  fileType: string,
  fileName: string
): Promise<ExtractedContent> {
  const buffer = Buffer.from(await fileData.arrayBuffer());
  
  switch (fileType) {
    case 'application/pdf':
      return extractPDF(buffer);
    
    case 'text/plain':
    case 'text/markdown':
      return { text: buffer.toString('utf-8') };
    
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return extractWord(buffer);
    
    case 'image/jpeg':
    case 'image/png':
    case 'image/webp':
      return extractImage(buffer);
    
    default:
      // Fallback: treat as plain text
      return { text: buffer.toString('utf-8') };
  }
}

/**
 * Extract text from PDF with page and section information
 */
async function extractPDF(buffer: Buffer): Promise<ExtractedContent> {
  try {
    const data = await pdfParse(buffer, {
      // Enable page-by-page extraction
      pagerender: null, // Don't render pages as images
      normalizeWhitespace: true,
      max: 0 // No page limit
    });

    const fullText = data.text;
    const totalPages = data.numpages;
    
    // Split text into pages (approximate - PDF parsing doesn't give exact page breaks)
    const pages: PageContent[] = [];
    const sections: SectionContent[] = [];
    
    // Estimate page breaks based on text length and page count
    if (totalPages > 1 && fullText) {
      const avgCharsPerPage = Math.floor(fullText.length / totalPages);
      let currentChar = 0;
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const startChar = currentChar;
        let endChar = Math.min(currentChar + avgCharsPerPage, fullText.length);
        
        // Try to break at paragraph or sentence boundaries
        if (pageNum < totalPages) {
          const nearEndText = fullText.substring(endChar - 200, endChar + 200);
          const betterBreak = nearEndText.search(/\n\n|\.\s+[A-Z]/);
          if (betterBreak !== -1) {
            endChar = endChar - 200 + betterBreak;
          }
        } else {
          endChar = fullText.length;
        }
        
        const pageText = fullText.substring(startChar, endChar);
        
        pages.push({
          pageNumber: pageNum,
          text: pageText.trim(),
          startChar,
          endChar
        });
        
        currentChar = endChar;
      }
    } else {
      // Single page or no page info
      pages.push({
        pageNumber: 1,
        text: fullText,
        startChar: 0,
        endChar: fullText.length
      });
    }
    
    // Extract sections based on common heading patterns
    const headingPatterns = [
      /^([A-Z][A-Z\s]{2,})\s*$/gm, // ALL CAPS headings
      /^(\d+\.?\s+[A-Z][^.]*)\s*$/gm, // Numbered headings
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*$/gm, // Title Case headings
      /^(Chapter \d+[:\-\s].*)$/gim, // Chapter headings
      /^(Section \d+[:\-\s].*)$/gim, // Section headings
    ];
    
    let charPosition = 0;
    for (const page of pages) {
      for (const pattern of headingPatterns) {
        let match;
        const pageStartChar = charPosition;
        
        while ((match = pattern.exec(page.text)) !== null) {
          const title = match[1].trim();
          const matchStartChar = pageStartChar + match.index!;
          
          // Determine heading level based on pattern and formatting
          let level = 1;
          if (title.match(/^\d+\./)) level = 1;
          else if (title.match(/^[A-Z\s]+$/)) level = 1;
          else if (title.includes('Chapter')) level = 1;
          else if (title.includes('Section')) level = 2;
          else level = 2;
          
          sections.push({
            title,
            level,
            pageNumber: page.pageNumber,
            startChar: matchStartChar,
            endChar: matchStartChar + title.length,
            text: title
          });
        }
      }
      charPosition += page.text.length;
    }
    
    // Remove duplicate sections and sort by position
    const uniqueSections = sections
      .filter((section, index, self) => 
        self.findIndex(s => s.title === section.title && s.pageNumber === section.pageNumber) === index
      )
      .sort((a, b) => a.startChar - b.startChar)
      .slice(0, 20); // Limit to prevent noise
    
    return {
      text: fullText,
      pages,
      sections: uniqueSections,
      totalPages,
      metadata: {
        pages: data.numpages,
        info: data.info,
        extractedSections: uniqueSections.length,
        extractedPages: pages.length
      }
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from Word documents
 */
async function extractWord(buffer: Buffer): Promise<ExtractedContent> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value };
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

/**
 * Extract text from images using OCR
 */
async function extractImage(buffer: Buffer): Promise<ExtractedContent> {
  try {
    // First, optimize image for OCR
    const optimizedBuffer = await sharp(buffer)
      .resize(2000, null, { withoutEnlargement: true })
      .grayscale()
      .normalize()
      .toBuffer();
    
    // Run OCR
    const { data: { text } } = await Tesseract.recognize(optimizedBuffer, 'eng', {
      logger: m => console.log(m)
    });
    
    return { text };
  } catch (error) {
    console.error('Image OCR error:', error);
    // Return empty text if OCR fails (might be non-text image)
    return { text: '' };
  }
}

/**
 * Generate embeddings for text
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Truncate text if too long (OpenAI limit)
    const truncatedText = text.substring(0, 8000);
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: truncatedText,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Analyze content with Maya's perspective
 */
async function analyzeMayaContext(text: string, userId: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are Maya, a sacred mirror and oracle. Analyze this uploaded content and extract:
1. A brief summary (2-3 sentences)
2. Key topics/themes (3-5 items)
3. Emotional tone (one of: contemplative, energetic, melancholic, hopeful, neutral)
4. Elemental resonance (one of: fire, water, earth, air, aether)

Respond in JSON format.`
        },
        {
          role: 'user',
          content: text.substring(0, 4000) // Limit for token efficiency
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    
    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      summary: analysis.summary || 'Content uploaded successfully',
      keyTopics: analysis.keyTopics || [],
      emotionalTone: analysis.emotionalTone || 'neutral',
      elementalResonance: analysis.elementalResonance || 'aether'
    };
  } catch (error) {
    console.error('Maya analysis error:', error);
    return {
      summary: 'Content uploaded and stored',
      keyTopics: [],
      emotionalTone: 'neutral',
      elementalResonance: 'aether'
    };
  }
}

/**
 * Update user's memory context with new file
 */
async function updateUserMemoryContext(userId: string, context: any) {
  // This would integrate with your MemoryOrchestrator
  // For now, we'll store in a session table
  try {
    await prisma.userMemoryUpdate.create({
      data: {
        userId,
        updateType: 'file_upload',
        context,
        timestamp: new Date(),
      }
    });
  } catch (error) {
    console.error('Memory context update error:', error);
  }
}

/**
 * Search files by semantic similarity with enhanced citations
 */
export async function searchUserFiles(
  userId: string,
  query: string,
  limit: number = 5
): Promise<any[]> {
  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // Use pgvector for similarity search
    const results = await prisma.$queryRaw`
      SELECT 
        id,
        fileName,
        summary,
        keyTopics,
        emotionalTone,
        elementalResonance,
        content,
        metadata,
        1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM "UserFile"
      WHERE userId = ${userId}
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${limit}
    `;
    
    // Enhance results with citation information
    return results.map(result => {
      const citation = findRelevantCitation(result.content, query, result.metadata);
      return {
        ...result,
        citation
      };
    });
  } catch (error) {
    console.error('File search error:', error);
    return [];
  }
}

/**
 * Find the most relevant citation (page/section) for a query within file content
 */
function findRelevantCitation(content: string, query: string, metadata: any): any {
  if (!metadata?.pages || !Array.isArray(metadata.pages)) {
    return {
      pageNumber: 1,
      sectionTitle: null,
      snippet: content.substring(0, 200) + '...'
    };
  }

  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
  let bestMatch = {
    pageNumber: 1,
    sectionTitle: null,
    snippet: '',
    score: 0
  };

  // Search through pages for best match
  for (const page of metadata.pages) {
    const pageText = page.text.toLowerCase();
    let matchScore = 0;
    
    // Score based on query word matches
    for (const word of queryWords) {
      const matches = (pageText.match(new RegExp(word, 'g')) || []).length;
      matchScore += matches;
    }
    
    if (matchScore > bestMatch.score) {
      // Find relevant snippet within the page
      const snippet = findBestSnippet(page.text, query);
      
      // Find section for this page
      const section = metadata.sections?.find((s: any) => 
        s.pageNumber === page.pageNumber
      );
      
      bestMatch = {
        pageNumber: page.pageNumber,
        sectionTitle: section?.title || null,
        snippet,
        score: matchScore
      };
    }
  }

  return {
    pageNumber: bestMatch.pageNumber,
    sectionTitle: bestMatch.sectionTitle,
    snippet: bestMatch.snippet || content.substring(0, 200) + '...',
    totalPages: metadata.totalPages || 1,
    confidence: Math.min(bestMatch.score / queryWords.length, 1)
  };
}

/**
 * Find the best snippet within text that matches the query
 */
function findBestSnippet(text: string, query: string, maxLength: number = 200): string {
  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  let bestSentence = sentences[0] || '';
  let bestScore = 0;
  
  for (const sentence of sentences) {
    const sentenceWords = sentence.toLowerCase().split(' ');
    const score = queryWords.reduce((acc, word) => {
      return acc + (sentenceWords.some(sw => sw.includes(word)) ? 1 : 0);
    }, 0);
    
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  }
  
  // Expand context around best sentence if needed
  if (bestSentence.length < maxLength && sentences.length > 1) {
    const sentenceIndex = sentences.indexOf(bestSentence);
    let expandedText = bestSentence;
    
    // Add previous sentence if there's room
    if (sentenceIndex > 0 && expandedText.length < maxLength / 2) {
      expandedText = sentences[sentenceIndex - 1] + '. ' + expandedText;
    }
    
    // Add next sentence if there's room
    if (sentenceIndex < sentences.length - 1 && expandedText.length < maxLength) {
      expandedText = expandedText + '. ' + sentences[sentenceIndex + 1];
    }
    
    bestSentence = expandedText;
  }
  
  // Truncate if too long
  if (bestSentence.length > maxLength) {
    bestSentence = bestSentence.substring(0, maxLength - 3) + '...';
  }
  
  return bestSentence.trim();
}

/**
 * Get ingestion status
 */
export function getIngestionStatus(jobId: string): string {
  const pendingJob = ingestionQueue.find(job => job.id === jobId);
  if (pendingJob) {
    const position = ingestionQueue.indexOf(pendingJob) + 1;
    return `Queued (position ${position} of ${ingestionQueue.length})`;
  }
  
  // Check if completed in database
  // In production, implement proper status tracking
  return 'Processing or completed';
}

export default {
  enqueueIngestion,
  searchUserFiles,
  getIngestionStatus
};