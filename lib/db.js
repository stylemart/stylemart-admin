// ============================================================
// DATABASE CONNECTION
// Connects to Supabase PostgreSQL
// ============================================================

import { Pool } from "pg";

// Get environment variables (Next.js should load .env.local automatically)
// Try connection string first, then fall back to individual config
let dbConfig;

if (process.env.DATABASE_URL) {
  // Use connection string if provided (recommended for Supabase)
  console.log("✅ Using DATABASE_URL connection string");
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
} else {
  // Use individual config (fallback)
  dbConfig = {
    host: (process.env.DB_HOST || "").trim(),
    port: parseInt(process.env.DB_PORT || "6543"), // Connection Pooler port
    database: (process.env.DB_NAME || "postgres").trim(),
    user: (process.env.DB_USER || "postgres").trim(),
    password: (process.env.DB_PASSWORD || "").trim(),
    ssl: { rejectUnauthorized: false },
  };
}

// Debug: Log all env vars (for troubleshooting)
console.log("\n🔍 Database Environment Check:");
if (process.env.DATABASE_URL) {
  console.log("  DATABASE_URL: ✅ SET (using connection string)");
  // Don't log the full URL for security
  const url = new URL(process.env.DATABASE_URL);
  console.log("  Host:", url.hostname);
  console.log("  Port:", url.port);
  console.log("  Database:", url.pathname.replace("/", ""));
} else {
  console.log("  DB_HOST:", dbConfig.host || "❌ MISSING");
  console.log("  DB_PORT:", dbConfig.port);
  console.log("  DB_NAME:", dbConfig.database);
  console.log("  DB_USER:", dbConfig.user);
  console.log("  DB_PASSWORD:", dbConfig.password ? "✅ SET" : "❌ MISSING");
  
  // Validate required fields
  if (!dbConfig.host || !dbConfig.password) {
    console.error("\n❌ CRITICAL: Missing database environment variables!");
    console.error("Please check your .env.local file in the admin-panel folder");
    console.error("File should be named: .env.local (with a dot at the start)");
    console.error("\n💡 TIP: You can also use DATABASE_URL instead of individual variables");
  }
}

// Create connection pool
let pool;

try {
  if (process.env.DATABASE_URL) {
    // Use connection string
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20000,
      idleTimeoutMillis: 30000,
      max: 10,
    });
  } else if (!dbConfig.host || !dbConfig.password) {
    console.error("⚠️  Cannot create database pool - missing credentials");
    pool = null;
  } else {
    // Use individual config
    pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 20000,
      idleTimeoutMillis: 30000,
      max: 10, // Maximum number of clients in the pool
    });
  }

  // Connection event handlers (only if pool was created)
  if (pool) {
    pool.on("connect", (client) => {
      console.log("✅ New database client connected");
    });

    pool.on("error", (err, client) => {
      console.error("❌ Database pool error:", err.message);
      console.error("Error code:", err.code);
    });

    // Test connection immediately
    pool.query("SELECT 1")
      .then(() => {
        console.log("✅ Database connection test successful!\n");
      })
      .catch((err) => {
        console.error("❌ Database connection test failed:", err.message);
        console.error("Error code:", err.code);
        if (err.code === "ENOTFOUND") {
          console.error("💡 DNS resolution failed. Check if DB_HOST is correct.");
        }
      });
  }
} catch (error) {
  console.error("❌ Failed to create database pool:", error.message);
  pool = null;
}

// Helper: Run a SQL query
export async function query(text, params) {
  if (!pool) {
    throw new Error("Database connection pool not initialized. Check .env.local file.");
  }

  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("📦 Query:", { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error("❌ Database query error:", error.message);
    console.error("Error code:", error.code);
    console.error("Query:", text.substring(0, 100));
    
    // Provide helpful error messages
    if (error.code === "ENOTFOUND") {
      const host = process.env.DATABASE_URL 
        ? new URL(process.env.DATABASE_URL).hostname 
        : (dbConfig.host || "unknown");
      throw new Error(`Cannot resolve database hostname: ${host}. Check your DATABASE_URL or DB_HOST in .env.local`);
    } else if (error.code === "ECONNREFUSED") {
      const host = process.env.DATABASE_URL 
        ? new URL(process.env.DATABASE_URL).hostname 
        : (dbConfig.host || "unknown");
      const port = process.env.DATABASE_URL 
        ? new URL(process.env.DATABASE_URL).port 
        : (dbConfig.port || "unknown");
      throw new Error(`Connection refused to ${host}:${port}. Check your database credentials.`);
    } else if (error.code === "28P01") {
      throw new Error("Authentication failed. Check your database password in .env.local");
    }
    
    throw error;
  }
}

export default pool;
