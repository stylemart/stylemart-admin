// ============================================================
// AUTHENTICATION HELPERS
// JWT token creation and verification
// ============================================================

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "stylemart-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Create a JWT token for an admin user
export function createToken(adminUser) {
  return jwt.sign(
    {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      parent_admin_id: adminUser.parent_admin_id || null,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify a JWT token and return the decoded data
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Extract token from request headers
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

// Middleware: Check if request has valid admin token
export async function requireAdmin(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { error: "No token provided", status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: "Invalid or expired token", status: 401 };
  }

  return { admin: decoded };
}

// Middleware: Require super_admin role specifically
export async function requireSuperAdmin(request) {
  const result = await requireAdmin(request);
  if (result.error) return result;

  if (result.admin.role !== "super_admin") {
    return { error: "Access denied. Super Admin only.", status: 403 };
  }

  return result;
}
