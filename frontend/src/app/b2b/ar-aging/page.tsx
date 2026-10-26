"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { ARAgingItem } from "@/types";
import { getARAgingReportApi } from "@/lib/api";
import {
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Eye,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Building2,
  Clock,
  Printer,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react";

export default function ArAgingReportPage() {
  const [agingData, setAgingData] = useState<ARAgingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Detail Modal
  const [selectedItem, setSelectedItem] = useState<ARAgingItem | null>(null);

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await getARAgingReportApi();
      setAgingData(data || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load AR Aging report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  // Summary Metrics
  const summary = useMemo(() => {
    let totalAR = 0;
    let totalCurrent = 0;
    let total31_60 = 0;
    let total61_90 = 0;
    let totalOver90 = 0;
    let overLimitCount = 0;

    agingData.forEach((item) => {
      totalAR += item.totalOutstanding;
      totalCurrent += item.current;
      total31_60 += item.days31_60;
      total61_90 += item.days61_90;
      totalOver90 += item.over90;
      if (item.isOverLimit) overLimitCount++;
    });

    return {
      totalAR,
      totalCurrent,
      total31_60,
      total61_90,
      totalOver90,
      overLimitCount,
      totalCustomers: agingData.length,
    };
  }, [agingData]);

  // Filter & Search
  const filteredData = useMemo(() => {
    return agingData.filter((item) => {
      const matchSearch =
        search.trim() === "" ||
        item.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(search.toLowerCase())) ||
        (item.taxId && item.taxId.includes(search)) ||
        (item.phone && item.phone.includes(search));

      let matchFilter = true;
      if (riskFilter === "over_limit") {
        matchFilter = item.isOverLimit;
      } else if (riskFilter === "overdue_30") {
        matchFilter = item.days31_60 > 0 || item.days61_90 > 0 || item.over90 > 0;
      } else if (riskFilter === "overdue_60") {
        matchFilter = item.days61_90 > 0 || item.over90 > 0;
      } else if (riskFilter === "overdue_90") {
        matchFilter = item.over90 > 0;
      }

      return matchSearch && matchFilter;
    });
  }, [agingData, search, riskFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = [
      "Customer Code",
      "Customer Name",
      "Tax ID",
      "Phone",
      "Credit Term (Days)",
      "Credit Limit",
      "Credit Remaining",
      "Current (0-30 Days)",
      "31-60 Days",
      "61-90 Days",
      "Over 90 Days",
      "Total Outstanding",
      "Over Limit Status",
    ];

    const rows = filteredData.map((item) => [
      `"${item.code || ""}"`,
      `"${item.customerName.replace(/"/g, '""')}"`,
      `"${item.taxId || ""}"`,
      `"${item.phone || ""}"`,
      item.creditTermDays,
      item.creditLimit.toFixed(2),
      item.creditRemaining.toFixed(2),
      item.current.toFixed(2),
      item.days31_60.toFixed(2),
      item.days61_90.toFixed(2),
      item.over90.toFixed(2),
      item.totalOutstanding.toFixed(2),
      item.isOverLimit ? "OVER LIMIT" : "NORMAL",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `AR_Aging_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  AR Aging Report (รายงานวิเคราะห์อายุหนี้ลูกหนี้การค้า)
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  วิเคราะห์ลูกหนี้การค้าตามช่วงระยะเวลาค้างชำระ (0-30, 31-60, 61-90, &gt;90 วัน) และติดตามวงเงินสินเชื่อ
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
              title="พิมพ์รายงาน"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              Print
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
              title="ส่งออก CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export CSV
            </button>
            <button
              onClick={loadReport}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
              title="รีเฟรชข้อมูล"
            >
              <RotateCcw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/b2b/billing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
            >
              <FileText className="w-4 h-4" />
              จัดการใบวางบิล
            </Link>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-medium"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total AR */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
                ยอดลูกหนี้รวม (Total AR)
              </span>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatCurrency(summary.totalAR)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
              <span>{summary.totalCustomers} รายการ</span>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Current (0-30 Days) */}
          <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                0 - 30 วัน (ปกติ)
              </span>
              <p className="text-lg font-bold text-emerald-700 mt-1">
                {formatCurrency(summary.totalCurrent)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-emerald-600 border-t border-emerald-100 pt-2">
              <span>
                {summary.totalAR > 0
                  ? `${((summary.totalCurrent / summary.totalAR) * 100).toFixed(1)}% ของยอดรวม`
                  : "0%"}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* 31-60 Days */}
          <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                31 - 60 วัน (เริ่มค้าง)
              </span>
              <p className="text-lg font-bold text-blue-700 mt-1">
                {formatCurrency(summary.total31_60)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-blue-600 border-t border-blue-100 pt-2">
              <span>
                {summary.totalAR > 0
                  ? `${((summary.total31_60 / summary.totalAR) * 100).toFixed(1)}% ของยอดรวม`
                  : "0%"}
              </span>
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
          </div>

          {/* 61-90 Days */}
          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
                61 - 90 วัน (ค้างเตือน)
              </span>
              <p className="text-lg font-bold text-amber-700 mt-1">
                {formatCurrency(summary.total61_90)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-amber-600 border-t border-amber-100 pt-2">
              <span>
                {summary.totalAR > 0
                  ? `${((summary.total61_90 / summary.totalAR) * 100).toFixed(1)}% ของยอดรวม`
                  : "0%"}
              </span>
              <div className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
          </div>

          {/* > 90 Days (High Risk) */}
          <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
                &gt; 90 วัน (เสี่ยงสูง)
              </span>
              <p className="text-lg font-bold text-rose-700 mt-1">
                {formatCurrency(summary.totalOver90)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-rose-600 border-t border-rose-100 pt-2">
              <span>
                {summary.totalAR > 0
                  ? `${((summary.totalOver90 / summary.totalAR) * 100).toFixed(1)}% ของยอดรวม`
                  : "0%"}
              </span>
              <div className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
          </div>

          {/* Over Credit Limit Customers */}
          <div className="bg-white p-4 rounded-xl border border-purple-100 bg-purple-50/20 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">
                วงเงินเกิน (Over Limit)
              </span>
              <p className="text-lg font-bold text-purple-800 mt-1">
                {summary.overLimitCount} <span className="text-xs font-normal text-gray-500">ลูกค้า</span>
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-purple-600 border-t border-purple-100 pt-2">
              <span>ตรวจสอบระงับการสั่ง</span>
              <ShieldAlert className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex-1 w-full md:w-auto relative">
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้า, รหัสลูกค้า, เลขผู้เสียภาษี, เบอร์โทร..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-3.5 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">สถานะทั้งหมด (All Status)</option>
              <option value="over_limit">เฉพาะที่วงเงินเกิน (Over Credit Limit)</option>
              <option value="overdue_30">มียอดค้างชำระเกิน 30 วัน</option>
              <option value="overdue_60">มียอดค้างชำระเกิน 60 วัน</option>
              <option value="overdue_90">มียอดค้างชำระเกิน 90 วัน (เสี่ยงสูง)</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={10}>10 รายการ/หน้า</option>
              <option value={20}>20 รายการ/หน้า</option>
              <option value={50}>50 รายการ/หน้า</option>
              <option value={100}>100 รายการ/หน้า</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">ลูกค้า (Customer)</th>
                  <th className="py-3 px-4 text-right">วงเงินเครดิต</th>
                  <th className="py-3 px-4 text-right text-emerald-700">0 - 30 วัน</th>
                  <th className="py-3 px-4 text-right text-blue-700">31 - 60 วัน</th>
                  <th className="py-3 px-4 text-right text-amber-700">61 - 90 วัน</th>
                  <th className="py-3 px-4 text-right text-rose-700">&gt; 90 วัน</th>
                  <th className="py-3 px-4 text-right font-bold text-gray-900">หนี้ค้างรวม</th>
                  <th className="py-3 px-4 text-center">สถานะวงเงิน</th>
                  <th className="py-3 px-4 text-center w-20">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
                      <p>กำลังคำนวณรายงานอายุหนี้ AR Aging Report...</p>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500">
                      <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-base font-medium text-gray-700">ไม่พบข้อมูลลูกหนี้ค้างชำระตามเงื่อนไข</p>
                      <p className="text-xs text-gray-400 mt-1">
                        ลองปรับตัวกรองหรือคำค้นหา
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr key={item.customerId} className="hover:bg-gray-50/80 transition-colors">
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{item.customerName}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          {item.code && <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{item.code}</span>}
                          {item.taxId && <span>Tax ID: {item.taxId}</span>}
                          {item.creditTermDays > 0 && (
                            <span className="text-blue-600">เทอม {item.creditTermDays} วัน</span>
                          )}
                        </div>
                      </td>

                      {/* Credit Limit & Remaining */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(item.creditLimit)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          คงเหลือ: {formatCurrency(item.creditRemaining)}
                        </div>
                      </td>

                      {/* 0-30 Days */}
                      <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                        {item.current > 0 ? (
                          formatCurrency(item.current)
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* 31-60 Days */}
                      <td className="py-3.5 px-4 text-right font-medium text-blue-700">
                        {item.days31_60 > 0 ? (
                          formatCurrency(item.days31_60)
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* 61-90 Days */}
                      <td className="py-3.5 px-4 text-right font-medium text-amber-700">
                        {item.days61_90 > 0 ? (
                          formatCurrency(item.days61_90)
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* > 90 Days */}
                      <td className="py-3.5 px-4 text-right font-semibold text-rose-600">
                        {item.over90 > 0 ? (
                          <span className="bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {formatCurrency(item.over90)}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Total Outstanding */}
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        {formatCurrency(item.totalOutstanding)}
                        <div className="text-[11px] font-normal text-gray-500">
                          {item.unpaidOrderCount} ออเดอร์ค้าง
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {item.isOverLimit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            เกินวงเงิน
                          </span>
                        ) : item.creditRemaining < item.creditLimit * 0.2 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            ใกล้เต็มวงเงิน
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ปกติ
                          </span>
                        )}
                      </td>

                      {/* Action (GEMINI.md order: View Eye) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="ดูรายละเอียดการวิเคราะห์"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50 text-xs text-gray-500 gap-2">
              <div>
                แสดง {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} ถึง{" "}
                {Math.min(currentPage * pageSize, filteredData.length)} จากทั้งหมด{" "}
                {filteredData.length} รายการ
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-medium text-gray-700">
                  หน้า {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drill-down / Customer Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    รายละเอียดหนี้สินเชื่อ: {selectedItem.customerName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedItem.code && `รหัส: ${selectedItem.code} | `}
                    {selectedItem.taxId && `เลขประจำตัวผู้เสียภาษี: ${selectedItem.taxId} | `}
                    เครดิตเทอม {selectedItem.creditTermDays} วัน
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Credit Status Card */}
              <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">การใช้วงเงินสินเชื่อ</span>
                  {selectedItem.isOverLimit ? (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      เกินวงเงิน {formatCurrency(selectedItem.totalOutstanding - selectedItem.creditLimit)}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-emerald-700">
                      วงเงินคงเหลือ {formatCurrency(selectedItem.creditRemaining)}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedItem.isOverLimit
                        ? "bg-rose-500"
                        : selectedItem.totalOutstanding > selectedItem.creditLimit * 0.8
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        selectedItem.creditLimit > 0
                          ? (selectedItem.totalOutstanding / selectedItem.creditLimit) * 100
                          : 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-gray-500">วงเงินสูงสุด (Credit Limit):</span>
                    <p className="font-semibold text-gray-800 text-sm">
                      {formatCurrency(selectedItem.creditLimit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">หนี้ค้างชำระรวม (Outstanding):</span>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(selectedItem.totalOutstanding)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bucket Breakdown */}
              <div className="mt-5 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  จำแนกตามอายุหนี้ (Aging Buckets)
                </h4>

                <div className="space-y-2.5">
                  {/* 0-30 */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-100 bg-emerald-50/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <div>
                        <span className="text-xs font-semibold text-gray-800">0 - 30 วัน (ปกติ)</span>
                        <p className="text-[11px] text-gray-500">ยังไม่ครบกำหนดหรือค้างชำระไม่เกิน 30 วัน</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-800">
                      {formatCurrency(selectedItem.current)}
                    </span>
                  </div>

                  {/* 31-60 */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <div>
                        <span className="text-xs font-semibold text-gray-800">31 - 60 วัน (เริ่มค้างชำระ)</span>
                        <p className="text-[11px] text-gray-500">ควรออกใบวางบิลเพื่อเตรียมเก็บเงิน</p>
                      </div>
                    </div>
                    <span className="font-bold text-blue-800">
                      {formatCurrency(selectedItem.days31_60)}
                    </span>
                  </div>

                  {/* 61-90 */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div>
                        <span className="text-xs font-semibold text-gray-800">61 - 90 วัน (ค้างชำระเตือน)</span>
                        <p className="text-[11px] text-gray-500">ควรติดตามทวงถามการชำระเงินโดยด่วน</p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-800">
                      {formatCurrency(selectedItem.days61_90)}
                    </span>
                  </div>

                  {/* > 90 */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-rose-100 bg-rose-50/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div>
                        <span className="text-xs font-semibold text-rose-800">&gt; 90 วัน (เสี่ยงหนี้สูญ)</span>
                        <p className="text-[11px] text-gray-500">ค้างชำระนานเกิน 90 วัน ควรระงับการเปิดออเดอร์ใหม่</p>
                      </div>
                    </div>
                    <span className="font-bold text-rose-800">
                      {formatCurrency(selectedItem.over90)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
                >
                  ปิดหน้าต่าง
                </button>
                <Link
                  href="/b2b/billing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  เปิดใบวางบิลให้ลูกค้ารายนี้
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
