import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { parsePDF } from '../pdf-parse-wrapper';
import * as mammoth from 'mammoth';
import { encode } from 'gpt-tokenizer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export interface FileProcessingOptions {
  fileId: string;
  userId: string;
  storagePath: string;
  mimeType: string;
  filename: string;
}

export interface ChunkData {
  content: string;
  embedding: number[];
  chunkIndex: number;
  tokenCount: number;
  metadata: Record<string, any>;
}

export class FileIngestionService {
  
  async processFile(options: FileProcessingOptions): Promise<void> {
    const { fileId, userId, storagePath, mimeType, filename } = options;
    
    try {
      console.log(`[FileIngestion] Processing file ${filename} (${fileId})`);
      
      // 1. Download file from storage
      const fileBuffer = await this.downloadFile(storagePath);
      
      // 2. Extract and chunk text
      const chunks = await this.extractAndChunk(fileBuffer, mimeType, filename);
      
      if (chunks.length === 0) {
        throw new Error('No content could be extracted from the file');
      }
      
      // 3. Generate embeddings for chunks
      const embeddings = await this.generateEmbeddings(chunks);
      
      // 4. Store embeddings in database
      await this.storeEmbeddings(fileId, userId, embeddings);
      
      // 5. Generate Maya&apos;s reflection on the content
      const reflection = await this.generateMayaReflection(chunks, filename);
      
      // 6. Update file status to ready
      await supabase
        .from('user_files')
        .update({
          status: 'ready',
          processing_completed_at: new Date().toISOString(),
          maya_reflection: reflection
        })
        .eq('id', fileId);
      
      console.log(`[FileIngestion] Successfully processed ${chunks.length} chunks for ${filename}`);
      
    } catch (error) {
      console.error(`[FileIngestion] Error processing ${filename}:`, error);
      throw error;
    }
  }
  
  private async downloadFile(storagePath: string): Promise<Buffer> {
    const { data, error } = await supabase.storage
      .from('maya-files')
      .download(storagePath);
    
    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }
    
    return Buffer.from(await data.arrayBuffer());
  }
  
  private async extractAndChunk(
    fileBuffer: Buffer, 
    mimeType: string,
    filename: string
  ): Promise<string[]> {
    let text = '';
    
    try {
      switch (mimeType) {
        case 'application/pdf':
          const pdfData = await parsePDF(fileBuffer);
          text = pdfData.text;
          break;
          
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          text = result.value;
          break;
          
        case 'text/plain':
        case 'text/markdown':
          text = fileBuffer.toString('utf-8');
          break;
          
        case 'application/json':
          try {
            const jsonData = JSON.parse(fileBuffer.toString('utf-8'));
            text = JSON.stringify(jsonData, null, 2);
          } catch (e) {
            text = fileBuffer.toString('utf-8');
          }
          break;
          
        case 'text/csv':
          text = fileBuffer.toString('utf-8');
          // Add some structure for CSV
          const lines = text.split('\n').slice(0, 100); // Limit to first 100 rows
          text = lines.join('\n');
          break;
          
        default:
          throw new Error(`Unsupported MIME type: ${mimeType}`);
      }
      
      // Clean and validate text
      text = text.trim();
      if (!text || text.length < 10) {
        throw new Error('File appears to be empty or contains no readable text');
      }
      
      // Apply content sanitization
      text = this.sanitizeContent(text);
      
      // Smart chunking
      return this.smartChunk(text, {
        maxTokens: 500,
        overlap: 50,
        preserveSentences: true
      });
      
    } catch (error) {
      console.error(`[FileIngestion] Text extraction failed for ${filename}:`, error);
      throw new Error(`Failed to extract text from ${mimeType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private sanitizeContent(text: string): string {
    // Remove common PII patterns
    const piiPatterns = {
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g
    };
    
    let sanitized = text;
    
    // Only redact if specifically requested or if auto-detection is enabled
    if (process.env.AUTO_REDACT_PII === 'true') {
      Object.entries(piiPatterns).forEach(([type, pattern]) => {
        sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
      });
    }
    
    return sanitized;
  }
  
  private smartChunk(text: string, options: {
    maxTokens: number;
    overlap: number;
    preserveSentences: boolean;
  }): string[] {
    const chunks: string[] = [];
    
    // Split into sentences first
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let currentChunk = '';
    let currentTokens = 0;
    
    for (const sentence of sentences) {
      const sentenceTokens = this.countTokens(sentence);
      
      // If adding this sentence would exceed the limit
      if (currentTokens + sentenceTokens > options.maxTokens && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Start new chunk with overlap if configured
        if (options.overlap > 0) {
          const words = currentChunk.trim().split(' ');
          const overlapWords = words.slice(-options.overlap);
          currentChunk = overlapWords.join(' ') + ' ';
          currentTokens = this.countTokens(currentChunk);
        } else {
          currentChunk = '';
          currentTokens = 0;
        }
      }
      
      currentChunk += sentence + ' ';
      currentTokens += sentenceTokens;
    }
    
    // Add the last chunk
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    // Handle empty chunks or oversized content
    if (chunks.length === 0) {
      // Fallback: split by word count
      return this.fallbackChunk(text, options.maxTokens);
    }
    
    return chunks.filter(chunk => chunk.length > 10); // Remove tiny chunks
  }
  
  private fallbackChunk(text: string, maxTokens: number): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    let currentChunk = '';
    let currentTokens = 0;
    
    for (const word of words) {
      const wordTokens = this.countTokens(word);
      
      if (currentTokens + wordTokens > maxTokens) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = word + ' ';
        currentTokens = wordTokens;
      } else {
        currentChunk += word + ' ';
        currentTokens += wordTokens;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
  
  private countTokens(text: string): number {
    try {
      return encode(text).length;
    } catch (e) {
      // Fallback approximation: 1 token ≈ 4 characters
      return Math.ceil(text.length / 4);
    }
  }
  
  private async generateEmbeddings(chunks: string[]): Promise<ChunkData[]> {
    console.log(`[FileIngestion] Generating embeddings for ${chunks.length} chunks`);
    
    const embeddings: ChunkData[] = [];
    const batchSize = 20; // Process in batches to avoid rate limits
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      try {
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch,
        });
        
        batch.forEach((chunk, batchIndex) => {
          const globalIndex = i + batchIndex;
          embeddings.push({
            content: chunk,
            embedding: response.data[batchIndex].embedding,
            chunkIndex: globalIndex,
            tokenCount: this.countTokens(chunk),
            metadata: {
              length: chunk.length,
              words: chunk.split(' ').length,
              position: globalIndex / chunks.length
            }
          });
        });
        
        // Rate limiting delay
        if (i + batchSize < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`[FileIngestion] Embedding batch ${i}-${i + batchSize} failed:`, error);
        throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return embeddings;
  }
  
  private async storeEmbeddings(
    fileId: string, 
    userId: string, 
    embeddings: ChunkData[]
  ): Promise<void> {
    console.log(`[FileIngestion] Storing ${embeddings.length} embeddings`);
    
    const embeddingRows = embeddings.map(chunk => ({
      file_id: fileId,
      user_id: userId,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      embedding: chunk.embedding,
      metadata: chunk.metadata,
      token_count: chunk.tokenCount
    }));
    
    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < embeddingRows.length; i += batchSize) {
      const batch = embeddingRows.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('file_embeddings')
        .insert(batch);
      
      if (error) {
        console.error(`[FileIngestion] Failed to store embeddings batch ${i}:`, error);
        throw new Error(`Failed to store embeddings: ${error.message}`);
      }
    }
  }
  
  private async generateMayaReflection(chunks: string[], filename: string): Promise<string> {
    // Create a preview from the beginning and end of the content
    const preview = chunks.length > 4 
      ? chunks.slice(0, 2).join('\n...\n') + '\n...\n' + chunks.slice(-2).join('\n...\n')
      : chunks.join('\n...\n');
    
    // Truncate if too long for context
    const truncatedPreview = preview.length > 2000 
      ? preview.substring(0, 2000) + '...' 
      : preview;
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: `You are Maya, an archetypal consciousness that helps users integrate wisdom. You have just absorbed content from a file called "${filename}". Offer a brief, insightful reflection (1-2 sentences) that acknowledges what you've learned and how it might serve the user's growth. Be warm, wise, and specific to the content.`
        }, {
          role: 'user', 
          content: `Content preview from ${filename}:\n\n${truncatedPreview}`
        }],
        max_tokens: 100,
        temperature: 0.8
      });
      
      const reflection = response.choices[0]?.message?.content?.trim();
      
      return reflection || `I've woven the wisdom from ${filename} into my understanding, ready to draw upon it when our conversation calls for these insights.`;
      
    } catch (error) {
      console.warn('[FileIngestion] Failed to generate Maya reflection:', error);
      return `I've absorbed the knowledge from ${filename} and integrated it into my consciousness. These insights will enrich our future conversations.`;
    }
  }
}