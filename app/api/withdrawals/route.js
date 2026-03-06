// ============================================================
// /api/withdrawals
// GET - List all withdrawal requests (admin only)
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

    const { searchParams } = new URL(request.url);
    let status = searchParams.get("status") || "all"; // all, pending, completed, cancelled, approved, rejected
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    // Map "approved" to "completed" and "rejected" to "cancelled" for database query
    if (status === "approved") {
      status = "completed";
    } else if (status === "rejected") {
      status = "cancelled";
    }

    // Get withdrawal requests with user info
    const result = await query(
      `SELECT 
        wt.id,
        wt.user_id,
        wt.amount,
        wt.balance_before,
        wt.balance_after,
        wt.status,
        wt.description,
        wt.admin_note,
        wt.processed_at,
        wt.created_at,
        u.nickname,
        u.full_name,
        u.email,
        u.phone
      FROM wallet_transactions wt
      JOIN users u ON wt.user_id = u.id
      WHERE wt.type = 'withdraw'
        ${status !== "all" ? `AND wt.status = $1` : ""}
      ORDER BY wt.created_at DESC
      LIMIT $${status !== "all" ? "2" : "1"} OFFSET $${status !== "all" ? "3" : "2"}`,
      status !== "all" ? [status, limit, offset] : [limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM wallet_transactions
       WHERE type = 'withdraw'
         ${status !== "all" ? `AND status = $1` : ""}`,
      status !== "all" ? [status] : []
    );

    const total = parseInt(countResult.rows[0]?.total || 0);

    // Parse description to extract payment details
    const withdrawals = result.rows.map((row) => {
      let paymentDetails = {};
      try {
        // Extract JSON from description if present
        const jsonMatch = row.description?.match(/\{.*\}/);
        if (jsonMatch) {
          paymentDetails = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: parse description text
          const methodMatch = row.description?.match(/Withdrawal to (.+?)(?: -|$)/);
          if (methodMatch) {
            paymentDetails.method = methodMatch[1];
          }
          const mobileMatch = row.description?.match(/Mobile: (\d+)/);
          if (mobileMatch) {
            paymentDetails.phone_number = mobileMatch[1];
          }
          const accountMatch = row.description?.match(/Account: (.+?)(?: -|$)/);
          if (accountMatch) {
            paymentDetails.account_number = accountMatch[1];
          }
        }
      } catch (e) {
        // If parsing fails, use description as is
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}
