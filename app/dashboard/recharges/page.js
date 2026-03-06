// ============================================================
// RECHARGE LIST PAGE
// Manage user recharge requests with approve/reject + reason
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiImage, FiX, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function RechargesPage() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedImages, setSelectedImages] = useState(null);

  // Action modal state
  const [actionModal, setActionModal] = useState(null); // { id, action, userName, amount }
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const statusOptions = ["all", "pending", "approved", "rejected", "completed"];

  async function fetchRecharges() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const statusParam = statusFilter === "all" ? "all" : statusFilter === "approved" ? "completed" : statusFilter === "rejected" ? "cancelled" : statusFilter;
      const res = await fetch(`/api/recharges?status=${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRecharges(data.recharges || []);
      } else {
        console.error("Failed to fetch recharges:", data.error);
        setRecharges([]);
      }
    } catch (error) {
      console.error("Fetch recharges error:", error);
      setRecharges([]);
    }
    setLoading(false);
  }

  function openActionModal(recharge, action) {
    setActionModal({
      id: recharge.id,
      action,
      userName: recharge.user_name,
      amount: recharge.amount,
    });
    setActionReason("");
  }

  async function handleConfirmAction() {
    if (!actionModal) return;
    setActionLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/recharges/${actionModal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: actionModal.action,
          reason: actionReason.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Recharge ${actionModal.action === "approve" ? "approved" : "rejected"} successfully!`);
        setActionModal(null);
        setActionReason("");
        await fetchRecharges();
      } else {
        alert(data.error || `Failed to ${actionModal.action} recharge`);
      }
    } catch (error) {
      console.error("Recharge action error:", error);
      alert(`Failed to ${actionModal.action} recharge`);
    }
    setActionLoading(false);
  }

  useEffect(() => {
    fetchRecharges();
  }, [statusFilter]);

  const statusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      completed: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const mapStatus = (status) => {
    if (status === "completed") return "approved";
    if (status === "cancelled") return "rejected";
    return status || "pending";
  };

  // Filter by search
  const filtered = recharges.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.user_name || "").toLowerCase().includes(q) ||
      String(r.amount).includes(q) ||
      String(r.id).includes(q) ||
      (r.payment_method || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Recharge List</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user recharge requests</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, amount, or ID..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter size={16} className="text-gray-400" />
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Recharges Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Payment Method</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Account Holder</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vouchers</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Admin Note</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Request Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-400">
                    Loading recharges...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-400">
                    No recharges found
                  </td>
                </tr>
              ) : (
                filtered.map((recharge) => (
                  <tr key={recharge.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">#{recharge.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{recharge.user_name || "—"}</p>
                        <p className="text-xs text-gray-500">ID: {recharge.user_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      R$ {Math.round(parseFloat(recharge.amount || 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{recharge.payment_method || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{recharge.account_holder || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">{recharge.payment_reference || "—"}</td>
                    <td className="px-6 py-4">
                      {recharge.voucher_count > 0 ? (
                        <button
                          onClick={() => setSelectedImages({ id: recharge.id, images: recharge.payment_vouchers })}
                          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                        >
                          <FiImage size={14} />
                          {recharge.voucher_count} image{recharge.voucher_count > 1 ? "s" : ""}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColor(mapStatus(recharge.status))}`}>
                        {mapStatus(recharge.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px]">
                      {recharge.admin_note ? (
                        <p className="truncate" title={recharge.admin_note}>{recharge.admin_note}</p>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(recharge.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {recharge.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openActionModal(recharge, "approve")}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(recharge, "reject")}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* Approve / Reject Modal */}
      {/* ══════════════════════════════════════════ */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className={`flex items-center gap-3 px-6 py-4 ${
              actionModal.action === "approve" ? "bg-green-50 border-b border-green-100" : "bg-red-50 border-b border-red-100"
            }`}>
              {actionModal.action === "approve" ? (
                <FiCheckCircle size={22} className="text-green-600" />
              ) : (
                <FiXCircle size={22} className="text-red-600" />
              )}
              <h3 className={`text-lg font-bold ${
                actionModal.action === "approve" ? "text-green-800" : "text-red-800"
              }`}>
                {actionModal.action === "approve" ? "Approve Recharge" : "Reject Recharge"}
              </h3>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors"
              >
                <FiX size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-600">
                  User: <span className="font-semibold text-gray-800">{actionModal.userName}</span>
                </p>
                <p className="text-gray-600 mt-1">
                  Amount: <span className="font-bold text-gray-800">R$ {actionModal.amount}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {actionModal.action === "approve" ? "Approval Comment" : "Rejection Reason"}
                  {actionModal.action === "reject" && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={
                    actionModal.action === "approve"
                      ? "Optional: Add a comment for this approval..."
                      : "Required: Explain why this recharge is being rejected..."
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                disabled={actionLoading}
                className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionLoading || (actionModal.action === "reject" && !actionReason.trim())}
                className={`px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 ${
                  actionModal.action === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : actionModal.action === "approve"
                  ? "Confirm Approve"
                  : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* Image Viewer Modal */}
      {/* ══════════════════════════════════════════ */}
      {selectedImages && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Payment Vouchers</h3>
              <button
                onClick={() => setSelectedImages(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {selectedImages.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Voucher ${index + 1}`}
                      className="w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
