"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SystemIncident } from "@/types";
import { fetchSystemIncidents, markIncidentResolvedApi } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  AlertTriangle,
  Search,
  RotateCcw,
  Eye,
  CheckCircle2,
  Copy,
  Clock,
  ExternalLink,
  ShieldAlert,
  Code,
  Check,
  X,
  Loader2,
} from "lucide-react";

export default function IncidentLogsPage() {
  const [incidents, setIncidents] = useState<SystemIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [resolvedFilter, setResolvedFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modals & Details
  const [selectedIncident, setSelectedIncident] = useState<SystemIncident | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [page, typeFilter, resolvedFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchSystemIncidents({
        search: search.trim() || undefined,
        errorType: typeFilter !== "all" ? typeFilter : undefined,
        resolved: resolvedFilter !== "all" ? resolvedFilter : undefined,
        page,
        limit: 15,
      });
      setIncidents(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleResolve = async (id: string) => {
    try {
      await markIncidentResolvedApi(id);
      loadData();
      if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident({ ...selectedIncident, resolved: true });
      }
    } catch (err) {
      console.error("Failed to resolve incident:", err);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Incident & Error Diagnostics (ระบบตรวจจับและวิเคราะห์ Error)
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              แกะรอยและตรวจสอบข้อผิดพลาดในระบบด้วย Incident Code เพื่อค้นหาสาเหตุระดับบรรทัดโค้ดได้ใน 1 นาที
            </p>
          </div>
          <button
            onClick={() => loadData()}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            รีเฟรชข้อมูล
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหารหัส Incident (เช่น INC-202610...), API URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none font-mono"
              />
            </div>
            <div>
              <SearchableSelect
                value={typeFilter}
                onChange={(val) => {
                  setTypeFilter(val);
                  setPage(1);
                }}
                placeholder="ประเภท Error: All"
                options={[
                  { label: "ประเภท Error: ทั้งหมด", value: "all" },
                  { label: "DUPLICATE (ข้อมูลซ้ำ)", value: "DUPLICATE" },
                  { label: "FOREIGN_KEY (ติดการใช้งาน)", value: "FOREIGN_KEY" },
                  { label: "NOT_FOUND (หาไม่เจอ)", value: "NOT_FOUND" },
                  { label: "VALIDATION (ข้อมูลไม่ครบ)", value: "VALIDATION" },
                  { label: "INTERNAL (ระบบขัดข้อง)", value: "INTERNAL" },
                ]}
              />
            </div>
            <div>
              <SearchableSelect
                value={resolvedFilter}
                onChange={(val) => {
                  setResolvedFilter(val);
                  setPage(1);
                }}
                placeholder="สถานะการแก้ไข: All"
                options={[
                  { label: "สถานะ: ทั้งหมด", value: "all" },
                  { label: "ยังไม่แก้ไข (Open)", value: "false" },
                  { label: "แก้ไขแล้ว (Resolved)", value: "true" },
                ]}
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm shadow-rose-600/30"
              >
                ค้นหาเหตุการณ์
              </button>
            </div>
          </form>
        </div>

        {/* Incidents Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="uppercase bg-gray-50 dark:bg-gray-700/50 text-gray-500 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Incident Code (รหัสแจ้งเตือน)</th>
                  <th className="px-4 py-3.5 font-semibold">เวลาที่เกิดเหตุ</th>
                  <th className="px-4 py-3.5 font-semibold">API Endpoint</th>
                  <th className="px-4 py-3.5 font-semibold">ประเภท / รหัส DB</th>
                  <th className="px-4 py-3.5 font-semibold">ข้อความที่แจ้ง User (TH / EN)</th>
                  <th className="px-4 py-3.5 font-semibold text-center">สถานะ</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" />
                      กำลังโหลดประวัติ Incident Logs...
                    </td>
                  </tr>
                ) : incidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      ไม่พบประวัติ Incident หรือข้อผิดพลาดในเงื่อนไขนี้
                    </td>
                  </tr>
                ) : (
                  incidents.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                            {item.incidentCode}
                          </span>
                          <button
                            onClick={() => handleCopy(item.incidentCode)}
                            title="คัดลอกรหัส"
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            {copiedCode === item.incidentCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-400">IP: {item.userIp || "Local"}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {new Date(item.timestamp).toLocaleString("th-TH")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-700 font-mono mr-1.5">
                          {item.method}
                        </span>
                        <span className="font-mono text-gray-700 dark:text-gray-200">{item.endpoint}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.errorType === "DUPLICATE"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              : item.errorType === "INTERNAL"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          }`}
                        >
                          {item.errorType}
                        </span>
                        {item.prismaCode && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">Code: {item.prismaCode}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[280px]">
                        <div className="font-medium text-gray-900 dark:text-white truncate" title={item.messageTh}>
                          🇹🇭 {item.messageTh}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate" title={item.messageEn}>
                          🇬🇧 {item.messageEn}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.resolved
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          }`}
                        >
                          {item.resolved ? "Resolved" : "Open"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedIncident(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 rounded-lg flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          ดูโค้ดลึก
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
            <div>
              พบทั้งหมด <strong>{totalCount}</strong> เหตุการณ์ (หน้า {page} จาก {totalPages})
            </div>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                ก่อนหน้า
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>

        {/* Developer Deep-Dive Modal (สำหรับผู้พัฒนาดู Stack Trace และ Payload) */}
        {selectedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[92vh] overflow-y-auto font-sans">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl">
                    <Code className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Diagnostic Details for {selectedIncident.incidentCode}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      {selectedIncident.method} {selectedIncident.endpoint} (Status {selectedIncident.statusCode})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-4 text-xs">
                {/* User Message Section */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
                  <div className="font-bold text-gray-700 dark:text-gray-300">ข้อความที่ User มองเห็น:</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    🇹🇭 {selectedIncident.messageTh}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    🇬🇧 {selectedIncident.messageEn}
                  </div>
                </div>

                {/* Request Payload */}
                <div>
                  <div className="font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                    <span>ข้อมูลที่ส่งเข้ามา (Request Payload):</span>
                  </div>
                  <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-40">
                    {selectedIncident.payload
                      ? JSON.stringify(JSON.parse(selectedIncident.payload), null, 2)
                      : "No request body (e.g. GET/DELETE or empty)"}
                  </pre>
                </div>

                {/* Full Stack Trace for Dev */}
                <div>
                  <div className="font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                    <span>Full Stack Trace (บรรทัดที่พังในโค้ด):</span>
                    {selectedIncident.prismaCode && (
                      <span className="text-amber-500 font-mono text-[10px]">
                        Prisma Code: {selectedIncident.prismaCode}
                      </span>
                    )}
                  </div>
                  <pre className="p-3 bg-gray-950 text-rose-300 rounded-xl font-mono text-[10px] overflow-x-auto max-h-60 leading-relaxed">
                    {selectedIncident.stackTrace || "No stack trace available for this error."}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-400">
                  Timestamp: {new Date(selectedIncident.timestamp).toISOString()}
                </div>
                <div className="flex gap-2">
                  {!selectedIncident.resolved && (
                    <button
                      onClick={() => handleResolve(selectedIncident.id)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ทำเครื่องหมายว่าแก้แล้ว (Mark as Resolved)
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 rounded-xl"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
