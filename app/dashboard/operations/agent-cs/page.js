// ============================================================
// SUPPORT LINKS PAGE
// Manage support links (Customer Service & Finance Department)
// Admin adds Telegram/WhatsApp/other links that users click
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiExternalLink } from "react-icons/fi";
import Breadcrumb from "@/components/Breadcrumb";

export default function SupportLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    customer_service_name: "",
    customer_service_link: "",
    status: "active",
  });

  async function fetchLinks() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/operations/agent-cs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLinks(data.agents || []);
    } catch (error) {
      console.error("Fetch support links error:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  function openCreateModal() {
    setEditingLink(null);
    setFormData({
      customer_service_name: "",
      customer_service_link: "",
      status: "active",
    });
    setShowModal(true);
  }

  function openEditModal(link) {
    setEditingLink(link);
    setFormData({
      customer_service_name: link.customer_service_name || "",
      customer_service_link: link.customer_service_link || "",
      status: link.status || "active",
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingLink
      ? `/api/operations/agent-cs/${editingLink.id}`
      : "/api/operations/agent-cs";
    const method = editingLink ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_service_name: formData.customer_service_name,
          customer_service_link: formData.customer_service_link,
          status: formData.status,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchLinks();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Save support link error:", error);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this support link?")) return;
    const token = localStorage.getItem("token");

    try {
      await fetch(`/api/operations/agent-cs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLinks();
    } catch (error) {
      console.error("Delete support link error:", error);
    }
  }

  // Detect platform from link
  function getPlatformBadge(link) {
    if (!link) return null;
    const lower = link.toLowerCase();
    if (lower.includes("t.me") || lower.includes("telegram")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
          Telegram
        </span>
      );
    }
    if (lower.includes("wa.me") || lower.includes("whatsapp")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
          WhatsApp
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
        Link
      </span>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Front Page", href: "/dashboard" },
          { label: "Operations Configuration", href: "/dashboard/operations" },
          { label: "Support Links" },
        ]}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Support Links</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage customer service and finance department links (Telegram, WhatsApp, etc.)
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} />
          Add Link
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> Add support links here. In the storefront, users will see
          "Customer Service" and "Finance Department" buttons. When they click, they'll be redirected
          to the platform link you've configured (Telegram, WhatsApp, etc.).
        </p>
      </div>

      {/* Links Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  ID
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Department
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Platform
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Link
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No support links configured yet. Click "Add Link" to get started.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{link.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {link.customer_service_name}
                    </td>
                    <td className="px-6 py-4">
                      {getPlatformBadge(link.customer_service_link)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={link.customer_service_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 truncate max-w-xs"
                      >
                        {link.customer_service_link}
                        <FiExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          link.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {link.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(link)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
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
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingLink ? "Edit Support Link" : "Add Support Link"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Department *
                </label>
                <select
                  value={formData.customer_service_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_service_name: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="">Select department</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Finance Department">Finance Department</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  WhatsApp / Telegram Link *
                </label>
                <input
                  type="url"
                  value={formData.customer_service_link}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_service_link: e.target.value })
                  }
                  className="input-field"
                  placeholder="https://wa.me/923001234567"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  WhatsApp: <span className="font-mono text-gray-600">https://wa.me/923XXXXXXXXX</span><br />
                  Telegram: <span className="font-mono text-gray-600">https://t.me/username</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingLink ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
