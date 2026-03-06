// ============================================================
// /api/recharges/[id]
// PUT - Approve or reject recharge request (with reason/note)
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
    const rechargeId = parseInt(params.id, 10);
    const body = await request.json();
    const { action, reason } = body; // action: "approve" or "reject", reason: string

    if (!rechargeId || Number.isNaN(rechargeId)) {
      return NextResponse.json(
        { error: "Invalid recharge ID" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get recharge transaction
    const rechargeResult = await query(
      `SELECT wt.*, w.id as wallet_id, w.balance
       FROM wallet_transactions wt
       JOIN wallets w ON wt.wallet_id = w.id
       WHERE wt.id = $1 AND wt.type = 'deposit'`,
      [rechargeId]
    );

    if (rechargeResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Recharge request not found" },
        { status: 404 }
      );
    }

    const recharge = rechargeResult.rows[0];

    if (recharge.status !== "pending") {
      return NextResponse.json(
        { error: `Recharge is already ${recharge.status}` },
        { status: 400 }
      );
    }

    const adminNote = reason || (action === "approve" ? "Approved" : "Rejected");

    if (action === "approve") {
      // Approve: Add balance to wallet
      const amount = Math.round(parseFloat(recharge.amount || 0));

      // Update wallet: add balance
      await query(
        `UPDATE wallets
         SET balance = balance + $1,
             total_deposited = total_deposited + $1,
             updated_at = NOW()
         WHERE id = $2`,
        [amount, recharge.wallet_id]
      );

      // Get updated wallet balance
      const updatedWallet = await query(
        "SELECT balance FROM wallets WHERE id = $1",
        [recharge.wallet_id]
      );
      const newBalance = Math.round(parseFloat(updatedWallet.rows[0].balance || 0));

      // Update transaction status to completed with admin note
      await query(
        `UPDATE wallet_transactions
         SET status = 'completed',
             balance_after = $1,
             admin_id = $2,
             admin_note = $3,
             processed_at = NOW()
         WHERE id = $4`,
        [newBalance, admin.id, adminNote, rechargeId]
      );

      return NextResponse.json({
        message: "Recharge approved and balance added",
        status: "completed",
      });
    } else {
      // Reject: Don't add balance, just mark as cancelled with reason
      await query(
        `UPDATE wallet_transactions
         SET status = 'cancelled',
             admin_id = $1,
             admin_note = $2,
             processed_at = NOW()
         WHERE id = $3`,
        [admin.id, adminNote, rechargeId]
      );

      return NextResponse.json({
        message: "Recharge rejected",
        status: "cancelled",
      });
    }
  } catch (error) {
    console.error("Update recharge error:", error);
    return NextResponse.json(
      { error: "Failed to process recharge" },
      { status: 500 }
    );
  }
}
