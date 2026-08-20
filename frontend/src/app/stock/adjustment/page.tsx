"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  File,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";

export default function StockAdjustmentPage() {
  const [search, setSearch] = useState<string>("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 10 items matching Screenshot 3
  const sampleAdjustmentList = [
    {
      id: "1",
      warehouse: "Lavish Warehouse",
      store: "Electro Mart",
      productName: "Lenovo IdeaPad 3",
      productImage: "/assets/images/product-01.jpg",
      date: "24 Dec 2024",
      person: "James Kirwin",
      personAvatar: "/assets/images/avatar-01.jpg",
      qty: 100,
    },
    {
      id: "2",
      warehouse: "Quaint Warehouse",
      store: "Quantum Gadgets",
      productName: "Beats Pro",
      productImage: "/assets/images/product-03.jpg",
      date: "10 Dec 2024",
      person: "Francis Chang",
      personAvatar: "/assets/images/avatar-02.jpg",
      qty: 140,
    },
    {
      id: "3",
      warehouse: "Overflow Warehouse",
      store: "Prime Bazaar",
      productName: "Nike Jordan",
      productImage: "/assets/images/product-04.jpg",
      date: "25 Jul 2023",
      person: "Antonio Engle",
      personAvatar: "/assets/images/avatar-03.jpg",
      qty: 120,
    },
    {
      id: "4",
      warehouse: "Quaint Warehouse",
      store: "Gadget World",
      productName: "Apple Series 5 Watch",
      productImage: "/assets/images/product-05.jpg",
      date: "20 Jul 2023",
      person: "Leo Kelly",
      personAvatar: "/assets/images/avatar-04.jpg",
      qty: 130,
    },
    {
      id: "5",
      warehouse: "Traditional Warehouse",
      store: "Volt Vault",
      productName: "Amazon Echo Dot",
      productImage: "/assets/images/product-06.jpg",
      date: "24 Jul 2023",
      person: "Annette Walker",
      personAvatar: "/assets/images/avatar-05.jpg",
      qty: 140,
    },
    {
      id: "6",
      warehouse: "Cool Warehouse",
      store: "Elite Retail",
      productName: "Lobar Handy",
      productImage: "/assets/images/product-07.jpg",
      date: "15 Jul 2023",
      person: "John Weaver",
      personAvatar: "/assets/images/avatar-06.jpg",
      qty: 150,
    },
    {
      id: "7",
      warehouse: "Retail Supply Hub",
      store: "Prime Mart",
      productName: "Red Premium Satchel",
      productImage: "/assets/images/product-08.jpg",
      date: "14 Oct 2024",
      person: "Gary Hennessy",
      personAvatar: "/assets/images/avatar-07.jpg",
      qty: 700,
    },
    {
      id: "8",
      warehouse: "EdgeWare Solutions",
      store: "NeoTech Store",
      productName: "Iphone 14 Pro",
      productImage: "/assets/images/product-09.jpg",
      date: "03 Oct 2024",
      person: "Eleanor Panek",
      personAvatar: "/assets/images/avatar-08.jpg",
      qty: 630,
    },
    {
      id: "9",
      warehouse: "North Zone Warehouse",
      store: "Urban Mart",
      productName: "Gaming Chair",
      productImage: "/assets/images/product-10.jpg",
      date: "20 Sep 2024",
      person: "William Levy",
      personAvatar: "/assets/images/avatar-09.jpg",
      qty: 410,
    },
    {
      id: "10",
      warehouse: "Fulfillment Hub",
      store: "Travel Mart",
      productName: "Borealis Backpack",
      productImage: "/assets/images/product-11.jpg",
      date: "10 Sep 2024",
      person: "Charlotte Klotz",
      personAvatar: "/assets/images/avatar-10.jpg",
      qty: 550,
    },
  ];

  const filteredDisplay = sampleAdjustmentList.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(search.toLowerCase()) ||
      item.person.toLowerCase().includes(search.toLowerCase());
    const matchesWh = warehouseFilter === "all" || item.warehouse === warehouseFilter;
    return matchesSearch && matchesWh;
  });

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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Stock Adjustment</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your stock adjustment</p>
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

            {/* + Add Adjustment Button (Orange) */}
            <button
              onClick={() => alert("Open Add Stock Adjustment Modal")}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Adjustment</span>
            </button>
          </div>
        </div>

        {/* Stock Adjustment Table Card Container */}
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
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Warehouse</option>
                  {sampleAdjustmentList.map((s, idx) => (
                    <option key={idx} value={s.warehouse}>
                      {s.warehouse}
                    </option>
                  ))}
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
                  <th className="py-3 px-4 font-bold text-[#111827]">Warehouse</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Store</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Product</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Person</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Qty</th>
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

                      <td className="py-3.5 px-4 text-[#64748B]">{item.warehouse}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.store}</td>

                      {/* Product with Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-7 h-7 rounded object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                            }}
                          />
                          <span className="font-normal text-[#1E293B] line-clamp-1">{item.productName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B]">{item.date}</td>

                      {/* Person with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {item.person.slice(0, 1)}
                          </div>
                          <span className="text-[#334155]">{item.person}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.qty}</td>

                      {/* Actions: View Details (File icon), Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            title="View Details"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white"
                          >
                            <File className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href="/products/add"
                            title="Edit Adjustment"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            title="Delete Adjustment Record"
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
