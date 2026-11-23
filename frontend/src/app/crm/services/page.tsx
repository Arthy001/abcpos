"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CrmServiceTicket, Customer, CrmProject } from "@/types";
import {
  fetchCrmServiceTickets,
  createCrmServiceTicket,
  updateCrmServiceTicket,
  fetchCustomers,
  fetchCrmProjects,
} from "@/lib/api";
import {
  Wrench,
  Search,
  RotateCcw,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Sparkles,
  X,
  Sun,
  Flame,
  ChevronUp,
} from "lucide-react";

export default function CrmServicesPage() {
  const [tickets, setTickets] = useState<CrmServiceTicket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Modals
  const [showModal, setShowModal] = useState<boolean>(false);
  const [addSuccessModal, setAddSuccessModal] = useState<boolean>(false);
  const [ticketTitleSuccess, setTicketTitleSuccess] = useState<string>("");

  // Form
  const [formCustomerId, setFormCustomerId] = useState<string>("");
  const [formProjectId, setFormProjectId] = useState<string>("");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formServiceType, setFormServiceType] = useState<
    "PREVENTIVE_MAINTENANCE" | "INSTALLATION" | "EMERGENCY_REPAIR" | "GENERAL"
  >("PREVENTIVE_MAINTENANCE");
  const [formPriority, setFormPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [formScheduledDate, setFormScheduledDate] = useState<string>("");
  const [formTechnician, setFormTechnician] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketData, custData, projData] = await Promise.all([
        fetchCrmServiceTickets({
          status: statusFilter !== "all" ? statusFilter : undefined,
          serviceType: typeFilter !== "all" ? typeFilter : undefined,
        }),
        fetchCustomers({ status: "ACTIVE" }),
        fetchCrmProjects(),
      ]);
      setTickets(ticketData || []);
      setCustomers(custData || []);
      setProjects(projData || []);
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter]);

  const handleOpenCreate = () => {
    setFormTitle("ล้างแผงโซลาร์เซลล์ประจำรอบ 6 เดือน");
    setFormCustomerId(customers[0]?.id || "");
    setFormProjectId(projects[0]?.id || "");
    setFormServiceType("PREVENTIVE_MAINTENANCE");
    setFormPriority("MEDIUM");
    setFormScheduledDate(new Date().toISOString().slice(0, 10));
    setFormTechnician("ทีมช่างเทคนิค O&M");
    setFormNotes("");
    setShowModal(true);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCustomerId) return;

    try {
      setIsSubmitting(true);
      await createCrmServiceTicket({
        title: formTitle,
        customerId: formCustomerId,
        projectId: formProjectId || undefined,
        serviceType: formServiceType,
        priority: formPriority,
        scheduledDate: formScheduledDate || undefined,
        technician: formTechnician || undefined,
        checklistData: { notes: formNotes },
      });
      setShowModal(false);
      setTicketTitleSuccess(formTitle);
      setAddSuccessModal(true);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create service ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      await updateCrmServiceTicket(ticketId, { status });
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.ticketNo.toLowerCase().includes(q) ||
      t.customer?.name.toLowerCase().includes(q) ||
      (t.technician && t.technician.toLowerCase().includes(q))
    );
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Ticket No,Title,Customer,Service Type,Date,Status"];
    const rows = filteredTickets.map(
      (t) => `"${t.ticketNo}","${t.title}","${t.customer?.name || ""}","${t.serviceType}","${t.scheduledDate || ""}","${t.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crm_services_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Service & Maintenance</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage field service, cleaning schedules & repair tickets</p>
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

            {/* + Add Ticket Button (Orange standard) */}
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Ticket</span>
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
                placeholder="Search tickets, customer, tech..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
              >
                <option value="all">Status: All</option>
                <option value="OPEN">Open</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
              >
                <option value="all">Type: All</option>
                <option value="PREVENTIVE_MAINTENANCE">Preventive Maintenance (PM)</option>
                <option value="EMERGENCY_REPAIR">Emergency Repair</option>
                <option value="INSTALLATION">Installation</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E9ECEF] text-[#64748B] font-semibold bg-[#F8FAFC]">
                  <th className="py-2.5 px-3">Ticket No</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Customer & Project</th>
                  <th className="py-2.5 px-3">Service Type</th>
                  <th className="py-2.5 px-3">Scheduled & Tech</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#94A3B8]">
                      กำลังโหลดข้อมูลใบงานบริการ...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#94A3B8]">
                      ไม่พบรายการใบงานบริการ
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F8FAFC] transition">
                      <td className="py-2.5 px-3 font-semibold text-[#FE9F43]">{t.ticketNo}</td>
                      <td className="py-2.5 px-3 font-medium text-[#1E293B]">{t.title}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold block">{t.customer?.name}</span>
                        {t.project && (
                          <span className="text-[10px] text-[#94A3B8]">{t.project.projectCode}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {t.serviceType === "PREVENTIVE_MAINTENANCE" ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <Sun className="w-3 h-3 text-[#EA580C]" /> บำรุงรักษา / ล้างแผง
                          </span>
                        ) : t.serviceType === "EMERGENCY_REPAIR" ? (
                          <span className="bg-rose-50 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <Flame className="w-3 h-3" /> ซ่อมฉุกเฉิน
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                            บริการทั่วไป
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        <span className="text-[#1E293B] font-semibold block">
                          📅 {t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString("th-TH") : "ไม่ได้ระบุ"}
                        </span>
                        <span className="text-[#94A3B8]">ช่าง: {t.technician || "-"}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            t.status === "RESOLVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : t.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {t.status === "RESOLVED"
                            ? "เสร็จสมบูรณ์"
                            : t.status === "IN_PROGRESS"
                            ? "กำลังเข้าบริการ"
                            : "นัดหมายแล้ว"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <select
                          value={t.status}
                          onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                          className="text-[11px] bg-white border border-[#CBD5E1] rounded px-1.5 py-0.5 font-medium text-[#475569] focus:outline-none"
                        >
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Service Ticket */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl border border-gray-100 text-xs">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#1E293B]">Add Service Ticket</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-5 space-y-3.5">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43] font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Customer *</label>
                    <select
                      value={formCustomerId}
                      onChange={(e) => setFormCustomerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg bg-white"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone || c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Project</label>
                    <select
                      value={formProjectId}
                      onChange={(e) => setFormProjectId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg bg-white"
                    >
                      <option value="">-- ไม่ระบุโครงการ --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.projectCode} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Service Type</label>
                    <select
                      value={formServiceType}
                      onChange={(e: any) => setFormServiceType(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg bg-white"
                    >
                      <option value="PREVENTIVE_MAINTENANCE">บำรุงรักษา / ล้างแผง (PM)</option>
                      <option value="EMERGENCY_REPAIR">แจ้งซ่อมฉุกเฉิน (Emergency)</option>
                      <option value="INSTALLATION">งานติดตั้ง/ปรับปรุง</option>
                      <option value="GENERAL">งานบริการทั่วไป</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Scheduled Date</label>
                    <input
                      type="date"
                      value={formScheduledDate}
                      onChange={(e) => setFormScheduledDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Technician / Team</label>
                  <input
                    type="text"
                    value={formTechnician}
                    onChange={(e) => setFormTechnician(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3.5 py-1.5 border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#6B7280] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    {isSubmitting ? "Creating..." : "Create Ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {addSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-5 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">เปิดใบงานบริการสำเร็จ!</h3>
              <p className="text-xs text-slate-500 mt-1">{ticketTitleSuccess}</p>
              <div className="mt-5">
                <button
                  onClick={() => setAddSuccessModal(false)}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
