import React, { useState, useEffect } from "react";
import { useSettings } from "../../hooks/useSettings";
import { X, Save, Settings as SettingsIcon } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useSettings();

  const [bodegaName, setBodegaName] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [phoneYape, setPhoneYape] = useState<string>("");
  const [phonePlin, setPhonePlin] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      setBodegaName(settings.bodegaName);
      setOwnerName(settings.ownerName);
      setPhoneYape(settings.phoneYape);
      setPhonePlin(settings.phonePlin);
      setWhatsappNumber(settings.whatsappNumber);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        bodegaName,
        ownerName,
        phoneYape,
        phonePlin,
        whatsappNumber,
      });
      onClose();
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Hubo un error guardando las configuraciones.");
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
            <SettingsIcon className="h-4.5 w-4.5" />
            Configuración de la Bodega
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Bodega Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nombre del Local:</label>
            <input
              type="text"
              required
              value={bodegaName}
              onChange={(e) => setBodegaName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
              id="settings-form-bodeganam"
            />
          </div>

          {/* Owner Names */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nombres de Propietarios:</label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
              id="settings-form-owner"
            />
          </div>

          {/* Phone Yape */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Celular de Yape:</label>
            <input
              type="text"
              required
              pattern="[0-9]{9}"
              maxLength={9}
              value={phoneYape}
              onChange={(e) => setPhoneYape(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              id="settings-form-yape"
            />
          </div>

          {/* Phone Plin */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Celular de Plin:</label>
            <input
              type="text"
              required
              pattern="[0-9]{9}"
              maxLength={9}
              value={phonePlin}
              onChange={(e) => setPhonePlin(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              id="settings-form-plin"
            />
          </div>

          {/* WhatsApp order receiver phone */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Celular receptor WhatsApp (formato internacional):</label>
            <input
              type="text"
              required
              placeholder="Ej. 51987654321"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              id="settings-form-wa"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
              id="settings-form-submit"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Guardando..." : "Guardar Ajustes"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
