// ============================================================
// /api/users
// GET - List users (filtered by admin role)
// Super Admin: sees ALL users
// Sub Admin: sees ONLY users linked to them via admin_owner_id
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    // Sub Admin filter: only see their own users
    if (admin.role === "sub_admin") {
      // Ensure admin.id is treated as integer for comparison
      const adminId = parseInt(admin.id);
      params.push(adminId);
      whereClause += ` AND u.admin_owner_id = $${params.length}`;
      console.log(`[Sub Admin Filter] Admin ID: ${adminId} (type: ${typeof adminId}), Role: ${admin.role}`);
    } else {
      console.log(`[Super Admin] Seeing all users`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (u.full_name ILIKE $${params.length} OR u.nickname ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.phone ILIKE $${params.length})`;
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM users u ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].total);

    params.push(limit, offset);
    const result = await query(
      `SELECT 
          u.id,
          u.email,
          u.phone,
          u.full_name,
          u.nickname,
          u.avatar_url,
          u.is_active,
          u.is_verified,
          u.referral_code,
          u.referred_by,
          u.admin_owner_id,
          u.language,
          u.currency,
          u.last_login_at,
          u.created_at,
          u.credit_score,
          u.is_dummy,
          u.trading_enabled,
          u.withdrawal_enabled,
          u.last_ip,
          u.withdrawal_method,
          u.withdrawal_account,
          u.withdrawal_holder,
          u.withdrawal_iban,
          w.balance AS wallet_balance
       FROM users u
       LEFT JOIN wallets w ON u.id = w.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const users = result.rows.map((u) => ({
      ...u,
      credit_score: u.credit_score ?? 10,
      is_dummy: u.is_dummy === true,
      disabled_status: u.is_active ? "Enable" : "Disabled",
      transaction_status: u.trading_enabled === false ? "Prohibited" : "Tradeable",
      withdrawal_status: u.withdrawal_enabled === false ? "Prohibited" : "Cashable",
    }));

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
