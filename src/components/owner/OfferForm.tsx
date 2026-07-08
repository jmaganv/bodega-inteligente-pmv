import React, { useState, useEffect } from "react";
import { Offer } from "../../types/offer";
import { Product } from "../../types/product";
import { useProducts } from "../../hooks/useProducts";
import { X, Save, Sparkles } from "lucide-react";

interface OfferFormProps {
  offer?: Offer | null;
  onClose: () => void;
  onSave: (o: Partial<Offer>) => Promise<void>;
}

export const OfferForm: React.FC<OfferFormProps> = ({ offer, onClose, onSave }) => {
  const { products } = useProducts();
  const [productId, setProductId] = useState<string>("");
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [active, setActive] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
  }, [products, productId]);

  useEffect(() => {
    if (offer) {
      setProductId(offer.productId);
      setDiscountPrice(offer.discountPrice);
      setDescription(offer.description);
      setActive(offer.active);
    }
  }, [offer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || discountPrice <= 0 || !description.trim()) return;

    const matchedProduct = products.find(p => p.id === productId);
    if (!matchedProduct) return;

    setSaving(true);
    try {
      const payload: Partial<Offer> = {
        productId,
        productName: matchedProduct.name,
        discountPrice,
        description,
        active,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("Error saving offer:", err);
      alert("Hubo un error al guardar la oferta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <h3 className="font-extrabold text-sm uppercase tracking-wide text-amber-400 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5" />
            {offer ? "📝 Editar Promoción" : "➕ Crear Promoción / Oferta"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Select Product */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Selecciona Producto:</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              id="form-offer-product"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (Regular: S/. {p.price.toFixed(2)})</option>
              ))}
            </select>
          </div>

          {/* Discount Price */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Precio Oferta Especial (S/.):</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
              id="form-offer-price"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Copia Promocional / Detalle:</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. ¡Lleva 2 latas por solo S/. 8.00! Promoción válida hasta agotar stock."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              id="form-offer-desc"
            ></textarea>
          </div>

          {/* Active status */}
          <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="form-offer-active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="form-offer-active" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
              Promoción Activa (Se mostrará al cliente y a la IA)
            </label>
          </div>

          {/* Action CTAs */}
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
              id="form-offer-submit"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Guardando..." : "Publicar Oferta"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
