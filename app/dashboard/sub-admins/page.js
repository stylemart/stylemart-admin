// ============================================================
// SUB ADMIN MANAGEMENT PAGE (Super Admin Only)
// Create, view, and manage sub-admins
// ============================================================

"use client";

import { useEffect, useState } from "react";
import {
  FiPlus,
  FiRefreshCw,
  FiCopy,
  FiUserX,
  FiUserCheck,
  FiTrash2,
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiKey,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

export default function SubAdminManagement() {
  const [subAdmins, setSubAdmins] = useState([]);
  const [pendingCodes, setPendingCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedAdmin, setExpandedAdmin] = useState(null);

  async function fetchData() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/sub-admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSubAdmins(data.sub_admins || []);
        setPendingCodes(data.pending_codes || []);
      }
    } catch (error) {
      console.error("Fetch sub-admins error:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreatePackage() {
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/sub-admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(
          `Sub Admin codes generated!\n\nAdmin Code: ${data.admin_code}\nStorefront Code: ${data.storefront_code}\n\nShare the Admin Code with the new sub-admin to register.`
        );
        await fetchData();
      } else {
        alert(data.error || "Failed to create codes");
      }
    } catch (error) {
      console.error("Create sub admin error:", error);
      alert("Failed to create sub admin codes");
    }
    setCreating(false);
  }

  async function toggleStatus(id, currentStatus) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/sub-admins/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Toggle status error:", error);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to remove "${name}"? This will deactivate the sub-admin.`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/sub-admins/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Delete sub admin error:", error);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied: ${text}`);
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sub Admin Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage sub-admins. Each sub-admin gets their own panel with their own users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleCreatePackage}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            <FiPlus size={16} />
            {creating ? "Generating..." : "Create Sub Admin"}
          </button>
        </div>
      </div>

      {/* Pending (Unclaimed) Codes */}
      {pendingCodes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <FiKey size={16} />
            Pending Codes (Not Yet Claimed)
          </h3>
          <div className="space-y-2">
            {pendingCodes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-amber-100"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-xs text-gray-500">Admin Code</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-indigo-700">{code.code}</span>
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Storefront Code</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-green-700">{code.storefront_code}</span>
                      <button
                        onClick={() => copyToClipboard(code.storefront_code)}
                        className="text-gray-400 hover:text-green-600"
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(code.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Admins List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Active Sub Admins ({subAdmins.length})</h3>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : subAdmins.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <FiUsers size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No sub-admins yet. Click &quot;Create Sub Admin&quot; to generate codes.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {subAdmins.map((admin) => (
              <div key={admin.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        admin.is_active ? "bg-indigo-500" : "bg-gray-400"
                      }`}
                    >
                      {(admin.username || "?")[0].toUpperCase()}
                    </div>
                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{admin.full_name || admin.username}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            admin.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {admin.is_active ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">@{admin.username}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-400">
                        <FiUsers size={14} />
                        <span className="text-lg font-bold text-gray-800">{admin.user_count || 0}</span>
                      </div>
                      <span className="text-xs text-gray-400">Users</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-400">
                        <FiShoppingCart size={14} />
                        <span className="text-lg font-bold text-gray-800">{admin.order_count || 0}</span>
                      </div>
                      <span className="text-xs text-gray-400">Orders</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-400">
                        <FiDollarSign size={14} />
                        <span className="text-lg font-bold text-gray-800">
                          {Math.round(parseFloat(admin.total_user_balance || 0))}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">Balance</span>
                    </div>

                    {/* Storefront Code */}
                    {admin.storefront_code && (
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm font-semibold text-green-700">
                            {admin.storefront_code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(admin.storefront_code)}
                            className="text-gray-400 hover:text-green-600"
                          >
                            <FiCopy size={14} />
                          </button>
                        </div>
                        <span className="text-xs text-gray-400">Store Code</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(admin.id, admin.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          admin.is_active
                            ? "text-red-500 hover:bg-red-50"
                            : "text-green-500 hover:bg-green-50"
                        }`}
                        title={admin.is_active ? "Disable" : "Enable"}
                      >
                        {admin.is_active ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id, admin.full_name || admin.username)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove"
                      >
                        <FiTrash2 size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedAdmin(expandedAdmin === admin.id ? null : admin.id)
                        }
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
                      >
                        {expandedAdmin === admin.id ? (
                          <FiChevronUp size={18} />
                        ) : (
                          <FiChevronDown size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedAdmin === admin.id && (
                  <div className="mt-4 ml-14 p-4 bg-gray-50 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500">Created:</span>{" "}
                        <span className="text-gray-700">
                          {new Date(admin.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Login:</span>{" "}
                        <span className="text-gray-700">
                          {admin.last_login_at
                            ? new Date(admin.last_login_at).toLocaleString()
                            : "Never"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>{" "}
                        <span className="text-gray-700">{admin.email || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Storefront Code:</span>{" "}
                        <span className="font-mono text-green-700 font-semibold">
                          {admin.storefront_code || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
