"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Order } from "@/types";
import { fetchOrders } from "@/lib/api";
import {
  FileText,
  Search,
  CheckCircle2,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  Eye,
  Printer,
  X,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Orders & Receipts</h1>
            <p className="text-sm text-gray-500 mt-1">Complete sales history from all POS terminals.</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search order number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white text-gray-700"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-4 py-4">Customer</th>
                  <th className="px-4 py-4">Payment</th>
                  <th className="px-4 py-4">Items Count</th>
                  <th className="px-4 py-4">Total Amount</th>
                  <th className="px-4 py-4">Cashier</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-4">{order.customer?.name || "Walk-in Customer"}</td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-4">{order.items?.length || 0} items</td>
                    <td className="px-4 py-4 font-extrabold text-gray-900">฿{order.total.toLocaleString()}</td>
                    <td className="px-4 py-4 text-xs text-gray-500">{order.cashierName}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 font-semibold text-xs inline-flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receipt Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">Receipt Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">ABC POS RETAIL</h2>
                <p className="text-xs text-gray-400">Order: {selectedOrder.orderNumber}</p>
                <p className="text-xs text-gray-400">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-800">{item.productName}</p>
                      <p className="text-gray-400">
                        {item.quantity} x ฿{item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">฿{item.subtotal.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="pt-2 border-t border-gray-200 text-xs space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>฿{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount:</span>
                    <span>-฿{selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT (7%):</span>
                  <span>฿{selectedOrder.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total:</span>
                  <span className="text-orange-600">฿{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
