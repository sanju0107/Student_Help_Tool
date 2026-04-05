/**
 * Example: Refactored ReducePDF using Service Architecture
 * This demonstrates how to migrate to the new services
 */

import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Minimize2, Download, AlertCircle, Info, CheckCircle2, Zap, Loader2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { validatePDFFileUpload, getFirstError } from '../lib';
import { TOOLS } from '../constants';

// NEW: Import the service hook
import { usePDFCompression } from '../hooks/useService';

export default function ReducePDF() {
  const toolData = TOOLS.find(t => t.id === 'reduce-pdf')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, faqItems } = toolData;

  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/pdf/reduce'
  });

  // State management
  const [file, setFile] = React.useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = React.useState<'low' | 'medium' | 'high'>('medium');

  // NEW: Use the service hook instead of manual state management
  const { data: result, loading: isProcessing, error, progress, execute, reset } = usePDFCompression({
    onProgress: (update) => {
      console.log(`${update.stage}: ${update.percentage}%`);
    },
  });

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validation = validatePDFFileUpload(selectedFile);

    if (!validation.valid) {
      // Show error - hook handles this via error state
      return;
    }
    setFile(selectedFile);
    reset(); // Clear previous result
  }, [reset]);

  // NEW: Simplified process function
  const processReduce = useCallback(async () => {
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();

    // NEW: Simply call execute from the hook
    await execute(arrayBuffer, compressionLevel);

    // Check if compression actually happened
    if (!result && !isProcessing) {
      console.log('No compression result');
      return;
    }

    // Show celebration only if significant compression occurred
    if (result && result.ratio >= 5) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });
    }
  }, [file, compressionLevel, execute, result, isProcessing]);

  const handleDownload = useCallback(() => {
    if (!result?.blob) return;

    const url = result.url || URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-${file?.name || 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    if (!result.url) {
      URL.revokeObjectURL(url);
    }
  }, [result, file]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Helmet>
        <title>{seoData.meta.title}</title>
        <meta name="description" content={seoData.meta.description} />
        <meta name="keywords" content={seoData.meta.keywords.join(', ')} />
        <meta property="og:title" content={seoData.meta.title} />
        <meta property="og:description" content={seoData.meta.description} />
      </Helmet>

      <ToolHeader
        icon={Minimize2}
        title={title}
        description={description}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* File Upload Section */}
          <ToolCard>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Select PDF to Compress
              </h3>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf"
                isProcessing={isProcessing}
              />
            </div>
          </ToolCard>

          {/* Compression Options */}
          {file && (
            <ToolCard>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Compression Level</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setCompressionLevel(level)}
                      disabled={isProcessing}
                      className={`px-4 py-2 rounded transition ${
                        compressionLevel === level
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      } disabled:opacity-50`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </ToolCard>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-400">Compression Failed</h4>
                <p className="text-red-300 text-sm">{error.message}</p>
              </div>
            </motion.div>
          )}

          {/* Processing State */}
          {isProcessing && progress && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-900/20 border border-blue-700 rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <div>
                  <h4 className="font-semibold text-blue-400">{progress.stage}</h4>
                  {progress.message && (
                    <p className="text-blue-300 text-sm">{progress.message}</p>
                  )}
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-blue-300 text-sm mt-2 text-right">
                {progress.percentage}%
              </p>
            </motion.div>
          )}

          {/* Result Display */}
          <AnimatePresence>
            {result && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-900/20 border border-green-700 rounded-lg p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <div>
                    <h4 className="font-semibold text-green-400">Compression Successful!</h4>
                    <p className="text-green-300 text-sm">
                      Reduced by {result.ratio}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Original</p>
                    <p className="font-semibold text-white">{result.originalFormatted}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Compressed</p>
                    <p className="font-semibold text-white">{result.compressedFormatted}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Saved</p>
                    <p className="font-semibold text-green-400">
                      {(result.originalSize - result.compressedSize) / 1024 / 1024 > 0
                        ? `${((result.originalSize - result.compressedSize) / 1024 / 1024).toFixed(2)} MB`
                        : `${((result.originalSize - result.compressedSize) / 1024).toFixed(2)} KB`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Compressed PDF
                  </button>
                  <button
                    onClick={() => {
                      reset();
                      setFile(null);
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Process Another File
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Process Button */}
          {file && !result && (
            <button
              onClick={processReduce}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Compress PDF
                </>
              )}
            </button>
          )}

          {/* Related Tools and FAQ */}
          <RelatedTools currentToolId="reduce-pdf" />
          {faqItems && faqItems.length > 0 && <FAQ items={faqItems} />}
        </div>
      </div>
    </div>
  );
}
