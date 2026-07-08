import { useMemo } from "react";
import { useApp } from "../context/AppContext";

export function useCart() {
  const { cart, offers, addToCart, removeFromCart, updateCartQty, clearCart } = useApp();

  const cartStats = useMemo(() => {
    const itemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
    const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
    
    // Calculate total taking active offers into account
    const total = cart.reduce((acc, curr) => {
      const activeOffer = offers.find(o => o.productId === curr.product.id && o.active);
      const price = activeOffer ? activeOffer.discountPrice : curr.product.price;
      return acc + (price * curr.quantity);
    }, 0);
    
    return {
      itemCount,
      subtotal,
      total
    };
  }, [cart, offers]);

  return {
    cart,
    offers,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    ...cartStats
  };
}
export type { ShoppingCartItem } from "../context/AppContext";
