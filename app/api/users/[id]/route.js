// ============================================================
// /api/users/[id]
// GET - Get single user details with latest balance and all fields
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const userId = parseInt(params.id, 10);
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

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
          u.language,
          u.currency,
          u.last_login_at,
          u.created_at,
          u.credit_score,
          u.is_dummy,
          u.trading_enabled,
          u.withdrawal_enabled,
          u.withdrawal_method,
          u.withdrawal_account,
          u.withdrawal_holder,
          u.withdrawal_iban,
          u.last_ip,
          w.balance AS wallet_balance,
          w.frozen_balance,
          w.total_deposited,
          w.total_withdrawn,
          w.total_spent
       FROM users u
       LEFT JOIN wallets w ON u.id = w.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...result.rows[0],
        wallet_balance: parseFloat(result.rows[0].wallet_balance || 0),
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
