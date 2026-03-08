// ============================================================
// /api/sub-admins/[id]
// PATCH  - Toggle sub-admin active/inactive
// DELETE - Remove a sub-admin
// ============================================================

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";

// PATCH: Toggle sub-admin status
export async function PATCH(request, { params }) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = params;
    const body = await request.json();

    if (typeof body.is_active !== "undefined") {
      await query(
        "UPDATE admin_users SET is_active = $1, updated_at = NOW() WHERE id = $2 AND role = 'sub_admin'",
        [body.is_active, id]
      );
    }

    return NextResponse.json({ message: "Sub Admin updated" });
  } catch (error) {
    console.error("Update sub-admin error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Remove a sub-admin
export async function DELETE(request, { params }) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = params;

    // Verify it's a sub_admin, not the super_admin
    const check = await query(
      "SELECT id, role FROM admin_users WHERE id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Sub Admin not found" }, { status: 404 });
    }

    if (check.rows[0].role === "super_admin") {
      return NextResponse.json({ error: "Cannot delete Super Admin" }, { status: 403 });
    }

    // Deactivate instead of hard delete (to preserve data integrity)
    await query(
      "UPDATE admin_users SET is_active = FALSE, updated_at = NOW() WHERE id = $1",
      [id]
    );

    return NextResponse.json({ message: "Sub Admin removed" });
  } catch (error) {
    console.error("Delete sub-admin error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
