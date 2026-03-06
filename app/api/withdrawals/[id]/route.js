// ============================================================
// /api/withdrawals/[id]
// PUT - Approve or reject withdrawal request (with reason/note)
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const admin = authResult.admin;
    const withdrawalId = parseInt(params.id, 10);
    const body = await request.json();
    const { action, reason } = body; // action: "approve" or "reject", reason: string

    if (!withdrawalId || Number.isNaN(withdrawalId)) {
      return NextResponse.json(
        { error: "Invalid withdrawal ID" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get withdrawal transaction
    const withdrawalResult = await query(
      `SELECT wt.*, w.id as wallet_id
       FROM wallet_transactions wt
       JOIN wallets w ON wt.wallet_id = w.id
       WHERE wt.id = $1 AND wt.type = 'withdraw'`,
      [withdrawalId]
    );

    if (withdrawalResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    const withdrawal = withdrawalResult.rows[0];

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { error: `Withdrawal is already ${withdrawal.status}` },
        { status: 400 }
      );
    }

    const adminNote = reason || (action === "approve" ? "Approved" : "Rejected");

    if (action === "approve") {
      // Update transaction status to completed with admin note
      await query(
        `UPDATE wallet_transactions
         SET status = 'completed',
             admin_id = $1,
             admin_note = $2,
             processed_at = NOW()
         WHERE id = $3`,
        [admin.id, adminNote, withdrawalId]
      );

      // Balance is already frozen, mark as completed
      return NextResponse.json({
        message: "Withdrawal approved",
        status: "completed",
      });
    } else {
      // Reject: refund the frozen balance back to available balance
      const amount = Math.round(parseFloat(withdrawal.amount || 0));

      // Update wallet: move from frozen_balance back to balance
      await query(
        `UPDATE wallets
         SET balance = balance + $1,
             frozen_balance = frozen_balance - $1,
             total_withdrawn = total_withdrawn - $1,
             updated_at = NOW()
         WHERE id = $2`,
        [amount, withdrawal.wallet_id]
      );

      // Update transaction status to cancelled with admin note
      await query(
        `UPDATE wallet_transactions
         SET status = 'cancelled',
             admin_id = $1,
             admin_note = $2,
             processed_at = NOW()
         WHERE id = $3`,
        [admin.id, adminNote, withdrawalId]
      );

      return NextResponse.json({
        message: "Withdrawal rejected and balance refunded",
        status: "cancelled",
      });
    }
  } catch (error) {
    console.error("Update withdrawal error:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}
