"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Product, Category } from "@/types";
import { fetchProducts, fetchCategories } from "@/lib/api";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 10 Sample items exactly matching the user's screenshot
  const screenshotSampleProducts = [
    {
      id: "1",
      sku: "PT001",
      name: "Lenovo IdeaPad 3",
      categoryName: "Computers",
      brand: "Lenovo",
      price: "$600",
      unit: "Pc",
      qty: "100",
      creatorName: "James Kirwin",
      creatorAvatar: "/assets/images/avatar-01.jpg",
      productImage: "/assets/images/product-01.jpg",
    },
    {
      id: "2",
      sku: "PT002",
      name: "Beats Pro",
      categoryName: "Electronics",
      brand: "Beats",
      price: "$160",
      unit: "Pc",
      qty: "140",
      creatorName: "Francis Chang",
      creatorAvatar: "/assets/images/avatar-02.jpg",
      productImage: "/assets/images/product-03.jpg",
    },
    {
      id: "3",
      sku: "PT003",
      name: "Nike Jordan",
      categoryName: "Shoe",
      brand: "Nike",
      price: "$110",
      unit: "Pc",
      qty: "300",
      creatorName: "Antonio Engle",
      creatorAvatar: "/assets/images/avatar-03.jpg",
      productImage: "/assets/images/product-04.jpg",
    },
    {
      id: "4",
      sku: "PT004",
      name: "Apple Series 5 Watch",
      categoryName: "Electronics",
      brand: "Apple",
      price: "$120",
      unit: "Pc",
      qty: "450",
      creatorName: "Leo Kelly",
      creatorAvatar: "/assets/images/avatar-10.jpg",
      productImage: "/assets/images/product-05.jpg",
    },
    {
      id: "5",
      sku: "PT005",
      name: "Amazon Echo Dot",
      categoryName: "Electronics",
      brand: "Amazon",
      price: "$80",
      unit: "Pc",
      qty: "320",
      creatorName: "Annette Walker",
      creatorAvatar: "/assets/images/avatar-13.jpg",
      productImage: "/assets/images/product-06.jpg",
    },
    {
      id: "6",
      sku: "PT006",
      name: "Sanford Chair Sofa",
      categoryName: "Furnitures",
      brand: "Modern Wave",
      price: "$320",
      unit: "Pc",
      qty: "650",
      creatorName: "John Weaver",
      creatorAvatar: "/assets/images/avatar-17.jpg",
      productImage: "/assets/images/product-07.jpg",
    },
    {
      id: "7",
      sku: "PT007",
      name: "Red Premium Satchel",
      categoryName: "Bags",
      brand: "Dior",
      price: "$60",
      unit: "Pc",
      qty: "700",
      creatorName: "Gary Hennessy",
      creatorAvatar: "/assets/images/avator1.jpg",
      productImage: "/assets/images/product-08.jpg",
    },
    {
      id: "8",
      sku: "PT008",
      name: "Iphone 14 Pro",
      categoryName: "Phone",
      brand: "Apple",
      price: "$540",
      unit: "Pc",
      qty: "630",
      creatorName: "Eleanor Panek",
      creatorAvatar: "/assets/images/customer11.jpg",
      productImage: "/assets/images/product-09.jpg",
    },
    {
      id: "9",
      sku: "PT009",
      name: "Gaming Chair",
      categoryName: "Furniture",
      brand: "Artime",
      price: "$200",
      unit: "Pc",
      qty: "410",
      creatorName: "William Levy",
      creatorAvatar: "/assets/images/customer12.jpg",
      productImage: "/assets/images/product-10.jpg",
    },
    {
      id: "10",
      sku: "PT010",
      name: "Borealis Backpack",
      categoryName: "Bags",
      brand: "The North Face",
      price: "$45",
      unit: "Pc",
      qty: "550",
      creatorName: "Charlotte Klotz",
      creatorAvatar: "/assets/images/customer13.jpg",
      productImage: "/assets/images/product-11.jpg",
    },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        fetchProducts({ categoryId: selectedCategory, search }),
        fetchCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, search]);

  const displayList = products.length > 0 ? products.map((p, idx) => ({
    id: p.id,
    sku: p.sku || `PT00${idx + 1}`,
    name: p.name,
    categoryName: p.category?.name || "General",
    brand: "Apple",
    price: `$${p.price.toLocaleString()}`,
    unit: "Pc",
    qty: String(p.stock),
    creatorName: "James Kirwin",
    creatorAvatar: "/assets/images/avatar-01.jpg",
    productImage: p.image || "/assets/images/product-01.jpg",
  })) : screenshotSampleProducts;

  const filteredDisplay = displayList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryName.toLowerCase() === selectedCategory.toLowerCase();
    const matchesBrand = selectedBrand === "all" || item.brand.toLowerCase() === selectedBrand.toLowerCase();
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDisplay.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDisplay.map((p) => p.id));
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
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Product List</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Manage your products</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export (Red) */}
            <button
              title="Export PDF"
              onClick={() => alert("Exporting PDF...")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel Export (Green) */}
            <button
              title="Export Excel"
              onClick={() => alert("Exporting Excel...")}
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

            {/* + Add Product Button (Orange) */}
            <Link
              href="/products/add"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </Link>

            {/* ⬇ Import Product Button (Dark Navy) */}
            <button
              onClick={() => alert("Import Product from CSV / Excel")}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0E1422] hover:bg-[#1E293B] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import Product</span>
            </button>
          </div>
        </div>

        {/* Product Table Card Container */}
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
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Category</option>
                  <option value="Computers">Computers</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Shoe">Shoe</option>
                  <option value="Furnitures">Furnitures</option>
                  <option value="Bags">Bags</option>
                  <option value="Phone">Phone</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Brand</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="Beats">Beats</option>
                  <option value="Nike">Nike</option>
                  <option value="Apple">Apple</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Modern Wave">Modern Wave</option>
                  <option value="Dior">Dior</option>
                  <option value="The North Face">The North Face</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Clean Table matching screenshot */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] text-[#111827]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredDisplay.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-3 font-bold text-[#111827]">SKU</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Product Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Category</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Brand</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Price</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Unit</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Qty</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Created By</th>
                  <th className="py-3 px-3 text-right"></th>
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

                      <td className="py-3.5 px-3 text-[#64748B] font-normal">{item.sku}</td>

                      {/* Product Name with Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.productImage}
                            alt={item.name}
                            className="w-7 h-7 rounded object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                            }}
                          />
                          <span className="font-normal text-[#1E293B] line-clamp-1">{item.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B]">{item.categoryName}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.brand}</td>
                      <td className="py-3.5 px-3 text-[#1E293B] font-normal">{item.price}</td>
                      <td className="py-3.5 px-3 text-[#64748B]">{item.unit}</td>
                      <td className="py-3.5 px-3 text-[#64748B]">{item.qty}</td>

                      {/* Created By with User Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={item.creatorAvatar}
                            alt={item.creatorName}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-100 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/images/avatar-01.jpg";
                            }}
                          />
                          <span className="text-[#334155] whitespace-nowrap text-xs">
                            {item.creatorName}
                          </span>
                        </div>
                      </td>

                      {/* Actions: View, Edit, Delete */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            title="View Details"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href="/products/add"
                            title="Edit Product"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-orange-50 text-[#94A3B8] hover:text-[#FE9F43] flex items-center justify-center transition-colors bg-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            title="Delete Product"
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
              <button className="w-6 h-6 rounded-full hover:bg-gray-100 text-[#64748B] font-medium flex items-center justify-center text-xs">
                2
              </button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
