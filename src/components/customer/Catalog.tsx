import React from "react";
import { useProducts } from "../../hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { SearchBar } from "./SearchBar";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const Catalog: React.FC = () => {
  const { settings } = useApp();
  const {
    filteredProducts,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useProducts();

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold font-sans text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-500" />
            Catálogo de Productos
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Sugerencias frescas e instantáneas para tu hogar en Chorrillos.
          </p>
        </div>
      </div>

      {/* Reusable search and filter pill panel */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Error or Loading overlays */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
          <p className="text-sm font-medium text-slate-500">Sincronizando inventario...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
          ⚠️ {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <p className="text-slate-400 text-lg mb-1">🔍 No encontramos ese producto</p>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Intenta con otro término, o pregúntale a nuestro *Asistente Inteligente* para ver si {settings?.ownerName || "los dueños"} te lo pueden conseguir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="catalog-products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
