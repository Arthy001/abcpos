"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Warehouse } from "@/types";
import {
  fetchWarehouses,
  createWarehouseApi,
  updateWarehouseApi,
  deleteWarehouseApi,
} from "@/lib/api";
import {
  PlusCircle,
  Search,
  RotateCcw,
  ChevronUp,
  Edit,
  Trash2,
  Eye,
  X,
  ChevronDown,
  Phone,
  Package,
  Boxes,
  Calendar,
  Warehouse as WarehouseIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [viewingWarehouse, setViewingWarehouse] = useState<Warehouse | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>("");
  const [formContactPerson, setFormContactPerson] = useState<string>("");
  const [formContactAvatar, setFormContactAvatar] = useState<string>("/assets/images/customer11.jpg");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formTotalProducts, setFormTotalProducts] = useState<number>(10);
  const [formStock, setFormStock] = useState<number>(100);
  const [formQty, setFormQty] = useState<number>(50);
  const [formAddress, setFormAddress] = useState<string>("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sample fallback matching screenshot
  const sampleWarehouses: Warehouse[] = [
    { id: "1", name: "Lavish Warehouse", contactPerson: "Chad Taylor", contactAvatar: "/assets/images/customer11.jpg", phone: "+12498345785", totalProducts: 10, stock: 600, qty: 80, createdAt: "2024-12-24", status: "ACTIVE" },
    { id: "2", name: "Quaint Warehouse", contactPerson: "Jenny Ellis", contactAvatar: "/assets/images/customer12.jpg", phone: "+13178964582", totalProducts: 15, stock: 300, qty: 85, createdAt: "2024-12-10", status: "ACTIVE" },
    { id: "3", name: "Traditional Warehouse", contactPerson: "Leon Baxter", contactAvatar: "/assets/images/customer13.jpg", phone: "+12796183487", totalProducts: 12, stock: 400, qty: 70, createdAt: "2024-11-27", status: "ACTIVE" },
    { id: "4", name: "Cool Warehouse", contactPerson: "Karen Flores", contactAvatar: "/assets/images/customer14.jpg", phone: "+17538647943", totalProducts: 20, stock: 320, qty: 65, createdAt: "2024-11-18", status: "ACTIVE" },
    { id: "5", name: "Overflow Warehouse", contactPerson: "Michael Dawson", contactAvatar: "/assets/images/customer15.jpg", phone: "+13798132475", totalProducts: 8, stock: 170, qty: 80, createdAt: "2024-11-06", status: "ACTIVE" },
    { id: "6", name: "Nova Storage Hub", contactPerson: "Karen Galvan", contactAvatar: "/assets/images/customer16.jpg", phone: "+17596341894", totalProducts: 13, stock: 220, qty: 75, createdAt: "2024-10-25", status: "ACTIVE" },
    { id: "7", name: "Retail Supply Hub", contactPerson: "Thomas Ward", contactAvatar: "/assets/images/customer17.jpg", phone: "+12973548678", totalProducts: 17, stock: 310, qty: 60, createdAt: "2024-10-14", status: "ACTIVE" },
    { id: "8", name: "EdgeWare Solutions", contactPerson: "Aliza Duncan", contactAvatar: "/assets/images/customer18.jpg", phone: "+13147858357", totalProducts: 22, stock: 450, qty: 50, createdAt: "2024-10-03", status: "ACTIVE" },
    { id: "9", name: "North Zone Warehouse", contactPerson: "James Higham", contactAvatar: "/assets/images/avatar-01.jpg", phone: "+11978348626", totalProducts: 24, stock: 270, qty: 70, createdAt: "2024-09-20", status: "ACTIVE" },
    { id: "10", name: "Fulfillment Hub", contactPerson: "Jada Robinson", contactAvatar: "/assets/images/avatar-02.jpg", phone: "+12678934561", totalProducts: 14, stock: 300, qty: 45, createdAt: "2024-09-10", status: "ACTIVE" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchWarehouses({ status: statusFilter, search });
      if (data && data.length > 0) {
        setWarehouses(data);
      } else if (!search && statusFilter === "all") {
        setWarehouses(sampleWarehouses);
      } else {
        setWarehouses([]);
      }
    } catch (err) {
      console.error(err);
      setWarehouses(sampleWarehouses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleOpenAddModal = () => {
    setEditingWarehouse(null);
    setFormName("");
    setFormContactPerson("");
    setFormContactAvatar("/assets/images/customer11.jpg");
    setFormPhone("");
    setFormTotalProducts(10);
    setFormStock(200);
    setFormQty(50);
    setFormAddress("");
    setFormStatus("ACTIVE");
    setShowFormModal(true);
  };

  const handleOpenEditModal = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setFormName(wh.name);
    setFormContactPerson(wh.contactPerson || "");
    setFormContactAvatar(wh.contactAvatar || "/assets/images/customer11.jpg");
    setFormPhone(wh.phone || "");
    setFormTotalProducts(wh.totalProducts || 0);
    setFormStock(wh.stock || 0);
    setFormQty(wh.qty || 0);
    setFormAddress(wh.address || "");
    setFormStatus(wh.status || "ACTIVE");
    setShowFormModal(true);
  };

  const handleOpenViewModal = (wh: Warehouse) => {
    setViewingWarehouse(wh);
    setShowViewModal(true);
  };

  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter Warehouse Name");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingWarehouse) {
        await updateWarehouseApi(editingWarehouse.id, {
          name: formName,
          contactPerson: formContactPerson,
          contactAvatar: formContactAvatar,
          phone: formPhone,
          totalProducts: formTotalProducts,
          stock: formStock,
          qty: formQty,
          address: formAddress,
          status: formStatus,
        });
      } else {
        await createWarehouseApi({
          name: formName,
          contactPerson: formContactPerson,
          contactAvatar: formContactAvatar,
          phone: formPhone,
          totalProducts: formTotalProducts,
          stock: formStock,
          qty: formQty,
          address: formAddress,
          status: formStatus,
        });
      }
      setShowFormModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save warehouse");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete warehouse "${name}"?`)) {
      try {
        await deleteWarehouseApi(id);
        loadData();
      } catch (err: any) {
        setWarehouses((prev) => prev.filter((w) => w.id !== id));
      }
    }
  };

  const displayList = warehouses.length > 0 ? warehouses : sampleWarehouses;

  const filteredDisplay = displayList.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      (item.contactPerson && item.contactPerson.toLowerCase().includes(term)) ||
      (item.phone && item.phone.toLowerCase().includes(term));
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
      setSelectedIds(paginatedList.map((w) => w.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "24 Dec 2024";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleExportCSV = () => {
    const headers = ["Warehouse,Contact Person,Phone,Total Products,Stock,Qty,Created On,Status"];
    const rows = filteredDisplay.map(
      (w) => `"${w.name}","${w.contactPerson || ""}","${w.phone || ""}","${w.totalProducts || 0}","${w.stock || 0}","${w.qty || 0}","${formatDate(w.createdAt)}","${w.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `warehouses_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Warehouses</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your warehouses</p>
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

            {/* + Add Warehouse Button (Orange) */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Warehouse</span>
            </button>
          </div>
        </div>

        {/* Warehouses Table Container */}
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
                  <option value="all">Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
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
                  <th className="py-3 px-4 font-bold text-[#111827]">Warehouse</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Contact Person</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Phone</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Total Products</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Stock</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Qty</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Created On</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">status</th>
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

                      {/* Warehouse Name */}
                      <td className="py-3 px-4 font-medium text-[#1E293B]">
                        {item.name}
                      </td>

                      {/* Contact Person (Avatar + Name) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                            {item.contactAvatar ? (
                              <img
                                src={item.contactAvatar}
                                alt={item.contactPerson || "Contact"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#FE9F43]/10 text-[#FE9F43] font-bold text-xs">
                                {(item.contactPerson || "C").charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-[#1E293B]">{item.contactPerson || "-"}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 text-[#64748B]">{item.phone || "-"}</td>

                      {/* Total Products */}
                      <td className="py-3 px-4 text-[#1E293B] font-medium">{item.totalProducts || 0}</td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-[#1E293B] font-medium">{item.stock || 0}</td>

                      {/* Qty */}
                      <td className="py-3 px-4 text-[#1E293B] font-medium">{item.qty || 0}</td>

                      {/* Created On */}
                      <td className="py-3 px-4 text-[#64748B]">{formatDate(item.createdAt)}</td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {item.status === "ACTIVE" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-400 text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenViewModal(item)}
                            title="View Details"
                            className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#1E293B] flex items-center justify-center transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Warehouse"
                            className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#FE9F43] flex items-center justify-center transition-colors shadow-2xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            title="Delete Warehouse"
                            className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-[#FEE2E2] text-[#64748B] hover:text-[#EF4444] flex items-center justify-center transition-colors shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredDisplay.length === 0 && !loading && (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-[#94A3B8]">
                      No warehouses found.
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

        {/* ================= Add / Edit Warehouse Modal ================= */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
                </h3>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveWarehouse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Warehouse Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lavish Warehouse"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Chad Taylor"
                      value={formContactPerson}
                      onChange={(e) => setFormContactPerson(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +12498345785"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Industrial Park, Zone A"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Total Products</label>
                    <input
                      type="number"
                      value={formTotalProducts}
                      onChange={(e) => setFormTotalProducts(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Stock</label>
                    <input
                      type="number"
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Quantity</label>
                    <input
                      type="number"
                      value={formQty}
                      onChange={(e) => setFormQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Choose Contact Avatar */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Contact Avatar</label>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {[
                      "/assets/images/customer11.jpg",
                      "/assets/images/customer12.jpg",
                      "/assets/images/customer13.jpg",
                      "/assets/images/customer14.jpg",
                      "/assets/images/customer15.jpg",
                      "/assets/images/customer16.jpg",
                      "/assets/images/customer17.jpg",
                      "/assets/images/customer18.jpg",
                      "/assets/images/avatar-01.jpg",
                      "/assets/images/avatar-02.jpg",
                    ].map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormContactAvatar(av)}
                        className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all ${
                          formContactAvatar === av
                            ? "border-[#FE9F43] scale-110 shadow-xs"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={av} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Status</label>
                  <div className="flex items-center space-x-3 pt-1">
                    <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="warehouseStatus"
                        value="ACTIVE"
                        checked={formStatus === "ACTIVE"}
                        onChange={() => setFormStatus("ACTIVE")}
                        className="accent-[#FE9F43]"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="warehouseStatus"
                        value="INACTIVE"
                        checked={formStatus === "INACTIVE"}
                        onChange={() => setFormStatus("INACTIVE")}
                        className="accent-[#FE9F43]"
                      />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FE9F43] hover:bg-[#E88B32] shadow-sm disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? "Saving..." : editingWarehouse ? "Update Warehouse" : "Add Warehouse"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= View Warehouse Details Modal ================= */}
        {showViewModal && viewingWarehouse && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Warehouse Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#FE9F43] border border-orange-200">
                  <WarehouseIcon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{viewingWarehouse.name}</h4>
                  <p className="text-xs text-gray-500">Contact: {viewingWarehouse.contactPerson || "-"}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {viewingWarehouse.status === "ACTIVE" ? (
                      <span className="inline-flex items-center text-[10px] font-semibold text-[#28C76F]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active Facility
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-semibold text-gray-500">
                        <XCircle className="w-3 h-3 mr-1" /> Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium">Products</p>
                  <p className="text-sm font-bold text-[#1E293B] mt-0.5">{viewingWarehouse.totalProducts || 0}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium">Stock</p>
                  <p className="text-sm font-bold text-[#FE9F43] mt-0.5">{viewingWarehouse.stock || 0}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium">Qty</p>
                  <p className="text-sm font-bold text-[#28C76F] mt-0.5">{viewingWarehouse.qty || 0}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Phone className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Phone</p>
                    <p className="font-semibold text-gray-800">{viewingWarehouse.phone || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Calendar className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Created On</p>
                    <p className="font-semibold text-gray-800">{formatDate(viewingWarehouse.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FE9F43] hover:bg-[#E88B32] shadow-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
