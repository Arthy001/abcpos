"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  PaymentGateway,
  fetchPaymentGatewaysApi,
  updatePaymentGatewayApi,
  togglePaymentGatewayApi,
} from "@/lib/api";
import {
  RotateCcw,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Settings,
  Eye,
  EyeOff,
  KeyRound,
  X,
  ExternalLink,
  Lock,
} from "lucide-react";

export default function PaymentGatewaySettingsPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit Gateway Modal
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDesc, setFormDesc] = useState<string>("");
  const [formApiKey, setFormApiKey] = useState<string>("");
  const [formSecretKey, setFormSecretKey] = useState<string>("");
  const [formMerchantId, setFormMerchantId] = useState<string>("");
  const [formMode, setFormMode] = useState<"SANDBOX" | "LIVE">("SANDBOX");
  const [formIsEnabled, setFormIsEnabled] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Standard Feedback Modal
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "edit_success" | "error";
    title: string;
    message: string;
    itemName?: string;
  }>({
    isOpen: false,
    type: "edit_success",
    title: "",
    message: "",
  });

  const loadGateways = async () => {
    try {
      setLoading(true);
      const data = await fetchPaymentGatewaysApi();
      setGateways(data);
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Connection Failed",
        message: err.message || "Failed to load payment gateways",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGateways();
  }, []);

  const handleToggle = async (gateway: PaymentGateway) => {
    const nextStatus = !gateway.isEnabled;
    try {
      await togglePaymentGatewayApi(gateway.id, nextStatus);
      setGateways((prev) =>
        prev.map((g) => (g.id === gateway.id ? { ...g, isEnabled: nextStatus } : g))
      );
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: nextStatus ? "Gateway Enabled" : "Gateway Disabled",
        message: `${gateway.name} is now ${nextStatus ? "active and ready to accept payments" : "disabled"}.`,
        itemName: gateway.name,
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Toggle Failed",
        message: err.message || "Could not update gateway status",
      });
    }
  };

  const handleOpenEdit = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    setFormTitle(gateway.title || gateway.name);
    setFormDesc(gateway.description || "");
    setFormApiKey(gateway.apiKey || "");
    setFormSecretKey(gateway.secretKey || "");
    setFormMerchantId(gateway.merchantId || "");
    setFormMode(gateway.mode);
    setFormIsEnabled(gateway.isEnabled);
    setShowSecret(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGateway) return;

    try {
      setSubmitting(true);
      await updatePaymentGatewayApi(editingGateway.id, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        apiKey: formApiKey.trim() || null,
        secretKey: formSecretKey.trim() || null,
        merchantId: formMerchantId.trim() || null,
        mode: formMode,
        isEnabled: formIsEnabled,
      });

      setEditingGateway(null);
      await loadGateways();
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "Gateway Settings Saved",
        message: `Credentials and parameters for ${editingGateway.name} have been updated.`,
        itemName: editingGateway.name,
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message: err.message || "Failed to update gateway settings",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getGatewayIcon = (code: string) => {
    switch (code) {
      case "omise":
        return <QrCode className="w-5 h-5 text-indigo-600" />;
      case "stripe":
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case "twoc2p":
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-[#FE9F43]" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your system settings on portal</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadGateways}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Settings Sidebar */}
          <SettingsSidebar />

          {/* Right Content Panel: Payment Gateways */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#FE9F43] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1E293B]">Payment Gateways</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Configure online payment processors, PromptPay QR, and credit card gateways
                  </p>
                </div>
              </div>
            </div>

            {/* Gateway Cards Grid */}
            <div className="p-6">
              {loading ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  Loading payment gateways...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gateways.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                        item.isEnabled
                          ? "bg-white border-blue-200 shadow-xs"
                          : "bg-gray-50/60 border-gray-200 opacity-80"
                      }`}
                    >
                      <div>
                        {/* Card Header: Icon, Name, Mode & Toggle */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                              {getGatewayIcon(item.code)}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-[#1E293B]">{item.title}</h3>
                              <p className="text-[11px] text-gray-500 font-medium">{item.name}</p>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggle(item)}
                            title={item.isEnabled ? "Click to Disable" : "Click to Enable"}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              item.isEnabled ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                item.isEnabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#64748B] mt-3 line-clamp-2">
                          {item.description || "No description provided."}
                        </p>

                        {/* Badges / Mode */}
                        <div className="flex items-center space-x-2 mt-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.isEnabled
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {item.isEnabled ? "ACTIVE" : "INACTIVE"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.mode === "LIVE"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {item.mode}
                          </span>
                        </div>

                        {/* Key Info Preview */}
                        <div className="mt-3.5 pt-3.5 border-t border-gray-100 space-y-1.5 text-[11px]">
                          {item.apiKey && (
                            <div className="flex items-center justify-between text-gray-500">
                              <span className="flex items-center space-x-1">
                                <KeyRound className="w-3 h-3 text-gray-400" />
                                <span>API Key:</span>
                              </span>
                              <span className="font-mono text-gray-700 font-semibold">
                                {item.apiKey.slice(0, 10)}...{item.apiKey.slice(-4)}
                              </span>
                            </div>
                          )}
                          {item.merchantId && (
                            <div className="flex items-center justify-between text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Lock className="w-3 h-3 text-gray-400" />
                                <span>Merchant ID:</span>
                              </span>
                              <span className="font-mono text-gray-700 font-semibold">
                                {item.merchantId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Configure Button */}
                      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:text-[#FE9F43] hover:border-[#FE9F43] hover:bg-amber-50/40 transition-colors cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Configure</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== CONFIGURE MODAL ==================== */}
        {editingGateway && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#FE9F43] flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1E293B]">
                      Configure {editingGateway.name}
                    </h3>
                    <p className="text-[11px] text-gray-500">API keys & operational parameters</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingGateway(null)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1.5">Display Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#1E293B] mb-1.5">Operation Mode</label>
                    <SearchableSelect
                      placeholder="Select mode..."
                      value={formMode}
                      onChange={(val) => setFormMode(val as "SANDBOX" | "LIVE")}
                      options={[
                        { value: "SANDBOX", label: "Sandbox / Test Mode" },
                        { value: "LIVE", label: "Production / Live Mode" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1E293B] mb-1.5">Merchant ID / Account</label>
                    <input
                      type="text"
                      placeholder="Optional Merchant ID"
                      value={formMerchantId}
                      onChange={(e) => setFormMerchantId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#FE9F43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1.5">
                    API Publishable Key / Public Key
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. pk_test_..."
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-[#1E293B]">
                      Secret Key / Private Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[11px] text-[#FE9F43] hover:underline flex items-center space-x-1"
                    >
                      {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSecret ? "Hide" : "Reveal"}</span>
                    </button>
                  </div>
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder="e.g. sk_test_..."
                    value={formSecretKey}
                    onChange={(e) => setFormSecretKey(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#FE9F43]"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsEnabled}
                      onChange={(e) => setFormIsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FE9F43] focus:ring-[#FE9F43] border-gray-300"
                    />
                    <div>
                      <span className="font-semibold text-[#1E293B]">Enable this Payment Gateway</span>
                      <p className="text-[11px] text-[#64748B]">
                        Display as a checkout method in online and POS transactions.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingGateway(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== STANDARD FEEDBACK MODAL ==================== */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-gray-100 text-center p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              {feedbackModal.type === "edit_success" && (
                <>
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{feedbackModal.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {feedbackModal.itemName && (
                        <span className="font-semibold text-gray-800">
                          &quot;{feedbackModal.itemName}&quot;{" "}
                        </span>
                      )}
                      {feedbackModal.message}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                </>
              )}

              {feedbackModal.type === "error" && (
                <>
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{feedbackModal.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{feedbackModal.message}</p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
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
