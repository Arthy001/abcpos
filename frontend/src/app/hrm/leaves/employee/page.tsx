"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Leave } from "@/types";
import {
  fetchLeaves,
  createLeaveApi,
  updateLeaveApi,
  deleteLeaveApi,
} from "@/lib/api";
import {
  PlusCircle,
  Search,
  RotateCcw,
  ChevronUp,
  Edit,
  Trash2,
  X,
  XCircle,
  Info,
  ChevronDown,
  Calendar,
} from "lucide-react";

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);

  // Form State
  const [formLeaveType, setFormLeaveType] = useState<string>("Sick Leave");
  const [formFromDate, setFormFromDate] = useState<string>("24 Dec 2024");
  const [formToDate, setFormToDate] = useState<string>("24 Dec 2024");
  const [formDuration, setFormDuration] = useState<string>("01 Day");
  const [formReason, setFormReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sample fallback matching screenshot
  const sampleEmployeeLeaves: Leave[] = [
    { id: "1", leaveType: "Sick Leave", fromDate: "24 Dec 2024", toDate: "24 Dec 2024", duration: "01 Day", appliedOn: "23 Dec 2024", status: "APPROVED" },
    { id: "2", leaveType: "Casual Leave", fromDate: "10 Dec 2024", toDate: "10 Dec 2024", duration: "01 Day", appliedOn: "09 Dec 2024", status: "APPROVED" },
    { id: "3", leaveType: "Casual Leave", fromDate: "27 Nov 2024", toDate: "28 Nov 2024", duration: "02 Day", appliedOn: "26 Nov 2024", status: "APPLIED" },
    { id: "4", leaveType: "Sick Leave", fromDate: "18 Nov 2024", toDate: "18 Nov 2024", duration: "02 hrs", appliedOn: "18 Nov 2024", status: "APPROVED" },
    { id: "5", leaveType: "Casual Leave", fromDate: "06 Nov 2024", toDate: "08 Nov 2024", duration: "03 Days", appliedOn: "05 Nov 2024", status: "APPROVED" },
    { id: "6", leaveType: "Sick Leave", fromDate: "25 Oct 2024", toDate: "25 Oct 2024", duration: "01 Day", appliedOn: "24 Oct 2024", status: "REJECTED" },
    { id: "7", leaveType: "Casual Leave", fromDate: "14 Oct 2024", toDate: "15 Oct 2024", duration: "02 Day", appliedOn: "13 Oct 2024", status: "APPROVED" },
    { id: "8", leaveType: "Casual Leave", fromDate: "03 Oct 2024", toDate: "03 Oct 2024", duration: "01 Day", appliedOn: "02 Oct 2024", status: "APPLIED" },
    { id: "9", leaveType: "Sick Leave", fromDate: "20 Sep 2024", toDate: "21 Sep 2024", duration: "02 Day", appliedOn: "19 Sep 2024", status: "APPROVED" },
    { id: "10", leaveType: "Casual Leave", fromDate: "10 Sep 2024", toDate: "10 Sep 2024", duration: "02 hrs", appliedOn: "09 Sep 2024", status: "REJECTED" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchLeaves({ status: statusFilter, search });
      if (data && data.length > 0) {
        setLeaves(data);
      } else if (!search && statusFilter === "all") {
        setLeaves(sampleEmployeeLeaves);
      } else {
        setLeaves([]);
      }
    } catch (err) {
      console.error(err);
      setLeaves(sampleEmployeeLeaves);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleOpenAddModal = () => {
    setEditingLeave(null);
    setFormLeaveType("Sick Leave");
    setFormFromDate("24 Dec 2024");
    setFormToDate("24 Dec 2024");
    setFormDuration("01 Day");
    setFormReason("");
    setShowModal(true);
  };

  const handleOpenEditModal = (l: Leave) => {
    setEditingLeave(l);
    setFormLeaveType(l.leaveType);
    setFormFromDate(l.fromDate);
    setFormToDate(l.toDate);
    setFormDuration(l.duration || "01 Day");
    setFormReason(l.reason || "");
    setShowModal(true);
  };

  const handleSaveLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingLeave) {
        await updateLeaveApi(editingLeave.id, {
          leaveType: formLeaveType,
          fromDate: formFromDate,
          toDate: formToDate,
          duration: formDuration,
          reason: formReason,
        });
      } else {
        await createLeaveApi({
          empCode: "EMP001",
          employeeName: "John Smilga",
          leaveType: formLeaveType,
          fromDate: formFromDate,
          toDate: formToDate,
          duration: formDuration,
          appliedOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          shift: "Regular",
          reason: formReason,
          status: "APPLIED",
        });
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save leave");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this leave application?")) {
      try {
        await deleteLeaveApi(id);
        loadData();
      } catch (err: any) {
        setLeaves((prev) => prev.filter((l) => l.id !== id));
      }
    }
  };

  const handleCancelApplication = async (l: Leave) => {
    if (confirm("Are you sure you want to cancel this leave application?")) {
      try {
        await updateLeaveApi(l.id, { status: "REJECTED" });
        loadData();
      } catch (err: any) {
        setLeaves((prev) =>
          prev.map((item) => (item.id === l.id ? { ...item, status: "REJECTED" } : item))
        );
      }
    }
  };

  const displayList = leaves.length > 0 ? leaves : sampleEmployeeLeaves;

  const filteredDisplay = displayList.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.leaveType.toLowerCase().includes(term) ||
      item.fromDate.toLowerCase().includes(term) ||
      item.toDate.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEntries = filteredDisplay.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedList = filteredDisplay.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedList.map((l) => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Type,From Date,To Date,Days/Hours,Applied On,Status"];
    const rows = filteredDisplay.map(
      (l) => `"${l.leaveType}","${l.fromDate}","${l.toDate}","${l.duration}","${l.appliedOn}","${l.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employee_leaves_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Leaves</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your Leaves</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export Button (Red) */}
            <button
              onClick={handlePrint}
              title="Export PDF"
              className="w-8 h-8 rounded-lg bg-[#FF4D4F]/10 hover:bg-[#FF4D4F]/20 text-[#FF4D4F] flex items-center justify-center transition-colors border border-[#FF4D4F]/20 shadow-2xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-1v-2h1c.55 0 1 .45 1 1s-.45 1-1 1zm5.5 0c0 .55-.45 1-1 1h-2v-4h2c.55 0 1 .45 1 1v2zm-2.5-1h1v-1h-1v1z" />
              </svg>
            </button>

            {/* Excel Export Button (Green) */}
            <button
              onClick={handleExportCSV}
              title="Export Excel"
              className="w-8 h-8 rounded-lg bg-[#52C41A]/10 hover:bg-[#52C41A]/20 text-[#52C41A] flex items-center justify-center transition-colors border border-[#52C41A]/20 shadow-2xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-2.5-4.5L7 17H4.5l3.5-5.5L4.8 6h2.5l2.2 4.2L11.7 6h2.5l-3.2 5.5 3.5 5.5H12z" />
              </svg>
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

            {/* + Apply Leave Button (Orange) */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Apply Leave</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
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
              {/* Select Date button */}
              <div className="relative flex items-center border border-[#E5E7EB] rounded-lg px-2.5 py-1 text-xs text-[#374151] bg-white">
                <Calendar className="w-3.5 h-3.5 text-[#9CA3AF] mr-1.5" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs text-[#374151] focus:outline-none cursor-pointer"
                />
              </div>

              {/* Select Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Select Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="APPLIED">Applied</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedList.length > 0 && selectedIds.length === paginatedList.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Type</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">From Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">To Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Days/Hours</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Applied On</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {paginatedList.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F9FAFB] transition-colors ${
                        isSelected ? "bg-[#FFF8F2]" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                        />
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4 text-[#1E293B] font-medium">{item.leaveType}</td>

                      {/* From Date */}
                      <td className="py-3 px-4 text-[#64748B]">{item.fromDate}</td>

                      {/* To Date */}
                      <td className="py-3 px-4 text-[#64748B]">{item.toDate}</td>

                      {/* Days/Hours */}
                      <td className="py-3 px-4 text-[#64748B]">{item.duration}</td>

                      {/* Applied On */}
                      <td className="py-3 px-4 text-[#64748B]">{item.appliedOn}</td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {item.status === "APPROVED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Approved
                          </span>
                        )}
                        {item.status === "REJECTED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EA5455] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Rejected
                          </span>
                        )}
                        {item.status === "APPLIED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#7367F0] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Applied
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Cancel button if Applied */}
                          {item.status === "APPLIED" && (
                            <button
                              onClick={() => handleCancelApplication(item)}
                              title="Cancel Application"
                              className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#EA5455] flex items-center justify-center transition-colors shadow-2xs"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Info button if Rejected */}
                          {item.status === "REJECTED" && (
                            <button
                              onClick={() => alert(`Reason: ${item.reason || "Quota exceeded or conflict with schedule."}`)}
                              title="View Rejection Reason"
                              className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#3B82F6] flex items-center justify-center transition-colors shadow-2xs"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Leave"
                            className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#FE9F43] flex items-center justify-center transition-colors shadow-2xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete Leave"
                            className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-[#FEE2E2] text-[#64748B] hover:text-[#EF4444] flex items-center justify-center transition-colors shadow-2xs"
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
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-[#E2E8F0] rounded pl-2.5 pr-6 py-1 text-xs text-[#334155] focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span>Entries</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  currentPage === 1
                    ? "text-[#CBD5E1] cursor-not-allowed"
                    : "hover:bg-gray-100 text-[#64748B]"
                }`}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    currentPage === pg
                      ? "bg-[#FE9F43] text-white font-bold shadow-xs"
                      : "hover:bg-gray-100 text-[#64748B]"
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  currentPage === totalPages
                    ? "text-[#CBD5E1] cursor-not-allowed"
                    : "hover:bg-gray-100 text-[#64748B]"
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* ================= Apply / Edit Leave Modal ================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingLeave ? "Edit Leave Application" : "Apply Leave"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveLeave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Leave Type</label>
                  <select
                    value={formLeaveType}
                    onChange={(e) => setFormLeaveType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Maternity">Maternity</option>
                    <option value="Paternity">Paternity</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Vacation">Vacation</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">From Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 24 Dec 2024"
                      value={formFromDate}
                      onChange={(e) => setFormFromDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">To Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 24 Dec 2024"
                      value={formToDate}
                      onChange={(e) => setFormToDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 01 Day, 02 hrs"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Reason</label>
                  <textarea
                    rows={2}
                    placeholder="Reason for leave..."
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FE9F43] hover:bg-[#E88B32] shadow-sm disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? "Saving..." : editingLeave ? "Update Leave" : "Submit Leave"}
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
