"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { fetchCategories, createProductApi } from "@/lib/api";
import { Category } from "@/types";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  UploadCloud,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Sparkles,
  Info,
  CheckCircle,
} from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Form State
  const [store, setStore] = useState("Main Store");
  const [warehouse, setWarehouse] = useState("Central Warehouse");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategory, setSubCategory] = useState("General");
  const [brand, setBrand] = useState("Apple");
  const [unit, setUnit] = useState("Pcs");
  const [barcodeSymbology, setBarcodeSymbology] = useState("Code 128");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");

  // Pricing & Stocks
  const [productType, setProductType] = useState<"SINGLE" | "VARIABLE">("SINGLE");
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [taxType, setTaxType] = useState("Exclusive");
  const [taxRate, setTaxRate] = useState("7% VAT");
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);

  // Custom Fields
  const [activeCustomTab, setActiveCustomTab] = useState<"warranty" | "manufacturer" | "expiry">("warranty");
  const [warrantyPeriod, setWarrantyPeriod] = useState("1 Year");
  const [manufacturerCode, setManufacturerCode] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      })
      .catch(console.error);
  }, []);

  // Auto generate slug
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  };

  // Generate random SKU
  const generateSku = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setSku(`PROD-${random}`);
  };

  // Generate random Barcode
  const generateBarcode = () => {
    const random = Math.floor(100000000000 + Math.random() * 900000000000);
    setBarcode(`885${random}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter Product Name");
      return;
    }
    if (!sku.trim()) {
      alert("Please enter SKU");
      return;
    }

    try {
      setLoading(true);
      await createProductApi({
        name,
        sku,
        barcode: barcode || undefined,
        description: description || undefined,
        price: Number(price),
        costPrice: Number(costPrice),
        stock: Number(quantity),
        minStockAlert: Number(minStockAlert),
        categoryId: categoryId || undefined,
        image: "/assets/products/product-01.jpg",
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/products");
      }, 1200);
    } catch (err: any) {
      alert(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <Link
              href="/products"
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Create Product</h1>
              <p className="text-xs text-gray-400 mt-0.5">Create new product in inventory</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/products"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center space-x-1.5"
            >
              {loading ? (
                <span>Saving Product...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Product</span>
                </>
              )}
            </button>
          </div>
        </div>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Product created successfully! Redirecting to products list...</span>
          </div>
        )}

        {/* 1. Card: Product Information */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center space-x-2">
            <Info className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-gray-900 text-sm">Product Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Store */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Store <span className="text-red-500">*</span>
              </label>
              <select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              >
                <option value="Main Store">Main Store</option>
                <option value="Siam Branch">Siam Branch</option>
                <option value="Sukhumvit Branch">Sukhumvit Branch</option>
              </select>
            </div>

            {/* Warehouse */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              >
                <option value="Central Warehouse">Central Warehouse</option>
                <option value="Quaint Warehouse">Quaint Warehouse</option>
                <option value="East Coast Depot">East Coast Depot</option>
              </select>
            </div>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apple MacBook Air M3"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Slug</label>
              <input
                type="text"
                placeholder="auto-generated-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700">
                  SKU <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateSku}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. PROD-1024"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Sub Category</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              >
                <option value="General">General</option>
                <option value="Laptops">Laptops</option>
                <option value="Keyboards">Keyboards</option>
                <option value="Audio Equipment">Audio Equipment</option>
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              >
                <option value="Apple">Apple</option>
                <option value="Sony">Sony</option>
                <option value="Logitech">Logitech</option>
                <option value="Keychron">Keychron</option>
                <option value="Dell">Dell</option>
                <option value="Anker">Anker</option>
                <option value="JBL">JBL</option>
              </select>
            </div>

            {/* Unit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              >
                <option value="Pcs">Pieces (Pcs)</option>
                <option value="Box">Box</option>
                <option value="Set">Set</option>
                <option value="Kg">Kilogram (Kg)</option>
              </select>
            </div>

            {/* Barcode */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700">Item Barcode</label>
                <button
                  type="button"
                  onClick={generateBarcode}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. 885123456789"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Description with Toolbar */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-gray-700">Description</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              {/* Dummy Editor Toolbar */}
              <div className="flex items-center space-x-1 p-2 bg-gray-50 border-b border-gray-200 text-gray-600">
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <List className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <Link2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Provide details about product features, dimensions, technical specifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-xs text-gray-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Card: Pricing & Stocks */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Pricing & Stocks</h3>
            {/* Product Type Radio */}
            <div className="flex items-center space-x-4 text-xs font-semibold text-gray-700">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  checked={productType === "SINGLE"}
                  onChange={() => setProductType("SINGLE")}
                  className="accent-orange-500"
                />
                <span>Single Product</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  checked={productType === "VARIABLE"}
                  onChange={() => setProductType("VARIABLE")}
                  className="accent-orange-500"
                />
                <span>Variable Product</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Quantity (Stock) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              />
            </div>

            {/* Selling Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Selling Price (฿) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              />
            </div>

            {/* Cost Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Cost Price (฿)</label>
              <input
                type="number"
                min="0"
                value={costPrice || ""}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              />
            </div>

            {/* Tax Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Tax Type</label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="Exclusive">Exclusive</option>
                <option value="Inclusive">Inclusive</option>
              </select>
            </div>

            {/* Tax */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Tax Rate</label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="7% VAT">7% Standard VAT</option>
                <option value="0% Zero Tax">0% Exempted</option>
              </select>
            </div>

            {/* Quantity Alert (Min Stock) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Quantity Alert (Min Stock) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Card: Images */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm">Product Images</h3>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Upload Box */}
            <div className="w-28 h-28 border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 transition-colors cursor-pointer bg-gray-50">
              <UploadCloud className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">Upload Image</span>
            </div>

            {/* Thumbnail Preview 1 */}
            <div className="relative w-28 h-28 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-extrabold text-lg overflow-hidden group">
              <span>{name ? name.slice(0, 2).toUpperCase() : "IMG"}</span>
              <button
                type="button"
                className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-lg opacity-90 hover:opacity-100 shadow-sm"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Card: Custom Fields */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
            <button
              type="button"
              onClick={() => setActiveCustomTab("warranty")}
              className={`text-xs font-bold pb-1 border-b-2 transition-all ${
                activeCustomTab === "warranty"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Warranty
            </button>
            <button
              type="button"
              onClick={() => setActiveCustomTab("manufacturer")}
              className={`text-xs font-bold pb-1 border-b-2 transition-all ${
                activeCustomTab === "manufacturer"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Manufacturer Code
            </button>
            <button
              type="button"
              onClick={() => setActiveCustomTab("expiry")}
              className={`text-xs font-bold pb-1 border-b-2 transition-all ${
                activeCustomTab === "expiry"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Expiry Date
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCustomTab === "warranty" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Warranty Duration</label>
                <select
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                >
                  <option value="No Warranty">No Warranty</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year Official Warranty</option>
                  <option value="2 Years">2 Years Warranty</option>
                </select>
              </div>
            )}

            {activeCustomTab === "manufacturer" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Manufacturer Code</label>
                <input
                  type="text"
                  placeholder="e.g. MFR-APPL-2026"
                  value={manufacturerCode}
                  onChange={(e) => setManufacturerCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                />
              </div>
            )}

            {activeCustomTab === "expiry" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex justify-end items-center space-x-3 pt-2">
          <Link
            href="/products"
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            {loading ? "Saving..." : "Add to Product"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
