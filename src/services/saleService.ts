import { Sale } from "../types/sale";
import { fetchAPI } from "./api";

export const saleService = {
  getSales: () => fetchAPI<Sale[]>("/api/sales"),
  
  createSale: (sale: Partial<Sale>) => 
    fetchAPI<Sale>("/api/sales", {
      method: "POST",
      body: JSON.stringify(sale),
    }),

  completeSale: (id: string) =>
    fetchAPI<Sale>(`/api/sales/${id}/complete`, {
      method: "POST",
    }),

  deleteSale: (id: string) =>
    fetchAPI<{ success: boolean }>(`/api/sales/${id}`, {
      method: "DELETE",
    })
};
