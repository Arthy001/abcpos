"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AttendanceRecord } from "@/types";
import { fetchAttendanceRecords } from "@/lib/api";
import {
  Search,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Calendar,
} from "lucide-react";

export default function AttendanceAdminPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sample fallback matching screenshot
  const sampleAdminRecords: AttendanceRecord[] = [
    { id: "1", employeeName: "Carl Evans", employeeRole: "Designer", employeeAvatar: "/assets/images/customer11.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:00 AM", clockOut: "07:15 PM", production: "09h 00m", breakTime: "0h 45m", overtime: "0h 20m", totalHours: "09h 20m" },
    { id: "2", employeeName: "Minerva Rameriz", employeeRole: "Administrator", employeeAvatar: "/assets/images/customer12.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:15 AM", clockOut: "07:12 PM", production: "09h 00m", breakTime: "01h 15m", overtime: "0h 12m", totalHours: "09h 12m" },
    { id: "3", employeeName: "Robert Lamon", employeeRole: "Developer", employeeAvatar: "/assets/images/customer13.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:40 AM", clockOut: "07:00 PM", production: "08h 45m", breakTime: "01h 00m", overtime: "00h 00m", totalHours: "08h 45m" },
    { id: "4", employeeName: "Patricia Lewis", employeeRole: "HR Manager", employeeAvatar: "/assets/images/customer14.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:45 AM", clockOut: "08:10 PM", production: "09h 12m", breakTime: "00h 50m", overtime: "00 14m", totalHours: "09h 14m" },
    { id: "5", employeeName: "Mark Joslyn", employeeRole: "Designer", employeeAvatar: "/assets/images/customer15.jpg", date: "01 Jan 2026", status: "ABSENT", clockIn: "-", clockOut: "-", production: "-", breakTime: "-", overtime: "-", totalHours: "-" },
    { id: "6", employeeName: "Marsha Betts", employeeRole: "Developer", employeeAvatar: "/assets/images/customer16.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:17 AM", clockOut: "07:34 PM", production: "09h 26m", breakTime: "01h 20m", overtime: "00h 26m", totalHours: "09h 26m" },
    { id: "7", employeeName: "Daniel Jude", employeeRole: "Administrator", employeeAvatar: "/assets/images/customer17.jpg", date: "01 Jan 2026", status: "ABSENT", clockIn: "-", clockOut: "-", production: "-", breakTime: "-", overtime: "-", totalHours: "-" },
    { id: "8", employeeName: "Emma Bates", employeeRole: "HR Assistant", employeeAvatar: "/assets/images/customer18.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:42 AM", clockOut: "07:20 PM", production: "09h 17m", breakTime: "01h 00m", overtime: "00h 17m", totalHours: "09h 17m" },
    { id: "9", employeeName: "Richard Fralick", employeeRole: "Designer", employeeAvatar: "/assets/images/avatar-01.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:18 AM", clockOut: "07:11 PM", production: "09h 32m", breakTime: "01h 15m", overtime: "00h 32m", totalHours: "09h 32m" },
    { id: "10", employeeName: "Michelle Robison", employeeRole: "HR Manager", employeeAvatar: "/assets/images/avatar-02.jpg", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:30 AM", clockOut: "08:10 PM", production: "09h 00m", breakTime: "00h 34m", overtime: "00h 20m", totalHours: "09h 20m" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAttendanceRecords({ status: statusFilter, search });
      if (res.records && res.records.length > 0) {
        setRecords(res.records);
      } else if (!search && statusFilter === "all") {
        setRecords(sampleAdminRecords);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error(err);
      setRecords(sampleAdminRecords);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const displayList = records.length > 0 ? records : sampleAdminRecords;

  const filteredDisplay = displayList.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (item.employeeName && item.employeeName.toLowerCase().includes(term)) ||
      (item.employeeRole && item.employeeRole.toLowerCase().includes(term)) ||
      item.status.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEntries = filteredDisplay.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedList = filteredDisplay.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    const headers = ["Employee,Role,Status,Clock In,Clock Out,Production,Break,Overtime,Total Hours"];
    const rows = filteredDisplay.map(
      (r) => `"${r.employeeName || ""}","${r.employeeRole || ""}","${r.status}","${r.clockIn || "-"}","${r.clockOut || "-"}","${r.production || "-"}","${r.breakTime || "-"}","${r.overtime || "-"}","${r.totalHours || "-"}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_admin_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Attendance</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your Attendance</p>
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
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
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
                  <th className="py-3 px-4 font-bold text-[#111827]">Employee</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Clock In</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Clock Out</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Production</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Break</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Overtime</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Total Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {paginatedList.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Employee Avatar + Name + Role */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.employeeAvatar || "/assets/images/customer11.jpg"}
                            alt={item.employeeName || "Emp"}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                          />
                          <div>
                            <span className="font-semibold text-[#1E293B] block">{item.employeeName}</span>
                            <span className="text-[11px] text-[#64748B] block">{item.employeeRole || "Staff"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {item.status === "PRESENT" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EA5455] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Absent
                          </span>
                        )}
                      </td>

                      {/* Clock In */}
                      <td className="py-3 px-4 text-[#64748B]">{item.clockIn || "-"}</td>

                      {/* Clock Out */}
                      <td className="py-3 px-4 text-[#64748B]">{item.clockOut || "-"}</td>

                      {/* Production */}
                      <td className="py-3 px-4 text-[#64748B]">{item.production || "-"}</td>

                      {/* Break */}
                      <td className="py-3 px-4 text-[#64748B]">{item.breakTime || "-"}</td>

                      {/* Overtime */}
                      <td className="py-3 px-4 text-[#64748B]">{item.overtime || "-"}</td>

                      {/* Total Hours */}
                      <td className="py-3 px-4 font-medium text-[#1E293B]">{item.totalHours || "-"}</td>
                    </tr>
                  );
                })}

                {filteredDisplay.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#94A3B8]">
                      No attendance records found.
                    </td>
                  </tr>
                )}
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
      </div>
    </AppLayout>
  );
}
