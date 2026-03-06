// ============================================================
// PRODUCT FORM COMPONENT
// Comprehensive product form with all fields
// ============================================================

"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";
import { FiX } from "react-icons/fi";

export default function ProductForm({ product, onSave, onCancel, categories = [], brands = [] }) {
  const [formData, setFormData] = useState({
    // Basic Info
    name: product?.name || "",
    name_pt: product?.name_pt || "",
    name_en: product?.name_en || "",
    name_zh: product?.name_zh || "",
    
    // Description
    description: product?.description || "",
    description_pt: product?.description_pt || "",
    description_en: product?.description_en || "",
    description_zh: product?.description_zh || "",
    
    // Pricing
    price: product?.price || "",
    original_price: product?.original_price || "",
    cost_price: product?.cost_price || "",
    currency: product?.currency || "BRL",
    
    // Inventory
    stock: product?.stock || 0,
    sku: product?.sku || "",
    
    // Relations
    category_id: product?.category_id || "",
    brand_id: product?.brand_id || "",
    
    // Image
    thumbnail_url: product?.thumbnail_url || "",
    
    // Flags
    is_active: product?.is_active !== false,
    is_featured: product?.is_featured || false,
    is_group_buy: product?.is_group_buy || false,
    is_treasure_snatch: product?.is_treasure_snatch || false,
  });

  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {["basic", "description", "pricing", "inventory", "settings"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-h-[60vh] overflow-y-auto">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name (English) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
                placeholder="Product name in English"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Portuguese)
                </label>
                <input
                  type="text"
                  value={formData.name_pt}
                  onChange={(e) => setFormData({ ...formData, name_pt: e.target.value })}
                  className="input-field"
                  placeholder="Nome em português"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Chinese)
                </label>
                <input
                  type="text"
                  value={formData.name_zh}
                  onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
                  className="input-field"
                  placeholder="中文名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="input-field"
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <ImageUpload
              value={formData.thumbnail_url}
              onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
              label="Product Image"
              required={false}
            />

            {/* Category & Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (English)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Product description in English"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Portuguese)
              </label>
              <textarea
                value={formData.description_pt}
                onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Descrição do produto em português"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Chinese)
              </label>
              <textarea
                value={formData.description_zh}
                onChange={(e) => setFormData({ ...formData, description_zh: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="产品描述（中文）"
              />
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (for discounts)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if no discount. Used to show "was R$ X, now R$ Y"
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price (admin only)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Internal cost for profit calculation (not shown to customers)
              </p>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input-field"
                placeholder="PROD-001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique product identifier
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (visible in storefront)
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured (shown in daily push/homepage)
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_group_buy}
                  onChange={(e) => setFormData({ ...formData, is_group_buy: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Group Buy Available
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_treasure_snatch}
                  onChange={(e) => setFormData({ ...formData, is_treasure_snatch: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Treasure Snatch (flash sale)
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {product ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
