// ============================================================
// /api/withdrawals
// GET - List withdrawal requests (filtered by admin role)
// Super Admin: sees ALL withdrawals
// Sub Admin: sees ONLY withdrawals from their users
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
    let status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    if (status === "approved") status = "completed";
    else if (status === "rejected") status = "cancelled";

    // Build dynamic query
    let whereClause = "WHERE wt.type = 'withdraw'";
    const params = [];

    // Sub Admin filter
    if (admin.role === "sub_admin") {
      params.push(admin.id);
      whereClause += ` AND u.admin_owner_id = $${params.length}`;
    }

    if (status !== "all") {
      params.push(status);
      whereClause += ` AND wt.status = $${params.length}`;
    }

    // Count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM wallet_transactions wt JOIN users u ON wt.user_id = u.id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.total || 0);

    // Data
    params.push(limit, offset);
    const result = await query(
      `SELECT 
        wt.id, wt.user_id, wt.amount, wt.balance_before, wt.balance_after,
        wt.status, wt.description, wt.admin_note, wt.processed_at, wt.created_at,
        u.nickname, u.full_name, u.email, u.phone
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      ${whereClause}
      ORDER BY wt.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const withdrawals = result.rows.map((row) => {
      let paymentDetails = {};
      try {
        const jsonMatch = row.description?.match(/\{.*\}/);
        if (jsonMatch) {
          paymentDetails = JSON.parse(jsonMatch[0]);
        } else {
          const methodMatch = row.description?.match(/Withdrawal to (.+?)(?: -|$)/);
          if (methodMatch) paymentDetails.method = methodMatch[1];
          const mobileMatch = row.description?.match(/Mobile: (\d+)/);
          if (mobileMatch) paymentDetails.phone_number = mobileMatch[1];
          const accountMatch = row.description?.match(/Account: (.+?)(?: -|$)/);
          if (accountMatch) paymentDetails.account_number = accountMatch[1];
        }
      } catch (e) {
        paymentDetails.description = row.description;
      }

      return {
        id: row.id,
        user_id: row.user_id,
        user_name: row.nickname || row.full_name || `User #${row.user_id}`,
        user_email: row.email,
        user_phone: row.phone,
        amount: Math.round(parseFloat(row.amount || 0)),
        balance_before: Math.round(parseFloat(row.balance_before || 0)),
        balance_after: Math.round(parseFloat(row.balance_after || 0)),
        status: row.status,
        payment_method: paymentDetails.method || "Unknown",
        account_number: paymentDetails.account_number || null,
        account_holder_name: paymentDetails.account_holder_name || null,
        phone_number: paymentDetails.phone_number || null,
        iban: paymentDetails.iban || null,
        admin_note: row.admin_note || null,
        processed_at: row.processed_at || null,
        created_at: row.created_at,
      };
    });

    return NextResponse.json({
      withdrawals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}
