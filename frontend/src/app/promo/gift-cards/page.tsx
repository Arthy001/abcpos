"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GiftCard } from "@/types";
import {
  fetchGiftCards,
  createGiftCardApi,
  updateGiftCardApi,
  deleteGiftCardApi,
} from "@/lib/api";
import {
  PlusCircle,
  Search,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Gift,
} from "lucide-react";

export default function GiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
  const [deleteConfirmCard, setDeleteConfirmCard] = useState<GiftCard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formCode, setFormCode] = useState<string>("");
  const [formCustomer, setFormCustomer] = useState<string>("");
  const [formAmount, setFormAmount] = useState<string>("");
  const [formExpiry, setFormExpiry] = useState<string>("");

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "edit_success" | "delete_success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "add_success",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchGiftCards();
      setCards(data || []);
    } catch (err) {
      console.error("Failed to fetch gift cards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCard(null);
    setFormCode("GC-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000));
    setFormCustomer("");
    setFormAmount("");
    setFormExpiry(new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0]);
    setShowModal(true);
  };

  const handleOpenEditModal = (item: GiftCard) => {
    setEditingCard(item);
    setFormCode(item.code);
    setFormCustomer(item.customerName);
    setFormAmount(item.amount.toString());
    setFormExpiry(item.expiryDate);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomer.trim() || !formAmount) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Information",
        message: "Please enter customer name and gift amount.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<GiftCard> = {
        code: formCode,
        customerName: formCustomer,
        amount: Number(formAmount) || 0,
        balance: Number(formAmount) || 0,
        expiryDate: formExpiry,
      };

      if (editingCard) {
        await updateGiftCardApi(editingCard.id, payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "edit_success",
          title: "Gift Card Updated!",
          message: "Gift card " + formCode + " has been updated.",
        });
      } else {
        await createGiftCardApi(payload);
        setShowModal(false);
        setFeedbackModal({
          isOpen: true,
          type: "add_success",
          title: "Gift Card Created!",
          message: "Gift card of ฿" + Number(formAmount).toLocaleString() + " issued for " + formCustomer + ".",
        });
      }
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Operation Failed",
        message: err.message || "Failed to save gift card.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCard) return;
    try {
      await deleteGiftCardApi(deleteConfirmCard.id);
      const deletedCode = deleteConfirmCard.code;
      setDeleteConfirmCard(null);
      setFeedbackModal({
        isOpen: true,
        type: "delete_success",
        title: "Gift Card Deleted!",
        message: "Gift card " + deletedCode + " has been removed.",
      });
      loadData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.message || "Failed to delete gift card.",
      });
    }
  };

  const filteredDisplay = useMemo(() => {
    return cards.filter((item) =>
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase())
    );
  }, [cards, search]);

  const totalPages = Math.ceil(filteredDisplay.length / pageSize) || 1;
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDisplay.slice(start, start + pageSize);
  }, [filteredDisplay, currentPage, pageSize]);

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Gift Cards</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage Prepaid Customer Gift Cards & Balances</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className={"w-3.5 h-3.5 " + (loading ? "animate-spin text-[#FE9F43]" : "")} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Issue Gift Card</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search card code, customer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px] -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827]">Card Code</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Customer</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Issued Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Expiry Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Balance</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827] w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#9CA3AF]">
                      <div className="inline-flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 animate-spin text-[#FE9F43]" />
                        <span>Loading gift cards...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#9CA3AF]">
                      No gift cards found
                    </td>
                  </tr>
                ) : (
                  paginatedCards.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1E293B]">
                        <div className="flex items-center space-x-2">
                          <Gift className="w-4 h-4 text-[#FE9F43]" />
                          <span>{item.code}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#111827]">
                        {item.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B7280]">{item.issuedDate}</td>
                      <td className="py-3.5 px-4 text-[#6B7280]">{item.expiryDate}</td>
                      <td className="py-3.5 px-4 font-bold text-[#111827]">
                        ฿{item.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        ฿{item.balance.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            title="Edit Card"
                            onClick={() => handleOpenEditModal(item)}
                            className="w-7 h-7 rounded-md border border-[#E5E7EB] hover:bg-blue-50 text-[#6B7280] hover:text-[#2563EB] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Card"
                            onClick={() => setDeleteConfirmCard(item)}
                            className="w-7 h-7 rounded-md border border-[#E5E7EB] hover:bg-rose-50 text-[#6B7280] hover:text-[#E11D48] flex items-center justify-center transition-colors cursor-pointer"
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#F1F3F5] text-xs text-[#6B7280]">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#E5E7EB] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span>entries (Total {filteredDisplay.length})</span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <span className="px-3 py-1 bg-[#FE9F43] text-white rounded font-bold">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 border border-[#E5E7EB] rounded hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150 border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingCard ? "Edit Gift Card" : "Issue Gift Card"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Card Code *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="GC-1234-5678"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formCustomer}
                    onChange={(e) => setFormCustomer(e.target.value)}
                    placeholder="e.g. Somchai Jaidee"
                    className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Card Amount (฿) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="1000"
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Expiry Date</label>
                    <input
                      type="date"
                      value={formExpiry}
                      onChange={(e) => setFormExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white font-bold rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingCard ? "Update Card" : "Issue Card"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirmCard && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Gift Card</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteConfirmCard.code}"</span>?
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmCard(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center animate-in fade-in zoom-in duration-150 border border-gray-100">
              {feedbackModal.type === "add_success" && (
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "edit_success" && (
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "delete_success" && (
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
              )}
              {feedbackModal.type === "error" && (
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feedbackModal.message}</p>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2">
                {feedbackModal.type === "add_success" ? (
                  <>
                    <button
                      onClick={() => {
                        setFeedbackModal({ ...feedbackModal, isOpen: false });
                        handleOpenAddModal();
                      }}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + Add Another
                    </button>
                    <button
                      onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                      className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                    className="px-6 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
