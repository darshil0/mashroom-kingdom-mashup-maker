import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="app-footer-decoration" className="fixed bottom-0 left-0 w-full z-40 bg-black/80 backdrop-blur-md border-t border-white/5 p-2 hidden sm:block">
       <div className="max-w-7xl mx-auto flex justify-between items-center opacity-40">
          <div className="flex gap-4 items-center">
             <div className="flex gap-3 mr-4">
                {[
                  { label: 'LORE', url: '/lore.html' },
                  { label: 'SPECS', url: '/tech_specs.html' },
                  { label: 'CTRLS', url: '/controls.html' },
                  { label: 'LOGS', url: '/archive_v1.html' },
                  { label: 'API', url: '/api_reference.html' }
                ].map(link => (
                  <a 
                    key={link.label} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[7px] font-black uppercase tracking-widest leading-none mt-0.5 hover:text-red-500 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
             </div>
             <div className="flex gap-1">
                {['W','A','S','D'].map(k => (
                  <span key={k} className="px-1.5 py-0.5 border border-white/20 rounded text-[7px] font-black">{k}</span>
                ))}
             </div>
             <span className="text-[7px] font-black uppercase tracking-widest leading-none mt-0.5">Control_Input_Ready</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[7px] font-black uppercase tracking-widest leading-none mt-0.5 whitespace-nowrap">Engine_Stable // v1.7.4.42_R3</span>
          </div>
       </div>
       <div className="h-0.5 w-full bg-red-600 mt-2 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
    </footer>
  );
};
