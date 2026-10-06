"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  SocialAuthProvider,
  getSocialAuthSettingsApi,
  updateSocialAuthSettingsApi,
} from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Key,
  Globe,
  Loader2,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export default function SocialAuthSettingsPage() {
  const [providers, setProviders] = useState<SocialAuthProvider[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [selectedProvider, setSelectedProvider] = useState<SocialAuthProvider | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    clientSecret: "",
    callbackUrl: "",
    status: "ACTIVE",
  });
  const [submitting, setSubmitting] = useState(false);

  // Feedback Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSocialAuthSettingsApi();
      setProviders(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load social auth settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (prov: SocialAuthProvider) => {
    setSelectedProvider(prov);
    setFormData({
      clientId: prov.clientId || "",
      clientSecret: prov.clientSecret || "",
      callbackUrl: prov.callbackUrl || `https://abcpos.app/api/auth/callback/${prov.provider.toLowerCase()}`,
      status: prov.status || "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleToggle = async (prov: SocialAuthProvider) => {
    try {
      const nextStatus = prov.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateSocialAuthSettingsApi({
        provider: prov.provider,
        clientId: prov.clientId,
        clientSecret: prov.clientSecret,
        callbackUrl: prov.callbackUrl,
        status: nextStatus,
      });
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to toggle provider");
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    try {
      setSubmitting(true);
      await updateSocialAuthSettingsApi({
        provider: selectedProvider.provider,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        callbackUrl: formData.callbackUrl,
        status: formData.status,
      });
      setModalOpen(false);
      setShowSuccessModal(true);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update OAuth credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const getProviderBrand = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return {
          title: "Google Workspace / Gmail OAuth",
          desc: "Allow employees and customers to authenticate using their Google accounts",
          iconBg: "bg-red-50 text-red-500 border-red-100",
          tag: "OAuth 2.0",
        };
      case "line":
        return {
          title: "LINE Login (LIFF)",
          desc: "Connect via official Thailand LINE Account channel for instant cashier and customer login",
          iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
          tag: "LINE Official",
        };
      case "facebook":
        return {
          title: "Facebook Meta Login",
          desc: "Enable login through Meta Facebook Developer application credentials",
          iconBg: "bg-blue-50 text-blue-600 border-blue-100",
          tag: "Meta API",
        };
      default:
        return {
          title: provider,
          desc: "OAuth Single Sign-On provider",
          iconBg: "bg-gray-50 text-gray-600 border-gray-100",
          tag: "SSO",
        };
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Social Login & OAuth</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Configure 3rd-party single sign-on (SSO) credentials for staff and customers</p>
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
            {loading ? (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-12 flex flex-col items-center justify-center shadow-xs">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-500">Loading social auth integrations...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((prov) => {
                  const brand = getProviderBrand(prov.provider);
                  const isConfigured = Boolean(prov.clientId && prov.clientId !== "");
                  return (
                    <div
                      key={prov.id}
                      className="bg-white rounded-xl border border-[#E9ECEF] p-5 flex flex-col justify-between shadow-xs hover:border-gray-300 transition-all space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${brand.iconBg}`}>
                            {prov.provider.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                prov.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-gray-100 text-gray-500 border border-gray-200"
                              }`}
                            >
                              {prov.status}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={prov.status === "ACTIVE"}
                                onChange={() => handleToggle(prov)}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#FE9F43]"></div>
                            </label>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-gray-900">{brand.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{brand.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
                          <span>App Client ID:</span>
                          <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                            {isConfigured ? prov.clientId : "Not configured"}
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenEdit(prov)}
                          className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-gray-200"
                        >
                          <Settings className="w-3.5 h-3.5 text-gray-500" />
                          <span>Configure Credentials</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Credentials Modal */}
      {modalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{selectedProvider.provider} OAuth Integration</h3>
                <p className="text-[11px] text-gray-500">Enter API Credentials from developer console</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client ID / App ID *</label>
                <input
                  type="text"
                  placeholder="e.g. 948192039-apps.usercontent.com"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client Secret / Secret Key *</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••"
                  value={formData.clientSecret}
                  onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Authorized Redirect / Callback URI</label>
                <input
                  type="text"
                  value={formData.callbackUrl}
                  onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500 font-mono text-gray-600 bg-gray-50"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Credentials"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Credentials Saved!</h3>
            <p className="text-xs text-gray-500 mb-6">Social OAuth integration parameters have been updated.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-150">
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
