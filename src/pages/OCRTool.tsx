import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Loader2, 
  Image as ImageIcon, 
  Languages,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { validateImageFileUpload, getFirstError, extractTextFromImage, formatFileSize } from '../lib';
import { TOOLS } from '../constants';
import confetti from 'canvas-confetti';

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
}

export default function OCRTool() {
  const toolData = TOOLS.find(t => t.id === 'ocr-tool')!;
  const { name: title, description, seoTitle, seoDescription, seoKeywords, intro, faqItems } = toolData;
  
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/ocr-tool'
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: ''
  });
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [processTime, setProcessTime] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateImageFileUpload(selectedFile);
    
    if (!validation.valid) {
      setError(getFirstError(validation) || 'Invalid image file');
      return;
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);

    setText('');
    setSuccess(false);
    setError(null);
    setProcessing({ isProcessing: false, progress: 0, stage: '' });
  };

  const performOCR = async () => {
    if (!file) return;

    setProcessing({ isProcessing: true, progress: 0, stage: 'Starting...' });
    setError(null);
    const startTime = performance.now();

    try {
      const result = await extractTextFromImage(file, {
        onProgress: (progress, stage) => {
          setProcessing({ isProcessing: true, progress, stage });
        }
      });

      if (!result.success) {
        setError(result.error || 'OCR extraction failed');
        setProcessing({ isProcessing: false, progress: 0, stage: '' });
        return;
      }

      if (!result.text || result.text.trim().length === 0) {
        setError('No text found in image. Please try with a clearer image.');
        setProcessing({ isProcessing: false, progress: 0, stage: '' });
        return;
      }

      setText(result.text);
      setSuccess(true);

      // Calculate process time
      const elapsed = (performance.now() - startTime) / 1000;
      setProcessTime(elapsed);

      // Celebration animation
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });

      setProcessing({ isProcessing: false, progress: 100, stage: 'Complete!' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to extract text: ${message}`);
      setProcessing({ isProcessing: false, progress: 0, stage: '' });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extracted-text-${file?.name.split('.')[0] || 'result'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setText('');
    setSuccess(false);
    setError(null);
    setProcessing({ isProcessing: false, progress: 0, stage: '' });
    setProcessTime(0);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{seoData.helmet.title}</title>
        {seoData.helmet.meta.map((meta, idx) => (
          <meta key={idx} {...meta} />
        ))}
        {seoData.helmet.link.map((link, idx) => (
          <link key={idx} {...link} />
        ))}
        <script type="application/ld+json">
          {JSON.stringify(seoData.structuredData)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-black text-slate-900 sm:text-5xl">
              {seoTitle}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
              {intro}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Upload Section */}
            <div className="space-y-8">
              <ToolCard>
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onFileClear={reset}
                  previewUrl={preview}
                  fileName={file?.name}
                  isProcessing={processing.isProcessing}
                  status={processing.stage}
                  progress={processing.progress}
                  label="Upload Image for Text Extraction"
                  subLabel="Supports JPG, PNG, WEBP (Max 10MB)"
                />

                <AnimatePresence>
                  {file && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-10 space-y-8"
                    >
                      {/* Processing Progress */}
                      {processing.isProcessing && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            <span className="text-sm font-semibold text-slate-600">{processing.stage}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full overflow-hidden h-2">
                            <motion.div 
                              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${processing.progress}%` }}
                              transition={{ ease: "easeInOut" }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 text-right">{processing.progress}%</p>
                        </motion.div>
                      )}

                      {/* Success State with Stats */}
                      {success && text && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-start gap-3 rounded-2xl bg-green-50 p-4 text-green-700 border border-green-200"
                        >
                          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm">Text extracted successfully!</p>
                            <p className="text-xs text-green-600 mt-1">
                              {text.split(' ').length} words • {text.length} characters • {processTime.toFixed(1)}s
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                        {!success ? (
                          <button
                            onClick={performOCR}
                            disabled={processing.isProcessing}
                            className="btn-primary flex-1 py-5 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing.isProcessing ? 'Processing...' : 'Extract Text'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={copyToClipboard}
                              className="btn-secondary px-6 py-5 text-lg font-semibold flex items-center justify-center gap-2"
                            >
                              {copied ? (
                                <>
                                  <Check className="h-5 w-5 text-green-600" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-5 w-5" />
                                  Copy
                                </>
                              )}
                            </button>
                            <button
                              onClick={downloadText}
                              className="btn-secondary px-6 py-5 text-lg font-semibold flex items-center justify-center gap-2"
                            >
                              <Download className="h-5 w-5" />
                              Download
                            </button>
                          </>
                        )}
                        <button
                          onClick={reset}
                          disabled={processing.isProcessing}
                          className="btn-secondary px-8 py-5 text-lg font-semibold disabled:opacity-50"
                        >
                          Clear
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ToolCard>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-start gap-4 rounded-2xl bg-red-50 p-6 text-red-600 border border-red-200"
                  >
                    <AlertCircle className="h-6 w-6 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Error</p>
                      <p className="text-sm leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* How It Works */}
              <ToolCard>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">How it works</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Our OCR (Optical Character Recognition) tool uses advanced neural networks powered by Tesseract.js to extract text from images. 
                      The image is preprocessed for optimal recognition, then analyzed character-by-character. 
                      All processing happens securely in your browser – your images are never uploaded to any server.
                    </p>
                  </div>
                </div>
              </ToolCard>
            </div>

            {/* Result Section */}
            <div className="flex flex-col space-y-8">
              <ToolCard className="flex-1 flex flex-col h-full min-h-[500px]">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Extracted Text</h2>
                  <AnimatePresence>
                    {text && success && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg"
                      >
                        {text.split(' ').length} words
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex-1 relative rounded-[1.5rem] bg-slate-50 p-8 border border-slate-100 shadow-inner overflow-hidden">
                  {text && success ? (
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="h-full w-full resize-none bg-transparent text-base text-slate-700 font-medium focus:outline-none leading-relaxed"
                      placeholder="Extracted text will appear here..."
                    />
                  ) : processing.isProcessing ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-6 text-slate-400">
                      <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                      <div className="text-center">
                        <p className="font-bold text-lg text-slate-600 mb-2">{processing.stage}</p>
                        <p className="text-sm text-slate-500">{processing.progress}% complete</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center space-y-6 text-slate-400">
                      <div className="rounded-full bg-slate-100 p-8">
                        <FileText className="h-16 w-16" />
                      </div>
                      <p className="text-center max-w-[250px] font-semibold text-base">
                        Upload an image and click "Extract Text" to see recognized text here.
                      </p>
                    </div>
                  )}
                </div>
              </ToolCard>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ToolStep 
                  number={1} 
                  title="Upload" 
                  description="Choose a clear image with readable text."
                  icon={ImageIcon}
                />
                <ToolStep 
                  number={2} 
                  title="Extract" 
                  description="Neural networks recognize and convert text."
                  icon={Zap}
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-32">
            <h2 className="mb-16 text-4xl font-black text-slate-900 text-center">Why use our OCR Tool?</h2>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-slate-900">Fast Extraction</h3>
                <p className="text-slate-600 leading-relaxed text-sm">Optimized image preprocessing and neural networks ensure rapid, accurate text recognition in seconds.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-slate-900">100% Secure</h3>
                <p className="text-slate-600 leading-relaxed text-sm">Processing happens entirely in your browser. Your images are never sent to any server.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Languages className="h-7 w-7" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-slate-900">High Accuracy</h3>
                <p className="text-slate-600 leading-relaxed text-sm">Powered by Tesseract.js, providing professional-grade OCR accuracy for most document types.</p>
              </div>
            </div>
          </div>

          {/* FAQ & Related */}
          <div className="mt-20 space-y-12">
            {faqItems && <FAQ items={faqItems} />}
            <RelatedTools currentToolId="ocr-tool" />
          </div>
        </div>
      </div>
    </div>
  );
}

