"use client";

import React, { useEffect, useState } from "react";
import { fetchCategories, fetchProducts, createOrderApi } from "@/lib/api";
import { Category, Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  User,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle,
  Printer,
  X,
} from "lucide-react";

export default function POSPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "PROMPTPAY" | "CREDIT_CARD">("CASH");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const {
    items: cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    discount,
    setDiscount,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
  } = useCartStore();

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        fetchCategories(),
        fetchProducts({ categoryId: selectedCategory, search: searchQuery }),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error("Failed to load POS data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const handleBarcodeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const match = products.find(
        (p) =>
          p.barcode === searchQuery.trim() ||
          p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (match) {
        addToCart(match);
        setSearchQuery("");
      }
    }
  };

  const handleCheckoutSubmit = async () => {
    if (cartItems.length === 0) return;

    try {
      setIsProcessing(true);
      const orderData = await createOrderApi({
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        discount,
        tax: getTax(),
        paymentMethod,
        cashierName: "Admin",
      });

      setCompletedOrder(orderData);
      clearCart();
      // reload product stock
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const change = Math.max(0, Number(cashReceived || 0) - total);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top POS Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
              POS
            </div>
            <span className="font-bold text-gray-900 text-base">Terminal #01</span>
          </div>
        </div>

        {/* Live Search & Barcode Scan */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search product name, SKU or scan barcode (Enter)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeSearch}
              className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white text-gray-800"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <Barcode className="w-4 h-4 text-orange-500 absolute right-3 top-2.5 cursor-pointer" />
          </div>
        </div>

        {/* Cashier & Status */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
              AD
            </div>
            <span className="text-xs font-semibold text-gray-700 hidden md:inline">Admin Cashier</span>
          </div>
        </div>
      </header>

      {/* Main Screen: Product Grid (Left) + Cart Sidebar (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Section: Categories & Products */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {products.map((product) => {
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`bg-white rounded-2xl p-3.5 border border-gray-200 flex flex-col justify-between transition-all duration-200 ${
                    isOutOfStock
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:border-orange-400 hover:shadow-md cursor-pointer active:scale-98"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Placeholder image box */}
                    <div className="w-full aspect-square rounded-xl bg-orange-50/60 border border-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg relative overflow-hidden">
                      <span>{product.name.slice(0, 2).toUpperCase()}</span>
                      <span
                        className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          product.stock <= 3
                            ? "bg-red-500 text-white"
                            : "bg-white/90 text-gray-700 shadow-sm"
                        }`}
                      >
                        Stock: {product.stock}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{product.sku}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm font-extrabold text-orange-600">
                      ฿{product.price.toLocaleString()}
                    </span>
                    <button
                      disabled={isOutOfStock}
                      className="w-7 h-7 rounded-lg bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 flex items-center justify-center text-xs font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {products.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center text-gray-400">
                No products found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Interactive POS Cart */}
        <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col justify-between shadow-lg">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-gray-900 text-base">Current Order</h3>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Customer Selector */}
            <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs">
              <div className="flex items-center space-x-2 text-gray-700 font-medium">
                <User className="w-4 h-4 text-gray-400" />
                <span>Walk-in Customer</span>
              </div>
              <span className="text-orange-600 font-semibold cursor-pointer hover:underline">
                Change
              </span>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-4 overflow-y-auto divide-y divide-gray-100 max-h-[420px]">
            {cartItems.map((item) => (
              <div key={item.product.id} className="py-3 flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-orange-600 font-semibold mt-0.5">
                    ฿{item.product.price.toLocaleString()}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-gray-500 hover:text-gray-900"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:text-gray-900"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-gray-900 w-16 text-right">
                    ฿{(item.product.price * item.quantity).toLocaleString()}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {cartItems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-gray-400">
                <ShoppingCart className="w-12 h-12 stroke-1 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-500">Cart is Empty</p>
                <p className="text-xs text-gray-400 mt-1">Select items from the catalog to start</p>
              </div>
            )}
          </div>

          {/* Cart Pricing & Checkout Button */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Discount</span>
                <div className="flex items-center space-x-1">
                  <span>-฿</span>
                  <input
                    type="number"
                    min="0"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="w-16 px-1.5 py-0.5 bg-white border border-gray-300 rounded text-right font-semibold focus:outline-none focus:ring-1 focus:ring-orange-400 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span>VAT (7%)</span>
                <span className="font-semibold text-gray-800">฿{tax.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">Total Payable</span>
                <span className="text-xl font-extrabold text-orange-600">
                  ฿{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Checkout Button */}
            <button
              onClick={() => {
                setCashReceived(String(total));
                setShowCheckoutModal(true);
              }}
              disabled={cartItems.length === 0}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <Banknote className="w-5 h-5" />
              <span>Charge ฿{total.toLocaleString()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            {!completedOrder ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-gray-900">Payment Checkout</h3>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Total amount banner */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Total Amount Due</p>
                  <h2 className="text-3xl font-extrabold text-orange-600 mt-1">
                    ฿{total.toLocaleString()}
                  </h2>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CASH")}
                      className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 text-xs font-bold transition-all ${
                        paymentMethod === "CASH"
                          ? "border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-400/20"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <span>Cash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("PROMPTPAY")}
                      className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 text-xs font-bold transition-all ${
                        paymentMethod === "PROMPTPAY"
                          ? "border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-400/20"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span>PromptPay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CREDIT_CARD")}
                      className={`p-3 rounded-xl border flex flex-col items-center space-y-1.5 text-xs font-bold transition-all ${
                        paymentMethod === "CREDIT_CARD"
                          ? "border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-400/20"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Card</span>
                    </button>
                  </div>
                </div>

                {/* Cash Calculation */}
                {paymentMethod === "CASH" && (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-700">Cash Received (฿)</label>
                      <input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="w-32 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-right font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                      />
                    </div>

                    {/* Quick amount presets */}
                    <div className="flex space-x-1.5">
                      {[total, 100, 500, 1000].map((amt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCashReceived(String(amt))}
                          className="flex-1 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors"
                        >
                          {amt === total ? "Exact" : `฿${amt}`}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-600">Change Due:</span>
                      <span className="text-base font-bold text-emerald-600">฿{change.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* PromptPay QR Preview */}
                {paymentMethod === "PROMPTPAY" && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2">
                    <div className="w-36 h-36 mx-auto bg-white border border-gray-300 rounded-xl flex items-center justify-center p-2">
                      <QrCode className="w-28 h-28 text-slate-800" />
                    </div>
                    <p className="text-xs font-semibold text-gray-600">Scan Thai QR PromptPay</p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isProcessing || (paymentMethod === "CASH" && Number(cashReceived) < total)}
                  onClick={handleCheckoutSubmit}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-98 transition-all"
                >
                  {isProcessing ? "Processing Order..." : "Confirm & Complete Sale"}
                </button>
              </>
            ) : (
              /* Success / Receipt Screen */
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Order <span className="font-bold text-gray-700">{completedOrder.orderNumber}</span> recorded.
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="font-bold text-gray-800">{completedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Paid:</span>
                    <span className="font-bold text-emerald-600">฿{completedOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cashier:</span>
                    <span className="font-semibold text-gray-800">{completedOrder.cashierName}</span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    onClick={() => {
                      setCompletedOrder(null);
                      setShowCheckoutModal(false);
                    }}
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20"
                  >
                    Next Sale
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
