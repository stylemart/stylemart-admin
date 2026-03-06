// ============================================================
// BREADCRUMB COMPONENT
// Shows navigation path (e.g., Home / Operations / Agent CS)
// ============================================================

"use client";

import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export default function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {isLast ? (
              <span className="text-gray-800 font-medium">{item.label}</span>
            ) : (
              <>
                <Link
                  href={item.href || "#"}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
                <FiChevronRight size={14} className="text-gray-400" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
