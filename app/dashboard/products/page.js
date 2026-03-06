// ============================================================
// PRODUCTS MANAGEMENT PAGE
// Enhanced with image upload and full product management
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from "react-icons/fi";
import ProductForm from "@/components/ProductForm";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch categories and brands
  useEffect(() => {
    async function fetchCategories() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Fetch categories error:", error);
      }
    }

    async function fetchBrands() {
      try {
        // TODO: Create brands API if needed
        // For now, empty array
        setBrands([]);
      } catch (error) {
        console.error("Fetch brands error:", error);
      }
    }

    fetchCategories();
    fetchBrands();
  }, []);

  // Fetch products
  async function fetchProducts(page = 1) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append("search", search);

      const res = await fetch(`/api/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error("Fetch products error:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search handler
  function handleSearch(e) {
    e.preventDefault();
    fetchProducts(1);
  }

  // Open modal for creating a new product
  function openCreateModal() {
    setEditingProduct(null);
    setShowModal(true);
  }

  // Open modal for editing an existing product
  function openEditModal(product) {
    setEditingProduct(product);
    setShowModal(true);
  }

  // Save product (create or update)
  async function handleSave(formData) {
    const token = localStorage.getItem("token");
    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
          stock: parseInt(formData.stock) || 0,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingProduct(null);
        fetchProducts(pagination.page);
        alert(editingProduct ? "Product updated successfully!" : "Product created successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Save product error:", error);
      alert("Error saving product. Please try again.");
    }
  }

  // Delete product
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchProducts(pagination.page);
        alert("Product deleted successfully!");
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Error deleting product. Please try again.");
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your product catalog - Add, edit, and organize products
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} />
          Add Product
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </div>
      </form>

      {/* Products Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                    {/* Product info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23e5e7eb' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%239ca3af'%3ENo img%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Price */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        R$ {parseFloat(product.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      {product.original_price && (
                        <p className="text-xs text-gray-400 line-through">
                          R$ {parseFloat(product.original_price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </td>
                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                        {product.stock}
                      </span>
                    </td>
                    {/* Category */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category_name || "—"}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                        {product.is_featured && (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchProducts(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-outline text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchProducts(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-outline text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <ProductForm
                product={editingProduct}
                onSave={handleSave}
                onCancel={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                categories={categories}
                brands={brands}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
