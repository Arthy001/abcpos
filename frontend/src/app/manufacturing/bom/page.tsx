"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BillOfMaterial, Product } from "@/types";
import {
  getBOMsApi,
  createBOMApi,
  updateBOMApi,
  deleteBOMApi,
  fetchProducts,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Edit,
  Trash2,
  Eye,
  X,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
  Calculator,
  Plus,
} from "lucide-react";

export default function BOMPage() {
  const [boms, setBoms] = useState<BillOfMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingBOM, setEditingBOM] = useState<BillOfMaterial | null>(null);
  const [formBomCode, setFormBomCode] = useState<string>("");
  const [formName, setFormName] = useState<string>("");
  const [formFinishedProductId, setFormFinishedProductId] = useState<string>("");
  const [formOutputQty, setFormOutputQty] = useState<number>(1.0);
  const [formUnit, setFormUnit] = useState<string>("kg");
  const [formLaborCost, setFormLaborCost] = useState<number>(2.0);
  const [formOverheadCost, setFormOverheadCost] = useState<number>(1.5);
  const [formStatus, setFormStatus] = useState<string>("ACTIVE");
  const [formNotes, setFormNotes] = useState<string>("");
  const [formItems, setFormItems] = useState<
    {
      rawMaterialId: string;
      quantity: number;
      unit: string;
      wastePercent: number;
      unitCost: number;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Modal State
  const [viewBOM, setViewBOM] = useState<BillOfMaterial | null>(null);

  // Delete Confirmation State
  const [deletingBOM, setDeletingBOM] = useState<BillOfMaterial | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bomData, prodData] = await Promise.all([
        getBOMsApi(),
        fetchProducts(),
      ]);
      setBoms(bomData || []);
      setProducts(prodData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load BOMs",
        message: err.message || "An error occurred while fetching Bill of Materials.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Paginated BOMs
  const filteredBOMs = useMemo(() => {
    return boms.filter((b) => {
      const matchSearch =
        b.bomCode.toLowerCase().includes(search.toLowerCase()) ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.finishedProduct?.name && b.finishedProduct.name.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [boms, search, statusFilter]);

  const totalPages = Math.ceil(filteredBOMs.length / pageSize) || 1;
  const paginatedBOMs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBOMs.slice(start, start + pageSize);
  }, [filteredBOMs, currentPage, pageSize]);

  // Product Options for SearchableSelect
  const productOptions = useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.sku})`,
      subLabel: `ต้นทุน: ฿${p.costPrice.toFixed(2)} | คงเหลือ: ${p.stock}`,
    }));
  }, [products]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    setEditingBOM(null);
    const codeNum = String(boms.length + 1).padStart(3, "0");
    setFormBomCode(`BOM-PLASTIC-${codeNum}`);
    setFormName("");
    setFormFinishedProductId("");
    setFormOutputQty(1.0);
    setFormUnit("kg");
    setFormLaborCost(2.0);
    setFormOverheadCost(1.5);
    setFormStatus("ACTIVE");
    setFormNotes("");

    // Default 1 material row
    setFormItems([
      {
        rawMaterialId: "",
        quantity: 1.0,
        unit: "kg",
        wastePercent: 2.0,
        unitCost: 0,
      },
    ]);
    setShowModal(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (bom: BillOfMaterial) => {
    setEditingBOM(bom);
    setFormBomCode(bom.bomCode);
    setFormName(bom.name);
    setFormFinishedProductId(bom.finishedProductId);
    setFormOutputQty(bom.outputQty || 1.0);
    setFormUnit(bom.unit || "kg");
    setFormLaborCost(bom.laborCost || 0);
    setFormOverheadCost(bom.overheadCost || 0);
    setFormStatus(bom.status || "ACTIVE");
    setFormNotes(bom.notes || "");

    if (bom.items && bom.items.length > 0) {
      setFormItems(
        bom.items.map((it) => ({
          rawMaterialId: it.rawMaterialId,
          quantity: it.quantity,
          unit: it.unit || "kg",
          wastePercent: it.wastePercent || 0,
          unitCost: it.unitCost || 0,
        }))
      );
    } else {
      setFormItems([
        {
          rawMaterialId: "",
          quantity: 1.0,
          unit: "kg",
          wastePercent: 0,
          unitCost: 0,
        },
      ]);
    }
    setShowModal(true);
  };

  // Dynamic Item Row helpers
  const handleAddItemRow = () => {
    setFormItems((prev) => [
      ...prev,
      {
        rawMaterialId: "",
        quantity: 0.1,
        unit: "kg",
        wastePercent: 0,
        unitCost: 0,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemFieldChange = (index: number, field: string, value: any) => {
    setFormItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };

      if (field === "rawMaterialId") {
        const prod = products.find((p) => p.id === value);
        if (prod) {
          item.unitCost = prod.costPrice || 0;
        }
      }
      next[index] = item;
      return next;
    });
  };

  // Live Calculated Total Cost in Form
  const calculatedTotalCost = useMemo(() => {
    const materialsCost = formItems.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);
    }, 0);
    return materialsCost + Number(formLaborCost || 0) + Number(formOverheadCost || 0);
  }, [formItems, formLaborCost, formOverheadCost]);

  // Save BOM (Create / Update)
  const handleSaveBOM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBomCode.trim() || !formName.trim() || !formFinishedProductId) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "กรุณากรอกรหัสสูตร (BOM Code), ชื่อสูตร และเลือกสินค้าสำเร็จรูปให้ครบถ้วน",
      });
      return;
    }

    if (formItems.length === 0 || formItems.some((it) => !it.rawMaterialId)) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Incomplete Materials",
        message: "กรุณาเลือกวัตถุดิบ (Raw Material) ให้ครบทุกแถวในรายการส่วนผสม",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        bomCode: formBomCode.trim(),
        name: formName.trim(),
        finishedProductId: formFinishedProductId,
        outputQty: Number(formOutputQty),
        unit: formUnit,
        laborCost: Number(formLaborCost),
        overheadCost: Number(formOverheadCost),
        status: formStatus,
        notes: formNotes,
        items: formItems,
      };

      if (editingBOM) {
        await updateBOMApi(editingBOM.id, payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "BOM Updated!",
          message: `บันทึกการแก้ไขสูตรการผลิต "${formName}" เรียบร้อยแล้ว`,
        });
      } else {
        await createBOMApi(payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "BOM Created!",
          message: `สร้างสูตรการผลิต "${formName}" (${formBomCode}) สำเร็จแล้ว`,
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "เกิดข้อผิดพลาดในการบันทึกสูตรการผลิต",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete BOM
  const handleConfirmDelete = async () => {
    if (!deletingBOM) return;
    try {
      setIsDeleting(true);
      await deleteBOMApi(deletingBOM.id);
      const deletedName = deletingBOM.name;
      setDeletingBOM(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "BOM Deleted!",
        message: `ลบสูตรการผลิต "${deletedName}" สำเร็จแล้ว`,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "ไม่สามารถลบสูตรการผลิตได้",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["BOM Code", "Recipe Name", "Finished Product", "Output Qty", "Unit", "Total Cost", "Status"];
    const rows = filteredBOMs.map((b) => [
      `"${b.bomCode}"`,
      `"${b.name}"`,
      `"${b.finishedProduct?.name || ""}"`,
      b.outputQty,
      `"${b.unit}"`,
      b.totalCost,
      `"${b.status}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `bill_of_materials_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Bill of Materials (BOM)</h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                Manufacturing
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              จัดการสูตรการผลิต สัดส่วนวัตถุดิบเม็ดพลาสติก สี สารเติมแต่ง และคำนวณต้นทุนการผลิตจริงต่อหน่วย
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
              <span>+ Add BOM</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search BOM code, recipe name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] focus:ring-1 focus:ring-[#FE9F43] transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <SearchableSelect
                options={[
                  { value: "all", label: "Status: All" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "DRAFT", label: "Draft" },
                  { value: "ARCHIVED", label: "Archived" },
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

        {/* BOM Table */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F1F3F5] bg-[#F8F9FA] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">BOM Code</th>
                  <th className="py-3 px-4">Recipe Name</th>
                  <th className="py-3 px-4">Finished Product</th>
                  <th className="py-3 px-4">Output / Batch</th>
                  <th className="py-3 px-4">Material Items</th>
                  <th className="py-3 px-4">Total Cost / Unit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F5] text-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>กำลังโหลดข้อมูลสูตรการผลิต...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedBOMs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      ไม่พบข้อมูลสูตรการผลิต (BOM)
                    </td>
                  </tr>
                ) : (
                  paginatedBOMs.map((bom) => (
                    <tr key={bom.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#FE9F43]">
                        {bom.bomCode}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {bom.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <span className="font-semibold block">{bom.finishedProduct?.name || "-"}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              SKU: {bom.finishedProduct?.sku || "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {bom.outputQty} {bom.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {bom.items?.length || 0} ส่วนผสม
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        ฿{bom.totalCost.toFixed(2)} / {bom.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bom.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : bom.status === "DRAFT"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {bom.status}
                        </span>
                      </td>
                      {/* GEMINI.md Action Order: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            title="View Details"
                            onClick={() => setViewBOM(bom)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Edit BOM"
                            onClick={() => handleOpenEditModal(bom)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-amber-600 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete BOM"
                            onClick={() => setDeletingBOM(bom)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
              <span>จากทั้งหมด {filteredBOMs.length} รายการ</span>
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
        {/* ADD / EDIT BOM MODAL                                      */}
        {/* ========================================================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-100 shadow-2xl p-6 space-y-4 my-8 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {editingBOM ? "แก้ไขสูตรการผลิต (Edit BOM)" : "เพิ่มสูตรการผลิตใหม่ (Create BOM)"}
                    </h3>
                    <p className="text-[11px] text-gray-500">กำหนดส่วนผสมเม็ดพลาสติก สี และค่าแรงเพื่อคำนวณต้นทุน</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBOM} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      BOM Code (รหัสสูตร) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formBomCode}
                      onChange={(e) => setFormBomCode(e.target.value)}
                      required
                      placeholder="e.g. BOM-BAG-6X14"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ชื่อสูตรการผลิต <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      placeholder="e.g. ถุงหูหิ้ว HDPE 6x14 นิ้ว ขาวนม"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      สินค้าสำเร็จรูปที่ผลิต (Finished Product) <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={productOptions}
                      value={formFinishedProductId}
                      onChange={(val) => setFormFinishedProductId(val)}
                      placeholder="Select finished product..."
                      showSelectOption={true}
                      selectOptionLabel="Select Finished Product..."
                      size="sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ปริมาณผลผลิตต่อสูตร (Output Qty)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="any"
                        value={formOutputQty}
                        onChange={(e) => setFormOutputQty(Number(e.target.value))}
                        className="w-2/3 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                      />
                      <input
                        type="text"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        placeholder="kg / pack"
                        className="w-1/3 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">สถานะสูตร</label>
                    <SearchableSelect
                      options={[
                        { value: "ACTIVE", label: "Active" },
                        { value: "DRAFT", label: "Draft" },
                        { value: "ARCHIVED", label: "Archived" },
                      ]}
                      value={formStatus}
                      onChange={(val) => setFormStatus(val)}
                      showSelectOption={false}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Material Ingredients List */}
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-[#FE9F43]" />
                      รายการวัตถุดิบและสารผสม (Raw Materials & Fillers)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="px-2 py-1 bg-white hover:bg-gray-100 text-[#FE9F43] border border-orange-200 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ เพิ่มวัตถุดิบ</span>
                    </button>
                  </div>

                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-2xs">
                      <div className="flex-1">
                        <SearchableSelect
                          options={productOptions}
                          value={item.rawMaterialId}
                          onChange={(val) => handleItemFieldChange(idx, "rawMaterialId", val)}
                          placeholder="Select raw material..."
                          showSelectOption={true}
                          selectOptionLabel="Select Raw Material..."
                          size="sm"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemFieldChange(idx, "quantity", Number(e.target.value))}
                          placeholder="จำนวน kg"
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#FE9F43]"
                        />
                      </div>
                      <div className="w-24">
                        <span className="text-[11px] font-mono text-gray-600 block text-right px-1">
                          @ ฿{(item.unitCost || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="w-24">
                        <span className="text-[11px] font-bold text-emerald-600 block text-right px-1">
                          ฿{((item.quantity || 0) * (item.unitCost || 0)).toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={formItems.length === 1}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded disabled:opacity-30 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Additional Costs & Cost Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ค่าแรงต่อหน่วย (Labor Cost ฿)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formLaborCost}
                      onChange={(e) => setFormLaborCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ค่าโสหุ้ย/ค่าไฟต่อหน่วย (Overhead Cost ฿)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formOverheadCost}
                      onChange={(e) => setFormOverheadCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>
                </div>

                {/* Cost Calculation Banner */}
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E293B]">ต้นทุนรวมคำนวณอัตโนมัติ (Total Unit Cost):</span>
                  <span className="text-base font-bold text-[#FE9F43]">
                    ฿{calculatedTotalCost.toFixed(2)} / {formUnit}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">หมายเหตุสูตร (Notes)</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="เช่น สัดส่วนเม็ด 90% + สีขาว 3% + แคลเซียม 7%"
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : editingBOM ? "Save Changes" : "Create BOM"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW BOM DETAILS MODAL                                    */}
        {/* ========================================================= */}
        {viewBOM && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{viewBOM.name}</h3>
                    <p className="text-[11px] font-mono text-gray-400">{viewBOM.bomCode}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewBOM(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[10px]">สินค้าสำเร็จรูป</span>
                    <span className="font-bold text-gray-800">{viewBOM.finishedProduct?.name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">ปริมาณผลผลิต</span>
                    <span className="font-bold text-gray-800">{viewBOM.outputQty} {viewBOM.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">ต้นทุนรวม</span>
                    <span className="font-bold text-emerald-600">฿{viewBOM.totalCost.toFixed(2)} / {viewBOM.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">สถานะ</span>
                    <span className="font-bold text-gray-800">{viewBOM.status}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gray-800">รายการส่วนผสมในสูตร:</h4>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {viewBOM.items?.map((it, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-gray-50">
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            {it.rawMaterial?.name || it.rawMaterialId}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {it.quantity} {it.unit} @ ฿{(it.unitCost || 0).toFixed(2)}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-600">
                          ฿{(it.subtotal || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {viewBOM.notes && (
                  <div className="p-2.5 bg-yellow-50/60 border border-yellow-200 rounded-lg text-gray-700 text-[11px]">
                    <span className="font-bold block mb-0.5">หมายเหตุ:</span>
                    {viewBOM.notes}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewBOM(null)}
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
        {deletingBOM && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete BOM?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  คุณแน่ใจหรือไม่ว่าต้องการลบสูตรการผลิต <strong>&quot;{deletingBOM.name}&quot;</strong>? การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingBOM(null)}
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
