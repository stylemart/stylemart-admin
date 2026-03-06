// ============================================================
// /api/categories/[id]
// PUT    - Update a category
// DELETE - Delete a category
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// PUT: Update a category
export async function PUT(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const { name, name_pt, name_en, name_zh, icon_url, image_url, parent_id, sort_order, is_active } = await request.json();

    const result = await query(
      `UPDATE categories SET
        name = COALESCE($1, name), name_pt = $2, name_en = $3, name_zh = $4,
        icon_url = $5, image_url = $6, parent_id = $7, sort_order = COALESCE($8, sort_order),
        is_active = COALESCE($9, is_active), updated_at = NOW()
      WHERE id = $10 RETURNING *`,
      [name, name_pt, name_en, name_zh, icon_url, image_url, parent_id, sort_order, is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category updated", category: result.rows[0] });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Delete a category
export async function DELETE(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const result = await query("DELETE FROM categories WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
