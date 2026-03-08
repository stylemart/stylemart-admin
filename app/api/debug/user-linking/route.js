// ============================================================
// /api/debug/user-linking
// Diagnostic endpoint to check user linking issues
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

    // Get all users and their linking status
    const usersResult = await query(
      `SELECT 
        u.id,
        u.nickname,
        u.admin_owner_id,
        u.invitation_code_id,
        ic.code as invitation_code,
        ic.owner_admin_id as code_owner_id,
        ic.type as code_type,
        a.username as sub_admin_username,
        a.storefront_code
      FROM users u
      LEFT JOIN invitation_codes ic ON u.invitation_code_id = ic.id
      LEFT JOIN admin_users a ON u.admin_owner_id = a.id
      ORDER BY u.created_at DESC
      LIMIT 50`
    );

    // Get Sub Admin info
    const subAdminResult = await query(
      `SELECT id, username, storefront_code, created_at
       FROM admin_users
       WHERE role = 'sub_admin'
       ORDER BY created_at DESC`
    );

    // Get invitation codes status
    const codesResult = await query(
      `SELECT 
        ic.id,
        ic.code,
        ic.type,
        ic.owner_admin_id,
        ic.created_by_admin_id,
        a.username as owner_username,
        a.storefront_code
      FROM invitation_codes ic
      LEFT JOIN admin_users a ON ic.owner_admin_id = a.id
      WHERE ic.type = 'storefront'
      ORDER BY ic.created_at DESC
      LIMIT 20`
    );

    return NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        storefront_code: admin.storefront_code,
      },
      users: usersResult.rows,
      sub_admins: subAdminResult.rows,
      invitation_codes: codesResult.rows,
      summary: {
        total_users: usersResult.rows.length,
        users_with_admin_owner: usersResult.rows.filter((u) => u.admin_owner_id).length,
        users_without_admin_owner: usersResult.rows.filter((u) => !u.admin_owner_id).length,
        total_sub_admins: subAdminResult.rows.length,
      },
    });
  } catch (error) {
    console.error("Debug user linking error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
