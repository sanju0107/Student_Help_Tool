/**
 * PDF Services Index
 * Central export for all PDF-related services
 */

export { PDFCompressionService, pdfCompressionService } from './PDFCompressionService';
export type { PDFCompressionOptions, CompressionResult } from './PDFCompressionService';

export { PDFConversionService, pdfConversionService } from './PDFConversionService';
export type { ConversionResult } from './PDFConversionService';

export { ImageToPDFService, imageToPDFService } from './ImageToPDFService';
export type { ImageToPDFOptions, ImageToPDFResult } from './ImageToPDFService';

/**
 * Initialize all PDF services
 */
export async function initializePDFServices(): Promise<void> {
  const { pdfCompressionService } = await import('./PDFCompressionService');
  const { pdfConversionService } = await import('./PDFConversionService');
  const { imageToPDFService } = await import('./ImageToPDFService');

  await Promise.all([
    pdfCompressionService.initialize(),
    pdfConversionService.initialize(),
    imageToPDFService.initialize(),
  ]);
}

/**
 * Shutdown all PDF services
 */
export async function shutdownPDFServices(): Promise<void> {
  const { pdfCompressionService } = await import('./PDFCompressionService');
  const { pdfConversionService } = await import('./PDFConversionService');
  const { imageToPDFService } = await import('./ImageToPDFService');

  await Promise.all([
    pdfCompressionService.shutdown(),
    pdfConversionService.shutdown(),
    imageToPDFService.shutdown(),
  ]);
}
