// ============================================================
// /api/operations/agent-cs/[id]
// PUT    - Update an agent customer service
// DELETE - Delete an agent customer service
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// PUT: Update an agent customer service
export async function PUT(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const { proxy_account, customer_service_name, customer_service_link, status } = await request.json();

    const result = await query(
      `UPDATE agent_customer_service SET
        proxy_account = COALESCE($1, proxy_account),
        customer_service_name = COALESCE($2, customer_service_name),
        customer_service_link = COALESCE($3, customer_service_link),
        status = COALESCE($4, status),
        updated_at = NOW()
      WHERE id = $5 RETURNING *`,
      [proxy_account, customer_service_name, customer_service_link, status, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Agent updated", agent: result.rows[0] });
  } catch (error) {
    console.error("Update agent CS error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Delete an agent customer service
export async function DELETE(request, { params }) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    
    const result = await query("DELETE FROM agent_customer_service WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Agent deleted" });
  } catch (error) {
    console.error("Delete agent CS error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
