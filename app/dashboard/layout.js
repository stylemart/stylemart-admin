// ============================================================
// DASHBOARD LAYOUT
// Wraps all dashboard pages with Sidebar + Header
// Redirects to login if not authenticated
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");

    if (!token || !admin) {
      router.push("/login");
      return;
    }

    // Verify token is valid
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("admin");
          router.push("/login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.admin) {
          // Update stored admin info with fresh data
          localStorage.setItem("admin", JSON.stringify(data.admin));
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}
