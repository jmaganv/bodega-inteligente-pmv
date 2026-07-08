import { Product } from "../types/product";
import { Settings } from "../types/settings";

export const CATEGORIES = [
  "Abarrotes",
  "Lácteos y Huevos",
  "Pollo y Carnes",
  "Frutas y Verduras",
  "Productos de Limpieza",
  "Bebidas y Licores"
];

export const DEFAULT_SETTINGS: Settings = {
  bodegaName: "Bodega Belthi y Nancy",
  ownerName: "Belthi y Nancy",
  phoneYape: "987654321",
  phonePlin: "912345678",
  whatsappNumber: "51987654321",
};

export const INITIAL_PRODUCTS: Product[] = [
  // Abarrotes
  { id: "p1", name: "Arroz Extra Costeño 1kg", category: "Abarrotes", price: 4.80, costPrice: 3.50, stock: 45, minStock: 10, unit: "kg" },
  { id: "p2", name: "Aceite Primor Premium 1L", category: "Abarrotes", price: 9.50, costPrice: 7.20, stock: 24, minStock: 5, unit: "botella" },
  { id: "p3", name: "Fideos Tallarín Don Vittorio 1kg", category: "Abarrotes", price: 5.20, costPrice: 3.80, stock: 35, minStock: 8, unit: "paquete" },
  { id: "p4", name: "Azúcar Rubia Dulfina 1kg", category: "Abarrotes", price: 4.20, costPrice: 3.10, stock: 50, minStock: 15, unit: "kg" },
  { id: "p5", name: "Atún Primor Trozos en Aceite", category: "Abarrotes", price: 6.50, costPrice: 4.80, stock: 30, minStock: 6, unit: "lata" },

  // Lácteos y Huevos
  { id: "p6", name: "Leche Gloria Azul Lata 400g", category: "Lácteos y Huevos", price: 4.50, costPrice: 3.40, stock: 60, minStock: 12, unit: "lata" },
  { id: "p7", name: "Yogurt Gloria Fresa 1L", category: "Lácteos y Huevos", price: 7.20, costPrice: 5.20, stock: 15, minStock: 4, unit: "botella" },
  { id: "p8", name: "Queso Fresco Andino 1kg", category: "Lácteos y Huevos", price: 24.00, costPrice: 18.00, stock: 8, minStock: 2, unit: "kg" },
  { id: "p9", name: "Mantequilla Gloria con Sal 200g", category: "Lácteos y Huevos", price: 6.80, costPrice: 4.90, stock: 25, minStock: 5, unit: "unidad" },
  { id: "p10", name: "Plancha de Huevos (30 unid)", category: "Lácteos y Huevos", price: 16.50, costPrice: 12.50, stock: 12, minStock: 3, unit: "plancha" },

  // Pollo y Carnes
  { id: "p11", name: "Pollo Entero Limpio con Menudencia", category: "Pollo y Carnes", price: 10.50, costPrice: 7.80, stock: 15, minStock: 3, unit: "kg" },
  { id: "p12", name: "Pechuga de Pollo Fresca", category: "Pollo y Carnes", price: 14.80, costPrice: 11.20, stock: 10, minStock: 2, unit: "kg" },
  { id: "p13", name: "Carne de Res - Bistec", category: "Pollo y Carnes", price: 28.00, costPrice: 22.00, stock: 8, minStock: 2, unit: "kg" },
  { id: "p14", name: "Carne de Cerdo - Chuleta", category: "Pollo y Carnes", price: 18.50, costPrice: 14.00, stock: 12, minStock: 3, unit: "kg" },

  // Frutas y Verduras
  { id: "p15", name: "Plátano de Seda de Chanchamayo", category: "Frutas y Verduras", price: 3.50, costPrice: 2.20, stock: 25, minStock: 5, unit: "kg" },
  { id: "p16", name: "Manzana Delicia Importada", category: "Frutas y Verduras", price: 6.00, costPrice: 4.00, stock: 20, minStock: 4, unit: "kg" },
  { id: "p17", name: "Papa Amarilla de la Sierra", category: "Frutas y Verduras", price: 4.50, costPrice: 3.00, stock: 40, minStock: 10, unit: "kg" },
  { id: "p18", name: "Cebolla Roja de Arequipa", category: "Frutas y Verduras", price: 3.20, costPrice: 2.00, stock: 35, minStock: 8, unit: "kg" },
  { id: "p19", name: "Limón Sutil Piurano", category: "Frutas y Verduras", price: 5.50, costPrice: 3.50, stock: 18, minStock: 5, unit: "kg" },

  // Productos de Limpieza
  { id: "p20", name: "Detergente Bolívar Flores de Limón 1kg", category: "Productos de Limpieza", price: 10.20, costPrice: 7.50, stock: 20, minStock: 4, unit: "bolsa" },
  { id: "p21", name: "Lavavajilla Ayudín Limón 400g", category: "Productos de Limpieza", price: 4.80, costPrice: 3.40, stock: 30, minStock: 6, unit: "pote" },
  { id: "p22", name: "Lejía Clorox Tradicional 1L", category: "Productos de Limpieza", price: 3.90, costPrice: 2.70, stock: 25, minStock: 5, unit: "botella" },

  // Bebidas y Licores
  { id: "p23", name: "Cerveza Pilsen Callao 630ml (Botella)", category: "Bebidas y Licores", price: 6.50, costPrice: 4.80, stock: 120, minStock: 20, unit: "botella" },
  { id: "p24", name: "Pisco Quebranta Santiago Queirolo 750ml", category: "Bebidas y Licores", price: 38.00, costPrice: 29.00, stock: 6, minStock: 2, unit: "botella" },
  { id: "p25", name: "Vino Tinto Intipalka Malbec 750ml", category: "Bebidas y Licores", price: 42.00, costPrice: 31.00, stock: 8, minStock: 2, unit: "botella" },
  { id: "p26", name: "Gaseosa Inca Kola 3L", category: "Bebidas y Licores", price: 11.50, costPrice: 8.50, stock: 40, minStock: 8, unit: "botella" }
];
