// ============================================================
// /api/debug/sub-admin-users
// Quick diagnostic: Check if Sub Admin can see their users
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

    const admin = authResult.admin;

    // Get Sub Admin info from database (fresh)
    const adminResult = await query(
      "SELECT id, username, role, storefront_code FROM admin_users WHERE id = $1",
      [admin.id]
    );

    if (adminResult.rows.length === 0) {
      return NextResponse.json({ error: "Admin not found in database" }, { status: 404 });
    }

    const dbAdmin = adminResult.rows[0];

    // Get users linked to this Sub Admin
    const usersResult = await query(
      `SELECT u.id, u.nickname, u.admin_owner_id, u.created_at
       FROM users u
       WHERE u.admin_owner_id = $1
       ORDER BY u.created_at DESC`,
      [admin.id]
    );

    // Also check all users with admin_owner_id to see if there's a mismatch
    const allLinkedUsers = await query(
      `SELECT u.id, u.nickname, u.admin_owner_id, a.username as sub_admin_username
       FROM users u
       LEFT JOIN admin_users a ON u.admin_owner_id = a.id
       WHERE u.admin_owner_id IS NOT NULL
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({
      token_admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
      database_admin: {
        id: dbAdmin.id,
        username: dbAdmin.username,
        role: dbAdmin.role,
        storefront_code: dbAdmin.storefront_code,
      },
      users_linked_to_this_admin: usersResult.rows,
      all_linked_users: allLinkedUsers.rows,
      match: admin.id === dbAdmin.id ? "✅ IDs match" : "❌ IDs don't match!",
      user_count: usersResult.rows.length,
    });
  } catch (error) {
    console.error("Debug sub-admin users error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
