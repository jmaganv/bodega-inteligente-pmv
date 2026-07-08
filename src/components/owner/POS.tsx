import React, { useState, useMemo } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useSales } from "../../hooks/useSales";
import { useOffers } from "../../hooks/useOffers";
import { formatCurrency } from "../../utils/formatters";
import { Plus, Minus, Trash2, ShoppingBag, CreditCard, ChevronRight, Check, Scale } from "lucide-react";
import { Product } from "../../types/product";

interface POSItem {
  product: Product;
  quantity: number;
}

export const POS: React.FC = () => {
  const { products, filteredProducts, selectedCategory, setSelectedCategory } = useProducts();
  const { registerSale } = useSales();
  const { offers } = useOffers();

  const [ticketItems, setTicketItems] = useState<POSItem[]>([]);
  const [posSearch, setPosSearch] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mobileActiveView, setMobileActiveView] = useState<"catalog" | "ticket">("catalog");

  // States for precision weighing modal
  const [weighingProduct, setWeighingProduct] = useState<Product | null>(null);
  const [inputWeight, setInputWeight] = useState<string>("1.000");

  // Search filter specifically inside POS
  const posFilteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || 
                            p.category.toLowerCase().includes(posSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, posSearch]);

  const addToTicket = (product: Product) => {
    if (product.stock <= 0) return; // Prevent out of stock POS additions
    
    const isKg = product.unit.toLowerCase().includes("kg") || product.unit.toLowerCase().includes("kilo");
    if (isKg) {
      const existing = ticketItems.find(item => item.product.id === product.id);
      setWeighingProduct(product);
      setInputWeight(existing ? existing.quantity.toFixed(3) : "1.000");
      return;
    }

    setTicketItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        // Prevent exceeding stock limit
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateTicketQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setTicketItems(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && qty > product.stock) return; // Stock guard

    setTicketItems(prev => 
      prev.map(item => 
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeTicketItem = (productId: string) => {
    setTicketItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const ticketTotal = useMemo(() => {
    return ticketItems.reduce((acc, curr) => {
      const activeOffer = offers?.find(o => o.productId === curr.product.id && o.active);
      const price = activeOffer ? activeOffer.discountPrice : curr.product.price;
      return acc + (price * curr.quantity);
    }, 0);
  }, [ticketItems, offers]);

  const ticketItemCount = useMemo(() => {
    return ticketItems.reduce((acc, curr) => {
      const isKg = curr.product.unit.toLowerCase().includes("kg") || curr.product.unit.toLowerCase().includes("kilo");
      return acc + (isKg ? 1 : curr.quantity);
    }, 0);
  }, [ticketItems]);

  const handleCheckout = async (paymentMethod: "Yape" | "Plin" | "Efectivo") => {
    if (ticketItems.length === 0) return;

    try {
      // Map POS items to ShoppingCart items
      const itemsToRegister = ticketItems.map(item => ({
        product: item.product,
        quantity: item.quantity
      }));

      await registerSale(itemsToRegister, paymentMethod, "completado");
      setSuccessMsg(`¡Venta cobrada con éxito por ${formatCurrency(ticketTotal)} vía ${paymentMethod}!`);
      setTicketItems([]);
      
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err) {
      console.error("POS Checkout error:", err);
      alert("Error al guardar la venta.");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-fadeIn" id="pos-interface-wrapper">
      {/* Mobile view selectors - Only visible on mobile/tablet screens < 768px */}
      <div className="flex md:hidden bg-slate-100 p-1 rounded-xl border-2 border-slate-200 gap-1 shrink-0">
        <button
          onClick={() => setMobileActiveView("catalog")}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-black transition-all ${
            mobileActiveView === "catalog"
              ? "bg-orange-500 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-800 font-bold"
          }`}
        >
          🛍️ Catálogo
        </button>
        <button
          onClick={() => setMobileActiveView("ticket")}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            mobileActiveView === "ticket"
              ? "bg-indigo-950 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-800 font-bold"
          }`}
        >
          🛒 Ticket ({ticketItemCount})
          {ticketTotal > 0 && (
            <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-[9px] font-black">
              S/. {ticketTotal.toFixed(2)}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 font-sans h-auto md:h-[650px] overflow-hidden" id="pos-interface-container">
        
        {/* LEFT PANEL: Tactile Product Tapping Grid */}
        <div className={`md:col-span-7 flex flex-col justify-start space-y-4 h-full ${
          mobileActiveView === "catalog" ? "flex" : "hidden md:flex"
        }`}>
          
          {/* POS Search bar & category row */}
          <div className="space-y-3 shrink-0">
            <input
              type="text"
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-950 placeholder-slate-400 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-xs"
              id="pos-product-search"
            />

            {/* POS category selectors - Large tactile pills */}
            <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("Todos")}
                className={`px-3.5 py-2 rounded-lg text-[10px] font-black shrink-0 transition-all ${
                  selectedCategory === "Todos"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50 font-bold"
                }`}
              >
                Todos
              </button>
              {Array.from(new Set(products.map(p => p.category))).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-lg text-[10px] font-black shrink-0 transition-all ${
                    selectedCategory === cat
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50 font-bold"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Tapping Tiles Grid */}
          <div className="flex-1 overflow-y-auto min-h-0 max-h-[400px] md:max-h-[480px] grid grid-cols-3 sm:grid-cols-4 gap-2.5 pr-1 content-start scrollbar-thin">
            {posFilteredProducts.map(product => {
              const isOutOfStock = product.stock <= 0;
              const inTicket = ticketItems.find(t => t.product.id === product.id);
              const inTicketQty = inTicket ? inTicket.quantity : 0;

              return (
                <button
                  key={product.id}
                  disabled={isOutOfStock}
                  onClick={() => addToTicket(product)}
                  className={`relative p-3 rounded-xl border-2 flex flex-col justify-between text-left transition-all h-[110px] ${
                    isOutOfStock
                      ? "bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed"
                      : inTicketQty > 0
                      ? "bg-orange-50/80 border-orange-400 scale-98 ring-2 ring-orange-400/30"
                      : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                  }`}
                  style={{ contentVisibility: "auto" }}
                  id={`pos-tile-${product.id}`}
                >
                  {/* Visual badge for current qty in ticket */}
                  {inTicketQty > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white font-extrabold text-[10px] h-5 w-5 rounded-full flex items-center justify-center border border-orange-400">
                      {inTicketQty}
                    </span>
                  )}

                  <div>
                    <h4 className="font-extrabold text-[11px] text-slate-900 leading-tight line-clamp-2">
                      {product.name}
                    </h4>
                    <span className="text-[9px] text-slate-400 block mt-1 font-medium">
                      Stock: {product.stock} {product.unit}
                    </span>
                  </div>

                  <div className="mt-3 pt-1.5 border-t border-slate-100 flex items-center justify-between w-full">
                    <span className="font-black text-xs text-slate-950 font-mono">
                      S/. {product.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobile floating pay button */}
          {ticketItems.length > 0 && (
            <button
              onClick={() => setMobileActiveView("ticket")}
              className="md:hidden w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-between transition-all mt-2 animate-pulse"
            >
              <span className="flex items-center gap-2">
                🛒 Ver Ticket de Compra ({ticketItemCount} art.)
              </span>
              <span className="bg-emerald-800 text-white px-2 py-1 rounded font-mono font-black text-[11px]">
                S/. {ticketTotal.toFixed(2)} • Cobrar ⚡
              </span>
            </button>
          )}
        </div>

        {/* RIGHT PANEL: Current Sales Ticket & Checkout */}
        <div className={`md:col-span-5 bg-indigo-950 text-white rounded-2xl p-4 flex flex-col justify-between h-full shadow-md border-2 border-indigo-850 ${
          mobileActiveView === "ticket" ? "flex" : "hidden md:flex"
        }`}>
        
        {/* Ticket Header */}
        <div className="border-b border-indigo-900 pb-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-4.5 w-4.5 text-orange-400" />
            <h3 className="font-extrabold text-sm tracking-wide text-slate-100">Ticket de Compra</h3>
          </div>
          <span className="bg-indigo-900 text-indigo-200 text-[10px] font-bold font-mono px-2 py-0.5 rounded-md">
            {ticketItemCount} Art.
          </span>
        </div>

        {/* Sales success toast overlay */}
        {successMsg && (
          <div className="my-2 p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-fadeIn">
            <Check className="h-4 w-4 stroke-[3]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto my-3 space-y-2 pr-1 min-h-0 max-h-[220px] md:max-h-[340px] scrollbar-thin">
          {ticketItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-10 text-slate-500 text-center space-y-2">
              <span className="text-xl">📥</span>
              <p className="text-xs font-bold">Ticket Vacío</p>
              <p className="text-[10px] text-slate-600 max-w-[160px] leading-normal">
                Toca productos de la izquierda para agregarlos al ticket.
              </p>
            </div>
          ) : (
            ticketItems.map((item) => {
              const activeOffer = offers?.find(o => o.productId === item.product.id && o.active);
              const itemPrice = activeOffer ? activeOffer.discountPrice : item.product.price;
              const totalCost = itemPrice * item.quantity;
              const isKg = item.product.unit.toLowerCase().includes("kg") || item.product.unit.toLowerCase().includes("kilo");
              return (
                <div 
                  key={item.product.id}
                  className="flex items-center justify-between p-2.5 bg-indigo-900/40 rounded-xl border border-indigo-900/60"
                  id={`pos-ticket-item-${item.product.id}`}
                >
                  <div 
                    className="flex-1 min-w-0 pr-2 cursor-pointer hover:opacity-80"
                    onClick={() => {
                      if (isKg) {
                        setWeighingProduct(item.product);
                        setInputWeight(item.quantity.toFixed(3));
                      }
                    }}
                    title={isKg ? "Haga clic para ajustar peso exacto" : ""}
                  >
                    <h5 className="font-bold text-[11px] text-slate-100 truncate leading-normal flex items-center gap-1">
                      {item.product.name}
                      {isKg && (
                        <Scale className="h-3 w-3 text-orange-400 shrink-0" />
                      )}
                    </h5>
                    <div className="text-[9px] text-indigo-300 font-mono mt-0.5 flex flex-wrap items-center gap-1">
                      {activeOffer ? (
                        <>
                          <span className="line-through text-indigo-400/50">
                            {formatCurrency(item.product.price)}
                          </span>
                          <span className="text-rose-400 font-bold bg-rose-950/40 px-1 rounded">
                            🏷️ {formatCurrency(itemPrice)}
                          </span>
                        </>
                      ) : (
                        <span>{formatCurrency(item.product.price)}</span>
                      )}
                      <span>x {isKg ? `${item.quantity.toFixed(3)} kg` : `${item.quantity} und`}</span>
                    </div>
                  </div>

                  {/* Qty incrementer */}
                  <div className="flex items-center space-x-1.5 mr-3">
                    <button
                      onClick={() => {
                        const step = isKg ? 0.1 : 1;
                        updateTicketQty(item.product.id, Number((item.quantity - step).toFixed(3)));
                      }}
                      className="p-1 hover:bg-indigo-800 bg-indigo-900 rounded text-slate-200 transition-colors"
                      id={`pos-btn-dec-${item.product.id}`}
                      title={isKg ? "Restar 100 gramos" : "Restar uno"}
                    >
                      <Minus className="h-2.5 w-2.5 stroke-[3]" />
                    </button>
                    <span className="text-[10px] font-bold font-mono min-w-[45px] text-center text-slate-200">
                      {isKg ? `${item.quantity.toFixed(3)} kg` : item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        const step = isKg ? 0.1 : 1;
                        updateTicketQty(item.product.id, Number((item.quantity + step).toFixed(3)));
                      }}
                      className="p-1 hover:bg-indigo-800 bg-indigo-900 rounded text-slate-200 transition-colors"
                      id={`pos-btn-inc-${item.product.id}`}
                      title={isKg ? "Sumar 100 gramos" : "Sumar uno"}
                    >
                      <Plus className="h-2.5 w-2.5 stroke-[3]" />
                    </button>
                  </div>

                  {/* Actions and cost */}
                  <div className="text-right flex items-center space-x-2 shrink-0">
                    <span className="font-bold text-xs text-slate-100 font-mono">
                      S/. {totalCost.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeTicketItem(item.product.id)}
                      className="text-indigo-400 hover:text-red-400 transition-colors"
                      id={`pos-btn-remove-${item.product.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ticket Totalizer & Pay Panel */}
        <div className="border-t border-indigo-900 pt-3 shrink-0 space-y-3">
          <div className="flex items-center justify-between font-extrabold text-slate-300">
            <span className="text-xs uppercase tracking-wider font-bold">Total Venta:</span>
            <span className="text-xl text-orange-400 font-sans font-black font-mono">
              {formatCurrency(ticketTotal)}
            </span>
          </div>

          {/* Quick Pay Tactile Panel: 3 massive buttons for direct checkout */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              disabled={ticketItems.length === 0}
              onClick={() => handleCheckout("Efectivo")}
              className={`py-3.5 rounded-xl font-bold text-xs text-center flex flex-col items-center justify-center transition-all ${
                ticketItems.length === 0
                  ? "bg-indigo-900 text-indigo-400 cursor-not-allowed border border-indigo-850"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              }`}
              id="pos-pay-efectivo"
            >
              <span>💵</span>
              <span className="mt-1 font-extrabold text-[10px]">Efectivo</span>
            </button>
            <button
              disabled={ticketItems.length === 0}
              onClick={() => handleCheckout("Yape")}
              className={`py-3.5 rounded-xl font-bold text-xs text-center flex flex-col items-center justify-center transition-all ${
                ticketItems.length === 0
                  ? "bg-indigo-900 text-indigo-400 cursor-not-allowed border border-indigo-850"
                  : "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
              }`}
              id="pos-pay-yape"
            >
              <span>🟣</span>
              <span className="mt-1 font-extrabold text-[10px]">Yape</span>
            </button>
            <button
              disabled={ticketItems.length === 0}
              onClick={() => handleCheckout("Plin")}
              className={`py-3.5 rounded-xl font-bold text-xs text-center flex flex-col items-center justify-center transition-all ${
                ticketItems.length === 0
                  ? "bg-indigo-900 text-indigo-400 cursor-not-allowed border border-indigo-850"
                  : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
              }`}
              id="pos-pay-plin"
            >
              <span>🟢</span>
              <span className="mt-1 font-extrabold text-[10px]">Plin</span>
            </button>
          </div>
        </div>

      </div>
      </div>

      {/* Precision Weighing Modal */}
      {weighingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border-2 border-indigo-900/30 p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-slate-950">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3 mb-4">
              <div className="h-10 w-10 bg-orange-500 rounded-lg text-white flex items-center justify-center">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Balanza de Precisión</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Bodega Inteligente • Chorrillos</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Product Info Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-900 text-sm">{weighingProduct.name}</h4>
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className="text-slate-500 font-medium">Precio por Kilo:</span>
                  <span className="font-extrabold text-slate-950 font-mono text-sm">{formatCurrency(weighingProduct.price)} / kg</span>
                </div>
                <div className="flex justify-between items-center mt-1 text-xs border-t border-slate-200/50 pt-1">
                  <span className="text-slate-500 font-medium font-sans">Stock Disponible:</span>
                  <span className="font-bold text-indigo-950">{weighingProduct.stock} kg</span>
                </div>
              </div>

              {/* Weight Input */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Peso de la pieza (kg)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.001"
                    min="0.005"
                    max={weighingProduct.stock}
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full text-center font-mono font-black text-2xl text-indigo-950 bg-slate-50 border-2 border-indigo-900/20 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0.000"
                    autoFocus
                  />
                  <span className="absolute right-4 font-black text-slate-400 text-lg">kg</span>
                </div>
              </div>

              {/* Quick Weight Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Pesos Rápidos / Atajos
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "1/4 kg (250g)", value: "0.250" },
                    { label: "1/2 kg (500g)", value: "0.500" },
                    { label: "3/4 kg (750g)", value: "0.750" },
                    { label: "1.0 kg (1kg)", value: "1.000" },
                    { label: "1.5 kg", value: "1.500" },
                    { label: "2.0 kg", value: "2.000" }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setInputWeight(preset.value)}
                      className={`py-1.5 px-2 text-[10px] font-bold border rounded-lg transition-all ${
                        inputWeight === preset.value
                          ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adjusters (+/- 100g, +/- 10g) */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(inputWeight || "0");
                    setInputWeight(Math.max(0, current - 0.1).toFixed(3));
                  }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-extrabold rounded-lg border border-slate-200"
                >
                  - 100g
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(inputWeight || "0");
                    setInputWeight(Math.max(0, current - 0.01).toFixed(3));
                  }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-extrabold rounded-lg border border-slate-200"
                >
                  - 10g
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(inputWeight || "0");
                    setInputWeight(Math.min(weighingProduct.stock, current + 0.01).toFixed(3));
                  }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-extrabold rounded-lg border border-slate-200"
                >
                  + 10g
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(inputWeight || "0");
                    setInputWeight(Math.min(weighingProduct.stock, current + 0.1).toFixed(3));
                  }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-extrabold rounded-lg border border-slate-200"
                >
                  + 100g
                </button>
              </div>

              {/* Real-time Calculation Result */}
              <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-xl text-center">
                <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest">
                  Total en Soles a Cobrar
                </p>
                <p className="text-3xl font-black text-orange-600 font-mono mt-1">
                  {formatCurrency(weighingProduct.price * parseFloat(inputWeight || "0"))}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWeighingProduct(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalWeight = parseFloat(inputWeight || "0");
                  if (finalWeight <= 0) return;
                  
                  // Save item to ticket with finalWeight as quantity
                  setTicketItems(prev => {
                    const existing = prev.find(item => item.product.id === weighingProduct.id);
                    if (existing) {
                      return prev.map(item => 
                        item.product.id === weighingProduct.id 
                          ? { ...item, quantity: finalWeight } 
                          : item
                      );
                    }
                    return [...prev, { product: weighingProduct, quantity: finalWeight }];
                  });
                  setWeighingProduct(null);
                }}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-lg shadow-sm"
              >
                Confirmar y Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
