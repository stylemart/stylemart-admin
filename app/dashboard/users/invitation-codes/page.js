// ============================================================
// INVITATION CODES MANAGEMENT PAGE
// Admin can generate and copy invitation codes
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { FiCopy, FiRefreshCw, FiPlus } from "react-icons/fi";

export default function InvitationCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(10);

  async function fetchCodes() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/invitation-codes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCodes(data.codes || []);
    } catch (error) {
      console.error("Fetch invitation codes error:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCodes();
  }, []);

  async function handleGenerate() {
    if (!count || count <= 0) return;
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/invitation-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to generate codes");
      } else {
        await fetchCodes();
      }
    } catch (error) {
      console.error("Generate codes error:", error);
      alert("Failed to generate codes");
    }
    setGenerating(false);
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      alert(`Copied: ${code}`);
    } catch {
      alert("Could not copy code");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invitation Codes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate invitation codes and share them with users for registration.
          </p>
        </div>
      </div>

      {/* Generator controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Generate</span>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value || "1"))}
            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm text-gray-600">new codes</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCodes}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-60"
          >
            <FiPlus size={16} />
            {generating ? "Generating..." : "Generate Codes"}
          </button>
        </div>
      </div>

      {/* Codes table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Used By
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Used At
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-400 text-sm"
                  >
                    Loading invitation codes...
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-400 text-sm"
                  >
                    No invitation codes yet. Generate some above.
                  </td>
                </tr>
              ) : (
                codes.map((code) => (
                  <tr key={code.id} className="border-t border-gray-50">
                    <td className="px-6 py-3 text-sm font-mono text-gray-800">
                      {code.code}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {code.is_used ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          Used
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                          Unused
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {code.used_by_user_id
                        ? `${code.used_by_nickname || ""} (ID ${code.used_by_user_id})`
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {code.created_at
                        ? new Date(code.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {code.used_at
                        ? new Date(code.used_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {!code.is_used && (
                        <button
                          type="button"
                          onClick={() => copyCode(code.code)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                        >
                          <FiCopy size={14} />
                          Copy
                        </button>
                      )}
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

