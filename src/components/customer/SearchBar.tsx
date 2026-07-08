import React from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES } from "../../utils/constants";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <div className="space-y-4">
      {/* Search Bar Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busca arroz, pollo, leche, pisco, cerveza, etc..."
          className="block w-full pl-11 pr-10 py-3.5 border border-slate-200 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-sans focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm text-sm"
          id="product-search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Category Pill Selector (Wrapping for perfect visibility across all viewports) */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("Todos")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            selectedCategory === "Todos"
              ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
          id="category-pill-all"
        >
          🌟 Todos
        </button>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          // Map visual icons for pills
          let icon = "📦";
          if (category === "Abarrotes") icon = "🌾";
          else if (category === "Lácteos y Huevos") icon = "🥛";
          else if (category === "Pollo y Carnes") icon = "🍗";
          else if (category === "Frutas y Verduras") icon = "🍎";
          else if (category === "Productos de Limpieza") icon = "🧼";
          else if (category === "Bebidas y Licores") icon = "🍺";

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSelected
                  ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
              id={`category-pill-${category.replace(/\s+/g, "-")}`}
            >
              {icon} {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
