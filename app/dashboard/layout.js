// ============================================================
// DASHBOARD LAYOUT
// Wraps all dashboard pages with Sidebar + Header
// ============================================================

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main content area - offset by sidebar width */}
      <div className="ml-64">
        {/* Header - fixed top */}
        <Header />

        {/* Page content - below header */}
        <main className="pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}
