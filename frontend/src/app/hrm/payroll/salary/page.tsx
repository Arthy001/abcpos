"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Payroll } from "@/types";
import {
  fetchPayrolls,
  createPayrollApi,
  updatePayrollApi,
  deletePayrollApi,
} from "@/lib/api";
import {
  PlusCircle,
  Search,
  RotateCcw,
  ChevronUp,
  Edit,
  Trash2,
  X,
  ChevronDown,
  Printer,
  Eye,
  Download,
} from "lucide-react";

export default function EmployeeSalaryPage() {
  const router = useRouter();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);

  // Form State
  const [formEmpCode, setFormEmpCode] = useState<string>("EMP001");
  const [formEmployeeName, setFormEmployeeName] = useState<string>("");
  const [formEmployeeRole, setFormEmployeeRole] = useState<string>("Staff");
  const [formEmployeeAvatar, setFormEmployeeAvatar] = useState<string>("/assets/images/customer11.jpg");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formSalary, setFormSalary] = useState<number>(30000);
  const [formStatus, setFormStatus] = useState<"PAID" | "UNPAID">("PAID");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sample fallback matching screenshot
  const samplePayrolls: Payroll[] = [
    { id: "1", empCode: "EMP001", employeeName: "Carl Evans", employeeRole: "Designer", employeeAvatar: "/assets/images/customer11.jpg", email: "carlevans@example.com", salary: 30000, basicSalary: 32000, status: "PAID" },
    { id: "2", empCode: "EMP002", employeeName: "Minerva Rameriz", employeeRole: "Administrator", employeeAvatar: "/assets/images/customer12.jpg", email: "rameriz@example.com", salary: 20000, basicSalary: 20000, status: "PAID" },
    { id: "3", empCode: "EMP003", employeeName: "Robert Lamon", employeeRole: "Developer", employeeAvatar: "/assets/images/customer13.jpg", email: "robert@example.com", salary: 35000, basicSalary: 35000, status: "PAID" },
    { id: "4", empCode: "EMP004", employeeName: "Patricia Lewis", employeeRole: "HR Manager", employeeAvatar: "/assets/images/customer14.jpg", email: "robert@example.com", salary: 35000, basicSalary: 35000, status: "PAID" },
    { id: "5", empCode: "EMP005", employeeName: "Mark Joslyn", employeeRole: "Designer", employeeAvatar: "/assets/images/customer15.jpg", email: "markjoslyn@example.com", salary: 32000, basicSalary: 32000, status: "PAID" },
    { id: "6", empCode: "EMP006", employeeName: "Marsha Betts", employeeRole: "Developer", employeeAvatar: "/assets/images/customer16.jpg", email: "marshabetts@example.com", salary: 28000, basicSalary: 28000, status: "PAID" },
    { id: "7", empCode: "EMP007", employeeName: "Daniel Jude", employeeRole: "Administrator", employeeAvatar: "/assets/images/customer17.jpg", email: "daieljude@example.com", salary: 25000, basicSalary: 25000, status: "PAID" },
    { id: "8", empCode: "EMP008", employeeName: "Emma Bates", employeeRole: "HR Assistant", employeeAvatar: "/assets/images/customer18.jpg", email: "emmabates@example.com", salary: 21000, basicSalary: 21000, status: "PAID" },
    { id: "9", empCode: "EMP009", employeeName: "Richard Fralick", employeeRole: "Designer", employeeAvatar: "/assets/images/avatar-01.jpg", email: "richard@example.com", salary: 34000, basicSalary: 34000, status: "PAID" },
    { id: "10", empCode: "EMP010", employeeName: "Michelle Robison", employeeRole: "HR Manager", employeeAvatar: "/assets/images/avatar-02.jpg", email: "robinson@example.com", salary: 28000, basicSalary: 28000, status: "UNPAID" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPayrolls({ status: statusFilter, search });
      if (data && data.length > 0) {
        setPayrolls(data);
      } else if (!search && statusFilter === "all") {
        setPayrolls(samplePayrolls);
      } else {
        setPayrolls([]);
      }
    } catch (err) {
      console.error(err);
      setPayrolls(samplePayrolls);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleOpenAddModal = () => {
    setEditingPayroll(null);
    setFormEmpCode(`EMP0${(payrolls.length + 1).toString().padStart(2, "0")}`);
    setFormEmployeeName("");
    setFormEmployeeRole("Designer");
    setFormEmployeeAvatar("/assets/images/customer11.jpg");
    setFormEmail("");
    setFormSalary(30000);
    setFormStatus("PAID");
    setShowModal(true);
  };

  const handleOpenEditModal = (p: Payroll) => {
    setEditingPayroll(p);
    setFormEmpCode(p.empCode);
    setFormEmployeeName(p.employeeName);
    setFormEmployeeRole(p.employeeRole);
    setFormEmployeeAvatar(p.employeeAvatar || "/assets/images/customer11.jpg");
    setFormEmail(p.email);
    setFormSalary(p.salary);
    setFormStatus(p.status);
    setShowModal(true);
  };

  const handleSavePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeName.trim()) {
      alert("Please enter Employee Name");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingPayroll) {
        await updatePayrollApi(editingPayroll.id, {
          salary: formSalary,
          basicSalary: formSalary,
          status: formStatus,
        });
      } else {
        await createPayrollApi({
          empCode: formEmpCode,
          employeeName: formEmployeeName,
          employeeRole: formEmployeeRole,
          employeeAvatar: formEmployeeAvatar,
          email: formEmail || `${formEmployeeName.toLowerCase().replace(/\s+/g, "")}@example.com`,
          salary: formSalary,
          basicSalary: formSalary,
          status: formStatus,
        });
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save payroll record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete payroll record for "${name}"?`)) {
      try {
        await deletePayrollApi(id);
        loadData();
      } catch (err: any) {
        setPayrolls((prev) => prev.filter((p) => p.id !== id));
      }
    }
  };

  const displayList = payrolls.length > 0 ? payrolls : samplePayrolls;

  const filteredDisplay = displayList.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.empCode.toLowerCase().includes(term) ||
      item.employeeName.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.employeeRole.toLowerCase().includes(term);
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
      setSelectedIds(paginatedList.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID,Employee,Role,Email,Salary,Status"];
    const rows = filteredDisplay.map(
      (p) => `"${p.empCode}","${p.employeeName}","${p.employeeRole}","${p.email}","$${p.salary.toLocaleString()}","${p.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employee_salaries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewPayslip = (p: Payroll) => {
    router.push(`/hrm/payroll/payslip?id=${p.id}`);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Employee Salary</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your employee salaries</p>
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

            {/* Print */}
            <button
              onClick={handlePrint}
              title="Print"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
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

            {/* + Add Payroll Button (Orange) */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Payroll</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
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
              {/* Select Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Select Status</option>
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">UnPaid</option>
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
                  <th className="py-3 px-4 font-bold text-[#111827]">ID</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Employee</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Email</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Salary</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
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

                      {/* ID */}
                      <td className="py-3 px-4 text-[#64748B] font-medium">{item.empCode}</td>

                      {/* Employee Avatar + Name + Role */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.employeeAvatar || "/assets/images/customer11.jpg"}
                            alt={item.employeeName}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                          />
                          <div>
                            <span className="font-semibold text-[#1E293B] block">{item.employeeName}</span>
                            <span className="text-[11px] text-[#64748B] block">{item.employeeRole}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-[#64748B]">{item.email}</td>

                      {/* Salary */}
                      <td className="py-3 px-4 text-[#1E293B] font-medium">
                        ${item.salary.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {item.status === "PAID" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EA5455] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            UnPaid
                          </span>
                        )}
                      </td>

                      {/* Actions: View Payslip, Download, Edit, Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View Payslip */}
                          <button
                            onClick={() => handleViewPayslip(item)}
                            title="View Payslip"
                            className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#FE9F43] flex items-center justify-center transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Download Payslip */}
                          <button
                            onClick={() => handleViewPayslip(item)}
                            title="Download Payslip"
                            className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#28C76F] flex items-center justify-center transition-colors shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Payroll"
                            className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#FE9F43] flex items-center justify-center transition-colors shadow-2xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.id, item.employeeName)}
                            title="Delete Payroll"
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

        {/* ================= Add / Edit Payroll Modal ================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingPayroll ? "Edit Payroll" : "Add Payroll"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePayroll} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carl Evans"
                    value={formEmployeeName}
                    onChange={(e) => setFormEmployeeName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Role/Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Designer, Developer"
                      value={formEmployeeRole}
                      onChange={(e) => setFormEmployeeRole(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Monthly Salary ($)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formSalary}
                      onChange={(e) => setFormSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. employee@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                  />
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Payment Status</label>
                  <div className="flex items-center space-x-4 pt-1">
                    <label className="flex items-center space-x-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="payStatus"
                        value="PAID"
                        checked={formStatus === "PAID"}
                        onChange={() => setFormStatus("PAID")}
                        className="accent-[#28C76F]"
                      />
                      <span>Paid</span>
                    </label>
                    <label className="flex items-center space-x-1.5 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="payStatus"
                        value="UNPAID"
                        checked={formStatus === "UNPAID"}
                        onChange={() => setFormStatus("UNPAID")}
                        className="accent-[#EA5455]"
                      />
                      <span>UnPaid</span>
                    </label>
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
                    {isSubmitting ? "Saving..." : editingPayroll ? "Update Payroll" : "Save Payroll"}
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
