// ============================================================
// /api/users/[id]/balance
// POST - Adjust user wallet balance (Up and Down)
// Creates wallet_transactions and updates wallets table
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const admin = authResult.admin;
    const userId = parseInt(params.id, 10);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, amount } = body; // type: 'add' | 'deduct' | 'set'

    const value = Math.round(parseFloat(amount)); // Round to whole number
    
    // Allow 0 only for 'set' operation
    if (type === "set") {
      if (value < 0 || isNaN(value)) {
        return NextResponse.json(
          { error: "Amount must be 0 or greater" },
          { status: 400 }
        );
      }
    } else {
      if (!value || value <= 0) {
        return NextResponse.json(
          { error: "Amount must be greater than 0" },
          { status: 400 }
        );
      }
    }

    if (type !== "add" && type !== "deduct" && type !== "set") {
      return NextResponse.json(
        { error: "Invalid operation type. Use 'add', 'deduct', or 'set'" },
        { status: 400 }
      );
    }

    // Make sure wallet exists
    let walletResult = await query(
      "SELECT * FROM wallets WHERE user_id = $1",
      [userId]
    );

    if (walletResult.rows.length === 0) {
      walletResult = await query(
        `INSERT INTO wallets (user_id, balance, frozen_balance, total_deposited, total_withdrawn, total_spent, currency)
         VALUES ($1, 0, 0, 0, 0, 0, 'BRL')
         RETURNING *`,
        [userId]
      );
    }

    const wallet = walletResult.rows[0];
    const currentBalance = Math.round(parseFloat(wallet.balance || 0)); // Round to whole number
    
    // Calculate new balance based on operation type
    let newBalance;
    if (type === "set") {
      newBalance = value; // Set to exact value
    } else {
      const delta = type === "add" ? value : -value;
      newBalance = Math.round(currentBalance + delta); // Round final balance
    }

    if (newBalance < 0) {
      return NextResponse.json(
        { error: "Insufficient balance to deduct this amount" },
        { status: 400 }
      );
    }

    // Insert wallet transaction
    const transactionType = type === "add" ? "deposit" : type === "deduct" ? "withdraw" : "adjustment";
    const transactionDescription = 
      type === "add" ? "Manual deposit by admin" : 
      type === "deduct" ? "Manual deduction by admin" : 
      "Balance set by admin";
    
    await query(
      `INSERT INTO wallet_transactions (
        wallet_id,
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        status,
        reference_id,
        description,
        admin_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        'completed',
        $7,
        $8,
        $9
      )`,
      [
        wallet.id,
        userId,
        transactionType,
        type === "set" ? Math.abs(newBalance - currentBalance) : value,
        currentBalance,
        newBalance,
        null,
        transactionDescription,
        admin.id,
      ]
    );

    // Update wallet aggregates
    let updateSql;
    if (type === "set") {
      // For "set", directly set the balance
      updateSql = `UPDATE wallets
                    SET balance = $2,
                        updated_at = NOW()
                    WHERE id = $1
                    RETURNING *`;
    } else if (type === "add") {
      updateSql = `UPDATE wallets
                   SET balance = balance + $2,
                       total_deposited = total_deposited + $2,
                       updated_at = NOW()
                   WHERE id = $1
                   RETURNING *`;
    } else {
      updateSql = `UPDATE wallets
                   SET balance = balance - $2,
                       total_withdrawn = total_withdrawn + $2,
                       updated_at = NOW()
                   WHERE id = $1
                   RETURNING *`;
    }

    const updatedWalletResult = await query(updateSql, [wallet.id, type === "set" ? newBalance : value]);
    const updatedWallet = updatedWalletResult.rows[0];

    return NextResponse.json({
      message: "Balance updated",
      balance: Math.round(parseFloat(updatedWallet.balance || 0)), // Round to whole number
    });
  } catch (error) {
    console.error("Adjust user balance error:", error);
    return NextResponse.json(
      { error: "Failed to update balance" },
      { status: 500 }
    );
  }
}

