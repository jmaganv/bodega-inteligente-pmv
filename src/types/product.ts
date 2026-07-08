export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  unit: string; // e.g. "kg", "unidad", "paquete", "litro"
  imageUrl?: string;
}
