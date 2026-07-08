import { useState, useCallback, useEffect } from "react";
import { geminiService, ChatMessage } from "../services/geminiService";

export function useChat(settings?: any) {
  const initialText = settings?.bodegaName
    ? `¡Hola vecino, vecina! Bienvenidos a la ${settings.bodegaName}. 😊 ¿En qué te podemos ayudar hoy? Te cuento que tenemos abarrotes fresquitos, carnes, ricas verduras y licores al polo. ¡Pregúntame lo que gustes!`
    : "¡Hola vecino, vecina! Bienvenidos a la Bodega Inteligente. 😊 ¿En qué te podemos ayudar hoy? Te cuento que tenemos abarrotes fresquitos, carnes, ricas verduras y licores al polo. ¡Pregúntame lo que gustes!";

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Only set/update welcome message if chat has not started (empty)
    if (messages.length === 0) {
      setMessages([
        {
          role: "model",
          text: initialText
        }
      ]);
    }
  }, [settings, messages.length, initialText]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      // Send message to Gemini via server-side API with existing history
      const response = await geminiService.sendMessage(text, messages);
      
      const botMsg: ChatMessage = {
        role: "model",
        text: response.text
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error("Error in chat service:", err);
      const errorMsg: ChatMessage = {
        role: "model",
        text: "Uy casero, tuvimos una pequeña interrupción con el sistema. Pero descuida, dime qué necesitas y te atiendo al toque."
      };
      setMessages(prev => [...prev, errorMsg]);
      setError(err.message || "No se pudo conectar con el asistente de IA");
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: "model",
        text: settings?.ownerName 
          ? `¡Hola caserito! ¿Qué plato vas a preparar hoy? Dime y ${settings.ownerName} te busca los ingredientes en una.`
          : "¡Hola caserito! ¿Qué plato vas a preparar hoy? Dime y te busco los ingredientes en una."
      }
    ]);
  }, [settings]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat
  };
}
