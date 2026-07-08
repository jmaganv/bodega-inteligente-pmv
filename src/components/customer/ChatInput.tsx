import React, { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (txt: string) => void;
  loading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, loading }) => {
  const [text, setText] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSendMessage(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2 rounded-b-2xl">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        placeholder="Escribe tu consulta o pide ingredientes..."
        className="flex-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
        id="chat-user-message-input"
      />
      <button
        type="submit"
        disabled={!text.trim() || loading}
        className={`p-3 rounded-xl flex items-center justify-center transition-all ${
          !text.trim() || loading
            ? "bg-slate-100 text-slate-300 cursor-not-allowed"
            : "bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
        }`}
        id="chat-send-btn"
      >
        <Send className="h-4.5 w-4.5 stroke-[2.5]" />
      </button>
    </form>
  );
};
