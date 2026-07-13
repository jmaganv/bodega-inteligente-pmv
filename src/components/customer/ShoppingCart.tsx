import React, { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { CheckoutForm } from "./CheckoutForm";
import { formatCurrency } from "../../utils/formatters";
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, ArrowRight, CornerDownLeft } from "lucide-react";

export const ShoppingCart: React.FC = () => {
  const { cart, total, subtotal, offers, itemCount, updateCartQty, removeFromCart, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  
  if (showCheckout) {
    return <CheckoutForm onBack={() => setShowCheckout(false)} />;
  }

  return (
    <div 
      className="bg-white rounded-2xl border-2 border-slate-200 p-5 space-y-6 font-sans shadow-sm focus:outline-none transition-all duration-300"
      id="customer-shopping-cart-container"
      tabIndex={-1}
    >
      
      {/* Header Cart */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
            <CartIcon className="h-4.5 w-4.5" id="cart-header-icon" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Tu Carrito</h3>
            <p className="text-[10px] text-slate-400 font-medium">Llevas {itemCount} producto(s)</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-wider transition-colors"
            id="cart-clear-btn"
          >
            Vaciar todo
          </button>
        )}
      </div>

      {/* Cart Items List */}
      {cart.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
          <div className="h-12 w-12 bg-slate-50 border-2 border-slate-100 text-slate-400 rounded-xl flex items-center justify-center mb-1">
            <CartIcon className="h-5 w-5" />
          </div>
          <p className="text-slate-500 text-sm font-bold">Carrito Vacío</p>
          <p className="text-slate-400 text-xs max-w-[200px] leading-normal">
            Agrega productos de nuestro catálogo casero o pídele a nuestra IA.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
          {cart.map((item) => {
            const activeOffer = offers?.find(o => o.productId === item.product.id && o.active);
            const itemPrice = activeOffer ? activeOffer.discountPrice : item.product.price;
            const itemTotal = itemPrice * item.quantity;
            return (
              <div 
                key={item.product.id}
                className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border-2 border-slate-200/60"
                id={`cart-item-${item.product.id}`}
              >
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate leading-snug">
                    {item.product.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    {activeOffer ? (
                      <>
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatCurrency(item.product.price)}
                        </span>
                        <span className="text-[10px] text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 flex items-center gap-0.5">
                          🏷️ {formatCurrency(activeOffer.discountPrice)} / {item.product.unit}
                        </span>
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-medium">
                        {formatCurrency(item.product.price)} / {item.product.unit}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tactile Quantity Box (+ / -) */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    onClick={() => {
                      const isKg = item.product.unit.toLowerCase().includes("kg");
                      const step = isKg ? 0.1 : 1;
                      updateCartQty(item.product.id, Math.max(0, Number((item.quantity - step).toFixed(2))));
                    }}
                    className="p-1 hover:bg-slate-50 rounded text-slate-600 transition-colors"
                    title={item.product.unit.toLowerCase().includes("kg") ? "Restar 0.1 kg" : "Restar uno"}
                    id={`cart-btn-dec-${item.product.id}`}
                  >
                    <Minus className="h-3 w-3 stroke-[3]" />
                  </button>
                  {item.product.unit.toLowerCase().includes("kg") ? (
                    <div className="flex items-center px-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0) {
                            updateCartQty(item.product.id, Number(val.toFixed(3)));
                          } else if (e.target.value === "") {
                            updateCartQty(item.product.id, 0);
                          }
                        }}
                        className="w-14 px-1 py-0.5 text-center text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        title="Modificar peso exacto"
                      />
                      <span className="text-[10px] text-slate-500 font-extrabold ml-0.5">kg</span>
                    </div>
                  ) : (
                    <span className="px-1 text-xs font-extrabold text-slate-850 min-w-[45px] text-center font-mono">
                      {item.quantity}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      const isKg = item.product.unit.toLowerCase().includes("kg");
                      const step = isKg ? 0.1 : 1;
                      updateCartQty(item.product.id, Number((item.quantity + step).toFixed(2)));
                    }}
                    className="p-1 hover:bg-slate-50 rounded text-slate-600 transition-colors"
                    title={item.product.unit.toLowerCase().includes("kg") ? "Sumar 0.1 kg" : "Sumar uno"}
                    id={`cart-btn-inc-${item.product.id}`}
                  >
                    <Plus className="h-3 w-3 stroke-[3]" />
                  </button>
                </div>

                {/* Delete and item total */}
                <div className="text-right flex flex-col items-end justify-between min-w-[75px]">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors mb-0.5"
                    title="Eliminar producto"
                    id={`cart-btn-remove-${item.product.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-bold text-xs text-slate-900 font-mono">
                    {formatCurrency(itemTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Summary and checkout trigger */}
      {cart.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-4">
          {subtotal > total && (
            <div className="bg-rose-50/50 border border-rose-100/60 p-3 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal (precio regular):</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Ahorro por Ofertas:</span>
                <span className="font-mono">-{formatCurrency(subtotal - total)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-900 font-extrabold bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/50">
            <span className="text-xs sm:text-sm uppercase tracking-wider text-slate-600">Total de tu Pedido:</span>
            <span className="text-lg text-indigo-950 font-sans font-black font-mono">{formatCurrency(total)}</span>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm py-4 px-6 rounded-xl shadow-sm transition-transform hover:scale-[1.02]"
            id="cart-checkout-btn"
          >
            <span>Proceder al Pedido</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
    </div>
  );
};
