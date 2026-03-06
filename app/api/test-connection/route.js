// ============================================================
// GET /api/test-connection
// Test database connection with detailed diagnostics
// ============================================================

import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  const diagnostics = {
    envLoaded: {},
    connectionTest: null,
    suggestions: [],
  };

  // Check environment variables
  diagnostics.envLoaded = {
    DATABASE_URL: process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING",
    DB_HOST: process.env.DB_HOST || "NOT SET",
    DB_PORT: process.env.DB_PORT || "NOT SET",
    DB_PASSWORD: process.env.DB_PASSWORD ? "✅ SET" : "❌ MISSING",
  };

  // Try to parse DATABASE_URL if it exists
  let connectionConfig = null;
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      connectionConfig = {
        host: url.hostname,
        port: url.port || 5432,
        database: url.pathname.replace("/", "") || "postgres",
        user: url.username,
        password: url.password,
        protocol: url.protocol,
      };
      diagnostics.parsedUrl = {
        host: connectionConfig.host,
        port: connectionConfig.port,
        database: connectionConfig.database,
        user: connectionConfig.user,
        passwordLength: connectionConfig.password?.length || 0,
      };
    } catch (error) {
      diagnostics.urlParseError = error.message;
    }
  }

  // Try to connect
  if (process.env.DATABASE_URL) {
    try {
      const testPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });

      const result = await testPool.query("SELECT NOW() as current_time, version() as pg_version");
      await testPool.end();

      diagnostics.connectionTest = {
        status: "✅ SUCCESS",
        message: "Database connection successful!",
        data: {
          currentTime: result.rows[0].current_time,
          pgVersion: result.rows[0].pg_version.substring(0, 50),
        },
      };
    } catch (error) {
      diagnostics.connectionTest = {
        status: "❌ FAILED",
        error: error.message,
        code: error.code,
        details: {},
      };

      if (error.code === "ENOTFOUND") {
        diagnostics.connectionTest.details = {
          issue: "DNS resolution failed - hostname cannot be found",
          hostname: connectionConfig?.host || "unknown",
          suggestion: "Check if the hostname is correct in Supabase dashboard",
        };
        diagnostics.suggestions.push("1. Go to Supabase → Settings → Database");
        diagnostics.suggestions.push("2. Click 'Connect' button");
        diagnostics.suggestions.push("3. Select 'Connection Pooler' (not Primary Database)");
        diagnostics.suggestions.push("4. Copy the connection string and update .env.local");
      } else if (error.code === "ECONNREFUSED") {
        diagnostics.connectionTest.details = {
          issue: "Connection refused",
          suggestion: "Check if port is correct (should be 6543 for Connection Pooler)",
        };
      } else if (error.code === "28P01") {
        diagnostics.connectionTest.details = {
          issue: "Authentication failed",
          suggestion: "Check your database password in .env.local",
        };
      }
    }
  } else {
    diagnostics.connectionTest = {
      status: "❌ SKIPPED",
      message: "DATABASE_URL not set in .env.local",
    };
    diagnostics.suggestions.push("Add DATABASE_URL to your .env.local file");
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
