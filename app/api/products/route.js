// ============================================================
// /api/products
// GET  - List all products (with filters)
// POST - Create a new product
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET: List all products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category_id");
    const offset = (page - 1) * limit;

    // Build query with optional filters
    let whereClause = "WHERE 1=1";
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }

    if (categoryId) {
      params.push(categoryId);
      whereClause += ` AND p.category_id = $${params.length}`;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM products p ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get products with category and brand names
    params.push(limit, offset);
    const result = await query(
      `SELECT p.*, c.name as category_name, b.name as brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return NextResponse.json({
      products: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a new product
export async function POST(request) {
  try {
    // Check admin auth
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price, original_price, cost_price, currency,
      stock, sku, category_id, brand_id, thumbnail_url,
      is_active, is_featured, is_group_buy, is_treasure_snatch,
    } = body;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: "Product name and price are required" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO products (
        name, name_pt, name_en, name_zh,
        description, description_pt, description_en, description_zh,
        price, original_price, cost_price, currency,
        stock, sku, category_id, brand_id, thumbnail_url,
        is_active, is_featured, is_group_buy, is_treasure_snatch
      ) VALUES (
        $1, $1, $1, $1,
        $2, $2, $2, $2,
        $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15
      ) RETURNING *`,
      [
        name, // Use same name for all language variants
        description || null, // Use same description for all language variants
        price, original_price || null, cost_price || null, currency || "BRL",
        stock || 0, sku || null, category_id || null, brand_id || null, thumbnail_url || null,
        is_active !== false, is_featured || false, is_group_buy || false, is_treasure_snatch || false,
      ]
    );

    return NextResponse.json(
      { message: "Product created", product: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
