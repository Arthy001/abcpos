"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CrmProject, CrmMilestone } from "@/types";
import { fetchCrmProjects, updateCrmMilestone } from "@/lib/api";
import {
  FolderKanban,
  Search,
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  Sparkles,
  Sun,
  ShieldCheck,
  ChevronUp,
} from "lucide-react";

export default function CrmProjectsPage() {
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<CrmProject | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCrmProjects({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search,
      });
      setProjects(data || []);
      if (data && data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      } else if (selectedProject) {
        const found = data.find((p: CrmProject) => p.id === selectedProject.id);
        setSelectedProject(found || data[0] || null);
      }
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleToggleMilestone = async (milestone: CrmMilestone) => {
    try {
      const nextStatus = milestone.status === "COMPLETED" ? "PENDING" : "COMPLETED";
      await updateCrmMilestone(milestone.id, { status: nextStatus });
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update milestone");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Project Code,Project Name,Customer,Status"];
    const rows = projects.map(
      (p) => `"${p.projectCode}","${p.name}","${p.customer?.name || ""}","${p.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crm_projects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header matching /customers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Projects & Installation</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Track installation milestones, permits & COD</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export Button (Red) */}
            <button
              onClick={() => window.print()}
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
          </div>
        </div>

        {/* Main Card Container matching /customers */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search projects, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadData()}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-[#6B7280]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
              >
                <option value="all">Status: All</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
          </div>

          {/* Master-Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-1">
            {/* Projects List (Left Column) */}
            <div className="lg:col-span-5 space-y-2.5">
              {loading ? (
                <div className="py-12 text-center text-xs text-[#9CA3AF]">กำลังโหลดข้อมูลโครงการ...</div>
              ) : projects.length === 0 ? (
                <div className="p-8 border border-[#E2E8F0] rounded-xl text-center text-xs text-[#94A3B8]">
                  ยังไม่มีโครงการติดตั้งในระบบ <br />
                  <span className="text-[11px] text-[#FE9F43] mt-1 block">
                    (สร้างได้จากการกดแปลงดีลในหน้า Deals & Pipeline)
                  </span>
                </div>
              ) : (
                projects.map((proj) => {
                  const isSelected = selectedProject?.id === proj.id;
                  const completedCount = proj.milestones?.filter((m) => m.status === "COMPLETED").length || 0;
                  const totalCount = proj.milestones?.length || 0;
                  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                  return (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProject(proj)}
                      className={`p-4 rounded-xl border cursor-pointer transition shadow-2xs ${
                        isSelected
                          ? "border-[#FE9F43] bg-[#FFF7ED]/30 ring-1 ring-[#FE9F43]"
                          : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#FE9F43] bg-[#FE9F43]/10 px-2 py-0.5 rounded">
                          {proj.projectCode}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            proj.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {proj.status === "COMPLETED" ? "สำเร็จแล้ว" : "กำลังดำเนินการ"}
                        </span>
                      </div>

                      <h3 className="font-bold text-[#1E293B] mt-2 text-xs">{proj.name}</h3>
                      <p className="text-[11px] text-[#64748B] mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3 text-[#94A3B8]" />
                        {proj.customer?.name} ({proj.customer?.phone || "-"})
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-3 pt-2.5 border-t border-[#F1F5F9]">
                        <div className="flex justify-between text-[10px] text-[#64748B] mb-1 font-semibold">
                          <span>Milestones Progress</span>
                          <span>{completedCount} / {totalCount} ({progressPct}%)</span>
                        </div>
                        <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#FE9F43] h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Project Details & Milestones (Right Column) */}
            <div className="lg:col-span-7">
              {selectedProject ? (
                <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#FE9F43] uppercase tracking-wider">
                        {selectedProject.projectCode}
                      </span>
                      <h2 className="text-sm font-bold text-[#1E293B] mt-0.5">{selectedProject.name}</h2>
                    </div>
                    <span className="px-2.5 py-1 bg-white border border-[#E2E8F0] text-[#475569] text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs">
                      <Sun className="w-3.5 h-3.5 text-[#EA580C]" /> งานติดตั้ง & ขออนุญาต
                    </span>
                  </div>

                  {/* Customer Info Box */}
                  <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
                        Customer & Site Info
                      </span>
                      <span className="text-[10px] font-bold text-[#FE9F43]">
                        {selectedProject.customer?.code || "-"}
                      </span>
                    </div>
                    <div className="font-bold text-[#1E293B] text-xs">
                      {selectedProject.customer?.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#94A3B8]" />
                      {selectedProject.customer?.address || "ระบุในสัญญาโครงการ"}
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div>
                    <h3 className="font-bold text-[#1E293B] text-xs flex items-center gap-1.5 mb-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                      Milestones Checklist (คลิกเพื่อบันทึกสถานะ)
                    </h3>

                    <div className="space-y-2">
                      {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                        selectedProject.milestones.map((m, idx) => {
                          const isDone = m.status === "COMPLETED";

                          return (
                            <div
                              key={m.id}
                              onClick={() => handleToggleMilestone(m)}
                              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition text-xs ${
                                isDone
                                  ? "bg-emerald-50/60 border-emerald-200 text-[#1E293B]"
                                  : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1] text-[#334155]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] transition ${
                                    isDone
                                      ? "bg-[#10B981] text-white"
                                      : "border border-[#CBD5E1] text-[#94A3B8]"
                                  }`}
                                >
                                  {isDone ? "✓" : idx + 1}
                                </div>
                                <span className={`font-semibold ${isDone ? "line-through text-[#94A3B8]" : ""}`}>
                                  {m.title}
                                </span>
                              </div>

                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  isDone ? "bg-emerald-100 text-emerald-800" : "bg-[#F1F5F9] text-[#64748B]"
                                }`}
                              >
                                {isDone ? "สำเร็จ" : "รอดำเนินการ"}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-xs text-[#94A3B8] py-4 text-center">ไม่มีรายการขั้นตอน</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 border border-[#E2E8F0] rounded-xl text-center text-xs text-[#94A3B8]">
                  เลือกโครงการทางซ้ายเพื่อดูรายละเอียด
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
