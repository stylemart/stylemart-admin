// ============================================================
// WITHDRAWAL LIST PAGE
// Manage user withdrawal requests with approve/reject + reason
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiX, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Action modal state
  const [actionModal, setActionModal] = useState(null); // { id, action, userName, amount }
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const statusOptions = ["all", "pending", "approved", "rejected", "completed"];

  async function fetchWithdrawals() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const statusParam = statusFilter === "all" ? "all" : statusFilter === "approved" ? "completed" : statusFilter === "rejected" ? "cancelled" : statusFilter;
      const res = await fetch(`/api/withdrawals?status=${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawals(data.withdrawals || []);
      } else {
        console.error("Failed to fetch withdrawals:", data.error);
        setWithdrawals([]);
      }
    } catch (error) {
      console.error("Fetch withdrawals error:", error);
      setWithdrawals([]);
    }
    setLoading(false);
  }

  function openActionModal(withdrawal, action) {
    setActionModal({
      id: withdrawal.id,
      action,
      userName: withdrawal.user_name,
      amount: withdrawal.amount,
    });
    setActionReason("");
  }

  async function handleConfirmAction() {
    if (!actionModal) return;
    setActionLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/withdrawals/${actionModal.id}`, {
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
        alert(`Withdrawal ${actionModal.action === "approve" ? "approved" : "rejected"} successfully!`);
        setActionModal(null);
        setActionReason("");
        await fetchWithdrawals();
      } else {
        alert(data.error || `Failed to ${actionModal.action} withdrawal`);
      }
    } catch (error) {
      console.error("Withdrawal action error:", error);
      alert(`Failed to ${actionModal.action} withdrawal`);
    }
    setActionLoading(false);
  }

  useEffect(() => {
    fetchWithdrawals();
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
  const filtered = withdrawals.filter((w) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (w.user_name || "").toLowerCase().includes(q) ||
      String(w.amount).includes(q) ||
      String(w.id).includes(q) ||
      (w.payment_method || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Withdrawal List</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user withdrawal requests</p>
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

      {/* Withdrawals Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Payment Method</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Account Info</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Admin Note</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Request Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    Loading withdrawals...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    No withdrawals found
                  </td>
                </tr>
              ) : (
                filtered.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">#{withdrawal.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{withdrawal.user_name || "—"}</p>
                        <p className="text-xs text-gray-500">ID: {withdrawal.user_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      R$ {Math.round(parseFloat(withdrawal.amount || 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{withdrawal.payment_method || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="text-xs">
                        {withdrawal.phone_number && (
                          <p>Mobile: {withdrawal.phone_number}</p>
                        )}
                        {withdrawal.account_number && (
                          <p>Account: {withdrawal.account_number}</p>
                        )}
                        {withdrawal.account_holder_name && (
                          <p>Name: {withdrawal.account_holder_name}</p>
                        )}
                        {withdrawal.iban && (
                          <p>IBAN: {withdrawal.iban}</p>
                        )}
                        {!withdrawal.phone_number && !withdrawal.account_number && "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColor(mapStatus(withdrawal.status))}`}>
                        {mapStatus(withdrawal.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px]">
                      {withdrawal.admin_note ? (
                        <p className="truncate" title={withdrawal.admin_note}>{withdrawal.admin_note}</p>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(withdrawal.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {withdrawal.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openActionModal(withdrawal, "approve")}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(withdrawal, "reject")}
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
                {actionModal.action === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}
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
                      : "Required: Explain why this withdrawal is being rejected..."
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
    </div>
  );
}
