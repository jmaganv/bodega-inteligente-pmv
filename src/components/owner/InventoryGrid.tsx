import React, { useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { Product } from "../../types/product";
import { ProductForm } from "./ProductForm";
import { formatCurrency } from "../../utils/formatters";
import { Plus, Edit2, Trash2, Download, Upload, RefreshCw, FileSpreadsheet, FileText } from "lucide-react";

export const InventoryGrid: React.FC = () => {
  const {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    importProductsCSV
  } = useProducts();

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showImport, setShowImport] = useState<boolean>(false);
  const [csvInput, setCsvInput] = useState<string>("");
  const [importCount, setImportCount] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const handleEditClick = (p: Product) => {
    setActiveProduct(p);
    setShowForm(true);
  };

  const handleCreateClick = () => {
    setActiveProduct(null);
    setShowForm(true);
  };

  const handleSaveProduct = async (pPayload: Partial<Product>) => {
    if (activeProduct) {
      await updateProduct(activeProduct.id, pPayload);
    } else {
      await addProduct(pPayload);
    }
  };

  const handleExportCSV = () => {
    // Generate a flat text CSV file of the catalog
    let csv = "ID,Nombre,Categoria,Precio de Venta (S/.),Precio de Costo (S/.),Stock Actual,Stock Minimo,Unidad de Medida\n";
    products.forEach((p) => {
      const safeId = (p.id || "").replace(/"/g, '""');
      const safeName = (p.name || "").replace(/"/g, '""');
      const safeCategory = (p.category || "").replace(/"/g, '""');
      const safeUnit = (p.unit || "").replace(/"/g, '""');
      csv += `"${safeId}","${safeName}","${safeCategory}",${p.price || 0},${p.costPrice || 0},${p.stock || 0},${p.minStock || 0},"${safeUnit}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventario_bodega.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteProduct(id);
      setDeletingProductId(null);
    } catch (err: any) {
      console.error("Error al eliminar:", err);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) return;

    try {
      const count = await importProductsCSV(csvInput);
      setImportCount(count);
      setCsvInput("");
      setTimeout(() => setImportCount(null), 3000);
      setShowImport(false);
    } catch (err: any) {
      alert("Error al importar: " + err.message);
    }
  };

  return (
    <div className="space-y-4 font-sans" id="inventory-grid-panel">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">Inventario de la Tienda</h3>
          <p className="text-[10px] text-slate-400 font-medium">Administra stock y vincula con Google Sheets</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Export to CSV (Google Sheets compatible) */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Descargar plantilla compatible con Google Sheets"
            id="btn-export-csv"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar Sheets</span>
          </button>

          {/* Import Sheets CSV button */}
          <button
            onClick={() => setShowImport(!showImport)}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs transition-all"
            id="btn-import-sheet-toggle"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Importar Sheets</span>
          </button>

          {/* Create product */}
          <button
            onClick={handleCreateClick}
            className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
            id="btn-create-product"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* Sheets Import Area (Toggled) */}
      {showImport && (
        <form onSubmit={handleImportSubmit} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
          <div className="flex items-start space-x-2.5">
            <FileSpreadsheet className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wide">Importar desde Google Sheets</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Copia las celdas de tu Google Sheet (Columnas: ID, Nombre, Categoría, Precio de Venta, Precio de Costo, Stock, Stock Mínimo, Unidad) y pégalas como CSV abajo:
              </p>
            </div>
          </div>
          <textarea
            required
            rows={4}
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder={`p1,Arroz Extra Costeño,Abarrotes,4.80,3.50,45,10,kg
p2,Aceite Primor Premium,Abarrotes,9.50,7.20,24,5,botella`}
            className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white text-slate-950 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            id="import-csv-textarea"
          ></textarea>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowImport(false)}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-amber-400 font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
              id="import-csv-submit"
            >
              Cargar Filas
            </button>
          </div>
        </form>
      )}

      {/* Success notification for sheets import */}
      {importCount !== null && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5">
          <FileText className="h-4.5 w-4.5" />
          <span>¡Sincronizado! Se importaron {importCount} productos desde el Google Sheet.</span>
        </div>
      )}

      {/* Grid Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          <p className="text-xs text-slate-500 font-medium">Buscando productos...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm">
          ⚠️ {error}
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-xs text-slate-500">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Nombre</th>
                <th className="px-4 py-3.5">Categoría</th>
                <th className="px-4 py-3.5 text-right">Costo</th>
                <th className="px-4 py-3.5 text-right">Venta</th>
                <th className="px-4 py-3.5 text-center">Stock</th>
                <th className="px-4 py-3.5">Unidad</th>
                <th className="px-4 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {products.map((p) => {
                const isLowStock = p.stock <= p.minStock;
                return (
                  <tr 
                    key={p.id} 
                    className={`hover:bg-slate-50/50 ${isLowStock ? "bg-rose-50/30" : ""}`}
                    id={`inventory-row-${p.id}`}
                  >
                    <td className="px-4 py-3.5 font-mono text-slate-400 text-[10px]">{p.id}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{p.name}</td>
                    <td className="px-4 py-3.5 text-slate-500">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-400 font-mono">
                      {p.costPrice ? formatCurrency(p.costPrice) : "S/. 0.00"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      <span className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                        p.stock === 0 
                          ? "bg-rose-100 text-rose-800" 
                          : isLowStock 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 uppercase text-[10px] font-mono">{p.unit}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center space-x-1.5">
                        {deletingProductId === p.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-100 animate-fade-in">
                            <span className="text-[9px] text-rose-600 font-extrabold px-1">¿Borrar?</span>
                            <button
                              onClick={() => handleDeleteClick(p.id)}
                              className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded transition-colors"
                              id={`inv-confirm-delete-${p.id}`}
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setDeletingProductId(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[9px] px-1.5 py-0.5 rounded transition-colors"
                              id={`inv-cancel-delete-${p.id}`}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-1.5 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg border border-transparent hover:border-amber-200 transition-all"
                              title="Editar producto"
                              id={`inv-edit-btn-${p.id}`}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingProductId(p.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg border border-transparent hover:border-rose-200 transition-all"
                              title="Eliminar producto"
                              id={`inv-delete-btn-${p.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <ProductForm
          product={activeProduct}
          onClose={() => setShowForm(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};
