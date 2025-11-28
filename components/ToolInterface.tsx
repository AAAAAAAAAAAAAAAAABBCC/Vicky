import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File as FileIcon, Loader2, Download, X, CheckCircle2, ChevronLeft, ArrowRight, Trophy, Star } from 'lucide-react';
import { ToolConfig } from '../types';
import { mergePDFs, imagesToPDF, splitPDF, addWatermark, removePages, reorderPages, mockServerProcess } from '../services/pdfService';
import { playClickSound, playSuccessSound, playErrorSound } from '../utils/sounds';

interface Props {
  tool: ToolConfig;
  onBack: () => void;
}

const LevelUp: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    angle: (i / 20) * 360,
    distance: Math.random() * 150 + 50,
    delay: Math.random() * 0.2
  }));

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none" aria-hidden="true">
      <div className="relative flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl w-64 h-64 -z-10"
        />

        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ 
              x: Math.cos(p.angle * Math.PI / 180) * p.distance,
              y: Math.sin(p.angle * Math.PI / 180) * p.distance,
              opacity: [1, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{ duration: 1.5, ease: "easeOut", delay: p.delay }}
            className="absolute w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
          />
        ))}

        <motion.div
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative mb-6"
        >
           <div className="w-32 h-32 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 flex items-center justify-center shadow-2xl border-4 border-yellow-200 relative overflow-hidden">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,white_45deg,transparent_90deg)] opacity-30"
              />
              <Trophy className="w-16 h-16 text-yellow-900 drop-shadow-md relative z-10" />
           </div>
           <motion.div 
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg"
           >
             <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
           </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <motion.h3 
            className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 uppercase tracking-tighter drop-shadow-lg"
          >
            Level Up!
          </motion.h3>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-1 bg-yellow-500/50 rounded-full mt-2 mx-auto overflow-hidden max-w-[120px]"
          >
             <div className="h-full bg-yellow-400 w-full animate-pulse"></div>
          </motion.div>
          <p className="text-yellow-200 font-bold mt-2 font-mono tracking-widest">+100 XP</p>
        </motion.div>
      </div>
    </div>
  );
};


export const ToolInterface: React.FC<Props> = ({ tool, onBack }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [ripples, setRipples] = useState<{id: number, x: number, y: number}[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setResultUrl(null);
      playClickSound();
    }
  };

  const addRipple = (x: number, y: number) => {
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 400);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
        addRipple(e.clientX - rect.left, e.clientY - rect.top);
    }
    fileInputRef.current?.click();
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playClickSound();
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
        addRipple(e.clientX - rect.left, e.clientY - rect.top);
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        playClickSound();
        const droppedFiles = Array.from(e.dataTransfer.files);
        const isMultiple = tool.id === 'merge' || tool.id === 'jpg-to-pdf';

        if (isMultiple) {
            setFiles(droppedFiles);
        } else {
            setFiles([droppedFiles[0]]);
        }
        setResultUrl(null);
    }
  };

  const processTool = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    playClickSound();
    
    try {
      let resultData: Uint8Array | Blob;
      await new Promise(r => setTimeout(r, 1500));

      switch (tool.id) {
        case 'merge':
          resultData = await mergePDFs(files);
          break;
        case 'jpg-to-pdf':
          resultData = await imagesToPDF(files);
          break;
        case 'split':
          const parts = await splitPDF(files[0]);
          resultData = parts[0]; 
          break;
        case 'watermark':
          resultData = await addWatermark(files[0], watermarkText);
          break;
        case 'remove-pages':
          resultData = await removePages(files[0], [0]);
          break;
        case 'reorder-pages':
          resultData = await reorderPages(files[0]);
          break;
        default:
          resultData = await mockServerProcess(files[0], tool.id);
          break;
      }

      const blob = new Blob([resultData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      playSuccessSound();
      setShowLevelUp(true);
      
    } catch (error) {
      console.error("Processing failed", error);
      playErrorSound();
      alert("Processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-0 md:p-8 bg-black/60 backdrop-blur-3xl" aria-label="Tool Interface" role="dialog">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", bounce: 0.2 }}
        className="w-full max-w-5xl h-full md:h-[90vh] liquid-glass md:rounded-[3rem] relative flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="px-8 pt-24 pb-6 md:py-6 border-b border-white/10 dark:border-white/10 light:border-black/5 flex items-center justify-between">
          <button 
            onClick={() => { playClickSound(); onBack(); }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-black/5 dark:bg-white/10 light:bg-black/5 hover:bg-black/10 dark:hover:bg-white/20 text-dynamic transition-all group font-bold relative z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Back to Tools"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${tool.gradient}`} aria-hidden="true"></div>
             <h2 className="text-xl font-bold text-dynamic tracking-tight">{tool.title}</h2>
          </div>
          
          <div className="w-20"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto custom-scrollbar">
           <AnimatePresence mode="wait">
            {showLevelUp ? (
               <motion.div 
                 key="levelup"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 flex items-center justify-center"
               >
                 <LevelUp onComplete={() => setShowLevelUp(false)} />
               </motion.div>
            ) : !resultUrl ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-2xl flex flex-col items-center"
              >
                {files.length === 0 ? (
                  <div 
                    ref={dropZoneRef}
                    onClick={handleContainerClick}
                    onKeyDown={handleContainerKeyDown}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload file area. Drag and drop or click to select."
                    className={`w-full aspect-video border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
                        isDragging 
                        ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
                        : 'border-dynamic/30 hover:bg-dynamic/5 hover:border-dynamic/60'
                    }`}
                  >
                    {ripples.map(r => (
                        <div 
                            key={r.id}
                            className="absolute rounded-full bg-white/40 blur-sm pointer-events-none"
                            style={{ 
                                left: r.x,
                                top: r.y,
                                width: '10px', 
                                height: '10px',
                                transform: 'translate(-50%, -50%)',
                                animation: 'ripple 0.4s ease-out forwards',
                            }}
                        ></div>
                    ))}

                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500 relative z-10 will-change-transform">
                      <Upload className="w-10 h-10 text-white" aria-hidden="true" />
                    </div>
                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-3 tracking-tighter relative z-10 drop-shadow-sm">Drop files.</p>
                    <p className="text-dynamic/60 text-lg font-bold uppercase tracking-widest relative z-10">or tap to browse</p>
                    
                    <input 
                      type="file" 
                      multiple={tool.id === 'merge' || tool.id === 'jpg-to-pdf'}
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFiles}
                      accept={tool.id.includes('jpg') ? 'image/*' : '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'}
                      onClick={(e) => e.stopPropagation()}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="grid grid-cols-1 gap-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar" role="list">
                      {files.map((f, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i} 
                          role="listitem"
                          className="bg-dynamic/5 p-6 rounded-2xl flex items-center justify-between border border-dynamic/5"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-dynamic/10 rounded-xl">
                              <FileIcon className="w-6 h-6 text-dynamic" aria-hidden="true" />
                            </div>
                            <div>
                              <p className="font-bold text-dynamic truncate max-w-[250px]">{f.name}</p>
                              <p className="text-sm text-dynamic/50">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                                const newFiles = files.filter((_, idx) => idx !== i);
                                setFiles(newFiles);
                                playClickSound();
                            }} 
                            className="p-2 hover:bg-dynamic/10 rounded-full text-dynamic/60 hover:text-dynamic transition-colors"
                            aria-label={`Remove ${f.name}`}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {tool.id === 'watermark' && (
                      <div className="mb-8">
                        <label htmlFor="watermark-input" className="text-sm font-bold uppercase text-dynamic/60 mb-3 block tracking-wider">Watermark Text</label>
                        <input 
                          id="watermark-input"
                          type="text" 
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          className="w-full bg-dynamic/5 border border-dynamic/10 rounded-2xl px-6 py-4 text-dynamic text-lg focus:bg-dynamic/10 focus:border-dynamic/30 outline-none transition-all placeholder:text-dynamic/20 font-bold"
                          placeholder="Enter text..."
                        />
                      </div>
                    )}

                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => { setFiles([]); playClickSound(); }}
                        className="px-10 py-5 rounded-full font-bold text-dynamic/60 hover:bg-dynamic/5 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Reset
                      </button>
                      <button 
                        onClick={processTool}
                        disabled={isProcessing}
                        className="flex-1 py-5 bg-white text-black dark:bg-white dark:text-black light:bg-black light:text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center shadow-xl will-change-transform focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="animate-spin mr-2 w-6 h-6" /> : (
                           <>Start Processing <ArrowRight className="w-6 h-6 ml-2" /></>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8 border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="w-16 h-16 text-green-400" aria-hidden="true" />
                </div>
                <h3 className="text-5xl font-black text-dynamic mb-4">Complete.</h3>
                <p className="text-dynamic/60 mb-12 text-xl font-bold">Your files are ready.</p>
                
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <a 
                    href={resultUrl} 
                    download={`anyfile-export.pdf`}
                    onClick={playClickSound}
                    className="px-12 py-5 bg-white text-black dark:bg-white dark:text-black light:bg-black light:text-white rounded-full font-black text-xl hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg hover:shadow-xl will-change-transform focus:outline-none focus:ring-2 focus:ring-green-500"
                    role="button"
                  >
                    <Download className="w-6 h-6 mr-2" /> Download
                  </a>
                  <button 
                    onClick={() => { setFiles([]); setResultUrl(null); playClickSound(); }}
                    className="px-12 py-5 bg-dynamic/10 text-dynamic rounded-full font-bold text-xl hover:bg-dynamic/20 transition-colors border border-dynamic/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    New Task
                  </button>
                </div>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};