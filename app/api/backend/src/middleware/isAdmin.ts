import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import type { AuthenticatedRequest } from "../types";

/**
 * Middleware to check if the authenticated user has an 'admin' role.
 */
export async function isAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.replace(/^Bearer\s+/, "");
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: userRole, error: roleErr } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .single();

    if (roleErr || !userRole) {
      return res.status(403).json({ error: "Unauthorized - No role" });
    }

    const { data: roleType, error: typeErr } = await supabase
      .from("role_types")
      .select("name")
      .eq("id", userRole.role_id)
      .single();

    if (typeErr || !roleType || roleType.name !== "admin") {
      return res.status(403).json({ error: "Unauthorized - Not admin" });
    }

    // Attach user info to request for downstream use
    req.user = {
      id: user.id,
      email: user.email ?? "",
      role: roleType.name,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
