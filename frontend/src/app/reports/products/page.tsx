"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductReportItem, Category, Brand, Store } from "@/types";
import { fetchProductReport, fetchCategories, fetchBrands, fetchStores } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  RotateCcw,
  Search,
  Printer,
  FileSpreadsheet,
  Package,
  ChevronLeft,
  ChevronRight,
  Boxes,
  DollarSign,
  Tag,
} from "lucide-react";

export default function ProductReportPage() {
  const router = useRouter();
  const [items, setItems] = useState<ProductReportItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportData, catData, brandData, storeData] = await Promise.all([
        fetchProductReport({
          store: selectedStore !== "All" ? selectedStore : undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          brand: selectedBrand !== "All" ? selectedBrand : undefined,
          search: search.trim() || undefined,
        }),
        fetchCategories(),
        fetchBrands(),
        fetchStores(),
      ]);
      setItems(reportData || []);
      setCategories(catData || []);
      setBrands(brandData || []);
      setStores(storeData || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStore, selectedCategory, selectedBrand]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  // KPI Calculations
  const summary = useMemo(() => {
    const totalProducts = items.length;
    let totalStock = 0;
    let totalValue = 0;

    items.forEach((it) => {
      totalStock += it.instockQty || 0;
      totalValue += (it.instockQty || 0) * (it.price || 0);
    });

    return {
      totalProducts,
      totalStock,
      totalValue,
    };
  }, [items]);

  // Client-side search filtering
  const filteredList = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (it) =>
        it.productName.toLowerCase().includes(q) ||
        it.sku.toLowerCase().includes(q) ||
        (it.category && it.category.toLowerCase().includes(q)) ||
        (it.brand && it.brand.toLowerCase().includes(q))
    );
  }, [items, search]);

  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedList = filteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    if (filteredList.length === 0) return;
    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "Brand",
      "Unit",
      "Price (THB)",
      "In-Stock Qty",
    ];

    const rows = filteredList.map((item) => [
      `"${item.sku}"`,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.category || "-"}"`,
      `"${item.brand || "-"}"`,
      `"${item.unit || "-"}"`,
      item.price || 0,
      item.instockQty || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `product_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({ value: c.name, label: c.name }));
  }, [categories]);

  const brandOptions = useMemo(() => {
    return brands.map((b) => ({ value: b.name, label: b.name }));
  }, [brands]);

  const storeOptions = useMemo(() => {
    return stores.map((s) => ({ value: s.name, label: s.name }));
  }, [stores]);

  return (
    <AppLayout>
      <div className="space-y-5 p-6 max-w-[1600px] mx-auto">
        {/* Top Tab Bar Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => router.push("/reports/products")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FE9F43] text-white shadow-xs transition-all cursor-pointer"
          >
            Product Report (รายงานสินค้าทั้งหมด)
          </button>
          <button
            onClick={() => router.push("/reports/products/quantity-alert")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
          >
            Quantity Alert (สินค้าถึงจุดเตือนสั่งซื้อ)
          </button>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Product Catalog Report (รายงานแคตตาล็อกสินค้าและราคา)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              สรุปรายการสินค้า, หมวดหมู่, แบรนด์, ราคาขาย, และสต็อกคงเหลือจริงจากฐานข้อมูล
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => window.print()}
              title="พิมพ์รายงาน PDF"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportCSV}
              title="ส่งออก CSV"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              title="รีเฟรชข้อมูล"
              onClick={loadData}
              className="p-2 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition border border-gray-300 shadow-xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                จำนวนรายการสินค้า (Total Items)
              </span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {summary.totalProducts} <span className="text-xs font-normal text-gray-500">รายการ</span>
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                ยอดสต็อกคงเหลือรวม (In-Stock)
              </span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {summary.totalStock.toLocaleString()}{" "}
                <span className="text-xs font-normal text-gray-500">ชิ้น/กก.</span>
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                มูลค่าสินค้าขายรวม (Retail Value)
              </span>
              <p className="text-xl font-bold text-indigo-700 mt-1">
                ฿{summary.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Box with SearchableSelect */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">ค้นหา (Search SKU / Name)</label>
              <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#FE9F43] h-10">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อสินค้า หรือ SKU..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Category SearchableSelect */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">หมวดหมู่ (Category)</label>
              <SearchableSelect
                options={categoryOptions}
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val || "All");
                  setCurrentPage(1);
                }}
                placeholder="เลือกหมวดหมู่สินค้า..."
                showAllOption={true}
                allOptionLabel="ทุกหมวดหมู่ (All Categories)"
                showSelectOption={false}
                size="md"
              />
            </div>

            {/* Brand SearchableSelect */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">แบรนด์ / ยี่ห้อ (Brand)</label>
              <SearchableSelect
                options={brandOptions}
                value={selectedBrand}
                onChange={(val) => {
                  setSelectedBrand(val || "All");
                  setCurrentPage(1);
                }}
                placeholder="เลือกแบรนด์สินค้า..."
                showAllOption={true}
                allOptionLabel="ทุกแบรนด์ (All Brands)"
                showSelectOption={false}
                size="md"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 h-10 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                ค้นหา
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSelectedBrand("All");
                  setSelectedStore("All");
                  setCurrentPage(1);
                }}
                className="px-3 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px] border-collapse">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3 px-4 font-bold">SKU</th>
                  <th className="py-3 px-4 font-bold">ชื่อสินค้า</th>
                  <th className="py-3 px-4 font-bold">หมวดหมู่</th>
                  <th className="py-3 px-4 font-bold">แบรนด์</th>
                  <th className="py-3 px-4 font-bold">หน่วย</th>
                  <th className="py-3 px-4 font-bold text-right">ราคาขาย</th>
                  <th className="py-3 px-4 font-bold text-right">สต็อกคงเหลือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FE9F43] border-t-transparent mb-2" />
                      <p>กำลังโหลดรายงานสินค้า...</p>
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข</p>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-gray-600">{item.sku}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-bold shrink-0 overflow-hidden">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <span className="font-semibold text-gray-900">{item.productName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px]">
                          {item.category || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{item.brand || "-"}</td>
                      <td className="py-3 px-4 text-gray-600">{item.unit || "ชิ้น"}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        ฿{Number(item.price || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        {(item.instockQty || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {!loading && filteredList.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 gap-3">
              <div className="flex items-center space-x-2">
                <span>แสดง</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                >
                  <option value={10}>10 รายการ</option>
                  <option value={25}>25 รายการ</option>
                  <option value={50}>50 รายการ</option>
                </select>
                <span>
                  จากทั้งหมด {totalEntries} รายการ (หน้า {currentPage} / {totalPages})
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 border border-gray-300 rounded bg-white disabled:opacity-40 hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 border border-gray-300 rounded bg-white disabled:opacity-40 hover:bg-gray-100 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
