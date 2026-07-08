import { useMemo } from "react";
import { useApp } from "../context/AppContext";

export function useOffers() {
  const { offers, loading, error, addOffer, updateOffer, deleteOffer } = useApp();

  const activeOffers = useMemo(() => {
    return offers.filter(o => o.active);
  }, [offers]);

  return {
    offers,
    activeOffers,
    loading,
    error,
    addOffer,
    updateOffer,
    deleteOffer
  };
}
