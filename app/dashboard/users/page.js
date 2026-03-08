// ============================================================
// MEMBER LIST PAGE
// Matches reference admin panel - professional table layout
// All Operate menu items are fully functional
// ============================================================

"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiSettings,
  FiPlus,
  FiEdit,
  FiLock,
  FiKey,
  FiInfo,
  FiCreditCard,
  FiStar,
  FiRotateCw,
  FiSlash,
  FiXCircle,
  FiMinusCircle,
  FiUserX,
  FiChevronDown,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userGroup, setUserGroup] = useState("");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [openMenuUserId, setOpenMenuUserId] = useState(null);

  // Balance modal
  const [balanceModal, setBalanceModal] = useState(null);
  const [balanceType, setBalanceType] = useState("add");
  const [balanceAmount, setBalanceAmount] = useState("0");

  // Operate modals
  const [editModal, setEditModal] = useState(null);
  const [loginPwModal, setLoginPwModal] = useState(null);
  const [txPwModal, setTxPwModal] = useState(null);
  const [infoModal, setInfoModal] = useState(null);
  const [creditModal, setCreditModal] = useState(null);
  const [withdrawalAccModal, setWithdrawalAccModal] = useState(null);

  // Form states
  const [editForm, setEditForm] = useState({ nickname: "", full_name: "", email: "", phone: "" });
  const [newLoginPw, setNewLoginPw] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [newTxPw, setNewTxPw] = useState("");
  const [showTxPw, setShowTxPw] = useState(false);
  const [creditScore, setCreditScore] = useState("");
  const [withdrawalForm, setWithdrawalForm] = useState({
    method: "", account: "", holder: "", iban: "",
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 }); // fixed position for dropdown
  const menuRef = useRef(null);
  const operateBtnRefs = useRef({});

  // ── Fetch Users ──
  async function fetchUsers(page = 1) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append("search", search);
      const res = await fetch(`/api/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setPagination(data.pagination || {});
      } else {
        console.error("Fetch users error:", data.error);
        if (res.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("admin");
          window.location.href = "/login";
        }
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    }
    setLoading(false);
  }

  async function fetchWithdrawals() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/withdrawals?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error("Fetch withdrawals error:", error);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchWithdrawals();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuUserId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchUsers(1);
  }

  function handleReset() {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setUserGroup("");
    fetchUsers(1);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  }

  // ── Generic Operate Action ──
  async function callOperate(userId, body) {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${userId}/operate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Operation failed");
        return null;
      }
      return data;
    } catch (error) {
      console.error("Operate error:", error);
      alert("Operation failed");
      return null;
    } finally {
      setActionLoading(false);
    }
  }

  // ── Open Balance Modal ──
  async function openBalanceModal(user) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let currentBalance = Math.round(parseFloat(user.wallet_balance || 0));
      if (res.ok) {
        const data = await res.json();
        if (data.user?.wallet_balance !== undefined) {
          currentBalance = Math.round(parseFloat(data.user.wallet_balance || 0));
        }
      }
      setBalanceModal({
        userId: user.id,
        username: user.nickname || user.full_name || `User #${user.id}`,
        balance: currentBalance,
      });
      setBalanceType("add");
      setBalanceAmount("0");
    } catch (err) {
      const currentBalance = Math.round(parseFloat(user.wallet_balance || 0));
      setBalanceModal({
        userId: user.id,
        username: user.nickname || user.full_name || `User #${user.id}`,
        balance: currentBalance,
      });
      setBalanceType("add");
      setBalanceAmount("0");
    }
  }

  // ── Operate Menu Handler ──
  async function handleOperateAction(actionKey, user) {
    setOpenMenuUserId(null);

    switch (actionKey) {
      case "editor_member":
        setEditForm({
          nickname: user.nickname || "",
          full_name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
        setEditModal(user);
        break;

      case "change_login_password":
        setNewLoginPw("");
        setShowLoginPw(false);
        setLoginPwModal(user);
        break;

      case "change_transaction_password":
        setNewTxPw("");
        setShowTxPw(false);
        setTxPwModal(user);
        break;

      case "account_information": {
        // Fetch full user details
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInfoModal(data.user);
        } else {
          setInfoModal(user);
        }
        break;
      }

      case "modify_withdrawal_account":
        setWithdrawalForm({
          method: user.withdrawal_method || "",
          account: user.withdrawal_account || "",
          holder: user.withdrawal_holder || "",
          iban: user.withdrawal_iban || "",
        });
        setWithdrawalAccModal(user);
        break;

      case "modify_credit_score":
        setCreditScore(String(user.credit_score ?? 10));
        setCreditModal(user);
        break;

      case "refresh_ip": {
        const data = await callOperate(user.id, { action: "refresh_ip" });
        if (data) {
          alert("IP attribution refreshed");
          await fetchUsers(pagination.page);
        }
        break;
      }

      case "account_ban": {
        const action = user.is_active ? "ban" : "enable";
        if (!confirm(`Are you sure you want to ${action} this account?`)) return;
        const data = await callOperate(user.id, { action: "account_ban" });
        if (data) {
          alert(data.message);
          await fetchUsers(pagination.page);
        }
        break;
      }

      case "trading_prohibited": {
        const current = user.transaction_status === "Tradeable";
        const actionLabel = current ? "prohibit trading for" : "enable trading for";
        if (!confirm(`Are you sure you want to ${actionLabel} this user?`)) return;
        const data = await callOperate(user.id, { action: "trading_prohibited" });
        if (data) {
          alert(data.message);
          await fetchUsers(pagination.page);
        }
        break;
      }

      case "withdrawals_prohibited": {
        const current = user.withdrawal_status === "Cashable";
        const actionLabel = current ? "prohibit withdrawals for" : "enable withdrawals for";
        if (!confirm(`Are you sure you want to ${actionLabel} this user?`)) return;
        const data = await callOperate(user.id, { action: "withdrawals_prohibited" });
        if (data) {
          alert(data.message);
          await fetchUsers(pagination.page);
        }
        break;
      }

      case "set_dummy": {
        const current = user.is_dummy;
        const actionLabel = current ? "set as real person" : "set as dummy";
        if (!confirm(`Are you sure you want to ${actionLabel}?`)) return;
        const data = await callOperate(user.id, { action: "set_dummy" });
        if (data) {
          alert(data.message);
          await fetchUsers(pagination.page);
        }
        break;
      }

      default:
        break;
    }
  }

  async function handleWithdrawalAction(withdrawalId, action) {
    if (!confirm(`Are you sure you want to ${action} this withdrawal request?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/withdrawals/${withdrawalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Withdrawal ${action}d successfully!`);
        await fetchWithdrawals();
        await fetchUsers(pagination.page);
      } else {
        alert(data.error || `Failed to ${action} withdrawal`);
      }
    } catch (error) {
      alert(`Failed to ${action} withdrawal`);
    }
  }

  // Operate menu definition
  const operateMenuItems = [
    { key: "editor_member", label: "Editor Member", icon: FiEdit, type: "normal" },
    { key: "change_login_password", label: "Change login password", icon: FiLock, type: "normal" },
    { key: "change_transaction_password", label: "Change transaction password", icon: FiKey, type: "normal" },
    { key: "account_information", label: "Account information", icon: FiInfo, type: "normal" },
    { key: "modify_withdrawal_account", label: "Modify withdrawal account", icon: FiCreditCard, type: "normal" },
    { key: "modify_credit_score", label: "Modify credit score", icon: FiStar, type: "normal" },
    { key: "refresh_ip", label: "Refresh IP Attribution", icon: FiRotateCw, type: "normal" },
    { type: "divider" },
    { key: "account_ban", label: "Account ban", icon: FiSlash, type: "danger" },
    { key: "trading_prohibited", label: "Trading is prohibited", icon: FiXCircle, type: "danger" },
    { key: "withdrawals_prohibited", label: "Withdrawals are prohibited", icon: FiMinusCircle, type: "danger" },
    { key: "set_dummy", label: "Set as a dummy", icon: FiUserX, type: "danger" },
  ];

  // ── Reusable Modal Shell ──
  function ModalShell({ title, onClose, onConfirm, confirmText = "Save", children }) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <FiX size={18} className="text-gray-500" />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">{children}</div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={actionLoading}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold text-white shadow-sm disabled:opacity-50"
            >
              {actionLoading ? "Saving..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Member List</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and control all members (balance, status, permissions)
          </p>
        </div>
      </div>

      {/* ── Search / Filter Bar ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <form onSubmit={handleSearch}>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Keywords</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Keywords"
                className="w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Registration time</label>
              <div className="flex items-center gap-2">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <span className="text-gray-400">–</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">User Group</label>
              <select value={userGroup} onChange={(e) => setUserGroup(e.target.value)}
                className="w-52 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-600">
                <option value="">Please select user group</option>
                <option value="real">Real people</option>
                <option value="dummy">Dummy</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg">
                <FiSearch size={14} /> Search
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg">
                <FiRefreshCw size={14} /> Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Action Bar ── */}
      <div className="flex items-center justify-between mb-4">
        <button type="button"
          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-blue-400 text-blue-500 hover:bg-blue-50 text-sm font-medium rounded-lg">
          <FiPlus size={14} /> Add Member
        </button>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => fetchUsers(pagination.page)}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50" title="Refresh">
            <FiRefreshCw size={14} className="text-gray-500" />
          </button>
          <button type="button"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600 font-medium">
            <FiSettings size={14} /> List configuration
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                {["Username", "ID", "Balance", "Superior Account", "Credit Score", "Invitation Code",
                  "IP", "Is it a Dummy?", "Disabled Status", "Transaction Status", "Withdrawal Status",
                  "Recently Logged In", "Registration Time", "Operate",
                ].map((col) => (
                  <th key={col} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={14} className="px-5 py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2"><FiRefreshCw size={20} className="animate-spin" /><span>Loading members...</span></div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={14} className="px-5 py-16 text-center text-gray-400">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                      {user.nickname || user.full_name || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{user.id}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                      {Math.round(parseFloat(user.wallet_balance || 0))}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {user.referred_by ? `A${user.referred_by}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{user.credit_score ?? 10}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 font-mono whitespace-nowrap">{user.referral_code || "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap max-w-[160px]">
                      <div className="truncate" title={user.last_ip || ""}>{user.last_ip || "—"}</div>
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                      <span className={user.is_dummy ? "text-orange-500" : "text-gray-600"}>
                        {user.is_dummy ? "Dummy" : "Real people"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                      <span className={user.is_active ? "text-green-600" : "text-red-500 font-medium"}>
                        {user.is_active ? "Enable" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                      <span className={user.transaction_status === "Tradeable" ? "text-green-600" : "text-red-500 font-medium"}>
                        {user.transaction_status || "Tradeable"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap">
                      <span className={user.withdrawal_status === "Cashable" ? "text-green-600" : "text-red-500 font-medium"}>
                        {user.withdrawal_status || "Cashable"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.last_login_at)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openBalanceModal(user)}
                          className="px-4 py-1.5 bg-sky-400 hover:bg-sky-500 text-white text-xs font-semibold rounded-md shadow-sm transition-all hover:shadow">
                          Up and down
                        </button>
                        <button
                          type="button"
                          ref={(el) => { operateBtnRefs.current[user.id] = el; }}
                          onClick={() => {
                            if (openMenuUserId === user.id) {
                              setOpenMenuUserId(null);
                            } else {
                              const rect = operateBtnRefs.current[user.id]?.getBoundingClientRect();
                              if (rect) {
                                setMenuPos({ top: rect.bottom + 4, left: Math.min(rect.right - 260, window.innerWidth - 270) });
                              }
                              setOpenMenuUserId(user.id);
                            }
                          }}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-md shadow-sm transition-all hover:shadow inline-flex items-center gap-1">
                          Operate <FiChevronDown size={12} />
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
        {pagination.totalPages > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/40">
            <p className="text-sm text-gray-500">
              Total <span className="font-semibold text-gray-700">{pagination.total || 0}</span> members &nbsp;·&nbsp; Page {pagination.page} of {pagination.totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button onClick={() => fetchUsers(pagination.page - 1)} disabled={pagination.page <= 1}
                className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
              <button onClick={() => fetchUsers(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Pending Withdrawal Requests ── */}
      {withdrawals.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiCreditCard size={20} /> Pending Withdrawal Requests ({withdrawals.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["User", "Amount", "Payment Method", "Account Details", "Requested", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-5 py-4"><p className="text-sm font-semibold text-gray-800">{w.user_name}</p><p className="text-xs text-gray-500">ID: {w.user_id}</p></td>
                    <td className="px-5 py-4"><p className="text-sm font-bold text-gray-800">R$ {w.amount}</p></td>
                    <td className="px-5 py-4"><p className="text-sm text-gray-700">{w.payment_method}</p></td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-gray-600">
                        {w.phone_number && <p>Mobile: {w.phone_number}</p>}
                        {w.account_number && <p>Account: {w.account_number}</p>}
                        {w.account_holder_name && <p>Name: {w.account_holder_name}</p>}
                        {w.iban && <p>IBAN: {w.iban}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4"><p className="text-xs text-gray-500">{new Date(w.created_at).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleWithdrawalAction(w.id, "approve")}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg">Approve</button>
                        <button onClick={() => handleWithdrawalAction(w.id, "reject")}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Fixed Operate Dropdown (Portal style — not clipped by overflow) ── */}
      {openMenuUserId && (
        <>
          {/* Invisible backdrop to close menu on click outside */}
          <div className="fixed inset-0 z-[90]" onClick={() => setOpenMenuUserId(null)} />
          <div
            ref={menuRef}
            className="fixed w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-[95] py-1"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {operateMenuItems.map((item, idx) => {
              if (item.type === "divider") {
                return <div key={`div-${idx}`} className="border-t border-gray-100 my-1" />;
              }
              const Icon = item.icon;
              const isDanger = item.type === "danger";
              const currentUser = users.find((u) => u.id === openMenuUserId);
              if (!currentUser) return null;
              let label = item.label;
              if (item.key === "account_ban" && !currentUser.is_active) label = "Enable account";
              if (item.key === "trading_prohibited" && currentUser.transaction_status === "Prohibited") label = "Enable trading";
              if (item.key === "withdrawals_prohibited" && currentUser.withdrawal_status === "Prohibited") label = "Enable withdrawals";
              if (item.key === "set_dummy" && currentUser.is_dummy) label = "Set as real person";

              return (
                <button
                  key={item.key}
                  type="button"
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    isDanger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleOperateAction(item.key, currentUser)}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODALS */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* ── Up and Down (Balance) Modal ── */}
      {balanceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Up and Down</h3>
              <button type="button" onClick={() => setBalanceModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <FiX size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Member Account</label>
                <input type="text" value={balanceModal.username} readOnly className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Balance</label>
                <input type="text" value={String(Math.round(parseFloat(balanceModal.balance || 0)))} readOnly className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Operation Type</label>
                <div className="flex items-center gap-6 flex-wrap">
                  {[{ v: "add", l: "Add funds", c: "text-blue-600" }, { v: "deduct", l: "Deduct funds", c: "text-gray-600" }, { v: "set", l: "Set balance", c: "text-purple-600" }].map(o => (
                    <label key={o.v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="balanceType" value={o.v} checked={balanceType === o.v} onChange={() => setBalanceType(o.v)} className="w-4 h-4 text-blue-500" />
                      <span className={`text-sm font-medium ${o.c}`}>{o.l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5"><span className="text-red-500">*</span> Amount</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setBalanceAmount(String(Math.max(0, Math.round(parseFloat(balanceAmount || 0)) - 1)))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-lg font-bold text-gray-600">−</button>
                  <input type="number" value={balanceAmount}
                    onChange={(e) => { const v = e.target.value; setBalanceAmount(v === "" ? "" : String(Math.max(0, Math.round(parseFloat(v) || 0)))); }}
                    min="0" step="1" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <button type="button" onClick={() => setBalanceAmount(String(Math.round(parseFloat(balanceAmount || 0)) + 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-lg font-bold text-gray-600">+</button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button type="button" onClick={() => setBalanceModal(null)} className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button type="button" onClick={async () => {
                const amountNumber = Math.round(parseFloat(balanceAmount || "0"));
                if (balanceType === "set" ? (amountNumber < 0 || isNaN(amountNumber)) : (!amountNumber || amountNumber <= 0)) {
                  alert(balanceType === "set" ? "Enter a valid amount (0 or greater)" : "Enter an amount greater than 0"); return;
                }
                const token = localStorage.getItem("token");
                const res = await fetch(`/api/users/${balanceModal.userId}/balance`, {
                  method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ type: balanceType, amount: amountNumber }),
                });
                const data = await res.json();
                if (!res.ok) { alert(data.error || "Failed to update balance"); return; }
                await fetchUsers(pagination.page);
                setBalanceModal(null);
                alert(`Balance ${balanceType === "add" ? "added" : balanceType === "deduct" ? "deducted" : "set"} successfully! New balance: R$ ${Math.round(data.balance)}`);
              }} className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold text-white shadow-sm">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Editor Member Modal ── */}
      {editModal && (
        <ModalShell
          title="Edit Member"
          onClose={() => setEditModal(null)}
          onConfirm={async () => {
            const data = await callOperate(editModal.id, {
              action: "edit_member",
              ...editForm,
            });
            if (data) {
              alert(data.message);
              setEditModal(null);
              await fetchUsers(pagination.page);
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
            <input type="text" value={editForm.nickname} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </ModalShell>
      )}

      {/* ── Change Login Password Modal ── */}
      {loginPwModal && (
        <ModalShell
          title={`Change Login Password — ${loginPwModal.nickname || loginPwModal.full_name || `User #${loginPwModal.id}`}`}
          onClose={() => setLoginPwModal(null)}
          onConfirm={async () => {
            if (!newLoginPw || newLoginPw.length < 6) { alert("Password must be at least 6 characters"); return; }
            const data = await callOperate(loginPwModal.id, { action: "change_login_password", new_password: newLoginPw });
            if (data) { alert(data.message); setLoginPwModal(null); }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">New Login Password</label>
            <div className="relative">
              <input type={showLoginPw ? "text" : "password"} value={newLoginPw} onChange={(e) => setNewLoginPw(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="button" onClick={() => setShowLoginPw(!showLoginPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showLoginPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ── Change Transaction Password Modal ── */}
      {txPwModal && (
        <ModalShell
          title={`Change Transaction Password — ${txPwModal.nickname || txPwModal.full_name || `User #${txPwModal.id}`}`}
          onClose={() => setTxPwModal(null)}
          onConfirm={async () => {
            if (!newTxPw || newTxPw.length < 6) { alert("Password must be at least 6 characters"); return; }
            const data = await callOperate(txPwModal.id, { action: "change_transaction_password", new_transaction_password: newTxPw });
            if (data) { alert(data.message); setTxPwModal(null); }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">New Transaction Password</label>
            <div className="relative">
              <input type={showTxPw ? "text" : "password"} value={newTxPw} onChange={(e) => setNewTxPw(e.target.value)}
                placeholder="Enter new transaction password (min 6 chars)"
                className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="button" onClick={() => setShowTxPw(!showTxPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showTxPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ── Account Information Modal ── */}
      {infoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Account Information</h3>
              <button type="button" onClick={() => setInfoModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <FiX size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["User ID", infoModal.id],
                  ["Username", infoModal.nickname || "—"],
                  ["Full Name", infoModal.full_name || "—"],
                  ["Email", infoModal.email || "—"],
                  ["Phone", infoModal.phone || "—"],
                  ["Balance", `R$ ${Math.round(parseFloat(infoModal.wallet_balance || 0))}`],
                  ["Frozen Balance", `R$ ${Math.round(parseFloat(infoModal.frozen_balance || 0))}`],
                  ["Total Deposited", `R$ ${Math.round(parseFloat(infoModal.total_deposited || 0))}`],
                  ["Total Withdrawn", `R$ ${Math.round(parseFloat(infoModal.total_withdrawn || 0))}`],
                  ["Total Spent", `R$ ${Math.round(parseFloat(infoModal.total_spent || 0))}`],
                  ["Credit Score", infoModal.credit_score ?? 10],
                  ["Referral Code", infoModal.referral_code || "—"],
                  ["Referred By", infoModal.referred_by ? `User #${infoModal.referred_by}` : "—"],
                  ["Status", infoModal.is_active ? "Active" : "Banned"],
                  ["Trading", infoModal.trading_enabled === false ? "Prohibited" : "Enabled"],
                  ["Withdrawal", infoModal.withdrawal_enabled === false ? "Prohibited" : "Enabled"],
                  ["Is Dummy", infoModal.is_dummy ? "Yes" : "No"],
                  ["Last Login", infoModal.last_login_at ? formatDate(infoModal.last_login_at) : "—"],
                  ["Registered", formatDate(infoModal.created_at)],
                  ["Last IP", infoModal.last_ip || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="py-2 border-b border-gray-50">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button type="button" onClick={() => setInfoModal(null)}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold text-white shadow-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modify Credit Score Modal ── */}
      {creditModal && (
        <ModalShell
          title={`Modify Credit Score — ${creditModal.nickname || creditModal.full_name || `User #${creditModal.id}`}`}
          onClose={() => setCreditModal(null)}
          onConfirm={async () => {
            const score = parseInt(creditScore, 10);
            if (isNaN(score) || score < 0 || score > 100) { alert("Credit score must be between 0 and 100"); return; }
            const data = await callOperate(creditModal.id, { action: "modify_credit_score", credit_score: score });
            if (data) { alert(data.message); setCreditModal(null); await fetchUsers(pagination.page); }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Credit Score (0-100)</label>
            <input type="number" value={creditScore} onChange={(e) => setCreditScore(e.target.value)}
              min="0" max="100" step="1"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </ModalShell>
      )}

      {/* ── Modify Withdrawal Account Modal ── */}
      {withdrawalAccModal && (
        <ModalShell
          title={`Modify Withdrawal Account — ${withdrawalAccModal.nickname || withdrawalAccModal.full_name || `User #${withdrawalAccModal.id}`}`}
          onClose={() => setWithdrawalAccModal(null)}
          onConfirm={async () => {
            const data = await callOperate(withdrawalAccModal.id, {
              action: "modify_withdrawal_account",
              withdrawal_method: withdrawalForm.method,
              withdrawal_account: withdrawalForm.account,
              withdrawal_holder: withdrawalForm.holder,
              withdrawal_iban: withdrawalForm.iban,
            });
            if (data) { alert(data.message); setWithdrawalAccModal(null); await fetchUsers(pagination.page); }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Payment Method</label>
            <input type="text" value={withdrawalForm.method} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, method: e.target.value })}
              placeholder="e.g., JazzCash, EasyPaisa, HBL..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Account Number / Mobile</label>
            <input type="text" value={withdrawalForm.account} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, account: e.target.value })}
              placeholder="Account number or mobile number"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Account Holder Name</label>
            <input type="text" value={withdrawalForm.holder} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, holder: e.target.value })}
              placeholder="Name of account holder"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">IBAN (optional)</label>
            <input type="text" value={withdrawalForm.iban} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, iban: e.target.value })}
              placeholder="IBAN number (if applicable)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </ModalShell>
      )}
    </div>
  );
}
