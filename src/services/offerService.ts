import { Offer } from "../types/offer";
import { fetchAPI } from "./api";

export const offerService = {
  getOffers: () => fetchAPI<Offer[]>("/api/offers"),
  
  createOffer: (offer: Partial<Offer>) => 
    fetchAPI<Offer>("/api/offers", {
      method: "POST",
      body: JSON.stringify(offer),
    }),
    
  updateOffer: (id: string, offer: Partial<Offer>) => 
    fetchAPI<Offer>(`/api/offers/${id}`, {
      method: "PUT",
      body: JSON.stringify(offer),
    }),
    
  deleteOffer: (id: string) => 
    fetchAPI<{ success: boolean }>(`/api/offers/${id}`, {
      method: "DELETE",
    }),
};
