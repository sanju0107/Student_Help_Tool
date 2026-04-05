/**
 * PDF Compression Service
 * Handles compression and optimization of PDF files
 */

import { BaseService } from '../BaseService';
import { ServiceConfig, ServiceResult, ProgressCallback } from '../types';
import {
  compressPDF as utilCompressPDF,
  calculateCompressionRatio,
  formatFileSize,
} from '../../lib/pdfUtils';

export interface PDFCompressionOptions extends ServiceConfig {
  quality?: 'low' | 'medium' | 'high';
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  originalFormatted: string;
  compressedFormatted: string;
}

export class PDFCompressionService extends BaseService {
  name = 'PDFCompressionService';
  version = '1.0.0';

  /**
   * Compress a PDF file
   * @param pdfArrayBuffer PDF file as ArrayBuffer
   * @param options Compression options
   * @param onProgress Progress callback
   */
  async compress(
    pdfArrayBuffer: ArrayBuffer,
    options: PDFCompressionOptions = {},
    onProgress?: ProgressCallback
  ): Promise<ServiceResult<CompressionResult>> {
    const operationId = this.generateOperationId('pdf-compress');

    const operation = async (): Promise<CompressionResult> => {
      this.updateProgress(operationId, 'validating', 5, 'Validating PDF');
      onProgress?.({ stage: 'validating', percentage: 5, message: 'Validating PDF' });

      if (!pdfArrayBuffer || pdfArrayBuffer.byteLength === 0) {
        throw new Error('Invalid PDF: Empty file');
      }

      this.updateProgress(operationId, 'compressing', 20);
      onProgress?.({ stage: 'compressing', percentage: 20, message: 'Compressing PDF' });

      const quality = options.quality || 'medium';
      const { blob, originalSize, compressedSize, ratio } = await utilCompressPDF(
        pdfArrayBuffer,
        quality
      );

      this.updateProgress(operationId, 'formatting', 90);
      onProgress?.({ stage: 'formatting', percentage: 90, message: 'Preparing result' });

      return {
        blob,
        originalSize,
        compressedSize,
        ratio,
        originalFormatted: formatFileSize(originalSize).formatted,
        compressedFormatted: formatFileSize(compressedSize).formatted,
      };
    };

    return this.executeOperation(operationId, 'compress_pdf', operation, options, onProgress);
  }

  /**
   * Batch compress multiple PDFs
   */
  async compressBatch(
    files: File[],
    options: PDFCompressionOptions = {},
    onProgress?: ProgressCallback
  ): Promise<ServiceResult<CompressionResult[]>> {
    const operationId = this.generateOperationId('pdf-compress-batch');

    const operation = async (): Promise<CompressionResult[]> => {
      const results: CompressionResult[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const progress = Math.round((i / totalFiles) * 100);

        this.updateProgress(operationId, `compressing_file_${i + 1}`, progress, `Processing file ${i + 1} of ${totalFiles}`);
        onProgress?.({
          stage: `file_${i + 1}`,
          percentage: progress,
          message: `Compressing ${file.name}`,
        });

        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await utilCompressPDF(arrayBuffer, options.quality || 'medium');
          results.push({
            blob: result.blob,
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            ratio: result.ratio,
            originalFormatted: formatFileSize(result.originalSize).formatted,
            compressedFormatted: formatFileSize(result.compressedSize).formatted,
          });
        } catch (error) {
          console.error(`Failed to compress ${file.name}:`, error);
          throw error;
        }
      }

      return results;
    };

    return this.executeOperation(operationId, 'compress_pdf_batch', operation, options, onProgress);
  }

  /**
   * Get compression statistics
   */
  getCompressionStats(result: CompressionResult) {
    return {
      reduction: calculateCompressionRatio(result.originalSize, result.compressedSize),
      percentage: `${result.ratio}%`,
      originalSize: result.originalFormatted,
      compressedSize: result.compressedFormatted,
      canCompress: result.ratio > 0,
    };
  }
}

export const pdfCompressionService = new PDFCompressionService();

export default PDFCompressionService;
