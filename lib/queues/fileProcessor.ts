import Queue from 'bull';
import { FileIngestionService } from '../services/FileIngestionService';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure Redis connection
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  ...(process.env.REDIS_TLS === 'true' && { tls: {} })
};

export const fileProcessingQueue = new Queue('file-processing', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Process file ingestion jobs
fileProcessingQueue.process('process-file', async (job) => {
  const { fileId, userId, storagePath, mimeType, filename } = job.data;
  
  console.log(`[FileProcessor] Starting processing for file ${fileId} (${filename})`);
  
  try {
    // Update status to processing
    await supabase
      .from('user_files')
      .update({ 
        status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .eq('id', fileId);

    // Initialize file ingestion service
    const ingestionService = new FileIngestionService();
    
    // Process the file
    await ingestionService.processFile({
      fileId,
      userId,
      storagePath,
      mimeType,
      filename
    });

    console.log(`[FileProcessor] Successfully processed file ${fileId}`);
    
    // Job completed successfully
    return { success: true, fileId };

  } catch (error) {
    console.error(`[FileProcessor] Error processing file ${fileId}:`, error);
    
    // Update file status to failed
    await supabase
      .from('user_files')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown processing error',
        processing_completed_at: new Date().toISOString()
      })
      .eq('id', fileId);
    
    throw error;
  }
});

// Handle job events
fileProcessingQueue.on('completed', (job, result) => {
  console.log(`[FileProcessor] Job ${job.id} completed:`, result);
});

fileProcessingQueue.on('failed', (job, err) => {
  console.error(`[FileProcessor] Job ${job.id} failed:`, err.message);
});

fileProcessingQueue.on('stalled', (job) => {
  console.warn(`[FileProcessor] Job ${job.id} stalled`);
});

// Health check function
export async function getQueueHealth() {
  const waiting = await fileProcessingQueue.getWaiting();
  const active = await fileProcessingQueue.getActive();
  const completed = await fileProcessingQueue.getCompleted();
  const failed = await fileProcessingQueue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    isPaused: await fileProcessingQueue.isPaused()
  };
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[FileProcessor] Received SIGTERM, closing queue...');
  await fileProcessingQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[FileProcessor] Received SIGINT, closing queue...');
  await fileProcessingQueue.close();
  process.exit(0);
});

export default fileProcessingQueue;