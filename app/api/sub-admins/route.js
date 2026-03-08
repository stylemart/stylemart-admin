// ============================================================
// /api/sub-admins
// GET  - List all sub-admins (Super Admin only)
// POST - Create a new sub-admin package (admin code + storefront code)
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import crypto from "crypto";

function generateCode(prefix = "") {
  const code = crypto.randomBytes(3).toString("hex").toUpperCase();
  return prefix ? `${prefix}-${code}` : code;
}

// GET: List all sub-admins with their codes and user counts
export async function GET(request) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const result = await query(
      `SELECT 
        a.id,
        a.username,
        a.full_name,
        a.email,
        a.role,
        a.is_active,
        a.storefront_code,
        a.last_login_at,
        a.created_at,
        (SELECT COUNT(*) FROM users u WHERE u.admin_owner_id = a.id) as user_count,
        (SELECT COALESCE(SUM(w.balance), 0) FROM users u2 JOIN wallets w ON u2.id = w.user_id WHERE u2.admin_owner_id = a.id) as total_user_balance,
        (SELECT COUNT(*) FROM orders o JOIN users u3 ON o.user_id = u3.id WHERE u3.admin_owner_id = a.id) as order_count
       FROM admin_users a
       WHERE a.role = 'sub_admin'
       ORDER BY a.created_at DESC`
    );

    // Also get pending (unclaimed) admin codes
    const pendingCodes = await query(
      `SELECT ic.id, ic.code, ic.created_at, 
              ic2.code as storefront_code
       FROM invitation_codes ic
       LEFT JOIN invitation_codes ic2 ON ic.paired_code_id = ic2.id
       WHERE ic.type = 'admin_panel' AND ic.is_used = FALSE
       ORDER BY ic.created_at DESC`
    );

    return NextResponse.json({
      sub_admins: result.rows,
      pending_codes: pendingCodes.rows,
    });
  } catch (error) {
    console.error("Get sub-admins error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a new sub-admin package (generates admin code + storefront code)
export async function POST(request) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const superAdminId = authResult.admin.id;

    // Generate unique admin code
    let adminCode = generateCode("ADM");
    while (true) {
      const existing = await query("SELECT id FROM invitation_codes WHERE code = $1", [adminCode]);
      if (existing.rows.length === 0) break;
      adminCode = generateCode("ADM");
    }

    // Generate unique storefront code
    let storefrontCode = generateCode("STR");
    while (true) {
      const existing = await query("SELECT id FROM invitation_codes WHERE code = $1", [storefrontCode]);
      if (existing.rows.length === 0) break;
      storefrontCode = generateCode("STR");
    }

    // Create storefront code first
    const sfResult = await query(
      `INSERT INTO invitation_codes (code, type, is_used, max_uses, use_count, created_by_admin_id)
       VALUES ($1, 'storefront', FALSE, NULL, 0, $2)
       RETURNING id, code`,
      [storefrontCode, superAdminId]
    );
    const storefrontCodeId = sfResult.rows[0].id;

    // Create admin code linked to storefront code
    const admResult = await query(
      `INSERT INTO invitation_codes (code, type, is_used, max_uses, use_count, paired_code_id, created_by_admin_id)
       VALUES ($1, 'admin_panel', FALSE, 1, 0, $2, $3)
       RETURNING id, code`,
      [adminCode, storefrontCodeId, superAdminId]
    );

    // Link storefront code back to admin code
    await query(
      `UPDATE invitation_codes SET paired_code_id = $1 WHERE id = $2`,
      [admResult.rows[0].id, storefrontCodeId]
    );

    return NextResponse.json({
      message: "Sub Admin codes generated successfully",
      admin_code: adminCode,
      storefront_code: storefrontCode,
    }, { status: 201 });
  } catch (error) {
    console.error("Create sub-admin codes error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
