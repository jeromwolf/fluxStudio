'use client';

import { ExportPlugin, ExportContext, ExportResult } from './base-plugin';

export interface RegisteredPlugin {
  plugin: ExportPlugin;
  enabled: boolean;
  priority: number;
}

export interface ExportJob {
  id: string;
  plugin: ExportPlugin;
  context: ExportContext;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: number;
  endTime?: number;
  result?: ExportResult;
  error?: string;
  progress: number;
}

export class ExportPluginRegistry {
  private plugins: Map<string, RegisteredPlugin> = new Map();
  private jobs: Map<string, ExportJob> = new Map();
  private jobQueue: string[] = [];
  private isProcessing = false;
  private maxConcurrentJobs = 1;

  /**
   * Register an export plugin
   */
  register(plugin: ExportPlugin, priority: number = 0): void {
    this.plugins.set(plugin.id, {
      plugin,
      enabled: plugin.isSupported(),
      priority,
    });
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): boolean {
    return this.plugins.delete(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): ExportPlugin[] {
    return Array.from(this.plugins.values())
      .filter((p) => p.enabled)
      .sort((a, b) => b.priority - a.priority)
      .map((p) => p.plugin);
  }

  /**
   * Get plugin by ID
   */
  getPlugin(id: string): ExportPlugin | null {
    const registered = this.plugins.get(id);
    return registered?.enabled ? registered.plugin : null;
  }

  /**
   * Get plugins by category
   */
  getPluginsByCategory(category: string): ExportPlugin[] {
    return this.getPlugins().filter((p) => p.category === category);
  }

  /**
   * Enable/disable a plugin
   */
  setPluginEnabled(pluginId: string, enabled: boolean): void {
    const registered = this.plugins.get(pluginId);
    if (registered) {
      registered.enabled = enabled && registered.plugin.isSupported();
    }
  }

  /**
   * Create an export job
   */
  createJob(pluginId: string, context: ExportContext): string {
    const plugin = this.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found or disabled: ${pluginId}`);
    }

    const jobId = this.generateJobId();
    const job: ExportJob = {
      id: jobId,
      plugin,
      context,
      status: 'pending',
      progress: 0,
    };

    this.jobs.set(jobId, job);
    this.jobQueue.push(jobId);

    // Start processing if not already running
    this.processQueue();

    return jobId;
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'running') {
      job.plugin.cancel();
    }

    job.status = 'cancelled';
    job.endTime = Date.now();

    // Remove from queue if pending
    const queueIndex = this.jobQueue.indexOf(jobId);
    if (queueIndex !== -1) {
      this.jobQueue.splice(queueIndex, 1);
    }

    return true;
  }

  /**
   * Get job status
   */
  getJob(jobId: string): ExportJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all jobs
   */
  getJobs(): ExportJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: ExportJob['status']): ExportJob[] {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  /**
   * Clear completed/failed jobs
   */
  clearCompletedJobs(): void {
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        this.jobs.delete(jobId);
      }
    }
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.jobQueue.length === 0) return;

    this.isProcessing = true;

    try {
      while (this.jobQueue.length > 0) {
        const runningJobs = this.getJobsByStatus('running');
        if (runningJobs.length >= this.maxConcurrentJobs) {
          // Wait for a job to complete
          await this.waitForJobCompletion();
          continue;
        }

        const jobId = this.jobQueue.shift();
        if (!jobId) continue;

        const job = this.jobs.get(jobId);
        if (!job || job.status !== 'pending') continue;

        // Start the job
        this.executeJob(job);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Execute a single job
   */
  private async executeJob(job: ExportJob): Promise<void> {
    job.status = 'running';
    job.startTime = Date.now();

    // Set up progress callback
    const originalOnProgress = job.context.onProgress;
    job.context.onProgress = (progress) => {
      job.progress = progress.progress;
      originalOnProgress?.(progress);
    };

    // Set up completion callback
    const originalOnComplete = job.context.onComplete;
    job.context.onComplete = (result) => {
      job.status = 'completed';
      job.endTime = Date.now();
      job.result = result;
      job.progress = 1;
      originalOnComplete?.(result);
    };

    // Set up error callback
    const originalOnError = job.context.onError;
    job.context.onError = (error) => {
      job.status = 'failed';
      job.endTime = Date.now();
      job.error = error;
      originalOnError?.(error);
    };

    try {
      const result = await job.plugin.export(job.context);

      if (job.status === 'running') {
        job.status = 'completed';
        job.endTime = Date.now();
        job.result = result;
        job.progress = 1;
        originalOnComplete?.(result);
      }
    } catch (error) {
      if (job.status === 'running') {
        job.status = 'failed';
        job.endTime = Date.now();
        job.error = error instanceof Error ? error.message : String(error);
        originalOnError?.(job.error);
      }
    }
  }

  /**
   * Wait for at least one running job to complete
   */
  private async waitForJobCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const runningJobs = this.getJobsByStatus('running');
        if (runningJobs.length < this.maxConcurrentJobs) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Generate a unique job ID
   */
  private generateJobId(): string {
    return `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set maximum concurrent jobs
   */
  setMaxConcurrentJobs(max: number): void {
    this.maxConcurrentJobs = Math.max(1, max);
  }

  /**
   * Get export statistics
   */
  getStats(): {
    totalJobs: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      totalJobs: jobs.length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      running: jobs.filter((j) => j.status === 'running').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      cancelled: jobs.filter((j) => j.status === 'cancelled').length,
    };
  }
}

// Global registry instance
export const exportRegistry = new ExportPluginRegistry();
