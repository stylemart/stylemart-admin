// ============================================================
// POST /api/auth/setup
// Create the first Super Admin user (one-time setup)
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { username, password, full_name, email } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if any admin users already exist
    const existingAdmins = await query("SELECT COUNT(*) as count FROM admin_users");
    if (parseInt(existingAdmins.rows[0].count) > 0) {
      return NextResponse.json(
        { error: "Admin user already exists. Use login instead." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create super admin user
    const result = await query(
      `INSERT INTO admin_users (username, password_hash, full_name, email, role, parent_admin_id)
       VALUES ($1, $2, $3, $4, 'super_admin', NULL) RETURNING id, username, full_name, email, role`,
      [username, passwordHash, full_name || "Super Admin", email || null]
    );

    return NextResponse.json({
      message: "Super Admin created successfully! You can now login.",
      admin: result.rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: error.message || "Server error. Please try again." },
      { status: 500 }
    );
  }
}
