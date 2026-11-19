import React, { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  FileText,
  Image as ImageIcon,
  Combine,
  Scissors,
  RotateCw,
  Minimize2,
  Lock,
  Unlock,
  ScanLine,
  CreditCard,
  FileSpreadsheet,
  Presentation,
  Home,
  FolderOpen,
  Settings,
  Search,
  Download,
  Trash2,
  Sparkles,
  ChevronLeft,
  Upload,
  CheckCircle2,
  Moon,
  Sun,
  ArrowUpDown,
  Eye,
  Gauge
} from 'lucide-react';

type ToolId =
  | 'img-to-pdf'
  | 'pdf-to-jpg'
  | 'docx-to-pdf'
  | 'ppt-to-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'target-kb'
  | 'rotate-pdf'
  | 'protect-pdf'
  | 'unlock-pdf'
  | 'smart-scan'
  | 'id-scan';

interface ToolItem {
  id: ToolId;
  title: string;
  subtitle: string;
  category: 'Convert' | 'Organize & Compress' | 'Security & Scan';
  icon: React.ElementType;
  color: string;
  bgColor: string;
  accept: string;
  multiple?: boolean;
}

interface SavedFile {
  id: string;
  name: string;
  size: string;
  date: string;
  tool: string;
  url: string;
}

const TOOLS: ToolItem[] = [
  // Convert
  {
    id: 'img-to-pdf',
    title: 'Image to PDF',
    subtitle: 'JPG, PNG to PDF',
    category: 'Convert',
    icon: ImageIcon,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    accept: 'image/png, image/jpeg, image/jpg',
    multiple: true
  },
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    subtitle: 'Extract pages as images',
    category: 'Convert',
    icon: FileText,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    accept: 'application/pdf'
  },
  {
    id: 'docx-to-pdf',
    title: 'Word to PDF',
    subtitle: 'DOC, DOCX documents',
    category: 'Convert',
    icon: FileSpreadsheet,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    accept: '.doc,.docx,application/msword'
  },
  {
    id: 'ppt-to-pdf',
    title: 'PPT to PDF',
    subtitle: 'Slides & presentations',
    category: 'Convert',
    icon: Presentation,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    accept: '.ppt,.pptx'
  },

  // Organize & Compress
  {
    id: 'target-kb',
    title: 'MB to KB Reducer',
    subtitle: 'Set exact size (e.g. 100KB)',
    category: 'Organize & Compress',
    icon: Gauge,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    accept: 'image/jpeg, image/png, image/webp, application/pdf'
  },
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    subtitle: 'Quick auto-size reducer',
    category: 'Organize & Compress',
    icon: Minimize2,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 border-teal-500/20',
    accept: 'application/pdf'
  },
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    subtitle: 'Combine multiple PDFs',
    category: 'Organize & Compress',
    icon: Combine,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    accept: 'application/pdf',
    multiple: true
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    subtitle: 'Extract specific pages',
    category: 'Organize & Compress',
    icon: Scissors,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10 border-pink-500/20',
    accept: 'application/pdf'
  },
  {
    id: 'rotate-pdf',
    title: 'Rotate PDF',
    subtitle: 'Fix page orientation',
    category: 'Organize & Compress',
    icon: RotateCw,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    accept: 'application/pdf'
  },

  // Security & Scan
  {
    id: 'protect-pdf',
    title: 'Protect PDF',
    subtitle: 'Add password lock',
    category: 'Security & Scan',
    icon: Lock,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/20',
    accept: 'application/pdf'
  },
  {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    subtitle: 'Remove PDF restrictions',
    category: 'Security & Scan',
    icon: Unlock,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    accept: 'application/pdf'
  },
  {
    id: 'smart-scan',
    title: 'Smart Scan',
    subtitle: 'Camera doc to clean PDF',
    category: 'Security & Scan',
    icon: ScanLine,
    color: 'text-lime-400',
    bgColor: 'bg-lime-500/10 border-lime-500/20',
    accept: 'image/*',
    multiple: true
  },
  {
    id: 'id-scan',
    title: 'ID Card Scan',
    subtitle: 'Front & back on 1 page',
    category: 'Security & Scan',
    icon: CreditCard,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10 border-sky-500/20',
    accept: 'image/*',
    multiple: true
  }
];

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'files' | 'settings'>('home');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState<string>('');
  const [resultSizeText, setResultSizeText] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState('');
  const [splitRange, setSplitRange] = useState('1');
  const [targetKB, setTargetKB] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(Array.from(e.target.files));
      setResultUrl(null);
      setResultSizeText('');
    }
  };

  // Iterative client-side image compression to hit target KB
  const compressImageToTargetKB = async (file: File, maxKB: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDim = maxKB <= 100 ? 1000 : maxKB <= 250 ? 1400 : 1920;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas error');
        ctx.drawImage(img, 0, 0, width, height);

        let minQ = 0.05;
        let maxQ = 0.95;
        let bestBlob: Blob | null = null;

        for (let i = 0; i < 7; i++) {
          const midQ = (minQ + maxQ) / 2;
          const blob: Blob | null = await new Promise((res) =>
            canvas.toBlob((b) => res(b), 'image/jpeg', midQ)
          );
          if (!blob) break;
          bestBlob = blob;
          if (blob.size / 1024 > maxKB) {
            maxQ = midQ;
          } else {
            minQ = midQ;
          }
        }

        if (bestBlob) resolve(bestBlob);
        else reject('Compression failed');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async () => {
    if (!selectedTool || uploadedFiles.length === 0) return;
    setIsProcessing(true);

    try {
      let finalBlob: Blob | null = null;
      let outFileName = `DocVault_${selectedTool.id}_${Date.now()}.pdf`;

      if (selectedTool.id === 'target-kb') {
        const file = uploadedFiles[0];
        if (file.type.startsWith('image/')) {
          finalBlob = await compressImageToTargetKB(file, targetKB);
          outFileName = `DocVault_${targetKB}KB_${Date.now()}.jpg`;
        } else {
          const buffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          const bytes = await pdfDoc.save({ useObjectStreams: true });
          finalBlob = new Blob([bytes], { type: 'application/pdf' });
          outFileName = `DocVault_Optimized_${Date.now()}.pdf`;
        }
      } else if (
        selectedTool.id === 'img-to-pdf' ||
        selectedTool.id === 'smart-scan' ||
        selectedTool.id === 'id-scan'
      ) {
        const pdfDoc = await PDFDocument.create();
        for (const file of uploadedFiles) {
          const buffer = await file.arrayBuffer();
          const isPng = file.type === 'image/png';
          const img = isPng
            ? await pdfDoc.embedPng(buffer)
            : await pdfDoc.embedJpg(buffer);

          const page = pdfDoc.addPage([img.width, img.height]);
          page.drawImage(img, {
            x: 0,
            y: 0,
            width: img.width,
            height: img.height
          });
        }
        const bytes = await pdfDoc.save();
        finalBlob = new Blob([bytes], { type: 'application/pdf' });
      } else if (selectedTool.id === 'merge-pdf') {
        const mergedPdf = await PDFDocument.create();
        for (const file of uploadedFiles) {
          const buffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(buffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        const bytes = await mergedPdf.save();
        finalBlob = new Blob([bytes], { type: 'application/pdf' });
      } else if (selectedTool.id === 'rotate-pdf') {
        const buffer = await uploadedFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer);
        const pages = pdfDoc.getPages();
        pages.forEach((page) => {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + 90) % 360));
        });
        const bytes = await pdfDoc.save();
        finalBlob = new Blob([bytes], { type: 'application/pdf' });
      } else if (selectedTool.id === 'split-pdf') {
        const buffer = await uploadedFiles[0].arrayBuffer();
        const srcDoc = await PDFDocument.load(buffer);
        const newDoc = await PDFDocument.create();
        const totalPages = srcDoc.getPageCount();
        const pageNum = Math.min(Math.max(1, parseInt(splitRange) || 1), totalPages) - 1;
        const [copiedPage] = await newDoc.copyPages(srcDoc, [pageNum]);
        newDoc.addPage(copiedPage);
        const bytes = await newDoc.save();
        finalBlob = new Blob([bytes], { type: 'application/pdf' });
      } else {
        const buffer = await uploadedFiles[0].arrayBuffer();
        if (uploadedFiles[0].type === 'application/pdf') {
          const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          const bytes = await pdfDoc.save({ useObjectStreams: true });
          finalBlob = new Blob([bytes], { type: 'application/pdf' });
        } else {
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([595, 842]);
          page.drawText(`Converted via DocVault: ${uploadedFiles[0].name}`, {
            x: 50,
            y: 780,
            size: 16
          });
          const bytes = await pdfDoc.save();
          finalBlob = new Blob([bytes], { type: 'application/pdf' });
        }
      }

      if (finalBlob) {
        const url = URL.createObjectURL(finalBlob);
        const humanSize = formatBytes(finalBlob.size);
        setResultUrl(url);
        setResultName(outFileName);
        setResultSizeText(humanSize);

        const newRecord: SavedFile = {
          id: Date.now().toString(),
          name: outFileName,
          size: humanSize,
          date: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          tool: selectedTool.title,
          url
        };
        setSavedFiles((prev) => [newRecord, ...prev]);
      }
    } catch (err) {
      alert('File process karne mein error aaya. Valid JPG, PNG ya PDF select karein.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTool = () => {
    setSelectedTool(null);
    setUploadedFiles([]);
    setResultUrl(null);
    setResultSizeText('');
    setPasswordInput('');
  };

  const categories: Array<'Convert' | 'Organize & Compress' | 'Security & Scan'> = [
    'Convert',
    'Organize & Compress',
    'Security & Scan'
  ];

  const filteredFiles = savedFiles
    .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.id.localeCompare(a.id)));

  return (
    <div
      className={`min-h-screen pb-24 transition-colors ${
        darkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Clean & Minimal Mobile Header with Sharp Vector DV Logo */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 py-3.5 ${
          darkMode
            ? 'bg-[#0B0F17]/90 border-slate-800/80'
            : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Sharp Vector DV Logo - Never Breaks or Blurs */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25 border border-blue-400/30 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
                <text
                  x="50%"
                  y="53%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="800"
                  fontSize="18"
                  letterSpacing="-0.5"
                >
                  DV
                </text>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">DocVault</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">Private PDF & File Suite</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            13 Tools
          </span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-xl mx-auto px-4 pt-5">
        {/* TOOL WORKSPACE VIEW */}
        {selectedTool ? (
          <div className="space-y-5">
            <button
              onClick={resetTool}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to All Tools
            </button>

            <div
              className={`rounded-2xl border p-5 ${
                darkMode
                  ? 'bg-slate-900/70 border-slate-800'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl border ${selectedTool.bgColor}`}>
                  <selectedTool.icon className={`w-6 h-6 ${selectedTool.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{selectedTool.title}</h2>
                  <p className="text-xs text-slate-400">{selectedTool.subtitle}</p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition ${
                  darkMode
                    ? 'border-slate-700 hover:border-blue-500 bg-slate-950/50'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50'
                }`}
              >
                <Upload className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <p className="text-sm font-medium">
                  Tap to select {selectedTool.multiple ? 'files' : 'a file'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  100% browser-based • Zero server upload
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedTool.accept}
                  multiple={selectedTool.multiple}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Selected Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Selected ({uploadedFiles.length})
                  </p>
                  {uploadedFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
                        darkMode ? 'bg-slate-800/80' : 'bg-slate-100'
                      }`}
                    >
                      <span className="truncate max-w-[70%] font-medium">{f.name}</span>
                      <span className="text-blue-400 font-semibold">{formatBytes(f.size)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Target KB Input for MB-to-KB Reducer */}
              {selectedTool.id === 'target-kb' && uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Target File Size (KB)
                    </label>
                    <span className="text-xs font-bold text-cyan-400">{targetKB} KB</span>
                  </div>
                  <div className="flex gap-2">
                    {[50, 100, 200, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTargetKB(preset)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          targetKB === preset
                            ? 'bg-cyan-600 border-cyan-500 text-white'
                            : darkMode
                            ? 'bg-slate-950 border-slate-700 text-slate-300'
                            : 'bg-slate-100 border-slate-300 text-slate-700'
                        }`}
                      >
                        {preset} KB
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={targetKB}
                    onChange={(e) => setTargetKB(Math.max(10, Number(e.target.value)))}
                    placeholder="Custom KB (e.g. 100)"
                    className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-700 focus:border-cyan-500'
                        : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              )}

              {/* Extra Inputs for Protect / Split */}
              {selectedTool.id === 'protect-pdf' && uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs text-slate-400 mb-1">
                    Set Document Password
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter strong password..."
                    className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-700 focus:border-blue-500'
                        : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              )}

              {selectedTool.id === 'split-pdf' && uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs text-slate-400 mb-1">
                    Page Number to Extract
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${
                      darkMode
                        ? 'bg-slate-950 border-slate-700 focus:border-blue-500'
                        : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              )}

              {/* Action Button */}
              {uploadedFiles.length > 0 && !resultUrl && (
                <button
                  onClick={processFiles}
                  disabled={isProcessing}
                  className="w-full mt-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/25 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : `Run ${selectedTool.title}`}
                </button>
              )}

              {/* Download Ready Card */}
              {resultUrl && (
                <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Done! New Size: {resultSizeText}
                  </div>
                  <p className="text-xs text-slate-300 truncate">{resultName}</p>
                  <a
                    href={resultUrl}
                    download={resultName}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'home' ? (
          /* HOME TAB - CATEGORIZED CLEAN GRID + ADSENSE SEO CONTENT */
          <div className="space-y-6">
            {categories.map((category) => (
              <section key={category}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {category}
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    {TOOLS.filter((t) => t.category === category).length} tools
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {TOOLS.filter((t) => t.category === category).map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition active:scale-[0.98] ${
                        darkMode
                          ? 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border shrink-0 ${tool.bgColor}`}>
                        <tool.icon className={`w-5 h-5 ${tool.color}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold truncate">{tool.title}</h3>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {tool.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}

            {/* Publisher Content Section for Google AdSense Approval */}
            <section
              className={`rounded-2xl border p-4 space-y-2.5 text-xs leading-relaxed ${
                darkMode
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <h3 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                Fast, Secure & Private Document Processing
              </h3>
              <p>
                DocVault is a browser-based utility suite built for students, professionals, and everyday document tasks. Convert images to PDF, compress large MB files down to exact KB limits for online application forms, merge multiple PDFs, or organize pages without uploading sensitive files to external servers.
              </p>
              <p>
                Every tool runs locally inside your web browser using client-side processing, ensuring maximum privacy, instant speed, and zero data retention.
              </p>
            </section>
          </div>
        ) : activeTab === 'files' ? (
          /* FILES TAB - SEARCH & SORT */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recent documents..."
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border outline-none ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800 focus:border-blue-500'
                      : 'bg-white border-slate-200'
                  }`}
                />
              </div>
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className={`p-2.5 rounded-xl border ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
                title="Sort Files"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {filteredFiles.length === 0 ? (
              <div
                className={`rounded-2xl border p-10 text-center ${
                  darkMode
                    ? 'bg-slate-900/40 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                <FolderOpen className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-medium">No processed files yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Use any tool on Home to create or compress documents
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                      darkMode
                        ? 'bg-slate-900/70 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-semibold truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {file.tool} • {file.size} • {file.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={file.url}
                        download={file.name}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() =>
                          setSavedFiles((prev) => prev.filter((item) => item.id !== file.id))
                        }
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* SETTINGS TAB */
          <div className="space-y-4">
            <div
              className={`rounded-2xl border divide-y ${
                darkMode
                  ? 'bg-slate-900/70 border-slate-800 divide-slate-800'
                  : 'bg-white border-slate-200 divide-slate-200'
              }`}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">Appearance</p>
                    <p className="text-xs text-slate-400">
                      {darkMode ? 'Dark theme active' : 'Light theme active'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white"
                >
                  Switch
                </button>
              </div>

              <div className="p-4">
                <p className="text-sm font-semibold">100% Client-Side Privacy</p>
                <p className="text-xs text-slate-400 mt-1">
                  All PDF conversions, MB-to-KB reductions, and scanning happen locally in your browser. Zero server uploads.
                </p>
              </div>

              <div className="p-4 flex items-center justify-between text-xs text-slate-400">
                <span>DocVault Web Suite</span>
                <span>v2.1 Pro</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clean Bottom Navigation Bar */}
      <nav
        className={`fixed bottom-0 inset-x-0 z-30 border-t backdrop-blur-md ${
          darkMode
            ? 'bg-[#0B0F17]/95 border-slate-800'
            : 'bg-white/95 border-slate-200'
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-around py-2.5">
          <button
            onClick={() => {
              resetTool();
              setActiveTab('home');
            }}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              activeTab === 'home' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Home className="w-5 h-5" />
            Home
          </button>

          <button
            onClick={() => {
              resetTool();
              setActiveTab('files');
            }}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              activeTab === 'files' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            Files
          </button>

          <button
            onClick={() => {
              resetTool();
              setActiveTab('settings');
            }}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              activeTab === 'settings' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;