"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Product, Warehouse, Store } from "@/types";
import { fetchProducts, fetchWarehouses, fetchStores } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  RotateCcw,
  ChevronUp,
  Search,
  Trash2,
  Minus,
  Plus,
  Printer,
  Barcode as BarcodeIcon,
  ChevronDown,
} from "lucide-react";

interface SelectedProduct {
  id: string;
  name: string;
  sku: string;
  code: string;
  price: number;
  qty: number;
  image: string;
}

export default function PrintBarcodePage() {
  const [warehouse, setWarehouse] = useState<string>("");
  const [store, setStore] = useState<string>("");
  const [paperSize, setPaperSize] = useState<string>("36mm (1.4 Inch) 20 per sheet");
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [showProductName, setShowProductName] = useState<boolean>(true);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [productSearch, setProductSearch] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [warehousesList, setWarehousesList] = useState<Warehouse[]>([]);
  const [storesList, setStoresList] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, whs, sts] = await Promise.all([
        fetchProducts(),
        fetchWarehouses(),
        fetchStores(),
      ]);
      setProductsList(prods || []);
      setWarehousesList(whs || []);
      setStoresList(sts || []);

      if (whs && whs.length > 0) setWarehouse(whs[0].name);
      if (sts && sts.length > 0) setStore(sts[0].name);

      // Pre-select first 2 real products if available
      if (prods && prods.length > 0) {
        setSelectedProducts(
          prods.slice(0, 2).map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            code: p.barcode || p.sku,
            price: p.price,
            qty: 4,
            image: p.image || "/assets/images/product-01.jpg",
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load barcode print master data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSearchProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    return productsList.filter(
      (p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(productSearch.toLowerCase()))
    );
  }, [productSearch, productsList]);

  const addProductFromSearch = (p: Product) => {
    if (selectedProducts.some((item) => item.id === p.id)) {
      updateQty(p.id, 1);
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          id: p.id,
          name: p.name,
          sku: p.sku,
          code: p.barcode || p.sku,
          price: p.price,
          qty: 1,
          image: p.image || "/assets/images/product-01.jpg",
        },
      ]);
    }
    setProductSearch("");
    setIsSearchOpen(false);
  };

  const updateQty = (id: string, delta: number) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const resetBarcode = () => {
    setSelectedProducts([]);
    setWarehouse("");
    setStore("");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Print Barcode</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your barcodes</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Refresh */}
            <button
              title="Refresh"
              onClick={() => {}}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Collapse */}
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Print Barcode Form Box */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-6 space-y-6">
          {/* Row 1: Warehouse & Store */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                placeholder="Select Warehouse"
                value={warehouse}
                onChange={(val) => setWarehouse(val)}
                options={warehousesList.map((w) => ({ value: w.name, label: w.name }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Store <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                placeholder="Select Store"
                value={store}
                onChange={(val) => setStore(val)}
                options={storesList.map((s) => ({ value: s.name, label: s.name }))}
              />
            </div>
          </div>

          {/* Row 2: Product Search */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-gray-700">
              Product <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Product by Name, SKU or Barcode..."
                value={productSearch}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
              />
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
            </div>

            {/* Live Search Results Dropdown */}
            {isSearchOpen && filteredSearchProducts.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto divide-y divide-gray-50">
                {filteredSearchProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => addProductFromSearch(p)}
                    className="p-2.5 hover:bg-orange-50/50 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.image || "/assets/images/product-01.jpg"}
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover border border-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                        }}
                      />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                        <p className="text-[11px] text-gray-400">SKU: {p.sku} | Barcode: {p.barcode || "-"}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#FE9F43]">฿{p.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Selection Table */}
          <div className="rounded-lg border border-[#F1F3F5] overflow-hidden">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-[#F8F9FA] text-[#334155] font-bold border-b border-[#F1F3F5]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {selectedProducts.length > 0 ? (
                  selectedProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FCFCFD]">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-7 h-7 rounded object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                            }}
                          />
                          <span className="font-normal text-[#1E293B]">{p.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#64748B] font-mono">{p.sku}</td>
                      <td className="py-3 px-4 text-[#64748B] font-mono">{p.code}</td>

                      {/* Qty Counter with minus and plus circular buttons */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center space-x-2 border border-[#E2E8F0] rounded-full px-2 py-0.5 bg-white">
                          <button
                            type="button"
                            onClick={() => updateQty(p.id, -1)}
                            className="w-4 h-4 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-semibold text-[#1E293B] w-4 text-center">
                            {p.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(p.id, 1)}
                            className="w-4 h-4 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeProduct(p.id)}
                          className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] inline-flex items-center justify-center transition-colors bg-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      No products selected. Search product above to add.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Row 3: Paper Size & Toggle Switches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 items-center">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Paper Size <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="36mm (1.4 Inch) 20 per sheet">36mm (1.4 Inch) 20 per sheet</option>
                  <option value="24mm (0.94 Inch) 30 per sheet">24mm (0.94 Inch) 30 per sheet</option>
                  <option value="18mm (0.7 Inch) 40 per sheet">18mm (0.7 Inch) 40 per sheet</option>
                  <option value="A4 30 Labels per sheet">A4 30 Labels per sheet</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#9CA3AF] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 3 Toggle switches: Show Store Name, Show Product Name, Show Price */}
            <div className="flex items-center space-x-6 pt-5">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStoreName(!showStoreName)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    showStoreName ? "bg-[#28C76F]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showStoreName ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-gray-700">Show Store Name</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProductName(!showProductName)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    showProductName ? "bg-[#28C76F]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showProductName ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-gray-700">Show Product Name</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrice(!showPrice)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    showPrice ? "bg-[#28C76F]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showPrice ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-gray-700">Show Price</span>
              </div>
            </div>
          </div>

          {/* Live Barcode Sheet Preview (Visible on Screen and Printed via @media print) */}
          {selectedProducts.length > 0 && (
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-gray-700">Barcode Labels Preview ({paperSize})</h3>
              <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {selectedProducts.flatMap((p) =>
                  Array.from({ length: p.qty }).map((_, idx) => (
                    <div
                      key={`${p.id}-${idx}`}
                      className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs flex flex-col items-center justify-center text-center space-y-1 text-black"
                    >
                      {showStoreName && store && (
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-700 truncate max-w-full">
                          {store}
                        </p>
                      )}
                      {showProductName && (
                        <p className="text-[11px] font-semibold text-gray-900 truncate max-w-full">
                          {p.name}
                        </p>
                      )}
                      {/* Barcode Graphic */}
                      <div className="py-1 flex flex-col items-center">
                        <div className="flex items-center space-x-[2px] h-9">
                          <div className="w-1 h-full bg-black"></div>
                          <div className="w-[1px] h-full bg-black"></div>
                          <div className="w-[3px] h-full bg-black"></div>
                          <div className="w-[1px] h-full bg-black"></div>
                          <div className="w-2 h-full bg-black"></div>
                          <div className="w-[1px] h-full bg-black"></div>
                          <div className="w-[2px] h-full bg-black"></div>
                          <div className="w-[3px] h-full bg-black"></div>
                          <div className="w-[1px] h-full bg-black"></div>
                          <div className="w-2 h-full bg-black"></div>
                          <div className="w-[1px] h-full bg-black"></div>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-gray-600 mt-0.5">
                          {p.code}
                        </span>
                      </div>
                      {showPrice && (
                        <p className="text-xs font-bold text-black">
                          ฿{p.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Bottom Right Actions: Generate Barcode (Orange), Reset Barcode (Navy), Print Barcode (Red) */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => alert("Barcodes generated successfully!")}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <BarcodeIcon className="w-3.5 h-3.5" />
              <span>Generate Barcode</span>
            </button>

            <button
              type="button"
              onClick={resetBarcode}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#0E1422] hover:bg-[#1E293B] text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Barcode</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#E02424] hover:bg-[#C81E1E] text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Barcode</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
