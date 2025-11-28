import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, Variants, useScroll } from 'framer-motion';
import { TOOLS } from '../constants';
import { ToolConfig, ToolId } from '../types';
import * as Icons from 'lucide-react';
import { playClickSound } from '../utils/sounds';

interface Props {
  onSelectTool: (tool: ToolConfig) => void;
  searchQuery: string;
}

const CATEGORIES = [
  {
    id: 'essentials',
    title: 'Core Essence',
    description: "Fundamental manipulation of digital documents. We don't just process files; we restructure their very DNA.",
    privacy: "Processed locally on your device via WebAssembly. Zero latency. Zero data egress.",
    highlight: "Merge up to 100 files instantly.",
    bgClass: "bg-blue-600/20",
    textClass: "text-blue-400",
    tools: [ToolId.MERGE, ToolId.SPLIT, ToolId.COMPRESS]
  },
  {
    id: 'converters',
    title: 'Alchemy & Transform',
    description: "Transmute static documents into editable formats and back again. The ultimate fluidity between Word, Excel, PowerPoint, and PDF.",
    privacy: "High-fidelity conversion engines ensure formatting remains intact while respecting your privacy.",
    highlight: "Support for Office 365 formats.",
    bgClass: "bg-purple-600/20",
    textClass: "text-purple-400",
    tools: [
      ToolId.PDF_TO_JPG, ToolId.JPG_TO_PDF, 
      ToolId.WORD_TO_PDF, ToolId.PDF_TO_WORD,
      ToolId.PDF_TO_PPT, ToolId.PPT_TO_PDF, 
      ToolId.EXCEL_TO_PDF
    ]
  },
  {
    id: 'management',
    title: 'Total Dominion',
    description: "Exert absolute control over your information. Redact, reorder, secure, and watermark with military-grade precision.",
    privacy: "Client-side encryption available. Your secrets die with your session.",
    highlight: "Watermark stamping in < 50ms.",
    bgClass: "bg-orange-600/20",
    textClass: "text-orange-400",
    tools: [
      ToolId.EXTRACT_TEXT, ToolId.REMOVE_PAGES, 
      ToolId.REORDER_PAGES, ToolId.WATERMARK, 
      ToolId.PROTECT
    ]
  }
];

const BentoCard: React.FC<{ 
    tool: ToolConfig, 
    onSelect: () => void, 
    isHighlighted: boolean,
    mouseX: any,
    mouseY: any
}> = ({ tool, onSelect, isHighlighted, mouseX, mouseY }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playClickSound();
      onSelect();
    }
  };

  // @ts-ignore
  const IconComponent = Icons[tool.icon] || Icons.File;

  return (
    <motion.div
      ref={ref}
      layoutId={`card-${tool.id}`}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08, zIndex: 50 }}
      animate={isHighlighted ? { scale: 1.1, y: -20, zIndex: 20 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={() => { playClickSound(); onSelect(); }}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Select tool: ${tool.title}`}
      className="relative w-full aspect-square cursor-pointer group will-change-transform focus:outline-none focus:ring-4 focus:ring-blue-500/50 rounded-[1.8rem]"
      style={{ transformOrigin: 'center center' }} 
    >
      <div className={`
        absolute inset-0 rounded-[1.8rem] overflow-hidden
        bg-gradient-to-br ${tool.gradient}
        shadow-lg group-hover:shadow-2xl group-hover:shadow-current/40
        transition-all duration-300 ease-out
        border border-white/20
        transform-gpu
      `}
      style={{ borderRadius: '1.8rem' }}
      >
        <div className="absolute inset-0 colored-glass-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-20 h-full p-4 md:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <IconComponent className="w-5 h-5 md:w-7 md:h-7 text-white drop-shadow-md" />
            </div>
            <Icons.ArrowUpRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none mb-2 drop-shadow-md">
              {tool.title}
            </h3>
            <p className="text-xs md:text-sm font-bold text-white/90 uppercase tracking-widest line-clamp-1 opacity-90">
              {tool.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CategorySection: React.FC<{ 
    category: any, 
    tools: ToolConfig[], 
    onSelectTool: (t: ToolConfig) => void, 
    isFiltering: boolean 
}> = ({ category, tools, onSelectTool, isFiltering }) => {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const mobileOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const mobileScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);
  
  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row gap-8 lg:gap-24 relative group min-h-[40vh]">
      
      <motion.div 
        className="lg:w-1/3 lg:space-y-8 lg:sticky lg:top-24 lg:self-start z-0"
      >
         <motion.div 
           className="lg:!opacity-100 lg:!scale-100 sticky top-24 lg:static"
           style={{ opacity: mobileOpacity, scale: mobileScale }}
         >
           <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${category.bgClass} ${category.textClass} backdrop-blur-md border border-white/10 mb-4 shadow-sm`}>
             {category.id}
           </div>
           
           <h3 className="text-4xl md:text-7xl font-black text-dynamic tracking-tighter leading-[0.85] mb-6 drop-shadow-sm">
             {category.title}
           </h3>
           
           <div className="space-y-8">
             <p className={`text-xl md:text-2xl font-bold leading-relaxed ${category.textClass} opacity-90`}>
               {category.description}
             </p>

             <div className="hidden lg:block p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-white/10 transition-colors">
                <h4 className="text-xs font-black text-dynamic/40 uppercase tracking-widest mb-3">Privacy Promise</h4>
                <p className="text-dynamic/90 text-base font-medium">{category.privacy}</p>
             </div>

             <div className="flex items-center gap-3 text-dynamic/80 text-sm font-bold font-mono tracking-tight">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
               {category.highlight}
             </div>
           </div>
         </motion.div>
      </motion.div>

      <div className="lg:w-2/3 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6" role="list">
          {tools.map((tool) => (
            <div role="listitem" key={tool.id}>
              <BentoCard 
                  tool={tool} 
                  onSelect={() => onSelectTool(tool)} 
                  isHighlighted={isFiltering}
                  mouseX={mouseX}
                  mouseY={mouseY}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export const ToolGrid: React.FC<Props> = ({ onSelectTool, searchQuery }) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const allFilteredTools = TOOLS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const isFiltering = searchQuery.length > 0;

  useEffect(() => {
    if (isFiltering && gridRef.current) {
        const yOffset = -100;
        const element = gridRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [isFiltering]);

  return (
    <section className="py-20 px-4 md:px-6 max-w-[1600px] mx-auto min-h-[60vh] relative z-10" id="tools" ref={gridRef} aria-label="Tools List">
      
      {!isFiltering && (
        <div className="flex flex-col items-center mb-16 md:mb-32 text-center">
            <h2 className="text-5xl md:text-8xl font-black text-dynamic tracking-tighter mb-8 drop-shadow-2xl">
            The Suite.
            </h2>
            <div className="h-2 w-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
        </div>
      )}

      <div className="space-y-24 md:space-y-40">
        {CATEGORIES.map((category) => {
          const categoryTools = allFilteredTools.filter(t => category.tools.includes(t.id));
          if (categoryTools.length === 0) return null;

          return (
            <CategorySection 
              key={category.id} 
              category={category} 
              tools={categoryTools} 
              onSelectTool={onSelectTool} 
              isFiltering={isFiltering}
            />
          );
        })}
      </div>
      
      {allFilteredTools.length === 0 && (
         <div className="text-center py-20 opacity-50 text-dynamic text-xl font-mono font-bold" role="status">
           No tools found matching "{searchQuery}"
         </div>
      )}
    </section>
  );
};