// ============================================================
// /api/users/[id]/operate
// POST - Perform operate actions on a user
// Actions: edit_member, change_login_password, change_transaction_password,
//          modify_credit_score, account_ban, trading_prohibited,
//          withdrawals_prohibited, set_dummy
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import crypto from "crypto";

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "stylemart-salt")
    .digest("hex");
}

export async function POST(request, { params }) {
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

    // Check user exists
    const userCheck = await query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userCheck.rows[0];
    const body = await request.json();
    const { action } = body;

    switch (action) {
      // ── Edit Member ──
      case "edit_member": {
        const { nickname, full_name, email, phone } = body;
        await query(
          `UPDATE users SET
            nickname = COALESCE($1, nickname),
            full_name = COALESCE($2, full_name),
            email = $3,
            phone = $4,
            updated_at = NOW()
          WHERE id = $5`,
          [nickname || null, full_name || null, email || null, phone || null, userId]
        );
        return NextResponse.json({ message: "Member updated successfully" });
      }

      // ── Change Login Password ──
      case "change_login_password": {
        const { new_password } = body;
        if (!new_password || new_password.length < 6) {
          return NextResponse.json(
            { error: "Password must be at least 6 characters" },
            { status: 400 }
          );
        }
        const hash = hashPassword(new_password);
        await query(
          "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
          [hash, userId]
        );
        return NextResponse.json({ message: "Login password changed successfully" });
      }

      // ── Change Transaction Password ──
      case "change_transaction_password": {
        const { new_transaction_password } = body;
        if (!new_transaction_password || new_transaction_password.length < 6) {
          return NextResponse.json(
            { error: "Transaction password must be at least 6 characters" },
            { status: 400 }
          );
        }
        const txHash = hashPassword(new_transaction_password);
        await query(
          "UPDATE users SET payment_password_hash = $1, updated_at = NOW() WHERE id = $2",
          [txHash, userId]
        );
        return NextResponse.json({
          message: "Transaction password changed successfully",
        });
      }

      // ── Modify Credit Score ──
      case "modify_credit_score": {
        const { credit_score } = body;
        const score = parseInt(credit_score, 10);
        if (isNaN(score) || score < 0 || score > 100) {
          return NextResponse.json(
            { error: "Credit score must be between 0 and 100" },
            { status: 400 }
          );
        }
        await query(
          "UPDATE users SET credit_score = $1, updated_at = NOW() WHERE id = $2",
          [score, userId]
        );
        return NextResponse.json({ message: "Credit score updated", credit_score: score });
      }

      // ── Modify Withdrawal Account ──
      case "modify_withdrawal_account": {
        const { withdrawal_method, withdrawal_account, withdrawal_holder, withdrawal_iban } = body;
        await query(
          `UPDATE users SET
            withdrawal_method = $1,
            withdrawal_account = $2,
            withdrawal_holder = $3,
            withdrawal_iban = $4,
            updated_at = NOW()
          WHERE id = $5`,
          [
            withdrawal_method || null,
            withdrawal_account || null,
            withdrawal_holder || null,
            withdrawal_iban || null,
            userId,
          ]
        );
        return NextResponse.json({ message: "Withdrawal account updated" });
      }

      // ── Account Ban / Enable ──
      case "account_ban": {
        const newStatus = !user.is_active;
        await query(
          "UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2",
          [newStatus, userId]
        );
        return NextResponse.json({
          message: newStatus ? "Account enabled" : "Account banned",
          is_active: newStatus,
        });
      }

      // ── Trading Prohibited / Enable ──
      case "trading_prohibited": {
        const currentStatus = user.trading_enabled !== false;
        await query(
          "UPDATE users SET trading_enabled = $1, updated_at = NOW() WHERE id = $2",
          [!currentStatus, userId]
        );
        return NextResponse.json({
          message: !currentStatus ? "Trading enabled" : "Trading prohibited",
          trading_enabled: !currentStatus,
        });
      }

      // ── Withdrawals Prohibited / Enable ──
      case "withdrawals_prohibited": {
        const currentWithdrawalStatus = user.withdrawal_enabled !== false;
        await query(
          "UPDATE users SET withdrawal_enabled = $1, updated_at = NOW() WHERE id = $2",
          [!currentWithdrawalStatus, userId]
        );
        return NextResponse.json({
          message: !currentWithdrawalStatus
            ? "Withdrawals enabled"
            : "Withdrawals prohibited",
          withdrawal_enabled: !currentWithdrawalStatus,
        });
      }

      // ── Set as Dummy / Real ──
      case "set_dummy": {
        const currentDummy = user.is_dummy === true;
        await query(
          "UPDATE users SET is_dummy = $1, updated_at = NOW() WHERE id = $2",
          [!currentDummy, userId]
        );
        return NextResponse.json({
          message: !currentDummy ? "Set as dummy" : "Set as real",
          is_dummy: !currentDummy,
        });
      }

      // ── Refresh IP Attribution ──
      case "refresh_ip": {
        // Just update the last IP check timestamp
        await query(
          "UPDATE users SET updated_at = NOW() WHERE id = $1",
          [userId]
        );
        return NextResponse.json({ message: "IP attribution refreshed" });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Operate action error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
