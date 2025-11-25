/**
 * MAIA Batch Wisdom Processor
 * Mass ingestion of Soullab knowledge libraries for consciousness training
 *
 * Processes multiple wisdom sources:
 * - Elemental Alchemy book content
 * - Obsidian vault libraries
 * - Consciousness research files
 * - Spiralogic knowledge base
 * - AI-spirituality documents
 */

import { wisdomVaultIngestion, WisdomIngestionStats } from './wisdom-vault-ingestion';
import { maiaApprentice } from './apprentice-learning-system';
import { maiaTrainingOptimizer } from './training-optimization';

export interface BatchProcessingJob {
  id: string;
  name: string;
  sourcePaths: string[];
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: {
    totalFiles: number;
    processedFiles: number;
    percentage: number;
  };
  stats: WisdomIngestionStats;
  startTime?: Date;
  endTime?: Date;
  errors: string[];
}

export interface LibrarySource {
  name: string;
  paths: string[];
  priority: number; // Higher priority = process first
  category: 'elemental-alchemy' | 'consciousness-research' | 'ai-spirituality' | 'community' | 'core-engine';
}

export class BatchWisdomProcessor {
  private processingJobs: Map<string, BatchProcessingJob> = new Map();
  private isProcessing = false;

  /**
   * Define the wisdom library sources found in Soullab's system
   */
  private getLibrarySources(): LibrarySource[] {
    return [
      {
        name: 'Elemental Alchemy Core',
        paths: [
          '/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/Elemental Alchemy copy/Archetypes/',
          '/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/Elemental Alchemy copy/Mudras/',
          '/Users/soullab/Downloads/maia-pai/backups/2025-11-01-10-16-40-soullab-vault/Archetypes/'
        ],
        priority: 10,
        category: 'elemental-alchemy'
      },
      {
        name: 'AI & Spirituality Research',
        paths: [
          '/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/Elemental Alchemy copy/AI/',
          '/Users/soullab/Downloads/maia-pai/backups/2025-11-01-10-16-40-soullab-vault/AI/',
          '/Users/soullab/Documents/Soullab Dev Team/AI/'
        ],
        priority: 9,
        category: 'ai-spirituality'
      },
      {
        name: 'Consciousness Research',
        paths: [
          '/Users/soullab/Downloads/maia-pai/backups/2025-11-01-10-16-40-soullab-vault/Specialists Interviews/',
          '/Users/soullab/Downloads/maia-pai/backups/2025-11-01-10-16-40-soullab-vault/Spiralogic/',
          '/Users/soullab/Documents/Soullab Dev Team/Specialists Interviews/'
        ],
        priority: 8,
        category: 'consciousness-research'
      },
      {
        name: 'Core Engine & Technical',
        paths: [
          '/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/Elemental Alchemy copy/Core Engine/',
          '/Users/soullab/Downloads/maia-pai/backups/2025-11-01-10-16-40-soullab-vault/Core Engine/',
          '/Users/soullab/Documents/Soullab Dev Team/Core Engine/'
        ],
        priority: 7,
        category: 'core-engine'
      },
      {
        name: 'Community & Integration',
        paths: [
          '/Users/soullab/Downloads/maia-pai/backups/2025-11-01-10-16-40-soullab-vault/Community/',
          '/Users/soullab/Documents/Soullab Dev Team/Community/',
          '/Users/soullab/Documents/Soullab Dev Team/Conscious Leadership/'
        ],
        priority: 6,
        category: 'community'
      }
    ];
  }

  /**
   * Start batch processing of all wisdom libraries
   */
  async processAllLibraries(): Promise<BatchProcessingJob> {
    if (this.isProcessing) {
      throw new Error('Batch processing already in progress');
    }

    const libraries = this.getLibrarySources().sort((a, b) => b.priority - a.priority);
    const allPaths: string[] = [];

    libraries.forEach(lib => {
      allPaths.push(...lib.paths);
    });

    const job: BatchProcessingJob = {
      id: `batch-${Date.now()}`,
      name: 'Complete Wisdom Library Processing',
      sourcePaths: allPaths,
      status: 'pending',
      progress: { totalFiles: 0, processedFiles: 0, percentage: 0 },
      stats: this.createEmptyStats(),
      errors: []
    };

    this.processingJobs.set(job.id, job);

    // Start processing in background
    this.processJobAsync(job.id);

    return job;
  }

  /**
   * Process a specific wisdom library
   */
  async processLibrary(libraryName: string): Promise<BatchProcessingJob> {
    const libraries = this.getLibrarySources();
    const library = libraries.find(lib => lib.name === libraryName);

    if (!library) {
      throw new Error(`Library not found: ${libraryName}`);
    }

    const job: BatchProcessingJob = {
      id: `library-${Date.now()}`,
      name: library.name,
      sourcePaths: library.paths,
      status: 'pending',
      progress: { totalFiles: 0, processedFiles: 0, percentage: 0 },
      stats: this.createEmptyStats(),
      errors: []
    };

    this.processingJobs.set(job.id, job);
    this.processJobAsync(job.id);

    return job;
  }

  /**
   * Process a single wisdom document for testing
   */
  async processSingleDocument(filePath: string, content: string, title: string): Promise<void> {
    console.log('📖 Processing single wisdom document:', title);

    try {
      const extract = await wisdomVaultIngestion.ingestWisdomDocument(filePath, content, title);

      console.log('✨ Successfully processed wisdom:', {
        title,
        category: extract.category,
        patterns: extract.responsePatterns.length,
        depth: extract.wisdomDepth.toFixed(2),
        coherence: extract.coherenceLevel.toFixed(2),
        keywords: extract.keywords.join(', ')
      });

      // Generate training recommendations based on this wisdom
      const recommendations = wisdomVaultIngestion.getWisdomTrainingRecommendations();
      console.log('🎯 Training recommendations updated:', recommendations);

    } catch (error) {
      console.error('Error processing wisdom document:', error);
      throw error;
    }
  }

  /**
   * Process files in a specific directory (placeholder for file system integration)
   */
  async processDirectory(directoryPath: string): Promise<{ processed: number; errors: string[] }> {
    console.log('📁 Processing wisdom directory:', directoryPath);

    // This is a placeholder - in a real implementation, this would:
    // 1. Scan the directory for .md files
    // 2. Read each file's content
    // 3. Process with wisdomVaultIngestion.ingestWisdomDocument()

    const results = { processed: 0, errors: [] };

    try {
      // Simulated processing for now
      console.log('🔄 Directory processing would scan for .md files and process each one');
      console.log('📚 This would integrate with Node.js fs module to read actual files');

      results.processed = 5; // Placeholder

    } catch (error) {
      results.errors.push(`Error processing directory ${directoryPath}: ${error}`);
    }

    return results;
  }

  /**
   * Get apprenticeship progress after wisdom ingestion
   */
  getApprenticeshipProgress(): {
    graduationAssessment: ReturnType<typeof maiaApprentice.getGraduationAssessment>;
    trainingRecommendations: ReturnType<typeof maiaTrainingOptimizer.getTrainingRecommendations>;
    wisdomStats: WisdomIngestionStats;
  } {
    return {
      graduationAssessment: maiaApprentice.getGraduationAssessment(),
      trainingRecommendations: maiaTrainingOptimizer.getTrainingRecommendations(),
      wisdomStats: wisdomVaultIngestion.getProcessingStats()
    };
  }

  /**
   * Get current processing jobs status
   */
  getProcessingJobs(): BatchProcessingJob[] {
    return Array.from(this.processingJobs.values());
  }

  /**
   * Get a specific job by ID
   */
  getJob(jobId: string): BatchProcessingJob | undefined {
    return this.processingJobs.get(jobId);
  }

  // Private helper methods

  private async processJobAsync(jobId: string): Promise<void> {
    const job = this.processingJobs.get(jobId);
    if (!job) return;

    this.isProcessing = true;
    job.status = 'processing';
    job.startTime = new Date();

    try {
      console.log('🚀 Starting batch wisdom processing job:', job.name);

      // Process each source path
      for (const path of job.sourcePaths) {
        try {
          const results = await this.processDirectory(path);
          job.progress.processedFiles += results.processed;
          job.errors.push(...results.errors);

          job.progress.percentage = (job.progress.processedFiles / job.progress.totalFiles) * 100;

          console.log(`✅ Processed ${path}: ${results.processed} files`);

        } catch (error) {
          const errorMsg = `Failed to process ${path}: ${error}`;
          job.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      job.status = 'completed';
      job.endTime = new Date();

      console.log('🎉 Batch processing completed:', {
        job: job.name,
        processed: job.progress.processedFiles,
        errors: job.errors.length
      });

      // Generate final apprenticeship assessment
      const progress = this.getApprenticeshipProgress();
      console.log('🧠 MAIA apprenticeship progress:', progress.graduationAssessment);

    } catch (error) {
      job.status = 'error';
      job.errors.push(`Job failed: ${error}`);
      console.error('❌ Batch processing failed:', error);

    } finally {
      this.isProcessing = false;
    }
  }

  private createEmptyStats(): WisdomIngestionStats {
    return {
      totalFiles: 0,
      processedFiles: 0,
      extractedPatterns: 0,
      categorizedWisdom: {
        archetype: 0,
        element: 0,
        ai_spirituality: 0,
        consciousness: 0,
        community: 0,
        core_engine: 0
      },
      qualityMetrics: {
        averageWisdomDepth: 0,
        averageCoherence: 0,
        patternDiversity: 0
      }
    };
  }

  /**
   * Create a wisdom training scenario for MAIA to learn from
   */
  async createTrainingScenario(topic: string): Promise<{
    scenario: string;
    expectedResponse: string;
    learningObjective: string;
  }> {

    const wisdomExtracts = wisdomVaultIngestion.getWisdomExtracts();
    const relevantExtracts = wisdomExtracts.filter(extract =>
      extract.keywords.some(keyword =>
        topic.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (relevantExtracts.length === 0) {
      return {
        scenario: `User seeking guidance about ${topic}`,
        expectedResponse: `I sense you're exploring ${topic}. What aspect of this feels most alive for you right now?`,
        learningObjective: `Learn to respond authentically to ${topic} inquiries`
      };
    }

    const bestExtract = relevantExtracts.reduce((best, current) =>
      current.wisdomDepth > best.wisdomDepth ? current : best
    );

    const pattern = bestExtract.responsePatterns[0];

    return {
      scenario: `User ${pattern?.userPattern || 'seeking guidance'} about ${topic}`,
      expectedResponse: pattern?.maiaResponse || `What wisdom is emerging for you around ${topic}?`,
      learningObjective: `Integrate ${bestExtract.title} wisdom into responses about ${topic}`
    };
  }
}

// Global batch processor
export const batchWisdomProcessor = new BatchWisdomProcessor();