// ============================================================
// /api/operations/agent-cs/[id]
// PUT    - Update a support link (Sub Admin can only update their own)
// DELETE - Delete a support link (Sub Admin can only delete their own)
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// PUT: Update support link
export async function PUT(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const admin = authResult.admin;
    const { id } = params;
    const { customer_service_name, customer_service_link, status } = await request.json();

    // Check if link exists and belongs to this Sub Admin (if Sub Admin)
    const checkResult = await query(
      "SELECT admin_owner_id FROM agent_customer_service WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Support link not found" }, { status: 404 });
    }

    const link = checkResult.rows[0];

    // Sub Admin can only edit their own links
    if (admin.role === "sub_admin" && link.admin_owner_id !== admin.id) {
      return NextResponse.json(
        { error: "You can only edit your own support links" },
        { status: 403 }
      );
    }

    // Update the link
    const result = await query(
      `UPDATE agent_customer_service 
       SET customer_service_name = $1, 
           customer_service_link = $2, 
           status = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [customer_service_name, customer_service_link, status || "active", id]
    );

    return NextResponse.json({ message: "Support link updated", agent: result.rows[0] });
  } catch (error) {
    console.error("Update support link error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Delete support link
export async function DELETE(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const admin = authResult.admin;
    const { id } = params;

    // Check if link exists and belongs to this Sub Admin (if Sub Admin)
    const checkResult = await query(
      "SELECT admin_owner_id FROM agent_customer_service WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Support link not found" }, { status: 404 });
    }

    const link = checkResult.rows[0];

    // Sub Admin can only delete their own links
    if (admin.role === "sub_admin" && link.admin_owner_id !== admin.id) {
      return NextResponse.json(
        { error: "You can only delete your own support links" },
        { status: 403 }
      );
    }

    // Delete the link
    await query("DELETE FROM agent_customer_service WHERE id = $1", [id]);

    return NextResponse.json({ message: "Support link deleted" });
  } catch (error) {
    console.error("Delete support link error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
