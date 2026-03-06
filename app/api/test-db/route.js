// ============================================================
// GET /api/test-db
// Test database connection
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Simple test query
    const result = await query("SELECT NOW() as current_time, version() as pg_version");
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      data: result.rows[0],
      env: {
        host: process.env.DB_HOST || "NOT SET",
        port: process.env.DB_PORT || "NOT SET",
        database: process.env.DB_NAME || "NOT SET",
        user: process.env.DB_USER || "NOT SET",
        password: process.env.DB_PASSWORD ? "SET" : "NOT SET",
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      env: {
        host: process.env.DB_HOST || "NOT SET",
        port: process.env.DB_PORT || "NOT SET",
        database: process.env.DB_NAME || "NOT SET",
        user: process.env.DB_USER || "NOT SET",
        password: process.env.DB_PASSWORD ? "SET" : "NOT SET",
      },
    }, { status: 500 });
  }
}
