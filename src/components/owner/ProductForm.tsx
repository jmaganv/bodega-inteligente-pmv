import React, { useState, useEffect } from "react";
import { Product } from "../../types/product";
import { CATEGORIES } from "../../utils/constants";
import { X, Save } from "lucide-react";

export const PREDEFINED_UNITS = [
  { value: "unidad", label: "Unidad (und)" },
  { value: "kg", label: "Kilogramo (kg)" },
  { value: "litro", label: "Litro (L)" },
  { value: "paquete", label: "Paquete (paq)" },
  { value: "botella", label: "Botella (bot)" },
  { value: "lata", label: "Lata" },
  { value: "bolsa", label: "Bolsa" },
  { value: "caja", label: "Caja" },
  { value: "barra", label: "Barra" }
];

interface ProductFormProps {
  product?: Product | null; // if product is provided, we edit it; else we create a new one
  onClose: () => void;
  onSave: (p: Partial<Product>) => Promise<void>;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSave }) => {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(1);
  const [minStock, setMinStock] = useState<number>(1);
  const [unit, setUnit] = useState<string>("unidad");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price);
      setCostPrice(product.costPrice || 0);
      setStock(product.stock);
      setMinStock(product.minStock);
      setUnit(product.unit);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const payload: Partial<Product> = {
        name,
        category,
        price,
        costPrice,
        stock,
        minStock,
        unit,
      };
      await onSave(payload);
      // Cierra inmediatamente despues de guardar para evitar re-renders involuntarios
      onClose();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Hubo un error al guardar el producto: " + err.message);
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        // Solo cierra si se hace click en el fondo (fuera del formulario)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        // Cerrar con ESC
        if (e.key === "Escape") {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Form Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <h3 className="font-extrabold text-sm uppercase tracking-wide text-amber-400">
            {product ? "📝 Editar Producto" : "➕ Nuevo Producto"}
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Cerrar formulario"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nombre del Producto:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Arroz Extra Costeño 1kg"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
              id="form-product-name"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Categoría:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                id="form-product-category"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Unidad de Medida:</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                id="form-product-unit"
              >
                {PREDEFINED_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Precio Venta (S/.):</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                id="form-product-price"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Precio Costo (S/.):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-500"
                id="form-product-cost-price"
              />
            </div>
          </div>

          {/* Stocks Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Stock Actual:</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                id="form-product-stock"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Stock Mínimo (Alerta):</label>
              <input
                type="number"
                required
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                id="form-product-min-stock"
              />
            </div>
          </div>

          {/* CTA Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
              id="form-product-submit"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Guardando..." : "Guardar Producto"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
