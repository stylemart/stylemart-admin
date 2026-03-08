// ============================================================
// /api/orders
// GET - List orders (filtered by admin role)
// Super Admin: sees ALL orders
// Sub Admin: sees ONLY orders from their users
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    // Sub Admin filter: only see orders from their users
    if (admin.role === "sub_admin") {
      params.push(admin.id);
      whereClause += ` AND u.admin_owner_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      whereClause += ` AND o.status = $${params.length}`;
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    params.push(limit, offset);
    const result = await query(
      `SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.nickname as customer_nickname
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return NextResponse.json({
      orders: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
