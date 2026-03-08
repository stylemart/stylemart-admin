// ============================================================
// POST /api/auth/register-sub-admin
// Register as a Sub Admin using an admin invitation code
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { admin_code, username, password, full_name } = await request.json();

    // Validate input
    if (!admin_code || !username || !password) {
      return NextResponse.json(
        { error: "Admin code, username, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingAdmin = await query(
      "SELECT id FROM admin_users WHERE username = $1",
      [username]
    );
    if (existingAdmin.rows.length > 0) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Validate admin invitation code
    const codeResult = await query(
      `SELECT ic.*, ic2.code as storefront_code, ic2.id as storefront_code_id
       FROM invitation_codes ic
       LEFT JOIN invitation_codes ic2 ON ic.paired_code_id = ic2.id
       WHERE ic.code = $1 AND ic.type = 'admin_panel'`,
      [admin_code.toUpperCase()]
    );

    if (codeResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid admin invitation code" },
        { status: 400 }
      );
    }

    const adminCode = codeResult.rows[0];

    if (adminCode.is_used) {
      return NextResponse.json(
        { error: "This admin code has already been used" },
        { status: 400 }
      );
    }

    // Find the super admin who created this code
    const superAdminId = adminCode.created_by_admin_id;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create sub admin user
    const adminResult = await query(
      `INSERT INTO admin_users (username, password_hash, full_name, role, parent_admin_id, storefront_code, is_active)
       VALUES ($1, $2, $3, 'sub_admin', $4, $5, TRUE)
       RETURNING id, username, full_name, role, parent_admin_id, storefront_code`,
      [username, passwordHash, full_name || username, superAdminId, adminCode.storefront_code]
    );

    const newAdmin = adminResult.rows[0];

    // Mark admin code as used
    await query(
      `UPDATE invitation_codes SET is_used = TRUE, used_at = NOW(), use_count = 1 WHERE id = $1`,
      [adminCode.id]
    );

    // Link the storefront code to this new sub admin
    if (adminCode.storefront_code_id) {
      await query(
        `UPDATE invitation_codes SET owner_admin_id = $1 WHERE id = $2`,
        [newAdmin.id, adminCode.storefront_code_id]
      );
    }

    // Create JWT token
    const token = createToken(newAdmin);

    return NextResponse.json({
      message: "Sub Admin registered successfully!",
      token,
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        full_name: newAdmin.full_name,
        role: newAdmin.role,
        parent_admin_id: newAdmin.parent_admin_id,
        storefront_code: newAdmin.storefront_code,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Register sub admin error:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
