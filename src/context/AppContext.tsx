import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Product } from "../types/product";
import { Sale } from "../types/sale";
import { Offer } from "../types/offer";
import { Settings } from "../types/settings";
import { productService } from "../services/productService";
import { offerService } from "../services/offerService";
import { saleService } from "../services/saleService";
import { settingsService } from "../services/settingsService";
import { DEFAULT_SETTINGS } from "../utils/constants";

export interface ShoppingCartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  products: Product[];
  offers: Offer[];
  sales: Sale[];
  settings: Settings;
  currentRole: "customer" | "owner";
  setCurrentRole: (role: "customer" | "owner") => void;
  cart: ShoppingCartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  
  // Products API
  addProduct: (p: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  importProductsCSV: (csv: string) => Promise<number>;

  // Offers API
  addOffer: (o: Partial<Offer>) => Promise<Offer>;
  updateOffer: (id: string, o: Partial<Offer>) => Promise<Offer>;
  deleteOffer: (id: string) => Promise<void>;

  // Sales API
  registerSale: (items: ShoppingCartItem[], paymentMethod: "Yape" | "Plin" | "Efectivo", status?: "completado" | "pendiente", customerPhone?: string, customerName?: string) => Promise<Sale>;
  completeSale: (id: string) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;

  // Settings API
  updateSettings: (s: Partial<Settings>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  // Recuperar el rol del localStorage o usar "customer" como valor por defecto
  const [currentRole, setCurrentRoleState] = useState<"customer" | "owner">(() => {
    const savedRole = localStorage.getItem("userRole");
    return (savedRole as "customer" | "owner") || "customer";
  });
  const [cart, setCart] = useState<ShoppingCartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Envolver setCurrentRole para también guardar en localStorage
  const setCurrentRole = useCallback((role: "customer" | "owner") => {
    setCurrentRoleState(role);
    localStorage.setItem("userRole", role);
  }, []);

  // Load everything on start
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pData, oData, sData, settsData] = await Promise.all([
        productService.getProducts(),
        offerService.getOffers(),
        saleService.getSales(),
        settingsService.getSettings()
      ]);
      setProducts(pData);
      setOffers(oData);
      setSales(sData);
      setSettings(settsData);
    } catch (err: any) {
      setError(err.message || "No se pudieron sincronizar los datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Product actions
  const addProduct = useCallback(async (p: Partial<Product>) => {
    try {
      const newP = await productService.createProduct(p);
      setProducts(prev => [...prev, newP]);
      return newP;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, p: Partial<Product>) => {
    try {
      const updatedP = await productService.updateProduct(id, p);
      setProducts(prev => prev.map(item => item.id === id ? updatedP : item));
      return updatedP;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(item => item.id !== id));
      setOffers(prev => prev.filter(item => item.productId !== id));
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  const importProductsCSV = useCallback(async (csv: string) => {
    try {
      const res = await productService.importFromCSV(csv);
      if (res.success) {
        setProducts(res.products);
        return res.count;
      }
      return 0;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  // Offer actions
  const addOffer = useCallback(async (o: Partial<Offer>) => {
    try {
      const newO = await offerService.createOffer(o);
      setOffers(prev => [...prev, newO]);
      return newO;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  const updateOffer = useCallback(async (id: string, o: Partial<Offer>) => {
    try {
      const updatedO = await offerService.updateOffer(id, o);
      setOffers(prev => prev.map(item => item.id === id ? updatedO : item));
      return updatedO;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  const deleteOffer = useCallback(async (id: string) => {
    try {
      await offerService.deleteOffer(id);
      setOffers(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  // Sales actions
  const registerSale = useCallback(async (
    items: ShoppingCartItem[], 
    paymentMethod: "Yape" | "Plin" | "Efectivo",
    status: "completado" | "pendiente" = "completado",
    customerPhone?: string,
    customerName?: string
  ) => {
    try {
      const saleItems = items.map(item => {
        const activeOffer = offers.find(o => o.productId === item.product.id && o.active);
        const actualPrice = activeOffer ? activeOffer.discountPrice : item.product.price;
        return {
          productId: item.product.id,
          productName: item.product.name,
          price: actualPrice,
          quantity: item.quantity,
          total: actualPrice * item.quantity
        };
      });
      
      const total = saleItems.reduce((acc, curr) => acc + curr.total, 0);
      
      const newSale = await saleService.createSale({
        items: saleItems,
        total,
        paymentMethod,
        status,
        customerPhone,
        customerName
      });

      // Update local state and subtract stock in real-time if completed
      setSales(prev => [...prev, newSale]);
      if (status === "completado") {
        setProducts(prev => 
          prev.map(p => {
            const item = items.find(i => i.product.id === p.id);
            if (item) {
              return { ...p, stock: Math.max(0, p.stock - item.quantity) };
            }
            return p;
          })
        );
      }
      return newSale;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  const completeSale = useCallback(async (id: string) => {
    try {
      const completedSale = await saleService.completeSale(id);
      setSales(prev => prev.map(s => s.id === id ? completedSale : s));
      
      // Update local stocks in real-time
      setProducts(prev => 
        prev.map(p => {
          const item = completedSale.items.find(i => i.productId === p.id);
          if (item) {
            return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          }
          return p;
        })
      );
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  const deleteSale = useCallback(async (id: string) => {
    try {
      await saleService.deleteSale(id);
      setSales(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  // Settings actions
  const updateSettings = useCallback(async (s: Partial<Settings>) => {
    try {
      const updatedS = await settingsService.saveSettings(s);
      setSettings(updatedS);
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  // Cart operations
  const addToCart = useCallback((product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => 
      prev.map(item => 
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const value = useMemo(() => ({
    products,
    offers,
    sales,
    settings,
    currentRole,
    setCurrentRole,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    loading,
    error,
    refreshAll,
    
    addProduct,
    updateProduct,
    deleteProduct,
    importProductsCSV,
    
    addOffer,
    updateOffer,
    deleteOffer,
    
    registerSale,
    completeSale,
    deleteSale,
    
    updateSettings
  }), [
    products, offers, sales, settings, currentRole, cart, loading, error, refreshAll,
    addProduct, updateProduct, deleteProduct, importProductsCSV,
    addOffer, updateOffer, deleteOffer,
    registerSale, completeSale, deleteSale,
    updateSettings, addToCart, removeFromCart, updateCartQty, clearCart
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp debe usarse dentro de un AppProvider");
  }
  return context;
};
