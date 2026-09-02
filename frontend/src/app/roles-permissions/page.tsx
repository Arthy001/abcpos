"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { RoleItem } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import {
  fetchRoles,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
} from "@/lib/api";
import {
  Plus,
  Search,
  RotateCcw,
  ChevronUp,
  Edit,
  Trash2,
  Shield,
  X,
  FileSpreadsheet,
  FileText,
  Check,
  CheckSquare,
  Square,
} from "lucide-react";

interface PermissionRow {
  module: string;
  all: boolean;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

const DEFAULT_MODULE_PERMISSIONS: PermissionRow[] = [
  { module: "Dashboard", all: true, view: true, create: true, edit: true, delete: true },
  { module: "Products & Inventory", all: true, view: true, create: true, edit: true, delete: true },
  { module: "Stock Management", all: true, view: true, create: true, edit: true, delete: true },
  { module: "Sales & POS", all: true, view: true, create: true, edit: true, delete: true },
  { module: "Promo & Discounts", all: true, view: true, create: true, edit: true, delete: true },
  { module: "Purchases", all: true, view: true, create: true, edit: true, delete: true },
  { module: "Finance & Accounts", all: true, view: true, create: true, edit: true, delete: true },
  { module: "Peoples (Customers/Suppliers)", all: true, view: true, create: true, edit: true, delete: true },
  { module: "HRM & Attendance", all: true, view: true, create: true, edit: true, delete: true },
  { module: "Reports & Analytics", all: true, view: true, create: true, edit: true, delete: true },
  { module: "User Management", all: true, view: true, create: true, edit: true, delete: true },
  { module: "System Settings", all: true, view: true, create: true, edit: true, delete: true },
];

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

  // Form State
  const [formRoleName, setFormRoleName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [permissionsMatrix, setPermissionsMatrix] = useState<PermissionRow[]>(DEFAULT_MODULE_PERMISSIONS);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const sampleRoles: RoleItem[] = [
    { id: "1", name: "Admin", createdDate: "12 Sep 2024", status: "ACTIVE", description: "Full administrative access" },
    { id: "2", name: "Manager", createdDate: "24 Oct 2024", status: "ACTIVE", description: "Branch and operation manager" },
    { id: "3", name: "Salesman", createdDate: "18 Feb 2024", status: "ACTIVE", description: "POS counter clerk" },
    { id: "4", name: "Supervisor", createdDate: "17 Oct 2024", status: "ACTIVE", description: "Shift and team supervisor" },
    { id: "5", name: "Store Keeper", createdDate: "20 Jul 2024", status: "ACTIVE", description: "Warehouse stock management" },
    { id: "6", name: "Inventory Manager", createdDate: "10 Apr 2024", status: "ACTIVE", description: "Inventory audits and stock control" },
    { id: "7", name: "Delivery Biker", createdDate: "29 Aug 2024", status: "ACTIVE", description: "Order logistics and delivery" },
    { id: "8", name: "Employee", createdDate: "22 Feb 2024", status: "ACTIVE", description: "Standard employee access" },
    { id: "9", name: "Cashier", createdDate: "03 Nov 2024", status: "ACTIVE", description: "POS cash register" },
    { id: "10", name: "Quality Analyst", createdDate: "17 Dec 2024", status: "ACTIVE", description: "QA and inspection" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRoles({ status: statusFilter, search });
      if (data && data.length > 0) {
        setRoles(data);
      } else if (!search && statusFilter === "all") {
        setRoles(sampleRoles);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error(err);
      setRoles(sampleRoles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleOpenAddModal = () => {
    setSelectedRole(null);
    setFormRoleName("");
    setFormDescription("");
    setFormStatus("ACTIVE");
    setFormError("");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (role: RoleItem) => {
    setSelectedRole(role);
    setFormRoleName(role.name);
    setFormDescription(role.description || "");
    setFormStatus(role.status);
    setFormError("");
    setShowEditModal(true);
  };

  const handleOpenPermissionModal = (role: RoleItem) => {
    setSelectedRole(role);
    if (role.permissions) {
      try {
        const parsed = JSON.parse(role.permissions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPermissionsMatrix(parsed);
        } else {
          setPermissionsMatrix(DEFAULT_MODULE_PERMISSIONS);
        }
      } catch (e) {
        setPermissionsMatrix(DEFAULT_MODULE_PERMISSIONS);
      }
    } else {
      // Non-admin default permissions
      if (role.name === "Admin") {
        setPermissionsMatrix(
          DEFAULT_MODULE_PERMISSIONS.map((m) => ({
            ...m,
            all: true,
            view: true,
            create: true,
            edit: true,
            delete: true,
          }))
        );
      } else {
        setPermissionsMatrix(
          DEFAULT_MODULE_PERMISSIONS.map((m) => ({
            ...m,
            all: false,
            view: true,
            create: ["Sales & POS", "Products & Inventory"].includes(m.module),
            edit: ["Sales & POS"].includes(m.module),
            delete: false,
          }))
        );
      }
    }
    setShowPermissionModal(true);
  };

  const handleOpenDeleteModal = (role: RoleItem) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const toggleAllInRow = (index: number) => {
    setPermissionsMatrix((prev) => {
      const next = [...prev];
      const current = next[index];
      const targetState = !current.all;
      next[index] = {
        ...current,
        all: targetState,
        view: targetState,
        create: targetState,
        edit: targetState,
        delete: targetState,
      };
      return next;
    });
  };

  const toggleSinglePermission = (index: number, key: "view" | "create" | "edit" | "delete") => {
    setPermissionsMatrix((prev) => {
      const next = [...prev];
      const current = { ...next[index], [key]: !next[index][key] };
      current.all = current.view && current.create && current.edit && current.delete;
      next[index] = current;
      return next;
    });
  };

  const toggleAllModulesAll = () => {
    const areAllChecked = permissionsMatrix.every((m) => m.all);
    const target = !areAllChecked;
    setPermissionsMatrix(
      permissionsMatrix.map((m) => ({
        ...m,
        all: target,
        view: target,
        create: target,
        edit: target,
        delete: target,
      }))
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      setIsSubmitting(true);
      await updateRoleApi(selectedRole.id, {
        permissions: JSON.stringify(permissionsMatrix),
      });
      // Immediately refresh global auth permissions cache
      await useAuthStore.getState().fetchRolePermissions();
      setShowPermissionModal(false);
      loadData();
    } catch (e: any) {
      console.error(e);
      setShowPermissionModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleName.trim()) {
      setFormError("Role name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      const payload: Partial<RoleItem> = {
        name: formRoleName.trim(),
        description: formDescription.trim() || undefined,
        status: formStatus,
      };

      try {
        await createRoleApi(payload);
      } catch (err) {
        const localNew: RoleItem = {
          id: String(Date.now()),
          name: formRoleName.trim(),
          description: formDescription.trim() || null,
          status: formStatus,
          createdDate: new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date()),
        };
        setRoles((prev) => [...prev, localNew]);
      }
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to create role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!formRoleName.trim()) {
      setFormError("Role name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      const payload: Partial<RoleItem> = {
        name: formRoleName.trim(),
        description: formDescription.trim() || undefined,
        status: formStatus,
      };

      try {
        await updateRoleApi(selectedRole.id, payload);
      } catch (err) {
        setRoles((prev) =>
          prev.map((r) =>
            r.id === selectedRole.id
              ? { ...r, name: formRoleName.trim(), description: formDescription.trim() || null, status: formStatus }
              : r
          )
        );
      }
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;
    try {
      setIsSubmitting(true);
      try {
        await deleteRoleApi(selectedRole.id);
      } catch (e) {
        setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id));
      }
      setShowDeleteModal(false);
      loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(roles.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const totalPages = Math.ceil(roles.length / pageSize) || 1;
  const paginatedRoles = roles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Roles & Permission</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your roles</p>
          </div>

          <div className="flex items-center gap-2">
            {/* PDF Export */}
            <button
              onClick={() => window.print()}
              title="Export to PDF"
              className="w-8 h-8 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Excel Export */}
            <button
              onClick={() => alert("Exporting Roles to Excel (.xlsx)...")}
              title="Export to Excel"
              className="w-8 h-8 flex items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            {/* Refresh */}
            <button
              onClick={() => loadData()}
              title="Refresh"
              className="w-8 h-8 flex items-center justify-center rounded bg-white text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Collapse */}
            <button
              title="Collapse"
              className="w-8 h-8 flex items-center justify-center rounded bg-white text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Add Role Button */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fe9f43] hover:bg-[#e88e35] text-white text-xs font-medium rounded-md shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Role</span>
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          {/* Top Filter Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
              />
            </div>

            {/* Status Dropdown Filter */}
            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-36 px-3 py-1.5 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43] text-gray-700 bg-white"
              >
                <option value="all">Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-[12px] font-semibold text-gray-700 bg-gray-50/50">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        roles.length > 0 && selectedIds.length === roles.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 min-w-[160px]">Role</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RotateCcw className="w-5 h-5 animate-spin text-[#fe9f43]" />
                        <span>Loading roles...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRoles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  paginatedRoles.map((role) => (
                    <tr
                      key={role.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(role.id)}
                          onChange={() => handleSelectOne(role.id)}
                          className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                        />
                      </td>

                      {/* Role Name */}
                      <td className="py-3.5 px-4 font-semibold text-gray-800 text-[13px]">
                        {role.name}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-gray-600">
                        {role.createdDate || "12 Sep 2024"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {role.status === "ACTIVE" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#28C76F] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 inline-block" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5 inline-block" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Permissions Shield */}
                          <button
                            onClick={() => handleOpenPermissionModal(role)}
                            title="Manage Permissions"
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-[#fe9f43] hover:border-[#fe9f43] transition-colors"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(role)}
                            title="Edit Role"
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-[#28C76F] hover:border-[#28C76F] transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleOpenDeleteModal(role)}
                            title="Delete Role"
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-500 transition-colors"
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

          {/* Table Footer / Pagination */}
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>Row Per Page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-700 bg-white focus:outline-none focus:border-[#fe9f43]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>Entries</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
                    currentPage === idx + 1
                      ? "bg-[#fe9f43] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PERMISSIONS MATRIX MODAL ==================== */}
      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Role Permissions: <span className="text-[#fe9f43]">{selectedRole.name}</span>
                </h2>
                <p className="text-xs text-gray-500">Configure access level and operations per module</p>
              </div>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-xs font-semibold text-gray-700">Allow All Permissions</span>
                <button
                  type="button"
                  onClick={toggleAllModulesAll}
                  className="text-xs font-medium text-[#fe9f43] hover:underline"
                >
                  {permissionsMatrix.every((m) => m.all) ? "Uncheck All" : "Select All"}
                </button>
              </div>

              {/* Permission Table */}
              <div className="border border-gray-100 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[480px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 font-semibold">
                      <th className="py-2.5 px-4">Modules</th>
                      <th className="py-2.5 px-3 text-center">All</th>
                      <th className="py-2.5 px-3 text-center">View</th>
                      <th className="py-2.5 px-3 text-center">Create</th>
                      <th className="py-2.5 px-3 text-center">Edit</th>
                      <th className="py-2.5 px-3 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {permissionsMatrix.map((item, idx) => (
                      <tr key={item.module} className="hover:bg-gray-50/60">
                        <td className="py-2.5 px-4 font-medium text-gray-800">
                          {item.module}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.all}
                            onChange={() => toggleAllInRow(idx)}
                            className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.view}
                            onChange={() => toggleSinglePermission(idx, "view")}
                            className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.create}
                            onChange={() => toggleSinglePermission(idx, "create")}
                            className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.edit}
                            onChange={() => toggleSinglePermission(idx, "edit")}
                            className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.delete}
                            onChange={() => toggleSinglePermission(idx, "delete")}
                            className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSavePermissions}
                className="px-4 py-2 text-xs font-medium text-white bg-[#fe9f43] hover:bg-[#e88e35] rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Permissions"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD ROLE MODAL ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">Add Role</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Manager"
                  value={formRoleName}
                  onChange={(e) => setFormRoleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Role responsibilities and notes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43] bg-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#fe9f43] hover:bg-[#e88e35] rounded-md transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT ROLE MODAL ==================== */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">Edit Role</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formRoleName}
                  onChange={(e) => setFormRoleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43] bg-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#fe9f43] hover:bg-[#e88e35] rounded-md transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE ROLE MODAL ==================== */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Delete Role?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete role{" "}
              <span className="font-semibold text-gray-800">{selectedRole.name}</span>?
              Users assigned to this role will lose permissions.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
