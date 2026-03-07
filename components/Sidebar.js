// ============================================================
// SIDEBAR COMPONENT
// Navigation sidebar for the admin dashboard
// Matches reference admin panel structure
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
} from "react-icons/fi";

// Sidebar menu items with expandable sub-menus
const menuItems = [
  {
    label: "Front Page",
    href: "/dashboard",
    icon: FiHome,
  },
  {
    label: "MEMBERSHIP MANAGEMENT",
    type: "divider",
  },
  {
    label: "Membership Management",
    icon: FiUsers,
    children: [
      {
        label: "Member List",
        href: "/dashboard/users",
        icon: FiUsers,
      },
          {
            label: "Invitation Codes",
            href: "/dashboard/users/invitation-codes",
            icon: FiUserPlus,
          },
      {
        label: "Real-name Authentication",
        href: "/dashboard/users/verification",
        icon: FiFileText,
      },
    ],
  },
  {
    label: "TRANSACTION MANAGEMENT",
    type: "divider",
  },
  {
    label: "Transaction Management",
    icon: FiShoppingCart,
    children: [
      {
        label: "Order List",
        href: "/dashboard/orders",
        icon: FiList,
      },
      {
        label: "Withdrawal List",
        href: "/dashboard/withdrawals",
        icon: FiDollarSign,
      },
      {
        label: "Recharge List",
        href: "/dashboard/recharges",
        icon: FiCreditCard,
      },
    ],
  },
  {
    label: "CATALOG",
    type: "divider",
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: FiShoppingBag,
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
    icon: FiGrid,
  },
  {
    label: "SALES",
    type: "divider",
  },
  {
    label: "Group Buy",
    href: "/dashboard/group-buy",
    icon: FiUsers,
  },
  {
    label: "Treasure Snatch",
    href: "/dashboard/treasure-snatch",
    icon: FiGift,
  },
  {
    label: "OPERATIONS CONFIGURATION",
    type: "divider",
  },
  {
    label: "Support Links",
    href: "/dashboard/operations/agent-cs",
    icon: FiPhone,
  },
  {
    label: "CONTENT",
    type: "divider",
  },
  {
    label: "Banners",
    href: "/dashboard/banners",
    icon: FiImage,
  },
  {
    label: "Daily Push",
    href: "/dashboard/daily-push",
    icon: FiCalendar,
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: FiMessageCircle,
  },
  {
    label: "SYSTEM",
    type: "divider",
  },
  {
    label: "Languages",
    href: "/dashboard/languages",
    icon: FiGlobe,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: FiSettings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState({
    "Membership Management": true,
    "Transaction Management": true,
  });

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isChildActive = (children) => {
    return children?.some((child) => pathname === child.href);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar text-white flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-600">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-white text-lg font-bold">S</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">StyleMart</h1>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((item, index) => {
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

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-600">
        <p className="text-xs text-slate-400 text-center">v1.0.0</p>
      </div>
    </aside>
  );
}
