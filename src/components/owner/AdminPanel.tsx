import React, { useState } from "react";
import { POS } from "./POS";
import { InventoryGrid } from "./InventoryGrid";
import { SalesHistory } from "./SalesHistory";
import { StockAlerts } from "./StockAlerts";
import { OfferForm } from "./OfferForm";
import { SettingsModal } from "./SettingsModal";
import { useOffers } from "../../hooks/useOffers";
import { formatCurrency } from "../../utils/formatters";
import { ShoppingCart, LayoutGrid, Receipt, Sparkles, Settings as SettingsIcon, Plus, Trash2 } from "lucide-react";
import { Offer } from "../../types/offer";

export const AdminPanel: React.FC = () => {
  const { offers, addOffer, deleteOffer } = useOffers();
  
  const [activeTab, setActiveTab] = useState<"pos" | "inventory" | "sales" | "promotions">("pos");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showOfferForm, setShowOfferForm] = useState<boolean>(false);
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);

  const handleSaveOffer = async (oPayload: Partial<Offer>) => {
    await addOffer(oPayload);
  };

  const handleDeleteOffer = async (id: string) => {
    await deleteOffer(id);
    setDeletingOfferId(null);
  };

  return (
    <div className="space-y-6 font-sans" id="owner-admin-panel">
      
      {/* Top dashboard heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black font-sans text-slate-900 tracking-tight">
            Panel de Control • Bodega Inteligente
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Caja táctil rápida, administración de catálogo, promociones, alertas y pedidos en tiempo real.
          </p>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg border-2 border-slate-200 shadow-sm transition-all"
          id="btn-open-settings"
        >
          <SettingsIcon className="h-4 w-4" />
          <span>Configurar</span>
        </button>
      </div>

      {/* Critical short-term stock warnings, automatically shown to the owner */}
      <StockAlerts />

      {/* Admin Tab Navigational Rail - Bento Selector */}
      <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border-2 border-slate-200 gap-1 sm:gap-0">
        {[
          { id: "pos", label: "⚡ Caja Rápida", icon: ShoppingCart },
          { id: "inventory", label: "📦 Inventario (Sheets)", icon: LayoutGrid },
          { id: "sales", label: "📋 Ventas", icon: Receipt },
          { id: "promotions", label: "🏷️ Promociones", icon: Sparkles }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-xs font-black transition-all ${
                isSelected
                  ? "bg-indigo-950 text-white font-black shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id={`admin-tab-btn-${tab.id}`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Tab Component */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
        {activeTab === "pos" && <POS />}
        {activeTab === "inventory" && <InventoryGrid />}
        {activeTab === "sales" && <SalesHistory />}
        {activeTab === "promotions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Ofertas y Promociones</h3>
                <p className="text-[10px] text-slate-400 font-medium">Anuncia precios especiales para impulsar tus ventas</p>
              </div>

              <button
                onClick={() => setShowOfferForm(true)}
                className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-3.5 py-2.5 rounded-lg shadow-sm transition-all"
                id="btn-create-offer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Agregar Oferta</span>
              </button>
            </div>

            {/* List of active offers */}
            {offers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No hay ofertas configuradas en este momento.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.map(offer => (
                  <div 
                    key={offer.id}
                    className="p-4 bg-orange-50/20 border-2 border-orange-200/50 rounded-xl flex items-start justify-between gap-4"
                    id={`offer-card-${offer.id}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-orange-100 text-orange-800 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-orange-200">
                          PROMO
                        </span>
                        <h4 className="font-bold text-xs text-slate-900">{offer.productName}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-normal">{offer.description}</p>
                      <p className="text-xs font-extrabold text-slate-900">
                        Precio Promo: <span className="text-sm font-black text-slate-950 font-mono">{formatCurrency(offer.discountPrice)}</span>
                      </p>
                    </div>

                    {deletingOfferId === offer.id ? (
                      <div className="flex flex-col items-end gap-1.5 shrink-0 animate-fade-in">
                        <span className="text-[10px] text-rose-600 font-extrabold">¿Borrar?</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] px-2 py-1 rounded shadow-xs transition-colors"
                            id={`offer-confirm-delete-btn-${offer.id}`}
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setDeletingOfferId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] px-2 py-1 rounded transition-colors"
                            id={`offer-cancel-delete-btn-${offer.id}`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingOfferId(offer.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-200 rounded-lg transition-all shrink-0"
                        title="Eliminar oferta"
                        id={`offer-delete-btn-${offer.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Create Offer Modal */}
      {showOfferForm && (
        <OfferForm
          onClose={() => setShowOfferForm(false)}
          onSave={handleSaveOffer}
        />
      )}

    </div>
  );
};
