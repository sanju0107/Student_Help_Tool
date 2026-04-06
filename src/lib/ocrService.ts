/**
 * OCR Service - Optimized Text Extraction
 * Using Tesseract.js with proper worker management and image preprocessing
 */

import { createWorker, Worker } from 'tesseract.js';
import { preprocessImage, PreproceededImage, convertToGrayscale, enhanceContrast } from './imagePreprocessor';

export interface OCRResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
  processTime: number;
}

export interface OCROptions {
  language?: string;
  onProgress?: (progress: number, status: string) => void;
  maxRetries?: number;
  enhanceImage?: boolean;
}

/**
 * Global worker instance (reuse to avoid initialization overhead)
 */
let globalWorker: Worker | null = null;
let workerInitPromise: Promise<Worker> | null = null;

/**
 * Get or create OCR worker (reuses existing worker)
 */
async function getOCRWorker(language: string = 'eng'): Promise<Worker> {
  // Return global worker if already initialized
  if (globalWorker) {
    return globalWorker;
  }

  // If initialization is in progress, wait for it
  if (workerInitPromise) {
    return workerInitPromise;
  }

  // Create new worker
  workerInitPromise = (async () => {
    try {
      const worker = await createWorker(language, 1, {
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@4.0.0-canary.0/'
      });
      globalWorker = worker;
      workerInitPromise = null;
      return worker;
    } catch (error) {
      console.error('Failed to initialize OCR worker', error);
      workerInitPromise = null;
      throw new Error('Failed to initialize OCR engine');
    }
  })();

  return workerInitPromise;
}

/**
 * Preprocess image for OCR optimization
 */
function preprocessForOCR(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Unable to get canvas context');

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Convert to grayscale for better OCR
        imageData = convertToGrayscale(imageData);

        // Enhance contrast
        imageData = enhanceContrast(imageData, 1.3);

        // Put processed image back
        ctx.putImageData(imageData, 0, 0);

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (error) {
        reject(new Error(`Image preprocessing failed: ${error}`));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for OCR'));
    };

    img.src = dataUrl;
  });
}

/**
 * Extract text from image using OCR with proper error handling
 */
export async function extractTextFromImage(
  imageDataUrl: string,
  options: OCROptions = {}
): Promise<OCRResult> {
  const startTime = Date.now();
  const {
    language = 'eng',
    onProgress = () => {},
    maxRetries = 1,
    enhanceImage = true
  } = options;

  try {
    // Step 1: Validate input
    if (!imageDataUrl) {
      return {
        text: '',
        confidence: 0,
        success: false,
        error: 'No image provided',
        processTime: Date.now() - startTime
      };
    }

    onProgress(10, 'Initializing OCR engine...');

    // Step 2: Get or create OCR worker
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const worker = await getOCRWorker(language);

        onProgress(20, 'Preparing image...');

        // Step 3: Preprocess image for better OCR performance
        let processedImage = imageDataUrl;
        if (enhanceImage) {
          try {
            processedImage = await preprocessForOCR(imageDataUrl);
          } catch (error) {
            console.warn('Image preprocessing failed, using original:', error);
          }
        }

        onProgress(30, 'Recognizing text...');

        // Step 4: Perform OCR with progress tracking
        const result = await worker.recognize(processedImage);

        onProgress(95, 'Processing results...');

        const extractedText = result.data.text.trim();
        const confidence = result.data.confidence || 0;

        // Step 5: Validate results
        if (!extractedText) {
          return {
            text: '',
            confidence: 0,
            success: false,
            error: 'No text found in image. Try with a clearer image or check the text is visible.',
            processTime: Date.now() - startTime
          };
        }

        onProgress(100, 'Complete');

        return {
          text: extractedText,
          confidence,
          success: true,
          processTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`OCR attempt ${attempt + 1} failed:`, lastError);

        if (attempt < maxRetries) {
          onProgress(30, `Processing failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // All retries failed
    const message = lastError?.message || 'OCR processing failed';
    return {
      text: '',
      confidence: 0,
      success: false,
      error: `Text extraction failed: ${message}. Please try with a clearer image.`,
      processTime: Date.now() - startTime
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      text: '',
      confidence: 0,
      success: false,
      error: `Error: ${message}`,
      processTime: Date.now() - startTime
    };
  }
}

/**
 * Terminate OCR worker and free memory
 */
export async function terminateOCRWorker(): Promise<void> {
  if (globalWorker) {
    try {
      await globalWorker.terminate();
      globalWorker = null;
      workerInitPromise = null;
    } catch (error) {
      console.error('Failed to terminate OCR worker:', error);
    }
  }
}

/**
 * Get worker status
 */
export function isOCRWorkerReady(): boolean {
  return globalWorker !== null;
}
