import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  FileStack, 
  Info, 
  GripVertical, 
  Loader2, 
  RotateCcw,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { PDFDocument } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import { TOOLS } from '../constants';

export default function MergePDF() {
  const toolData = TOOLS.find(t => t.id === 'merge-pdf')!;
  const { name: title, description, longDescription } = toolData;
  
  interface FileWithId {
    id: string;
    file: File;
  }

  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const handleFilesSelect = (selectedFiles: FileList) => {
    const newFiles = Array.from(selectedFiles)
      .filter(f => f.type === 'application/pdf')
      .map(f => ({ id: Math.random().toString(36).substr(2, 9), file: f }));
    
    if (newFiles.length === 0) {
      setError('Please select only PDF files.');
      return;
    }
    setFiles(prev => [...prev, ...newFiles]);
    setSuccess(false);
    setMergedPdfUrl(null);
    setError(null);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select only PDF files.');
      return;
    }
    setFiles(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), file: selectedFile }]);
    setSuccess(false);
    setMergedPdfUrl(null);
    setError(null);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setSuccess(false);
    setMergedPdfUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least two PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setMergedPdfUrl(url);
      setSuccess(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7', '#10b981', '#f59e0b']
      });
    } catch (err) {
      setError('Failed to merge PDF files. Some files might be encrypted or corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfUrl) return;
    const link = document.createElement('a');
    link.href = mergedPdfUrl;
    link.download = `merged-document-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFiles([]);
    setSuccess(false);
    setMergedPdfUrl(null);
    setError(null);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{title} - Free Online PDF Merger | CareerSuite</title>
        <meta name="description" content={description + " Combine multiple PDF files into one document online for free. Fast, secure, and free online tool for students."} />
        <meta name="keywords" content="merge pdf, combine pdf online, pdf joiner, free pdf merger, ssc form pdf merge, online document joiner" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <ToolHeader 
            title={title}
            description={description}
            icon={FileStack}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onFilesSelect={handleFilesSelect}
                  onFileClear={reset}
                  label="Add PDF Files"
                  subLabel="Select multiple PDFs to combine"
                  accept=".pdf"
                  multiple={true}
                  isProcessing={isProcessing}
                  status="Merging PDFs..."
                  progress={isProcessing ? 70 : 100}
                />

                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-12 space-y-6"
                    >
                      <div className="flex items-center justify-between px-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Selected Files ({files.length})</p>
                        <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Drag to reorder</p>
                      </div>
                      
                      <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-3">
                        {files.map((item) => (
                          <Reorder.Item 
                            key={item.id} 
                            value={item}
                            className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-100 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <GripVertical className="h-5 w-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-inner">
                                <FileText className="h-7 w-7" />
                              </div>
                              <div className="text-left">
                                <p className="max-w-[150px] truncate text-lg font-black text-slate-900 sm:max-w-md">
                                  {item.file.name}
                                </p>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeFile(item.id)}
                              className="rounded-xl p-3 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="h-6 w-6" />
                            </button>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100 mt-8">
                  {files.length >= 2 && !success && (
                    <button 
                      onClick={handleMerge}
                      disabled={isProcessing}
                      className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Merging PDFs...
                        </>
                      ) : (
                        <>
                          <Zap className="h-6 w-6" />
                          Merge All PDFs Now
                        </>
                      )}
                    </button>
                  )}
                  {success && (
                    <button 
                      onClick={handleDownload} 
                      className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                    >
                      <Download className="h-6 w-6" /> Download Merged PDF
                    </button>
                  )}
                  {files.length > 0 && (
                    <button 
                      onClick={reset} 
                      className="btn-secondary px-12 py-5 text-xl flex items-center gap-3"
                    >
                      <RotateCcw className="h-5 w-5" />
                      Clear All
                    </button>
                  )}
                </div>
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                        <Info className="h-6 w-6" />
                      </div>
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
                <ul className="space-y-8">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">100% Private. Processing happens locally in your browser. Your files never leave your device.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">Easy Reordering. Drag and drop to set the perfect order.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">No Limits. Combine as many files as you need.</p>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Upload" 
                  description="Select all the PDF files you want to combine."
                  icon={FileStack}
                />
                <ToolStep 
                  number={2} 
                  title="Arrange" 
                  description="Drag the files to set the correct order."
                  icon={GripVertical}
                />
                <ToolStep 
                  number={3} 
                  title="Merge" 
                  description="Click merge and download your single PDF file."
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
