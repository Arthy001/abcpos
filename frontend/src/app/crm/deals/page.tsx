"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  CrmDeal,
  CrmPipeline,
  CrmStage,
} from "@/types";
import {
  fetchCrmPipelines,
  fetchCrmDeals,
  createCrmDeal,
  updateCrmDeal,
  updateCrmDealStage,
  deleteCrmDeal,
  convertDealToProject,
} from "@/lib/api";
import {
  PlusCircle,
  Search,
  RotateCcw,
  Edit,
  Trash2,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Zap,
  Kanban,
  Table as TableIcon,
  ChevronUp,
} from "lucide-react";

export default function CrmDealsPage() {
  const [pipelines, setPipelines] = useState<CrmPipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState<string>("");

  // Modals
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [editingDeal, setEditingDeal] = useState<CrmDeal | null>(null);
  const [viewingDeal, setViewingDeal] = useState<CrmDeal | null>(null);

  // Feedback Modals
  const [addSuccessModal, setAddSuccessModal] = useState<boolean>(false);
  const [createdDealTitle, setCreatedDealTitle] = useState<string>("");
  const [editSuccessModal, setEditSuccessModal] = useState<boolean>(false);
  const [updatedDealTitle, setUpdatedDealTitle] = useState<string>("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<boolean>(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState<boolean>(false);
  const [dealToDelete, setDealToDelete] = useState<CrmDeal | null>(null);
  const [convertSuccessModal, setConvertSuccessModal] = useState<boolean>(false);
  const [convertedProjectCode, setConvertedProjectCode] = useState<string>("");

  // Form State
  const [formTitle, setFormTitle] = useState<string>("");
  const [formContactName, setFormContactName] = useState<string>("");
  const [formContactPhone, setFormContactPhone] = useState<string>("");
  const [formContactEmail, setFormContactEmail] = useState<string>("");
  const [formSiteAddress, setFormSiteAddress] = useState<string>("");
  const [formGpsLocation, setFormGpsLocation] = useState<string>("");
  const [formEstimatedValue, setFormEstimatedValue] = useState<string>("0");
  const [formProbability, setFormProbability] = useState<string>("50");
  const [formStageId, setFormStageId] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<"SOLAR" | "EV" | "CCTV" | "CUSTOM">("SOLAR");

  // Custom Data Fields
  const [solarKwTarget, setSolarKwTarget] = useState<string>("5.5");
  const [solarAvgBill, setSolarAvgBill] = useState<string>("4500");
  const [solarRoofType, setSolarRoofType] = useState<string>("CPAC");
  const [solarMeterPhase, setSolarMeterPhase] = useState<string>("3-Phase (3 เฟส)");
  const [solarMeterProvider, setSolarMeterProvider] = useState<string>("PEA (ภูมิภาค)");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const pipeData = await fetchCrmPipelines();
      setPipelines(pipeData || []);

      const activePipe = pipeData?.[0];
      const pipeId = selectedPipelineId || activePipe?.id || "";
      if (!selectedPipelineId && activePipe) {
        setSelectedPipelineId(activePipe.id);
      }

      const dealsData = await fetchCrmDeals({ pipelineId: pipeId, search });
      setDeals(dealsData || []);
    } catch (err) {
      console.error(err);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPipelineId]);

  const activePipeline = pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];
  const stages = activePipeline?.stages?.sort((a, b) => a.order - b.order) || [];

  const handleOpenCreateModal = () => {
    setEditingDeal(null);
    setFormTitle("");
    setFormContactName("");
    setFormContactPhone("");
    setFormContactEmail("");
    setFormSiteAddress("");
    setFormGpsLocation("");
    setFormEstimatedValue("150000");
    setFormProbability("50");
    setFormStageId(stages[0]?.id || "");
    setFormNotes("");
    setSelectedPreset("SOLAR");
    setSolarKwTarget("5.5");
    setSolarAvgBill("4500");
    setSolarRoofType("CPAC");
    setSolarMeterPhase("3-Phase (3 เฟส)");
    setSolarMeterProvider("PEA (ภูมิภาค)");
    setShowFormModal(true);
  };

  const handleOpenEditModal = (deal: CrmDeal) => {
    setEditingDeal(deal);
    setFormTitle(deal.title);
    setFormContactName(deal.contactName);
    setFormContactPhone(deal.contactPhone);
    setFormContactEmail(deal.contactEmail || "");
    setFormSiteAddress(deal.siteAddress || "");
    setFormGpsLocation(deal.gpsLocation || "");
    setFormEstimatedValue(String(deal.estimatedValue));
    setFormProbability(String(deal.probability));
    setFormStageId(deal.stageId);
    setFormNotes(deal.notes || "");

    // Parse customData
    if (deal.customData) {
      try {
        const parsed = JSON.parse(deal.customData);
        if (parsed.preset) setSelectedPreset(parsed.preset);
        if (parsed.kwpTarget) setSolarKwTarget(String(parsed.kwpTarget));
        if (parsed.avgElectricityBill) setSolarAvgBill(String(parsed.avgElectricityBill));
        if (parsed.roofType) setSolarRoofType(parsed.roofType);
        if (parsed.meterPhase) setSolarMeterPhase(parsed.meterPhase);
        if (parsed.meterProvider) setSolarMeterProvider(parsed.meterProvider);
      } catch (e) {
        console.error(e);
      }
    }
    setShowFormModal(true);
  };

  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContactName || !formContactPhone) return;

    try {
      setIsSubmitting(true);
      const customPayload = {
        preset: selectedPreset,
        kwpTarget: parseFloat(solarKwTarget) || 0,
        avgElectricityBill: parseFloat(solarAvgBill) || 0,
        roofType: solarRoofType,
        meterPhase: solarMeterPhase,
        meterProvider: solarMeterProvider,
      };

      const payload = {
        title: formTitle,
        pipelineId: selectedPipelineId,
        stageId: formStageId || stages[0]?.id,
        contactName: formContactName,
        contactPhone: formContactPhone,
        contactEmail: formContactEmail || undefined,
        siteAddress: formSiteAddress || undefined,
        gpsLocation: formGpsLocation || undefined,
        estimatedValue: parseFloat(formEstimatedValue) || 0,
        probability: parseInt(formProbability) || 50,
        notes: formNotes || undefined,
        customData: customPayload,
      };

      if (editingDeal) {
        await updateCrmDeal(editingDeal.id, payload);
        setShowFormModal(false);
        setUpdatedDealTitle(formTitle);
        setEditSuccessModal(true);
      } else {
        await createCrmDeal(payload);
        setShowFormModal(false);
        setCreatedDealTitle(formTitle);
        setAddSuccessModal(true);
      }
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveStage = async (dealId: string, newStageId: string) => {
    try {
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stageId: newStageId } : d))
      );
      await updateCrmDealStage(dealId, newStageId);
    } catch (err: any) {
      alert(err.message || "Failed to move stage");
      loadData();
    }
  };

  const handleConvertToProject = async (deal: CrmDeal) => {
    try {
      const res = await convertDealToProject(deal.id);
      setConvertedProjectCode(res.data.projectCode);
      setConvertSuccessModal(true);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to convert deal");
    }
  };

  const handleDeleteDeal = async () => {
    if (!dealToDelete) return;
    try {
      await deleteCrmDeal(dealToDelete.id);
      setDeleteConfirmModal(false);
      setDeleteSuccessModal(true);
      setDealToDelete(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete deal");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Deal Code,Title,Contact Name,Phone,Stage,Value (THB)"];
    const rows = deals.map(
      (d) => `"${d.dealCode}","${d.title}","${d.contactName}","${d.contactPhone}","${d.stage?.name || ""}","${d.estimatedValue || 0}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crm_deals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header matching /customers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Deals & Pipeline</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage sales pipeline & opportunities</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === "kanban"
                    ? "bg-white text-[#FE9F43] shadow-xs"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === "table"
                    ? "bg-white text-[#FE9F43] shadow-xs"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            {/* PDF Export Button (Red) */}
            <button
              onClick={() => window.print()}
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

            {/* + Add Deal Button (Orange standard) */}
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Deal</span>
            </button>
          </div>
        </div>

        {/* Main Card Container matching /customers */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search deals, customer, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadData()}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-[#6B7280]">Pipeline:</span>
              <select
                value={selectedPipelineId}
                onChange={(e) => setSelectedPipelineId(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
              >
                {pipelines.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View: Kanban or Table */}
          {loading ? (
            <div className="py-16 text-center text-xs text-[#9CA3AF]">กำลังโหลดข้อมูลดีล...</div>
          ) : viewMode === "kanban" ? (
            <div className="flex gap-4 overflow-x-auto pb-4 items-start pt-2">
              {stages.map((stg) => {
                const stageDeals = deals.filter((d) => d.stageId === stg.id);
                const totalVal = stageDeals.reduce((sum, d) => sum + (d.estimatedValue || 0), 0);

                return (
                  <div
                    key={stg.id}
                    className="w-72 flex-shrink-0 bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] flex flex-col max-h-[calc(100vh-270px)]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: stg.color || "#3b82f6" }}
                        />
                        <h3 className="font-bold text-[#1E293B] text-xs">{stg.name}</h3>
                      </div>
                      <span className="bg-white border border-[#E2E8F0] text-[#64748B] text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {stageDeals.length}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#64748B] font-semibold py-1">
                      รวม: ฿{totalVal.toLocaleString()}
                    </div>

                    {/* Deals List */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 mt-1 pr-1">
                      {stageDeals.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#94A3B8] italic">ไม่มีรายการ</div>
                      ) : (
                        stageDeals.map((deal) => {
                          let parsedCustom: any = null;
                          try {
                            if (deal.customData) parsedCustom = JSON.parse(deal.customData);
                          } catch (e) {}

                          return (
                            <div
                              key={deal.id}
                              className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] hover:border-[#FE9F43] hover:shadow-xs transition group relative"
                            >
                              <div className="flex items-start justify-between">
                                <span className="text-[10px] font-bold text-[#FE9F43] bg-[#FE9F43]/10 px-1.5 py-0.5 rounded">
                                  {deal.dealCode}
                                </span>
                                {/* Action Buttons Order: View (Eye) -> Edit (Edit) -> Delete (Trash2) */}
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => {
                                      setViewingDeal(deal);
                                      setShowViewModal(true);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded text-[#64748B] hover:text-[#0EA5E9]"
                                    title="View"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditModal(deal)}
                                    className="p-1 hover:bg-gray-100 rounded text-[#64748B] hover:text-[#10B981]"
                                    title="Edit"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDealToDelete(deal);
                                      setDeleteConfirmModal(true);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded text-[#64748B] hover:text-[#EF4444]"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <h4 className="font-bold text-[#1E293B] text-xs mt-1.5 line-clamp-1">{deal.title}</h4>
                              <p className="text-[11px] text-[#64748B] mt-0.5">{deal.contactName}</p>
                              <p className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" /> {deal.contactPhone}
                              </p>

                              {parsedCustom?.kwpTarget && (
                                <div className="mt-2 bg-[#FFF7ED] border border-[#FFEDD5] rounded p-1.5 text-[10px] text-[#9A3412] flex items-center justify-between">
                                  <span className="font-semibold flex items-center gap-1">
                                    <Sun className="w-3 h-3 text-[#EA580C]" /> {parsedCustom.kwpTarget} kWp
                                  </span>
                                  <span>บิล ฿{parsedCustom.avgElectricityBill?.toLocaleString()}</span>
                                </div>
                              )}

                              <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                                <span className="font-bold text-xs text-[#1E293B]">
                                  ฿{deal.estimatedValue?.toLocaleString()}
                                </span>

                                <select
                                  value={deal.stageId}
                                  onChange={(e) => handleMoveStage(deal.id, e.target.value)}
                                  className="text-[10px] font-medium bg-[#F8FAFC] border border-[#CBD5E1] rounded px-1 py-0.5 text-[#475569] focus:outline-none"
                                >
                                  {stages.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      ➔ {s.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {stg.isWon && !deal.project && (
                                <button
                                  onClick={() => handleConvertToProject(deal)}
                                  className="w-full mt-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-semibold py-1 rounded-md flex items-center justify-center gap-1 transition shadow-2xs"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  แปลงเป็นโครงการติดตั้ง
                                </button>
                              )}

                              {deal.project && (
                                <div className="w-full mt-2 bg-[#ECFDF5] text-[#065F46] text-[10px] font-bold py-1 px-1.5 rounded flex items-center justify-between">
                                  <span>โครงการ:</span>
                                  <span>{deal.project.projectCode}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E9ECEF] text-[#64748B] font-semibold bg-[#F8FAFC]">
                    <th className="py-2.5 px-3">Deal Code</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Stage</th>
                    <th className="py-2.5 px-3 text-right">Value (THB)</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[#94A3B8]">
                        ไม่พบข้อมูลดีล
                      </td>
                    </tr>
                  ) : (
                    deals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-[#F8FAFC] transition">
                        <td className="py-2.5 px-3 font-semibold text-[#FE9F43]">{deal.dealCode}</td>
                        <td className="py-2.5 px-3 font-medium text-[#1E293B]">{deal.title}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium block">{deal.contactName}</span>
                          <span className="text-[11px] text-[#94A3B8]">{deal.contactPhone}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${deal.stage?.color}15`,
                              color: deal.stage?.color || "#3b82f6",
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: deal.stage?.color || "#3b82f6" }}
                            />
                            {deal.stage?.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#1E293B]">
                          ฿{deal.estimatedValue.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => {
                                setViewingDeal(deal);
                                setShowViewModal(true);
                              }}
                              className="p-1 hover:bg-gray-100 rounded text-[#64748B] hover:text-[#0EA5E9]"
                              title="View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(deal)}
                              className="p-1 hover:bg-gray-100 rounded text-[#64748B] hover:text-[#10B981]"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDealToDelete(deal);
                                setDeleteConfirmModal(true);
                              }}
                              className="p-1 hover:bg-gray-100 rounded text-[#64748B] hover:text-[#EF4444]"
                              title="Delete"
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
          )}
        </div>

        {/* ========================================== */}
        {/* FORM MODAL (Add / Edit Deal)               */}
        {/* ========================================== */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-[#1E293B]">
                  {editingDeal ? "Edit Deal" : "Add Deal"}
                </h3>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDeal} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ติดตั้ง Solar Rooftop 5kWp - คุณสมชาย"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Customer / Contact *</label>
                    <input
                      type="text"
                      required
                      placeholder="ชื่อลูกค้า"
                      value={formContactName}
                      onChange={(e) => setFormContactName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="เบอร์โทรศัพท์"
                      value={formContactPhone}
                      onChange={(e) => setFormContactPhone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Estimated Value (THB)</label>
                    <input
                      type="number"
                      value={formEstimatedValue}
                      onChange={(e) => setFormEstimatedValue(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43] font-bold text-[#FE9F43]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Stage</label>
                    <select
                      value={formStageId}
                      onChange={(e) => setFormStageId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43] bg-white"
                    >
                      {stages.map((stg) => (
                        <option key={stg.id} value={stg.id}>
                          {stg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preset Attributes */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1E293B]">Technical Specs Preset</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPreset("SOLAR")}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                          selectedPreset === "SOLAR"
                            ? "bg-[#FE9F43] text-white"
                            : "bg-white text-[#64748B] border border-[#CBD5E1]"
                        }`}
                      >
                        ☀️ Solar Rooftop
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPreset("EV")}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                          selectedPreset === "EV"
                            ? "bg-[#3B82F6] text-white"
                            : "bg-white text-[#64748B] border border-[#CBD5E1]"
                        }`}
                      >
                        ⚡ EV Charger
                      </button>
                    </div>
                  </div>

                  {selectedPreset === "SOLAR" ? (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-[#64748B] block mb-0.5">ขนาดระบบ (kWp)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={solarKwTarget}
                          onChange={(e) => setSolarKwTarget(e.target.value)}
                          className="w-full px-2 py-1 border border-[#E2E8F0] rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[#64748B] block mb-0.5">ค่าไฟเดิม (บาท/เดือน)</label>
                        <input
                          type="number"
                          value={solarAvgBill}
                          onChange={(e) => setSolarAvgBill(e.target.value)}
                          className="w-full px-2 py-1 border border-[#E2E8F0] rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[#64748B] block mb-0.5">ประเภทหลังคา</label>
                        <select
                          value={solarRoofType}
                          onChange={(e) => setSolarRoofType(e.target.value)}
                          className="w-full px-2 py-1 border border-[#E2E8F0] rounded bg-white"
                        >
                          <option value="CPAC">ซีแพคโมเนีย (CPAC)</option>
                          <option value="MetalSheet">เมทัลชีท (Metal Sheet)</option>
                          <option value="Tile">กระเบื้องลอนคู่ (Roman Tile)</option>
                          <option value="Concrete">ดาดฟ้าคอนกรีต (Slab)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[#64748B] block mb-0.5">เฟสไฟ & การไฟฟ้า</label>
                        <div className="flex gap-1">
                          <select
                            value={solarMeterPhase}
                            onChange={(e) => setSolarMeterPhase(e.target.value)}
                            className="w-1/2 px-1 py-1 border border-[#E2E8F0] rounded bg-white text-[10px]"
                          >
                            <option value="1-Phase (1 เฟส)">1-Phase</option>
                            <option value="3-Phase (3 เฟส)">3-Phase</option>
                          </select>
                          <select
                            value={solarMeterProvider}
                            onChange={(e) => setSolarMeterProvider(e.target.value)}
                            className="w-1/2 px-1 py-1 border border-[#E2E8F0] rounded bg-white text-[10px]"
                          >
                            <option value="MEA (นครหลวง)">MEA</option>
                            <option value="PEA (ภูมิภาค)">PEA</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#94A3B8] text-center py-2">
                      รองรับบันทึกแอมป์มิเตอร์, สายไฟ และโมเดลรถไฟฟ้า
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Installation Address</label>
                  <input
                    type="text"
                    placeholder="ที่อยู่หน้างานติดตั้ง"
                    value={formSiteAddress}
                    onChange={(e) => setFormSiteAddress(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-3.5 py-1.5 border border-[#E5E7EB] rounded-lg text-xs font-semibold text-[#6B7280] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    {isSubmitting ? "Saving..." : "Save Deal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && viewingDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-5 shadow-2xl border border-gray-100 text-xs">
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="font-bold text-[#FE9F43] bg-[#FE9F43]/10 px-2 py-0.5 rounded text-[10px]">
                    {viewingDeal.dealCode}
                  </span>
                  <h3 className="text-sm font-bold text-[#1E293B] mt-1">{viewingDeal.title}</h3>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 space-y-2 text-[#334155]">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-[#94A3B8]">Customer:</span>
                  <span className="font-semibold">{viewingDeal.contactName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-[#94A3B8]">Phone:</span>
                  <span className="font-semibold">{viewingDeal.contactPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-[#94A3B8]">Value:</span>
                  <span className="font-bold text-[#FE9F43]">฿{viewingDeal.estimatedValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-[#94A3B8]">Stage:</span>
                  <span className="font-semibold">{viewingDeal.stage?.name}</span>
                </div>
                {viewingDeal.siteAddress && (
                  <div className="py-1 border-b border-gray-50">
                    <span className="text-[#94A3B8] block text-[10px]">Address:</span>
                    <span className="font-medium text-[11px]">{viewingDeal.siteAddress}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-3 py-1 bg-gray-100 text-[#475569] rounded-lg text-xs font-semibold hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modals */}
        {addSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-5 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Deal Created!</h3>
              <p className="text-xs text-slate-500 mt-1">{createdDealTitle}</p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    setAddSuccessModal(false);
                    handleOpenCreateModal();
                  }}
                  className="flex-1 py-1.5 px-3 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold"
                >
                  + Add Another
                </button>
                <button
                  onClick={() => setAddSuccessModal(false)}
                  className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {editSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-5 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Deal Updated!</h3>
              <p className="text-xs text-slate-500 mt-1">{updatedDealTitle}</p>
              <div className="mt-5">
                <button
                  onClick={() => setEditSuccessModal(false)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-5 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">ยืนยันการลบดีล?</h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณแน่ใจหรือไม่ว่าต้องการลบ <br />
                <span className="font-bold text-slate-800">{dealToDelete?.title}</span> ?
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setDeleteConfirmModal(false)}
                  className="flex-1 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDeal}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-5 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">ลบข้อมูลสำเร็จ!</h3>
              <p className="text-xs text-slate-500 mt-1">ลบรายการดีลเรียบร้อยแล้ว</p>
              <div className="mt-5">
                <button
                  onClick={() => setDeleteSuccessModal(false)}
                  className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {convertSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-5 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">แปลงเป็นโครงการสำเร็จ!</h3>
              <p className="text-xs text-slate-500 mt-1">
                สร้างโครงการรหัส <br />
                <span className="font-bold text-[#FE9F43] text-sm">{convertedProjectCode}</span>
              </p>
              <div className="mt-5">
                <button
                  onClick={() => setConvertSuccessModal(false)}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
