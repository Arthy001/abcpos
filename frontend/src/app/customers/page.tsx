"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { Customer } from "@/types";
import {
  fetchCustomers,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
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
  Mail,
  Phone,
  Globe,
  MapPin,
  Award,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("" );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>("");
  const [formCode, setFormCode] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formCountry, setFormCountry] = useState<string>("");
  const [formCity, setFormCity] = useState<string>("");
  const [formAddress, setFormAddress] = useState<string>("");
  const [formAvatar, setFormAvatar] = useState<string>("/assets/images/customer11.jpg");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sample customers fallback matching screenshot
  const sampleCustomers: Customer[] = [
    { id: "1", code: "CU001", name: "Carl Evans", email: "carlevans@example.com", phone: "+12163547758", country: "Germany", avatar: "/assets/images/customer11.jpg", status: "ACTIVE", points: 150 },
    { id: "2", code: "CU002", name: "Minerva Rameriz", email: "rameriz@example.com", phone: "+11367529510", country: "Japan", avatar: "/assets/images/customer12.jpg", status: "ACTIVE", points: 280 },
    { id: "3", code: "CU003", name: "Robert Lamon", email: "robert@example.com", phone: "+15362789414", country: "USA", avatar: "/assets/images/customer13.jpg", status: "ACTIVE", points: 420 },
    { id: "4", code: "CU004", name: "Patricia Lewis", email: "patricia@example.com", phone: "+18513094627", country: "Austria", avatar: "/assets/images/customer14.jpg", status: "ACTIVE", points: 90 },
    { id: "5", code: "CU005", name: "Mark Joslyn", email: "markjoslyn@example.com", phone: "+14678219025", country: "Turkey", avatar: "/assets/images/customer15.jpg", status: "ACTIVE", points: 310 },
    { id: "6", code: "CU006", name: "Marsha Betts", email: "marshabetts@example.com", phone: "+10913278319", country: "Mexico", avatar: "/assets/images/customer16.jpg", status: "ACTIVE", points: 195 },
    { id: "7", code: "CU007", name: "Daniel Jude", email: "daieljude@example.com", phone: "+19125852947", country: "France", avatar: "/assets/images/customer17.jpg", status: "ACTIVE", points: 550 },
    { id: "8", code: "CU008", name: "Emma Bates", email: "emmabates@example.com", phone: "+13671835209", country: "Greece", avatar: "/assets/images/customer18.jpg", status: "ACTIVE", points: 80 },
    { id: "9", code: "CU009", name: "Richard Fralick", email: "richard@example.com", phone: "+19756194733", country: "Italy", avatar: "/assets/images/avatar-01.jpg", status: "ACTIVE", points: 620 },
    { id: "10", code: "CU010", name: "Michelle Robison", email: "robinson@example.com", phone: "+19167850925", country: "China", avatar: "/assets/images/avatar-02.jpg", status: "ACTIVE", points: 110 },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers({ status: statusFilter, search });
      if (data && data.length > 0) {
        setCustomers(data);
      } else if (!search && statusFilter === "all") {
        setCustomers(sampleCustomers);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error(err);
      setCustomers(sampleCustomers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormName("");
    const nextNum = customers.length + 1;
    setFormCode(`CU${String(nextNum).padStart(3, "0")}`);
    setFormEmail("");
    setFormPhone("");
    setFormCountry("");
    setFormCity("");
    setFormAddress("");
    setFormAvatar("/assets/images/customer11.jpg");
    setFormStatus("ACTIVE");
    setShowFormModal(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormCode(cust.code || "");
    setFormEmail(cust.email || "");
    setFormPhone(cust.phone || "");
    setFormCountry(cust.country || "");
    setFormCity(cust.city || "");
    setFormAddress(cust.address || "");
    setFormAvatar(cust.avatar || "/assets/images/customer11.jpg");
    setFormStatus(cust.status || "ACTIVE");
    setShowFormModal(true);
  };

  const handleOpenViewModal = (cust: Customer) => {
    setViewingCustomer(cust);
    setShowViewModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter Customer Name");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCustomer) {
        await updateCustomerApi(editingCustomer.id, {
          name: formName,
          code: formCode,
          email: formEmail,
          phone: formPhone,
          country: formCountry,
          city: formCity,
          address: formAddress,
          avatar: formAvatar,
          status: formStatus,
        });
      } else {
        await createCustomerApi({
          name: formName,
          code: formCode,
          email: formEmail,
          phone: formPhone,
          country: formCountry,
          city: formCity,
          address: formAddress,
          avatar: formAvatar,
          status: formStatus,
        });
      }
      setShowFormModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer "${name}"?`)) {
      try {
        await deleteCustomerApi(id);
        loadData();
      } catch (err: any) {
        // If it's a sample fallback customer, remove locally
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      }
    }
  };

  const displayList = customers.length > 0 ? customers : sampleCustomers;

  const filteredDisplay = displayList.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      (item.code && item.code.toLowerCase().includes(term)) ||
      (item.email && item.email.toLowerCase().includes(term)) ||
      (item.phone && item.phone.toLowerCase().includes(term)) ||
      (item.country && item.country.toLowerCase().includes(term));
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
      setSelectedIds(paginatedList.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const headers = ["Code,Customer Name,Email,Phone,Country,Status"];
    const rows = filteredDisplay.map(
      (c) => `"${c.code || ""}","${c.name}","${c.email || ""}","${c.phone || ""}","${c.country || ""}","${c.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export / Print PDF
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Customers</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your customers</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export Button (Red) */}
            <button
              onClick={handleExportPDF}
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

            {/* + Add Customer Button (Orange) */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Customers Table Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
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
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
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
                  <th className="py-3 px-4 font-bold text-[#111827]">Code</th>
                  <th className="py-3 px-4 font-bold text-[#111827] min-w-[160px]">Customer</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Email</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Phone</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Country</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827] w-28">Action</th>
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

                      {/* Code */}
                      <td className="py-3 px-4 font-medium text-[#1E293B]">
                        {item.code || "-"}
                      </td>

                      {/* Customer: Avatar + Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                            {item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to initial
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#FE9F43]/10 text-[#FE9F43] font-bold text-xs">
                                {item.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-[#1E293B]">{item.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-[#64748B]">{item.email || "-"}</td>

                      {/* Phone */}
                      <td className="py-3 px-4 text-[#64748B]">{item.phone || "-"}</td>

                      {/* Country */}
                      <td className="py-3 px-4 text-[#64748B]">{item.country || "-"}</td>

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

                      {/* Actions: View, Edit, Delete (Square Rounded Box Icons) */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View */}
                          <button
                            onClick={() => handleOpenViewModal(item)}
                            title="View Details"
                            className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#1E293B] flex items-center justify-center transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Customer"
                            className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#FE9F43] flex items-center justify-center transition-colors shadow-2xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            title="Delete Customer"
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
                    <td colSpan={8} className="text-center py-12 text-[#94A3B8]">
                      No customers found.
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

        {/* ================= Add / Edit Customer Modal ================= */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingCustomer ? "Edit Customer" : "Add Customer"}
                </h3>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomer} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Carl Evans"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Customer Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CU001"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Email</label>
                    <input
                      type="email"
                      placeholder="e.g. carlevans@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +12163547758"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Country</label>
                    <input
                      type="text"
                      placeholder="e.g. Germany, Japan, USA"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Berlin, Tokyo, New York"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Main Street"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                {/* Avatar Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Choose Avatar</label>
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
                        onClick={() => setFormAvatar(av)}
                        className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all ${
                          formAvatar === av
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
                        name="customerStatus"
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
                        name="customerStatus"
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
                    {isSubmitting ? "Saving..." : editingCustomer ? "Update Customer" : "Add Customer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= View Customer Details Modal ================= */}
        {showViewModal && viewingCustomer && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Customer Profile</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Card Header */}
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-white">
                  {viewingCustomer.avatar ? (
                    <img
                      src={viewingCustomer.avatar}
                      alt={viewingCustomer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FE9F43] text-white font-bold text-lg">
                      {viewingCustomer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-gray-900 text-sm">{viewingCustomer.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-white text-[#FE9F43] border border-orange-200">
                      {viewingCustomer.code || "CU000"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    {viewingCustomer.status === "ACTIVE" ? (
                      <span className="inline-flex items-center text-[10px] font-semibold text-[#28C76F]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active Member
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-semibold text-gray-500">
                        <XCircle className="w-3 h-3 mr-1" /> Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact & Location Info */}
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Mail className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Email Address</p>
                    <p className="font-semibold text-gray-800">{viewingCustomer.email || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Phone className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Phone Number</p>
                    <p className="font-semibold text-gray-800">{viewingCustomer.phone || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Globe className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Country & City</p>
                    <p className="font-semibold text-gray-800">
                      {viewingCustomer.country || "-"}
                      {viewingCustomer.city ? `, ${viewingCustomer.city}` : ""}
                    </p>
                  </div>
                </div>

                {viewingCustomer.address && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <MapPin className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Address</p>
                      <p className="font-semibold text-gray-800">{viewingCustomer.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Award className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Reward Points</p>
                    <p className="font-semibold text-[#FE9F43]">{viewingCustomer.points || 0} pts</p>
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
