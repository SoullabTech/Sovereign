#!/usr/bin/env tsx
/**
 * Detects design mockup files that may conflict with production components
 * Phase 4.2C Module C automation - Design Mockup Detection
 *
 * Usage:
 *   npx tsx scripts/find-design-mockups.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface MockupIndicator {
  type: 'flag' | 'placeholder_data' | 'todo_comment' | 'demo_route' | 'temp_component';
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

interface MockupFile {
  file: string;
  reasons: MockupIndicator[];
  lineNumbers: number[];
  snippets: string[];
}

interface MockupReport {
  totalFiles: number;
  mockupFiles: MockupFile[];
  categories: {
    design_only: number;
    demo_routes: number;
    temp_components: number;
    placeholder_data: number;
  };
  generatedAt: string;
}

// Patterns that indicate design mockups or temporary files
const MOCKUP_PATTERNS = {
  // Explicit flags
  flags: [
    'DESIGN_ONLY',
    'MOCKUP',
    'PLACEHOLDER',
    'TEMPORARY',
    'DEMO_ONLY',
    'NOT_FOR_PRODUCTION'
  ],

  // Demo/temp route indicators
  demoRoutes: [
    '/demo/',
    '/beta/',
    '/test/',
    '/playground/',
    '/prototype/'
  ],

  // TODO/FIXME comments indicating incomplete work
  todoPatterns: [
    'TODO.*create.*component',
    'FIXME.*placeholder',
    'TODO.*implement',
    'REMOVED.*was in deleted'
  ],

  // Files with "Design" or "Mockup" in filename
  filenamePatterns: [
    'Design.tsx',
    'Mockup.tsx',
    '.design.tsx',
    '.mockup.tsx',
    'Placeholder.tsx',
    'Demo.tsx'
  ]
};

/**
 * Check if file contains design mockup indicators
 */
function analyzeFile(filePath: string): MockupFile | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const reasons: MockupIndicator[] = [];
    const lineNumbers: number[] = [];
    const snippets: string[] = [];

    // Check for explicit flags
    MOCKUP_PATTERNS.flags.forEach(flag => {
      const regex = new RegExp(flag, 'gi');
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          reasons.push({
            type: 'flag',
            confidence: 'high',
            evidence: flag
          });
          lineNumbers.push(index + 1);
          snippets.push(line.trim());
        }
      });
    });

    // Check for TODO/FIXME comments
    MOCKUP_PATTERNS.todoPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          reasons.push({
            type: 'todo_comment',
            confidence: 'medium',
            evidence: pattern
          });
          lineNumbers.push(index + 1);
          snippets.push(line.trim());
        }
      });
    });

    // Check filename patterns
    const fileName = path.basename(filePath);
    MOCKUP_PATTERNS.filenamePatterns.forEach(pattern => {
      if (fileName.includes(pattern)) {
        reasons.push({
          type: 'temp_component',
          confidence: 'high',
          evidence: `Filename contains "${pattern}"`
        });
      }
    });

    // Check if it's a demo route
    MOCKUP_PATTERNS.demoRoutes.forEach(route => {
      if (filePath.includes(route)) {
        reasons.push({
          type: 'demo_route',
          confidence: 'medium',
          evidence: `File in ${route} directory`
        });
      }
    });

    // Check for placeholder data patterns
    const placeholderPatterns = [
      /mockData\s*=/gi,
      /sampleData\s*=/gi,
      /placeholderData\s*=/gi,
      /dummyData\s*=/gi,
      /MOCK_[A-Z_]+\s*=/gi
    ];

    placeholderPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        reasons.push({
          type: 'placeholder_data',
          confidence: 'low',
          evidence: `Contains placeholder data pattern ${index + 1}`
        });
      }
    });

    // Return if we found any indicators
    if (reasons.length > 0) {
      return {
        file: filePath,
        reasons,
        lineNumbers,
        snippets
      };
    }

    return null;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
    return null;
  }
}

/**
 * Recursively find all TypeScript/TSX files
 */
function findAllTSFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
        findAllTSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

async function findDesignMockups(): Promise<void> {
  console.log('🔍 Scanning for design mockup conflicts...\n');

  const searchDirs = ['app', 'components', 'lib'];
  const allFiles: string[] = [];

  // Gather all TypeScript files
  searchDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      findAllTSFiles(dir, allFiles);
    }
  });

  console.log(`📊 Analyzing ${allFiles.length} TypeScript files...\n`);

  const mockupFiles: MockupFile[] = [];
  const categories = {
    design_only: 0,
    demo_routes: 0,
    temp_components: 0,
    placeholder_data: 0
  };

  // Analyze each file
  for (const file of allFiles) {
    const analysis = analyzeFile(file);
    if (analysis) {
      mockupFiles.push(analysis);

      // Categorize
      analysis.reasons.forEach(reason => {
        if (reason.type === 'flag') categories.design_only++;
        if (reason.type === 'demo_route') categories.demo_routes++;
        if (reason.type === 'temp_component') categories.temp_components++;
        if (reason.type === 'placeholder_data') categories.placeholder_data++;
      });
    }
  }

  // Build report
  const report: MockupReport = {
    totalFiles: allFiles.length,
    mockupFiles,
    categories,
    generatedAt: new Date().toISOString()
  };

  // Save JSON report
  const reportPath = 'artifacts/design-mockup-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print summary to console
  console.log('📊 MOCKUP DETECTION SUMMARY');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(`Total files scanned: ${allFiles.length}`);
  console.log(`Mockup files found: ${mockupFiles.length}\n`);

  if (mockupFiles.length > 0) {
    console.log('Categories:');
    console.log(`  Design-only flags:    ${categories.design_only}`);
    console.log(`  Demo routes:          ${categories.demo_routes}`);
    console.log(`  Temp components:      ${categories.temp_components}`);
    console.log(`  Placeholder data:     ${categories.placeholder_data}\n`);

    console.log('🔧 MOCKUP FILES DETECTED:\n');

    mockupFiles.forEach(mockup => {
      console.log(`  ${mockup.file}`);
      console.log(`    Confidence: ${mockup.reasons[0].confidence}`);
      console.log(`    Reasons:`);
      mockup.reasons.slice(0, 3).forEach(reason => {
        console.log(`      - [${reason.type}] ${reason.evidence}`);
      });
      if (mockup.snippets.length > 0) {
        console.log(`    Evidence: ${mockup.snippets[0].substring(0, 80)}...`);
      }
      console.log();
    });
  } else {
    console.log('✅ No design mockup conflicts detected!\n');
  }

  console.log(`📁 Full report saved to: ${reportPath}\n`);

  if (mockupFiles.length > 0) {
    console.log('⚠️  RECOMMENDED ACTIONS:\n');
    console.log('  For each mockup file:');
    console.log('  1. Review the file and determine if it\'s production code');
    console.log('  2. DELETE if it\'s purely a design mockup');
    console.log('  3. REFACTOR if it contains reusable logic');
    console.log('  4. DOCUMENT if it\'s intentionally deferred\n');
  }

  console.log('✅ Design mockup detection complete.\n');
}

findDesignMockups().catch(console.error);
