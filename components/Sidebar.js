// ============================================================
// SIDEBAR COMPONENT
// Navigation sidebar for the admin dashboard
// Role-based: Super Admin sees everything, Sub Admin sees limited
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FiHome,
  FiShoppingBag,
  FiGrid,
  FiUsers,
  FiShoppingCart,
  FiImage,
  FiMessageCircle,
  FiSettings,
  FiDollarSign,
  FiGift,
  FiUserPlus,
  FiGlobe,
  FiCreditCard,
  FiCalendar,
  FiChevronDown,
  FiChevronRight,
  FiFileText,
  FiList,
  FiPhone,
  FiShield,
  FiLogOut,
} from "react-icons/fi";

// Full menu items — Super Admin sees everything
const allMenuItems = [
  {
    label: "Front Page",
    href: "/dashboard",
    icon: FiHome,
    roles: ["super_admin", "sub_admin"],
  },
  {
    label: "SUB ADMIN MANAGEMENT",
    type: "divider",
    roles: ["super_admin"],
  },
  {
    label: "Sub Admins",
    href: "/dashboard/sub-admins",
    icon: FiShield,
    roles: ["super_admin"],
  },
  {
    label: "MEMBERSHIP MANAGEMENT",
    type: "divider",
    roles: ["super_admin", "sub_admin"],
  },
  {
    label: "Membership Management",
    icon: FiUsers,
    roles: ["super_admin", "sub_admin"],
    children: [
      {
        label: "Member List",
        href: "/dashboard/users",
        icon: FiUsers,
        roles: ["super_admin", "sub_admin"],
      },
      {
        label: "Real-name Authentication",
        href: "/dashboard/users/verification",
        icon: FiFileText,
        roles: ["super_admin", "sub_admin"],
      },
    ],
  },
  {
    label: "TRANSACTION MANAGEMENT",
    type: "divider",
    roles: ["super_admin", "sub_admin"],
  },
  {
    label: "Transaction Management",
    icon: FiShoppingCart,
    roles: ["super_admin", "sub_admin"],
    children: [
      {
        label: "Order List",
        href: "/dashboard/orders",
        icon: FiList,
        roles: ["super_admin", "sub_admin"],
      },
      {
        label: "Withdrawal List",
        href: "/dashboard/withdrawals",
        icon: FiDollarSign,
        roles: ["super_admin", "sub_admin"],
      },
      {
        label: "Recharge List",
        href: "/dashboard/recharges",
        icon: FiCreditCard,
        roles: ["super_admin", "sub_admin"],
      },
    ],
  },
  {
    label: "CATALOG",
    type: "divider",
    roles: ["super_admin"],
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: FiShoppingBag,
    roles: ["super_admin"],
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
    icon: FiGrid,
    roles: ["super_admin"],
  },
  {
    label: "SALES",
    type: "divider",
    roles: ["super_admin"],
  },
  {
    label: "Group Buy",
    href: "/dashboard/group-buy",
    icon: FiUsers,
    roles: ["super_admin"],
  },
  {
    label: "Treasure Snatch",
    href: "/dashboard/treasure-snatch",
    icon: FiGift,
    roles: ["super_admin"],
  },
      {
        label: "OPERATIONS CONFIGURATION",
        type: "divider",
        roles: ["super_admin", "sub_admin"],
      },
      {
        label: "Support Links",
        href: "/dashboard/operations/agent-cs",
        icon: FiPhone,
        roles: ["super_admin", "sub_admin"],
      },
  {
    label: "CONTENT",
    type: "divider",
    roles: ["super_admin"],
  },
  {
    label: "Banners",
    href: "/dashboard/banners",
    icon: FiImage,
    roles: ["super_admin"],
  },
  {
    label: "Daily Push",
    href: "/dashboard/daily-push",
    icon: FiCalendar,
    roles: ["super_admin"],
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: FiMessageCircle,
    roles: ["super_admin"],
  },
  {
    label: "SYSTEM",
    type: "divider",
    roles: ["super_admin"],
  },
  {
    label: "Languages",
    href: "/dashboard/languages",
    icon: FiGlobe,
    roles: ["super_admin"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: FiSettings,
    roles: ["super_admin"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState({
    "Membership Management": true,
    "Transaction Management": true,
  });
  const [adminRole, setAdminRole] = useState("super_admin");
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin");
      if (stored) {
        const admin = JSON.parse(stored);
        setAdminRole(admin.role || "super_admin");
        setAdminInfo(admin);
      }
    } catch (e) {
      // fallback
    }
  }, []);

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isChildActive = (children) => {
    return children?.some((child) => pathname === child.href);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    window.location.href = "/login";
  };

  // Filter menu items by role
  const filteredMenuItems = allMenuItems
    .filter((item) => item.roles?.includes(adminRole))
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) => child.roles?.includes(adminRole)),
        };
      }
      return item;
    });

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar text-white flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-600">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-white text-lg font-bold">S</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">StyleMart</h1>
          <p className="text-xs text-slate-400">
            {adminRole === "super_admin" ? "Super Admin" : "Sub Admin"}
          </p>
        </div>
      </div>

      {/* Sub Admin Info Banner */}
      {adminRole === "sub_admin" && adminInfo?.storefront_code && (
        <div className="mx-3 mt-3 px-3 py-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
          <p className="text-xs text-indigo-300">Your Storefront Code</p>
          <p className="text-sm font-mono font-bold text-indigo-200">{adminInfo.storefront_code}</p>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {filteredMenuItems.map((item, index) => {
          // Section divider
          if (item.type === "divider") {
            return (
              <p
                key={index}
                className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2"
              >
                {item.label}
              </p>
            );
          }

          const Icon = item.icon;

          // Expandable menu with children
          if (item.children) {
            const isExpanded = expandedMenus[item.label] || false;
            const hasActiveChild = isChildActive(item.children);

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors duration-150 ${
                    hasActiveChild
                      ? "bg-primary/20 text-white"
                      : "text-slate-300 hover:bg-sidebar-hover hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {isExpanded ? (
                    <FiChevronDown size={16} />
                  ) : (
                    <FiChevronRight size={16} />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-0.5">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                            isActive
                              ? "bg-primary text-white"
                              : "text-slate-400 hover:bg-sidebar-hover hover:text-white"
                          }`}
                        >
                          <ChildIcon size={16} />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Regular menu link
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href || item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer with Logout */}
      <div className="px-4 py-3 border-t border-slate-600">
        {adminInfo && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center text-xs font-bold">
                {(adminInfo.username || "A")[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-300 truncate">
                {adminInfo.full_name || adminInfo.username}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors"
        >
          <FiLogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
