import React, { useState, useEffect, useRef } from "react";
import { Catalog } from "../components/customer/Catalog";
import { ShoppingCart } from "../components/customer/ShoppingCart";
import { ChatAssistant } from "../components/customer/ChatAssistant";
import { ShoppingBag, MessageSquare, HelpCircle, Store } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useApp } from "../context/AppContext";

export const CustomerPage: React.FC = () => {
  const { settings } = useApp();
  const [rightPanel, setRightPanel] = useState<"chat" | "cart">("chat");
  const { itemCount } = useCart();
  const prevCountRef = useRef(itemCount);

  useEffect(() => {
    // When an item is added (count increases), automatically open the cart
    if (itemCount > prevCountRef.current) {
      setRightPanel("cart");

      // Smoothly scroll and focus on the cart container with a beautiful glow effect
      setTimeout(() => {
        const cartContainer = document.getElementById("customer-shopping-cart-container");
        if (cartContainer) {
          cartContainer.scrollIntoView({ behavior: "smooth", block: "center" });
          cartContainer.focus();

          // Apply a glowing ring class
          cartContainer.classList.add("ring-4", "ring-emerald-400", "ring-offset-2", "scale-[1.01]");
          setTimeout(() => {
            cartContainer.classList.remove("ring-4", "ring-emerald-400", "ring-offset-2", "scale-[1.01]");
          }, 1500);
        }
      }, 100);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Top Welcome Banner (Styled as primary Bento Cell) */}
      <div className="bg-indigo-950 text-white rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-indigo-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="space-y-1.5 text-center md:text-left relative z-10">
          <h2 className="text-xl font-black text-white font-sans tracking-tight flex items-center gap-2 justify-center md:justify-start">
            👋 ¡Hola Caserito, Caserita!
          </h2>
          <p className="text-xs text-indigo-200 font-medium leading-relaxed max-w-2xl">
            Bienvenido a nuestra bodega virtual. Pide tus abarrotes, carnes y verduras frescas. Chatea con nuestro <strong className="text-orange-400">Asistente Inteligente</strong> para sugerencias o recetas, agrégalos al carro y paga con Yape/Plin para recogerlo al toque.
          </p>
        </div>

        {/* Bodega Meta Details (Aesthetic accent indicator) */}
        <div className="flex items-center space-x-3 bg-indigo-900/60 border border-indigo-700/60 p-4 rounded-xl shrink-0 relative z-10">
          <div className="h-10 w-10 bg-orange-500 rounded-lg text-white flex items-center justify-center font-extrabold text-xl shadow-sm">
            🏡
          </div>
          <div className="text-xs">
            <p className="font-extrabold text-orange-400">Atención Directa</p>
            <p className="text-indigo-200 font-bold">{settings?.ownerName || "Propietarios"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: Catalog Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
          <Catalog />
        </div>

        {/* RIGHT COMPONENT: Interactive Side Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Panel Selector (Chat vs Cart) - tactile selectors */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setRightPanel("chat")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-xs font-black transition-all ${
                rightPanel === "chat"
                  ? "bg-white text-indigo-950 shadow-sm font-black border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="cust-panel-btn-chat"
            >
              <MessageSquare className="h-4.5 w-4.5 text-orange-500" />
              <span>Pregúntale a María (IA)</span>
            </button>
            
            <button
              onClick={() => setRightPanel("cart")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-xs font-black transition-all ${
                rightPanel === "cart"
                  ? "bg-white text-indigo-950 shadow-sm font-black border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="cust-panel-btn-cart"
            >
              <ShoppingBag className="h-4.5 w-4.5 text-emerald-500" />
              <span>Tu Carrito de Compras</span>
            </button>
          </div>

          {/* Panel Render */}
          <div className="animate-fadeIn">
            {rightPanel === "chat" ? (
              <ChatAssistant />
            ) : (
              <ShoppingCart />
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
