"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Warehouse, Category } from "@/types";
import {
  fetchWarehouses,
  fetchCategories,
  fetchCycleCountsApi,
  fetchCycleCountByIdApi,
  createCycleCountApi,
  updateCycleCountItemsApi,
  reconcileCycleCountApi,
  deleteCycleCountApi,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useAuthStore } from "@/store/useAuthStore";
import {
  PlusCircle,
  Search,
  FileSpreadsheet,
  RotateCcw,
  Trash2,
  Eye,
  X,
  Warehouse as WarehouseIcon,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ClipboardList,
  Check,
  Save,
  ArrowRight,
} from "lucide-react";

interface CycleCountRecord {
  id: string;
  countNumber: string;
  warehouseId: string;
  warehouseName: string;
  countDate: string;
  countType: string;
  categoryFilter?: string | null;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  assignedTo?: string | null;
  approvedBy?: string | null;
  totalItems: number;
  matchedItems: number;
  discrepancies: number;
  totalVarianceCost: number;
  notes?: string | null;
  createdAt: string;
  items?: CycleCountItemRecord[];
}

interface CycleCountItemRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string | null;
  systemQty: number;
  countedQty: number | null;
  variance: number | null;
  unitCost: number;
  varianceCost: number | null;
  status: "PENDING" | "COUNTED" | "ADJUSTED";
  notes?: string | null;
}

export default function CycleCountPage() {
  const { user } = useAuthStore();
  const [cycleCounts, setCycleCounts] = useState<CycleCountRecord[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [activeCountDetail, setActiveCountDetail] = useState<CycleCountRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Add Form State
  const [addWarehouseId, setAddWarehouseId] = useState<string>("");
  const [addCountType, setAddCountType] = useState<string>("FULL");
  const [addCategoryId, setAddCategoryId] = useState<string>("all");
  const [addAssignedTo, setAddAssignedTo] = useState<string>(user?.name || "Inventory Auditor");
  const [addNotes, setAddNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Detail / Counting Edit State
  const [editingItems, setEditingItems] = useState<{ [id: string]: number | null }>({});
  const [isSavingCount, setIsSavingCount] = useState<boolean>(false);
  const [isReconciling, setIsReconciling] = useState<boolean>(false);

  // Feedback Modals
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "edit_success" | "delete_success" | "error";
    title: string;
    message: string;
    itemName?: string;
  }>({
    isOpen: false,
    type: "add_success",
    title: "",
    message: "",
  });

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    countNumber: string;
  }>({
    isOpen: false,
    id: "",
    countNumber: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [countsRes, whRes, catRes] = await Promise.all([
        fetchCycleCountsApi({
          warehouseId: warehouseFilter !== "all" ? warehouseFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        fetchWarehouses(),
        fetchCategories(),
      ]);

      if (countsRes.success && countsRes.data) {
        setCycleCounts(countsRes.data);
      }
      setWarehouses(whRes || []);
      setCategories(catRes || []);

      if (whRes && whRes.length > 0 && !addWarehouseId) {
        setAddWarehouseId(whRes[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load cycle counts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [warehouseFilter, statusFilter]);

  // Filtered List
  const filteredList = useMemo(() => {
    return cycleCounts.filter((item) => {
      const matchSearch =
        item.countNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.warehouseName.toLowerCase().includes(search.toLowerCase()) ||
        (item.assignedTo && item.assignedTo.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    });
  }, [cycleCounts, search]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Open Count Detail
  const handleOpenDetail = async (id: string) => {
    try {
      const res = await fetchCycleCountByIdApi(id);
      if (res.success && res.data) {
        setActiveCountDetail(res.data);
        // Initialize editing inputs
        const initialMap: { [id: string]: number | null } = {};
        res.data.items?.forEach((it: CycleCountItemRecord) => {
          initialMap[it.id] = it.countedQty;
        });
        setEditingItems(initialMap);
        setIsDetailModalOpen(true);
      }
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to load audit sheet",
      });
    }
  };

  // Create Cycle Count
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addWarehouseId) {
      alert("Please select a warehouse");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await createCycleCountApi({
        warehouseId: addWarehouseId,
        countType: addCountType,
        categoryId: addCountType === "CATEGORY" && addCategoryId !== "all" ? addCategoryId : undefined,
        assignedTo: addAssignedTo,
        notes: addNotes,
      });

      if (res.success) {
        setIsAddModalOpen(false);
        setAddNotes("");
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Audit Sheet Created!",
          message: res.message,
          itemName: res.data.countNumber,
        });
        loadData();
      }
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Create Sheet",
        message: err.message || "An error occurred while generating cycle count",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Progress (Update Counted Qty)
  const handleSaveProgress = async () => {
    if (!activeCountDetail) return;
    try {
      setIsSavingCount(true);
      const itemsPayload = Object.entries(editingItems).map(([id, countedQty]) => ({
        id,
        countedQty: countedQty !== null ? Number(countedQty) : null,
      }));

      const res = await updateCycleCountItemsApi(activeCountDetail.id, itemsPayload);
      if (res.success) {
        setActiveCountDetail(res.data);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Counts Recorded!",
          message: "All entered quantities have been saved and recalculated.",
          itemName: activeCountDetail.countNumber,
        });
        loadData();
      }
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Save Counts",
        message: err.message,
      });
    } finally {
      setIsSavingCount(false);
    }
  };

  // Reconcile and Approve
  const handleReconcileSubmit = async () => {
    if (!activeCountDetail) return;
    if (
      !confirm(
        `Are you sure you want to approve and close ${activeCountDetail.countNumber}? Any discrepancies will automatically generate stock adjustment records!`
      )
    ) {
      return;
    }

    try {
      setIsReconciling(true);
      const res = await reconcileCycleCountApi(activeCountDetail.id, {
        approvedBy: user?.name || "Admin Auditor",
        autoAdjust: true,
      });

      if (res.success) {
        setIsDetailModalOpen(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Stock Reconciled & Closed!",
          message: res.message,
          itemName: activeCountDetail.countNumber,
        });
        loadData();
      }
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Reconcile Failed",
        message: err.message,
      });
    } finally {
      setIsReconciling(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteCycleCountApi(deleteModal.id);
      if (res.success) {
        setDeleteModal({ isOpen: false, id: "", countNumber: "" });
        setFeedbackModal({
          isOpen: true,
          type: "delete_success",
          title: "Cycle Count Deleted",
          message: "The audit sheet has been safely removed.",
          itemName: deleteModal.countNumber,
        });
        loadData();
      }
    } catch (err: any) {
      setDeleteModal({ isOpen: false, id: "", countNumber: "" });
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message,
      });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-indigo-600" />
              Stock Cycle Count (Stock Take)
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Audit warehouse physical inventory against system stock records without shutting down operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Audit Sheet</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[260px] flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit number, warehouse, auditor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Warehouse Filter */}
            <div className="w-56">
              <SearchableSelect
                options={[
                  { label: "All Warehouses", value: "all" },
                  ...warehouses.map((w) => ({ label: w.name, value: w.id })),
                ]}
                value={warehouseFilter}
                onChange={(val) => setWarehouseFilter(val)}
                placeholder="Warehouse: All"
              />
            </div>

            {/* Status Filter */}
            <div className="w-48">
              <SearchableSelect
                options={[
                  { label: "Status: All", value: "all" },
                  { label: "In Progress", value: "IN_PROGRESS" },
                  { label: "Completed", value: "COMPLETED" },
                  { label: "Draft", value: "DRAFT" },
                ]}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                placeholder="Status: All"
              />
            </div>

            {(search || warehouseFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setWarehouseFilter("all");
                  setStatusFilter("all");
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Count Ref</th>
                  <th className="py-3.5 px-4">Warehouse</th>
                  <th className="py-3.5 px-4">Scope / Type</th>
                  <th className="py-3.5 px-4 text-center">Items Counted</th>
                  <th className="py-3.5 px-4 text-center">Discrepancies</th>
                  <th className="py-3.5 px-4">Auditor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      Loading stock audit sheets...
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No cycle count records found.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {row.countNumber}
                        <div className="text-[11px] text-gray-400 font-normal">
                          {new Date(row.countDate).toLocaleDateString("en-GB")}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {row.warehouseName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {row.countType}
                        </span>
                        {row.categoryFilter && (
                          <span className="text-xs text-gray-400 block mt-0.5">
                            Category: {row.categoryFilter}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-gray-900">{row.totalItems}</span> items
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {row.discrepancies > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            {row.discrepancies} variance
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            100% Match
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {row.assignedTo || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        {row.status === "COMPLETED" ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                            <Check className="w-3 h-3" /> Reconciled
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                            <Sparkles className="w-3 h-3" /> In Progress
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Standard Action Order: View -> Edit -> Delete */}
                          <button
                            onClick={() => handleOpenDetail(row.id)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Audit & Count Sheet"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {row.status !== "COMPLETED" && (
                            <button
                              onClick={() => {
                                setDeleteModal({
                                  isOpen: true,
                                  id: row.id,
                                  countNumber: row.countNumber,
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Audit"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div>
              Showing {filteredList.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredList.length)} of {filteredList.length} sheets
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* --- CREATE AUDIT MODAL --- */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Create New Audit Sheet</h3>
                    <p className="text-xs text-gray-400">Generate a snapshot count sheet from live warehouse inventory</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Target Warehouse *
                  </label>
                  <SearchableSelect
                    options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
                    value={addWarehouseId}
                    onChange={(val) => setAddWarehouseId(val)}
                    placeholder="Select warehouse..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Audit Scope / Count Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAddCountType("FULL")}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        addCountType === "FULL"
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-bold text-xs">Full Warehouse Count</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Audits all active products in warehouse</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddCountType("CATEGORY")}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        addCountType === "CATEGORY"
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-bold text-xs">Specific Category</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Count only a designated department</div>
                    </button>
                  </div>
                </div>

                {addCountType === "CATEGORY" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Filter Category
                    </label>
                    <SearchableSelect
                      options={[
                        { label: "All Categories", value: "all" },
                        ...categories.map((c) => ({ label: c.name, value: c.id })),
                      ]}
                      value={addCategoryId}
                      onChange={(val) => setAddCategoryId(val)}
                      placeholder="Select category..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Assigned Auditor Name
                  </label>
                  <input
                    type="text"
                    value={addAssignedTo}
                    onChange={(e) => setAddAssignedTo(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Audit Notes / Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                    placeholder="e.g. Monthly scheduled inventory count for Zone B"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Generating..." : "Generate Audit Sheet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- AUDIT COUNTING & RECONCILE MODAL --- */}
        {isDetailModalOpen && activeCountDetail && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-gray-900">{activeCountDetail.countNumber}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {activeCountDetail.warehouseName}
                    </span>
                    {activeCountDetail.status === "COMPLETED" && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        COMPLETED & RECONCILED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Auditor: {activeCountDetail.assignedTo || "—"} &bull; Created:{" "}
                    {new Date(activeCountDetail.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items Counting Table */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/90 sticky top-0 border-b border-gray-200 font-bold text-gray-700 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Product Name / SKU</th>
                      <th className="py-2.5 px-3 text-center">System Qty (Snapshot)</th>
                      <th className="py-2.5 px-3 text-center w-36">Counted Physical Qty</th>
                      <th className="py-2.5 px-3 text-center">Variance (Diff)</th>
                      <th className="py-2.5 px-3 text-right">Unit Cost</th>
                      <th className="py-2.5 px-3 text-right">Variance Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeCountDetail.items?.map((item) => {
                      const countedVal = editingItems[item.id];
                      const diff = countedVal !== null && countedVal !== undefined ? Number(countedVal) - item.systemQty : null;
                      const varCost = diff !== null ? diff * item.unitCost : null;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/40">
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            {item.productName}
                            {item.sku && <span className="text-gray-400 block text-[10px]">{item.sku}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-gray-700 bg-gray-50/50">
                            {item.systemQty}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {activeCountDetail.status === "COMPLETED" ? (
                              <span className="font-black text-gray-900">{item.countedQty ?? "—"}</span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                value={countedVal !== null && countedVal !== undefined ? countedVal : ""}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? null : Number(e.target.value);
                                  setEditingItems((prev) => ({ ...prev, [item.id]: val }));
                                }}
                                placeholder="Enter count..."
                                className="w-28 px-2.5 py-1 text-center font-bold text-sm bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600"
                              />
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-black">
                            {diff === null ? (
                              <span className="text-gray-300">—</span>
                            ) : diff === 0 ? (
                              <span className="text-emerald-600">0</span>
                            ) : diff > 0 ? (
                              <span className="text-emerald-600">+{diff} (Surplus)</span>
                            ) : (
                              <span className="text-rose-600">{diff} (Deficit)</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-500">
                            ฿{item.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            {varCost === null ? (
                              <span className="text-gray-300">—</span>
                            ) : (
                              <span className={varCost < 0 ? "text-rose-600" : varCost > 0 ? "text-emerald-600" : "text-gray-400"}>
                                ฿{varCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-500">
                    Total Items: <strong className="text-gray-900">{activeCountDetail.totalItems}</strong>
                  </span>
                  <span className="text-emerald-600">
                    Matched: <strong>{activeCountDetail.matchedItems}</strong>
                  </span>
                  <span className="text-rose-600">
                    Discrepancies: <strong>{activeCountDetail.discrepancies}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                  >
                    Close
                  </button>

                  {activeCountDetail.status !== "COMPLETED" && (
                    <>
                      <button
                        onClick={handleSaveProgress}
                        disabled={isSavingCount}
                        className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingCount ? "Saving..." : "Save Count Progress"}</span>
                      </button>

                      <button
                        onClick={handleReconcileSubmit}
                        disabled={isReconciling}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isReconciling ? "Reconciling..." : "Approve & Adjust Stock"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- DELETE CONFIRMATION MODAL (Step 1) --- */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Delete Cycle Count?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to discard audit sheet{" "}
                  <strong className="text-gray-900">{deleteModal.countNumber}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, id: "", countNumber: "" })}
                  className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- FEEDBACK MODALS (GEMINI Standard) --- */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
              {feedbackModal.type === "add_success" && (
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
              )}
              {feedbackModal.type === "edit_success" && (
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              )}
              {feedbackModal.type === "delete_success" && (
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                  <Trash2 className="w-7 h-7" />
                </div>
              )}
              {feedbackModal.type === "error" && (
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7" />
                </div>
              )}

              <div>
                <h3 className="text-lg font-black text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feedbackModal.message}</p>
                {feedbackModal.itemName && (
                  <p className="text-xs font-bold text-gray-800 mt-2 bg-gray-50 py-1 px-3 rounded-lg inline-block border border-gray-200">
                    {feedbackModal.itemName}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                  className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer"
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
