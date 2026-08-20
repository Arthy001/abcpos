"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";

interface QuotationItem {
  id: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerAvatar: string;
  status: "Sent" | "Ordered" | "Pending";
  total: string;
}

export default function QuotationsPage() {
  const [search, setSearch] = useState<string>("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [viewItem, setViewItem] = useState<QuotationItem | null>(null);

  // 10 Sample items exactly matching Screenshot 1
  const sampleQuotations: QuotationItem[] = [
    {
      id: "1",
      productName: "Lenovo 3rd Generation",
      productImage: "/assets/images/product-01.jpg",
      customerName: "Carl Evans",
      customerAvatar: "/assets/images/avatar-01.jpg",
      status: "Sent",
      total: "$550",
    },
    {
      id: "2",
      productName: "Bold V3.2",
      productImage: "/assets/images/product-03.jpg",
      customerName: "Minerva Ramirez",
      customerAvatar: "/assets/images/avatar-02.jpg",
      status: "Sent",
      total: "$430",
    },
    {
      id: "3",
      productName: "Nike Jordan",
      productImage: "/assets/images/product-04.jpg",
      customerName: "Robert Lamon",
      customerAvatar: "/assets/images/avatar-03.jpg",
      status: "Ordered",
      total: "$260",
    },
    {
      id: "4",
      productName: "Apple Series 5 Watch",
      productImage: "/assets/images/product-05.jpg",
      customerName: "Mark Joslyn",
      customerAvatar: "/assets/images/avatar-05.jpg",
      status: "Sent",
      total: "$470",
    },
    {
      id: "5",
      productName: "Amazon Echo Dot",
      productImage: "/assets/images/product-06.jpg",
      customerName: "Patricia Lewis",
      customerAvatar: "/assets/images/avatar-04.jpg",
      status: "Pending",
      total: "$380",
    },
    {
      id: "6",
      productName: "Lobar Handy",
      productImage: "/assets/images/product-07.jpg",
      customerName: "Marsha Betts",
      customerAvatar: "/assets/images/avatar-06.jpg",
      status: "Sent",
      total: "$190",
    },
    {
      id: "7",
      productName: "Red Premium Handy",
      productImage: "/assets/images/product-08.jpg",
      customerName: "Daniel Jude",
      customerAvatar: "/assets/images/avatar-07.jpg",
      status: "Pending",
      total: "$540",
    },
    {
      id: "8",
      productName: "Iphone 14 Pro",
      productImage: "/assets/images/product-09.jpg",
      customerName: "Emma Bates",
      customerAvatar: "/assets/images/avatar-08.jpg",
      status: "Ordered",
      total: "$610",
    },
    {
      id: "9",
      productName: "Black Slim 200",
      productImage: "/assets/images/product-10.jpg",
      customerName: "Richard Fralick",
      customerAvatar: "/assets/images/avatar-09.jpg",
      status: "Pending",
      total: "$220",
    },
    {
      id: "10",
      productName: "Woodcraft Sandal",
      productImage: "/assets/images/product-11.jpg",
      customerName: "Michelle Robison",
      customerAvatar: "/assets/images/avatar-10.jpg",
      status: "Sent",
      total: "$460",
    },
  ];

  const filteredDisplay = sampleQuotations.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesProduct =
      productFilter === "all" || item.productName === productFilter;
    const matchesCustomer =
      customerFilter === "all" || item.customerName === customerFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesProduct && matchesCustomer && matchesStatus;
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Quotation List</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage Your Quotation</p>
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

            {/* + Add Quotation Button (Orange) */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Quotation</span>
            </button>
          </div>
        </div>

        {/* Quotation Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & 4 Filters Bar */}
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

            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <div className="relative">
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Product</option>
                  {sampleQuotations.map((q, idx) => (
                    <option key={idx} value={q.productName}>
                      {q.productName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Customer</option>
                  {sampleQuotations.map((q, idx) => (
                    <option key={idx} value={q.customerName}>
                      {q.customerName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Status</option>
                  <option value="Sent">Sent</option>
                  <option value="Ordered">Ordered</option>
                  <option value="Pending">Pending</option>
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
                  <th className="py-3 px-4 font-bold text-[#111827]">Product Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Custmer Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Total</th>
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

                      {/* Product Name with Thumbnail */}
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

                      {/* Customer with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {item.customerName.slice(0, 1)}
                          </div>
                          <span className="text-[#334155] font-medium">{item.customerName}</span>
                        </div>
                      </td>

                      {/* Status Badges: Sent (Green), Ordered (Yellow/Orange), Pending (Cyan) */}
                      <td className="py-3.5 px-4">
                        {item.status === "Sent" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#28C76F] text-white">
                            Sent
                          </span>
                        )}
                        {item.status === "Ordered" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#FF9F43] text-white">
                            Ordered
                          </span>
                        )}
                        {item.status === "Pending" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#00CFE8] text-white">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.total}</td>

                      {/* Action buttons: View (Eye), Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setViewItem(item)}
                            title="View Quotation"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Edit Quotation"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Quotation"
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
                2
              </button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Add Quotation Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Add Quotation</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Quotation created successfully!");
                  setShowAddModal(false);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carl Evans"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lenovo 3rd Generation"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Total ($) *</label>
                    <input
                      type="number"
                      required
                      placeholder="550"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Status</label>
                    <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]">
                      <option value="Sent">Sent</option>
                      <option value="Ordered">Ordered</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white font-bold rounded-xl shadow-sm active:scale-95 transition-all"
                  >
                    Create Quotation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
