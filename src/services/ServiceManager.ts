/**
 * Service Manager
 * Central manager for all services and task queue
 */

import { IService } from './types';
import { TaskQueue, TaskQueueConfig } from './TaskQueue';
import { initializePDFServices, shutdownPDFServices } from './pdf';

export class ServiceManager {
  private services: Map<string, IService> = new Map();
  private taskQueue: TaskQueue;
  private initialized = false;

  constructor(taskQueueConfig: TaskQueueConfig = {}) {
    this.taskQueue = new TaskQueue(taskQueueConfig);
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('ServiceManager is already initialized');
      return;
    }

    try {
      // Initialize PDF services
      await initializePDFServices();

      // Register PDF service executors with task queue
      await this.registerPDFExecutors();

      this.initialized = true;
      console.log('ServiceManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ServiceManager:', error);
      throw error;
    }
  }

  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      this.taskQueue.pause();
      await shutdownPDFServices();
      this.initialized = false;
      console.log('ServiceManager shutdown successfully');
    } catch (error) {
      console.error('Error during ServiceManager shutdown:', error);
      throw error;
    }
  }

  /**
   * Register PDF service executors
   */
  private async registerPDFExecutors(): Promise<void> {
    const { pdfCompressionService } = await import('./pdf/PDFCompressionService');
    const { pdfConversionService } = await import('./pdf/PDFConversionService');
    const { imageToPDFService } = await import('./pdf/ImageToPDFService');

    // Register compression executor
    this.taskQueue.registerExecutor('pdf.compress', async (payload: any) => {
      const result = await pdfCompressionService.compress(payload.buffer, payload.options);
      if (!result.success) throw result.error;
      return result.data;
    });

    // Register Word to PDF executor
    this.taskQueue.registerExecutor('pdf.wordToPdf', async (payload: any) => {
      const result = await pdfConversionService.wordToPDF(payload.file, payload.options);
      if (!result.success) throw result.error;
      return result.data;
    });

    // Register PDF to Word executor
    this.taskQueue.registerExecutor('pdf.pdfToWord', async (payload: any) => {
      const result = await pdfConversionService.pdfToWord(payload.buffer, payload.options);
      if (!result.success) throw result.error;
      return result.data;
    });

    // Register images to PDF executor
    this.taskQueue.registerExecutor('pdf.imagesToPdf', async (payload: any) => {
      const result = await imageToPDFService.imagesToPDF(payload.files, payload.options);
      if (!result.success) throw result.error;
      return result.data;
    });
  }

  /**
   * Get task queue
   */
  getTaskQueue(): TaskQueue {
    return this.taskQueue;
  }

  /**
   * Check if service manager is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get service by name
   */
  getService(name: string): IService | undefined {
    return this.services.get(name);
  }

  /**
   * Register a custom service
   */
  registerService(service: IService): void {
    this.services.set(service.name, service);
  }
}

/**
 * Global service manager instance
 */
export const globalServiceManager = new ServiceManager({
  maxConcurrent: 3,
  maxQueueSize: 1000,
  autoProcessQueue: true,
});

/**
 * Initialize global service manager
 */
export async function initializeServices(): Promise<void> {
  await globalServiceManager.initialize();
}

/**
 * Shutdown global service manager
 */
export async function shutdownServices(): Promise<void> {
  await globalServiceManager.shutdown();
}

export default ServiceManager;
