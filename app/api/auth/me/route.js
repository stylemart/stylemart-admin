// ============================================================
// GET /api/auth/me
// Get current logged-in admin user info
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    // Check if admin is authenticated
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Get fresh admin data from database
    const result = await query(
      "SELECT id, username, full_name, email, phone, role, avatar_url, last_login_at, created_at FROM admin_users WHERE id = $1",
      [authResult.admin.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ admin: result.rows[0] });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
