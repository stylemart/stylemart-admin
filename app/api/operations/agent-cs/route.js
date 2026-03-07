// ============================================================
// /api/operations/agent-cs
// GET  - List all support links
// POST - Create a new support link
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET: List all support links
export async function GET(request) {
  try {
    const result = await query("SELECT * FROM agent_customer_service ORDER BY id DESC");
    return NextResponse.json({ agents: result.rows });
  } catch (error) {
    console.error("Get support links error:", error);
    // If table doesn't exist yet, create it and return empty
    if (error.message.includes("does not exist")) {
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS agent_customer_service (
            id SERIAL PRIMARY KEY,
            proxy_account VARCHAR(200) DEFAULT '',
            customer_service_name VARCHAR(200) NOT NULL,
            customer_service_link TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
        return NextResponse.json({ agents: [] });
      } catch (createErr) {
        console.error("Create table error:", createErr);
        return NextResponse.json({ agents: [] });
      }
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a new support link
export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { proxy_account, customer_service_name, customer_service_link, status } = await request.json();

    if (!customer_service_name || !customer_service_link) {
      return NextResponse.json(
        { error: "Department name and link are required" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO agent_customer_service (proxy_account, customer_service_name, customer_service_link, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [proxy_account || customer_service_name, customer_service_name, customer_service_link, status || "active"]
    );

    return NextResponse.json({ message: "Support link created", agent: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create support link error:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}
