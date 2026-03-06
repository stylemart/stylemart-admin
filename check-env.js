// ============================================================
// ENVIRONMENT VARIABLES CHECKER
// Run this to verify your .env.local file is being read
// ============================================================

require("dotenv").config({ path: ".env.local" });

console.log("\n📋 Environment Variables Check:\n");

const required = [
  "DB_HOST",
  "DB_PORT", 
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_SECRET",
];

let allPresent = true;

required.forEach((key) => {
  const value = process.env[key];
  if (value) {
    if (key === "DB_PASSWORD" || key === "JWT_SECRET") {
      console.log(`✅ ${key}: ${"*".repeat(value.length)} (${value.length} chars)`);
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: MISSING`);
    allPresent = false;
  }
});

console.log("\n" + "=".repeat(50));

if (allPresent) {
  console.log("✅ All required environment variables are present!");
  console.log("\n💡 If you still get connection errors, check:");
  console.log("   1. DB_HOST is correct (no typos)");
  console.log("   2. DB_PASSWORD matches your Supabase database password");
  console.log("   3. Your internet connection is working");
} else {
  console.log("❌ Some environment variables are missing!");
  console.log("\n💡 Make sure:");
  console.log("   1. File is named: .env.local (with a dot)");
  console.log("   2. File is in: admin-panel/.env.local");
  console.log("   3. No spaces around the = signs");
}

console.log("\n");
