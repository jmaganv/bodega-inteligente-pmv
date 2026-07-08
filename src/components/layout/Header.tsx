import React from "react";
import { useApp } from "../../context/AppContext";
import { Store, User, ShieldAlert, BadgeCheck, HelpCircle } from "lucide-react";

export const Header: React.FC = () => {
  const { currentRole, setCurrentRole, products } = useApp();

  // Calculate low stock items count
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <header className="sticky top-0 z-50 w-full bg-indigo-900 text-white shadow-md border-b border-indigo-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-sm shrink-0">
            BI
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold leading-none tracking-tight text-white flex items-center gap-1.5">
              Bodega Inteligente
            </h1>
            <p className="text-xs text-indigo-300 font-medium mt-0.5">
              Chorrillos, Lima • Sede Central
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-4">
          
          {/* Real-time Alerts Badge (only visible to owner or warning) */}
          {lowStockCount > 0 && (
            <div className="flex items-center space-x-1 bg-red-500/20 border border-red-500/40 px-2.5 py-1 rounded-full text-red-300 text-xs font-semibold animate-pulse">
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden md:inline">Alerta Stock:</span>
              <span className="font-bold">{lowStockCount}</span>
            </div>
          )}

          {/* Quick Info / Live Status */}
          <div className="hidden sm:flex items-center space-x-2 bg-indigo-800 px-3 py-1.5 rounded-full border border-indigo-700 text-indigo-200 text-xs font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-semibold uppercase tracking-wider text-[9px]">En Línea • Gemini AI Active</span>
          </div>

          {/* Role Switcher Button - styled with high contrast indigo/orange palette */}
          <div className="flex bg-indigo-950 p-1 rounded-xl border border-indigo-800">
            <button
              onClick={() => setCurrentRole("customer")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentRole === "customer"
                  ? "bg-orange-500 text-white shadow-md font-black"
                  : "text-indigo-200 hover:text-white"
              }`}
              id="role-btn-customer"
            >
              <User className="h-3.5 w-3.5" />
              <span>Cliente</span>
            </button>
            <button
              onClick={() => setCurrentRole("owner")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                currentRole === "owner"
                  ? "bg-orange-500 text-white shadow-md font-black"
                  : "text-indigo-200 hover:text-white"
              }`}
              id="role-btn-owner"
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              <span>Dueño (POS)</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
