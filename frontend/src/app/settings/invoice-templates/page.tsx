"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  InvoiceTemplate,
  getInvoiceTemplatesApi,
  createInvoiceTemplateApi,
  updateInvoiceTemplateApi,
  setDefaultInvoiceTemplateApi,
  deleteInvoiceTemplateApi,
} from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  Plus,
  Star,
  Eye,
  Edit,
  Trash2,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Barcode,
  Receipt,
  Printer,
  Check,
  Loader2,
} from "lucide-react";

export default function InvoiceTemplatesPage() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);

  // Delete Flow
  const [itemToDelete, setItemToDelete] = useState<InvoiceTemplate | null>(null);
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
    name: "",
    templateType: "Thermal 80mm",
    colorScheme: "#FE9F43",
    showLogo: true,
    showQrCode: true,
    showBarcode: true,
    showTaxBreakdown: true,
    isDefault: false,
    status: "ACTIVE",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getInvoiceTemplatesApi();
      setTemplates(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load invoice templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      templateType: "Thermal 80mm",
      colorScheme: "#FE9F43",
      showLogo: true,
      showQrCode: true,
      showBarcode: true,
      showTaxBreakdown: true,
      isDefault: false,
      status: "ACTIVE",
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (t: InvoiceTemplate) => {
    setSelectedTemplate(t);
    setFormData({
      name: t.name,
      templateType: t.templateType,
      colorScheme: t.colorScheme,
      showLogo: t.showLogo,
      showQrCode: t.showQrCode,
      showBarcode: t.showBarcode,
      showTaxBreakdown: t.showTaxBreakdown,
      isDefault: t.isDefault,
      status: t.status,
    });
    setShowEditModal(true);
  };

  const handleOpenPreview = (t: InvoiceTemplate) => {
    setSelectedTemplate(t);
    setShowPreviewModal(true);
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setErrorMessage("Please enter a template name");
      return;
    }

    try {
      setFormSubmitting(true);
      await createInvoiceTemplateApi(formData);
      setShowAddModal(false);
      setAddedItemName(formData.name);
      setAddSuccessOpen(true);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create invoice template");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      setFormSubmitting(true);
      await updateInvoiceTemplateApi(selectedTemplate.id, formData);
      setShowEditModal(false);
      setUpdatedItemName(formData.name);
      setEditSuccessOpen(true);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update invoice template");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSetDefault = async (t: InvoiceTemplate) => {
    try {
      await setDefaultInvoiceTemplateApi(t.id);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to set default template");
    }
  };

  const handleDeletePrompt = (t: InvoiceTemplate) => {
    if (t.isDefault) {
      setErrorMessage("You cannot delete the active default template.");
      return;
    }
    setItemToDelete(t);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteInvoiceTemplateApi(itemToDelete.id);
      setDeleteConfirmOpen(false);
      setDeleteSuccessOpen(true);
      loadData();
    } catch (err: any) {
      setDeleteConfirmOpen(false);
      setErrorMessage(err.message || "Failed to delete template");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Invoice & Receipt Templates</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Customize layouts, color themes, thermal slips, and full VAT invoice formats</p>
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
            {/* Top Bar */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Available Print Templates</h2>
                <p className="text-xs text-[#64748B] mt-0.5">Select a default template to be used across all POS terminals and PDF downloads</p>
              </div>

              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#FE9F43] hover:bg-[#e88e35] rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Template</span>
              </button>
            </div>

            {/* Template Cards Grid */}
            {loading ? (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-12 flex flex-col items-center justify-center shadow-xs">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-500">Loading invoice templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-12 text-center shadow-xs">
                <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">No invoice templates configured</p>
                <p className="text-xs text-gray-400 mt-1">Click 'Add Template' to design a receipt layout</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className={`bg-white rounded-xl border-2 p-5 flex flex-col justify-between shadow-xs transition-all ${
                      t.isDefault ? "border-[#FE9F43] ring-2 ring-orange-500/20" : "border-[#E9ECEF] hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-2xs"
                            style={{ backgroundColor: t.colorScheme || "#FE9F43" }}
                          >
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">{t.name}</h3>
                            <span className="text-[11px] font-semibold text-gray-500">{t.templateType}</span>
                          </div>
                        </div>

                        {t.isDefault ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>Default</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(t)}
                            className="text-[11px] font-semibold text-gray-500 hover:text-orange-600 hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                      </div>

                      {/* Feature Tags */}
                      <div className="flex flex-wrap gap-1.5 my-3">
                        {t.showLogo && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">Logo</span>
                        )}
                        {t.showQrCode && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700">QR Code</span>
                        )}
                        {t.showBarcode && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700">Barcode</span>
                        )}
                        {t.showTaxBreakdown && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700">Tax/VAT</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: t.colorScheme }} />
                        <span className="text-[11px] font-mono text-gray-400">{t.colorScheme}</span>
                      </div>

                      {/* Action Order: View -> Edit -> Delete */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenPreview(t)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 flex items-center space-x-1 transition-colors"
                          title="Preview Slip"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(t)}
                          disabled={t.isDefault}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
                          title={t.isDefault ? "Cannot delete default template" : "Delete"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Add Invoice Template</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleSaveNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Thermal 80mm Slip"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Layout Format</label>
                  <SearchableSelect
                    options={[
                      { value: "Thermal 80mm", label: "Thermal 80mm" },
                      { value: "Thermal 58mm", label: "Thermal 58mm" },
                      { value: "A4 Slip", label: "A4 Standard Slip" },
                      { value: "VAT Full", label: "Full Tax Invoice A4" },
                    ]}
                    value={formData.templateType}
                    onChange={(val) => setFormData({ ...formData, templateType: val })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={formData.colorScheme}
                    onChange={(e) => setFormData({ ...formData, colorScheme: e.target.value })}
                    className="w-full h-8 px-1 py-1 text-xs rounded-lg border border-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <span className="block font-bold text-gray-800 mb-1">Display Components</span>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.showLogo}
                    onChange={(e) => setFormData({ ...formData, showLogo: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Display Store Logo at Header</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.showQrCode}
                    onChange={(e) => setFormData({ ...formData, showQrCode: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Display PromptPay / Verification QR Code</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.showBarcode}
                    onChange={(e) => setFormData({ ...formData, showBarcode: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Display Order Barcode at Footer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.showTaxBreakdown}
                    onChange={(e) => setFormData({ ...formData, showTaxBreakdown: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Display VAT & Tax Breakdown</span>
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
                  {formSubmitting ? "Creating..." : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Edit Invoice Template</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Layout Format</label>
                  <SearchableSelect
                    options={[
                      { value: "Thermal 80mm", label: "Thermal 80mm" },
                      { value: "Thermal 58mm", label: "Thermal 58mm" },
                      { value: "A4 Slip", label: "A4 Standard Slip" },
                      { value: "VAT Full", label: "Full Tax Invoice A4" },
                    ]}
                    value={formData.templateType}
                    onChange={(val) => setFormData({ ...formData, templateType: val })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={formData.colorScheme}
                    onChange={(e) => setFormData({ ...formData, colorScheme: e.target.value })}
                    className="w-full h-8 px-1 py-1 text-xs rounded-lg border border-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <span className="block font-bold text-gray-800 mb-1">Display Components</span>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.showLogo}
                    onChange={(e) => setFormData({ ...formData, showLogo: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Display Store Logo at Header</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.showQrCode}
                    onChange={(e) => setFormData({ ...formData, showQrCode: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Display PromptPay / Verification QR Code</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.showBarcode}
                    onChange={(e) => setFormData({ ...formData, showBarcode: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Display Order Barcode at Footer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.showTaxBreakdown}
                    onChange={(e) => setFormData({ ...formData, showTaxBreakdown: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span>Display VAT & Tax Breakdown</span>
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
                  {formSubmitting ? "Updating..." : "Update Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{selectedTemplate.name}</h3>
                <span className="text-[11px] text-gray-500">{selectedTemplate.templateType} Preview</span>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>

            {/* Slip Paper Mock */}
            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 font-mono text-[11px] text-gray-700 space-y-3">
              {selectedTemplate.showLogo && (
                <div className="text-center font-bold text-sm tracking-wider pb-1 border-b border-gray-200" style={{ color: selectedTemplate.colorScheme }}>
                  ★ ABCPOS RETAIL ★
                </div>
              )}
              <div className="text-center text-[10px] text-gray-500 leading-tight">
                Tax ID: 0105562094821<br />
                88/1 Sukhumvit Rd, Bangkok<br />
                Receipt: #INV-2026-08492
              </div>

              <div className="border-t border-b border-gray-200 py-1.5 space-y-1">
                <div className="flex justify-between">
                  <span>1x Espresso Double</span>
                  <span>฿65.00</span>
                </div>
                <div className="flex justify-between">
                  <span>2x Croissant Butter</span>
                  <span>฿130.00</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>฿195.00</span>
                </div>
                {selectedTemplate.showTaxBreakdown && (
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>VAT (7%):</span>
                    <span>฿12.76</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-200">
                  <span>TOTAL:</span>
                  <span style={{ color: selectedTemplate.colorScheme }}>฿195.00</span>
                </div>
              </div>

              {selectedTemplate.showQrCode && (
                <div className="text-center pt-2 flex flex-col items-center">
                  <QrCode className="w-12 h-12 text-gray-800" />
                  <span className="text-[9px] text-gray-400 mt-1">PromptPay Scan to Pay</span>
                </div>
              )}

              {selectedTemplate.showBarcode && (
                <div className="text-center pt-2 flex flex-col items-center">
                  <Barcode className="w-24 h-6 text-gray-800" />
                  <span className="text-[8px] text-gray-400">||| |||| || ||||| ||</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowPreviewModal(false)}
              className="w-full mt-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold"
            >
              Close Preview
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
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Template?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Are you sure you want to delete <strong className="text-gray-800 font-semibold">{itemToDelete.name}</strong>?
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
            <h3 className="text-base font-bold text-gray-900 mb-1">Template Deleted!</h3>
            <p className="text-xs text-gray-500 mb-6">The template layout has been removed.</p>
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
            <h3 className="text-base font-bold text-gray-900 mb-1">Template Created!</h3>
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
            <h3 className="text-base font-bold text-gray-900 mb-1">Template Updated!</h3>
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
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
