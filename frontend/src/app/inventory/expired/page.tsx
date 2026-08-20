"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Product } from "@/types";
import { fetchProducts } from "@/lib/api";
import {
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";

export default function ExpiredProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sample expired items exactly matching screenshot 1
  const sampleExpiredProducts = [
    {
      id: "1",
      sku: "PT001",
      name: "Lenovo 3rd Generation",
      productImage: "/assets/images/product-01.jpg",
      manufacturedDate: "24 Dec 2024",
      expiredDate: "20 Dec 2026",
    },
    {
      id: "2",
      sku: "PT002",
      name: "Beats Pro",
      productImage: "/assets/images/product-03.jpg",
      manufacturedDate: "10 Dec 2024",
      expiredDate: "07 Dec 2026",
    },
    {
      id: "3",
      sku: "PT003",
      name: "Nike Jordan",
      productImage: "/assets/images/product-04.jpg",
      manufacturedDate: "27 Nov 2024",
      expiredDate: "20 Nov 2026",
    },
    {
      id: "4",
      sku: "PT004",
      name: "Apple Series 5 Watch",
      productImage: "/assets/images/product-05.jpg",
      manufacturedDate: "18 Nov 2024",
      expiredDate: "15 Nov 2026",
    },
    {
      id: "5",
      sku: "PT005",
      name: "Amazon Echo Dot",
      productImage: "/assets/images/product-06.jpg",
      manufacturedDate: "06 Nov 2024",
      expiredDate: "04 Nov 2026",
    },
    {
      id: "6",
      sku: "PT006",
      name: "Sanford Chair Sofa",
      productImage: "/assets/images/product-07.jpg",
      manufacturedDate: "25 Oct 2024",
      expiredDate: "20 Oct 2026",
    },
    {
      id: "7",
      sku: "PT007",
      name: "Red Premium Satchel",
      productImage: "/assets/images/product-08.jpg",
      manufacturedDate: "14 Oct 2024",
      expiredDate: "10 Oct 2026",
    },
    {
      id: "8",
      sku: "PT008",
      name: "Iphone 14 Pro",
      productImage: "/assets/images/product-09.jpg",
      manufacturedDate: "03 Oct 2024",
      expiredDate: "01 Oct 2026",
    },
    {
      id: "9",
      sku: "PT009",
      name: "Gaming Chair",
      productImage: "/assets/images/product-10.jpg",
      manufacturedDate: "20 Sep 2024",
      expiredDate: "16 Sep 2026",
    },
    {
      id: "10",
      sku: "PT010",
      name: "Borealis Backpack",
      productImage: "/assets/images/product-11.jpg",
      manufacturedDate: "10 Sep 2024",
      expiredDate: "06 Sep 2026",
    },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts({ search });
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const displayList =
    products.length > 0
      ? products.map((p, idx) => ({
          id: p.id,
          sku: p.sku || `PT00${idx + 1}`,
          name: p.name,
          productImage: p.image || "/assets/images/product-01.jpg",
          manufacturedDate: p.manufacturedDate
            ? new Date(p.manufacturedDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "24 Dec 2024",
          expiredDate: p.expiredDate
            ? new Date(p.expiredDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "20 Dec 2026",
        }))
      : sampleExpiredProducts;

  const filteredDisplay = displayList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesProduct =
      productFilter === "all" || item.name.toLowerCase() === productFilter.toLowerCase();
    return matchesSearch && matchesProduct;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDisplay.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDisplay.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Expired Products</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your expired products</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export (Red) */}
            <button
              title="Export PDF"
              onClick={() => alert("Exporting PDF report...")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel Export (Green) */}
            <button
              title="Export Excel"
              onClick={() => alert("Exporting Excel report...")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>

            {/* Refresh */}
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
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

        {/* Expired Products Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Product</option>
                  <option value="Lenovo 3rd Generation">Lenovo 3rd Generation</option>
                  <option value="Beats Pro">Beats Pro</option>
                  <option value="Nike Jordan">Nike Jordan</option>
                  <option value="Apple Series 5 Watch">Apple Series 5 Watch</option>
                  <option value="Amazon Echo Dot">Amazon Echo Dot</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="last7days">Sort By : Last 7 Days</option>
                  <option value="last30days">Sort By : Last 30 Days</option>
                  <option value="newest">Sort By : Newest</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Clean Table with White Thead */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredDisplay.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-3 font-bold text-[#111827]">SKU</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Product</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Manufactured Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Expired Date</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {filteredDisplay.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F9FAFB] transition-colors ${
                        isSelected ? "bg-[#FFF8F2]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-[#64748B] font-normal">{item.sku}</td>

                      {/* Product with Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.productImage}
                            alt={item.name}
                            className="w-7 h-7 rounded object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                            }}
                          />
                          <span className="font-normal text-[#1E293B] line-clamp-1">{item.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B]">{item.manufacturedDate}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.expiredDate}</td>

                      {/* Actions: Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            href="/products/add"
                            title="Edit Product"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            title="Delete Product"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center transition-colors bg-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-[#64748B] gap-3 border-t border-[#F1F3F5]">
            <div className="flex items-center space-x-2">
              <span>Row Per Page</span>
              <div className="relative">
                <select className="appearance-none bg-white border border-[#E2E8F0] rounded pl-2.5 pr-6 py-1 text-xs text-[#334155] focus:outline-none cursor-pointer">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span>Entries</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#94A3B8]">
                &lt;
              </button>
              <button className="w-6 h-6 rounded-full bg-[#FE9F43] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                1
              </button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
