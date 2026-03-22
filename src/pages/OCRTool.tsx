import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Loader2, 
  Image as ImageIcon, 
  Languages,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
  ArrowRight
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { motion, AnimatePresence } from 'motion/react';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import { TOOLS } from '../constants';
import confetti from 'canvas-confetti';

export default function OCRTool() {
  const toolData = TOOLS.find(t => t.id === 'ocr-tool')!;
  const { name: title, description, longDescription } = toolData;

  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setFileName(file.name);
      setText('');
      setError(null);
      setProgress(0);
      setStatus('');
    };
    reader.readAsDataURL(file);
  };

  const performOCR = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setStatus('Initializing OCR engine...');

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatus('Extracting text...');
          } else {
            setStatus(m.status.charAt(0).toUpperCase() + m.status.slice(1));
          }
        },
      });

      const { data: { text } } = await worker.recognize(image);
      setText(text);
      await worker.terminate();
      setStatus('Completed');
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });
    } catch (err) {
      console.error(err);
      setError('Failed to extract text from image. Please try again with a clearer image.');
    } finally {
      setIsProcessing(false);
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
    link.download = `extracted-text-${fileName?.split('.')[0] || 'result'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setImage(null);
    setFileName(null);
    setText('');
    setIsProcessing(false);
    setProgress(0);
    setStatus('');
    setError(null);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{title} - Extract Text from Images | CareerSuite</title>
        <meta name="description" content={description + " Free online OCR tool to extract text from images and screenshots. Fast, accurate, and completely free."} />
        <meta name="keywords" content="image to text, ocr online free, extract text from image, screenshot to text, online ocr tool, image to editable text" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <ToolHeader 
            title={title}
            description={description}
            icon={Languages}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Upload Section */}
            <div className="space-y-8">
              <ToolCard>
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onFileClear={reset}
                  previewUrl={image}
                  fileName={fileName || undefined}
                  isProcessing={isProcessing}
                  status={status}
                  progress={progress}
                  label="Upload Image for OCR"
                  subLabel="Supports JPG, PNG, WEBP"
                />

                {!text && image && !isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10"
                  >
                    <button 
                      onClick={performOCR}
                      className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
                    >
                      <RefreshCw className="h-6 w-6" />
                      Extract Text Now
                    </button>
                  </motion.div>
                )}
              </ToolCard>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 rounded-3xl bg-red-50 p-6 text-red-600 border border-red-100"
                >
                  <AlertCircle className="h-6 w-6 shrink-0" />
                  <p className="font-black text-lg">{error}</p>
                </motion.div>
              )}

              <ToolCard className="prose prose-slate max-w-none">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">How it works</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      Our OCR (Optical Character Recognition) tool uses Tesseract.js to process images directly in your browser. 
                      It analyzes the shapes of characters in your image and converts them into editable text. 
                      For best results, ensure the image is clear and the text is well-lit.
                    </p>
                  </div>
                </div>
              </ToolCard>
            </div>

            {/* Result Section */}
            <div className="flex flex-col space-y-8">
              <ToolCard className="flex-1 flex flex-col h-full min-h-[500px]">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Extracted Text</h2>
                  <AnimatePresence>
                    {text && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex gap-3"
                      >
                        <button 
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600 border border-slate-100"
                          title="Copy to clipboard"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                        <button 
                          onClick={downloadText}
                          className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600 border border-slate-100"
                          title="Download as .txt"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex-1 relative rounded-[1.5rem] bg-slate-50 p-8 text-base text-slate-700 border border-slate-100 shadow-inner overflow-hidden">
                  {text ? (
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="h-full w-full resize-none bg-transparent font-sans focus:outline-none leading-relaxed font-medium"
                      placeholder="Extracted text will appear here..."
                    />
                  ) : isProcessing ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-6 text-slate-400">
                      <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                      <p className="font-black text-lg tracking-tight">{status}</p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center space-y-6 text-slate-400">
                      <div className="rounded-full bg-slate-100 p-8">
                        <FileText className="h-16 w-16" />
                      </div>
                      <p className="text-center max-w-[250px] font-black text-lg tracking-tight">Upload an image and click extract to see the text here.</p>
                    </div>
                  )}
                </div>
              </ToolCard>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ToolStep 
                  number={1} 
                  title="Upload Image" 
                  description="Select a clear image containing text."
                  icon={ImageIcon}
                />
                <ToolStep 
                  number={2} 
                  title="Extract" 
                  description="AI reads and converts image to text."
                  icon={Zap}
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-32">
            <h2 className="mb-16 text-4xl font-black text-slate-900 text-center tracking-tight">Why use our OCR Tool?</h2>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-2xl font-black text-slate-900 tracking-tight">Screenshot to Text</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Quickly convert screenshots of code, documents, or websites into editable text without manual typing.</p>
              </div>
              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-2xl font-black text-slate-900 tracking-tight">100% Secure</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Processing happens directly in your browser. Your images are never sent to a server, ensuring total privacy.</p>
              </div>
              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <RefreshCw className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-2xl font-black text-slate-900 tracking-tight">Fast & Accurate</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Powered by Tesseract.js, providing high-speed text extraction with professional accuracy levels.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

