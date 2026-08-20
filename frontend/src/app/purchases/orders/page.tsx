"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface PurchaseOrderItem {
  id: string;
  product: string;
  productImage: string;
  purchasedAmount: string;
  purchasedQty: number;
  instockQty: number;
}

export default function PurchaseOrderPage() {
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 10 Sample items matching Screenshot 3
  const sampleOrders: PurchaseOrderItem[] = [
    {
      id: "1",
      product: "Lenovo IdeaPad 3",
      productImage: "/assets/images/product-01.jpg",
      purchasedAmount: "$1000",
      purchasedQty: 40,
      instockQty: 30,
    },
    {
      id: "2",
      product: "Beats Pro",
      productImage: "/assets/images/product-03.jpg",
      purchasedAmount: "$1500",
      purchasedQty: 25,
      instockQty: 18,
    },
    {
      id: "3",
      product: "Nike Jordan",
      productImage: "/assets/images/product-04.jpg",
      purchasedAmount: "$1500",
      purchasedQty: 30,
      instockQty: 35,
    },
    {
      id: "4",
      product: "Apple Series 5 Watch",
      productImage: "/assets/images/product-05.jpg",
      purchasedAmount: "$2000",
      purchasedQty: 28,
      instockQty: 30,
    },
    {
      id: "5",
      product: "Amazon Echo Dot",
      productImage: "/assets/images/product-06.jpg",
      purchasedAmount: "$800",
      purchasedQty: 15,
      instockQty: 10,
    },
    {
      id: "6",
      product: "Sanford Chair Sofa",
      productImage: "/assets/images/product-10.jpg",
      purchasedAmount: "$750",
      purchasedQty: 20,
      instockQty: 15,
    },
    {
      id: "7",
      product: "Red Premium Satchel",
      productImage: "/assets/images/product-08.jpg",
      purchasedAmount: "$1300",
      purchasedQty: 35,
      instockQty: 40,
    },
    {
      id: "8",
      product: "Iphone 14 Pro",
      productImage: "/assets/images/product-09.jpg",
      purchasedAmount: "$1100",
      purchasedQty: 45,
      instockQty: 35,
    },
    {
      id: "9",
      product: "Gaming Chair",
      productImage: "/assets/images/product-10.jpg",
      purchasedAmount: "$2300",
      purchasedQty: 22,
      instockQty: 20,
    },
    {
      id: "10",
      product: "Borealis Backpack",
      productImage: "/assets/images/product-11.jpg",
      purchasedAmount: "$1700",
      purchasedQty: 18,
      instockQty: 25,
    },
  ];

  const filteredDisplay = sampleOrders.filter((item) =>
    item.product.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDisplay.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDisplay.map((s) => s.id));
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Purchase order</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your Purchase order</p>
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

        {/* Purchase Order Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Sort Bar */}
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
                  <th className="py-3 px-4 font-bold text-[#111827]">Product</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Purchased Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Purchased QTY</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Instock QTY</th>
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

                      {/* Product with Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.productImage}
                            alt={item.product}
                            className="w-7 h-7 rounded object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                            }}
                          />
                          <span className="font-medium text-[#1E293B]">{item.product}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.purchasedAmount}</td>
                      <td className="py-3.5 px-4 text-[#64748B] font-medium">{item.purchasedQty}</td>
                      <td className="py-3.5 px-4 text-[#64748B] font-medium">{item.instockQty}</td>
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
