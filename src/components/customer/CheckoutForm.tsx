import React, { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { useSettings } from "../../hooks/useSettings";
import { useSales } from "../../hooks/useSales";
import { whatsappService } from "../../services/whatsappService";
import { PaymentQR } from "../payments/PaymentQR";
import { Send, ArrowLeft, CheckCircle2, MessageSquare, Smartphone } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface CheckoutFormProps {
  onBack: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack }) => {
  const { cart, total, clearCart } = useCart();
  const { settings } = useSettings();
  const { registerSale } = useSales();

  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"Yape" | "Plin" | "Efectivo">("Yape");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    try {
      // 1. Log sale as PENDING in our Sheets/JSON DB so the owner can view & fulfill it on the POS
      await registerSale(cart, paymentMethod, "pendiente", customerPhone, customerName);

      // 2. Generate prefilled WhatsApp link to send the order to the owners
      const link = whatsappService.generateLink({
        phoneNumber: settings.whatsappNumber,
        items: cart,
        total,
        paymentMethod,
        customerName
      });

      setWhatsappUrl(link);
      setIsCompleted(true);
    } catch (err) {
      console.error("Error creating checkout:", err);
      alert("Hubo un error procesando el pedido. Por favor, reintenta.");
    }
  };

  const handleFinishCheckout = () => {
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank");
    clearCart();
    onBack();
  };

  if (isCompleted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-5 font-sans">
        <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
          <CheckCircle2 className="h-9 w-9 stroke-[2.2] animate-bounce" />
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-lg font-extrabold text-slate-900">¡Pedido Registrado con Éxito!</h3>
          <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto">
            El pedido de <strong className="text-slate-800 font-bold">{customerName}</strong> se ha registrado en la bodega <strong className="text-slate-800 font-bold">{settings.bodegaName}</strong> por un total de <strong className="text-slate-800 font-semibold">{formatCurrency(total)}</strong>.
          </p>
        </div>

        {/* Dynamic Payment QR Box */}
        <div className="max-w-xs mx-auto">
          <PaymentQR 
            method={paymentMethod} 
            amount={total} 
            phoneYape={settings.phoneYape} 
            phonePlin={settings.phonePlin} 
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleFinishCheckout}
            className="w-full flex items-center justify-center space-x-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-md transition-transform hover:scale-102"
            id="checkout-wa-confirm-btn"
          >
            <MessageSquare className="h-5 w-5 fill-current" />
            <span>Enviar WhatsApp y Completar</span>
          </button>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">
            Al presionar se abrirá WhatsApp Web/App para enviar la lista de productos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 font-sans">
      
      {/* Header back */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
          title="Regresar al carrito"
          id="checkout-back-btn"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-slate-600" />
        </button>
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">Formulario de Pedido</h3>
          <p className="text-[10px] text-slate-400">Completa tus datos para agendar la recogida en Chorrillos.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tu Nombre / Apodo:</label>
          <input
            type="text"
            required
            placeholder="Ej. Vecino Juan, Casera Patty"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            id="checkout-name-input"
          />
        </div>

        {/* Phone input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Tu Celular (WhatsApp):</label>
          <input
            type="tel"
            required
            pattern="[0-9]{9}"
            maxLength={9}
            placeholder="Ej. 987654321"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            id="checkout-phone-input"
          />
        </div>

        {/* Payment method selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Método de Pago:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "Yape", label: "🟣 Yape" },
              { id: "Plin", label: "🟢 Plin" },
              { id: "Efectivo", label: "💵 Efectivo" }
            ].map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`py-3.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    isSelected
                      ? "bg-slate-900 text-amber-400 border-slate-900 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                  id={`checkout-payment-${method.id}`}
                >
                  {method.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary total */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-700">
          <span className="text-xs font-bold uppercase tracking-wider">Total del Pedido:</span>
          <span className="text-base font-extrabold text-slate-950">{formatCurrency(total)}</span>
        </div>

        {/* Checkout CTA */}
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-sm py-4 px-6 rounded-2xl shadow-sm transition-transform hover:scale-102"
          id="checkout-submit-btn"
        >
          <Send className="h-4 w-4" />
          <span>Generar Pedido</span>
        </button>

      </form>
    </div>
  );
};
