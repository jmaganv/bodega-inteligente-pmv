import { useApp } from "../context/AppContext";

export function useSettings() {
  const { settings, loading, error, updateSettings } = useApp();

  return {
    settings,
    loading,
    error,
    updateSettings
  };
}
