// ============================================================
// POST /api/auth/login
// Admin login endpoint (Super Admin + Sub Admin)
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find admin user by username
    const result = await query(
      "SELECT * FROM admin_users WHERE username = $1 AND is_active = TRUE",
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const admin = result.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Update last login time
    await query(
      "UPDATE admin_users SET last_login_at = NOW() WHERE id = $1",
      [admin.id]
    );

    // Create JWT token (includes role + parent_admin_id)
    const token = createToken(admin);

    // Return admin info + token
    return NextResponse.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role,
        avatar_url: admin.avatar_url,
        parent_admin_id: admin.parent_admin_id,
        storefront_code: admin.storefront_code,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}
