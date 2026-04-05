/**
 * PDF Conversion Service
 * Handles conversions between PDF and other formats (Word, etc.)
 */

import { BaseService } from '../BaseService';
import { ServiceConfig, ServiceResult, ProgressCallback } from '../types';
import {
  convertWordToPDF as utilConvertWordToPDF,
  convertPDFToWord as utilConvertPDFToWord,
  isScannedPDF,
  formatFileSize,
} from '../../lib/pdfUtils';

export interface ConversionResult {
  blob: Blob;
  fileType: 'pdf' | 'docx';
  size: number;
  sizeFormatted: string;
  metadata?: {
    pages?: number;
    isScanned?: boolean;
    format?: string;
  };
}

export class PDFConversionService extends BaseService {
  name = 'PDFConversionService';
  version = '1.0.0';

  /**
   * Convert Word (.docx) document to PDF
   */
  async wordToPDF(
    wordFile: File,
    config: ServiceConfig = {},
    onProgress?: ProgressCallback
  ): Promise<ServiceResult<ConversionResult>> {
    const operationId = this.generateOperationId('word-to-pdf');

    const operation = async (): Promise<ConversionResult> => {
      this.updateProgress(operationId, 'validating', 10, 'Validating Word document');
      onProgress?.({ stage: 'validating', percentage: 10, message: 'Validating Word document' });

      if (!wordFile.name.endsWith('.docx')) {
        throw new Error('Invalid file: Only .docx files are supported');
      }

      this.updateProgress(operationId, 'parsing', 30, 'Parsing document');
      onProgress?.({ stage: 'parsing', percentage: 30, message: 'Parsing document content' });

      const blob = await utilConvertWordToPDF(wordFile);

      this.updateProgress(operationId, 'finalizing', 90, 'Finalizing PDF');
      onProgress?.({ stage: 'finalizing', percentage: 90, message: 'Finalizing conversion' });

      return {
        blob,
        fileType: 'pdf',
        size: blob.size,
        sizeFormatted: formatFileSize(blob.size).formatted,
        metadata: {
          format: 'PDF',
        },
      };
    };

    return this.executeOperation(operationId, 'word_to_pdf', operation, config, onProgress);
  }

  /**
   * Convert PDF to Word (.docx) document
   */
  async pdfToWord(
    pdfArrayBuffer: ArrayBuffer,
    config: ServiceConfig = {},
    onProgress?: ProgressCallback
  ): Promise<ServiceResult<ConversionResult>> {
    const operationId = this.generateOperationId('pdf-to-word');

    const operation = async (): Promise<ConversionResult> => {
      this.updateProgress(operationId, 'validating', 10, 'Validating PDF');
      onProgress?.({ stage: 'validating', percentage: 10, message: 'Validating PDF' });

      if (!pdfArrayBuffer || pdfArrayBuffer.byteLength === 0) {
        throw new Error('Invalid PDF: Empty file');
      }

      this.updateProgress(operationId, 'analyzing', 20, 'Analyzing PDF content');
      onProgress?.({ stage: 'analyzing', percentage: 20, message: 'Analyzing PDF content' });

      // Check if PDF is scanned (image-based)
      const scanned = await isScannedPDF(pdfArrayBuffer);

      this.updateProgress(operationId, 'converting', 40, 'Converting to Word format');
      onProgress?.({ stage: 'converting', percentage: 40, message: 'Converting document' });

      const blob = await utilConvertPDFToWord(pdfArrayBuffer);

      this.updateProgress(operationId, 'finalizing', 90, 'Finalizing document');
      onProgress?.({ stage: 'finalizing', percentage: 90, message: 'Finalizing conversion' });

      return {
        blob,
        fileType: 'docx',
        size: blob.size,
        sizeFormatted: formatFileSize(blob.size).formatted,
        metadata: {
          isScanned: scanned,
          format: 'Word Document (.docx)',
        },
      };
    };

    return this.executeOperation(operationId, 'pdf_to_word', operation, config, onProgress);
  }

  /**
   * Analyze PDF to determine conversion quality
   */
  async analyzePDF(
    pdfArrayBuffer: ArrayBuffer,
    config: ServiceConfig = {}
  ): Promise<ServiceResult<{ isScanned: boolean; quality: 'high' | 'medium' | 'low' }>> {
    const operationId = this.generateOperationId('pdf-analyze');

    const operation = async (): Promise<{ isScanned: boolean; quality: 'high' | 'medium' | 'low' }> => {
      this.updateProgress(operationId, 'analyzing', 50, 'Analyzing PDF');

      const isScanned = await isScannedPDF(pdfArrayBuffer);

      // Determine quality based on whether PDF is text-based
      const quality: 'high' | 'medium' | 'low' = isScanned ? 'low' : 'high';

      this.updateProgress(operationId, 'complete', 100, 'Analysis complete');

      return { isScanned, quality };
    };

    return this.executeOperation(operationId, 'analyze_pdf', operation, config);
  }

  /**
   * Batch convert multiple files
   */
  async convertBatch(
    files: File[],
    conversionType: 'word-to-pdf' | 'pdf-to-word',
    config: ServiceConfig = {},
    onProgress?: ProgressCallback
  ): Promise<ServiceResult<ConversionResult[]>> {
    const operationId = this.generateOperationId(`convert-batch-${conversionType}`);

    const operation = async (): Promise<ConversionResult[]> => {
      const results: ConversionResult[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const progress = Math.round((i / totalFiles) * 100);

        this.updateProgress(
          operationId,
          `converting_file_${i + 1}`,
          progress,
          `Converting file ${i + 1} of ${totalFiles}`
        );
        onProgress?.({
          stage: `file_${i + 1}`,
          percentage: progress,
          message: `Converting ${file.name}`,
        });

        try {
          let result: ConversionResult;

          if (conversionType === 'word-to-pdf') {
            const blob = await utilConvertWordToPDF(file);
            result = {
              blob,
              fileType: 'pdf',
              size: blob.size,
              sizeFormatted: formatFileSize(blob.size).formatted,
            };
          } else {
            const arrayBuffer = await file.arrayBuffer();
            const blob = await utilConvertPDFToWord(arrayBuffer);
            result = {
              blob,
              fileType: 'docx',
              size: blob.size,
              sizeFormatted: formatFileSize(blob.size).formatted,
            };
          }

          results.push(result);
        } catch (error) {
          console.error(`Failed to convert ${file.name}:`, error);
          throw error;
        }
      }

      return results;
    };

    return this.executeOperation(operationId, `convert_batch_${conversionType}`, operation, config, onProgress);
  }
}

export const pdfConversionService = new PDFConversionService();

export default PDFConversionService;
