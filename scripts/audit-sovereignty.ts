#!/usr/bin/env tsx
// scripts/audit-sovereignty.ts v2.0
// Production-grade sovereignty compliance audit with AST detection
// Ensures MAIA remains fully local-first with no cloud dependencies

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import ts from 'typescript';

interface ViolationType {
  type: 'dependency' | 'api_key' | 'remote_endpoint' | 'cloud_service' | 'import_statement' | 'network_call';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  details: string;
  recommendation?: string;
  code?: string;
}

type ChokepointRules = Record<string, string[]>;

interface AuditConfig {
  version: string;
  cloudProviders: string[];
  chokepointRules?: ChokepointRules;  // Strict allowlist per chokepoint file
  allowedDependencies: {
    devOnly: string[];
    production: string[];
  };
  allowedFiles?: string[];  // Files allowed to use cloud providers (e.g., TTS-only)
  allowedDirectories?: string[];  // Directories allowed to use cloud providers (e.g., chokepoints)
  apiKeyPatterns: string[];
  remoteEndpoints: string[];
  allowedRemoteHosts: string[];
  bannedServices: string[];
  excludePatterns: string[];
  monorepo?: {
    enabled: boolean;
    workspaces: string[];
  };
  output?: {
    format: 'json' | 'text';
    path: string;
    includeTimestamp: boolean;
  };
  strictMode?: boolean;
  failOn?: Array<'critical' | 'high' | 'medium' | 'low'>;
}

interface AuditReport {
  timestamp: string;
  version: string;
  result: 'passed' | 'passed_with_warnings' | 'failed';
  violations: ViolationType[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  metadata: {
    nodeVersion: string;
    platform: string;
    workingDirectory: string;
    strictMode: boolean;
  };
}

const violations: ViolationType[] = [];
let config: AuditConfig;

/**
 * Load configuration from .sovereignty-audit.json or use defaults
 */
function loadConfig(): AuditConfig {
  const configPath = path.join(process.cwd(), '.sovereignty-audit.json');

  if (fs.existsSync(configPath)) {
    try {
      const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log('✓ Loaded configuration from .sovereignty-audit.json\n');
      return rawConfig;
    } catch (err) {
      console.error('⚠️  Failed to parse .sovereignty-audit.json, using defaults\n');
    }
  }

  // Default configuration
  return {
    version: '2.0.0',
    cloudProviders: [
      '@anthropic-ai',
      'openai',
      '@supabase',
      'aws-sdk',
      'firebase',
      'google-cloud',
      'azure',
      'vercel/ai-sdk'
    ],
    allowedDependencies: {
      devOnly: ['@anthropic-ai/sdk'],
      production: []
    },
    apiKeyPatterns: [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'GOOGLE_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'VERCEL_TOKEN'
    ],
    remoteEndpoints: [
      'api.openai.com',
      'api.anthropic.com',
      'supabase.co',
      'firebase.google.com',
      'googleapis.com'
    ],
    allowedRemoteHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1'
    ],
    bannedServices: ['supabase', 'Supabase'],
    excludePatterns: [
      'node_modules/',
      '.next/',
      'dist/',
      'build/',
      '.git/',
      '*.md',
      'Community-Commons/',
      'docs/',
      'scripts/audit-sovereignty.ts',
      '.sovereignty-audit.json'
    ],
    output: {
      format: 'json',
      path: 'artifacts/sovereignty-audit.json',
      includeTimestamp: true
    },
    strictMode: false,
    failOn: ['critical']
  };
}

/**
 * Main audit function
 */
async function auditSovereignty() {
  console.log('🔐 MAIA SOVEREIGNTY AUDIT v2.0 (AST-Enhanced)');
  console.log('='.repeat(50) + '\n');

  config = loadConfig();

  if (config.strictMode) {
    console.log('⚡ Strict mode enabled: warnings will fail the audit\n');
  }

  // Check 1: Production dependencies
  await checkProductionDependencies();

  // Check 2: AST-based import detection
  await checkImportsWithAST();

  // Check 3: AST-based network call detection
  await checkNetworkCallsWithAST();

  // Check 4: API key requirements in code (regex-based backup)
  await checkAPIKeyUsage();

  // Check 5: Remote endpoint calls (regex-based backup)
  await checkRemoteEndpoints();

  // Check 6: Supabase usage (explicitly banned)
  await checkSupabaseUsage();

  // Generate report
  const report = generateReport();

  // Output results
  await outputReport(report);

  // Exit with appropriate code
  if (report.result === 'failed') {
    console.error('\n❌ SOVEREIGNTY AUDIT FAILED');
    console.error('Critical violations detected. MAIA sovereignty compromised.\n');
    process.exit(1);
  } else if (report.result === 'passed_with_warnings') {
    console.warn('\n⚠️  SOVEREIGNTY AUDIT PASSED WITH WARNINGS');
    console.warn('Non-critical issues detected. Review recommendations.\n');
    process.exit(0);
  } else {
    console.log('\n✅ SOVEREIGNTY AUDIT PASSED');
    console.log('MAIA is fully sovereign. All checks passed.\n');
    process.exit(0);
  }
}

/**
 * Check production dependencies for cloud providers
 */
async function checkProductionDependencies() {
  console.log('[1/6] Checking production dependencies...');

  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    violations.push({
      type: 'dependency',
      severity: 'critical',
      location: 'package.json',
      details: 'package.json not found'
    });
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const prodDeps = packageJson.dependencies || {};

  for (const provider of config.cloudProviders) {
    const matches = Object.keys(prodDeps).filter(dep => dep.includes(provider));

    for (const dep of matches) {
      // Check if it's allowed in production
      if (config.allowedDependencies.production.includes(dep)) {
        continue;
      }

      // Check if it's a dev-only dependency mistakenly in prod
      if (config.allowedDependencies.devOnly.includes(dep)) {
        violations.push({
          type: 'dependency',
          severity: 'medium',
          location: `package.json → dependencies.${dep}`,
          details: `Development-only dependency "${dep}" found in production dependencies`,
          recommendation: `Move to devDependencies or remove if unused`
        });
      } else {
        violations.push({
          type: 'dependency',
          severity: 'critical',
          location: `package.json → dependencies.${dep}`,
          details: `Cloud provider dependency "${dep}" found in production`,
          recommendation: `Remove or replace with local-first alternative`
        });
      }
    }
  }

  console.log(`   Found ${violations.filter(v => v.type === 'dependency').length} dependency issues`);
}

/**
 * AST-based import detection (more accurate than regex)
 */
async function checkImportsWithAST() {
  console.log('[2/6] Checking imports with AST analysis...');

  const files = findTypeScriptFiles();
  let importViolations = 0;

  for (const file of files) {
    if (shouldExcludeFile(file)) continue;

    try {
      const sourceCode = fs.readFileSync(file, 'utf-8');
      const sourceFile = ts.createSourceFile(
        file,
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );

      // Check chokepoint imports against strict allowlist
      checkChokepointImports(file, sourceFile, sourceCode);

      // If it's an allowed chokepoint, don't generate general cloud provider violations
      if (isAllowedFile(file)) continue;

      ts.forEachChild(sourceFile, (node) => {
        // Check import statements
        if (ts.isImportDeclaration(node)) {
          const moduleSpecifier = node.moduleSpecifier;
          if (ts.isStringLiteral(moduleSpecifier)) {
            const importPath = moduleSpecifier.text;

            // Check against cloud providers
            for (const provider of config.cloudProviders) {
              if (importPath.includes(provider)) {
                // Check if it's allowed
                if (config.allowedDependencies.devOnly.includes(importPath) ||
                    config.allowedDependencies.production.includes(importPath)) {
                  continue;
                }

                const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
                violations.push({
                  type: 'import_statement',
                  severity: 'critical',
                  location: `${file}:${lineNumber}`,
                  details: `Cloud provider import detected: ${importPath}`,
                  recommendation: 'Move import to app/api/backend/src/integrations/cloud/ chokepoint',
                  code: sourceCode.split('\n')[lineNumber - 1]?.trim()
                });
                importViolations++;
              }
            }
          }
        }
      });
    } catch (err) {
      // Skip files that can't be parsed
      continue;
    }
  }

  console.log(`   Found ${importViolations} import violations`);
}

/**
 * AST-based network call detection
 *
 * NOTE: Currently handles only string literal URLs in fetch() calls.
 * TODO: Add support for:
 * - Template literals: `https://api.${host}/v1`
 * - Environment variables: process.env.API_URL
 * - Variable references: fetch(baseUrl)
 * - Other HTTP clients: axios.get(), request(), etc.
 */
async function checkNetworkCallsWithAST() {
  console.log('[3/6] Checking network calls with AST analysis...');

  const files = findTypeScriptFiles();
  let networkViolations = 0;

  for (const file of files) {
    if (shouldExcludeFile(file)) continue;

    // Skip files explicitly allowed to use cloud providers (chokepoints)
    if (isAllowedFile(file)) continue;

    try {
      const sourceCode = fs.readFileSync(file, 'utf-8');
      const sourceFile = ts.createSourceFile(
        file,
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );

      ts.forEachChild(sourceFile, function visit(node) {
        // Check fetch() calls with string literal URLs
        if (ts.isCallExpression(node)) {
          const expression = node.expression;
          if (ts.isIdentifier(expression) && expression.text === 'fetch') {
            if (node.arguments.length > 0) {
              const firstArg = node.arguments[0];
              if (ts.isStringLiteral(firstArg)) {
                const url = firstArg.text;

                // Check if host is allowed
                if (isAllowedHost(url)) {
                  ts.forEachChild(node, visit);
                  return;
                }

                // Check against banned remote endpoints
                for (const endpoint of config.remoteEndpoints) {
                  if (url.includes(endpoint)) {
                    const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
                    violations.push({
                      type: 'network_call',
                      severity: 'critical',
                      location: `${file}:${lineNumber}`,
                      details: `Network call to cloud endpoint: ${url}`,
                      recommendation: 'Move to app/api/backend/src/integrations/cloud/ chokepoint',
                      code: sourceCode.split('\n')[lineNumber - 1]?.trim()
                    });
                    networkViolations++;
                  }
                }
              }
            }
          }
        }

        ts.forEachChild(node, visit);
      });
    } catch (err) {
      continue;
    }
  }

  console.log(`   Found ${networkViolations} network call violations`);
}

/**
 * Check if a URL points to an allowed host
 */
function isAllowedHost(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    return config.allowedRemoteHosts.some(allowed =>
      hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
  } catch {
    // Not a valid URL, check for localhost patterns
    return config.allowedRemoteHosts.some(allowed => url.includes(allowed));
  }
}

/**
 * Check for API key usage in codebase (regex-based backup)
 */
async function checkAPIKeyUsage() {
  console.log('[4/6] Checking for API key requirements (regex)...');

  const pattern = config.apiKeyPatterns.join('|');

  try {
    const grepCmd = isRipgrepAvailable()
      ? `rg --no-heading --line-number "${pattern}" -g "*.{ts,tsx,js,jsx,env*}" ${getExcludeFlags()}`
      : `grep -rn "${pattern.replace(/\|/g, '\\|')}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include=".env*" . ${getGrepExcludeFlags()}`;

    const result = execSync(grepCmd, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    if (result.trim()) {
      const lines = result.trim().split('\n');
      for (const line of lines) {
        // Parse ripgrep/grep output: file.ts:123:content
        const parts = line.split(':');
        if (parts.length < 3) continue;

        const file = parts[0];
        const lineNo = parts[1];
        const content = parts.slice(2).join(':');
        const location = `${file}:${lineNo}`;

        // Skip comments and documentation
        if (content.trim().startsWith('//') ||
            content.trim().startsWith('*') ||
            content.includes('Example:') ||
            file.includes('.md')) {
          continue;
        }

        violations.push({
          type: 'api_key',
          severity: 'critical',
          location,
          details: `API key reference found: ${content.trim()}`,
          recommendation: 'Remove cloud API key requirements or use local-only alternatives'
        });
      }
    }
  } catch (err) {
    // No matches found
  }

  console.log(`   Found ${violations.filter(v => v.type === 'api_key').length} API key issues`);
}

/**
 * Check for remote endpoint calls (regex-based backup)
 */
async function checkRemoteEndpoints() {
  console.log('[5/6] Checking for remote endpoint calls (regex)...');

  for (const endpoint of config.remoteEndpoints) {
    try {
      const grepCmd = isRipgrepAvailable()
        ? `rg --no-heading --line-number "${endpoint}" -g "*.{ts,tsx,js,jsx}" ${getExcludeFlags()}`
        : `grep -rn "${endpoint}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . ${getGrepExcludeFlags()}`;

      const result = execSync(grepCmd, {
        cwd: process.cwd(),
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });

      if (result.trim()) {
        const lines = result.trim().split('\n');
        for (const line of lines) {
          // Parse ripgrep/grep output: file.ts:123:content
          const parts = line.split(':');
          if (parts.length < 3) continue;

          const file = parts[0];
          const lineNo = parts[1];
          const content = parts.slice(2).join(':');
          const location = `${file}:${lineNo}`;

          // Skip if already detected by AST
          if (violations.some(v => v.location === location && v.type === 'network_call')) {
            continue;
          }

          // Skip comments
          if (content.trim().startsWith('//') ||
              content.trim().startsWith('*')) {
            continue;
          }

          violations.push({
            type: 'remote_endpoint',
            severity: 'critical',
            location,
            details: `Remote endpoint reference: ${endpoint}`,
            recommendation: 'Replace with local Ollama/local service endpoint'
          });
        }
      }
    } catch (err) {
      continue;
    }
  }

  console.log(`   Found ${violations.filter(v => v.type === 'remote_endpoint').length} remote endpoint issues`);
}

/**
 * Check for Supabase usage (explicitly banned per CLAUDE.md)
 */
async function checkSupabaseUsage() {
  console.log('[6/6] Checking for Supabase usage (banned)...');

  const pattern = config.bannedServices.join('|');

  try {
    const grepCmd = isRipgrepAvailable()
      ? `rg --no-heading --line-number "${pattern}" -g "*.{ts,tsx,js,jsx}" ${getExcludeFlags()}`
      : `grep -rn "${pattern.replace(/\|/g, '\\|')}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . ${getGrepExcludeFlags()}`;

    const result = execSync(grepCmd, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    if (result.trim()) {
      const lines = result.trim().split('\n');
      for (const line of lines) {
        // Parse ripgrep/grep output: file.ts:123:content
        const parts = line.split(':');
        if (parts.length < 3) continue;

        const file = parts[0];
        const lineNo = parts[1];
        const content = parts.slice(2).join(':');
        const location = `${file}:${lineNo}`;

        // Skip comments and .md files
        if (content.trim().startsWith('//') ||
            content.trim().startsWith('*') ||
            file.includes('.md') ||
            file.includes('audit-sovereignty')) {
          continue;
        }

        violations.push({
          type: 'cloud_service',
          severity: 'critical',
          location,
          details: 'Supabase usage detected (banned per CLAUDE.md)',
          recommendation: 'Use Prisma with local PostgreSQL/SQLite instead'
        });
      }
    }
  } catch (err) {
    // No matches
  }

  console.log(`   Found ${violations.filter(v => v.type === 'cloud_service').length} Supabase issues`);
}

/**
 * Generate audit report
 */
function generateReport(): AuditReport {
  const bySeverity = {
    critical: violations.filter(v => v.severity === 'critical').length,
    high: violations.filter(v => v.severity === 'high').length,
    medium: violations.filter(v => v.severity === 'medium').length,
    low: violations.filter(v => v.severity === 'low').length
  };

  // Determine result based on failOn config
  const failOn = config.failOn || ['critical'];
  const shouldFail = failOn.some(severity => {
    const count = bySeverity[severity];
    return count > 0;
  });

  // In strict mode, any violation fails
  const hasViolations = violations.length > 0;

  let result: 'passed' | 'passed_with_warnings' | 'failed';
  if (config.strictMode && hasViolations) {
    result = 'failed';
  } else if (shouldFail) {
    result = 'failed';
  } else if (hasViolations) {
    result = 'passed_with_warnings';
  } else {
    result = 'passed';
  }

  return {
    timestamp: new Date().toISOString(),
    version: config.version,
    result,
    violations,
    summary: {
      ...bySeverity,
      total: violations.length
    },
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
      workingDirectory: process.cwd(),
      strictMode: config.strictMode || false
    }
  };
}

/**
 * Output report in requested format
 */
async function outputReport(report: AuditReport) {
  // Ensure artifacts directory exists
  const artifactsDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // Write JSON report
  if (config.output?.format === 'json' || !config.output) {
    const outputPath = path.join(process.cwd(), config.output?.path || 'artifacts/sovereignty-audit.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n📄 JSON report written to: ${outputPath}`);
  }

  // Console output
  printTextReport(report);
}

/**
 * Print text report to console
 */
function printTextReport(report: AuditReport) {
  if (report.violations.length === 0) {
    return;
  }

  console.log('\n📋 VIOLATIONS DETECTED\n');

  const critical = report.violations.filter(v => v.severity === 'critical');
  const high = report.violations.filter(v => v.severity === 'high');
  const medium = report.violations.filter(v => v.severity === 'medium');
  const low = report.violations.filter(v => v.severity === 'low');

  if (critical.length > 0) {
    console.error(`🚨 CRITICAL (${critical.length})`);
    console.error('─'.repeat(60));
    for (const v of critical) {
      console.error(`\n  Type: ${v.type}`);
      console.error(`  Location: ${v.location}`);
      console.error(`  Details: ${v.details}`);
      if (v.code) {
        console.error(`  Code: ${v.code}`);
      }
      if (v.recommendation) {
        console.error(`  💡 Fix: ${v.recommendation}`);
      }
    }
    console.error('');
  }

  if (high.length > 0) {
    console.error(`⚠️  HIGH (${high.length})`);
    console.error('─'.repeat(60));
    for (const v of high) {
      console.error(`\n  Type: ${v.type}`);
      console.error(`  Location: ${v.location}`);
      console.error(`  Details: ${v.details}`);
      if (v.code) {
        console.error(`  Code: ${v.code}`);
      }
      if (v.recommendation) {
        console.error(`  💡 Fix: ${v.recommendation}`);
      }
    }
    console.error('');
  }

  if (medium.length > 0) {
    console.warn(`\n⚠️  MEDIUM (${medium.length})`);
    console.warn('─'.repeat(60));
    for (const v of medium) {
      console.warn(`\n  Type: ${v.type}`);
      console.warn(`  Location: ${v.location}`);
      console.warn(`  Details: ${v.details}`);
      if (v.code) {
        console.warn(`  Code: ${v.code}`);
      }
      if (v.recommendation) {
        console.warn(`  💡 Recommendation: ${v.recommendation}`);
      }
    }
    console.warn('');
  }

  if (low.length > 0) {
    console.warn(`\nℹ️  LOW (${low.length})`);
    console.warn('─'.repeat(60));
    for (const v of low) {
      console.warn(`\n  Type: ${v.type}`);
      console.warn(`  Location: ${v.location}`);
      console.warn(`  Details: ${v.details}`);
      if (v.code) {
        console.warn(`  Code: ${v.code}`);
      }
      if (v.recommendation) {
        console.warn(`  💡 Recommendation: ${v.recommendation}`);
      }
    }
    console.warn('');
  }
}

/**
 * Find all TypeScript/JavaScript files
 */
function findTypeScriptFiles(): string[] {
  const files: string[] = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  function walk(dir: string) {
    if (shouldExcludeFile(dir)) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }

  walk(process.cwd());
  return files;
}

/**
 * Check if file should be excluded
 */
/**
 * Get normalized relative path
 */
function getRelativeNormalized(filePath: string): string {
  const relativePath = path.relative(process.cwd(), filePath);
  return relativePath.replace(/\\/g, '/');
}

/**
 * Get chokepoint rules from config
 */
function getChokepointRules(): ChokepointRules {
  return config.chokepointRules || {};
}

/**
 * Check if file is a defined chokepoint
 */
function isChokepointFile(filePath: string): boolean {
  const rel = getRelativeNormalized(filePath);
  const rules = getChokepointRules();
  return Object.prototype.hasOwnProperty.call(rules, rel);
}

/**
 * Get allowed imports for a chokepoint file
 */
function allowedImportsForChokepoint(filePath: string): string[] {
  const rel = getRelativeNormalized(filePath);
  const rules = getChokepointRules();
  return rules[rel] || [];
}

/**
 * Check chokepoint imports against strict allowlist
 */
function checkChokepointImports(
  filePath: string,
  sourceFile: ts.SourceFile,
  sourceCode: string
): void {
  if (!isChokepointFile(filePath)) return;

  const allow = allowedImportsForChokepoint(filePath);
  const rel = getRelativeNormalized(filePath);

  ts.forEachChild(sourceFile, function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpec = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpec)) {
        const importPath = moduleSpec.text;

        // Allow exact match OR prefix match (e.g. "@aws-sdk/client-s3")
        const ok = allow.some(a => importPath === a || importPath.startsWith(a));
        if (!ok) {
          const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          violations.push({
            type: 'import_statement',
            severity: 'critical',
            location: `${filePath}:${lineNumber}`,
            details: `Chokepoint import NOT allowed (${rel}): ${importPath}`,
            recommendation: `Only these imports are allowed here: ${allow.join(', ')}`,
            code: sourceCode.split('\n')[lineNumber - 1]?.trim()
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  });
}

/**
 * Check if file is allowed to use cloud providers (e.g., TTS chokepoint)
 */
function isAllowedFile(filePath: string): boolean {
  const normalizedPath = getRelativeNormalized(filePath);

  // Check exact file matches
  if (config.allowedFiles?.some(allowed => normalizedPath === allowed)) {
    return true;
  }

  // Check directory matches
  if (config.allowedDirectories?.some(allowed => normalizedPath.startsWith(allowed + '/'))) {
    return true;
  }

  return false;
}

function shouldExcludeFile(filePath: string): boolean {
  const relativePath = path.relative(process.cwd(), filePath);

  return config.excludePatterns.some(pattern => {
    if (pattern.endsWith('/')) {
      return relativePath.startsWith(pattern) || relativePath.includes(`/${pattern}`);
    }
    if (pattern.startsWith('*.')) {
      return relativePath.endsWith(pattern.slice(1));
    }
    return relativePath.includes(pattern);
  });
}

/**
 * Check if ripgrep is available
 */
function isRipgrepAvailable(): boolean {
  try {
    execSync('rg --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get exclude flags for ripgrep
 */
function getExcludeFlags(): string {
  return config.excludePatterns.map(p => `-g "!${p}"`).join(' ');
}

/**
 * Get exclude flags for grep
 */
function getGrepExcludeFlags(): string {
  return config.excludePatterns
    .filter(p => p.endsWith('/'))
    .map(p => `--exclude-dir="${p.slice(0, -1)}"`)
    .join(' ');
}

// Run audit
auditSovereignty().catch(err => {
  console.error('❌ AUDIT FAILED WITH ERROR:', err);
  process.exit(1);
});
