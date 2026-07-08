import { useMemo } from "react";
import { useApp } from "../context/AppContext";

export function useSales() {
  const { sales, loading, error, registerSale, completeSale, deleteSale } = useApp();

  // Memoized historical statistics
  const stats = useMemo(() => {
    const completedSales = sales.filter(s => s.status === "completado");
    const totalRevenue = completedSales.reduce((acc, curr) => acc + curr.total, 0);
    
    // Payment method metrics
    const paymentMethods = completedSales.reduce((acc, curr) => {
      acc[curr.paymentMethod] = (acc[curr.paymentMethod] || 0) + curr.total;
      return acc;
    }, {} as Record<string, number>);

    // Total counts
    const pendingCount = sales.filter(s => s.status === "pendiente").length;

    return {
      totalRevenue,
      salesCount: completedSales.length,
      pendingCount,
      paymentMethods
    };
  }, [sales]);

  const pendingSales = useMemo(() => {
    return sales.filter(s => s.status === "pendiente");
  }, [sales]);

  const completedSales = useMemo(() => {
    return sales.filter(s => s.status === "completado").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales]);

  return {
    sales,
    pendingSales,
    completedSales,
    stats,
    loading,
    error,
    registerSale,
    completeSale,
    deleteSale
  };
}
