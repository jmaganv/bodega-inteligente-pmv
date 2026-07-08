import React from "react";
import { formatCurrency } from "../../utils/formatters";
import { CreditCard, Check, Smartphone, Info } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface PaymentQRProps {
  method: "Yape" | "Plin" | "Efectivo";
  amount: number;
  phoneYape: string;
  phonePlin: string;
}

export const PaymentQR: React.FC<PaymentQRProps> = ({ method, amount, phoneYape, phonePlin }) => {
  const { settings } = useApp();
  if (method === "Efectivo") {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900 font-sans">
        <Smartphone className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wide">Pago contra entrega en efectivo</h4>
          <p className="text-xs text-amber-800 leading-normal mt-1">
            Por favor, paga tus <strong className="font-bold">{formatCurrency(amount)}</strong> directamente en efectivo al momento de recoger tus productos en la bodega.
          </p>
        </div>
      </div>
    );
  }

  const isYape = method === "Yape";
  const brandColor = isYape ? "bg-purple-900 border-purple-800 text-purple-100" : "bg-teal-900 border-teal-800 text-teal-100";
  const accentText = isYape ? "text-purple-400" : "text-teal-400";
  const logoText = isYape ? "🟣 Yape" : "🟢 Plin";
  const phoneNumber = isYape ? phoneYape : phonePlin;

  return (
    <div className={`p-5 rounded-2xl border ${brandColor} flex flex-col items-center space-y-4 shadow-sm font-sans`}>
      <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-sm">{logoText}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">Total a Yapear/Plinear</p>
          <p className="text-sm font-extrabold text-white">{formatCurrency(amount)}</p>
        </div>
      </div>

      {/* Dynamic Simulated QR code */}
      <div className="bg-white p-3.5 rounded-2xl flex flex-col items-center justify-center shadow-inner relative group border border-slate-200">
        <div className="h-32 w-32 bg-slate-100 flex flex-col items-center justify-center p-1.5 rounded-lg overflow-hidden">
          {/* We render a beautiful high-fidelity abstract vector SVG representing a QR Code */}
          <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
            {/* Corners */}
            <path d="M0,0 h30 v10 h-20 v20 h-10 z" />
            <path d="M70,0 h30 v30 h-10 v-20 h-20 z" />
            <path d="M0,70 h10 v20 h20 v10 h-30 z" />
            <path d="M90,70 h10 v30 h-30 v-10 h20 z" />
            
            {/* Position Squares */}
            <rect x="5" y="5" width="15" height="15" fill="currentColor" />
            <rect x="8" y="8" width="9" height="9" fill="white" />
            <rect x="10" y="10" width="5" height="5" fill="currentColor" />

            <rect x="80" y="5" width="15" height="15" fill="currentColor" />
            <rect x="83" y="8" width="9" height="9" fill="white" />
            <rect x="85" y="10" width="5" height="5" fill="currentColor" />

            <rect x="5" y="80" width="15" height="15" fill="currentColor" />
            <rect x="8" y="83" width="9" height="9" fill="white" />
            <rect x="10" y="85" width="5" height="5" fill="currentColor" />

            {/* Random QR bits */}
            <rect x="30" y="10" width="8" height="5" />
            <rect x="45" y="5" width="5" height="15" />
            <rect x="60" y="8" width="12" height="6" />
            <rect x="35" y="25" width="20" height="4" />
            <rect x="15" y="35" width="10" height="10" />
            <rect x="30" y="40" width="35" height="5" />
            <rect x="75" y="30" width="15" height="8" />
            <rect x="5" y="55" width="18" height="6" />
            <rect x="25" y="50" width="8" height="15" />
            <rect x="40" y="60" width="15" height="15" />
            <rect x="65" y="50" width="25" height="5" />
            <rect x="70" y="65" width="10" height="15" />
            <rect x="20" y="75" width="12" height="12" />
            <rect x="85" y="85" width="10" height="10" />
            
            {/* Tiny center branding circle */}
            <circle cx="50" cy="50" r="8" fill="currentColor" />
            <circle cx="50" cy="50" r="5" fill="white" />
          </svg>
        </div>
        <span className="text-[9px] font-mono font-bold text-slate-400 mt-2">BODEGA DIGITAL CHORRILLOS</span>
      </div>

      {/* Payment details */}
      <div className="text-center space-y-1">
        <p className="text-xs text-white/70">O también puedes transferir al celular:</p>
        <p className="text-base font-extrabold text-amber-300 font-mono tracking-wider">{phoneNumber}</p>
        <p className="text-[10px] text-white/50">Titular: {settings?.ownerName || "Propietario"}</p>
      </div>

      {/* Verification footer */}
      <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
        <Check className="h-3 w-3 stroke-[3]" />
        <span>Yapea y envía tu captura al WhatsApp</span>
      </div>
    </div>
  );
};
