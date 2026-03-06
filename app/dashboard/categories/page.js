// ============================================================
// CATEGORIES MANAGEMENT PAGE
// List, add, edit, delete categories
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "", name_pt: "", name_en: "", icon_url: "", image_url: "",
    parent_id: "", sort_order: 0, is_active: true,
  });

  // Fetch categories
  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  function openCreateModal() {
    setEditingCategory(null);
    setFormData({ name: "", name_pt: "", name_en: "", icon_url: "", image_url: "", parent_id: "", sort_order: 0, is_active: true });
    setShowModal(true);
  }

  function openEditModal(cat) {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "", name_pt: cat.name_pt || "", name_en: cat.name_en || "",
      icon_url: cat.icon_url || "", image_url: cat.image_url || "",
      parent_id: cat.parent_id || "", sort_order: cat.sort_order || 0, is_active: cat.is_active,
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
    const method = editingCategory ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          sort_order: parseInt(formData.sort_order) || 0,
          parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        }),
      });
      if (res.ok) { setShowModal(false); fetchCategories(); }
    } catch (error) {
      console.error("Save category error:", error);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage product categories</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Portuguese</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">English</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No categories yet.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{cat.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{cat.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cat.name_pt || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cat.name_en || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cat.sort_order}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        cat.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><FiEdit2 size={16} /></button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portuguese Name</label>
                  <input type="text" value={formData.name_pt} onChange={(e) => setFormData({ ...formData, name_pt: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">English Name</label>
                  <input type="text" value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })} className="input-field" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="cat_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="cat_active" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">{editingCategory ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
