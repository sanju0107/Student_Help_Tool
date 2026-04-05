/**
 * Service Architecture - Type Definitions
 * Core interfaces for all service operations
 */

/**
 * Represents a result from a service operation
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    duration: number;
    timestamp: number;
    operationId: string;
  };
}

/**
 * Configuration for a service operation
 */
export interface ServiceConfig {
  timeout?: number; // in milliseconds
  retryAttempts?: number;
  retryDelay?: number; // in milliseconds
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

/**
 * Progress callback for long-running operations
 */
export interface ProgressCallback {
  (progress: ProgressUpdate): void;
}

export interface ProgressUpdate {
  stage: string;
  percentage: number;
  message?: string;
  estimatedRemaining?: number; // milliseconds
}

/**
 * Operation that can be tracked
 */
export interface TrackableOperation<T = any> {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: ProgressUpdate;
  result?: ServiceResult<T>;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: Error;
}

/**
 * Job queue item for background processing
 */
export interface QueuedJob<T = any> {
  id: string;
  operationType: string;
  payload: T;
  config: ServiceConfig;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  attempt: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: Error;
  onProgress?: ProgressCallback;
  result?: ServiceResult<any>;
}

/**
 * Service interface that all services should implement
 */
export interface IService {
  name: string;
  version: string;
  isReady(): boolean;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

/**
 * Batch operation result
 */
export interface BatchResult<T> {
  successful: T[];
  failed: Array<{ input: any; error: Error }>;
  total: number;
  successCount: number;
  failureCount: number;
}
