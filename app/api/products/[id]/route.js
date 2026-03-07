// ============================================================
// /api/products/[id]
// GET    - Get single product
// PUT    - Update a product
// DELETE - Delete a product
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET: Get single product by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(
      `SELECT p.*, c.name as category_name, b.name as brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: result.rows[0] });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT: Update a product
export async function PUT(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      price, original_price, cost_price, currency,
      stock, sku, category_id, brand_id, thumbnail_url,
      is_active, is_featured, is_group_buy, is_treasure_snatch,
    } = body;

    const result = await query(
      `UPDATE products SET
        name = COALESCE($1, name),
        name_pt = COALESCE($1, name_pt),
        name_en = COALESCE($1, name_en),
        name_zh = COALESCE($1, name_zh),
        description = COALESCE($2, description),
        description_pt = COALESCE($2, description_pt),
        description_en = COALESCE($2, description_en),
        description_zh = COALESCE($2, description_zh),
        price = COALESCE($3, price),
        original_price = $4, cost_price = $5, currency = COALESCE($6, currency),
        stock = COALESCE($7, stock),
        sku = $8, category_id = $9, brand_id = $10, thumbnail_url = $11,
        is_active = COALESCE($12, is_active),
        is_featured = COALESCE($13, is_featured),
        is_group_buy = COALESCE($14, is_group_buy),
        is_treasure_snatch = COALESCE($15, is_treasure_snatch),
        updated_at = NOW()
      WHERE id = $16
      RETURNING *`,
      [
        name, // Use same name for all language variants
        description, // Use same description for all language variants
        price, original_price, cost_price, currency,
        stock, sku, category_id, brand_id, thumbnail_url,
        is_active, is_featured, is_group_buy, is_treasure_snatch,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated", product: result.rows[0] });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Delete a product
export async function DELETE(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const result = await query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
