import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AbilityOverlayProps {
  active: boolean;
  abilityName: string;
}

export const AbilityOverlay: React.FC<AbilityOverlayProps> = ({ active, abilityName }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50, x: '-50%' }}
          animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, scale: 1.5, y: -50, x: '-50%' }}
          className="fixed bottom-24 left-1/2 z-50 pointer-events-none"
        >
          <div className="px-6 py-2 bg-red-600 border border-white/20 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)]">
            <span className="text-xs font-black text-white uppercase tracking-[0.3em]">
              {abilityName.toUpperCase()}_ACTIVATED
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
