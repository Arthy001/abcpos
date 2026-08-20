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
  Edit,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";

interface PurchaseReturnItem {
  id: string;
  product: string;
  productImage: string;
  date: string;
  supplierName: string;
  reference: string;
  status: "Received" | "Pending";
  total: string;
  paid: string;
  due: string;
  paymentStatus: "Paid" | "Unpaid" | "Overdue";
}

export default function PurchaseReturnsPage() {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // 10 Sample items matching Screenshot 1
  const sampleReturns: PurchaseReturnItem[] = [
    {
      id: "1",
      product: "Lenovo IdeaPad 3",
      productImage: "/assets/images/product-01.jpg",
      date: "24 Dec 2024",
      supplierName: "Electro Mart",
      reference: "PT001",
      status: "Received",
      total: "$1000",
      paid: "$1000",
      due: "$0.00",
      paymentStatus: "Paid",
    },
    {
      id: "2",
      product: "Beats Pro",
      productImage: "/assets/images/product-03.jpg",
      date: "10 Dec 2024",
      supplierName: "Quantum Gadgets",
      reference: "PT002",
      status: "Pending",
      total: "$1500",
      paid: "$0.00",
      due: "$1500",
      paymentStatus: "Unpaid",
    },
    {
      id: "3",
      product: "Nike Jordan",
      productImage: "/assets/images/product-04.jpg",
      date: "27 Nov 2024",
      supplierName: "Prime Bazaar",
      reference: "PT003",
      status: "Received",
      total: "$1500",
      paid: "$1800",
      due: "$0.00",
      paymentStatus: "Paid",
    },
    {
      id: "4",
      product: "Apple Series 5 Watch",
      productImage: "/assets/images/product-05.jpg",
      date: "18 Nov 2024",
      supplierName: "Gadget World",
      reference: "PT004",
      status: "Received",
      total: "$2000",
      paid: "$1000",
      due: "$1000",
      paymentStatus: "Overdue",
    },
    {
      id: "5",
      product: "Amazon Echo Dot",
      productImage: "/assets/images/product-06.jpg",
      date: "06 Nov 2024",
      supplierName: "Volt Vault",
      reference: "PT005",
      status: "Received",
      total: "$800",
      paid: "$800",
      due: "$0.00",
      paymentStatus: "Paid",
    },
    {
      id: "6",
      product: "Sanford Chair Sofa",
      productImage: "/assets/images/product-10.jpg",
      date: "25 Oct 2024",
      supplierName: "Elite Retail",
      reference: "PT006",
      status: "Pending",
      total: "$750",
      paid: "$0.00",
      due: "$750",
      paymentStatus: "Unpaid",
    },
    {
      id: "7",
      product: "Red Premium Satchel",
      productImage: "/assets/images/product-08.jpg",
      date: "14 Oct 2024",
      supplierName: "Prime Mart",
      reference: "PT007",
      status: "Received",
      total: "$1300",
      paid: "$1300",
      due: "$0.00",
      paymentStatus: "Paid",
    },
    {
      id: "8",
      product: "Iphone 14 Pro",
      productImage: "/assets/images/product-09.jpg",
      date: "14 Oct 2024",
      supplierName: "NeoTech Store",
      reference: "PT008",
      status: "Received",
      total: "$1100",
      paid: "$1100",
      due: "$0.00",
      paymentStatus: "Paid",
    },
    {
      id: "9",
      product: "Gaming Chair",
      productImage: "/assets/images/product-10.jpg",
      date: "20 Sep 2024",
      supplierName: "Urban Mart",
      reference: "PT009",
      status: "Pending",
      total: "$2300",
      paid: "$2300",
      due: "$0.00",
      paymentStatus: "Paid",
    },
    {
      id: "10",
      product: "Borealis Backpack",
      productImage: "/assets/images/product-11.jpg",
      date: "10 Sep 2024",
      supplierName: "Travel Mart",
      reference: "PT010",
      status: "Pending",
      total: "$1700",
      paid: "$1700",
      due: "$0.00",
      paymentStatus: "Paid",
    },
  ];

  const filteredDisplay = sampleReturns.filter((item) => {
    const matchesSearch =
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      item.reference.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Purchase Returns</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your purchase return</p>
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

            {/* + Add Purchase Return Button (Orange) */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Purchase Return</span>
            </button>
          </div>
        </div>

        {/* Purchase Return Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filters Bar */}
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Status</option>
                  <option value="Received">Received</option>
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
                  <th className="py-3 px-4 font-bold text-[#111827]">Product Image</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Supplier Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Total</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Paid</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Due</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Payment Status</th>
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

                      {/* Product Thumbnail */}
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
                          <span className="font-medium text-[#1E293B] line-clamp-1">{item.product}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B]">{item.date}</td>
                      <td className="py-3.5 px-4 text-[#334155] font-medium">{item.supplierName}</td>
                      <td className="py-3.5 px-4 text-[#64748B] font-mono">{item.reference}</td>

                      {/* Status Badges: Received (Green), Pending (Cyan) */}
                      <td className="py-3.5 px-4">
                        {item.status === "Received" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#28C76F] text-white">
                            Received
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#00CFE8] text-white">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.total}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.paid}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.due}</td>

                      {/* Payment Status with dot */}
                      <td className="py-3.5 px-4">
                        {item.paymentStatus === "Paid" && (
                          <span className="inline-flex items-center space-x-1 text-[#28C76F] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#28C76F]" />
                            <span>Paid</span>
                          </span>
                        )}
                        {item.paymentStatus === "Unpaid" && (
                          <span className="inline-flex items-center space-x-1 text-[#EA5455] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EA5455]" />
                            <span>Unpaid</span>
                          </span>
                        )}
                        {item.paymentStatus === "Overdue" && (
                          <span className="inline-flex items-center space-x-1 text-[#FF9F43] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F43]" />
                            <span>Overdue</span>
                          </span>
                        )}
                      </td>

                      {/* Actions: Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            title="Edit Return"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Return"
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

        {/* Add Return Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Add Purchase Return</h3>
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
                  alert("Purchase return recorded successfully!");
                  setShowAddModal(false);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electro Mart"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Product *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lenovo IdeaPad 3"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Total Refund ($) *</label>
                    <input
                      type="number"
                      required
                      placeholder="1000"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Status</label>
                    <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]">
                      <option value="Received">Received</option>
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
                    Save Return
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
