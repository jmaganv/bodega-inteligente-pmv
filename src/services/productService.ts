import { Product } from "../types/product";
import { fetchAPI } from "./api";

export const productService = {
  getProducts: () => fetchAPI<Product[]>("/api/products"),
  
  createProduct: (product: Partial<Product>) => 
    fetchAPI<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),
    
  updateProduct: (id: string, product: Partial<Product>) => 
    fetchAPI<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),
    
  deleteProduct: (id: string) => 
    fetchAPI<{ success: boolean }>(`/api/products/${id}`, {
      method: "DELETE",
    }),

  importFromCSV: (csvContent: string) =>
    fetchAPI<{ success: boolean; count: number; products: Product[] }>("/api/sheets/import", {
      method: "POST",
      body: JSON.stringify({ csvContent }),
    }),

  getExportURL: () => "/api/sheets/export"
};
