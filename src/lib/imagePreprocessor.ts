/**
 * Image Preprocessor - Resize, compress, and validate images
 * Optimizes large images before processing to prevent failures and improve speed
 */

export interface PreprocessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface PreproceededImage {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  originalSize: number;
}

/**
 * Resize and compress image for optimal processing
 * Default: max 1024px width, quality 0.8 (80%)
 */
export async function preprocessImage(
  file: File,
  options: PreprocessOptions = {}
): Promise<PreproceededImage> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = async () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          const ratio = width / height;

          if (width > maxWidth) {
            width = maxWidth;
            height = width / ratio;
          }
          if (height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Unable to get canvas context');

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) throw new Error('Failed to create image blob');

              const dataUrl = canvas.toDataURL(format, quality);

              resolve({
                blob,
                dataUrl,
                width,
                height,
                size: blob.size,
                originalSize: file.size,
              });
            },
            format,
            quality
          );
        } catch (error) {
          reject(new Error(`Image preprocessing failed: ${error}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert image to grayscale for better OCR performance
 */
export function convertToGrayscale(imageData: ImageData): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;      // Red
    data[i + 1] = avg;  // Green
    data[i + 2] = avg;  // Blue
    // data[i + 3] - Alpha unchanged
  }

  return imageData;
}

/**
 * Enhance image contrast for better OCR
 */
export function enhanceContrast(imageData: ImageData, factor: number = 1.5): ImageData {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, (data[i] - 128) * factor + 128);      // Red
    data[i + 1] = Math.min(255, (data[i + 1] - 128) * factor + 128); // Green
    data[i + 2] = Math.min(255, (data[i + 2] - 128) * factor + 128); // Blue
  }

  return imageData;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
