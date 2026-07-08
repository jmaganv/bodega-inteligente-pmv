export interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: "Yape" | "Plin" | "Efectivo";
  customerPhone?: string;
  customerName?: string;
  status: "completado" | "pendiente"; // e.g. pendiente represents a WhatsApp order before it is closed
}
