// ============================================================
// HEADER COMPONENT
// Top header bar for the admin dashboard
// Shows role badge (Super Admin / Sub Admin)
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiLogOut, FiUser, FiBell, FiShield } from "react-icons/fi";

export default function Header() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin");
    if (stored) {
      setAdmin(JSON.parse(stored));
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    router.push("/login");
  }

  const isSuperAdmin = admin?.role === "super_admin";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-40">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome back{admin?.full_name ? `, ${admin.full_name}` : ""}
        </h2>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
            isSuperAdmin
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {isSuperAdmin ? "Super Admin" : "Sub Admin"}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <FiBell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isSuperAdmin ? "bg-purple-500" : "bg-blue-500"
            }`}
          >
            {isSuperAdmin ? (
              <FiShield size={16} className="text-white" />
            ) : (
              <FiUser size={16} className="text-white" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700">
              {admin?.full_name || admin?.username || "Admin"}
            </p>
            <p className="text-xs text-gray-400">@{admin?.username}</p>
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
