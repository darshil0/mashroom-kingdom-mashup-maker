import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  currentLevel: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, currentLevel }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          id="ai-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 overflow-hidden"
        >
          <div className="scanline" />
          <div className="relative glass-panel tech-border rounded-[64px] p-16 flex flex-col items-center gap-10 max-w-lg w-full text-center">
             <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-32 h-32 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Wand2 className="text-blue-500 animate-pulse" size={48} />
                </div>
             </div>
             
             <div className="space-y-4">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter">Forging_Reality</h3>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] leading-relaxed">
                  AI Module GMNI_R3 Active<br />
                  Mapping World {currentLevel + 1} Physics...
                </p>
             </div>

             <div className="w-full space-y-2">
                <div className="flex justify-between items-end px-2">
                   <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Construction Progress</span>
                   <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">v1.7.5 Stable</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                   <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: ['20%', '45%', '85%', '98%'] }}
                    transition={{ duration: 15 }}
                    className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]" 
                   />
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
