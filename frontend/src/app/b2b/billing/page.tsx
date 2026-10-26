"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BillingNote, Customer, SalesOrder } from "@/types";
import {
  getBillingNotesApi,
  createBillingNoteApi,
  updateBillingNoteStatusApi,
  deleteBillingNoteApi,
  fetchCustomers,
  getSalesOrdersApi,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
  CreditCard,
  Building2,
  Clock,
  Printer,
  Calendar,
  DollarSign,
  CheckCheck,
  Receipt,
} from "lucide-react";

export default function B2bBillingNotesPage() {
  const [billingNotes, setBillingNotes] = useState<BillingNote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Feedback Modal (GEMINI.md standard)
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "edit_success" | "delete_success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "add_success",
    title: "",
    message: "",
  });

  // Create Billing Note Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formBillingNo, setFormBillingNo] = useState<string>("");
  const [formCustomerId, setFormCustomerId] = useState<string>("");
  const [formCollectionDate, setFormCollectionDate] = useState<string>("");
  const [formSelectedOrderIds, setFormSelectedOrderIds] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Modal
  const [viewNote, setViewNote] = useState<BillingNote | null>(null);

  // Delete Confirmation
  const [deletingNote, setDeletingNote] = useState<BillingNote | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bnData, custData, soData] = await Promise.all([
        getBillingNotesApi(),
        fetchCustomers(),
        getSalesOrdersApi(),
      ]);
      setBillingNotes(bnData || []);
      setCustomers(custData || []);
      setSalesOrders(soData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Billing Notes",
        message: err.message || "An error occurred while loading billing notes.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Paginated Billing Notes
  const filteredNotes = useMemo(() => {
    return billingNotes.filter((n) => {
      const matchSearch =
        n.billingNo.toLowerCase().includes(search.toLowerCase()) ||
        n.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        (n.customer?.taxId && n.customer.taxId.includes(search));
      const matchStatus = statusFilter === "all" || n.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [billingNotes, search, statusFilter]);

  const totalPages = Math.ceil(filteredNotes.length / pageSize) || 1;
  const paginatedNotes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotes.slice(start, start + pageSize);
  }, [filteredNotes, currentPage, pageSize]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalCount = billingNotes.length;
    const pendingAmount = billingNotes
      .filter((n) => n.status === "ISSUED")
      .reduce((sum, n) => sum + (n.totalAmount || 0), 0);
    const collectedAmount = billingNotes
      .filter((n) => n.status === "COLLECTED")
      .reduce((sum, n) => sum + (n.paidAmount || n.totalAmount || 0), 0);
    const activeB2bCustomers = new Set(billingNotes.map((n) => n.customerId)).size;

    return { totalCount, pendingAmount, collectedAmount, activeB2bCustomers };
  }, [billingNotes]);

  // Customer options for SearchableSelect
  const customerOptions = useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: `${c.name} ${c.code ? `(${c.code})` : ""}`,
      subLabel: `หนี้ค้างชำระ: ฿${(c.currentCreditUsed || 0).toLocaleString()} | เครดิต: ${c.creditTermDays || 0} วัน`,
    }));
  }, [customers]);

  // Available Unpaid Sales Orders for selected customer in Form
  const availableSalesOrders = useMemo(() => {
    if (!formCustomerId) return [];
    return salesOrders.filter((so) => so.customerId === formCustomerId && so.paymentStatus !== "PAID" && so.status !== "CANCELLED");
  }, [salesOrders, formCustomerId]);

  const formTotalSelectedAmount = useMemo(() => {
    return availableSalesOrders
      .filter((so) => formSelectedOrderIds.includes(so.id))
      .reduce((sum, so) => sum + so.total, 0);
  }, [availableSalesOrders, formSelectedOrderIds]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    const codeNum = String(billingNotes.length + 1).padStart(4, "0");
    setFormBillingNo(`BN-2026-${codeNum}`);
    setFormCustomerId("");
    setFormCollectionDate("");
    setFormSelectedOrderIds([]);
    setFormNotes("");
    setShowAddModal(true);
  };

  const handleCustomerSelect = (custId: string) => {
    setFormCustomerId(custId);
    // Pre-select all available unpaid orders
    const ordersForCust = salesOrders.filter((so) => so.customerId === custId && so.paymentStatus !== "PAID");
    setFormSelectedOrderIds(ordersForCust.map((o) => o.id));

    // Default collection date to 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setFormCollectionDate(d.toISOString().slice(0, 10));
  };

  const toggleSelectOrder = (orderId: string) => {
    setFormSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Submit Create Billing Note
  const handleSaveBillingNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBillingNo.trim() || !formCustomerId || formSelectedOrderIds.length === 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "กรุณาระบุเลขที่ใบวางบิล เลือกลูกค้า และติ๊กเลือกใบสั่งขายที่ต้องการวางบิลอย่างน้อย 1 รายการ",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createBillingNoteApi({
        billingNo: formBillingNo.trim(),
        customerId: formCustomerId,
        collectionDate: formCollectionDate || undefined,
        salesOrderIds: formSelectedOrderIds,
        notes: formNotes,
      });

      setShowAddModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Billing Note Issued!",
        message: `ออกใบวางบิลรอบงวด "${formBillingNo}" รวม ${formSelectedOrderIds.length} คำสั่งขาย ยอดเงิน ฿${formTotalSelectedAmount.toLocaleString()} สำเร็จแล้ว`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "ไม่สามารถออกใบวางบิลได้",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark as Collected
  const handleMarkCollected = async (note: BillingNote) => {
    try {
      await updateBillingNoteStatusApi(note.id, {
        status: "COLLECTED",
        paidAmount: note.totalAmount,
      });
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "Payment Collected!",
        message: `บันทึกรับชำระเงินตามใบวางบิล "${note.billingNo}" จำนวน ฿${note.totalAmount.toLocaleString()} เรียบร้อยแล้ว ระบบได้ตัดยอดหนี้และปิดบิลขายส่งให้อัตโนมัติ`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: err.message || "ไม่สามารถบันทึกรับเงินได้",
      });
    }
  };

  // Delete Billing Note
  const handleConfirmDelete = async () => {
    if (!deletingNote) return;
    try {
      setIsDeleting(true);
      await deleteBillingNoteApi(deletingNote.id);
      const delNo = deletingNote.billingNo;
      setDeletingNote(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Billing Note Deleted!",
        message: `ลบใบวางบิล "${delNo}" สำเร็จแล้ว`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "ไม่สามารถลบใบวางบิลได้",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Billing No", "Customer", "Billing Date", "Collection Due Date", "Total Amount (THB)", "Status"];
    const rows = filteredNotes.map((n) => [
      `"${n.billingNo}"`,
      `"${n.customer?.name || ""}"`,
      `"${new Date(n.billingDate).toLocaleDateString("th-TH")}"`,
      `"${new Date(n.collectionDate).toLocaleDateString("th-TH")}"`,
      n.totalAmount,
      `"${n.status}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `billing_notes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Billing Notes (ใบวางบิลรอบงวด)</h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                AR Settlement
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              รวมใบส่งของและใบสั่งขายออกใบวางบิลส่งยี่ปั๊ว-ลูกค้าเครดิตรอบสิ้นเดือน และติดตามการเก็บเงินตามนัด
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              title="Export PDF"
              onClick={() => window.print()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" />
            </button>
            <button
              type="button"
              title="Export CSV"
              onClick={handleExportCSV}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            </button>
            <button
              type="button"
              title="Refresh"
              onClick={loadData}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Issue Billing Note</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">ใบวางบิลทั้งหมด</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#1E293B]">{kpis.totalCount}</span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">รอเก็บเงิน/รับเช็ค (Pending)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-amber-600">฿{kpis.pendingAmount.toLocaleString()}</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">เก็บเงินเรียบร้อยแล้ว</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-emerald-600">฿{kpis.collectedAmount.toLocaleString()}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCheck className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E9ECEF] p-3.5 shadow-xs">
            <span className="text-[11px] font-semibold text-[#64748B] block mb-1">ลูกค้ายี่ปั๊วที่มีรอบวางบิล</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#FE9F43]">{kpis.activeB2bCustomers} ราย</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Billing No, Customer, TAX ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] focus:ring-1 focus:ring-[#FE9F43] transition-all"
              />
            </div>

            <div className="w-full sm:w-48">
              <SearchableSelect
                options={[
                  { value: "all", label: "Status: All" },
                  { value: "ISSUED", label: "Issued (รอเก็บเงิน)" },
                  { value: "COLLECTED", label: "Collected (ชำระแล้ว)" },
                ]}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                placeholder="Filter Status..."
                showSelectOption={false}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Billing Notes Table */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F1F3F5] bg-[#F8F9FA] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">Billing No</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Billing Date</th>
                  <th className="py-3 px-4">Collection Due Date</th>
                  <th className="py-3 px-4">Included Orders</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Collection Action</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F5] text-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>กำลังโหลดใบวางบิล...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedNotes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      ไม่พบข้อมูลใบวางบิล (Billing Notes)
                    </td>
                  </tr>
                ) : (
                  paginatedNotes.map((note) => {
                    const isDueToday =
                      new Date(note.collectionDate).toDateString() === new Date().toDateString();

                    return (
                      <tr key={note.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#FE9F43]">
                          {note.billingNo}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-semibold text-gray-900 block">{note.customer?.name}</span>
                            {note.customer?.taxId && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                TAX: {note.customer.taxId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {new Date(note.billingDate).toLocaleDateString("th-TH")}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold ${
                              isDueToday ? "text-amber-600 font-bold" : "text-gray-900"
                            }`}
                          >
                            {new Date(note.collectionDate).toLocaleDateString("th-TH")}
                            {isDueToday && " (วันนี้!)"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {note.items?.length || 0} ใบสั่งขาย
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-sm text-gray-900">
                          ฿{note.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              note.status === "COLLECTED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {note.status === "COLLECTED" ? "ชำระแล้ว (Paid)" : "รอรับเงิน (Issued)"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {note.status === "ISSUED" ? (
                            <button
                              type="button"
                              onClick={() => handleMarkCollected(note)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center justify-center gap-1 mx-auto shadow-2xs cursor-pointer transition-colors"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>รับเงินแล้ว</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>เคลียร์ยอดแล้ว</span>
                            </span>
                          )}
                        </td>
                        {/* GEMINI.md Action Order: View (Eye) -> Delete (Trash2) */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              title="View Billing Note"
                              onClick={() => setViewNote(note)}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete Billing Note"
                              onClick={() => setDeletingNote(note)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-[#F1F3F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <div className="flex items-center space-x-2">
              <span>แสดงแถวต่อหน้า:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#FE9F43]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>จากทั้งหมด {filteredNotes.length} รายการ</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ADD BILLING NOTE MODAL                                    */}
        {/* ========================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-100 shadow-2xl p-6 space-y-4 my-8 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">ออกใบวางบิลรวม (Issue Billing Note)</h3>
                    <p className="text-[11px] text-gray-500">เลือกลูกค้าและติ๊กเลือกใบสั่งขายที่ต้องการรวมวางบิลในงวดนี้</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBillingNote} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      เลขที่ใบวางบิล (Billing No) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formBillingNo}
                      onChange={(e) => setFormBillingNo(e.target.value)}
                      required
                      placeholder="e.g. BN-2026-0002"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      วันนัดชำระ/รับเช็ค (Collection Date) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formCollectionDate}
                      onChange={(e) => setFormCollectionDate(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      เลือกลูกค้ายี่ปั๊ว (Select Customer) <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={customerOptions}
                      value={formCustomerId}
                      onChange={handleCustomerSelect}
                      placeholder="Select Customer..."
                      showSelectOption={true}
                      selectOptionLabel="Select B2B Customer..."
                      size="sm"
                    />
                  </div>
                </div>

                {/* Unpaid Orders Checkbox List */}
                {formCustomerId && (
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-2">
                    <span className="text-xs font-bold text-gray-800 block mb-1">
                      เลือกใบสั่งขายที่ต้องการรวมวางบิล ({formSelectedOrderIds.length} ใบเลือกอยู่):
                    </span>

                    {availableSalesOrders.length === 0 ? (
                      <p className="text-xs text-gray-400 py-3 text-center">
                        ไม่มีใบสั่งขายค้างชำระสำหรับลูกค้ารายนี้
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 bg-white rounded-lg border border-gray-200">
                        {availableSalesOrders.map((so) => {
                          const isChecked = formSelectedOrderIds.includes(so.id);
                          return (
                            <label
                              key={so.id}
                              className="p-2.5 flex items-center justify-between text-xs hover:bg-gray-50 cursor-pointer"
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelectOrder(so.id)}
                                  className="w-4 h-4 rounded text-[#FE9F43] focus:ring-[#FE9F43]"
                                />
                                <div>
                                  <span className="font-bold text-gray-900 block">{so.orderNo}</span>
                                  <span className="text-[10px] text-gray-400">
                                    วันที่สั่ง: {new Date(so.orderDate).toLocaleDateString("th-TH")} | เครดิต {so.creditTermDays} วัน
                                  </span>
                                </div>
                              </div>
                              <span className="font-bold text-gray-900">
                                ฿{so.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Grand Total Banner */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-900">ยอดรวมทั้งสิ้นในใบวางบิลนี้:</span>
                  <span className="text-purple-800 text-sm">
                    ฿{formTotalSelectedAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">หมายเหตุใบวางบิล (Notes)</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="เช่น วางบิลรอบสิ้นเดือน ม.ค. นัดจ่ายเช็คทุกวันศุกร์"
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || formSelectedOrderIds.length === 0}
                    className="flex-1 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isSubmitting ? "Issuing..." : "Issue Billing Note"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW BILLING NOTE VOUCHER MODAL                           */}
        {/* ========================================================= */}
        {viewNote && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{viewNote.billingNo}</h3>
                    <p className="text-[11px] text-gray-400">ใบวางบิล / Statement of Account</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    title="Print Voucher"
                    onClick={() => window.print()}
                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewNote(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[10px]">ลูกค้า</span>
                    <span className="font-bold text-gray-800">{viewNote.customer?.name}</span>
                    {viewNote.customer?.taxId && (
                      <span className="text-[10px] text-gray-400 block font-mono">
                        TAX: {viewNote.customer.taxId}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">วันนัดรับเงิน</span>
                    <span className="font-bold text-amber-600">
                      {new Date(viewNote.collectionDate).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">วันที่ออกใบวางบิล</span>
                    <span className="font-bold text-gray-800">
                      {new Date(viewNote.billingDate).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">สถานะ</span>
                    <span className="font-bold text-gray-800">{viewNote.status}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gray-800">รายการใบสั่งขายในบิลนี้:</h4>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {viewNote.items?.map((it, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-gray-50">
                        <div>
                          <span className="font-bold text-gray-800 block">{it.orderNo}</span>
                          <span className="text-[10px] text-gray-400">
                            วันที่: {new Date(it.orderDate).toLocaleDateString("th-TH")}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900">
                          ฿{it.orderAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between font-bold text-sm">
                  <span className="text-purple-900">ยอดรวมทั้งสิ้นที่ต้องชำระ:</span>
                  <span className="text-purple-800">
                    ฿{viewNote.totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewNote(null)}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* DELETE CONFIRMATION MODAL (GEMINI.md Step 1: Rose Trash2)  */}
        {/* ========================================================= */}
        {deletingNote && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Billing Note?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  คุณแน่ใจหรือไม่ว่าต้องการลบใบวางบิล <strong>&quot;{deletingNote.billingNo}&quot;</strong>?
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingNote(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ACTION FEEDBACK / ALERT MODAL (GEMINI.md Standard)        */}
        {/* ========================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xs ${
                  feedbackModal.type === "add_success"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : feedbackModal.type === "edit_success"
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : feedbackModal.type === "delete_success"
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : "bg-rose-50 text-rose-600 border border-rose-100"
                }`}
              >
                {feedbackModal.type === "add_success" && <Sparkles className="w-7 h-7" />}
                {feedbackModal.type === "edit_success" && <CheckCircle2 className="w-7 h-7" />}
                {feedbackModal.type === "delete_success" && <Trash2 className="w-7 h-7" />}
                {feedbackModal.type === "error" && <AlertTriangle className="w-7 h-7" />}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feedbackModal.message}</p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                {feedbackModal.type === "add_success" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                        handleOpenAddModal();
                      }}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      + Add Another
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                      className="flex-1 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                    className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                      feedbackModal.type === "error"
                        ? "bg-rose-500 hover:bg-rose-600"
                        : "bg-[#FE9F43] hover:bg-[#E88B32]"
                    }`}
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
