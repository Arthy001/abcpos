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

interface GiftCardItem {
  id: string;
  code: string;
  customer: string;
  customerAvatar: string;
  issuedDate: string;
  expiryDate: string;
  amount: string;
  balance: string;
  status: "Active" | "Redeemed" | "Inactive" | "Expired";
}

export default function GiftCardsPage() {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // 10 Sample items matching Screenshot 2
  const sampleGiftCards: GiftCardItem[] = [
    {
      id: "1",
      code: "GFT1110",
      customer: "Carl Evans",
      customerAvatar: "/assets/images/avatar-01.jpg",
      issuedDate: "24 Dec 2024",
      expiryDate: "24 Jan 2026",
      amount: "$200",
      balance: "$100",
      status: "Active",
    },
    {
      id: "2",
      code: "GFT1109",
      customer: "Minerva Ramirez",
      customerAvatar: "/assets/images/avatar-02.jpg",
      issuedDate: "10 Dec 2024",
      expiryDate: "10 Jan 2026",
      amount: "$300",
      balance: "$200",
      status: "Active",
    },
    {
      id: "3",
      code: "GFT1108",
      customer: "Robert Lamon",
      customerAvatar: "/assets/images/avatar-03.jpg",
      issuedDate: "27 Nov 2024",
      expiryDate: "27 Dec 2024",
      amount: "$200",
      balance: "$150",
      status: "Active",
    },
    {
      id: "4",
      code: "GFT1107",
      customer: "Patricia Lewis",
      customerAvatar: "/assets/images/avatar-04.jpg",
      issuedDate: "18 Nov 2024",
      expiryDate: "18 Dec 2024",
      amount: "$120",
      balance: "$0",
      status: "Redeemed",
    },
    {
      id: "5",
      code: "GFT1106",
      customer: "Mark Joslyn",
      customerAvatar: "/assets/images/avatar-05.jpg",
      issuedDate: "06 Nov 2024",
      expiryDate: "06 Dec 2024",
      amount: "$350",
      balance: "$300",
      status: "Active",
    },
    {
      id: "6",
      code: "GFT1105",
      customer: "Marsha Betts",
      customerAvatar: "/assets/images/avatar-06.jpg",
      issuedDate: "25 Oct 2024",
      expiryDate: "25 Nov 2024",
      amount: "$500",
      balance: "$400",
      status: "Active",
    },
    {
      id: "7",
      code: "GFT1104",
      customer: "Daniel Jude",
      customerAvatar: "/assets/images/avatar-07.jpg",
      issuedDate: "14 Oct 2024",
      expiryDate: "14 Nov 2024",
      amount: "$220",
      balance: "$150",
      status: "Active",
    },
    {
      id: "8",
      code: "GFT1103",
      customer: "Emma Bates",
      customerAvatar: "/assets/images/avatar-08.jpg",
      issuedDate: "03 Oct 2024",
      expiryDate: "03 Nov 2024",
      amount: "$260",
      balance: "$220",
      status: "Inactive",
    },
    {
      id: "9",
      code: "GFT1102",
      customer: "Richard Fralick",
      customerAvatar: "/assets/images/avatar-09.jpg",
      issuedDate: "20 Sep 2024",
      expiryDate: "20 Oct 2024",
      amount: "$200",
      balance: "$160",
      status: "Active",
    },
    {
      id: "10",
      code: "GFT1101",
      customer: "Michelle Robison",
      customerAvatar: "/assets/images/avatar-10.jpg",
      issuedDate: "10 Sep 2024",
      expiryDate: "10 Oct 2024",
      amount: "$400",
      balance: "$350",
      status: "Expired",
    },
  ];

  const filteredDisplay = sampleGiftCards.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.customer.toLowerCase().includes(search.toLowerCase());
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Gift Cards</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your gift cards</p>
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

            {/* + Add Gift Card Button (Orange) */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Gift Card</span>
            </button>
          </div>
        </div>

        {/* Gift Cards Table Card Container */}
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
                  <option value="Active">Active</option>
                  <option value="Redeemed">Redeemed</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
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
                  <th className="py-3 px-4 font-bold text-[#111827]">Gift Card</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Customer</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Issued Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Expiry Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Balance</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
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

                      <td className="py-3.5 px-4 font-mono font-medium text-[#1E293B]">{item.code}</td>

                      {/* Customer with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {item.customer.slice(0, 1)}
                          </div>
                          <span className="text-[#334155] font-medium">{item.customer}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B]">{item.issuedDate}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.expiryDate}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.amount}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.balance}</td>

                      {/* Status Badges: Active (Green), Redeemed (Purple), Inactive (Red), Expired (Gray dot) */}
                      <td className="py-3.5 px-4">
                        {item.status === "Active" && (
                          <span className="inline-flex items-center space-x-1 text-[#28C76F] font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#28C76F]" />
                            <span>Active</span>
                          </span>
                        )}
                        {item.status === "Redeemed" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E83E8C] text-white">
                            Redeemed
                          </span>
                        )}
                        {item.status === "Inactive" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EA5455] text-white">
                            Inactive
                          </span>
                        )}
                        {item.status === "Expired" && (
                          <span className="inline-flex items-center space-x-1 text-[#64748B] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span>Expired</span>
                          </span>
                        )}
                      </td>

                      {/* Action buttons: View, Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            title="View Card"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Edit Card"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Card"
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

        {/* Add Gift Card Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Add Gift Card</h3>
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
                  alert("Gift card issued successfully!");
                  setShowAddModal(false);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Card Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GFT1111"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Customer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carl Evans"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Amount ($) *</label>
                    <input
                      type="number"
                      required
                      placeholder="200"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Expiry Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
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
                    Issue Card
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
