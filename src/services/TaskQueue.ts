/**
 * Task Queue Manager
 * Manages queuing and background processing of operations
 */

import { QueuedJob, ServiceConfig, ProgressCallback, BatchResult } from './types';

export interface TaskQueueConfig {
  maxConcurrent?: number;
  maxQueueSize?: number;
  autoProcessQueue?: boolean;
}

export interface TaskQueueStats {
  totalProcessed: number;
  totalFailed: number;
  queueLength: number;
  processingCount: number;
  averageProcessingTime: number;
}

export type TaskExecutor<T> = (payload: any, onProgress?: ProgressCallback) => Promise<T>;

export class TaskQueue {
  private queue: Map<string, QueuedJob> = new Map();
  private executing: Map<string, QueuedJob> = new Map();
  private completed: Map<string, QueuedJob> = new Map();
  private failed: Map<string, QueuedJob> = new Map();
  private executors: Map<string, TaskExecutor<any>> = new Map();

  private maxConcurrent: number;
  private maxQueueSize: number;
  private autoProcess: boolean;

  private stats = {
    totalProcessed: 0,
    totalFailed: 0,
    processingTimes: [] as number[],
  };

  constructor(config: TaskQueueConfig = {}) {
    this.maxConcurrent = config.maxConcurrent || 3;
    this.maxQueueSize = config.maxQueueSize || 1000;
    this.autoProcess = config.autoProcessQueue !== false;
  }

  /**
   * Register a task executor for a specific operation type
   */
  registerExecutor<T>(operationType: string, executor: TaskExecutor<T>): void {
    this.executors.set(operationType, executor);
  }

  /**
   * Queue a new job
   */
  async queueJob<T>(
    operationType: string,
    payload: T,
    config: ServiceConfig = {},
    onProgress?: ProgressCallback
  ): Promise<string> {
    if (this.queue.size >= this.maxQueueSize) {
      throw new Error(`Task queue is full (max: ${this.maxQueueSize})`);
    }

    const jobId = this.generateJobId();
    const job: QueuedJob = {
      id: jobId,
      operationType,
      payload,
      config,
      status: 'queued',
      priority: config.priority || 'normal',
      attempt: 0,
      createdAt: Date.now(),
      onProgress,
    };

    this.queue.set(jobId, job);

    if (this.autoProcess) {
      this.processQueue().catch(error => {
        console.error('Queue processing error:', error);
      });
    }

    return jobId;
  }

  /**
   * Process the queue
   */
  async processQueue(): Promise<void> {
    while (this.executing.size < this.maxConcurrent && this.queue.size > 0) {
      // Get next job (prioritize by priority, then FIFO)
      let nextJob: QueuedJob | null = null;

      // Check for high priority jobs first
      for (const [, job] of this.queue) {
        if (job.priority === 'high') {
          nextJob = job;
          this.queue.delete(job.id);
          break;
        }
      }

      // Check for normal priority jobs
      if (!nextJob) {
        for (const [, job] of this.queue) {
          if (job.priority === 'normal') {
            nextJob = job;
            this.queue.delete(job.id);
            break;
          }
        }
      }

      // Check for low priority jobs
      if (!nextJob) {
        for (const [, job] of this.queue) {
          if (job.priority === 'low') {
            nextJob = job;
            this.queue.delete(job.id);
            break;
          }
        }
      }

      if (!nextJob) break;

      this.executing.set(nextJob.id, nextJob);
      nextJob.status = 'processing';
      nextJob.startedAt = Date.now();

      this.executeJob(nextJob).catch(error => {
        console.error(`Job ${nextJob!.id} failed:`, error);
      });
    }
  }

  /**
   * Execute a single job
   */
  private async executeJob(job: QueuedJob): Promise<void> {
    try {
      const executor = this.executors.get(job.operationType);
      if (!executor) {
        throw new Error(`No executor registered for operation type: ${job.operationType}`);
      }

      const startTime = Date.now();

      try {
        const result = await executor(job.payload, job.onProgress);
        job.result = {
          success: true,
          data: result,
          metadata: {
            duration: Date.now() - startTime,
            timestamp: Date.now(),
            operationId: job.id,
          },
        };

        job.status = 'completed';
        job.completedAt = Date.now();

        // Track stats
        this.stats.totalProcessed++;
        this.stats.processingTimes.push(Date.now() - startTime);
      } catch (error) {
        const duration = Date.now() - startTime;
        job.error = error instanceof Error ? error : new Error(String(error));

        // Retry logic
        const maxRetries = job.config.retryAttempts || 3;
        if (job.attempt < maxRetries) {
          job.attempt++;
          job.status = 'queued';
          this.queue.set(job.id, job);
        } else {
          job.status = 'failed';
          job.completedAt = Date.now();
          this.stats.totalFailed++;
        }
      }

      this.executing.delete(job.id);

      if (job.status === 'completed') {
        this.completed.set(job.id, job);
      } else if (job.status === 'failed') {
        this.failed.set(job.id, job);
      }

      // Process next job
      this.processQueue().catch(error => {
        console.error('Queue processing error:', error);
      });
    } catch (error) {
      console.error(`Unexpected error processing job ${job.id}:`, error);
      this.executing.delete(job.id);
      job.status = 'failed';
      job.error = error instanceof Error ? error : new Error(String(error));
      job.completedAt = Date.now();
      this.failed.set(job.id, job);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): QueuedJob | null {
    return this.queue.get(jobId) || this.executing.get(jobId) || this.completed.get(jobId) || this.failed.get(jobId) || null;
  }

  /**
   * Wait for job completion
   */
  async waitForJob<T>(jobId: string, timeout: number = 300000): Promise<T> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const job = this.getJobStatus(jobId);

      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (job.status === 'completed') {
        return job.result?.data as T;
      }

      if (job.status === 'failed') {
        throw job.error || new Error('Job failed');
      }

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Job ${jobId} timeout after ${timeout}ms`);
  }

  /**
   * Cancel a queued job
   */
  cancelJob(jobId: string): boolean {
    const job = this.queue.get(jobId);
    if (job) {
      this.queue.delete(jobId);
      return true;
    }
    return false;
  }

  /**
   * Get queue statistics
   */
  getStats(): TaskQueueStats {
    const avgTime = this.stats.processingTimes.length > 0
      ? this.stats.processingTimes.reduce((a, b) => a + b, 0) / this.stats.processingTimes.length
      : 0;

    return {
      totalProcessed: this.stats.totalProcessed,
      totalFailed: this.stats.totalFailed,
      queueLength: this.queue.size,
      processingCount: this.executing.size,
      averageProcessingTime: Math.round(avgTime),
    };
  }

  /**
   * Clear completed and failed jobs
   */
  clearHistory(): void {
    this.completed.clear();
    this.failed.clear();
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.autoProcess = false;
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.autoProcess = true;
    this.processQueue().catch(error => {
      console.error('Queue processing error:', error);
    });
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global task queue instance
 */
export const globalTaskQueue = new TaskQueue({
  maxConcurrent: 3,
  maxQueueSize: 1000,
  autoProcessQueue: true,
});

export default TaskQueue;
