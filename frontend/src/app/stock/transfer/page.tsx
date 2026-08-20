"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StockTransfer, Warehouse } from "@/types";
import {
  fetchStockTransfers,
  createStockTransferApi,
  deleteStockTransferApi,
  fetchWarehouses,
} from "@/lib/api";
import {
  PlusCircle,
  Download,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  Edit,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";

export default function StockTransferPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [fromWarehouseFilter, setFromWarehouseFilter] = useState<string>("all");
  const [toWarehouseFilter, setToWarehouseFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [fromWh, setFromWh] = useState<string>("");
  const [toWh, setToWh] = useState<string>("");
  const [noOfProds, setNoOfProds] = useState<number>(1);
  const [qtyTransferred, setQtyTransferred] = useState<number>(1);
  const [refNum, setRefNum] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sample transfers matching Screenshot 1
  const sampleTransfersList = [
    { id: "1", fromWarehouse: "Lavish Warehouse", toWarehouse: "North Zone Warehouse", noOfProducts: 20, quantityTransferred: 15, refNumber: "#458924", date: "24 Dec 2024" },
    { id: "2", fromWarehouse: "Lobar Handy", toWarehouse: "Nova Storage Hub", noOfProducts: 4, quantityTransferred: 14, refNumber: "#145445", date: "25 Jul 2023" },
    { id: "3", fromWarehouse: "Quaint Warehouse", toWarehouse: "Cool Warehouse", noOfProducts: 21, quantityTransferred: 10, refNumber: "#135478", date: "28 Jul 2023" },
    { id: "4", fromWarehouse: "Traditional Warehouse", toWarehouse: "Retail Supply Hub", noOfProducts: 15, quantityTransferred: 14, refNumber: "#145124", date: "24 Jul 2023" },
    { id: "5", fromWarehouse: "Cool Warehouse", toWarehouse: "EdgeWare Solutions", noOfProducts: 14, quantityTransferred: 74, refNumber: "#474541", date: "15 Jul 2023" },
    { id: "6", fromWarehouse: "Overflow Warehouse", toWarehouse: "Quaint Warehouse", noOfProducts: 30, quantityTransferred: 20, refNumber: "#366713", date: "06 Nov 2024" },
    { id: "7", fromWarehouse: "Nova Storage Hub", toWarehouse: "Traditional Warehouse", noOfProducts: 10, quantityTransferred: 6, refNumber: "#327814", date: "25 Oct 2024" },
    { id: "8", fromWarehouse: "Retail Supply Hub", toWarehouse: "Overflow Warehouse", noOfProducts: 70, quantityTransferred: 60, refNumber: "#274509", date: "14 Oct 2024" },
    { id: "9", fromWarehouse: "EdgeWare Solutions", toWarehouse: "Lavish Warehouse", noOfProducts: 35, quantityTransferred: 30, refNumber: "#239073", date: "03 Oct 2024" },
    { id: "10", fromWarehouse: "North Zone Warehouse", toWarehouse: "Fulfillment Hub", noOfProducts: 15, quantityTransferred: 10, refNumber: "#187204", date: "20 Sep 2024" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [tData, whData] = await Promise.all([
        fetchStockTransfers({ fromWarehouse: fromWarehouseFilter, toWarehouse: toWarehouseFilter, search }),
        fetchWarehouses(),
      ]);
      setTransfers(tData);
      setWarehouses(whData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fromWarehouseFilter, toWarehouseFilter, search]);

  const handleOpenAddModal = () => {
    setFromWh("");
    setToWh("");
    setNoOfProds(1);
    setQtyTransferred(1);
    setRefNum(`#${Math.floor(100000 + Math.random() * 900000)}`);
    setShowModal(true);
  };

  const handleSaveTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromWh || !toWh) {
      alert("Please select both From Warehouse and To Warehouse");
      return;
    }
    if (fromWh === toWh) {
      alert("From Warehouse and To Warehouse cannot be the same");
      return;
    }

    try {
      setIsSubmitting(true);
      await createStockTransferApi({
        fromWarehouse: fromWh,
        toWarehouse: toWh,
        noOfProducts: noOfProds,
        quantityTransferred: qtyTransferred,
        refNumber: refNum,
      });
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this stock transfer record?")) {
      try {
        await deleteStockTransferApi(id);
        loadData();
      } catch (err: any) {
        alert(err.message || "Failed to delete transfer");
      }
    }
  };

  const displayList =
    transfers.length > 0
      ? transfers.map((t) => ({
          id: t.id,
          fromWarehouse: t.fromWarehouse,
          toWarehouse: t.toWarehouse,
          noOfProducts: t.noOfProducts,
          quantityTransferred: t.quantityTransferred,
          refNumber: t.refNumber,
          date: new Date(t.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        }))
      : sampleTransfersList;

  const filteredDisplay = displayList.filter((item) => {
    const matchesSearch =
      item.refNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.fromWarehouse.toLowerCase().includes(search.toLowerCase()) ||
      item.toWarehouse.toLowerCase().includes(search.toLowerCase());
    const matchesFrom = fromWarehouseFilter === "all" || item.fromWarehouse === fromWarehouseFilter;
    const matchesTo = toWarehouseFilter === "all" || item.toWarehouse === toWarehouseFilter;
    return matchesSearch && matchesFrom && matchesTo;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDisplay.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDisplay.map((t) => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Stock Transfer</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your stock transfer</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export (Red) */}
            <button
              title="Export PDF"
              onClick={() => alert("Exporting PDF report...")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel Export (Green) */}
            <button
              title="Export Excel"
              onClick={() => alert("Exporting Excel report...")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
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

            {/* + Add New Button (Orange) */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>

            {/* Import Transfer Button (Dark Navy) */}
            <button
              onClick={() => alert("Import Transfer CSV/Excel modal")}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0E1422] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import Transfer</span>
            </button>
          </div>
        </div>

        {/* Stock Transfer Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-60">
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
                  value={fromWarehouseFilter}
                  onChange={(e) => setFromWarehouseFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">From Warehouse</option>
                  {sampleTransfersList.map((t, idx) => (
                    <option key={idx} value={t.fromWarehouse}>
                      {t.fromWarehouse}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={toWarehouseFilter}
                  onChange={(e) => setToWarehouseFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">To Warehouse</option>
                  {sampleTransfersList.map((t, idx) => (
                    <option key={idx} value={t.toWarehouse}>
                      {t.toWarehouse}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="last7days">Sort By : Last 7 Days</option>
                  <option value="last30days">Sort By : Last 30 Days</option>
                  <option value="newest">Sort By : Newest</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Clean Table with White Thead */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredDisplay.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">From Warehouse</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">To Warehouse</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">No of Products</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Quantity Transferred</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Ref Number</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {filteredDisplay.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F9FAFB] transition-colors ${
                        isSelected ? "bg-[#FFF8F2]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-normal text-[#1E293B]">{item.fromWarehouse}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.toWarehouse}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.noOfProducts}</td>
                      <td className="py-3.5 px-4 text-[#64748B] font-medium">{item.quantityTransferred}</td>
                      <td className="py-3.5 px-4 text-[#64748B] font-mono">{item.refNumber}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.date}</td>

                      {/* Actions: Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            title="Edit Transfer"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete Transfer"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center transition-colors bg-white"
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
                <select className="appearance-none bg-white border border-[#E2E8F0] rounded pl-2.5 pr-6 py-1 text-xs text-[#334155] focus:outline-none cursor-pointer">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span>Entries</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#94A3B8]">
                &lt;
              </button>
              <button className="w-6 h-6 rounded-full bg-[#FE9F43] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                1
              </button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">
                2
              </button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Add Stock Transfer Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Add Stock Transfer</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTransfer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    From Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={fromWh}
                    onChange={(e) => setFromWh(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  >
                    <option value="">Select Warehouse</option>
                    <option value="Lavish Warehouse">Lavish Warehouse</option>
                    <option value="Quaint Warehouse">Quaint Warehouse</option>
                    <option value="Traditional Warehouse">Traditional Warehouse</option>
                    <option value="Cool Warehouse">Cool Warehouse</option>
                    <option value="Overflow Warehouse">Overflow Warehouse</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    To Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={toWh}
                    onChange={(e) => setToWh(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  >
                    <option value="">Select Warehouse</option>
                    <option value="North Zone Warehouse">North Zone Warehouse</option>
                    <option value="Nova Storage Hub">Nova Storage Hub</option>
                    <option value="Retail Supply Hub">Retail Supply Hub</option>
                    <option value="EdgeWare Solutions">EdgeWare Solutions</option>
                    <option value="Fulfillment Hub">Fulfillment Hub</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">No of Products</label>
                    <input
                      type="number"
                      min={1}
                      value={noOfProds}
                      onChange={(e) => setNoOfProds(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={qtyTransferred}
                      onChange={(e) => setQtyTransferred(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Reference Number</label>
                  <input
                    type="text"
                    value={refNum}
                    onChange={(e) => setRefNum(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-sm active:scale-95 transition-all"
                  >
                    {isSubmitting ? "Saving..." : "Create Transfer"}
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
