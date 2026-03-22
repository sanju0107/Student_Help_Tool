import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Download, 
  ImageIcon, 
  Zap,
  ShieldCheck,
  ArrowRight,
  Info,
  AlertCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import imageCompression from 'browser-image-compression';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';

import { TOOLS } from '../constants';

export default function ImageCompressor() {
  const toolData = TOOLS.find(t => t.id === 'image-compressor')!;
  const { name: title, description, longDescription } = toolData;
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setProcessedFile(null);
    setProcessedPreview(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const options = {
        maxSizeMB: file.size / (1024 * 1024),
        maxWidthOrHeight: undefined,
        useWebWorker: true,
        initialQuality: quality,
      };

      const compressed = await imageCompression(file, options);
      setProcessedFile(compressed);
      setProcessedPreview(URL.createObjectURL(compressed));
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });
    } catch (err) {
      setError('Failed to compress image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedFile) return;
    const url = URL.createObjectURL(processedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-${file?.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setProcessedFile(null);
    setProcessedPreview(null);
    setError(null);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{title} - Free Online Image Compression | StudentToolBox</title>
        <meta name="description" content={description + " Compress images without losing quality. Fast, secure, and free online tool for students."} />
        <meta name="keywords" content="image compressor, reduce image size, online image compression, free photo compressor, kb reducer, optimize images for web" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <ToolHeader 
            title={title}
            description={description}
            icon={ImageIcon}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onFileClear={reset}
                  previewUrl={processedPreview || preview}
                  fileName={file?.name}
                  isProcessing={isProcessing}
                  status="Compressing..."
                  progress={isProcessing ? 70 : 100}
                  label="Upload Image to Compress"
                  subLabel="Supports JPG, PNG, WEBP"
                />

                {file && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 space-y-8"
                  >
                    <div className="rounded-[2.5rem] bg-slate-50 p-10 border border-slate-100">
                      <div className="mb-8 flex items-center justify-between">
                        <label className="text-xl font-black text-slate-900 tracking-tight">Compression Quality: <span className="text-blue-600">{Math.round(quality * 100)}%</span></label>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Adjust for size</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="1" 
                        step="0.05"
                        value={quality} 
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                      />
                      <div className="mt-6 flex justify-between text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span>Small Size</span>
                        <span>Best Quality</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Original Size</p>
                        <p className="text-3xl font-black text-slate-900">{formatSize(file.size)}</p>
                      </div>
                      <div className="rounded-[2rem] border-2 border-blue-100 bg-blue-50/50 p-8 text-center shadow-sm">
                        <p className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Compressed Size</p>
                        <p className="text-3xl font-black text-blue-600">
                          {processedFile ? formatSize(processedFile.size) : '---'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {!processedFile ? (
                        <button
                          onClick={handleProcess}
                          disabled={isProcessing}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-6 w-6 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Zap className="h-6 w-6" />
                              Compress Image Now
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleDownload}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                        >
                          <Download className="h-6 w-6" /> Download Compressed Image
                        </button>
                      )}
                      <button
                        onClick={reset}
                        className="btn-secondary px-12 py-5 text-xl flex items-center gap-3"
                      >
                        <RotateCcw className="h-5 w-5" />
                        Reset
                      </button>
                    </div>
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

              {longDescription && (
                <ToolCard className="prose prose-slate max-w-none">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <Info className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-3">How it works</h3>
                      <p className="text-slate-600 leading-relaxed font-medium">{longDescription}</p>
                    </div>
                  </div>
                </ToolCard>
              )}
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-black tracking-tight">Why use this?</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">100% Secure. All processing happens locally in your browser. Your files never leave your device.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Zap className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">Fast compression without losing much quality.</p>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Upload" 
                  description="Select the image you want to compress from your device."
                  icon={ImageIcon}
                />
                <ToolStep 
                  number={2} 
                  title="Adjust" 
                  description="Use the slider to balance between file size and image quality."
                  icon={Zap}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get your optimized image instantly in high quality."
                  icon={Download}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
