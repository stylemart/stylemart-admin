// ============================================================
// /api/orders/[id]
// GET - Get single order with items
// PUT - Update order status
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET: Get order details + items
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const orderResult = await query(
      `SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const itemsResult = await query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [id]
    );

    return NextResponse.json({
      order: orderResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT: Update order status
export async function PUT(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const { status, tracking_number, admin_note } = await request.json();

    // Build dynamic update
    const updates = ["updated_at = NOW()"];
    const values = [];

    if (status) {
      values.push(status);
      updates.push(`status = $${values.length}`);
      // Set timestamp based on status
      if (status === "paid") updates.push("paid_at = NOW()");
      if (status === "shipped") updates.push("shipped_at = NOW()");
      if (status === "delivered") updates.push("delivered_at = NOW()");
      if (status === "cancelled") updates.push("cancelled_at = NOW()");
    }

    if (tracking_number !== undefined) {
      values.push(tracking_number);
      updates.push(`tracking_number = $${values.length}`);
    }

    if (admin_note !== undefined) {
      values.push(admin_note);
      updates.push(`admin_note = $${values.length}`);
    }

    values.push(id);
    const result = await query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order updated", order: result.rows[0] });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
