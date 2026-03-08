// ============================================================
// /api/invitation-codes
// GET  - List invitation codes (filtered by role)
// POST - Generate storefront invitation codes (for sub-admins)
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import crypto from "crypto";

function generateCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

// GET: list invitation codes
// Super Admin sees ALL codes
// Sub Admin sees only THEIR storefront code(s)
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

    let result;
    if (admin.role === "super_admin") {
      // Super admin sees all codes
      result = await query(
        `SELECT ic.id,
                ic.code,
                ic.type,
                ic.is_used,
                ic.use_count,
                ic.max_uses,
                ic.created_at,
                ic.used_at,
                ic.used_by_user_id,
                ic.owner_admin_id,
                u.nickname AS used_by_nickname,
                a.username AS owner_admin_name
         FROM invitation_codes ic
         LEFT JOIN users u ON ic.used_by_user_id = u.id
         LEFT JOIN admin_users a ON ic.owner_admin_id = a.id
         ORDER BY ic.created_at DESC
         LIMIT 200`
      );
    } else {
      // Sub admin only sees their storefront code
      result = await query(
        `SELECT ic.id,
                ic.code,
                ic.type,
                ic.is_used,
                ic.use_count,
                ic.max_uses,
                ic.created_at,
                ic.used_at,
                ic.owner_admin_id
         FROM invitation_codes ic
         WHERE ic.owner_admin_id = $1 AND ic.type = 'storefront'
         ORDER BY ic.created_at DESC
         LIMIT 200`,
        [admin.id]
      );
    }

    return NextResponse.json({ codes: result.rows });
  } catch (error) {
    console.error("Get invitation codes error:", error);
    if (error.message && error.message.includes("relation \"invitation_codes\" does not exist")) {
      return NextResponse.json({ codes: [] });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: generate new storefront invitation codes
// Only Super Admin can generate codes through this endpoint
// Sub Admin codes are generated through /api/sub-admins
export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Only super admin can generate codes directly
    if (authResult.admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only Super Admin can generate invitation codes" },
        { status: 403 }
      );
    }

    const adminId = authResult.admin.id;
    const body = await request.json().catch(() => ({}));
    const count = Math.min(Math.max(parseInt(body.count) || 1, 1), 100);

    const codes = [];

    for (let i = 0; i < count; i++) {
      let code = generateCode();
      while (true) {
        const existing = await query(
          "SELECT id FROM invitation_codes WHERE code = $1",
          [code]
        );
        if (existing.rows.length === 0) break;
        code = generateCode();
      }

      const result = await query(
        `INSERT INTO invitation_codes (code, type, is_used, max_uses, use_count, created_by_admin_id)
         VALUES ($1, 'storefront', FALSE, 1, 0, $2)
         RETURNING *`,
        [code, adminId]
      );
      codes.push(result.rows[0]);
    }

    return NextResponse.json(
      { message: "Invitation codes generated", codes },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create invitation codes error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
