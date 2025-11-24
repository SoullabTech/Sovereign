/**
 * Migration Framework & Testing Utilities
 * Supports safe architectural transformation
 * Foundation component for complexity debt reduction
 */

import { TypeVersion, Migration, SystemError, HealthStatus } from './TypeRegistry.js';
import { EventBus, daimonicEventBus } from './EventBus.js';

export interface MigrationStep {
  id: string;
  name: string;
  description: string;
  phase: MigrationPhase;
  dependencies: string[]; // Other migration IDs that must complete first
  reversible: boolean;
  estimatedDuration: number; // seconds
  
  // Validation
  preChecks: ValidationCheck[];
  postChecks: ValidationCheck[];
  
  // Execution
  execute: (context: MigrationContext) => Promise<MigrationResult>;
  rollback?: (context: MigrationContext) => Promise<MigrationResult>;
  
  // Testing
  dryRun?: (context: MigrationContext) => Promise<DryRunResult>;
}

export interface MigrationPhase {
  name: string;
  order: number;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  rollbackStrategy: 'automatic' | 'manual' | 'none';
}

export interface MigrationContext {
  migrationId: string;
  environment: 'development' | 'staging' | 'production';
  dryRun: boolean;
  backupEnabled: boolean;
  
  // Services & Data Access
  eventBus: EventBus;
  storage: any; // UnifiedStorageService when available
  logger: any;
  
  // Migration state
  completedSteps: string[];
  currentStep: string | null;
  startTime: Date;
  
  // Configuration
  config: Record<string, any>;
  flags: Record<string, boolean>;
}

export interface MigrationResult {
  success: boolean;
  stepId: string;
  duration: number;
  affectedEntities: number;
  warnings: string[];
  errors: SystemError[];
  metrics: Record<string, number>;
  
  // For rollback information
  rollbackData?: any;
}

export interface DryRunResult extends MigrationResult {
  wouldCreate: number;
  wouldUpdate: number;
  wouldDelete: number;
  potentialConflicts: string[];
}

export interface ValidationCheck {
  name: string;
  description: string;
  critical: boolean;
  check: (context: MigrationContext) => Promise<ValidationResult>;
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
  recommendations?: string[];
}

export class MigrationFramework {
  private steps: Map<string, MigrationStep> = new Map();
  private phases: Map<string, MigrationPhase> = new Map();
  private executionHistory: MigrationExecution[] = [];
  
  constructor(
    private eventBus: EventBus = daimonicEventBus,
    private options: {
      enableBackups?: boolean;
      enableDryRun?: boolean;
      enableRollback?: boolean;
      maxParallelSteps?: number;
    } = {}
  ) {
    this.options = {
      enableBackups: true,
      enableDryRun: true,
      enableRollback: true,
      maxParallelSteps: 3,
      ...options
    };

    this.setupDefaultPhases();
  }

  /**
   * Register migration phase
   */
  registerPhase(phase: MigrationPhase): void {
    this.phases.set(phase.name, phase);
    
    this.eventBus.emit('migration:phase_registered', {
      phaseName: phase.name,
      order: phase.order,
      riskLevel: phase.riskLevel
    });
  }

  /**
   * Register migration step
   */
  registerStep(step: MigrationStep): void {
    // Validate dependencies
    for (const depId of step.dependencies) {
      if (!this.steps.has(depId)) {
        throw new Error(`Migration step ${step.id} depends on unknown step ${depId}`);
      }
    }

    this.steps.set(step.id, step);
    
    this.eventBus.emit('migration:step_registered', {
      stepId: step.id,
      phaseName: step.phase.name,
      dependencies: step.dependencies.length
    });
  }

  /**
   * Execute complete migration
   */
  async executeMigration(
    migrationName: string,
    environment: 'development' | 'staging' | 'production',
    options: {
      dryRun?: boolean;
      backupEnabled?: boolean;
      stepIds?: string[]; // Execute only specific steps
      config?: Record<string, any>;
    } = {}
  ): Promise<MigrationExecution> {
    
    const execution: MigrationExecution = {
      id: this.generateId(),
      name: migrationName,
      environment,
      startTime: new Date(),
      endTime: null,
      status: 'running',
      dryRun: options.dryRun || false,
      steps: [],
      totalSteps: 0,
      completedSteps: 0,
      errors: [],
      warnings: [],
      metrics: {}
    };

    const context: MigrationContext = {
      migrationId: execution.id,
      environment,
      dryRun: execution.dryRun,
      backupEnabled: options.backupEnabled ?? this.options.enableBackups!,
      eventBus: this.eventBus,
      storage: null, // Would be injected in real implementation
      logger: console, // Would be proper logger in real implementation
      completedSteps: [],
      currentStep: null,
      startTime: execution.startTime,
      config: options.config || {},
      flags: {}
    };

    try {
      this.executionHistory.push(execution);
      
      await this.eventBus.emit('migration:started', {
        migrationId: execution.id,
        migrationName,
        environment,
        dryRun: execution.dryRun
      });

      // Get execution plan
      const plan = this.createExecutionPlan(options.stepIds);
      execution.totalSteps = plan.length;

      // Execute phases in order
      const phases = this.groupStepsByPhase(plan);
      
      for (const [phaseName, phaseSteps] of phases) {
        await this.executePhase(phaseName, phaseSteps, context, execution);
        
        if (execution.status === 'failed') {
          break;
        }
      }

      // Final status
      if (execution.status === 'running') {
        execution.status = 'completed';
      }

    } catch (error) {
      execution.status = 'failed';
      execution.errors.push({
        code: 'MIGRATION_EXECUTION_FAILED',
        message: (error as Error).message,
        severity: 'critical',
        timestamp: new Date(),
        context: { migrationId: execution.id },
        recoverable: false
      });

      await this.eventBus.emit('migration:failed', {
        migrationId: execution.id,
        error: error as Error
      });

    } finally {
      execution.endTime = new Date();
      
      await this.eventBus.emit('migration:completed', {
        migrationId: execution.id,
        status: execution.status,
        duration: execution.endTime.getTime() - execution.startTime.getTime(),
        stepsCompleted: execution.completedSteps,
        errors: execution.errors.length,
        warnings: execution.warnings.length
      });
    }

    return execution;
  }

  /**
   * Execute single migration step
   */
  async executeStep(
    stepId: string,
    context: MigrationContext
  ): Promise<MigrationResult> {
    
    const step = this.steps.get(stepId);
    if (!step) {
      throw new Error(`Unknown migration step: ${stepId}`);
    }

    context.currentStep = stepId;
    const startTime = Date.now();

    try {
      await this.eventBus.emit('migration:step_started', {
        migrationId: context.migrationId,
        stepId: step.id,
        stepName: step.name
      });

      // Run pre-checks
      for (const check of step.preChecks) {
        const result = await check.check(context);
        if (!result.passed && check.critical) {
          throw new Error(`Pre-check failed: ${check.name} - ${result.message}`);
        }
        if (!result.passed) {
          console.warn(`Pre-check warning: ${check.name} - ${result.message}`);
        }
      }

      // Execute step (or dry run)
      let result: MigrationResult;
      
      if (context.dryRun && step.dryRun) {
        result = await step.dryRun(context) as MigrationResult;
      } else if (!context.dryRun) {
        result = await step.execute(context);
      } else {
        // Default dry run behavior
        result = {
          success: true,
          stepId: step.id,
          duration: 0,
          affectedEntities: 0,
          warnings: ['Dry run mode - no changes made'],
          errors: [],
          metrics: {}
        };
      }

      result.duration = Date.now() - startTime;

      // Run post-checks
      if (!context.dryRun) {
        for (const check of step.postChecks) {
          const checkResult = await check.check(context);
          if (!checkResult.passed && check.critical) {
            throw new Error(`Post-check failed: ${check.name} - ${checkResult.message}`);
          }
          if (!checkResult.passed) {
            result.warnings.push(`Post-check warning: ${check.name} - ${checkResult.message}`);
          }
        }
      }

      // Mark as completed
      if (result.success) {
        context.completedSteps.push(stepId);
      }

      await this.eventBus.emit('migration:step_completed', {
        migrationId: context.migrationId,
        stepId: step.id,
        success: result.success,
        duration: result.duration,
        affectedEntities: result.affectedEntities
      });

      return result;

    } catch (error) {
      const result: MigrationResult = {
        success: false,
        stepId: step.id,
        duration: Date.now() - startTime,
        affectedEntities: 0,
        warnings: [],
        errors: [{
          code: 'STEP_EXECUTION_FAILED',
          message: (error as Error).message,
          severity: 'high',
          timestamp: new Date(),
          context: { stepId, migrationId: context.migrationId },
          recoverable: step.reversible
        }],
        metrics: {}
      };

      await this.eventBus.emit('migration:step_failed', {
        migrationId: context.migrationId,
        stepId: step.id,
        error: error as Error
      });

      return result;
    }
  }

  /**
   * Rollback migration
   */
  async rollbackMigration(
    executionId: string,
    toStepId?: string
  ): Promise<MigrationExecution> {
    
    const originalExecution = this.executionHistory.find(e => e.id === executionId);
    if (!originalExecution) {
      throw new Error(`Migration execution not found: ${executionId}`);
    }

    const rollbackExecution: MigrationExecution = {
      id: this.generateId(),
      name: `Rollback: ${originalExecution.name}`,
      environment: originalExecution.environment,
      startTime: new Date(),
      endTime: null,
      status: 'running',
      dryRun: false,
      steps: [],
      totalSteps: 0,
      completedSteps: 0,
      errors: [],
      warnings: [],
      metrics: {},
      rollbackOf: executionId
    };

    // Create rollback context
    const context: MigrationContext = {
      migrationId: rollbackExecution.id,
      environment: originalExecution.environment,
      dryRun: false,
      backupEnabled: true,
      eventBus: this.eventBus,
      storage: null,
      logger: console,
      completedSteps: [],
      currentStep: null,
      startTime: rollbackExecution.startTime,
      config: {},
      flags: { rollback: true }
    };

    try {
      this.executionHistory.push(rollbackExecution);

      // Determine steps to rollback
      const stepsToRollback = this.getRollbackSteps(originalExecution, toStepId);
      rollbackExecution.totalSteps = stepsToRollback.length;

      // Execute rollbacks in reverse order
      for (const stepResult of stepsToRollback.reverse()) {
        const step = this.steps.get(stepResult.stepId);
        if (!step || !step.rollback) {
          rollbackExecution.warnings.push(`Cannot rollback step ${stepResult.stepId}: no rollback function`);
          continue;
        }

        context.currentStep = step.id;
        const result = await step.rollback(context);
        
        rollbackExecution.steps.push(result);
        if (result.success) {
          rollbackExecution.completedSteps++;
        } else {
          rollbackExecution.errors.push(...result.errors);
          if (step.phase.rollbackStrategy === 'automatic') {
            rollbackExecution.status = 'failed';
            break;
          }
        }
      }

      if (rollbackExecution.status === 'running') {
        rollbackExecution.status = 'completed';
      }

    } catch (error) {
      rollbackExecution.status = 'failed';
      rollbackExecution.errors.push({
        code: 'ROLLBACK_FAILED',
        message: (error as Error).message,
        severity: 'critical',
        timestamp: new Date(),
        context: { executionId },
        recoverable: false
      });
    } finally {
      rollbackExecution.endTime = new Date();
    }

    return rollbackExecution;
  }

  /**
   * Get migration status
   */
  getExecutionStatus(executionId: string): MigrationExecution | null {
    return this.executionHistory.find(e => e.id === executionId) || null;
  }

  /**
   * List all executions
   */
  getExecutionHistory(): MigrationExecution[] {
    return [...this.executionHistory];
  }

  /**
   * Validate migration plan
   */
  async validateMigrationPlan(stepIds?: string[]): Promise<{
    valid: boolean;
    issues: string[];
    plan: MigrationStep[];
  }> {
    const plan = this.createExecutionPlan(stepIds);
    const issues: string[] = [];

    // Check dependencies
    const executed = new Set<string>();
    for (const step of plan) {
      for (const depId of step.dependencies) {
        if (!executed.has(depId)) {
          issues.push(`Step ${step.id} depends on ${depId} which comes later in execution order`);
        }
      }
      executed.add(step.id);
    }

    // Check phase order
    const phases = this.groupStepsByPhase(plan);
    let lastPhaseOrder = -1;
    for (const [phaseName] of phases) {
      const phase = this.phases.get(phaseName);
      if (phase && phase.order < lastPhaseOrder) {
        issues.push(`Phase ${phaseName} (order ${phase.order}) comes after phase with higher order`);
      }
      if (phase) {
        lastPhaseOrder = phase.order;
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      plan
    };
  }

  /**
   * Helper methods
   */

  private setupDefaultPhases(): void {
    const phases: MigrationPhase[] = [
      {
        name: 'Foundation',
        order: 1,
        description: 'Core infrastructure setup',
        riskLevel: 'low',
        rollbackStrategy: 'automatic'
      },
      {
        name: 'Service_Consolidation',
        order: 2,
        description: 'Merge and consolidate services',
        riskLevel: 'medium',
        rollbackStrategy: 'manual'
      },
      {
        name: 'Integration',
        order: 3,
        description: 'Update consumers and integrations',
        riskLevel: 'high',
        rollbackStrategy: 'manual'
      },
      {
        name: 'Cleanup',
        order: 4,
        description: 'Remove deprecated code',
        riskLevel: 'low',
        rollbackStrategy: 'none'
      }
    ];

    phases.forEach(phase => this.registerPhase(phase));
  }

  private createExecutionPlan(stepIds?: string[]): MigrationStep[] {
    const allSteps = stepIds 
      ? stepIds.map(id => this.steps.get(id)!).filter(Boolean)
      : Array.from(this.steps.values());

    // Sort by phase order, then by dependencies
    const sorted = this.topologicalSort(allSteps);
    return sorted;
  }

  private topologicalSort(steps: MigrationStep[]): MigrationStep[] {
    const sorted: MigrationStep[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (step: MigrationStep) => {
      if (visiting.has(step.id)) {
        throw new Error(`Circular dependency detected involving step ${step.id}`);
      }
      if (visited.has(step.id)) return;

      visiting.add(step.id);
      
      for (const depId of step.dependencies) {
        const depStep = steps.find(s => s.id === depId);
        if (depStep) {
          visit(depStep);
        }
      }
      
      visiting.delete(step.id);
      visited.add(step.id);
      sorted.push(step);
    };

    // Sort by phase order first
    const phaseOrdered = steps.sort((a, b) => a.phase.order - b.phase.order);
    
    for (const step of phaseOrdered) {
      visit(step);
    }

    return sorted;
  }

  private groupStepsByPhase(steps: MigrationStep[]): Map<string, MigrationStep[]> {
    const grouped = new Map<string, MigrationStep[]>();
    
    for (const step of steps) {
      const phaseName = step.phase.name;
      if (!grouped.has(phaseName)) {
        grouped.set(phaseName, []);
      }
      grouped.get(phaseName)!.push(step);
    }
    
    return grouped;
  }

  private async executePhase(
    phaseName: string,
    steps: MigrationStep[],
    context: MigrationContext,
    execution: MigrationExecution
  ): Promise<void> {
    
    await this.eventBus.emit('migration:phase_started', {
      migrationId: execution.id,
      phaseName,
      stepCount: steps.length
    });

    for (const step of steps) {
      if (execution.status === 'failed') break;

      const result = await this.executeStep(step.id, context);
      execution.steps.push(result);
      
      if (result.success) {
        execution.completedSteps++;
      } else {
        execution.errors.push(...result.errors);
        
        // Check if we should continue or fail
        const phase = this.phases.get(phaseName);
        if (phase?.riskLevel === 'critical' || result.errors.some(e => e.severity === 'critical')) {
          execution.status = 'failed';
          break;
        }
      }
      
      execution.warnings.push(...result.warnings);
      
      // Merge metrics
      for (const [key, value] of Object.entries(result.metrics)) {
        execution.metrics[key] = (execution.metrics[key] || 0) + value;
      }
    }

    await this.eventBus.emit('migration:phase_completed', {
      migrationId: execution.id,
      phaseName,
      completed: steps.filter(s => 
        execution.steps.find(r => r.stepId === s.id)?.success
      ).length
    });
  }

  private getRollbackSteps(
    execution: MigrationExecution,
    toStepId?: string
  ): MigrationResult[] {
    
    const completedSteps = execution.steps.filter(s => s.success);
    
    if (toStepId) {
      const targetIndex = completedSteps.findIndex(s => s.stepId === toStepId);
      if (targetIndex >= 0) {
        return completedSteps.slice(targetIndex);
      }
    }
    
    return completedSteps;
  }

  private generateId(): string {
    return `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface MigrationExecution {
  id: string;
  name: string;
  environment: 'development' | 'staging' | 'production';
  startTime: Date;
  endTime: Date | null;
  status: 'running' | 'completed' | 'failed' | 'rolled_back';
  dryRun: boolean;
  
  steps: MigrationResult[];
  totalSteps: number;
  completedSteps: number;
  
  errors: SystemError[];
  warnings: string[];
  metrics: Record<string, number>;
  
  rollbackOf?: string; // ID of original execution if this is a rollback
}

// Test utilities for migration framework

export class MigrationTestUtils {
  
  /**
   * Create mock migration context
   */
  static createMockContext(overrides: Partial<MigrationContext> = {}): MigrationContext {
    return {
      migrationId: 'test_migration_123',
      environment: 'development',
      dryRun: true,
      backupEnabled: false,
      eventBus: new EventBus(),
      storage: null,
      logger: { log: () => {}, warn: () => {}, error: () => {} },
      completedSteps: [],
      currentStep: null,
      startTime: new Date(),
      config: {},
      flags: {},
      ...overrides
    };
  }

  /**
   * Create mock migration step
   */
  static createMockStep(overrides: Partial<MigrationStep> = {}): MigrationStep {
    return {
      id: 'test_step_123',
      name: 'Test Step',
      description: 'A test migration step',
      phase: {
        name: 'Foundation',
        order: 1,
        description: 'Test phase',
        riskLevel: 'low',
        rollbackStrategy: 'automatic'
      },
      dependencies: [],
      reversible: true,
      estimatedDuration: 10,
      preChecks: [],
      postChecks: [],
      execute: async () => ({
        success: true,
        stepId: 'test_step_123',
        duration: 10,
        affectedEntities: 0,
        warnings: [],
        errors: [],
        metrics: {}
      }),
      ...overrides
    };
  }

  /**
   * Assert migration result
   */
  static assertMigrationSuccess(result: MigrationResult): void {
    if (!result.success) {
      throw new Error(`Migration failed: ${result.errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Mock storage for testing
   */
  static createMockStorage(): any {
    const data = new Map<string, any>();
    
    return {
      create: async (entity: any) => {
        const id = entity.id || `entity_${Date.now()}`;
        entity.id = id;
        entity.createdAt = new Date();
        entity.updatedAt = new Date();
        data.set(id, entity);
        return entity;
      },
      
      read: async (id: string) => {
        return data.get(id) || null;
      },
      
      update: async (id: string, updates: any) => {
        const existing = data.get(id);
        if (!existing) throw new Error(`Entity not found: ${id}`);
        
        const updated = { ...existing, ...updates, updatedAt: new Date() };
        data.set(id, updated);
        return updated;
      },
      
      delete: async (id: string) => {
        return data.delete(id);
      },
      
      query: async (query: any) => {
        const results = Array.from(data.values());
        return {
          data: results,
          total: results.length,
          hasMore: false,
          metadata: { query, executionTime: 1, fromCache: false }
        };
      }
    };
  }
}