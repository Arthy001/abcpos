"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { useModuleStore } from "@/store/useModuleStore";
import { BusinessPresetType, SystemModule } from "@/types";
import {
  ShoppingBag,
  Package,
  DollarSign,
  Users,
  Tag,
  Truck,
  Factory,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  Check,
  Lock,
  ArrowRight,
  Shield,
  Sliders,
  Boxes,
  HelpCircle,
  Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Package,
  DollarSign,
  Users,
  Tag,
  Truck,
  Factory,
  Layers,
};

const PRESET_CONFIGS: {
  key: BusinessPresetType;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  description: string;
  included: string[];
}[] = [
  {
    key: "RETAIL_SME",
    title: "ร้านค้าปลีกทั่วไป (Retail SME)",
    subtitle: "Scale 1: เน้นความเรียบง่าย คล่องตัว เมนูไม่รก",
    badge: "Simple & Clean",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: ShoppingBag,
    description: "เหมาะสำหรับร้านขายของชำ มินิมาร์ท ร้านขายยา ร้านค้าปลีกทั่วไป มีจุดขาย POS + คลังสินค้า + รายรับรายจ่าย",
    included: ["จุดขาย POS", "คลังสินค้า & สต็อก", "รายรับ-รายจ่าย", "คูปอง & โปรโมชั่น"],
  },
  {
    key: "WHOLESALE_TRADING",
    title: "ค้าส่ง & ตัวแทนจำหน่าย (Wholesale & Trading)",
    subtitle: "Scale 2: ระบบเสนอราคา ส่งของ และวางบิลเครดิต",
    badge: "B2B Ready",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Truck,
    description: "เหมาะสำหรับร้านยี่ปั๊ว-ซาปั๊ว ตัวแทนกระจายสินค้า นำเข้าส่งออก มีลูกหนี้การค้า เครดิต 30-60 วัน และจัดการทีมงาน",
    included: ["ฟังก์ชัน Retail ทั้งหมด", "ใบเสนอราคา & สั่งขาย (SO)", "ลูกหนี้เครดิตเทอม", "บริหารพนักงาน (HRM)"],
  },
  {
    key: "MANUFACTURING_FACTORY",
    title: "โรงงานผลิตถุงพลาสติก (Plastic Factory ERP)",
    subtitle: "Scale 3: ครบวงจรตั้งแต่สูตรเม็ดพลาสติกจนถึงสินค้าสำเร็จรูป",
    badge: "Full ERP",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Factory,
    description: "เหมาะสำหรับโรงงานเป่าถุงพลาสติก ฉีดขึ้นรูป สั่งผลิตตามออเดอร์ ควบคุม BOM เม็ดพลาสติก บันทึกขี้กระบอก และคิดต้นทุนจริง",
    included: ["ฟังก์ชันทุกระบบในโปรแกรม", "สูตรการผลิต (BOM)", "คำสั่งผลิต (Work Orders)", "บันทึกเศษกากรีไซเคิล (Scrap)"],
  },
];

export default function AppModulesPage() {
  const { modules, loading, fetchModules, toggleModule, applyPreset } = useModuleStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activePresetApplying, setActivePresetApplying] = useState<BusinessPresetType | null>(null);
  const [togglingCode, setTogglingCode] = useState<string | null>(null);

  // Modals state according to GEMINI.md
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: "", message: "" });

  const [errorModal, setErrorModal] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Determine current active preset if matches
  const currentActivePreset = useMemo(() => {
    if (!modules || modules.length === 0) return null;
    const isMrpOn = modules.find((m) => m.code === "MANUFACTURING_MRP")?.isEnabled;
    const isB2bOn = modules.find((m) => m.code === "B2B_WHOLESALE")?.isEnabled;
    const isHrmOn = modules.find((m) => m.code === "HRM_PAYROLL")?.isEnabled;

    if (isMrpOn && isB2bOn) return "MANUFACTURING_FACTORY";
    if (isB2bOn && !isMrpOn) return "WHOLESALE_TRADING";
    if (!isMrpOn && !isB2bOn && !isHrmOn) return "RETAIL_SME";
    return null; // Custom configuration
  }, [modules]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    modules.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [modules]);

  // Filtered modules
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "ALL" || m.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [modules, searchQuery, selectedCategory]);

  // Handle Preset Switching
  const handleApplyPreset = async (preset: BusinessPresetType) => {
    try {
      setActivePresetApplying(preset);
      const ok = await applyPreset(preset);
      if (ok) {
        const presetConfig = PRESET_CONFIGS.find((p) => p.key === preset);
        setSuccessModal({
          show: true,
          title: "Business Preset Applied!",
          message: `สลับรูปแบบการใช้งานเป็น "${presetConfig?.title}" สำเร็จแล้ว ระบบได้ปรับเมนูและโมดูลให้เหมาะสมกับขนาดธุรกิจของคุณโดยอัตโนมัติ`,
        });
      } else {
        setErrorModal({
          show: true,
          message: "ไม่สามารถเปลี่ยน Preset ธุรกิจได้ กรุณาลองใหม่อีกครั้ง",
        });
      }
    } catch (err: any) {
      setErrorModal({
        show: true,
        message: err.message || "เกิดข้อผิดพลาดในการนำ Preset ไปใช้",
      });
    } finally {
      setActivePresetApplying(null);
    }
  };

  // Handle Individual Module Toggle
  const handleToggle = async (module: SystemModule) => {
    if (module.isCore) {
      setErrorModal({
        show: true,
        message: "โมดูลหลัก (Core Module) เป็นส่วนสำคัญของระบบ ไม่สามารถปิดการใช้งานได้",
      });
      return;
    }

    try {
      setTogglingCode(module.code);
      const nextState = !module.isEnabled;
      const ok = await toggleModule(module.code, nextState);
      if (ok) {
        setSuccessModal({
          show: true,
          title: "Module Updated!",
          message: `${nextState ? "เปิดใช้งาน" : "ปิดการใช้งาน"} โมดูล "${module.name}" เรียบร้อยแล้ว`,
        });
      } else {
        setErrorModal({
          show: true,
          message: `ไม่สามารถปรับสถานะโมดูล ${module.name} ได้`,
        });
      }
    } catch (err: any) {
      setErrorModal({
        show: true,
        message: err.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะโมดูล",
      });
    } finally {
      setTogglingCode(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">App Modules & Business Scales</h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-orange-50 text-[#FE9F43] border border-orange-200 rounded-full">
                Modular ERP
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              เปิด-ปิดโมดูลตามความต้องการแบบ Odoo ปรับขนาดโปรแกรมให้เข้ากับระดับธุรกิจตั้งแต่หน้าร้านทั่วไปจนถึงโรงงานผลิต
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              title="Refresh"
              onClick={() => fetchModules()}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Settings Sidebar */}
          <SettingsSidebar />

          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-6">
            {/* 1. BUSINESS SCALE PRESETS (QUICK SWITCHER) */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FE9F43]" />
                    Business Scale Presets (ทางลัดเปลี่ยนขนาดธุรกิจ)
                  </h2>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    เลือกสเกลธุรกิจที่ตรงกับการใช้งานปัจจุบัน ระบบจะเปิด-ปิดโมดูลและเมนูที่เกี่ยวข้องให้โดยอัตโนมัติ
                  </p>
                </div>
                {currentActivePreset && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    โหมดปัจจุบัน: {PRESET_CONFIGS.find((p) => p.key === currentActivePreset)?.badge}
                  </span>
                )}
                {!currentActivePreset && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    โหมดกำหนดเอง (Custom Config)
                  </span>
                )}
              </div>

              {/* Preset Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PRESET_CONFIGS.map((preset) => {
                  const Icon = preset.icon;
                  const isCurrent = currentActivePreset === preset.key;
                  const isApplying = activePresetApplying === preset.key;

                  return (
                    <div
                      key={preset.key}
                      className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                        isCurrent
                          ? "border-[#FE9F43] bg-[#FFFBF7] shadow-sm ring-1 ring-[#FE9F43]"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs"
                      }`}
                    >
                      <div>
                        {/* Header: Icon & Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              isCurrent ? "bg-[#FE9F43] text-white" : "bg-gray-100 text-[#64748B]"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                            {preset.badge}
                          </span>
                        </div>

                        {/* Title & Desc */}
                        <h3 className="text-xs font-bold text-[#1E293B] mb-1">{preset.title}</h3>
                        <p className="text-[11px] text-[#64748B] mb-3 leading-relaxed">{preset.description}</p>

                        {/* Included Features List */}
                        <div className="space-y-1.5 mb-4 border-t border-gray-100 pt-3">
                          <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1">
                            ฟังก์ชันที่เปิดใช้งาน:
                          </span>
                          {preset.included.map((inc, i) => (
                            <div key={i} className="flex items-center space-x-1.5 text-[11px] text-[#475569]">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{inc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset.key)}
                        disabled={isCurrent || isApplying}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                            : "bg-[#1E293B] text-white hover:bg-[#0F172A] shadow-2xs"
                        } disabled:opacity-70`}
                      >
                        {isCurrent ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ใช้งานอยู่ขณะนี้</span>
                          </>
                        ) : isApplying ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>กำลังเปิดสวิตช์ระบบ...</span>
                          </>
                        ) : (
                          <>
                            <span>เลือกสเกลนี้</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. INDIVIDUAL MODULES MANAGER */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#FE9F43]" />
                    Installed Modules ({modules.filter((m) => m.isEnabled).length}/{modules.length} Active)
                  </h2>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    ปรับแต่งและเปิด/ปิดโมดูลอิสระตามความเหมาะสมของร้านหรือสายการผลิตของคุณ
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search module..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#FE9F43] focus:ring-1 focus:ring-[#FE9F43] transition-all"
                  />
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 mb-5 border-b border-gray-100 pb-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#FE9F43] text-white shadow-2xs font-semibold"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat === "ALL" ? "All Modules" : cat}
                  </button>
                ))}
              </div>

              {/* Module Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModules.map((mod) => {
                  const Icon = ICON_MAP[mod.icon] || Boxes;
                  const isBusy = togglingCode === mod.code;

                  return (
                    <div
                      key={mod.code}
                      className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
                        mod.isEnabled
                          ? "border-emerald-200 bg-white shadow-xs"
                          : "border-gray-200 bg-gray-50/60 opacity-80"
                      }`}
                    >
                      <div>
                        {/* Top: Icon + Title + Status Switch */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                mod.isEnabled
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-xs font-bold text-[#1E293B]">{mod.name}</h4>
                                {mod.badge && (
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                      mod.badge === "Essential"
                                        ? "bg-amber-100 text-amber-800"
                                        : mod.badge === "Enterprise"
                                        ? "bg-purple-100 text-purple-800"
                                        : mod.badge === "Popular"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-200 text-gray-700"
                                    }`}
                                  >
                                    {mod.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{mod.code}</span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="flex items-center space-x-2 shrink-0">
                            {mod.isCore ? (
                              <div
                                title="โมดูลหลัก จำเป็นต่อระบบ ไม่สามารถปิดได้"
                                className="flex items-center space-x-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-semibold"
                              >
                                <Lock className="w-3 h-3 text-gray-400" />
                                <span>Core</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggle(mod)}
                                disabled={isBusy}
                                title={mod.isEnabled ? "คลิกเพื่อปิดใช้งานโมดูล" : "คลิกเพื่อเปิดใช้งานโมดูล"}
                                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  mod.isEnabled ? "bg-emerald-500" : "bg-gray-300"
                                } disabled:opacity-50`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    mod.isEnabled ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-[#64748B] leading-relaxed mb-3">{mod.description}</p>
                      </div>

                      {/* Footer Info: Category & Active status */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px]">
                        <span className="text-gray-400 font-medium">{mod.category}</span>
                        <span
                          className={`font-semibold flex items-center space-x-1 ${
                            mod.isEnabled ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${mod.isEnabled ? "bg-emerald-500" : "bg-gray-400"}`}
                          />
                          <span>{mod.isEnabled ? "Active" : "Disabled"}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🌟 EDIT SUCCESS MODAL (GEMINI.md Standard: Blue CheckCircle2 + OK) */}
      {/* ======================================================== */}
      {successModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">{successModal.title}</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">{successModal.message}</p>
            <button
              type="button"
              onClick={() => setSuccessModal({ show: false, title: "", message: "" })}
              className="w-full py-2.5 px-4 bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ⚠️ ERROR MODAL (GEMINI.md Standard: Rose AlertTriangle + OK) */}
      {/* ======================================================== */}
      {errorModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Operation Notice</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">{errorModal.message}</p>
            <button
              type="button"
              onClick={() => setErrorModal({ show: false, message: "" })}
              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
