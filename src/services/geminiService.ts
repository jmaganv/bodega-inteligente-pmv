import { fetchAPI } from "./api";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export const geminiService = {
  sendMessage: (message: string, history: ChatMessage[]) =>
    fetchAPI<{ text: string }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
};
