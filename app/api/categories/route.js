// ============================================================
// /api/categories
// GET  - List all categories
// POST - Create a new category
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET: List all categories
export async function GET() {
  try {
    const result = await query(
      "SELECT * FROM categories ORDER BY sort_order ASC, name ASC"
    );
    return NextResponse.json({ categories: result.rows });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a new category
export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { name, name_pt, name_en, name_zh, icon_url, image_url, parent_id, sort_order, is_active } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO categories (name, name_pt, name_en, name_zh, icon_url, image_url, parent_id, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, name_pt || null, name_en || null, name_zh || null, icon_url || null, image_url || null, parent_id || null, sort_order || 0, is_active !== false]
    );

    return NextResponse.json({ message: "Category created", category: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
