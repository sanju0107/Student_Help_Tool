import { 
  Image as ImageIcon, 
  Minimize2, 
  Maximize, 
  RefreshCw, 
  FilePlus, 
  FileDown,
  Scissors, 
  Calculator, 
  FileUser, 
  Sparkles,
  Maximize2,
  FileType,
  FileStack,
  Eraser,
  ArrowRightLeft,
  Cake,
  ScanText
} from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: any;
  category: 'image' | 'pdf' | 'student' | 'ai';
  path: string;
}

export const TOOLS: Tool[] = [
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce file size (KB) by adjusting quality.',
    longDescription: 'Professional image compression tool that reduces file size without changing dimensions. Ideal for optimizing web assets and storage.',
    icon: Minimize2,
    category: 'image',
    path: '/image/compressor'
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Change image dimensions (pixels).',
    longDescription: 'Precisely change the width and height of your images. Supports aspect ratio locking for distortion-free resizing.',
    icon: Maximize,
    category: 'image',
    path: '/image/resizer'
  },
  {
    id: 'exact-kb-converter',
    name: 'Exact KB Converter',
    description: 'Hit a specific target size (e.g., 50KB).',
    longDescription: 'Uses iterative compression logic to reach an exact target file size in KB. Perfect for strict portal requirements.',
    icon: FileDown,
    category: 'image',
    path: '/image/exact-kb'
  },
  {
    id: 'gov-form-resizer',
    name: 'Gov Form Photo Resizer',
    description: 'One-click resize for SSC, UPSC, Banking.',
    longDescription: 'Automated templates for Indian government forms. Automatically sets correct dimensions and KB limits for photos.',
    icon: Maximize2,
    category: 'image',
    path: '/image/gov-form'
  },
  {
    id: 'signature-resizer',
    name: 'Signature Resizer',
    description: 'Crop and convert signature to B&W.',
    longDescription: 'Specialized tool for signatures. Crop, convert to high-contrast black & white, and compress to under 20KB.',
    icon: FileType,
    category: 'image',
    path: '/image/signature'
  },
  {
    id: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    description: 'Create standard 3.5 x 4.5 cm photos.',
    longDescription: 'Generate professional passport size photos with standard dimensions and white background normalization.',
    icon: ImageIcon,
    category: 'image',
    path: '/image/passport'
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove background and get transparent PNG.',
    longDescription: 'AI-powered background removal. Instantly creates transparent PNGs for resumes, IDs, and professional profiles.',
    icon: Eraser,
    category: 'image',
    path: '/image/background-remover'
  },
  // PDF & Student Tools remain as secondary categories
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one.',
    longDescription: 'Combine multiple PDF documents into a single file. Perfect for merging marksheets and certificates.',
    icon: FileStack,
    category: 'pdf',
    path: '/pdf/merge',
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract specific pages from a PDF.',
    longDescription: 'Separate a single PDF file into multiple documents or extract specific pages for your needs.',
    icon: Scissors,
    category: 'pdf',
    path: '/pdf/split',
  },
  {
    id: 'reduce-pdf',
    name: 'Reduce PDF Size',
    description: 'Compress PDF file size.',
    longDescription: 'Reduce the file size of your PDF documents without losing quality. Ideal for email attachments and uploads.',
    icon: Minimize2,
    category: 'pdf',
    path: '/pdf/reduce',
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF to editable Word doc.',
    longDescription: 'Transform your PDF files into editable Microsoft Word documents while preserving formatting.',
    icon: FileType,
    category: 'pdf',
    path: '/pdf/to-word',
  },
  {
    id: 'gpa-calculator',
    name: 'GPA Calculator',
    description: 'Calculate CGPA and percentage.',
    longDescription: 'Calculate your semester GPA or overall CGPA and convert it to percentage for job applications.',
    icon: Calculator,
    category: 'student',
    path: '/student/gpa',
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate age for exam forms.',
    longDescription: 'Precisely calculate your age in years, months, and days as required by government exam portals.',
    icon: Cake,
    category: 'student',
    path: '/student/age',
  },
  {
    id: 'ocr-tool',
    name: 'Image to Text (OCR)',
    description: 'Extract editable text from images.',
    longDescription: 'AI-powered text extraction from screenshots and documents. Edit and download as text files.',
    icon: ScanText,
    category: 'ai',
    path: '/ocr-tool'
  },
  {
    id: 'resume-builder',
    name: 'AI Resume Builder',
    description: 'Create a professional resume in minutes.',
    longDescription: 'Build a job-winning professional resume with AI suggestions. Download as PDF instantly.',
    icon: FileUser,
    category: 'ai',
    path: '/student/resume',
  },
  {
    id: 'cover-letter-ai',
    name: 'AI Cover Letter',
    description: 'Generate tailored cover letters.',
    longDescription: 'AI-powered cover letter generator that creates professional letters tailored to specific job descriptions.',
    icon: Sparkles,
    category: 'ai',
    path: '/ai/cover-letter',
  },
];
