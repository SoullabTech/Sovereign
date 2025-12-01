import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

interface IntegrationRequest {
  mode: 'wisdom' | 'enhanced' | 'script';
  maxBooks?: number;
  resetProgress?: boolean;
}

interface IntegrationResponse {
  success: boolean;
  booksProcessed: number;
  booksIntegrated: number;
  totalFilesCreated: number;
  elementalDistribution: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  successfulBooks: string[];
  failedBooks: string[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<IntegrationResponse>> {
  try {
    const body: IntegrationRequest = await request.json();
    const { mode = 'wisdom', maxBooks = 10, resetProgress = false } = body;

    // Construct command based on mode
    let command: string;
    const projectRoot = path.resolve(process.cwd());

    switch (mode) {
      case 'wisdom':
        command = `cd "${projectRoot}" && python3 scripts/wisdom-book-integrator.py --max-books ${maxBooks}${resetProgress ? ' --reset' : ''}`;
        break;
      case 'enhanced':
        command = `cd "${projectRoot}" && python3 scripts/enhanced-book-integrator.py --max-books ${maxBooks} --add-path "${projectRoot}/books/staging"${resetProgress ? ' --reset-progress' : ''}`;
        break;
      case 'script':
        command = `cd "${projectRoot}" && bash scripts/add-books-to-maia.sh`;
        break;
      default:
        return NextResponse.json({
          success: false,
          booksProcessed: 0,
          booksIntegrated: 0,
          totalFilesCreated: 0,
          elementalDistribution: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
          successfulBooks: [],
          failedBooks: [],
          error: 'Invalid integration mode'
        }, { status: 400 });
    }

    console.log(`🔄 Running book integration: ${command}`);

    // Execute the integration script
    const { stdout, stderr } = await execAsync(command, {
      timeout: 600000, // 10 minutes timeout
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    // Parse the output to extract results
    const result = parseIntegrationOutput(stdout, stderr);

    console.log('✅ Book integration completed:', result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Book integration failed:', error);

    return NextResponse.json({
      success: false,
      booksProcessed: 0,
      booksIntegrated: 0,
      totalFilesCreated: 0,
      elementalDistribution: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
      successfulBooks: [],
      failedBooks: [],
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    // Get current staging status
    const projectRoot = path.resolve(process.cwd());
    const stagingDir = path.join(projectRoot, 'books', 'staging');

    // Count files in staging directory
    const { stdout } = await execAsync(`find "${stagingDir}" -type f \\( -name "*.pdf" -o -name "*.txt" -o -name "*.md" \\) | wc -l`);
    const stagedBooksCount = parseInt(stdout.trim()) || 0;

    // Get last integration results if available
    const progressFile = "/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1/📚_INTEGRATED_BOOKS/.wisdom_integration_progress.json";

    let lastIntegration = {
      booksProcessed: 0,
      booksIntegrated: 0,
      totalFilesCreated: 0,
      elementalDistribution: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
      lastRun: null
    };

    try {
      const { stdout: progressData } = await execAsync(`cat "${progressFile}" 2>/dev/null || echo "{}"`);
      const progress = JSON.parse(progressData);
      if (progress.total_processed) {
        lastIntegration = {
          booksProcessed: progress.total_processed,
          booksIntegrated: progress.total_processed,
          totalFilesCreated: progress.total_files_created || 0,
          elementalDistribution: progress.elemental_distribution || { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
          lastRun: progress.last_run
        };
      }
    } catch (e) {
      // Progress file doesn't exist or is invalid
    }

    return NextResponse.json({
      stagedBooksCount,
      lastIntegration,
      status: 'ready'
    });

  } catch (error: any) {
    console.error('❌ Failed to get book status:', error);
    return NextResponse.json({
      stagedBooksCount: 0,
      lastIntegration: {
        booksProcessed: 0,
        booksIntegrated: 0,
        totalFilesCreated: 0,
        elementalDistribution: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
        lastRun: null
      },
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}

function parseIntegrationOutput(stdout: string, stderr: string): IntegrationResponse {
  let booksProcessed = 0;
  let booksIntegrated = 0;
  let totalFilesCreated = 0;
  let elementalDistribution = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
  let successfulBooks: string[] = [];
  let failedBooks: string[] = [];

  try {
    // Parse stdout for results
    const lines = stdout.split('\n');

    // Look for summary lines
    for (const line of lines) {
      if (line.includes('Books processed:')) {
        const match = line.match(/Books processed:\s*(\d+)/);
        if (match) booksProcessed = parseInt(match[1]);
      }
      if (line.includes('Books integrated:')) {
        const match = line.match(/Books integrated:\s*(\d+)/);
        if (match) booksIntegrated = parseInt(match[1]);
      }
      if (line.includes('Wisdom files created:') || line.includes('Total files created:')) {
        const match = line.match(/(?:Wisdom files created|Total files created):\s*(\d+)/);
        if (match) totalFilesCreated = parseInt(match[1]);
      }

      // Parse elemental distribution
      const elementMatches = {
        fire: line.match(/🔥.*?(\d+)/),
        water: line.match(/🌊.*?(\d+)/),
        earth: line.match(/🌍.*?(\d+)/),
        air: line.match(/💨.*?(\d+)/),
        aether: line.match(/✨.*?(\d+)/)
      };

      for (const [element, match] of Object.entries(elementMatches)) {
        if (match) {
          elementalDistribution[element as keyof typeof elementalDistribution] = parseInt(match[1]);
        }
      }

      // Parse successful books
      if (line.includes('📚') && (line.includes('Successfully Integrated') || line.includes('Processing:'))) {
        const bookMatch = line.match(/📚\s*(.+?)(?:\s*-\s*\w+)?$/);
        if (bookMatch) {
          const bookName = bookMatch[1].trim();
          if (bookName && !successfulBooks.includes(bookName)) {
            successfulBooks.push(bookName);
          }
        }
      }
    }

    // Parse failed books from stderr or stdout
    const allOutput = stdout + '\n' + stderr;
    const errorLines = allOutput.split('\n').filter(line =>
      line.includes('❌') || line.includes('Error') || line.includes('Failed') ||
      line.includes('couldn\'t be processed') || line.includes('⚠️')
    );

    for (const line of errorLines) {
      const bookMatch = line.match(/(?:❌|Error|Failed|⚠️)\s*(.+?)(?:\s*:|$)/);
      if (bookMatch) {
        failedBooks.push(bookMatch[1].trim());
      }
    }

  } catch (parseError) {
    console.warn('Failed to parse integration output:', parseError);
  }

  return {
    success: true,
    booksProcessed,
    booksIntegrated,
    totalFilesCreated,
    elementalDistribution,
    successfulBooks,
    failedBooks
  };
}