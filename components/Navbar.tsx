import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound } from '../utils/sounds';

interface Props {
  onSearch: (query: string) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

export const Navbar: React.FC<Props> = ({ onSearch, toggleTheme, isDark }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle clicks outside to collapse search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    onSearch(q);
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto pointer-events-auto flex items-start justify-center relative">
        <div className="liquid-glass rounded-full px-2 py-1.5 flex items-center justify-between transition-all duration-500 gap-2 relative z-50 shadow-2xl w-full max-w-[95vw] md:max-w-4xl">
          
          {/* Logo Area */}
          <Link 
            to="/" 
            aria-label="AnyFile Home"
            className={`flex items-center gap-3 px-2 md:px-3 group ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}
            onClick={playClickSound}
          >
            <div className="w-8 h-8 relative flex items-center justify-center">
               {/* Pulsing Glow Background */}
               <motion.div 
                 animate={{ 
                    scale: [1, 1.2, 1], 
                    opacity: [0.3, 0.6, 0.3],
                 }}
                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm"
               />
               
               {/* Icon Container */}
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg relative z-10 overflow-hidden">
                 <svg 
                   viewBox="0 0 24 24" 
                   className="w-4 h-4 text-white stroke-2 fill-none stroke-current"
                   aria-hidden="true"
                 >
                   <motion.path 
                     d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" 
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ pathLength: 1, opacity: 1 }}
                     transition={{ duration: 1.5, ease: "easeInOut" }}
                   />
                 </svg>
                 {/* Shine Effect */}
                 <div className="absolute inset-0 bg-white/20 animate-glass-shine"></div>
               </div>
            </div>
            <span className="text-lg font-black tracking-tight text-dynamic font-display hidden sm:block">AnyFile</span>
          </Link>

          <div className="flex-1"></div>

          {/* Search Bar - Compact with Gemini Glow */}
          <div className={`flex items-center justify-end transition-all duration-500 relative`} ref={searchContainerRef}>
             <motion.div 
               initial={false}
               animate={{ width: isSearchOpen ? '180px' : '40px' }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               className={`flex items-center rounded-full overflow-hidden relative group h-10`}
             >
                {/* Gemini/Siri Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full"></div>
                <div className={`absolute inset-[-2px] gemini-glow animate-spin-slow opacity-0 ${isSearchOpen ? 'opacity-100' : ''} transition-opacity duration-500 pointer-events-none`}></div>
                
                {/* Inner Container */}
                <div className={`relative z-10 w-full h-full flex items-center bg-black/60 dark:bg-black/60 light:bg-white/80 backdrop-blur-md rounded-full ${isSearchOpen ? 'pl-4 pr-1' : 'justify-center'}`}>
                  <AnimatePresence>
                    {isSearchOpen && (
                      <motion.input
                        ref={searchInputRef}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '100%' }}
                        exit={{ opacity: 0, width: 0 }}
                        type="text"
                        placeholder="Search..."
                        aria-label="Search tools"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="bg-transparent border-none outline-none text-white dark:text-white light:text-black placeholder:text-gray-400 h-full w-full text-sm font-medium min-w-[80px] mr-1"
                      />
                    )}
                  </AnimatePresence>
                  
                  <button 
                    onClick={() => { setIsSearchOpen(!isSearchOpen); playClickSound(); }}
                    aria-label="Toggle search"
                    className={`p-2 rounded-full text-white dark:text-white light:text-black shrink-0 flex items-center justify-center`}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
             </motion.div>
          </div>

          <div className="w-px h-5 bg-current opacity-10 mx-1"></div>

          {/* Dark/Light Toggle */}
          <button 
            onClick={() => { toggleTheme(); playClickSound(); }}
            aria-label="Toggle dark mode"
            className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-dynamic"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>
      </div>
    </motion.nav>
  );
};