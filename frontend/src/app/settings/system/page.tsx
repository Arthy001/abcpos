"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  SystemSettings,
  getSystemSettingsApi,
  updateSystemSettingsApi,
  triggerSystemBackupApi,
} from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  HardDrive,
  Download,
  Sparkles,
  Save,
  Loader2,
  Bug,
  UploadCloud,
} from "lucide-react";

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const [formData, setFormData] = useState<SystemSettings>({
    appTitle: "ABCPOS Management System",
    storageDriver: "Local",
    maxUploadSizeMb: 10,
    autoBackup: true,
    backupFrequency: "Daily",
    lastBackupAt: null,
    debugMode: false,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [backupSuccessInfo, setBackupSuccessInfo] = useState<{
    message: string;
    backupFileName: string;
    sizeMb: string;
    backupAt: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSystemSettingsApi();
      setFormData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSystemSettingsApi(formData);
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save system settings");
    } finally {
      setSaving(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      setBackingUp(true);
      const result = await triggerSystemBackupApi();
      setBackupSuccessInfo(result);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate database backup");
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">System & Storage Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage server file storage, automated backups, and developer diagnostics</p>
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

          <div className="flex-1 w-full">
            {loading ? (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-12 flex flex-col items-center justify-center shadow-xs">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-500">Loading system settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B]">Core Server & Maintenance Parameters</h2>
                    <p className="text-xs text-[#64748B] mt-0.5">Control data persistence and backup policies</p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#FE9F43] hover:bg-[#e88e35] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* General System Information */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Server className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Application Identification</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Application Title</label>
                        <input
                          type="text"
                          value={formData.appTitle}
                          onChange={(e) => setFormData({ ...formData, appTitle: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">File Storage Driver</label>
                        <SearchableSelect
                          options={[
                            { value: "Local", label: "Local Disk Storage (uploads/)" },
                            { value: "AWS S3", label: "Amazon Web Services S3" },
                            { value: "Cloudflare R2", label: "Cloudflare R2 Object Storage" },
                          ]}
                          value={formData.storageDriver}
                          onChange={(val) => setFormData({ ...formData, storageDriver: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Media Upload Limit (MB)</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={formData.maxUploadSizeMb}
                          onChange={(e) => setFormData({ ...formData, maxUploadSizeMb: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Bug className="w-4 h-4 text-rose-500" />
                          <div>
                            <span className="text-xs font-bold text-gray-800">Debug Logging Mode</span>
                            <p className="text-[11px] text-gray-500">Output detailed backend SQL query traces in console</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={formData.debugMode}
                            onChange={(e) => setFormData({ ...formData, debugMode: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Automated Database Backups */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Database className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Database Backups & Snapshot</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-xs font-bold text-gray-800">Automated Daily Snapshot</span>
                          <p className="text-[11px] text-gray-500 mt-0.5">Automatically create sqlite database dump at midnight</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                          <input
                            type="checkbox"
                            checked={formData.autoBackup}
                            onChange={(e) => setFormData({ ...formData, autoBackup: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Backup Frequency</label>
                        <SearchableSelect
                          options={[
                            { value: "Daily", label: "Every Night (Daily at 00:00)" },
                            { value: "Weekly", label: "Every Sunday (Weekly)" },
                            { value: "Monthly", label: "1st of Every Month (Monthly)" },
                          ]}
                          value={formData.backupFrequency}
                          onChange={(val) => setFormData({ ...formData, backupFrequency: val })}
                        />
                      </div>
                    </div>

                    {/* Instant Backup Trigger Box */}
                    <div className="p-5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <HardDrive className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-emerald-950">Manual Snapshot Backup</h4>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Last created:{" "}
                            <span className="font-semibold text-emerald-900">
                              {formData.lastBackupAt ? new Date(formData.lastBackupAt).toLocaleString() : "No recent manual backup recorded"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleBackupNow}
                        disabled={backingUp}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-2 shrink-0 transition-colors disabled:opacity-50"
                      >
                        {backingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span>{backingUp ? "Creating Snapshot..." : "Backup Database Now"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={loadData}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset Changes
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-[#FE9F43] hover:bg-[#e88e35] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Backup Success Modal */}
      {backupSuccessInfo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Backup Created!</h3>
            <p className="text-xs text-gray-500 mb-3">{backupSuccessInfo.message}</p>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-left text-xs space-y-1 mb-6 font-mono">
              <div className="flex justify-between text-gray-600">
                <span>File:</span>
                <span className="font-semibold text-gray-900 truncate max-w-[180px]">{backupSuccessInfo.backupFileName}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Size:</span>
                <span className="font-semibold text-gray-900">{backupSuccessInfo.sizeMb}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Time:</span>
                <span className="font-semibold text-gray-900">{new Date(backupSuccessInfo.backupAt).toLocaleTimeString()}</span>
              </div>
            </div>
            <button
              onClick={() => setBackupSuccessInfo(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Done
            </button>
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
            <h3 className="text-base font-bold text-gray-900 mb-1">System Settings Saved!</h3>
            <p className="text-xs text-gray-500 mb-6">Storage and server maintenance policies have been updated.</p>
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
