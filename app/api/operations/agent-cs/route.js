// ============================================================
// /api/operations/agent-cs
// GET  - List all agent customer service configurations
// POST - Create a new agent customer service
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET: List all agent customer services
export async function GET(request) {
  try {
    const result = await query("SELECT * FROM agent_customer_service ORDER BY id DESC");
    return NextResponse.json({ agents: result.rows });
  } catch (error) {
    console.error("Get agent CS error:", error);
    // If table doesn't exist yet, return empty array
    if (error.message.includes("does not exist")) {
      return NextResponse.json({ agents: [] });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a new agent customer service
export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { proxy_account, customer_service_name, customer_service_link, status } = await request.json();

    if (!proxy_account || !customer_service_name || !customer_service_link) {
      return NextResponse.json(
        { error: "Proxy account, customer service name, and link are required" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO agent_customer_service (proxy_account, customer_service_name, customer_service_link, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [proxy_account, customer_service_name, customer_service_link, status || "active"]
    );

    return NextResponse.json({ message: "Agent created", agent: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create agent CS error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
