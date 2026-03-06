// ============================================================
// REAL-NAME AUTHENTICATION PAGE
// Manage user identity verification requests
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiCheck, FiX } from "react-icons/fi";

export default function VerificationPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = ["all", "pending", "approved", "rejected"];

  async function fetchVerifications() {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setVerifications([]);
    } catch (error) {
      console.error("Fetch verifications error:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchVerifications();
  }, []);

  const statusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Real-name Authentication</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user identity verification requests</p>
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
            placeholder="Search by user name or ID..."
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

      {/* Verifications Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Full Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID Document</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Submitted Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No verification requests found</td>
                </tr>
              ) : (
                verifications.map((verification) => (
                  <tr key={verification.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">#{verification.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{verification.user_name || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{verification.full_name || "—"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{verification.id_number || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColor(verification.status)}`}>
                        {verification.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(verification.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-green-500 hover:bg-green-50 rounded" title="Approve">
                          <FiCheck size={16} />
                        </button>
                        <button className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Reject">
                          <FiX size={16} />
                        </button>
                        <button className="text-xs text-blue-500 hover:text-blue-700">View</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
