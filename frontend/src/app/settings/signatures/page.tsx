"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  DigitalSignature,
  getSignaturesApi,
  createSignatureApi,
  updateSignatureApi,
  setDefaultSignatureApi,
  deleteSignatureApi,
} from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  PenTool,
  Star,
  Loader2,
} from "lucide-react";

export default function SignaturesSettingsPage() {
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<DigitalSignature | null>(null);

  // Delete Flow
  const [itemToDelete, setItemToDelete] = useState<DigitalSignature | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);

  // Feedback Modals
  const [addSuccessOpen, setAddSuccessOpen] = useState(false);
  const [addedItemName, setAddedItemName] = useState("");
  const [editSuccessOpen, setEditSuccessOpen] = useState(false);
  const [updatedItemName, setUpdatedItemName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    signerName: "",
    signerRole: "Authorized Signatory",
    signatureUrl: "/assets/images/signature1.png",
    isDefault: false,
    status: "ACTIVE",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSignaturesApi();
      setSignatures(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load signatures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSignatures = useMemo(() => {
    return signatures.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.signerName.toLowerCase().includes(search.toLowerCase()) ||
        item.signerRole.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [signatures, search, statusFilter]);

  const totalPages = Math.ceil(filteredSignatures.length / pageSize) || 1;
  const paginatedSignatures = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSignatures.slice(start, start + pageSize);
  }, [filteredSignatures, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      signerName: "",
      signerRole: "Authorized Signatory",
      signatureUrl: "/assets/images/signature1.png",
      isDefault: false,
      status: "ACTIVE",
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (sig: DigitalSignature) => {
    setSelectedSignature(sig);
    setFormData({
      title: sig.title,
      signerName: sig.signerName,
      signerRole: sig.signerRole,
      signatureUrl: sig.signatureUrl || "/assets/images/signature1.png",
      isDefault: sig.isDefault,
      status: sig.status,
    });
    setShowEditModal(true);
  };

  const handleOpenView = (sig: DigitalSignature) => {
    setSelectedSignature(sig);
    setShowViewModal(true);
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.signerName) {
      setErrorMessage("Please enter both Signature Title and Signer Name");
      return;
    }

    try {
      setFormSubmitting(true);
      await createSignatureApi({
        title: formData.title,
        signerName: formData.signerName,
        signerRole: formData.signerRole,
        signatureUrl: formData.signatureUrl,
        isDefault: formData.isDefault,
        status: formData.status,
      });
      setShowAddModal(false);
      setAddedItemName(formData.title);
      setAddSuccessOpen(true);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create signature");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSignature) return;

    try {
      setFormSubmitting(true);
      await updateSignatureApi(selectedSignature.id, {
        title: formData.title,
        signerName: formData.signerName,
        signerRole: formData.signerRole,
        signatureUrl: formData.signatureUrl,
        isDefault: formData.isDefault,
        status: formData.status,
      });
      setShowEditModal(false);
      setUpdatedItemName(formData.title);
      setEditSuccessOpen(true);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update signature");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSetDefault = async (sig: DigitalSignature) => {
    try {
      await setDefaultSignatureApi(sig.id);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to set default signature");
    }
  };

  const handleDeletePrompt = (sig: DigitalSignature) => {
    setItemToDelete(sig);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteSignatureApi(itemToDelete.id);
      setDeleteConfirmOpen(false);
      setDeleteSuccessOpen(true);
      loadData();
    } catch (err: any) {
      setDeleteConfirmOpen(false);
      setErrorMessage(err.message || "Failed to delete signature");
    }
  };

  const exportCSV = () => {
    const headers = ["Title", "Signer Name", "Role / Designation", "Default", "Status"];
    const rows = filteredSignatures.map((s) => [
      s.title,
      s.signerName,
      s.signerRole,
      s.isDefault ? "Default" : "-",
      s.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `digital_signatures_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Digital Signatures</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage digital signature stamps for invoices, quotations, and receipts</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadData}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
            </button>
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <SettingsSidebar />

          <div className="flex-1 w-full space-y-4">
            {/* Action Bar */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search title, signer name, role..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="w-[140px]">
                  <SearchableSelect
                    options={[
                      { value: "All", label: "Status: All" },
                      { value: "ACTIVE", label: "Active" },
                      { value: "INACTIVE", label: "Inactive" },
                    ]}
                    value={statusFilter}
                    onChange={(val) => {
                      setStatusFilter(val);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={exportCSV}
                  className="px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#FE9F43] hover:bg-[#e88e35] rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Signature</span>
                </button>
              </div>
            </div>

            {/* Master Data Table */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                  <p className="text-xs text-gray-500 font-medium">Loading digital signatures...</p>
                </div>
              ) : paginatedSignatures.length === 0 ? (
                <div className="p-12 text-center">
                  <PenTool className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No digital signatures found</p>
                  <p className="text-xs text-gray-400 mt-1">Add official company signatures to stamp on customer receipts</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-[#F8F9FA] text-[11px] font-bold text-[#64748B] uppercase border-b border-[#E9ECEF]">
                      <tr>
                        <th className="py-3 px-4">Signature Title</th>
                        <th className="py-3 px-4">Signer Name</th>
                        <th className="py-3 px-4">Designation / Role</th>
                        <th className="py-3 px-4">Default</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F3F5]">
                      {paginatedSignatures.map((sig) => (
                        <tr key={sig.id} className="hover:bg-[#F8F9FA]/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-gray-900 flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center border border-orange-100 shrink-0">
                              <PenTool className="w-3.5 h-3.5" />
                            </div>
                            <span>{sig.title}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">{sig.signerName}</td>
                          <td className="py-3 px-4 text-gray-500">{sig.signerRole}</td>
                          <td className="py-3 px-4">
                            {sig.isDefault ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>Default</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSetDefault(sig)}
                                className="text-[11px] font-semibold text-gray-500 hover:text-orange-600 hover:underline"
                              >
                                Set Default
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sig.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-gray-100 text-gray-500 border border-gray-200"
                              }`}
                            >
                              {sig.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {/* Standard Order: View -> Edit -> Delete */}
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleOpenView(sig)}
                                className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600 flex items-center justify-center transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(sig)}
                                className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-500 hover:text-amber-600 flex items-center justify-center transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePrompt(sig)}
                                className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-500 hover:text-rose-600 flex items-center justify-center transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="p-4 border-t border-[#E9ECEF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-700"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span>entries per page (Total {filteredSignatures.length})</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 font-semibold text-gray-800">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Add Digital Signature</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleSaveNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Signature Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Branch Manager Sign"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Signer Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Somchai Prasert"
                    value={formData.signerName}
                    onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Signer Role / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Managing Director"
                    value={formData.signerRole}
                    onChange={(e) => setFormData({ ...formData, signerRole: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <SearchableSelect
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                  ]}
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultSigCheck"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="defaultSigCheck" className="text-xs font-medium text-gray-700">
                  Set as Default Signature for Invoices
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#FE9F43] hover:bg-[#e88e35] rounded-lg disabled:opacity-50"
                >
                  {formSubmitting ? "Creating..." : "Save Signature"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSignature && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Edit Digital Signature</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Signature Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Signer Full Name *</label>
                  <input
                    type="text"
                    value={formData.signerName}
                    onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Signer Role / Title</label>
                  <input
                    type="text"
                    value={formData.signerRole}
                    onChange={(e) => setFormData({ ...formData, signerRole: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <SearchableSelect
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                  ]}
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="editDefaultSigCheck"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="editDefaultSigCheck" className="text-xs font-medium text-gray-700">
                  Set as Default Signature for Invoices
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {formSubmitting ? "Updating..." : "Update Signature"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedSignature && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Signature Stamp Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Title</span>
                <span className="font-bold text-gray-900">{selectedSignature.title}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Signer Name</span>
                <span className="font-medium text-gray-800">{selectedSignature.signerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Designation</span>
                <span className="font-medium text-gray-800">{selectedSignature.signerRole}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Default Selection</span>
                <span className="font-semibold text-gray-800">{selectedSignature.isDefault ? "Yes (Default)" : "No"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-emerald-600">{selectedSignature.status}</span>
              </div>
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Step 1: Confirmation Modal */}
      {deleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Signature?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Are you sure you want to delete signature <strong className="text-gray-800 font-semibold">{itemToDelete.title}</strong>?
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Step 2: Success Modal */}
      {deleteSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Signature Deleted!</h3>
            <p className="text-xs text-gray-500 mb-6">The signature stamp has been removed successfully.</p>
            <button
              onClick={() => setDeleteSuccessOpen(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Add Success Modal */}
      {addSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Signature Created!</h3>
            <p className="text-xs text-gray-500 mb-6">Successfully added <strong className="text-gray-800 font-semibold">{addedItemName}</strong>.</p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setAddSuccessOpen(false);
                  handleOpenAdd();
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                + Add Another
              </button>
              <button
                onClick={() => setAddSuccessOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Success Modal */}
      {editSuccessOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Signature Updated!</h3>
            <p className="text-xs text-gray-500 mb-6">Changes to <strong className="text-gray-800 font-semibold">{updatedItemName}</strong> have been saved.</p>
            <button
              onClick={() => setEditSuccessOpen(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Operation Failed</h3>
            <p className="text-xs text-gray-500 mb-6">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
