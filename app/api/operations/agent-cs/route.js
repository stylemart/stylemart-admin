// ============================================================
// /api/operations/agent-cs
// GET  - List support links (filtered by admin role)
// POST - Create a new support link (linked to Sub Admin)
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET: List support links
// Super Admin sees ALL links
// Sub Admin sees ONLY their own links
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
    let result;

    if (admin.role === "super_admin") {
      // Super Admin sees all links
      result = await query(
        `SELECT acs.*, a.username as owner_username, a.full_name as owner_name
         FROM agent_customer_service acs
         LEFT JOIN admin_users a ON acs.admin_owner_id = a.id
         ORDER BY acs.id DESC`
      );
    } else {
      // Sub Admin only sees their own links
      result = await query(
        `SELECT * FROM agent_customer_service 
         WHERE admin_owner_id = $1 
         ORDER BY id DESC`,
        [admin.id]
      );
    }

    return NextResponse.json({ agents: result.rows });
  } catch (error) {
    console.error("Get support links error:", error);
    if (error.message && error.message.includes("does not exist")) {
      return NextResponse.json({ agents: [] });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a new support link
// Sub Admin links are automatically linked to their ID
export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const admin = authResult.admin;
    const { customer_service_name, customer_service_link, status } = await request.json();

    if (!customer_service_name || !customer_service_link) {
      return NextResponse.json(
        { error: "Department name and link are required" },
        { status: 400 }
      );
    }

    // Sub Admin links are automatically linked to them
    // Super Admin can create global links (admin_owner_id = NULL)
    const adminOwnerId = admin.role === "sub_admin" ? admin.id : null;

    const result = await query(
      `INSERT INTO agent_customer_service (customer_service_name, customer_service_link, status, admin_owner_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer_service_name, customer_service_link, status || "active", adminOwnerId]
    );

    return NextResponse.json(
      { message: "Support link created", agent: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create support link error:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}
