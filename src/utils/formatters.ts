/**
 * Formats a number to Peruvian Soles currency (S/.)
 */
export const formatCurrency = (amount: number): string => {
  return `S/. ${amount.toFixed(2)}`;
};

/**
 * Formats a Date object or string into a readable format
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

/**
 * Returns a human-friendly date representation (e.g. "Hoy, 10:30 AM")
 */
export const formatFriendlyDate = (dateString: string | Date): string => {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  
  if (isToday) {
    return `Hoy, ${timeStr}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isYesterday) {
    return `Ayer, ${timeStr}`;
  }
  
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" }) + `, ${timeStr}`;
};
