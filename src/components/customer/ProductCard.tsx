import React from "react";
import { Product } from "../../types/product";
import { formatCurrency } from "../../utils/formatters";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { useCart } from "../../hooks/useCart";

interface ProductCardProps {
  product: Product;
}

// Category fallback icons/colors for beautiful UI without complex images
const getCategoryStyles = (category: string) => {
  switch (category) {
    case "Abarrotes":
      return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: "🌾" };
    case "Lácteos y Huevos":
      return { bg: "bg-sky-50 text-sky-700 border-sky-200", icon: "🥛" };
    case "Pollo y Carnes":
      return { bg: "bg-rose-50 text-rose-700 border-rose-200", icon: "🍗" };
    case "Frutas y Verduras":
      return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "🍎" };
    case "Productos de Limpieza":
      return { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: "🧼" };
    case "Bebidas y Licores":
      return { bg: "bg-purple-50 text-purple-700 border-purple-200", icon: "🍺" };
    default:
      return { bg: "bg-slate-50 text-slate-700 border-slate-200", icon: "📦" };
  }
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cart, offers } = useCart();
  const styles = getCategoryStyles(product.category);

  // Check if item is already in cart
  const cartItem = cart.find(item => item.product.id === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;

  // Check for active promotional offer
  const activeOffer = offers?.find(o => o.productId === product.id && o.active);

  return (
    <div 
      className={`bg-white rounded-2xl border ${isOutOfStock ? "border-slate-100 opacity-65" : "border-slate-200 shadow-sm hover:shadow-md"} p-4 flex flex-col justify-between transition-all duration-200`}
      id={`prod-card-${product.id}`}
    >
      <div>
        {/* Category Badge & Fallback Illustration */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.bg}`}>
            {styles.icon} {product.category}
          </span>
          
          {/* Stock indicator */}
          {isOutOfStock ? (
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              Agotado
            </span>
          ) : product.stock <= product.minStock ? (
            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              Últimas {product.stock}
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 font-medium">
              Disp: {product.stock} {product.unit}s
            </span>
          )}
        </div>

        {/* Product Details */}
        <h3 className="font-sans font-bold text-slate-900 text-sm leading-snug min-h-[40px] mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-3">
          Venta por {product.unit}
        </p>
      </div>

      <div>
        {/* Price & Add Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
          <div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Precio</p>
            {activeOffer ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 line-through leading-none mb-0.5">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm font-sans font-black text-rose-600 flex items-center gap-1 leading-none">
                  {formatCurrency(activeOffer.discountPrice)}
                  <span className="text-[8px] font-extrabold uppercase bg-rose-100 text-rose-700 px-1 py-0.5 rounded-md">
                    Oferta
                  </span>
                </span>
              </div>
            ) : (
              <p className="text-base font-sans font-extrabold text-slate-900">{formatCurrency(product.price)}</p>
            )}
          </div>

          {/* Highly tactile touch target button */}
          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`flex items-center justify-center p-2 rounded-xl transition-all duration-150 relative ${
              isOutOfStock
                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                : cartQty > 0
                ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 scale-105"
                : "bg-amber-400 text-slate-950 hover:bg-amber-500 hover:scale-105"
            }`}
            title="Agregar al carrito"
            id={`btn-add-${product.id}`}
          >
            {cartQty > 0 ? (
              <div className="flex items-center space-x-1 px-1">
                <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                <span className="text-xs font-bold">{cartQty}</span>
              </div>
            ) : (
              <Plus className="h-5 w-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
