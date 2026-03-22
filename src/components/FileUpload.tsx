import React, { useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFilesSelect?: (files: FileList) => void;
  onFileClear?: () => void;
  accept?: string;
  multiple?: boolean;
  previewUrl?: string | null;
  fileName?: string | null;
  isProcessing?: boolean;
  progress?: number;
  status?: string;
  type?: 'image' | 'pdf' | 'any';
  label?: string;
  subLabel?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFilesSelect,
  onFileClear,
  accept = 'image/*',
  multiple = false,
  previewUrl,
  fileName,
  isProcessing = false,
  progress = 0,
  status = '',
  type = 'image',
  label = 'Select File',
  subLabel = 'or drop file here'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (multiple && onFilesSelect) {
        onFilesSelect(files);
      } else {
        onFileSelect(files[0]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (multiple && onFilesSelect) {
        onFilesSelect(files);
      } else {
        onFileSelect(files[0]);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {!previewUrl && !fileName ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="group relative flex flex-col items-center justify-center py-24 lg:py-32 border-4 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 transition-all hover:border-blue-500 hover:bg-white hover:shadow-2xl hover:shadow-blue-600/10 cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-transparent"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white text-blue-600 shadow-xl shadow-blue-600/10 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <Upload className="h-12 w-12" />
            </div>
            
            <div className="text-center px-6">
              <h3 className="mb-4 text-3xl font-black text-slate-900 tracking-tight">
                {label}
              </h3>
              <p className="mb-10 text-lg font-medium text-slate-500">
                {subLabel}
              </p>
              
              <div className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-10 py-5 text-xl font-black text-white shadow-xl shadow-blue-600/20 transition-all group-hover:bg-blue-700 group-hover:scale-105 active:scale-95">
                Choose File
              </div>
            </div>

            <div className="mt-16 flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                Secure
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Private
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                Fast
              </div>
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept={accept} 
            multiple={multiple}
            className="hidden" 
          />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] border-4 border-white bg-slate-100 shadow-2xl shadow-slate-200/50">
            {type === 'image' && previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="h-full w-full object-contain p-4"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-6 text-slate-400">
                <div className="rounded-3xl bg-white p-8 shadow-lg">
                  <FileText className="h-20 w-20 text-blue-600" />
                </div>
                <p className="text-xl font-black text-slate-900">{fileName}</p>
              </div>
            )}
            
            {!isProcessing && onFileClear && (
              <button 
                onClick={onFileClear}
                className="absolute right-6 top-6 rounded-2xl bg-white/90 p-3 text-slate-600 shadow-xl backdrop-blur-md hover:text-red-500 transition-all hover:scale-110 active:scale-90"
              >
                <X className="h-6 w-6" />
              </button>
            )}

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <div className="w-full max-w-md px-8">
                  <div className="mb-4 flex items-center justify-between text-sm font-black text-slate-900 uppercase tracking-widest">
                    <span>{status}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
                    <motion.div 
                      className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
