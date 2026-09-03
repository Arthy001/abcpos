"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Department } from "@/types";
import {
  fetchDepartments,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
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
  LayoutGrid,
  List,
  Building2,
  Users,
} from "lucide-react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<10 | 25 | 50>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>("");
  const [formHeadName, setFormHeadName] = useState<string>("");
  const [formHeadAvatar, setFormHeadAvatar] = useState<string>("/assets/images/customer11.jpg");
  const [formTotalMembers, setFormTotalMembers] = useState<number>(8);
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sample fallback matching screenshot
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDepartments({ status: statusFilter, search });
      setDepartments(data || []);
    } catch (err) {
      console.error(err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleOpenAddModal = () => {
    setEditingDepartment(null);
    setFormName("");
    setFormHeadName("");
    setFormHeadAvatar("/assets/images/customer11.jpg");
    setFormTotalMembers(8);
    setFormStatus("ACTIVE");
    setShowModal(true);
  };

  const handleOpenEditModal = (dep: Department) => {
    setEditingDepartment(dep);
    setFormName(dep.name);
    setFormHeadName(dep.headName || "");
    setFormHeadAvatar(dep.headAvatar || "/assets/images/customer11.jpg");
    setFormTotalMembers(dep.totalMembers || 0);
    setFormStatus(dep.status || "ACTIVE");
    setShowModal(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter Department Name");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingDepartment) {
        await updateDepartmentApi(editingDepartment.id, {
          name: formName,
          headName: formHeadName,
          headAvatar: formHeadAvatar,
          totalMembers: formTotalMembers,
          status: formStatus,
        });
      } else {
        await createDepartmentApi({
          name: formName,
          headName: formHeadName,
          headAvatar: formHeadAvatar,
          totalMembers: formTotalMembers,
          status: formStatus,
        });
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete department "${name}"?`)) {
      try {
        await deleteDepartmentApi(id);
        loadData();
      } catch (err: any) {
        setDepartments((prev) => prev.filter((d) => d.id !== id));
      }
    }
  };

  const displayList = departments;

  const filteredDisplay = displayList.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      (item.headName && item.headName.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Department,Head Name,Total Members,Status"];
    const rows = filteredDisplay.map(
      (d) => `"${d.name}","${d.headName || ""}","${d.totalMembers || 0}","${d.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `departments_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Departments</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your departments</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Switchers */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-white text-[#FE9F43] shadow-xs" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-[#FE9F43] text-white shadow-xs" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

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

            {/* + Add Department Button (Orange) */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
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
                <option value="name">Sort By : Name</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDisplay.map((dep) => {
              return (
                <div
                  key={dep.id}
                  className="bg-white rounded-xl border border-[#E9ECEF] hover:shadow-md transition-all p-4 flex flex-col justify-between"
                >
                  {/* Card Header: Dot + Name, Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-[#1E293B]">
                      <span className="w-2 h-2 rounded-full bg-[#28C76F]"></span>
                      <span>{dep.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(dep)}
                        title="Edit"
                        className="p-1 rounded text-gray-400 hover:text-[#FE9F43] hover:bg-gray-100"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dep.id, dep.name)}
                        title="Delete"
                        className="p-1 rounded text-gray-400 hover:text-[#EF4444] hover:bg-gray-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body: Head Avatar + Head Name */}
                  <div className="py-4 text-center flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shadow-xs border border-gray-100 p-0.5 mb-2 bg-gradient-to-br from-amber-100 to-orange-100">
                      <img
                        src={dep.headAvatar || "/assets/images/customer11.jpg"}
                        alt={dep.headName || "Head"}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-[#1E293B]">{dep.headName || "Department Head"}</h4>
                  </div>

                  {/* Card Footer: Total Members + Avatar Stack */}
                  <div className="border-t border-[#F1F3F5] pt-3 flex items-center justify-between text-xs text-[#64748B]">
                    <span>Total Members: {String(dep.totalMembers || 0).padStart(2, "0")}</span>
                    <div className="flex items-center -space-x-1.5">
                      <img
                        src="/assets/images/customer11.jpg"
                        alt="m1"
                        className="w-5 h-5 rounded-full border border-white object-cover"
                      />
                      <img
                        src="/assets/images/customer12.jpg"
                        alt="m2"
                        className="w-5 h-5 rounded-full border border-white object-cover"
                      />
                      <div className="w-5 h-5 rounded-full bg-[#1E293B] text-white text-[8px] font-bold flex items-center justify-center border border-white">
                        +2
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List / Table View */
          <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredDisplay.length && filteredDisplay.length > 0}
                        onChange={() => {
                          if (selectedIds.length === filteredDisplay.length) setSelectedIds([]);
                          else setSelectedIds(filteredDisplay.map((d) => d.id));
                        }}
                        className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                      />
                    </th>
                    <th className="py-3 px-4 font-bold text-[#111827] min-w-[160px]">Department</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Department Head</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Total Members</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                    <th className="py-3 px-4 text-right font-bold text-[#111827] w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {filteredDisplay.map((dep) => {
                    const isSelected = selectedIds.includes(dep.id);

                    return (
                      <tr
                        key={dep.id}
                        className={`hover:bg-[#F9FAFB] transition-colors ${
                          isSelected ? "bg-[#FFF8F2]" : ""
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(dep.id)}
                            className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-[#1E293B]">{dep.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={dep.headAvatar || "/assets/images/customer11.jpg"}
                              alt={dep.headName || "Head"}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200"
                            />
                            <span className="font-medium text-[#1E293B]">{dep.headName || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">{String(dep.totalMembers || 0).padStart(2, "0")}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEditModal(dep)}
                              title="Edit Department"
                              className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#FE9F43] flex items-center justify-center transition-colors shadow-2xs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(dep.id, dep.name)}
                              title="Delete Department"
                              className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-[#FEE2E2] text-[#64748B] hover:text-[#EF4444] flex items-center justify-center transition-colors shadow-2xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= Add / Edit Department Modal ================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingDepartment ? "Edit Department" : "Add Department"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDepartment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Human Resources, IT Support"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Department Head</label>
                  <input
                    type="text"
                    placeholder="e.g. Susan Lopez"
                    value={formHeadName}
                    onChange={(e) => setFormHeadName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Total Members</label>
                  <input
                    type="number"
                    value={formTotalMembers}
                    onChange={(e) => setFormTotalMembers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                {/* Avatar Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Head Avatar</label>
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
                        onClick={() => setFormHeadAvatar(av)}
                        className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all ${
                          formHeadAvatar === av
                            ? "border-[#FE9F43] scale-110 shadow-xs"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={av} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FE9F43] hover:bg-[#E88B32] shadow-sm disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? "Saving..." : editingDepartment ? "Update Department" : "Add Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
