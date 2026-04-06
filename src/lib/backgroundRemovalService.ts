/**
 * Background Removal Service - Optimized and reliable
 * Handles model initialization, retries, and error recovery
 */

import { removeBackground, Config } from '@imgly/background-removal';
import { preprocessImage, PreproceededImage } from './imagePreprocessor';

export interface RemovalResult {
  blob: Blob;
  url: string;
  success: boolean;
  error?: string;
}

export interface RemovalOptions {
  maxRetries?: number;
  onProgress?: (progress: number, stage: string) => void;
  maxImageWidth?: number;
  quality?: number;
}

/**
 * Global model initialization flag
 */
let modelInitialized = false;
let modelInitializationPromise: Promise<void> | null = null;

/**
 * Initialize the background removal model
 * This ensures the model is loaded before processing
 */
async function ensureModelInitialized(): Promise<void> {
  if (modelInitialized) return;

  // If initialization is in progress, wait for it
  if (modelInitializationPromise) {
    return modelInitializationPromise;
  }

  modelInitializationPromise = (async () => {
    try {
      // Pre-load the model by processing a tiny transparent PNG
      const tinyBlob = new Blob(
        [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84, 8, 211, 99, 248, 15, 0, 0, 1, 1, 0, 5, 181, 206, 86, 73, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])],
        { type: 'image/png' }
      );

      // This triggers model loading
      await removeBackground(tinyBlob);
      modelInitialized = true;
    } catch (error) {
      console.error('Failed to initialize background removal model', error);
      modelInitializationPromise = null;
      throw new Error('Failed to load background removal model. Please try again.');
    }
  })();

  return modelInitializationPromise;
}

/**
 * Remove background from an image with retry logic
 */
export async function removeImageBackground(
  file: File,
  options: RemovalOptions = {}
): Promise<RemovalResult> {
  const {
    maxRetries = 2,
    onProgress = () => {},
    maxImageWidth = 1024,
    quality = 0.8
  } = options;

  try {
    // Validate input
    if (!file) {
      return {
        blob: new Blob(),
        url: '',
        success: false,
        error: 'No file provided'
      };
    }

    if (!file.type.startsWith('image/')) {
      return {
        blob: new Blob(),
        url: '',
        success: false,
        error: 'Invalid file format. Please upload an image.'
      };
    }

    // Step 1: Ensure model is loaded
    onProgress(10, 'Loading AI model...');
    await ensureModelInitialized();
    onProgress(15, 'Model ready');

    // Step 2: Preprocess image (resize, compress)
    onProgress(20, 'Preprocessing image...');
    let preprocessed: PreproceededImage;

    try {
      preprocessed = await preprocessImage(file, {
        maxWidth: maxImageWidth,
        quality
      });
    } catch (error) {
      return {
        blob: new Blob(),
        url: '',
        success: false,
        error: 'Failed to process image. It may be corrupted or in an unsupported format.'
      };
    }

    onProgress(30, 'Image ready for processing');

    // Step 3: Remove background with retry logic
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        onProgress(30 + (attempt * 20), `Processing... (attempt ${attempt + 1})`);

        const config: Config = {
          progress: (key, current, total) => {
            const baseProgress = 30 + (attempt * 20);
            const progressInPhase = Math.round((current / total) * 20);
            const totalProgress = Math.min(95, baseProgress + progressInPhase);
            onProgress(totalProgress, 'Removing background...');
          },
          model: 'isnet',
          output: {
            format: 'image/png',
            quality: 0.8,
          }
        };

        // Use the preprocessed blob for processing
        const resultBlob = await removeBackground(preprocessed.blob, config);

        onProgress(100, 'Complete');

        return {
          blob: resultBlob,
          url: URL.createObjectURL(resultBlob),
          success: true
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Attempt ${attempt + 1} failed:`, lastError);

        if (attempt < maxRetries) {
          onProgress(30 + (attempt * 20), `Processing failed, retrying...`);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // All retries failed
    return {
      blob: new Blob(),
      url: '',
      success: false,
      error: `Background removal failed after ${maxRetries + 1} attempts. The image may be too complex or the model encountered an error. Please try with a different image.`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      blob: new Blob(),
      url: '',
      success: false,
      error: `Error: ${message}`
    };
  }
}

/**
 * Reset model state (useful for clearing memory)
 */
export function resetModel(): void {
  modelInitialized = false;
  modelInitializationPromise = null;
}
