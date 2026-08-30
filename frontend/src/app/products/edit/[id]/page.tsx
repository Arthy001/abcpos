"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  fetchProductById,
  fetchCategories,
  fetchBrands,
  fetchUnits,
  fetchWarehouses,
  fetchStores,
  updateProductApi,
} from "@/lib/api";
import { Category, Brand, Unit, Warehouse, Store, Product } from "@/types";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
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
  RotateCcw,
} from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = String(params?.id || "");

  // Reference lists from DB
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form State
  const [storeId, setStoreId] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("ACTIVE");

  // Pricing & Stocks
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);

  // Custom Fields / Dates
  const [manufacturedDate, setManufacturedDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  useEffect(() => {
    if (!productId) return;

    setInitialLoading(true);
    Promise.all([
      fetchProductById(productId),
      fetchCategories(),
      fetchBrands(),
      fetchUnits(),
      fetchWarehouses(),
      fetchStores(),
    ])
      .then(([prod, cats, brds, unts, whs, strs]) => {
        setCategories(cats);
        setBrands(brds);
        setUnits(unts);
        setWarehouses(whs);
        setStores(strs);

        // Fill form
        setName(prod.name || "");
        setSku(prod.sku || "");
        setCategoryId(prod.categoryId || "");
        setBrandId(prod.brandId || "");
        setUnitId(prod.unitId || "");
        setWarehouseId(prod.warehouseId || "");
        setStoreId(prod.storeId || "");
        setBarcode(prod.barcode || "");
        setDescription(prod.description || "");

        // Parse images
        if (prod.image) {
          if (prod.image.startsWith("[")) {
            try {
              const parsed = JSON.parse(prod.image);
              if (Array.isArray(parsed)) setImages(parsed);
              else setImages([prod.image]);
            } catch {
              setImages([prod.image]);
            }
          } else {
            setImages([prod.image]);
          }
        } else {
          setImages([]);
        }

        setStatus(prod.status || "ACTIVE");
        setPrice(prod.price || 0);
        setCostPrice(prod.costPrice || 0);
        setQuantity(prod.stock || 0);
        setMinStockAlert(prod.minStockAlert || 5);

        if (prod.manufacturedDate) {
          setManufacturedDate(new Date(prod.manufacturedDate).toISOString().split("T")[0]);
        }
        if (prod.expiredDate) {
          setExpiryDate(new Date(prod.expiredDate).toISOString().split("T")[0]);
        }
      })
      .catch((err: any) => {
        console.error("Error loading product for edit:", err);
        setErrorMessage(err.message || "Failed to load product data");
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [productId]);

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
    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
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
      const imagePayload = images.length > 0 ? JSON.stringify(images) : undefined;

      await updateProductApi(productId, {
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
        status: status || (Number(quantity) > 0 ? "ACTIVE" : "OUT_OF_STOCK"),
        manufacturedDate: manufacturedDate || undefined,
        expiredDate: expiryDate || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/products");
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
          <RotateCcw className="w-8 h-8 animate-spin text-[#FE9F43]" />
          <p className="text-sm font-medium text-gray-500">Loading product details...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
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
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Edit Product</h1>
              <p className="text-xs text-gray-400 mt-0.5">Update product details, pricing, and stock levels</p>
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
                <span>Saving Changes...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Product updated successfully! Redirecting to products list...</span>
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
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Store</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white cursor-pointer"
              >
                <option value="">Default Store</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Warehouse</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white cursor-pointer"
              >
                <option value="">Central Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white cursor-pointer"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Unit</label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white cursor-pointer"
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.shortName})
                  </option>
                ))}
              </select>
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
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>
          </div>

          {/* Description */}
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
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-gray-700">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="OUT_OF_STOCK">OUT OF STOCK</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Stock Quantity <span className="text-red-500">*</span>
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
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* Quantity Alert (Min Stock) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Quantity Alert <span className="text-red-500">*</span>
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
              <p className="text-[11px] text-gray-500 mt-0.5">Upload new images, manage, or remove existing photos</p>
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

        {/* 4. Card: Dates */}
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
            className="px-6 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center space-x-1.5"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
