"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Employee } from "@/types";
import {
  fetchEmployees,
  createEmployeeApi,
  updateEmployeeApi,
  deleteEmployeeApi,
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
  Users,
  UserCheck,
  UserX,
  UserPlus,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState({
    total: 1007,
    active: 1007,
    inactive: 1007,
    newJoiners: 67,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [desigFilter, setDesigFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>("");
  const [formEmpId, setFormEmpId] = useState<string>("");
  const [formRole, setFormRole] = useState<string>("System Admin");
  const [formDepartment, setFormDepartment] = useState<string>("HR");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formJoinedDate, setFormJoinedDate] = useState<string>("30 May 2023");
  const [formAvatar, setFormAvatar] = useState<string>("/assets/images/customer11.jpg");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE" | "NEW_JOINER">("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sample fallback matching screenshot
  const sampleEmployees: Employee[] = [
    { id: "1", empId: "POS001", name: "Anthony Lewis", avatar: "/assets/images/customer11.jpg", role: "System Admin", department: "HR", joinedDate: "30 May 2023", email: "anthony@example.com", phone: "+12498345785", status: "ACTIVE" },
    { id: "2", empId: "POS002", name: "Brian Villalobos", avatar: "/assets/images/customer12.jpg", role: "Software Developer", department: "UI/UX", joinedDate: "30 May 2023", email: "brian@example.com", phone: "+13178964582", status: "ACTIVE" },
    { id: "3", empId: "POS003", name: "Harvey Smith", avatar: "/assets/images/customer13.jpg", role: "System Admin", department: "Admin", joinedDate: "30 May 2023", email: "harvey@example.com", phone: "+12796183487", status: "ACTIVE" },
    { id: "4", empId: "POS004", name: "Stephan Peralt", avatar: "/assets/images/customer14.jpg", role: "System Admin", department: "Admin", joinedDate: "30 May 2023", email: "stephan@example.com", phone: "+17538647943", status: "ACTIVE" },
    { id: "5", empId: "POS005", name: "Doglas Martini", avatar: "/assets/images/customer15.jpg", role: "System Admin", department: "IT", joinedDate: "30 May 2023", email: "doglas@example.com", phone: "+13798132475", status: "ACTIVE" },
    { id: "6", empId: "POS006", name: "Linda Ray", avatar: "/assets/images/customer16.jpg", role: "System Admin", department: "Support", joinedDate: "30 May 2023", email: "linda@example.com", phone: "+17596341894", status: "ACTIVE" },
    { id: "7", empId: "POS007", name: "Elliot Murray", avatar: "/assets/images/customer17.jpg", role: "System Admin", department: "UI/UX", joinedDate: "30 May 2023", email: "elliot@example.com", phone: "+12973548678", status: "ACTIVE" },
    { id: "8", empId: "POS008", name: "Rebecca Smtih", avatar: "/assets/images/customer18.jpg", role: "System Admin", department: "HR", joinedDate: "30 May 2023", email: "rebecca@example.com", phone: "+13147858357", status: "ACTIVE" },
  ];

  const designationOptions = [
    "System Admin",
    "Software Developer",
    "HR Manager",
    "Sales Manager",
    "Accountant",
    "QA Analyst",
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchEmployees({
        status: statusFilter,
        role: desigFilter,
        search,
      });
      if (res.employees && res.employees.length > 0) {
        setEmployees(res.employees);
        setStats(res.stats);
      } else if (!search && statusFilter === "all" && desigFilter === "all") {
        setEmployees(sampleEmployees);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error(err);
      setEmployees(sampleEmployees);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, desigFilter, search]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormName("");
    const nextNum = employees.length + 1;
    setFormEmpId(`POS${String(nextNum).padStart(3, "0")}`);
    setFormRole("System Admin");
    setFormDepartment("HR");
    setFormEmail("");
    setFormPhone("");
    setFormJoinedDate("30 May 2023");
    setFormAvatar("/assets/images/customer11.jpg");
    setFormStatus("ACTIVE");
    setShowFormModal(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormEmpId(emp.empId || "");
    setFormRole(emp.role || "System Admin");
    setFormDepartment(emp.department || "HR");
    setFormEmail(emp.email || "");
    setFormPhone(emp.phone || "");
    setFormJoinedDate(emp.joinedDate || "30 May 2023");
    setFormAvatar(emp.avatar || "/assets/images/customer11.jpg");
    setFormStatus(emp.status || "ACTIVE");
    setShowFormModal(true);
  };

  const handleOpenViewModal = (emp: Employee) => {
    setViewingEmployee(emp);
    setShowViewModal(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter Employee Name");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingEmployee) {
        await updateEmployeeApi(editingEmployee.id, {
          name: formName,
          empId: formEmpId,
          role: formRole,
          department: formDepartment,
          email: formEmail,
          phone: formPhone,
          joinedDate: formJoinedDate,
          avatar: formAvatar,
          status: formStatus,
        });
      } else {
        await createEmployeeApi({
          name: formName,
          empId: formEmpId,
          role: formRole,
          department: formDepartment,
          email: formEmail,
          phone: formPhone,
          joinedDate: formJoinedDate,
          avatar: formAvatar,
          status: formStatus,
        });
      }
      setShowFormModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete employee "${name}"?`)) {
      try {
        await deleteEmployeeApi(id);
        loadData();
      } catch (err: any) {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
      }
    }
  };

  const displayList = employees.length > 0 ? employees : sampleEmployees;

  const filteredDisplay = displayList.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      (item.empId && item.empId.toLowerCase().includes(term)) ||
      (item.department && item.department.toLowerCase().includes(term)) ||
      (item.role && item.role.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesDesig = desigFilter === "all" || item.role === desigFilter;
    return matchesSearch && matchesStatus && matchesDesig;
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = ["EMP ID,Name,Role,Department,Email,Phone,Joined Date,Status"];
    const rows = filteredDisplay.map(
      (e) => `"${e.empId || ""}","${e.name}","${e.role || ""}","${e.department || ""}","${e.email || ""}","${e.phone || ""}","${e.joinedDate || ""}","${e.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Employees</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your employees</p>
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

            {/* + Add Employee Button (Orange) */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Employee (Purple) */}
          <div className="bg-[#7367F0] text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-white/80 font-medium">Total Employee</p>
              <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Card 2: Active (Teal/Emerald) */}
          <div className="bg-[#28C76F] text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-white/80 font-medium">Active</p>
              <h3 className="text-2xl font-bold mt-1">{stats.active}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Card 3: Inactive (Dark Navy) */}
          <div className="bg-[#1E293B] text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-white/80 font-medium">Inactive</p>
              <h3 className="text-2xl font-bold mt-1">{stats.inactive}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserX className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Card 4: New Joiners (Blue) */}
          <div className="bg-[#00CFE8] text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs text-white/80 font-medium">New Joiners</p>
              <h3 className="text-2xl font-bold mt-1">{stats.newJoiners}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
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
                <option value="all">Select Employees</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={desigFilter}
                onChange={(e) => setDesigFilter(e.target.value)}
                className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
              >
                <option value="all">Designation</option>
                {designationOptions.map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Grid Card View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDisplay.map((emp) => {
              const isSelected = selectedIds.includes(emp.id);

              return (
                <div
                  key={emp.id}
                  className={`bg-white rounded-xl border transition-all hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
                    isSelected ? "border-[#FE9F43] bg-[#FFF8F2]" : "border-[#E9ECEF]"
                  }`}
                >
                  {/* Card Header with Checkbox & More Actions */}
                  <div className="flex items-center justify-between p-3 pb-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(emp.id)}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenViewModal(emp)}
                        title="View Details"
                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        title="Edit Employee"
                        className="p-1 rounded text-gray-400 hover:text-[#FE9F43] hover:bg-gray-100"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        title="Delete Employee"
                        className="p-1 rounded text-gray-400 hover:text-[#EF4444] hover:bg-gray-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 pt-1 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-100 p-0.5 bg-orange-50 mb-2">
                      <img
                        src={emp.avatar || "/assets/images/customer11.jpg"}
                        alt={emp.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-mono font-bold text-[#FE9F43]">
                      EMP ID : {emp.empId || "POS001"}
                    </p>
                    <h4 className="text-sm font-bold text-[#1E293B] mt-0.5">{emp.name}</h4>
                    <span className="mt-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                      {emp.role || "Employee"}
                    </span>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-[#F1F3F5] px-4 py-2.5 text-xs text-[#64748B] flex items-center justify-between bg-gray-50/50">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Joined</span>
                      <span className="font-medium text-gray-800">{emp.joinedDate || "30 May 2023"}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Department</span>
                      <span className="font-medium text-gray-800">{emp.department || "HR"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List / Table View */
          <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredDisplay.length && filteredDisplay.length > 0}
                        onChange={() => {
                          if (selectedIds.length === filteredDisplay.length) setSelectedIds([]);
                          else setSelectedIds(filteredDisplay.map((e) => e.id));
                        }}
                        className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                      />
                    </th>
                    <th className="py-3 px-4 font-bold text-[#111827]">EMP ID</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Employee</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Designation</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Department</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Email</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Phone</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Joined Date</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                    <th className="py-3 px-4 text-right font-bold text-[#111827]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {filteredDisplay.map((emp) => {
                    const isSelected = selectedIds.includes(emp.id);

                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-[#F9FAFB] transition-colors ${
                          isSelected ? "bg-[#FFF8F2]" : ""
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(emp.id)}
                            className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-[#FE9F43]">{emp.empId}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={emp.avatar || "/assets/images/customer11.jpg"}
                              alt={emp.name}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200"
                            />
                            <span className="font-medium text-[#1E293B]">{emp.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">{emp.role}</td>
                        <td className="py-3 px-4 text-[#64748B]">{emp.department}</td>
                        <td className="py-3 px-4 text-[#64748B]">{emp.email || "-"}</td>
                        <td className="py-3 px-4 text-[#64748B]">{emp.phone || "-"}</td>
                        <td className="py-3 px-4 text-[#64748B]">{emp.joinedDate || "30 May 2023"}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenViewModal(emp)}
                              title="View Details"
                              className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#1E293B] flex items-center justify-center transition-colors shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              title="Edit Employee"
                              className="w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#FE9F43] flex items-center justify-center transition-colors shadow-2xs"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id, emp.name)}
                              title="Delete Employee"
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

        {/* ================= Add / Edit Employee Modal ================= */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingEmployee ? "Edit Employee" : "Add Employee"}
                </h3>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEmployee} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">
                      Employee Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anthony Lewis"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">EMP ID</label>
                    <input
                      type="text"
                      placeholder="e.g. POS001"
                      value={formEmpId}
                      onChange={(e) => setFormEmpId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Role / Designation</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    >
                      {designationOptions.map((desig) => (
                        <option key={desig} value={desig}>
                          {desig}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. HR, IT, Admin"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Email</label>
                    <input
                      type="email"
                      placeholder="e.g. anthony@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43] focus:bg-white"
                    />
                  </div>

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
                    {isSubmitting ? "Saving..." : editingEmployee ? "Update Employee" : "Add Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= View Employee Details Modal ================= */}
        {showViewModal && viewingEmployee && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Employee Profile</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-white">
                  <img
                    src={viewingEmployee.avatar || "/assets/images/customer11.jpg"}
                    alt={viewingEmployee.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-gray-900 text-sm">{viewingEmployee.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-white text-[#FE9F43] border border-orange-200">
                      {viewingEmployee.empId || "POS001"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{viewingEmployee.role || "Employee"}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="inline-flex items-center text-[10px] font-semibold text-[#28C76F]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Active Staff
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Briefcase className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Department</p>
                    <p className="font-semibold text-gray-800">{viewingEmployee.department || "General"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Mail className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Email</p>
                    <p className="font-semibold text-gray-800">{viewingEmployee.email || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Phone className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Phone</p>
                    <p className="font-semibold text-gray-800">{viewingEmployee.phone || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Calendar className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Joined Date</p>
                    <p className="font-semibold text-gray-800">{viewingEmployee.joinedDate || "30 May 2023"}</p>
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
