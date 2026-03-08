// ============================================================
// GET /api/auth/me
// Get current logged-in admin user info
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Get fresh admin data from database
    const result = await query(
      `SELECT id, username, full_name, email, phone, role, avatar_url, 
              parent_admin_id, storefront_code, last_login_at, created_at 
       FROM admin_users WHERE id = $1`,
      [authResult.admin.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    const admin = result.rows[0];

    // If sub_admin, also get their user count
    let userCount = 0;
    if (admin.role === "sub_admin") {
      const countResult = await query(
        "SELECT COUNT(*) as count FROM users WHERE admin_owner_id = $1",
        [admin.id]
      );
      userCount = parseInt(countResult.rows[0].count);
    }

    return NextResponse.json({
      admin: {
        ...admin,
        user_count: userCount,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
