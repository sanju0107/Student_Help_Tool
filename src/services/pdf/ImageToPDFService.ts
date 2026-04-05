/**
 * Image to PDF Service
 * Handles conversion of images to PDF documents
 */

import { BaseService } from '../BaseService';
import { ServiceConfig, ServiceResult, ProgressCallback } from '../types';
import { imagesToPDF as utilImagesToPDF, formatFileSize } from '../../lib/pdfUtils';

export interface ImageToPDFOptions extends ServiceConfig {
  pageSize?: 'A4' | 'Letter' | 'fit';
  margin?: number; // in millimeters
}

export interface ImageToPDFResult {
  blob: Blob;
  pageCount: number;
  size: number;
  sizeFormatted: string;
  metadata?: {
    pageSize?: string;
    margin?: number;
  };
}

export class ImageToPDFService extends BaseService {
  name = 'ImageToPDFService';
  version = '1.0.0';

  /**
   * Convert images to a PDF document
   */
  async imagesToPDF(
    imageFiles: File[],
    options: ImageToPDFOptions = {},
    onProgress?: ProgressCallback
  ): Promise<ServiceResult<ImageToPDFResult>> {
    const operationId = this.generateOperationId('images-to-pdf');

    const operation = async (): Promise<ImageToPDFResult> => {
      this.updateProgress(operationId, 'validating', 5, 'Validating images');
      onProgress?.({ stage: 'validating', percentage: 5, message: 'Validating images' });

      // Validate that we have image files
      const validImages = imageFiles.filter(file =>
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      );

      if (validImages.length === 0) {
        throw new Error('No valid images provided. Supported formats: JPG, PNG, WebP');
      }

      const pageSize = options.pageSize || 'A4';
      const margin = options.margin || 10;

      this.updateProgress(operationId, 'converting', 20, `Converting ${validImages.length} image(s)`);
      onProgress?.({
        stage: 'converting',
        percentage: 20,
        message: `Converting ${validImages.length} image(s) to PDF`,
      });

      // Process images with progress tracking
      const processedImages: File[] = [];
      for (let i = 0; i < validImages.length; i++) {
        const progress = 20 + (i / validImages.length) * 70;
        this.updateProgress(operationId, `processing_image_${i + 1}`, Math.round(progress), `Processing image ${i + 1}`);
        onProgress?.({
          stage: `image_${i + 1}`,
          percentage: Math.round(progress),
          message: `Processing image ${i + 1} of ${validImages.length}`,
        });

        processedImages.push(validImages[i]);
      }

      this.updateProgress(operationId, 'creating_pdf', 90, 'Creating PDF');
      onProgress?.({ stage: 'creating_pdf', percentage: 90, message: 'Creating PDF document' });

      const { blob, pageCount } = await utilImagesToPDF(processedImages, pageSize, margin);

      this.updateProgress(operationId, 'finalizing', 95, 'Finalizing document');
      onProgress?.({ stage: 'finalizing', percentage: 95, message: 'Finalizing document' });

      return {
        blob,
        pageCount,
        size: blob.size,
        sizeFormatted: formatFileSize(blob.size).formatted,
        metadata: {
          pageSize,
          margin,
        },
      };
    };

    return this.executeOperation(operationId, 'images_to_pdf', operation, options, onProgress);
  }

  /**
   * Convert single image to PDF
   */
  async imageToPDF(
    imageFile: File,
    options: ImageToPDFOptions = {},
    onProgress?: ProgressCallback
  ): Promise<ServiceResult<ImageToPDFResult>> {
    return this.imagesToPDF([imageFile], options, onProgress);
  }

  /**
   * Batch convert multiple sets of images to separate PDFs
   */
  async imageSetsToPDFBatch(
    imageSets: File[][],
    options: ImageToPDFOptions = {},
    onProgress?: ProgressCallback
  ): Promise<ServiceResult<ImageToPDFResult[]>> {
    const operationId = this.generateOperationId('images-to-pdf-batch');

    const operation = async (): Promise<ImageToPDFResult[]> => {
      const results: ImageToPDFResult[] = [];
      const totalSets = imageSets.length;

      for (let setIndex = 0; setIndex < totalSets; setIndex++) {
        const imageSet = imageSets[setIndex];
        const progress = Math.round((setIndex / totalSets) * 100);

        this.updateProgress(
          operationId,
          `processing_set_${setIndex + 1}`,
          progress,
          `Processing image set ${setIndex + 1} of ${totalSets}`
        );
        onProgress?.({
          stage: `set_${setIndex + 1}`,
          percentage: progress,
          message: `Processing ${imageSet.length} images (set ${setIndex + 1})`,
        });

        try {
          const result = await utilImagesToPDF(imageSet, options.pageSize || 'A4', options.margin || 10);
          results.push({
            blob: result.blob,
            pageCount: result.pageCount,
            size: result.blob.size,
            sizeFormatted: formatFileSize(result.blob.size).formatted,
            metadata: {
              pageSize: options.pageSize,
              margin: options.margin,
            },
          });
        } catch (error) {
          console.error(`Failed to convert image set ${setIndex + 1}:`, error);
          throw error;
        }
      }

      return results;
    };

    return this.executeOperation(operationId, 'images_to_pdf_batch', operation, options, onProgress);
  }

  /**
   * Get supported image formats
   */
  getSupportedFormats(): string[] {
    return ['image/jpeg', 'image/png', 'image/webp'];
  }

  /**
   * Get supported page sizes
   */
  getSupportedPageSizes(): Array<{ label: string; value: 'A4' | 'Letter' | 'fit' }> {
    return [
      { label: 'A4', value: 'A4' },
      { label: 'Letter', value: 'Letter' },
      { label: 'Fit to Image', value: 'fit' },
    ];
  }
}

export const imageToPDFService = new ImageToPDFService();

export default ImageToPDFService;
