import React from "react";
import { Store, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-100 text-slate-500 py-4 px-6 border-t border-slate-200 font-sans text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Sync indicators from bento footer */}
        <div className="flex flex-wrap gap-4">
          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
            <span>Sincronizando con Google Sheets</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>WhatsApp Web API Activa</span>
          </div>
        </div>

        {/* Brand credit */}
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center sm:text-right">
          Bodega Inteligente v1.0.4 • PMV Chorrillos • © 2026 Belthi y Nancy
        </div>

      </div>
    </footer>
  );
};
