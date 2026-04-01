import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import {
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';
import { convertPDFToWord, isScannedPDF, formatFileSize } from '../lib/pdfUtils';

export default function PDFToWord() {
  const toolData = TOOLS.find(t => t.id === 'pdf-to-word')!;
  const { name: title, description, seoTitle, seoDescription, seoKeywords } = toolData;

  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/pdf/pdf-to-word'
  });

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    fileName: string;
    fileSize: number;
    originalSize: number;
  } | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setWarning(null);
    setResult(null);
  };

  const processConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setWarning(null);

    try {
      // Check if PDF is scanned/image-based
      const isScanned = await isScannedPDF(file.arrayBuffer());
      
      if (isScanned) {
        setWarning(
          'This appears to be a scanned PDF (image-based). Text extraction may produce poor results. ' +
          'Consider using OCR service or the original document if available.'
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const docxBlob = await convertPDFToWord(arrayBuffer);
      
      if (!docxBlob || docxBlob.size === 0) {
        throw new Error('Document generated but appears to be empty.');
      }

      const url = URL.createObjectURL(docxBlob);
      const docxFileName = file.name.replace(/\.pdf$/i, '.docx');

      setResult({
        url,
        fileName: docxFileName,
        fileSize: docxBlob.size,
        originalSize: file.size,
      });

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setError(null);
    setWarning(null);
    setResult(null);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{title} - Convert PDF to Word Online Free | CareerSuite</title>
        <meta name="description" content={description + " Convert PDF files to editable Word documents (.docx) online. Preserve text and structure."} />
        <meta name="keywords" content="pdf to word, pdf to docx, convert pdf to word, free pdf converter, extract text from pdf" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <ToolHeader 
            title={title}
            description={description}
            icon={FileText}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                {!file ? (
                  <FileUpload 
                    onFileSelect={handleFileSelect}
                    onFileClear={reset}
                    label="Upload PDF File"
                    subLabel="Select a PDF to convert to Word format"
                    accept=".pdf,application/pdf"
                  />
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between rounded-[2rem] bg-slate-50 p-8 border border-slate-100">
                      <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-inner">
                          <FileText className="h-9 w-9" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mt-1">
                            {(file.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      {!result && !isProcessing && (
                        <button
                          onClick={reset}
                          className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-slate-600 shadow-sm transition-all hover:text-red-500 border border-slate-100"
                        >
                          <RotateCcw className="h-4 w-4" />
                          CHANGE
                        </button>
                      )}
                    </div>

                    {!result ? (
                      <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                        <button
                          onClick={processConvert}
                          disabled={isProcessing}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            'Convert to Word'
                          )}
                        </button>
                        {!isProcessing && (
                          <button onClick={reset} className="btn-secondary px-10 py-5 text-xl">
                            Reset
                          </button>
                        )}
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[2.5rem] p-10 text-center border bg-emerald-50 border-emerald-100"
                      >
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-inner bg-emerald-100 text-emerald-600">
                          <CheckCircle2 className="h-12 w-12" />
                        </div>
                        
                        <h3 className="mb-3 text-3xl font-black text-emerald-900 tracking-tight">Conversion Complete!</h3>
                        <div className="mb-10 space-y-4">
                          <p className="text-emerald-700 font-medium text-lg">Your PDF has been converted to a Word document.</p>
                          <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">PDF Size</p>
                              <p className="text-xl font-black text-slate-600">{formatFileSize(result.originalSize).formatted}</p>
                            </div>
                            <ArrowRight className="h-6 w-6 text-emerald-400" />
                            <div className="text-center">
                              <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">Document</p>
                              <p className="text-3xl font-black text-emerald-600">{formatFileSize(result.fileSize).formatted}</p>
                            </div>
                          </div>
                        </div>

                        {warning && (
                          <div className="mb-6 rounded-xl bg-amber-50 p-4 border border-amber-200">
                            <p className="text-sm text-amber-800 font-medium">{warning}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4">
                          <a
                            href={result.url}
                            download={result.fileName}
                            className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                          >
                            <Download className="h-6 w-6" />
                            Download Word
                          </a>
                          <button onClick={reset} className="btn-secondary px-10 py-5 text-xl">
                            Convert Another
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </ToolCard>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-red-50 p-6 border-2 border-red-200"
                >
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-black text-red-900 mb-1">Conversion Error</h3>
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {warning && !result && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-amber-50 p-6 border-2 border-amber-200"
                >
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-black text-amber-900 mb-1">Conversion Quality Note</h3>
                      <p className="text-sm font-medium text-amber-800">{warning}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <ToolCard className="bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Important Information
                  </h3>
                  <div className="space-y-3 text-sm text-slate-700 font-medium">
                    <p>
                      <strong>Text-based PDFs:</strong> Convert well with good text preservation and structure detection.
                    </p>
                    <p>
                      <strong>Scanned PDFs (Images):</strong> Cannot extract text accurately without OCR. Consider using a dedicated OCR service for scanned documents.
                    </p>
                    <p>
                      <strong>Complex layouts:</strong> Tables, columns, and advanced formatting may not be perfectly preserved. The output prioritizes readability and content accuracy.
                    </p>
                    <p>
                      <strong>Editing:</strong> The generated Word document is fully editable and can be further refined as needed.
                    </p>
                  </div>
                </div>
              </ToolCard>
            </div>

            <div>
              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 p-8 text-white shadow-xl">
                  <h3 className="font-black text-xl mb-4">✨ How It Works</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="font-black mb-1">1. Upload PDF</div>
                      <p className="text-purple-100">Select your PDF file</p>
                    </div>
                    <div>
                      <div className="font-black mb-1">2. Extract Text</div>
                      <p className="text-purple-100">AI detects structure & headings</p>
                    </div>
                    <div>
                      <div className="font-black mb-1">3. Create Document</div>
                      <p className="text-purple-100">Generate editable Word format</p>
                    </div>
                    <div>
                      <div className="font-black mb-1">4. Download</div>
                      <p className="text-purple-100">Get your .docx instantly</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-6 border-2 border-slate-200">
                  <h4 className="font-black text-slate-900 mb-3">✓ Works Best For</h4>
                  <ul className="space-y-2 text-sm text-slate-700 font-medium">
                    <li>✓ Reports & documents</li>
                    <li>✓ Text-heavy PDFs</li>
                    <li>✓ Forms & surveys</li>
                    <li>✓ Academic papers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <RelatedTools />
      </div>
      
      {toolData.faqItems && <FAQ items={toolData.faqItems} />}
    </div>
  );
}
