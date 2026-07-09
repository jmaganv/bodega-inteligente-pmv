import { ShoppingCartItem } from "../hooks/useCart"; // We will declare this hook next

interface GenerateWhatsAppLinkParams {
  phoneNumber: string; // WhatsApp number
  items: any[]; // items in cart
  total: number;
  paymentMethod: string;
  customerName: string;
  ownerName: string; // Nombre dinámico del dueño
}

export const whatsappService = {
  generateLink: ({ phoneNumber, items, total, paymentMethod, customerName, ownerName }: GenerateWhatsAppLinkParams): string => {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    
    let message = `*¡Hola ${ownerName}!* 👋\n`;
    message += `Quisiera hacer un pedido desde la Bodega Inteligente:\n\n`;
    message += `👤 *Cliente:* ${customerName || "Vecino"}\n`;
    message += `🛒 *Detalle del Pedido:*\n`;
    
    items.forEach((item) => {
      message += `- ${item.product.name} x ${item.quantity} ${item.product.unit}(s) - S/. ${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 *Total:* S/. ${total.toFixed(2)}\n`;
    message += `💳 *Método de Pago Sugerido:* ${paymentMethod}\n\n`;
    message += `_Por favor, confírmenme el pedido para realizar el pago e ir a recogerlo. ¡Muchas gracias!_`;

    const encodedText = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  }
};
