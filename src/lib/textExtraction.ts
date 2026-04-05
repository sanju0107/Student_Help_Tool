/**
 * Text extraction utilities for PDF, DOCX, and TXT files
 * Provides safe extraction with clear error messages
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker with reliable CDN fallback
// Uses jsdelivr CDN which is production-ready and handles versioning properly
const initializeWorker = () => {
  try {
    // First try: Use a reliable CDN for the exact version
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.error('Failed to initialize PDF worker:', e);
    // Fallback will be handled in the extraction function
  }
};

initializeWorker();

/**
 * Extracts text from a PDF file
 * Returns extracted text or an empty string if extraction fails
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Configure PDF.js with minimal external dependencies
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: false,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    }).promise;
    
    if (!pdf || pdf.numPages === 0) {
      throw new Error('PDF has no pages');
    }
    
    let fullText = '';
    let successPages = 0;
    
    for (let i = 0; i < pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();
        
        // Properly extract text from items, filtering for actual text items
        const pageText = textContent.items
          .map((item: any) => {
            // Only extract from items that have str property (text items)
            if (item && typeof item === 'object' && 'str' in item) {
              return item.str;
            }
            return '';
          })
          .filter((text: string) => text.trim())
          .join(' ');
        
        if (pageText.trim()) {
          fullText += pageText + '\n';
          successPages++;
        }
      } catch (pageError) {
        // Log but continue - page might be image-only or corrupted
        console.debug(`Debug: Page ${i + 1} extraction details available if needed`);
        continue;
      }
    }
    
    // Check if we extracted any text
    if (!fullText.trim()) {
      throw new Error('Unable to extract text from this PDF. It may be a scanned image, encrypted, or in an unsupported format. Try uploading a text-based PDF or paste the content directly.');
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unable to read the PDF file. Please try another file.';
    throw new Error(errorMessage);
  }
}

/**
 * Extracts text from a DOCX file
 * Uses simple regex parsing as browser-compatible alternative
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // DOCX is a ZIP file containing XML
    // For browser compatibility, we'll parse the text elements
    const uint8Array = new Uint8Array(arrayBuffer);
    let text = '';
    
    // Simple extraction: look for <w:t> tags which contain text in DOCX
    const decoder = new TextDecoder();
    const xmlString = decoder.decode(uint8Array);
    
    // Extract text from word document.xml content
    const matches = xmlString.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (matches) {
      matches.forEach(match => {
        const textMatch = match.match(/>([^<]*)</);
        if (textMatch) {
          text += textMatch[1] + ' ';
        }
      });
    }
    
    if (!text.trim()) {
      throw new Error('No text found in DOCX file');
    }
    
    return text.trim();
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX. Please try a simpler file or upload as TXT.');
  }
}

/**
 * Extracts text from a TXT file
 */
export async function extractTextFromTXT(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    console.error('TXT extraction error:', error);
    throw new Error('Failed to extract text from TXT file.');
  }
}

/**
 * Main function to extract text from any supported format
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (fileName.endsWith('.docx')) {
    return extractTextFromDOCX(file);
  } else if (fileName.endsWith('.txt')) {
    return extractTextFromTXT(file);
  } else {
    throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
  }
}

/**
 * Validates a resume has minimum content length
 */
export function validateResumeLength(text: string, minLength: number = 100): { valid: boolean; message: string } {
  const trimmedText = text.trim();
  
  if (!trimmedText) {
    return { valid: false, message: 'Resume is empty. Please enter text or upload a file.' };
  }
  
  if (trimmedText.length < minLength) {
    return { valid: false, message: `Resume is too short (${trimmedText.length} characters). Please add more content.` };
  }
  
  return { valid: true, message: 'Resume text is valid.' };
}
