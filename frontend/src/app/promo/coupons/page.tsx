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

interface CouponItem {
  id: string;
  name: string;
  code: string;
  description: string;
  type: "Percentage" | "Fixed Amount";
  discount: string;
  limit: string;
  valid: string;
  status: "Active" | "Inactive";
}

export default function CouponsPage() {
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // 10 Sample items matching Screenshot 4
  const sampleCoupons: CouponItem[] = [
    {
      id: "1",
      name: "New Year Blast",
      code: "NEWYEAR30",
      description: "30% off on New Year",
      type: "Percentage",
      discount: "30%",
      limit: "01",
      valid: "04 Jan 2026",
      status: "Active",
    },
    {
      id: "2",
      name: "Christmas Cheer",
      code: "CHRISTMAS100",
      description: "$100 off holiday packages",
      type: "Fixed Amount",
      discount: "$100",
      limit: "01",
      valid: "27 Dec 2024",
      status: "Active",
    },
    {
      id: "3",
      name: "Spooky Savings",
      code: "HALLOWEEN20",
      description: "20% off on Halloween items",
      type: "Percentage",
      discount: "20%",
      limit: "02",
      valid: "28 Nov 2024",
      status: "Active",
    },
    {
      id: "4",
      name: "Black Friday",
      code: "BLACKFRIDAY50",
      description: "50% off electronics",
      type: "Percentage",
      discount: "50%",
      limit: "04",
      valid: "18 Nov 2024",
      status: "Inactive",
    },
    {
      id: "5",
      name: "Golden Years Deal",
      code: "SENIOR20",
      description: "20% off for senior citizens",
      type: "Percentage",
      discount: "20%",
      limit: "03",
      valid: "06 Nov 2024",
      status: "Active",
    },
    {
      id: "6",
      name: "Thanksgiving Special",
      code: "THANKS10",
      description: "10% off for Thanksgiving",
      type: "Percentage",
      discount: "10%",
      limit: "01",
      valid: "31 Oct 2024",
      status: "Active",
    },
    {
      id: "7",
      name: "New Year Blast",
      code: "STUDENT10",
      description: "10% off for students",
      type: "Percentage",
      discount: "10%",
      limit: "02",
      valid: "14 Oct 2024",
      status: "Active",
    },
    {
      id: "8",
      name: "Big Saver Deal",
      code: "SAVE50",
      description: "$50 off orders over $300",
      type: "Fixed Amount",
      discount: "$50",
      limit: "03",
      valid: "03 Oct 2024",
      status: "Inactive",
    },
    {
      id: "9",
      name: "Weekend Exclusive",
      code: "WEEKENDSALE",
      description: "Exclusive 15% off on weekends",
      type: "Percentage",
      discount: "15%",
      limit: "04",
      valid: "29 Sep 2024",
      status: "Active",
    },
    {
      id: "10",
      name: "Welcome Delight",
      code: "WELCOME10",
      description: "10% off for first-time users",
      type: "Percentage",
      discount: "10%",
      limit: "01",
      valid: "10 Sep 2024",
      status: "Active",
    },
  ];

  const filteredDisplay = sampleCoupons.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Coupons</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage Your Coupons</p>
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

            {/* + Add Coupons Button (Orange) */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Coupons</span>
            </button>
          </div>
        </div>

        {/* Coupons Table Card Container */}
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
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Type</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Amount">Fixed Amount</option>
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
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[950px]">
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
                  <th className="py-3 px-4 font-bold text-[#111827] min-w-[160px]">Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Code</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Description</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Type</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Discount</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Limit</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Valid</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827] w-28">Action</th>
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

                      <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.name}</td>

                      {/* Code Purple Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F3E8FF] text-[#7367F0] border border-[#E9D5FF]">
                          {item.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B]">{item.description}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.type}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.discount}</td>
                      <td className="py-3.5 px-3 text-[#64748B] font-mono">{item.limit}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.valid}</td>

                      {/* Status badge: Active (Green) / Inactive (Red) */}
                      <td className="py-3.5 px-4">
                        {item.status === "Active" ? (
                          <span className="inline-flex items-center space-x-1 text-[#28C76F] font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#28C76F]" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EA5455] text-white">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions: Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            title="Edit Coupon"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Coupon"
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

        {/* Add Coupon Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Add Coupon</h3>
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
                  alert("Coupon created successfully!");
                  setShowAddModal(false);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Coupon Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Mega Sale"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="SUMMER30"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Discount Type</label>
                    <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]">
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed Amount">Fixed Amount ($)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Discount Value *</label>
                    <input
                      type="text"
                      required
                      placeholder="30%"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Usage Limit</label>
                    <input
                      type="number"
                      defaultValue={1}
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
                    Create Coupon
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
