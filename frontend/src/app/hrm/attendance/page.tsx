"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AttendanceRecord } from "@/types";
import {
  fetchAttendanceRecords,
  createAttendanceRecordApi,
} from "@/lib/api";
import {
  Search,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Calendar,
  Clock,
  Coffee,
  CheckCircle2,
} from "lucide-react";

export default function AttendanceEmployeePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState({
    totalWorkingDays: 31,
    absentDays: 5,
    presentDays: 28,
    halfDays: 2,
    lateDays: 1,
    holidays: 2,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Clock in/out & break status
  const [isClockedIn, setIsClockedIn] = useState<boolean>(true);
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("05:45:22");

  // Fallback sample records matching screenshot
  const sampleRecords: AttendanceRecord[] = [
    { id: "1", date: "01 Jan 2026", status: "PRESENT", clockIn: "09:15 AM", clockOut: "08:55 PM", production: "9h 00m", breakTime: "1h 13m", overtime: "00h 50m", totalHours: "09h 50m", progress: 85 },
    { id: "2", date: "02 Jan 2026", status: "PRESENT", clockIn: "09:07 AM", clockOut: "08:40 PM", production: "9h 10m", breakTime: "1h 07m", overtime: "01h 13m", totalHours: "10h 23m", progress: 90 },
    { id: "3", date: "03 Jan 2026", status: "PRESENT", clockIn: "09:04 AM", clockOut: "08:52 PM", production: "8h 47m", breakTime: "1h 04m", overtime: "01h 07m", totalHours: "10h 04m", progress: 88 },
    { id: "4", date: "04 Jan 2026", status: "PRESENT", clockIn: "09:45 AM", clockOut: "08:10 PM", production: "09h 12m", breakTime: "00h 50m", overtime: "00h 14m", totalHours: "09h 14m", progress: 82 },
    { id: "5", date: "06 Jan 2026", status: "ABSENT", clockIn: "-", clockOut: "-", production: "-", breakTime: "-", overtime: "-", totalHours: "-", progress: 0 },
    { id: "6", date: "07 Jan 2023", status: "PRESENT", clockIn: "09:03 AM", clockOut: "08:57 PM", production: "8h 50m", breakTime: "1h 26m", overtime: "0h 43m", totalHours: "08h 33m", progress: 80 },
    { id: "7", date: "04 Jan 2023", status: "HOLIDAY", clockIn: "-", clockOut: "-", production: "-", breakTime: "-", overtime: "-", totalHours: "-", progress: 0 },
    { id: "8", date: "07 Jan 2023", status: "PRESENT", clockIn: "09:42 AM", clockOut: "07:20 PM", production: "09h 17m", breakTime: "01h 00m", overtime: "00h 17m", totalHours: "09h 17m", progress: 86 },
    { id: "9", date: "07 Jan 2023", status: "PRESENT", clockIn: "09:18 AM", clockOut: "07:11 PM", production: "09h 32m", breakTime: "01h 15m", overtime: "00h 32m", totalHours: "09h 32m", progress: 89 },
    { id: "10", date: "07 Jan 2023", status: "PRESENT", clockIn: "09:30 AM", clockOut: "08:10 PM", production: "09h 00m", breakTime: "00h 34m", overtime: "00h 20m", totalHours: "09h 32m", progress: 87 },
  ];

  // Update live clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAttendanceRecords({ status: statusFilter, search });
      if (res.records && res.records.length > 0) {
        setRecords(res.records);
        setSummary(res.summary);
      } else if (!search && statusFilter === "all") {
        setRecords(sampleRecords);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error(err);
      setRecords(sampleRecords);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleClockToggle = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      alert(`Clocked Out at ${currentTime}`);
    } else {
      setIsClockedIn(true);
      alert(`Clocked In at ${currentTime}`);
    }
  };

  const handleBreakToggle = () => {
    if (isOnBreak) {
      setIsOnBreak(false);
      alert(`Break Ended at ${currentTime}`);
    } else {
      setIsOnBreak(true);
      alert(`Break Started at ${currentTime}`);
    }
  };

  const displayList = records;

  const filteredDisplay = displayList.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.date.toLowerCase().includes(term) ||
      item.status.toLowerCase().includes(term) ||
      (item.clockIn && item.clockIn.toLowerCase().includes(term));
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
    const headers = ["Date,Status,Clock In,Clock Out,Production,Break,Overtime,Total Hours"];
    const rows = filteredDisplay.map(
      (r) => `"${r.date}","${r.status}","${r.clockIn || "-"}","${r.clockOut || "-"}","${r.production || "-"}","${r.breakTime || "-"}","${r.overtime || "-"}","${r.totalHours || "-"}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${new Date().toISOString().slice(0, 10)}.csv`);
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
        {/* Page Header: Greeting + Export Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">👋</span>
            <h1 className="text-lg font-bold text-[#1E293B] tracking-tight">
              Good Morning, John Smilga
            </h1>
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

        {/* Top Cards: Attendance Clock + Days Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Card: Attendance Clock */}
          <div className="bg-white rounded-xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E293B]">Attendance</h3>
              <span className="text-xs font-semibold text-[#7367F0]">22 Aug 2023</span>
            </div>

            <div className="flex items-center space-x-3.5 py-1">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] flex items-center justify-center text-[#FE9F43] relative shadow-xs">
                <Calendar className="w-6 h-6" />
                <CheckCircle2 className="w-3.5 h-3.5 text-[#28C76F] absolute -bottom-1 -right-1 bg-white rounded-full" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-[#1E293B] tracking-wide">
                  {currentTime}
                </div>
                <p className="text-[11px] text-[#64748B] font-medium">Current Time</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleClockToggle}
                className={`py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                  isClockedIn
                    ? "bg-[#FE9F43] hover:bg-[#E88B32] text-white"
                    : "bg-[#28C76F] hover:bg-[#20A159] text-white"
                }`}
              >
                {isClockedIn ? "Clock Out" : "Clock In"}
              </button>

              <button
                onClick={handleBreakToggle}
                className={`py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                  isOnBreak
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-[#0F172A] hover:bg-[#1E293B] text-white"
                }`}
              >
                {isOnBreak ? "End Break" : "Break"}
              </button>
            </div>
          </div>

          {/* Right Card: Days Overview This Month */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E9ECEF] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <h3 className="text-sm font-bold text-[#1E293B]">Days Overview This Month</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {/* Total Working Days */}
              <div className="rounded-xl bg-[#FFF7ED] p-3 text-center border border-[#FFEDD5]">
                <h4 className="text-xl font-bold text-[#EA580C]">{summary.totalWorkingDays}</h4>
                <p className="text-[10px] text-[#9A3412] font-medium mt-1 leading-tight">
                  Total Working Days
                </p>
              </div>

              {/* Absent Days */}
              <div className="rounded-xl bg-[#FFF1F2] p-3 text-center border border-[#FFE4E6]">
                <h4 className="text-xl font-bold text-[#E11D48]">
                  {String(summary.absentDays).padStart(2, "0")}
                </h4>
                <p className="text-[10px] text-[#9F1239] font-medium mt-1 leading-tight">
                  Abesent Days
                </p>
              </div>

              {/* Present Days */}
              <div className="rounded-xl bg-[#F5F3FF] p-3 text-center border border-[#EDE9FE]">
                <h4 className="text-xl font-bold text-[#7C3AED]">{summary.presentDays}</h4>
                <p className="text-[10px] text-[#5B21B6] font-medium mt-1 leading-tight">
                  Present Days
                </p>
              </div>

              {/* Half Days */}
              <div className="rounded-xl bg-[#FEFCE8] p-3 text-center border border-[#FEF08A]">
                <h4 className="text-xl font-bold text-[#CA8A04]">
                  {String(summary.halfDays).padStart(2, "0")}
                </h4>
                <p className="text-[10px] text-[#854D0E] font-medium mt-1 leading-tight">
                  Half Days
                </p>
              </div>

              {/* Late Days */}
              <div className="rounded-xl bg-[#ECFEFF] p-3 text-center border border-[#CFFAFE]">
                <h4 className="text-xl font-bold text-[#0891B2]">
                  {String(summary.lateDays).padStart(2, "0")}
                </h4>
                <p className="text-[10px] text-[#155E75] font-medium mt-1 leading-tight">
                  Late Days
                </p>
              </div>

              {/* Holidays */}
              <div className="rounded-xl bg-[#F0FDF4] p-3 text-center border border-[#DCFCE7]">
                <h4 className="text-xl font-bold text-[#16A34A]">
                  {String(summary.holidays).padStart(2, "0")}
                </h4>
                <p className="text-[10px] text-[#166534] font-medium mt-1 leading-tight">
                  Holidays
                </p>
              </div>
            </div>
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
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Select Status</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="HALF_DAY">Half Day</option>
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
                  <option value="recent">Sort By : Recent</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Clock In</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Clock Out</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Production</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Break</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Overtime</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Progress</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Total Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {paginatedList.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4 font-medium text-[#1E293B]">{item.date}</td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {item.status === "PRESENT" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Present
                          </span>
                        )}
                        {item.status === "ABSENT" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EA5455] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Absent
                          </span>
                        )}
                        {item.status === "HOLIDAY" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#7367F0] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Holiday
                          </span>
                        )}
                        {item.status === "HALF_DAY" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FF9F43] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Half Day
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

                      {/* Progress Bar (Multi-color) */}
                      <td className="py-3 px-4 w-32">
                        {item.status === "PRESENT" ? (
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                            <div className="h-full bg-[#28C76F] w-[70%]"></div>
                            <div className="h-full bg-[#FE9F43] w-[18%]"></div>
                            <div className="h-full bg-[#EA5455] w-[12%]"></div>
                          </div>
                        ) : (
                          <div className="w-24 h-2 bg-gray-200 rounded-full"></div>
                        )}
                      </td>

                      {/* Total Hours */}
                      <td className="py-3 px-4 font-medium text-[#1E293B]">{item.totalHours || "-"}</td>
                    </tr>
                  );
                })}

                {filteredDisplay.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-[#94A3B8]">
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
