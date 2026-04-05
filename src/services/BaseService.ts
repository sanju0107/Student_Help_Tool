/**
 * Base Service Class
 * Provides common functionality for all services
 */

import { IService, ServiceResult, ServiceConfig, ProgressCallback, TrackableOperation } from './types';

export abstract class BaseService implements IService {
  abstract name: string;
  abstract version: string;

  protected initialized = false;
  protected operations: Map<string, TrackableOperation> = new Map();

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    this.operations.clear();
    this.initialized = false;
  }

  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Execute an operation with tracking
   */
  protected async executeOperation<T>(
    operationId: string,
    operationType: string,
    operation: () => Promise<T>,
    config: ServiceConfig = {},
    onProgress?: ProgressCallback
  ): Promise<ServiceResult<T>> {
    const startTime = Date.now();
    const trackable: TrackableOperation<T> = {
      id: operationId,
      type: operationType,
      status: 'running',
      progress: { stage: 'starting', percentage: 0 },
      createdAt: startTime,
      startedAt: startTime,
    };

    this.operations.set(operationId, trackable);

    try {
      // Set timeout if specified
      const timeoutMs = config.timeout || 300000; // Default 5 minutes
      const timeoutPromise = new Promise<T>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Operation timeout after ${timeoutMs}ms`)),
          timeoutMs
        );
      });

      const resultPromise = operation();
      const result = await Promise.race([resultPromise, timeoutPromise]);

      trackable.status = 'completed';
      trackable.progress = { stage: 'completed', percentage: 100 };
      trackable.completedAt = Date.now();

      const serviceResult: ServiceResult<T> = {
        success: true,
        data: result,
        metadata: {
          duration: Date.now() - startTime,
          timestamp: Date.now(),
          operationId,
        },
      };

      trackable.result = serviceResult;
      return serviceResult;
    } catch (error) {
      trackable.status = 'failed';
      trackable.error = error instanceof Error ? error : new Error(String(error));
      trackable.completedAt = Date.now();

      return {
        success: false,
        error: {
          code: 'OPERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        metadata: {
          duration: Date.now() - startTime,
          timestamp: Date.now(),
          operationId,
        },
      };
    } finally {
      // Keep operation history for some time
      setTimeout(() => {
        this.operations.delete(operationId);
      }, 60000); // Keep for 1 minute
    }
  }

  /**
   * Update operation progress
   */
  protected updateProgress(operationId: string, stage: string, percentage: number, message?: string) {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.progress = { stage, percentage, message };
    }
  }

  /**
   * Get operation status
   */
  getOperationStatus(operationId: string): TrackableOperation | undefined {
    return this.operations.get(operationId);
  }

  /**
   * Retry operation with exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    config: ServiceConfig = {}
  ): Promise<T> {
    const maxAttempts = config.retryAttempts || 3;
    const baseDelay = config.retryDelay || 1000;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxAttempts - 1) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Generate unique operation ID
   */
  protected generateOperationId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default BaseService;
