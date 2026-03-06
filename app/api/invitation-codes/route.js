// ============================================================
// /api/invitation-codes
// GET  - List admin-generated invitation codes
// POST - Generate new invitation codes
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import crypto from "crypto";

function generateCode() {
  // 6-character upper-case code, e.g. 'A3F2C1'
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

// GET: list latest invitation codes
export async function GET() {
  try {
    const result = await query(
      `SELECT ic.id,
              ic.code,
              ic.is_used,
              ic.created_at,
              ic.used_at,
              ic.used_by_user_id,
              u.nickname AS used_by_nickname
       FROM invitation_codes ic
       LEFT JOIN users u ON ic.used_by_user_id = u.id
       ORDER BY ic.created_at DESC
       LIMIT 200`
    );
    return NextResponse.json({ codes: result.rows });
  } catch (error) {
    console.error("Get invitation codes error:", error);
    // If table does not exist yet, return empty list
    if (error.message.includes("relation \"invitation_codes\" does not exist")) {
      return NextResponse.json({ codes: [] });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: generate new invitation codes
export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const adminId = authResult.admin.id;
    const body = await request.json().catch(() => ({}));
    const count = Math.min(Math.max(parseInt(body.count) || 1, 1), 100); // 1-100

    const codes = [];

    for (let i = 0; i < count; i++) {
      let code = generateCode();
      // ensure unique
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const existing = await query(
          "SELECT id FROM invitation_codes WHERE code = $1",
          [code]
        );
        if (existing.rows.length === 0) break;
        code = generateCode();
      }

      const result = await query(
        `INSERT INTO invitation_codes (code, created_by_admin_id)
         VALUES ($1, $2)
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

