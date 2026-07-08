import React, { useRef, useEffect } from "react";
import { ChatMessage } from "../../services/geminiService";
import { User, Store, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, loading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useApp();

  // Auto-scroll to latest message on update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px] scrollbar-thin scrollbar-thumb-slate-200"
      ref={containerRef}
      id="chat-messages-container"
    >
      {messages.map((msg, index) => {
        const isBot = msg.role === "model";
        return (
          <div
            key={index}
            className={`flex items-start gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}
          >
            {/* Avatar representation */}
            <div className={`p-1.5 rounded-full shrink-0 flex items-center justify-center ${
              isBot 
                ? "bg-orange-100 text-orange-700 border border-orange-200" 
                : "bg-indigo-100 text-indigo-700 border border-indigo-200"
            }`}>
              {isBot ? (
                <Store className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            {/* Bubble body */}
            <div className={`flex flex-col max-w-[80%] ${isBot ? "" : "items-end"}`}>
              {/* Sender Name */}
              <span className="text-[10px] font-bold text-slate-400 mb-1 font-sans">
                {isBot ? (settings?.ownerName || "Asistente") : "Tú"}
              </span>

              {/* Message content */}
              <div 
                className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                  isBot 
                    ? "bg-orange-50/80 text-slate-800 rounded-tl-none border border-orange-100" 
                    : "bg-indigo-900 text-white rounded-tr-none"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.text}
              </div>
            </div>
          </div>
        );
      })}

      {/* Loading animation bubble */}
      {loading && (
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 shrink-0">
            <Store className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 mb-1">Pensando...</span>
            <div className="p-3 bg-orange-50/50 rounded-2xl rounded-tl-none border border-orange-100 flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
