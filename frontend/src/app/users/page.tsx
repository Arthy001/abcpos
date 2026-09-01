"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { SystemUser, Warehouse, Store, Role } from "@/types";
import {
  fetchUsers,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  fetchWarehouses,
  fetchStores,
  fetchRoles,
} from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  PlusCircle,
  Download,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Warehouse as WarehouseIcon,
  Store as StoreIcon,
  Mail,
  Phone,
  Lock,
  EyeOff,
  UserCheck,
  UserX,
  UserPlus,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Form Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  // Delete State
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form Fields
  const [formName, setFormName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formRole, setFormRole] = useState<string>("Admin");
  const [formWarehouse, setFormWarehouse] = useState<string>("");
  const [formStore, setFormStore] = useState<string>("");
  const [formAvatar, setFormAvatar] = useState<string>("/assets/images/avatar-01.jpg");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [formPassword, setFormPassword] = useState<string>("");
  const [formConfirmPassword, setFormConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Feedback Modal State conforming to GEMINI.md
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

  const availableAvatars = [
    "/assets/images/avatar-01.jpg",
    "/assets/images/avatar-02.jpg",
    "/assets/images/avatar-03.jpg",
    "/assets/images/customer11.jpg",
    "/assets/images/customer12.jpg",
    "/assets/images/customer13.jpg",
    "/assets/images/customer14.jpg",
    "/assets/images/customer15.jpg",
    "/assets/images/customer16.jpg",
    "/assets/images/customer17.jpg",
    "/assets/images/customer18.jpg",
  ];

  const defaultRoleList = [
    "Admin",
    "Manager",
    "Store Keeper",
    "Warehouse Supervisor",
    "Purchase Officer",
    "Cashier",
    "Salesman",
    "Inventory Auditor",
    "Delivery Biker",
    "Accountant",
    "Maintenance",
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, whData, storeData, roleData] = await Promise.all([
        fetchUsers({
          status: statusFilter,
          role: roleFilter,
          warehouse: warehouseFilter,
          search,
        }),
        fetchWarehouses(),
        fetchStores(),
        fetchRoles(),
      ]);
      setUsers(userData || []);
      setWarehouses(whData || []);
      setStores(storeData || []);
      setRoles(roleData || []);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Load Users",
        message: err.message || "An error occurred while loading system users.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, roleFilter, warehouseFilter, search]);

  // Combined Roles from DB + Defaults
  const combinedRoleOptions = useMemo(() => {
    const roleNamesFromDb = roles.map((r) => r.name);
    const set = new Set([...roleNamesFromDb, ...defaultRoleList]);
    return Array.from(set);
  }, [roles]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        search === "" ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone && u.phone.includes(search)) ||
        u.role.toLowerCase().includes(search.toLowerCase()) ||
        (u.warehouseName && u.warehouseName.toLowerCase().includes(search.toLowerCase())) ||
        (u.storeName && u.storeName.toLowerCase().includes(search.toLowerCase()));

      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchWh = warehouseFilter === "all" || u.warehouseName === warehouseFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;

      return matchSearch && matchRole && matchWh && matchStatus;
    });
  }, [users, search, roleFilter, warehouseFilter, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Select all handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("Store Keeper");
    setFormWarehouse(warehouses.length > 0 ? warehouses[0].name : "Lavish Warehouse");
    setFormStore(stores.length > 0 ? stores[0].name : "ElectroMart Main");
    setFormAvatar(availableAvatars[Math.floor(Math.random() * availableAvatars.length)]);
    setFormStatus("ACTIVE");
    setFormPassword("");
    setFormConfirmPassword("");
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: SystemUser) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || "");
    setFormRole(user.role);
    setFormWarehouse(user.warehouseName || "");
    setFormStore(user.storeName || "");
    setFormAvatar(user.avatar || "/assets/images/avatar-01.jpg");
    setFormStatus(user.status);
    setFormPassword("");
    setFormConfirmPassword("");
    setShowEditModal(true);
  };

  // Open View Modal
  const handleOpenViewModal = (user: SystemUser) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Submit Add User
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please enter the user's full name.",
      });
      return;
    }
    if (!formEmail.trim()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please enter a valid email address.",
      });
      return;
    }
    if (formPassword && formPassword !== formConfirmPassword) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Password Mismatch",
        message: "The entered passwords do not match. Please verify and try again.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<SystemUser> = {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        warehouseName: formWarehouse || undefined,
        storeName: formStore || undefined,
        avatar: formAvatar,
        status: formStatus,
        password: formPassword || undefined,
      };

      await createUserApi(payload);
      setShowAddModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "User Created!",
        message: `User account for "${formName}" has been successfully created.`,
        itemName: formName,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to create user account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit User
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!formName.trim()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please enter the user's full name.",
      });
      return;
    }
    if (formPassword && formPassword !== formConfirmPassword) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Password Mismatch",
        message: "The entered passwords do not match. Please verify and try again.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<SystemUser> = {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        warehouseName: formWarehouse || undefined,
        storeName: formStore || undefined,
        avatar: formAvatar,
        status: formStatus,
        password: formPassword ? formPassword : undefined,
      };

      await updateUserApi(selectedUser.id, payload);
      setShowEditModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "User Updated!",
        message: `User account "${formName}" has been updated successfully.`,
        itemName: formName,
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to update user account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete User Flow
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    const name = deletingUser.name;
    try {
      setIsDeleting(true);
      await deleteUserApi(deletingUser.id);
      setDeletingUser(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "User Deleted!",
        message: `User account "${name}" has been deleted from the system.`,
        itemName: name,
      });
      loadData();
    } catch (err: any) {
      setDeletingUser(null);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to delete user account.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredUsers.length === 0) {
      alert("No user data available to export.");
      return;
    }
    const headers = ["Name", "Email", "Phone", "Role", "Warehouse", "Store", "Status"];
    const rows = filteredUsers.map((u) => [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.phone || "-"}"`,
      `"${u.role}"`,
      `"${u.warehouseName || "-"}"`,
      `"${u.storeName || "-"}"`,
      u.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `system_users_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Users List</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Manage system users, assigned roles, warehouses, and branches
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export */}
            <button
              title="Export PDF / Print"
              onClick={() => window.print()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel Export */}
            <button
              title="Export CSV"
              onClick={exportCSV}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>

            {/* Refresh */}
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
            </button>

            {/* + Add User Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Search & 3 Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-64">
              <input
                type="text"
                placeholder="Search user name, email, role..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Role Filter */}
              <div className="w-40">
                <SearchableSelect
                  placeholder="Role: All"
                  value={roleFilter}
                  onChange={(val) => {
                    setRoleFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Role: All" },
                    ...combinedRoleOptions.map((r) => ({ value: r, label: r })),
                  ]}
                />
              </div>

              {/* Warehouse Filter */}
              <div className="w-44">
                <SearchableSelect
                  placeholder="Warehouse: All"
                  value={warehouseFilter}
                  onChange={(val) => {
                    setWarehouseFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Warehouse: All" },
                    ...warehouses.map((w) => ({ value: w.name, label: w.name })),
                  ]}
                />
              </div>

              {/* Status Filter */}
              <div className="w-36">
                <SearchableSelect
                  placeholder="Status: All"
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "Status: All" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-2 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        paginatedUsers.length > 0 &&
                        paginatedUsers.every((u) => selectedIds.includes(u.id))
                      }
                      onChange={handleSelectAll}
                      className="rounded border-[#D1D5DB] text-[#FE9F43] focus:ring-[#FE9F43] w-3.5 h-3.5"
                    />
                  </th>
                  <th className="py-2.5 px-3 font-semibold">User Name</th>
                  <th className="py-2.5 px-3 font-semibold">Phone</th>
                  <th className="py-2.5 px-3 font-semibold">Email</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Warehouse / Store</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F5]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <RotateCcw className="w-5 h-5 animate-spin mx-auto text-[#FE9F43] mb-2" />
                      Loading user accounts...
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const isSelected = selectedIds.includes(user.id);
                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-[#F8FAFC] transition-colors ${
                          isSelected ? "bg-orange-50/30" : ""
                        }`}
                      >
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(user.id)}
                            className="rounded border-[#D1D5DB] text-[#FE9F43] focus:ring-[#FE9F43] w-3.5 h-3.5"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              <img
                                src={user.avatar || "/assets/images/avatar-01.jpg"}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-bold text-[#111827]">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-[#4B5563] font-mono text-[11px]">
                          {user.phone || "-"}
                        </td>
                        <td className="py-2 px-3 text-[#4B5563]">{user.email}</td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            <Shield className="w-3 h-3 mr-1 text-[#FE9F43]" />
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex flex-col space-y-0.5">
                            {user.warehouseName ? (
                              <span className="text-[11px] font-medium text-gray-800 flex items-center">
                                <WarehouseIcon className="w-3 h-3 text-[#3B82F6] mr-1 shrink-0" />
                                {user.warehouseName}
                              </span>
                            ) : null}
                            {user.storeName ? (
                              <span className="text-[10px] text-gray-500 flex items-center">
                                <StoreIcon className="w-2.5 h-2.5 text-emerald-500 mr-1 shrink-0" />
                                {user.storeName}
                              </span>
                            ) : null}
                            {!user.warehouseName && !user.storeName && (
                              <span className="text-[11px] text-gray-400 italic">Central / All</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          {user.status === "ACTIVE" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#137333] mr-1"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE8E6] text-[#C5221F]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C5221F] mr-1"></span>
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {/* Standard Action Order: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* View Button */}
                            <button
                              onClick={() => handleOpenViewModal(user)}
                              title="View Profile"
                              className="w-7 h-7 rounded-lg border border-[#E5E7EB] hover:bg-gray-100 text-[#6B7280] hover:text-[#111827] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(user)}
                              title="Edit User"
                              className="w-7 h-7 rounded-lg border border-[#E5E7EB] hover:bg-gray-100 text-[#6B7280] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeletingUser(user)}
                              title="Delete User"
                              className="w-7 h-7 rounded-lg border border-[#E5E7EB] hover:bg-rose-50 text-[#6B7280] hover:text-[#EF4444] flex items-center justify-center transition-colors bg-white cursor-pointer"
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

          {/* Table Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-[#64748B] gap-3 border-t border-[#F1F3F5]">
            <div className="flex items-center space-x-2">
              <span>Row Per Page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#E2E8F0] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>
                Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-semibold flex items-center justify-center transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#FE9F43] text-white"
                        : "border border-gray-200 text-[#64748B] hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ADD USER MODAL */}
        {/* ========================================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Add New User</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitAdd} className="space-y-4">
                {/* Avatar Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Choose Profile Picture</label>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {availableAvatars.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormAvatar(av)}
                        className={`relative w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 transition-all ${
                          formAvatar === av ? "border-[#FE9F43] ring-2 ring-orange-200" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={av} alt="avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      User Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 234 567 890"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      placeholder="Select Role..."
                      value={formRole}
                      onChange={(val) => setFormRole(val)}
                      options={combinedRoleOptions.map((r) => ({ value: r, label: r }))}
                    />
                  </div>
                </div>

                {/* Warehouse & Store Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Assigned Warehouse</label>
                    <SearchableSelect
                      placeholder="Select Warehouse..."
                      value={formWarehouse}
                      onChange={(val) => setFormWarehouse(val)}
                      options={[
                        { value: "", label: "None / Central" },
                        ...warehouses.map((w) => ({ value: w.name, label: w.name })),
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Assigned Store / Branch</label>
                    <SearchableSelect
                      placeholder="Select Store..."
                      value={formStore}
                      onChange={(val) => setFormStore(val)}
                      options={[
                        { value: "", label: "None / Central" },
                        ...stores.map((s) => ({ value: s.name, label: s.name })),
                      ]}
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formConfirmPassword}
                      onChange={(e) => setFormConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Account Status</label>
                  <SearchableSelect
                    placeholder="Select Status..."
                    value={formStatus}
                    onChange={(val) => setFormStatus(val as any)}
                    options={[
                      { value: "ACTIVE", label: "Active" },
                      { value: "INACTIVE", label: "Inactive" },
                    ]}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Create User</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EDIT USER MODAL */}
        {/* ========================================================================= */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <Edit className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Edit User Account</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitEdit} className="space-y-4">
                {/* Avatar Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Change Profile Picture</label>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {availableAvatars.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormAvatar(av)}
                        className={`relative w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 transition-all ${
                          formAvatar === av ? "border-[#FE9F43] ring-2 ring-orange-200" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={av} alt="avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      User Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Role</label>
                    <SearchableSelect
                      placeholder="Select Role..."
                      value={formRole}
                      onChange={(val) => setFormRole(val)}
                      options={combinedRoleOptions.map((r) => ({ value: r, label: r }))}
                    />
                  </div>
                </div>

                {/* Warehouse & Store Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Assigned Warehouse</label>
                    <SearchableSelect
                      placeholder="Select Warehouse..."
                      value={formWarehouse}
                      onChange={(val) => setFormWarehouse(val)}
                      options={[
                        { value: "", label: "None / Central" },
                        ...warehouses.map((w) => ({ value: w.name, label: w.name })),
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Assigned Store / Branch</label>
                    <SearchableSelect
                      placeholder="Select Store..."
                      value={formStore}
                      onChange={(val) => setFormStore(val)}
                      options={[
                        { value: "", label: "None / Central" },
                        ...stores.map((s) => ({ value: s.name, label: s.name })),
                      ]}
                    />
                  </div>
                </div>

                {/* Optional Change Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">New Password (Leave blank to keep)</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Confirm New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formConfirmPassword}
                      onChange={(e) => setFormConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Account Status</label>
                  <SearchableSelect
                    placeholder="Select Status..."
                    value={formStatus}
                    onChange={(val) => setFormStatus(val as any)}
                    options={[
                      { value: "ACTIVE", label: "Active" },
                      { value: "INACTIVE", label: "Inactive" },
                    ]}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW USER PROFILE MODAL */}
        {/* ========================================================================= */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">User Profile Details</h3>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-2 py-2">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-[#FE9F43]/30 shadow-md">
                  <img
                    src={selectedUser.avatar || "/assets/images/avatar-01.jpg"}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">{selectedUser.name}</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-bold bg-orange-50 text-[#FE9F43] border border-orange-200">
                    <Shield className="w-3 h-3 mr-1" />
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Email:
                  </span>
                  <span className="font-bold text-gray-900">{selectedUser.email}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Phone:
                  </span>
                  <span className="font-bold text-gray-900">{selectedUser.phone || "-"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium flex items-center">
                    <WarehouseIcon className="w-3.5 h-3.5 mr-1.5 text-[#3B82F6]" /> Assigned Warehouse:
                  </span>
                  <span className="font-bold text-gray-900">{selectedUser.warehouseName || "Central / All"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium flex items-center">
                    <StoreIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Assigned Store:
                  </span>
                  <span className="font-bold text-gray-900">{selectedUser.storeName || "Central / All"}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500 font-medium">Status:</span>
                  <span className={`font-bold ${selectedUser.status === "ACTIVE" ? "text-emerald-600" : "text-rose-600"}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELETE CONFIRMATION MODAL (Step 1 - Rose) */}
        {/* ========================================================================= */}
        {deletingUser && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
                <Trash2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">Confirm User Deletion</h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to delete user account{" "}
                  <span className="font-bold text-gray-800">"{deletingUser.name}"</span>?
                </p>
                <p className="text-[11px] text-rose-500 font-medium pt-1">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEEDBACK MODALS CONFORMING TO GEMINI.md */}
        {/* ========================================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              {/* 1. Add Success Modal (Sparkles - Emerald) */}
              {feedbackModal.type === "add_success" && (
                <>
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                    <p className="text-xs text-gray-500">{feedbackModal.message}</p>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModal({ ...feedbackModal, isOpen: false });
                        handleOpenAddModal();
                      }}
                      className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      + Add Another
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}

              {/* 2. Edit Success Modal (CheckCircle2 - Blue) */}
              {feedbackModal.type === "edit_success" && (
                <>
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                    <p className="text-xs text-gray-500">{feedbackModal.message}</p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                </>
              )}

              {/* 3. Delete Success Modal (Trash2 - Amber) */}
              {feedbackModal.type === "delete_success" && (
                <>
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
                    <Trash2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                    <p className="text-xs text-gray-500">{feedbackModal.message}</p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                </>
              )}

              {/* 4. Error Modal (AlertTriangle - Rose) */}
              {feedbackModal.type === "error" && (
                <>
                  <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                    <p className="text-xs text-rose-600">{feedbackModal.message}</p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
