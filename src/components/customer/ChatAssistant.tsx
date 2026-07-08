import React, { useState, useMemo } from "react";
import { useChat } from "../../hooks/useChat";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Sparkles, RefreshCw, HelpCircle, Store } from "lucide-react";
import { useApp } from "../../context/AppContext";

const DYNAMIC_SUGGESTIONS: Record<number, { label: string; query: string }[]> = {
  0: [ // Domingo
    { label: "🥖 Desayuno de Domingo", query: "Es domingo de desayuno familiar. ¿Qué panes, embutidos o acompañamientos me sugieren?" },
    { label: "🍛 Seco de Pollo dominguero", query: "Quiero preparar un Seco de Pollo hoy domingo. ¿Tienen los ingredientes y cuál es la receta?" },
    { label: "🥤 Gaseosa familiar helada", query: "¿Qué gaseosas de 2 o 3 litros heladas tienen para el almuerzo de hoy?" },
    { label: "🍮 Receta de Arroz con Leche", query: "¿Tienen ingredientes para un Arroz con Leche de postre dominguero?" }
  ],
  1: [ // Lunes
    { label: "🍳 Inicio de semana sano", query: "¿Qué insumos tienen para un desayuno saludable para empezar con fuerza el lunes?" },
    { label: "🍛 Receta de Lentejas de Lunes", query: "Es lunes de lentejas. ¿Qué ingredientes tienen para prepararlas y con qué me sugieren acompañarlas?" },
    { label: "☕ Café para activarse", query: "¿Tienen café, leche evaporada y avena para llenarme de energía hoy lunes?" },
    { label: "🧼 Detergentes en oferta", query: "¿Qué ofertas o stock tienen hoy en detergentes y productos de limpieza?" }
  ],
  2: [ // Martes
    { label: "🍝 Receta de Tallarines", query: "Quiero preparar Tallarines Rojos hoy martes, ¿qué ingredientes tienen y cuál es la receta?" },
    { label: "🍇 Frutas y verduras frescas", query: "¿Qué verduras y frutas frescas llegaron para surtir la cocina esta semana?" },
    { label: "🥣 Avena nutritiva", query: "Quiero preparar avena con leche, ¿tienen canela, clavo y con qué pancito me sugieren acompañarla?" },
    { label: "🧴 Cuidado personal", query: "¿Qué productos de higiene como champú, jabón o crema dental tienen en stock?" }
  ],
  3: [ // Miércoles
    { label: "🏷️ Ofertas de mitad de semana", query: "¿Qué ofertas o promociones especiales tienen vigentes hoy miércoles?" },
    { label: "🍗 Arroz con Pollo casero", query: "Hoy provoca Arroz con Pollo, ¿tienen todos los ingredientes listos en tienda?" },
    { label: "🧁 Galletas y antojos", query: "¿Qué galletas, chocolates o piqueos dulces me sugieren para el antojo de la tarde?" },
    { label: "🥤 Bebidas refrescantes", query: "¿Qué jugos, gaseosas o aguas heladas tienen para este día?" }
  ],
  4: [ // Jueves
    { label: "🥩 Receta de Lomo Saltado", query: "Quiero preparar un jugoso Lomo Saltado hoy jueves, ¿tienen los ingredientes y la receta?" },
    { label: "🧀 Queso y jamón para lonchera", query: "¿Qué embutidos, jamonadas o quesos frescos tienen para los panes de la tarde?" },
    { label: "🍿 Snacks para películas", query: "¿Qué piqueos, papitas, camotes o maní salado me recomiendan para ver pelis hoy jueves?" },
    { label: "🐾 Alimento para mascotas", query: "¿Qué marcas y tipos de comida para perrito o gatito tienen disponibles hoy?" }
  ],
  5: [ // Viernes
    { label: "🍻 Ofertas de viernes", query: "Es viernes, ¿qué promociones tienen en cervezas, licores y piqueos para disfrutar hoy?" },
    { label: "🌭 Receta de Salchipapa casera", query: "Quiero preparar una salchipapa en casa. ¿Tienen papas, salchichas, aceite y cremas?" },
    { label: "🧊 Hielo y carbón listos", query: "¿Tienen bolsas de hielo, carbón o gaseosas de tamaño familiar para el fin de semana?" },
    { label: "🍔 Noche de hamburguesas", query: "¿Tienen pan de hamburguesa, carne molida o hamburguesas listas y queso para hoy viernes?" }
  ],
  6: [ // Sábado
    { label: "🐟 Receta de Ceviche norteño", query: "Quiero preparar un Ceviche este sábado. ¿Qué ingredientes frescos de la bodega necesito?" },
    { label: "🍨 Helados para refrescarse", query: "¿Tienen helados, paletas o marcianos heladitos para el calor del sábado?" },
    { label: "🍷 Vinos o Piscos peruanos", query: "Busco un vino o pisco para acompañar el almuerzo del sábado, ¿qué opciones me ofrecen?" },
    { label: "🍖 Parrilla del sábado", query: "¿Tienen embutidos, chorizo, carbón o condimentos para hacer una parrilla hoy?" }
  ]
};

export const ChatAssistant: React.FC = () => {
  const { settings } = useApp();
  const { messages, loading, sendMessage, clearChat } = useChat(settings);
  const [useAlternative, setUseAlternative] = useState<boolean>(false);

  // Determine current day of week dynamically
  const dayOfWeek = useMemo(() => new Date().getDay(), []);
  const dayName = useMemo(() => {
    const days = ["Domingo 🥑", "Lunes ☕", "Martes 🥗", "Miércoles 🏷️", "Jueves 🧀", "Viernes 🍻", "Sábado 🐟"];
    return days[dayOfWeek];
  }, [dayOfWeek]);

  // Determine if the physical store is currently open (e.g., 8:00 AM to 10:00 PM)
  const isStoreOpen = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 8 && hour < 22;
  }, []);

  const activeSuggestions = useMemo(() => {
    if (useAlternative) {
      return [
        { label: "💳 ¿Cómo pago con Yape/Plin?", query: "¿Cómo puedo pagar con Yape o Plin y a qué números?" },
        { label: "📍 Ubicación y Horarios", query: "¿Dónde queda exactamente la bodega en Chorrillos y cuál es su horario de atención?" },
        { label: "🛵 ¿Tienen delivery?", query: "¿Hacen delivery a domicilio aquí en Chorrillos y cómo puedo pedirlo?" },
        { label: "🥚 Abarrotes básicos", query: "¿Tienen huevos, arroz, fideos, aceite y leche disponibles para comprar?" }
      ];
    }
    const daily = DYNAMIC_SUGGESTIONS[dayOfWeek];
    return daily || [
      { label: "🏷️ Ver ofertas de hoy", query: "¿Qué ofertas o promociones tienen vigentes hoy?" },
      { label: "🍛 Receta de Lomo Saltado", query: "Quiero preparar un Lomo Saltado, ¿qué ingredientes tienen y cuál es la receta?" },
      { label: "🍳 Pan para el desayuno", query: "Quiero comprar pancito para el desayuno. ¿Con qué me sugieren acompañarlo?" },
      { label: "💳 ¿Cómo pago con Yape?", query: "¿Cómo puedo pagar con Yape o Plin y a qué números?" }
    ];
  }, [useAlternative, dayOfWeek]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-[520px] font-sans">
      
      {/* Assistant Header */}
      <div className="p-4 border-b border-indigo-800 bg-indigo-950 rounded-t-2xl flex items-center justify-between text-white">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 bg-orange-500 text-white rounded-lg flex items-center justify-center shadow-md font-bold text-lg">
            AI
          </div>
          <div>
            <h3 className="font-bold text-[10px] text-indigo-300 uppercase tracking-wider leading-none">Asistente Virtual</h3>
            <h2 className="text-sm font-extrabold text-white mt-1">{settings?.ownerName || "Cargando..."}</h2>
          </div>
        </div>

        {/* Status Indicator & Clear Thread */}
        <div className="flex items-center space-x-2">
          {isStoreOpen ? (
            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20" title="La tienda física está abierta y procesando pedidos">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              TIENDA ABIERTA
            </span>
          ) : (
            <span className="text-[10px] font-black text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20" title="La tienda física está cerrada. El asistente virtual sigue activo las 24 horas para tomar tu pedido">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
              ONLINE 24/7
            </span>
          )}
          <button
            onClick={clearChat}
            className="text-indigo-300 hover:text-white p-1.5 hover:bg-indigo-900 rounded-lg transition-colors"
            title="Reiniciar chat"
            id="btn-reset-chat"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Closed store banner */}
      {!isStoreOpen && (
        <div className="bg-amber-50/90 border-b border-amber-100 px-3 py-1.5 text-[10px] text-amber-800 flex items-center gap-2 font-semibold shrink-0">
          <span className="text-xs">🌙</span>
          <span>
            <strong>Tienda Cerrada:</strong> Puedes seguir consultando y armando tu carrito. Tu pedido se reservará para mañana a partir de las 8:00 AM.
          </span>
        </div>
      )}

      {/* Messages Feed */}
      <ChatMessages messages={messages} loading={loading} />

      {/* Suggestion Chips Container */}
      <div className="px-3 py-2 border-t border-slate-50 bg-slate-50/50">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="h-3 w-3 text-amber-500" />
            {useAlternative ? "Preguntas frecuentes 💡" : `Sugerencias de hoy: ${dayName}`}
          </p>
          <button
            onClick={() => setUseAlternative(!useAlternative)}
            className="text-[10px] font-extrabold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-orange-50 cursor-pointer"
            title="Cambiar sugerencias"
          >
            <Sparkles className="h-2.5 w-2.5" />
            {useAlternative ? "Ver del día" : "Ver generales"}
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1.5 overflow-x-auto max-h-[85px] scrollbar-none pb-1">
          {activeSuggestions.map((s, index) => (
            <button
              key={index}
              disabled={loading}
              onClick={() => sendMessage(s.query)}
              className="text-[10px] font-bold bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer select-none shrink-0"
              id={`chat-suggest-chip-${index}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput onSendMessage={sendMessage} loading={loading} />
    </div>
  );
};
