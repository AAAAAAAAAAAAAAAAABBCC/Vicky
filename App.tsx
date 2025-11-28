import React, { useState, useEffect } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ToolGrid } from './components/ToolGrid';
import { ToolInterface } from './components/ToolInterface';
import { SocialSection } from './components/SocialSection';
import { Footer } from './components/Footer';
import { LiveBackground } from './components/LiveBackground';
import { ToolConfig } from './types';
import { WALLPAPERS } from './constants';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound } from './utils/sounds';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainContent: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolConfig | null>(null);
  const [wallpaperIndex, setWallpaperIndex] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Manage Dark Mode Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Auto-rotate static wallpapers
  useEffect(() => {
    const interval = setInterval(() => {
      setWallpaperIndex((prev) => (prev + 1) % WALLPAPERS.length);
    }, 15000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playClickSound();
  };

  return (
    <>
      <div className="bg-container">
        {/* Global Glow Layer */}
        <div className="glow-layer"></div>

        {/* Live Canvas Layer - Always active, subtle */}
        <LiveBackground mode={isDark ? 'oled' : 'mesh'} isDark={isDark} />
        
        {/* Wallpapers Layer - Highly transparent for mix */}
        <div className="absolute inset-0 transition-opacity duration-1000 opacity-60">
             {WALLPAPERS.map((src, index) => (
              <div 
                key={src}
                className={`bg-image ${index === wallpaperIndex ? 'active' : ''}`}
                style={{ backgroundImage: `url(${src})` }}
              />
            ))}
        </div>
        
        {/* Vignette Overlay */}
        <div className="bg-overlay" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Navbar 
          onSearch={setSearchQuery}
          toggleTheme={toggleTheme}
          isDark={isDark}
        />
        
        <main className="min-h-screen relative z-0 pt-20">
          {!selectedTool ? (
            <>
              <Hero />
              <ToolGrid onSelectTool={setSelectedTool} searchQuery={searchQuery} />
              <SocialSection />
            </>
          ) : (
            <ToolInterface tool={selectedTool} onBack={() => setSelectedTool(null)} />
          )}
        </main>
        
        {!selectedTool && <Footer />}

        <AnimatePresence>
          {showScrollTop && !selectedTool && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full liquid-glass text-dynamic shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
            >
              <ArrowUp className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <MainContent />
    </HashRouter>
  );
};

export default App;