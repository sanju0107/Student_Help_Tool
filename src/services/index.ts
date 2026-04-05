/**
 * Services Index
 * Central export for all service modules
 */

// Core types and utilities
export * from './types';
export { BaseService } from './BaseService';
export { TaskQueue, globalTaskQueue } from './TaskQueue';
export type { TaskQueueConfig, TaskQueueStats } from './TaskQueue';

// Service manager
export { ServiceManager, globalServiceManager, initializeServices, shutdownServices } from './ServiceManager';

// PDF services
export * from './pdf';
export { pdfCompressionService } from './pdf/PDFCompressionService';
export { pdfConversionService } from './pdf/PDFConversionService';
export { imageToPDFService } from './pdf/ImageToPDFService';

/**
 * Quick reference for commonly used services
 */
export const Services = {
  PDF: {
    compression: async () => (await import('./pdf')).pdfCompressionService,
    conversion: async () => (await import('./pdf')).pdfConversionService,
    imagesToPdf: async () => (await import('./pdf')).imageToPDFService,
  },
  TaskQueue: async () => (await import('./TaskQueue')).globalTaskQueue,
  Manager: async () => (await import('./ServiceManager')).globalServiceManager,
};
