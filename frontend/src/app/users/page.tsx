"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { SystemUser } from "@/types";
import {
  fetchUsers,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "@/lib/api";
import {
  Plus,
  Search,
  RotateCcw,
  ChevronUp,
  Edit,
  Trash2,
  Eye,
  X,
  ChevronDown,
  Mail,
  Phone,
  Shield,
  User,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  FileText,
  EyeOff,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formRole, setFormRole] = useState<string>("Admin");
  const [formAvatar, setFormAvatar] = useState<string>("/assets/images/avatar-01.jpg");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [formPassword, setFormPassword] = useState<string>("");
  const [formConfirmPassword, setFormConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const sampleUsers: SystemUser[] = [
    { id: "1", name: "Henry Bryant", phone: "+12498345785", email: "henry@example.com", role: "Admin", avatar: "/assets/images/avatar-01.jpg", status: "ACTIVE" },
    { id: "2", name: "Jenny Ellis", phone: "+13178964582", email: "jenny@example.com", role: "Manager", avatar: "/assets/images/customer12.jpg", status: "ACTIVE" },
    { id: "3", name: "Leon Baxter", phone: "+12796183487", email: "leon@example.com", role: "Salesman", avatar: "/assets/images/customer13.jpg", status: "ACTIVE" },
    { id: "4", name: "Karen Flores", phone: "+17538647943", email: "karen@example.com", role: "Supervisor", avatar: "/assets/images/customer14.jpg", status: "ACTIVE" },
    { id: "5", name: "Michael Dawson", phone: "+13798132475", email: "michael@example.com", role: "Store Keeper", avatar: "/assets/images/customer15.jpg", status: "ACTIVE" },
    { id: "6", name: "Karen Galvan", phone: "+17596341894", email: "galvan@example.com", role: "Purchase", avatar: "/assets/images/customer16.jpg", status: "ACTIVE" },
    { id: "7", name: "Thomas Ward", phone: "+12973548678", email: "thomas@example.com", role: "Delivery Biker", avatar: "/assets/images/avatar-02.jpg", status: "ACTIVE" },
    { id: "8", name: "Aliza Duncan", phone: "+13147858357", email: "aliza@example.com", role: "Maintenance", avatar: "/assets/images/customer17.jpg", status: "ACTIVE" },
    { id: "9", name: "James Higham", phone: "+11978348626", email: "james@example.com", role: "Quality Analyst", avatar: "/assets/images/avatar-03.jpg", status: "ACTIVE" },
    { id: "10", name: "Jada Robinson", phone: "+12678934561", email: "robinson@example.com", role: "Accountant", avatar: "/assets/images/customer18.jpg", status: "ACTIVE" },
  ];

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

  const roleOptions = [
    "Admin",
    "Manager",
    "Salesman",
    "Supervisor",
    "Store Keeper",
    "Inventory Manager",
    "Delivery Biker",
    "Purchase",
    "Maintenance",
    "Quality Analyst",
    "Accountant",
    "Cashier",
    "Employee",
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers({ status: statusFilter, search });
      if (data && data.length > 0) {
        setUsers(data);
      } else if (!search && statusFilter === "all") {
        setUsers(sampleUsers);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setUsers(sampleUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("Admin");
    setFormAvatar(availableAvatars[Math.floor(Math.random() * availableAvatars.length)]);
    setFormStatus("ACTIVE");
    setFormPassword("");
    setFormConfirmPassword("");
    setFormError("");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user: SystemUser) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || "");
    setFormRole(user.role);
    setFormAvatar(user.avatar || "/assets/images/avatar-01.jpg");
    setFormStatus(user.status);
    setFormPassword("");
    setFormConfirmPassword("");
    setFormError("");
    setShowEditModal(true);
  };

  const handleOpenViewModal = (user: SystemUser) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleOpenDeleteModal = (user: SystemUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("User Name is required");
      return;
    }
    if (!formEmail.trim()) {
      setFormError("Email is required");
      return;
    }
    if (formPassword && formPassword !== formConfirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      const payload: Partial<SystemUser> = {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        avatar: formAvatar,
        status: formStatus,
        password: formPassword || undefined,
      };

      try {
        await createUserApi(payload);
      } catch (err) {
        // Fallback local addition if offline
        const localNew: SystemUser = {
          id: String(Date.now()),
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim() || null,
          role: formRole,
          avatar: formAvatar,
          status: formStatus,
        };
        setUsers((prev) => [localNew, ...prev]);
      }
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!formName.trim()) {
      setFormError("User Name is required");
      return;
    }
    if (!formEmail.trim()) {
      setFormError("Email is required");
      return;
    }
    if (formPassword && formPassword !== formConfirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      const payload: Partial<SystemUser> = {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        avatar: formAvatar,
        status: formStatus,
        password: formPassword || undefined,
      };

      try {
        await updateUserApi(selectedUser.id, payload);
      } catch (err) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  name: formName.trim(),
                  email: formEmail.trim(),
                  phone: formPhone.trim() || null,
                  role: formRole,
                  avatar: formAvatar,
                  status: formStatus,
                }
              : u
          )
        );
      }
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      try {
        await deleteUserApi(selectedUser.id);
      } catch (e) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
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
      setSelectedIds(users.map((u) => u.id));
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

  // Pagination calculation
  const totalPages = Math.ceil(users.length / pageSize) || 1;
  const paginatedUsers = users.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Users</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your users</p>
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
              onClick={() => alert("Exporting Users to Excel (.xlsx)...")}
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

            {/* Add User Button */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fe9f43] hover:bg-[#e88e35] text-white text-xs font-medium rounded-md shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[12px] font-semibold text-gray-700 bg-gray-50/50">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        users.length > 0 && selectedIds.length === users.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">User Name</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RotateCcw className="w-5 h-5 animate-spin text-[#fe9f43]" />
                        <span>Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => handleSelectOne(user.id)}
                          className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                        />
                      </td>

                      {/* User Name + Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gray-100 flex-shrink-0 border border-gray-200">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-gray-800 text-[13px]">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-gray-600 font-normal">
                        {user.phone || "-"}
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-gray-600 font-normal">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 text-gray-700 font-medium">
                        {user.role}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {user.status === "ACTIVE" ? (
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
                          {/* View */}
                          <button
                            onClick={() => handleOpenViewModal(user)}
                            title="View Profile"
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-[#fe9f43] hover:border-[#fe9f43] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit User"
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-[#28C76F] hover:border-[#28C76F] transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleOpenDeleteModal(user)}
                            title="Delete User"
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

      {/* ==================== ADD USER MODAL ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">Add User</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {formError}
                </div>
              )}

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {availableAvatars.map((av, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormAvatar(av)}
                      className={`relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        formAvatar === av
                          ? "border-[#fe9f43] scale-105 shadow-sm"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={av} alt="Avatar option" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* User Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1234567890"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43] bg-white"
                  >
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
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
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-8 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT USER MODAL ==================== */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {formError}
                </div>
              )}

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {availableAvatars.map((av, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormAvatar(av)}
                      className={`relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        formAvatar === av
                          ? "border-[#fe9f43] scale-105 shadow-sm"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={av} alt="Avatar option" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* User Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43] bg-white"
                  >
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
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
              </div>

              {/* New Password optional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Password (optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank to keep same"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-8 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
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

      {/* ==================== VIEW USER PROFILE MODAL ==================== */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header with background */}
            <div className="bg-gradient-to-r from-[#fe9f43] to-[#ffb870] px-6 pt-6 pb-12 relative text-white">
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white rounded-full p-1 bg-black/10 hover:bg-black/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-base font-bold">User Profile</h2>
              <p className="text-xs text-white/80">Account details & permissions</p>
            </div>

            {/* Profile Avatar & Details */}
            <div className="px-6 pb-6 relative pt-0">
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden relative border-4 border-white shadow bg-white">
                  {selectedUser.avatar ? (
                    <Image src={selectedUser.avatar} alt={selectedUser.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div>
                  {selectedUser.status === "ACTIVE" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-[#28C76F] text-white">
                      ● Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      ● Inactive
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedUser.name}</h3>
                <p className="text-xs text-[#fe9f43] font-semibold">{selectedUser.role}</p>
              </div>

              <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-xs text-gray-600">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-800">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedUser.phone || "No phone provided"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span>Role: <strong className="text-gray-800">{selectedUser.role}</strong></span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE USER MODAL ==================== */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Delete User?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete user{" "}
              <span className="font-semibold text-gray-800">{selectedUser.name}</span>?
              This action cannot be undone.
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
                {isSubmitting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
