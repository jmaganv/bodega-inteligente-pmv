import React from "react";
import { useProducts } from "../../hooks/useProducts";
import { AlertTriangle, AlertCircle, ShoppingCart } from "lucide-react";

export const StockAlerts: React.FC = () => {
  const { lowStockProducts } = useProducts();

  if (lowStockProducts.length === 0) {
    return null;
  }

  // Split into Critical (stock = 0) vs Warning (stock <= minStock)
  const critical = lowStockProducts.filter(p => p.stock === 0);
  const warning = lowStockProducts.filter(p => p.stock > 0);

  return (
    <div className="space-y-3 font-sans" id="stock-alerts-panel">
      {/* Critical shortages */}
      {critical.length > 0 && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start space-x-3 text-red-950">
          <AlertCircle className="h-5.5 w-5.5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <h4 className="font-extrabold text-xs text-red-850 uppercase tracking-wider">🚨 AGOTADOS (Surtido urgente):</h4>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {critical.map(p => (
                <span 
                  key={p.id}
                  className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-1 rounded-md border border-red-200"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Warning shortages */}
      {warning.length > 0 && (
        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl flex items-start space-x-3 text-orange-950">
          <AlertTriangle className="h-5.5 w-5.5 text-orange-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-extrabold text-xs text-orange-850 uppercase tracking-wider">⚠️ STOCK BAJO (Por agotarse):</h4>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {warning.map(p => (
                <span 
                  key={p.id}
                  className="bg-orange-100 text-orange-800 text-[10px] font-black px-2 py-1 rounded-md border border-orange-200"
                >
                  {p.name} ({p.stock} {p.unit}s rest.)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
