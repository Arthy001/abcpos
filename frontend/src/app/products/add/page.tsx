"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  fetchCategories,
  fetchBrands,
  fetchUnits,
  fetchWarehouses,
  fetchStores,
  createProductApi,
} from "@/lib/api";
import { Category, Brand, Unit, Warehouse, Store } from "@/types";
import { SearchableSelect } from "@/components/common/SearchableSelect";
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
  AlertTriangle,
} from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();

  // Reference lists from DB
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form State
  const [storeId, setStoreId] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  // Pricing & Stocks
  const [productType, setProductType] = useState<"SINGLE" | "VARIABLE">("SINGLE");
  const [quantity, setQuantity] = useState<number>(20);
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [taxType, setTaxType] = useState("Exclusive");
  const [taxRate, setTaxRate] = useState("7% VAT");
  const [minStockAlert, setMinStockAlert] = useState<number>(5);

  // Custom Fields / Dates
  const [manufacturedDate, setManufacturedDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  useEffect(() => {
    // Generate initial random SKU
    generateSku();

    // Fetch dropdown data
    Promise.all([
      fetchCategories(),
      fetchBrands(),
      fetchUnits(),
      fetchWarehouses(),
      fetchStores(),
    ])
      .then(([cats, brds, unts, whs, strs]) => {
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);

        setBrands(brds);
        if (brds.length > 0) setBrandId(brds[0].id);

        setUnits(unts);
        if (unts.length > 0) setUnitId(unts[0].id);

        setWarehouses(whs);
        if (whs.length > 0) setWarehouseId(whs[0].id);

        setStores(strs);
        if (strs.length > 0) setStoreId(strs[0].id);
      })
      .catch((err) => {
        console.error("Error loading dropdown data:", err);
      });
  }, []);

  // Handle multi-image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset file input value so user can re-select same file if desired
    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Auto generate slug
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
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
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter Product Name");
      return;
    }
    if (!sku.trim()) {
      setErrorMessage("Please enter SKU");
      return;
    }

    try {
      setLoading(true);

      // Serialize images if multiple or single
      const imagePayload = images.length > 0 ? JSON.stringify(images) : undefined;

      await createProductApi({
        name: name.trim(),
        sku: sku.trim(),
        barcode: barcode.trim() || undefined,
        description: description.trim() || undefined,
        price: Number(price || 0),
        costPrice: Number(costPrice || 0),
        stock: Number(quantity || 0),
        minStockAlert: Number(minStockAlert || 5),
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        unitId: unitId || undefined,
        warehouseId: warehouseId || undefined,
        storeId: storeId || undefined,
        image: imagePayload,
        status: Number(quantity) > 0 ? "ACTIVE" : "OUT_OF_STOCK",
        manufacturedDate: manufacturedDate || undefined,
        expiredDate: expiryDate || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/products");
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-5 w-full pb-12 font-sans">
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
              <p className="text-xs text-gray-400 mt-0.5">Add a new item to your store & warehouse inventory</p>
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
              className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center space-x-1.5"
            >
              {loading ? (
                <span>Saving Product...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Product created successfully! Redirecting to products list...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Card: Product Information */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#FE9F43]" />
            <h3 className="font-bold text-gray-900 text-sm">Product Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Store */}
            <div>
              <SearchableSelect
                label="Store"
                placeholder="Select Store..."
                options={stores.map((s) => ({ value: s.id, label: s.name }))}
                value={storeId}
                onChange={setStoreId}
              />
            </div>

            {/* Warehouse */}
            <div>
              <SearchableSelect
                label="Warehouse"
                placeholder="Select Warehouse..."
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                value={warehouseId}
                onChange={setWarehouseId}
              />
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
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
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
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
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
                  className="text-[11px] font-bold text-[#FE9F43] hover:text-[#E88B32] flex items-center space-x-1"
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
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* Category */}
            <div>
              <SearchableSelect
                label="Category"
                required
                placeholder="Search or Select Category..."
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={categoryId}
                onChange={setCategoryId}
              />
            </div>

            {/* Brand */}
            <div>
              <SearchableSelect
                label="Brand"
                placeholder="Search or Select Brand..."
                options={brands.map((b) => ({ value: b.id, label: b.name }))}
                value={brandId}
                onChange={setBrandId}
              />
            </div>

            {/* Unit */}
            <div>
              <SearchableSelect
                label="Unit"
                placeholder="Search or Select Unit..."
                options={units.map((u) => ({ value: u.id, label: `${u.name} (${u.shortName})` }))}
                value={unitId}
                onChange={setUnitId}
              />
            </div>

            {/* Barcode */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700">Item Barcode</label>
                <button
                  type="button"
                  onClick={generateBarcode}
                  className="text-[11px] font-bold text-[#FE9F43] hover:text-[#E88B32] flex items-center space-x-1"
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
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>
          </div>

          {/* Description with Toolbar */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-gray-700">Description</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
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
                  className="accent-[#FE9F43]"
                />
                <span>Single Product</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  checked={productType === "VARIABLE"}
                  onChange={() => setProductType("VARIABLE")}
                  className="accent-[#FE9F43]"
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
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
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
                step="any"
                required
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-orange-600 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* Cost Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Cost Price (฿)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={costPrice || ""}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* Tax Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Tax Type</label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
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
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
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
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-amber-600 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Card: Product Images (Multi-upload & Individual Delete) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Product Images ({images.length})</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Upload one or multiple images for this product</p>
            </div>
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setImages([])}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove All</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Upload Box button */}
            <label className="h-32 border-2 border-dashed border-gray-300 hover:border-[#FE9F43] rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-[#FE9F43] transition-all cursor-pointer bg-gray-50/70 hover:bg-orange-50/30 group">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <UploadCloud className="w-7 h-7 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-700 group-hover:text-[#FE9F43]">Add Images</span>
              <span className="text-[10px] text-gray-400">PNG, JPG, WebP</span>
            </label>

            {/* Uploaded Images List */}
            {images.map((imgData, idx) => (
              <div
                key={idx}
                className="relative h-32 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden group shadow-2xs hover:shadow-md transition-all"
              >
                <img
                  src={imgData}
                  alt={`Product Image ${idx + 1}`}
                  className="w-full h-full object-contain p-2"
                />

                {/* Primary / Cover Badge */}
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#FE9F43] text-white shadow-xs">
                    Cover Photo
                  </span>
                )}

                {/* Individual Delete Button */}
                <button
                  type="button"
                  title="Delete this image"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-rose-500/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition-all opacity-90 group-hover:opacity-100 group-hover:scale-105 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Card: Dates & Warranty */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-900 text-sm">Tracking & Expiry</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Manufactured Date</label>
              <input
                type="date"
                value={manufacturedDate}
                onChange={(e) => setManufacturedDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
              />
            </div>
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
            className="px-6 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all"
          >
            {loading ? "Saving..." : "Add to Product"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
