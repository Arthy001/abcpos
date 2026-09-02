"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { DeleteAccountRequestItem } from "@/types";
import {
  fetchDeleteAccountRequests,
  deleteAccountRequestActionApi,
} from "@/lib/api";
import {
  Search,
  RotateCcw,
  ChevronUp,
  Trash2,
  Printer,
  FileSpreadsheet,
  FileText,
  User,
} from "lucide-react";

export default function DeleteAccountRequestsPage() {
  const [requests, setRequests] = useState<DeleteAccountRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Delete Action Modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<DeleteAccountRequestItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const sampleRequests: DeleteAccountRequestItem[] = [
    { id: "1", userName: "Steven", requisitionDate: "25 Sep 2023", deleteRequestDate: "01 Oct 2023", userAvatar: "/assets/images/avatar-01.jpg" },
    { id: "2", userName: "Susan Lopez", requisitionDate: "30 Sep 2023", deleteRequestDate: "05 Oct 2023", userAvatar: "/assets/images/customer12.jpg" },
    { id: "3", userName: "Robert Grossman", requisitionDate: "10 Sep 2023", deleteRequestDate: "25 Sep 2023", userAvatar: "/assets/images/customer13.jpg" },
    { id: "4", userName: "Janet Hembre", requisitionDate: "15 Sep 2023", deleteRequestDate: "20 Sep 2023", userAvatar: "/assets/images/customer14.jpg" },
    { id: "5", userName: "Russell Belle", requisitionDate: "15 Aug 2023", deleteRequestDate: "01 Sep 2023", userAvatar: "/assets/images/customer15.jpg" },
    { id: "6", userName: "Henry Bryant", requisitionDate: "12 Aug 2023", deleteRequestDate: "01 Sep 2023", userAvatar: "/assets/images/avatar-02.jpg" },
    { id: "7", userName: "Michael Dawson", requisitionDate: "15 Sep 2023", deleteRequestDate: "01 Oct 2023", userAvatar: "/assets/images/customer16.jpg" },
    { id: "8", userName: "Thomas Ward", requisitionDate: "01 Jan 2023", deleteRequestDate: "01 Feb 2023", userAvatar: "/assets/images/avatar-03.jpg" },
    { id: "9", userName: "Jada Robinson", requisitionDate: "22 Oct 2023", deleteRequestDate: "15 Nov 2023", userAvatar: "/assets/images/customer17.jpg" },
    { id: "10", userName: "Aliza Duncan", requisitionDate: "02 Nov 2023", deleteRequestDate: "01 Dec 2023", userAvatar: "/assets/images/customer18.jpg" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDeleteAccountRequests({ search });
      if (data && data.length > 0) {
        setRequests(data);
      } else if (!search) {
        setRequests(sampleRequests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(err);
      setRequests(sampleRequests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleOpenDeleteModal = (req: DeleteAccountRequestItem) => {
    setSelectedRequest(req);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRequest) return;
    try {
      setIsSubmitting(true);
      try {
        await deleteAccountRequestActionApi(selectedRequest.id);
      } catch (e) {
        setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
      }
      setShowDeleteModal(false);
      loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(requests.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const totalPages = Math.ceil(requests.length / pageSize) || 1;
  const paginatedRequests = requests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Delete Account Request</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* PDF Export */}
            <button
              onClick={() => window.print()}
              title="Export to PDF"
              className="w-8 h-8 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Excel Export */}
            <button
              onClick={() => alert("Exporting Delete Account Requests to Excel (.xlsx)...")}
              title="Export to Excel"
              className="w-8 h-8 flex items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            {/* Print */}
            <button
              onClick={() => window.print()}
              title="Print"
              className="w-8 h-8 flex items-center justify-center rounded bg-white text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Refresh */}
            <button
              onClick={() => loadData()}
              title="Refresh"
              className="w-8 h-8 flex items-center justify-center rounded bg-white text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Collapse */}
            <button
              title="Collapse"
              className="w-8 h-8 flex items-center justify-center rounded bg-white text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          {/* Top Filter Bar */}
          <div className="p-4 border-b border-gray-100 flex items-center">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-gray-200 focus:outline-none focus:border-[#fe9f43] focus:ring-1 focus:ring-[#fe9f43]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-100 text-[12px] font-semibold text-gray-700 bg-gray-50/50">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        requests.length > 0 && selectedIds.length === requests.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">User Name</th>
                  <th className="py-3.5 px-4">Requisition Date</th>
                  <th className="py-3.5 px-4">Delete Request Date</th>
                  <th className="py-3.5 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RotateCcw className="w-5 h-5 animate-spin text-[#fe9f43]" />
                        <span>Loading delete requests...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No delete requests found.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(req.id)}
                          onChange={() => handleSelectOne(req.id)}
                          className="rounded border-gray-300 text-[#fe9f43] focus:ring-[#fe9f43] cursor-pointer"
                        />
                      </td>

                      {/* User Name + Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gray-100 flex-shrink-0 border border-gray-200">
                            {req.userAvatar ? (
                              <Image
                                src={req.userAvatar}
                                alt={req.userName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-gray-800 text-[13px]">
                            {req.userName}
                          </span>
                        </div>
                      </td>

                      {/* Requisition Date */}
                      <td className="py-3.5 px-4 text-gray-600">
                        {req.requisitionDate}
                      </td>

                      {/* Delete Request Date */}
                      <td className="py-3.5 px-4 text-gray-600">
                        {req.deleteRequestDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleOpenDeleteModal(req)}
                            title="Execute Delete Request"
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-500 transition-colors"
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

          {/* Table Footer / Pagination */}
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>Row Per Page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-200 rounded text-xs text-gray-700 bg-white focus:outline-none focus:border-[#fe9f43]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>Entries</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
                    currentPage === idx + 1
                      ? "bg-[#fe9f43] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CONFIRM DELETE ACTION MODAL ==================== */}
      {showDeleteModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Delete Account?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to proceed with deleting the account for user{" "}
              <span className="font-semibold text-gray-800">{selectedRequest.userName}</span>?
              This will permanently delete the account data.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
