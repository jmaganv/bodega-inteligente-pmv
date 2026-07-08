import React, { useState } from "react";
import { useSales } from "../../hooks/useSales";
import { formatCurrency, formatDate, formatFriendlyDate } from "../../utils/formatters";
import { TrendingUp, Clock, CheckCircle2, Phone, Clipboard, Trash2, ArrowRight } from "lucide-react";

export const SalesHistory: React.FC = () => {
  const {
    pendingSales,
    completedSales,
    stats,
    loading,
    error,
    completeSale,
    deleteSale
  } = useSales();

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);

  const handleCompleteOrder = async (id: string) => {
    setCompletingId(id);
    try {
      await completeSale(id);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCompletingId(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteSale(id);
      setDeletingSaleId(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans" id="sales-history-panel">
      
      {/* Sales Analytics Overview (KPIs Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="sales-kpis-grid">
        {/* KPI: Revenue */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-800">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Caja Total (Hoy)</p>
            <p className="text-xl font-extrabold text-amber-400 font-mono mt-1">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="h-10 w-10 bg-amber-400/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-400/20">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Completed Sales Count */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Atenciones Cerradas</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">
              {stats.salesCount} clientes
            </p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Pending WhatsApp Pickups */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Por Recoger (WhatsApp)</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">
              {stats.pendingCount} pendientes
            </p>
          </div>
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* PENDING WA PICKUP ORDERS (7 cols on big screen) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                Cola de Pedidos por Recoger (WhatsApp)
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Llegan en línea de clientes que usaron el asistente</p>
            </div>
            <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
              {pendingSales.length} pendiente(s)
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Sincronizando pedidos...</div>
          ) : pendingSales.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center space-y-1">
              <span className="text-xl">✅</span>
              <p className="text-slate-500 text-xs font-bold">¡Sin colas pendientes!</p>
              <p className="text-[9px] text-slate-400 max-w-xs leading-normal">Los pedidos de WhatsApp se listarán aquí en tiempo real apenas ingresen.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSales.map((sale) => (
                <div 
                  key={sale.id}
                  className="bg-white border border-slate-250 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  id={`pending-sale-card-${sale.id}`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Customer meta details */}
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {sale.id}
                      </span>
                      <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200">
                        👤 {sale.customerName || "Vecino"}
                      </span>
                      {sale.customerPhone && (
                        <>
                          <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                          <span className="text-xs text-indigo-700 font-black bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1 shadow-2xs hover:bg-indigo-100 transition-colors">
                            📞 Cel: <a href={`tel:${sale.customerPhone}`} className="hover:underline font-mono">{sale.customerPhone}</a>
                          </span>
                        </>
                      )}
                      <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                      <span className="bg-amber-100 text-amber-850 text-[9px] font-black px-2 py-0.5 rounded-md border border-amber-250 font-mono">
                        {sale.paymentMethod}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-0.5 border-l-2 border-slate-100 pl-2">
                      {sale.items.map((item, idx) => (
                        <p key={idx} className="text-xs text-slate-600 font-medium">
                          • {item.productName} <strong className="text-slate-900 font-bold">x {item.quantity}</strong>
                        </p>
                      ))}
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono">
                      Registrado: {formatFriendlyDate(sale.date)}
                    </p>
                  </div>

                  {/* Complete actions drawer */}
                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-slate-150 pt-3 sm:pt-0">
                    <div className="sm:mb-2 text-left sm:text-right">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Por cobrar</span>
                      <span className="font-extrabold text-base text-slate-900 font-mono">{formatCurrency(sale.total)}</span>
                    </div>

                     <div className="flex items-center space-x-1.5">
                      {deletingSaleId === sale.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1.5 rounded-xl border border-rose-100 animate-fade-in">
                          <span className="text-[10px] text-rose-600 font-extrabold px-1">¿Anular?</span>
                          <button
                            onClick={() => handleDeleteOrder(sale.id)}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] px-2 py-1.5 rounded-lg transition-colors"
                            id={`pending-confirm-cancel-btn-${sale.id}`}
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setDeletingSaleId(null)}
                            className="bg-slate-250 hover:bg-slate-300 text-slate-700 font-bold text-[10px] px-2 py-1.5 rounded-lg transition-colors"
                            id={`pending-cancel-cancel-btn-${sale.id}`}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingSaleId(sale.id)}
                          className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 border border-slate-200 hover:border-rose-100 rounded-xl transition-colors"
                          title="Cancelar pedido"
                          id={`pending-cancel-btn-${sale.id}`}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      )}

                      <button
                        disabled={completingId === sale.id}
                        onClick={() => handleCompleteOrder(sale.id)}
                        className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-transform hover:scale-102"
                        id={`pending-complete-btn-${sale.id}`}
                      >
                        <span>{completingId === sale.id ? "Entregando..." : "Entregar / Cobrar"}</span>
                        <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT COMPLETED SALES LOG (5 cols on big screen) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              Historial de Ventas Completadas
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Auditoría en tiempo real de ingresos acumulados</p>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
            {completedSales.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No hay ventas registradas aún.</div>
            ) : (
              completedSales.map((sale) => (
                <div 
                  key={sale.id}
                  className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between"
                  id={`completed-sale-row-${sale.id}`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-[10px] text-slate-400 font-mono">{sale.id}</span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${
                        sale.paymentMethod === "Yape"
                          ? "bg-purple-100 text-purple-800"
                          : sale.paymentMethod === "Plin"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {sale.paymentMethod}
                      </span>
                      {sale.customerName && (
                        <span className="text-[10px] text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-slate-200">
                          👤 {sale.customerName}
                        </span>
                      )}
                      {sale.customerPhone && (
                        <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-indigo-100">
                          📞 {sale.customerPhone}
                        </span>
                      )}
                    </div>
                    
                    {/* Inline items summary */}
                    <p className="text-[11px] text-slate-600 font-medium truncate mt-1">
                      {sale.items.map(i => `${i.productName} x${i.quantity}`).join(", ")}
                    </p>

                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                      {formatFriendlyDate(sale.date)}
                    </span>
                  </div>

                  <span className="font-extrabold text-xs text-slate-950 font-mono shrink-0">
                    + {formatCurrency(sale.total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
