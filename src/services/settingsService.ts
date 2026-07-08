import { Settings } from "../types/settings";
import { fetchAPI } from "./api";

export const settingsService = {
  getSettings: () => fetchAPI<Settings>("/api/settings"),
  
  saveSettings: (settings: Partial<Settings>) => 
    fetchAPI<Settings>("/api/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    }),
};
