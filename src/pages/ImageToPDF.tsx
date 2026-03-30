import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  Info,
  CheckCircle2,
  Loader2,
  RotateCcw,
  GripVertical,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';
import { imagesToPDF, formatFileSize } from '../lib/pdfUtils';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export default function ImageToPDF() {
  const toolData = TOOLS.find(t => t.id === 'image-to-pdf')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, faqItems } = toolData;

  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/pdf/image-to-pdf'
  });

  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'fit'>('A4');
  const [margin, setMargin] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; filename: string; fileSize: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setError('Please select only JPG, PNG, or WEBP images.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const newImage: ImageFile = {
        id: Math.random().toString(36).substr(2, 9),
        file: selectedFile,
        preview,
      };
      setImages(prev => [...prev, newImage]);
      setError(null);
      setResult(null);
    };
    reader.readAsDataURL(selectedFile);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('Please add at least one image.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { blob, pageCount } = await imagesToPDF(
        images.map(img => img.file),
        pageSize,
        margin
      );

      const url = URL.createObjectURL(blob);
      const fileSize = formatFileSize(blob.size).formatted;

      setResult({
        url,
        filename: `images_to_pdf_${Date.now()}.pdf`,
        fileSize,
      });

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setImages([]);
    setResult(null);
    setError(null);
    setPageSize('A4');
    setMargin(10);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{title} - Convert Images to PDF Online | CareerSuite</title>
        <meta name="description" content={description + " Convert JPG, PNG, and WEBP images to PDF with custom page sizes and margins."} />
        <meta name="keywords" content="image to pdf, convert images to pdf, jpg to pdf, png to pdf, webp to pdf, free pdf converter" />
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
                {!result ? (
                  <div className="space-y-8">
                    {/* Image Upload Section */}
                    <div>
                      <label className="block mb-3 font-black text-slate-900 text-sm uppercase tracking-widest">
                        Add Images
                      </label>
                      <FileUpload 
                        onFileSelect={handleFileSelect}
                        label="Click to upload or drag & drop"
                        subLabel="Supported: JPG, PNG, WEBP (up to 50MB per image)"
                        accept=".jpg,.jpeg,.png,.webp"
                      />
                    </div>

                    {/* Image List */}
                    {images.length > 0 && (
                      <div className="space-y-4">
                        <label className="block font-black text-slate-900 text-sm uppercase tracking-widest">
                          Images ({images.length})
                        </label>
                        <Reorder.Group
                          axis="y"
                          values={images}
                          onReorder={setImages}
                          className="space-y-3"
                        >
                          {images.map((image, index) => (
                            <Reorder.Item
                              key={image.id}
                              value={image}
                              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 cursor-move hover:shadow-md transition-all"
                            >
                              <GripVertical className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                              <img
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                className="h-20 w-20 rounded-lg object-cover border border-slate-100"
                              />
                              <div className="flex-1">
                                <p className="font-bold text-slate-900 truncate">{image.file.name}</p>
                                <p className="text-xs text-slate-500">{formatFileSize(image.file.size).formatted}</p>
                              </div>
                              <button
                                onClick={() => removeImage(image.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      </div>
                    )}

                    {/* Settings */}
                    {images.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <Settings className="h-5 w-5 text-slate-600" />
                          <h3 className="font-black text-slate-900 uppercase tracking-widest">PDF Settings</h3>
                        </div>

                        {/* Page Size */}
                        <div>
                          <label className="block mb-3 font-bold text-slate-900 text-sm">Page Size</label>
                          <div className="grid grid-cols-3 gap-3">
                            {(['A4', 'Letter', 'fit'] as const).map((size) => (
                              <button
                                key={size}
                                onClick={() => setPageSize(size)}
                                className={`py-3 px-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-all ${
                                  pageSize === size
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                                }`}
                              >
                                {size === 'fit' ? 'Fit' : size}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            {pageSize === 'fit' 
                              ? 'Page size adjusts to fit each image (no cropping)'
                              : pageSize === 'A4'
                              ? '210x297mm - Standard international size'
                              : '215.9x279.4mm - Standard US Letter size'}
                          </p>
                        </div>

                        {/* Margin */}
                        <div>
                          <label className="block mb-3 font-bold text-slate-900 text-sm">
                            Margin: {margin}mm
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={margin}
                            onChange={(e) => setMargin(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>No margin (0mm)</span>
                            <span>Large margin (50mm)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                        <button
                          onClick={handleConvert}
                          disabled={isProcessing}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Creating PDF...
                            </>
                          ) : (
                            <>
                              <Download className="h-5 w-5" />
                              Convert to PDF
                            </>
                          )}
                        </button>
                        {!isProcessing && (
                          <button onClick={reset} className="btn-secondary px-10 py-5 text-xl">
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2.5rem] bg-emerald-50 p-10 text-center border border-emerald-100 space-y-8"
                  >
                    <div>
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                        <CheckCircle2 className="h-12 w-12" />
                      </div>
                      <h3 className="mb-3 text-3xl font-black text-emerald-900 tracking-tight">Conversion Complete!</h3>
                      <div className="space-y-3">
                        <p className="text-emerald-700 font-medium">
                          {images.length} image{images.length !== 1 ? 's' : ''} converted to PDF successfully.
                        </p>
                        <div className="inline-block rounded-lg bg-emerald-100 px-4 py-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">File Size</p>
                          <p className="text-2xl font-black text-emerald-600">{result.fileSize}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <a
                        href={result.url}
                        download={result.filename}
                        className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                      >
                        <Download className="h-6 w-6" />
                        Download PDF
                      </a>
                      <button onClick={reset} className="btn-secondary px-10 py-5 text-xl">
                        Convert More
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
                  <div className="text-left">
                    <p className="font-black text-lg">{error}</p>
                  </div>
                </motion.div>
              )}

              <ToolCard className="prose prose-slate max-w-none">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">How It Works</h3>
                    <div className="text-slate-600 leading-relaxed font-medium space-y-3">
                      <p>
                        This tool combines multiple images into a single PDF document with customizable page sizes and margins.
                      </p>
                      <ul className="list-disc list-inside space-y-2">
                        <li><strong>Drag to reorder:</strong> Arrange images before conversion</li>
                        <li><strong>Page size:</strong> Choose A4, Letter, or fit-to-image</li>
                        <li><strong>Margins:</strong> Add space around images (0-50mm)</li>
                        <li><strong>Quality:</strong> Image quality is preserved during conversion</li>
                      </ul>
                      <p className="text-xs text-slate-500 pt-2">
                        100% browser-based processing. Your images are never uploaded anywhere.
                      </p>
                    </div>
                  </div>
                </div>
              </ToolCard>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-black tracking-tight">Perfect For:</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Document Scans</p>
                      <p className="text-xs text-slate-400 mt-1">Combine multiple page scans into one PDF</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Photos & Screenshots</p>
                      <p className="text-xs text-slate-400 mt-1">Create PDF albums from images</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">100% Private</p>
                      <p className="text-xs text-slate-400 mt-1">Processing happens on your device only</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Upload Images" 
                  description="Add JPG, PNG, or WEBP images"
                  icon={Plus}
                />
                <ToolStep 
                  number={2} 
                  title="Configure" 
                  description="Choose page size and margins"
                  icon={Settings}
                />
                <ToolStep 
                  number={3} 
                  title="Convert" 
                  description="Create your PDF in seconds"
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
