// ============================================================
// DEBUG: Check orders and user linking for Sub Admin
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

    // Get all orders with user info
    const allOrders = await query(
      `SELECT 
        o.id as order_id,
        o.order_number,
        o.user_id,
        o.total_amount,
        o.status,
        o.created_at,
        u.id as user_id,
        u.nickname,
        u.admin_owner_id,
        u.invitation_code_id
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 50`
    );

    // Get all users for this Sub Admin
    let usersQuery;
    if (admin.role === "sub_admin") {
      const adminId = parseInt(admin.id);
      usersQuery = await query(
        `SELECT id, nickname, admin_owner_id, invitation_code_id, created_at
         FROM users
         WHERE admin_owner_id = $1
         ORDER BY created_at DESC`,
        [adminId]
      );
    } else {
      usersQuery = await query(
        `SELECT id, nickname, admin_owner_id, invitation_code_id, created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 50`
      );
    }

    // Get orders for this Sub Admin's users
    let subAdminOrders = [];
    if (admin.role === "sub_admin") {
      const adminId = parseInt(admin.id);
      subAdminOrders = await query(
        `SELECT 
          o.id as order_id,
          o.order_number,
          o.user_id,
          o.total_amount,
          o.status,
          o.created_at,
          u.nickname,
          u.admin_owner_id
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE u.admin_owner_id = $1
        ORDER BY o.created_at DESC`,
        [adminId]
      );
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        role: admin.role,
        admin_id_type: typeof admin.id,
        admin_id_parsed: parseInt(admin.id),
      },
      all_orders_count: allOrders.rows.length,
      all_orders: allOrders.rows,
      sub_admin_users_count: usersQuery.rows.length,
      sub_admin_users: usersQuery.rows,
      sub_admin_orders_count: subAdminOrders.rows.length,
      sub_admin_orders: subAdminOrders.rows,
    });
  } catch (error) {
    console.error("Debug orders check error:", error);
    return NextResponse.json(
      { error: "Debug check failed", details: error.message },
      { status: 500 }
    );
  }
}
